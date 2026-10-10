import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";
import { VEHICLES_DATA } from "@/data/vehicles";
import { buildChatFallback } from "@/lib/chatFallback";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GROQ_MODELS = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"] as const;

/** Compact catalog — full JSON was ~5k tokens/request and exhausted Groq free tier quickly. */
function buildSystemPrompt(): string {
  const lines = VEHICLES_DATA.map(
    (v) =>
      `${v.id}: ${v.name} | ${v.category} | ${v.priceFrom} MAD | ${v.specs.power}ch | ${v.specs.seats}pl | hyb=${v.isHybrid ? "oui" : "non"} | /configurator/${v.id}`
  );

  return `Tu es Toyota AI Advisor (Maroc). Français par défaut. Catalogue (13 modèles, source de vérité):
${lines.join("\n")}

COMPARAISON (2+ modèles): prose courte puis ligne JSON:
{"compare":{"ids":["rav4","highlander"],"scenario":"family","summary":"..."}}

RECOMMANDATION: termine par:
{"recommendation":"id","configuratorUrl":"/configurator/id","detailUrl":"/vehicles/id","acheterUrl":"/acheter?vehicle=id"}

Max 90 mots, 1 question, pas de specs inventées.`;
}

function getLastUserMessage(messages: { role: string; content: string }[]): string {
  return [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
}

function fallbackResponse(userMessage: string, reason: string) {
  const reply = buildChatFallback(userMessage);
  return new Response(reply, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-store",
      "X-Chat-Source": "catalog-fallback",
      "X-Chat-Fallback-Reason": reason,
    },
  });
}

function isGroqRateOrQuotaError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  return /429|rate_limit|quota|limit reached|tokens per day|too many requests/i.test(msg);
}

async function streamGroqCompletion(
  groq: Groq,
  model: (typeof GROQ_MODELS)[number],
  chatMessages: Groq.Chat.ChatCompletionMessageParam[]
) {
  return groq.chat.completions.create({
    model,
    messages: chatMessages,
    stream: true,
    temperature: 0.7,
    max_tokens: 768,
  });
}

export async function POST(req: NextRequest) {
  let lastUser = "";

  try {
    const { rateLimit, clientIp } = await import("@/lib/rateLimit");
    if (!rateLimit(`chat:${clientIp(req)}`, 40, 60_000)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = (await req.json()) as {
      messages?: { role: string; content: string }[];
      pageContext?: { pathname?: string; compareIds?: string[]; vehicleId?: string };
    };
    const messages = body.messages ?? [];
    const ctx = body.pageContext;

    if (!messages.length) {
      return NextResponse.json({ error: "No messages" }, { status: 400 });
    }

    lastUser = getLastUserMessage(messages);
    const apiKey = process.env.GROQ_API_KEY?.trim();

    if (!apiKey) {
      return fallbackResponse(lastUser, "missing-api-key");
    }

    const contextBlock = ctx
      ? `\nPage: ${ctx.pathname ?? "/"}${ctx.compareIds?.length ? ` | compare: ${ctx.compareIds.join(",")}` : ""}`
      : "";

    const chatMessages: Groq.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: buildSystemPrompt() + contextBlock },
      ...messages.map((m) => ({
        role: m.role === "user" ? ("user" as const) : ("assistant" as const),
        content: m.content,
      })),
    ];

    const groq = new Groq({ apiKey });
    let result: Awaited<ReturnType<typeof streamGroqCompletion>> | null = null;
    let lastError: unknown = null;

    for (const model of GROQ_MODELS) {
      try {
        result = await streamGroqCompletion(groq, model, chatMessages);
        break;
      } catch (err) {
        lastError = err;
        if (isGroqRateOrQuotaError(err)) continue;
        throw err;
      }
    }

    if (!result) {
      console.warn("Chat Groq unavailable, using catalog fallback:", lastError);
      return fallbackResponse(lastUser, "groq-rate-limit");
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result!) {
            const text = chunk.choices[0]?.delta?.content ?? "";
            if (text) controller.enqueue(encoder.encode(text));
          }
        } catch (e) {
          console.error("Stream error:", e);
          const fallback = buildChatFallback(lastUser);
          controller.enqueue(encoder.encode(`\n\n${fallback}`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-store",
        "X-Accel-Buffering": "no",
        "X-Chat-Source": "groq",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Chat route error:", message);

    if (isGroqRateOrQuotaError(error)) {
      return fallbackResponse(lastUser, "groq-rate-limit");
    }

    return NextResponse.json({ error: "Chat temporarily unavailable" }, { status: 500 });
  }
}
