import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { analyzeLeadsLocal, type LeadRecord } from "@/lib/ml-fallback";

const LeadRecordSchema = z.object({
  vehicle_category: z.string().default(""),
  price_range: z.string().default("200000-350000"),
  season: z.enum(["spring", "summer", "autumn", "winter"]).default("spring"),
  target_segment: z
    .enum(["families", "young", "professional", "adventure"])
    .default("families"),
  status: z.string().default("new"),
  type: z.string().default("test_drive"),
});

const InputSchema = z.object({
  leads: z.array(LeadRecordSchema).min(1),
});

export async function POST(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
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
      const res = await fetch(`${mlServiceUrl}/analyze-leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data.leads),
        signal: AbortSignal.timeout(8000),
      });

      if (res.ok) {
        const insights: unknown = await res.json();
        return NextResponse.json({ ...(insights as object), source: "ml-service" });
      }
    } catch (err) {
      console.warn("[/api/ml-analyze] ML service unavailable, using local fallback:", err);
    }
  }

  const insights = analyzeLeadsLocal(parsed.data.leads as LeadRecord[]);
  return NextResponse.json({ ...insights, source: "local" });
}
