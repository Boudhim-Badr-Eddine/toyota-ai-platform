import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getGroqClient } from "@/lib/groq";
import { VEHICLES_DATA } from "@/data/vehicles";
import { getEnrichedVehicle } from "@/data/vehicleEnrichments";

const CompareSchema = z.object({
  vehicleIds: z.array(z.string()).min(2).max(3),
  context: z
    .object({
      scenario: z.string().optional(),
      budgetMax: z.number().optional(),
      userMessage: z.string().optional(),
    })
    .optional(),
});

export interface CompareRow {
  label: string;
  values: Record<string, string | number>;
  winner?: string;
  relevance: number;
  whyItMatters?: string;
}

export interface CompareResult {
  vehicles: { id: string; name: string }[];
  summary: string;
  rows: CompareRow[];
  suggestedAlternatives?: { ids: string[]; reasoning: string } | null;
  scenario?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = CompareSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 422 });
    }

    const { vehicleIds, context } = parsed.data;
    const vehicles = vehicleIds
      .map((id) => VEHICLES_DATA.find((v) => v.id === id))
      .filter(Boolean)
      .map((v) => getEnrichedVehicle(v!));

    if (vehicles.length < 2) {
      return NextResponse.json({ error: "Vehicles not found" }, { status: 404 });
    }

    const scenario = context?.scenario ?? "general";
    const prompt = `Tu es expert Toyota Maroc. Compare ces véhicules pour un client marocain.
Scénario: ${scenario}
Message client: ${context?.userMessage ?? "comparaison générale"}

Véhicules:
${JSON.stringify(
  vehicles.map((v) => ({
    id: v.id,
    name: v.name,
    category: v.category,
    priceFrom: v.priceFrom,
    specs: v.specs,
    scenarioScores: v.scenarioScores,
    pros: v.pros,
    cons: v.cons,
  })),
  null,
  2
)}

Réponds UNIQUEMENT en JSON valide:
{
  "summary": "2-3 phrases en français",
  "suggestedAlternatives": null ou {"ids":["slug1","slug2"],"reasoning":"..."} si comparaison incohérente,
  "rows": [
    {"label":"Prix","values":{"rav4":"310000 MAD"},"winner":"rav4","relevance":90,"whyItMatters":"..."}
  ]
}
Inclus 8-12 lignes pertinentes pour le scénario. relevance 0-100. Masque les specs peu pertinentes (relevance<30).`;

    const groq = getGroqClient();
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
      max_tokens: 2000,
    });

    const text = completion.choices[0]?.message?.content ?? "{}";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    let aiData: Partial<CompareResult> = {};
    try {
      aiData = JSON.parse(jsonMatch?.[0] ?? "{}") as Partial<CompareResult>;
    } catch {
      aiData = { summary: "Comparaison disponible ci-dessous.", rows: [] };
    }

    const result: CompareResult = {
      vehicles: vehicles.map((v) => ({ id: v.id, name: v.name })),
      summary: aiData.summary ?? "Voici la comparaison détaillée.",
      rows: (aiData.rows ?? []).filter((r) => r.relevance >= 30),
      suggestedAlternatives: aiData.suggestedAlternatives,
      scenario,
    };

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error("[POST /api/compare]", error);
    return NextResponse.json({ error: "Compare failed" }, { status: 500 });
  }
}
