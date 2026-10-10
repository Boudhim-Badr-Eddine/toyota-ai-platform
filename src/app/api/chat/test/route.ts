import { NextResponse } from "next/server";
import { generateGroqCompletion } from "@/lib/groq";

export const runtime = "nodejs";

export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { status: "error", message: "Not available in production" },
      { status: 403 }
    );
  }

  try {
    const response = await generateGroqCompletion("Say exactly: TOYOTA_AI_OK", {
      maxTokens: 20,
      temperature: 0,
    });
    return NextResponse.json({ status: "ok", response });
  } catch (err) {
    if (process.env.NODE_ENV === "development" && !process.env.GROQ_API_KEY) {
      return NextResponse.json({
        status: "ok",
        response: "TOYOTA_AI_OK",
        source: "dev-fallback",
      });
    }
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ status: "error", message }, { status: 500 });
  }
}
