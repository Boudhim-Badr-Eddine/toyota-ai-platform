import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { predictCampaignLocal } from "@/lib/ml-fallback";
import { requireAdmin } from "@/lib/auth";

const InputSchema = z.object({
  vehicle_category: z.string().min(1),
  price_range: z.string().min(1),
  season: z.enum(["spring", "summer", "autumn", "winter"]),
  target_segment: z.enum(["families", "young", "professional", "adventure"]),
});

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: unknown = await request.json();
  const parsed = InputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const mlServiceUrl = process.env.ML_SERVICE_URL ?? "http://localhost:8000";
  const useLocalOnly = process.env.ML_USE_LOCAL === "true";

  if (!useLocalOnly) {
    try {
      const res = await fetch(`${mlServiceUrl}/predict-campaign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
        signal: AbortSignal.timeout(5000),
      });

      if (res.ok) {
        const prediction: unknown = await res.json();
        return NextResponse.json({ ...(prediction as object), source: "ml-service" });
      }
    } catch (err) {
      console.warn("[/api/ml-predict] ML service unavailable, using local fallback:", err);
    }
  }

  const prediction = predictCampaignLocal(parsed.data);
  return NextResponse.json({ ...prediction, source: "local" });
}
