import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const InputSchema = z.object({
  vehicle_category: z.string().min(1),
  price_range: z.string().min(1),
  season: z.enum(["spring", "summer", "autumn", "winter"]),
  target_segment: z.enum(["families", "young", "professional", "adventure"]),
});

export async function POST(request: NextRequest) {
  const body: unknown = await request.json();
  const parsed = InputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const mlServiceUrl = process.env.ML_SERVICE_URL ?? "http://localhost:8000";

  try {
    const res = await fetch(`${mlServiceUrl}/predict-campaign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `ML service returned ${res.status}` },
        { status: 502 }
      );
    }

    const prediction: unknown = await res.json();
    return NextResponse.json(prediction);
  } catch (err) {
    console.error("[/api/ml-predict]", err);
    return NextResponse.json(
      { error: "ML service unavailable" },
      { status: 503 }
    );
  }
}
