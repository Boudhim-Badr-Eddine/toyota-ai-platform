import { NextResponse } from "next/server";
import { generateGroqCompletion } from "@/lib/groq";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { prompt?: string };
    const prompt = body.prompt?.trim();

    if (!prompt || prompt.length > 800) {
      return NextResponse.json({ error: "Invalid prompt" }, { status: 400 });
    }

    const tip = await generateGroqCompletion(prompt, { maxTokens: 120, temperature: 0.8 });

    return NextResponse.json({ tip });
  } catch (err) {
    console.error("[/api/recommend]", err);
    return NextResponse.json({ error: "AI unavailable" }, { status: 502 });
  }
}
