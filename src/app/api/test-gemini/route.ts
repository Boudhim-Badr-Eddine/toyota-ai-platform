import { NextResponse } from 'next/server'
import Groq from 'groq-sdk'

export async function GET() {
  const key = process.env.GROQ_API_KEY
  if (!key) {
    return NextResponse.json({ error: 'GROQ_API_KEY not set in .env.local' }, { status: 500 })
  }

  try {
    const groq = new Groq({ apiKey: key })
    const result = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: 'Say exactly: TOYOTA_AI_OK' }],
      max_tokens: 20,
    })
    const text = result.choices[0]?.message?.content ?? ''
    return NextResponse.json({ success: true, response: text })
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
