import Groq from 'groq-sdk'
import { NextRequest, NextResponse } from 'next/server'
import { VEHICLES_DATA } from '@/data/vehicles'
import { getEnrichedVehicle } from '@/data/vehicleEnrichments'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function buildSystemPrompt(): string {
  const catalog = VEHICLES_DATA.map((v) => {
    const e = getEnrichedVehicle(v)
    return {
      id: v.id,
      name: v.name,
      category: v.category,
      priceFrom: v.priceFrom,
      tagline: v.tagline,
      isHybrid: v.isHybrid,
      specs: v.specs,
      scenarioScores: e.scenarioScores,
      configuratorUrl: `/configurator/${v.id}`,
      detailUrl: `/vehicles/${v.id}`,
      acheterUrl: `/acheter?vehicle=${v.id}`,
    }
  })

  return `Tu es **Toyota AI Advisor**, le meilleur conseiller automobile du Maroc.
Réponds en français sauf si l'utilisateur écrit en arabe/anglais/darija.
Tu connais TOUS les modèles du catalogue (13 véhicules). Ne invente jamais de specs — utilise uniquement le catalogue JSON.

CATALOGUE (source de vérité — 13 modèles):
${JSON.stringify(catalog, null, 2)}

COMPARAISONS: Si l'utilisateur compare 2+ modèles (vs, comparer, différence, analyse), réponds en prose puis termine par une ligne JSON isolée:
{"compare":{"ids":["rav4","highlander"],"scenario":"family","summary":"..."}}

ANALYSE DÉTAILLÉE: Pour "analyse", "fiche", "caractéristiques" d'un modèle, cite prix, puissance, places, conso depuis le catalogue.

RECOMMANDATION: Termine par une ligne isolée:
{"recommendation":"id","configuratorUrl":"/configurator/id","detailUrl":"/vehicles/id","acheterUrl":"/acheter?vehicle=id"}

Règles: max 100 mots, 1 question à la fois, comparaisons situation-aware, refuse les comparaisons absurdes avec alternative pertinente.`}

import { buildChatFallback } from '@/lib/chatFallback'

export async function POST(req: NextRequest) {
  try {
    const { rateLimit, clientIp } = await import("@/lib/rateLimit");
    if (!rateLimit(`chat:${clientIp(req)}`, 40, 60_000)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = await req.json() as {
      messages?: { role: string; content: string }[]
      pageContext?: { pathname?: string; compareIds?: string[]; vehicleId?: string }
    }
    const messages = body.messages ?? []
    const ctx = body.pageContext

    if (!messages.length) {
      return NextResponse.json({ error: 'No messages' }, { status: 400 })
    }

    const apiKey = process.env.GROQ_API_KEY?.trim()
    if (!apiKey) {
      const lastUser = [...messages].reverse().find((m) => m.role === "user");
      const reply = buildChatFallback(lastUser?.content ?? "");
      return new Response(reply, {
        status: 200,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "X-Chat-Source": "catalog-fallback",
        },
      });
    }

    const contextBlock = ctx
      ? `\nCONTEXTE PAGE: ${JSON.stringify(ctx)}\nAdapte tes réponses à la page actuelle et aux véhicules comparés si présents.`
      : ''

    const groq = new Groq({ apiKey })

    const chatMessages: Groq.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: buildSystemPrompt() + contextBlock },
      ...messages.map(m => ({
        role: m.role === 'user' ? ('user' as const) : ('assistant' as const),
        content: m.content,
      })),
    ]

    const result = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: chatMessages,
      stream: true,
      temperature: 0.7,
      max_tokens: 1024,
    })

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result) {
            const text = chunk.choices[0]?.delta?.content ?? ''
            if (text) controller.enqueue(encoder.encode(text))
          }
        } catch (e) {
          console.error('Stream error:', e)
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-store',
        'X-Accel-Buffering': 'no',
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('Chat route error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
