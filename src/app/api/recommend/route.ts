import { NextResponse } from "next/server";
import { geminiModel } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { prompt?: string };
    const prompt = body.prompt?.trim();

    if (!prompt || prompt.length > 800) {
      return NextResponse.json({ error: "Invalid prompt" }, { status: 400 });
    }

    const result = await geminiModel.generateContent(prompt);
    const tip = result.response.text().trim();

    return NextResponse.json({ tip });
  } catch (err) {
    console.error("[/api/recommend]", err);
    return NextResponse.json({ error: "AI unavailable" }, { status: 502 });
  }
}
