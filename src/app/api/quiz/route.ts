import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { VEHICLES_DATA } from "@/data/vehicles";
import { QUIZ_QUESTIONS, PERSONA_TEMPLATES } from "@/data/quizQuestions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface QuizAnswer {
  questionId: string;
  optionId: string;
}

interface QuizResult {
  personaTitle: string;
  tagline: string;
  vehicleId: string;
  vehicleName: string;
  imageUrl: string;
  source: "groq" | "rules";
}

function ruleBasedMatch(answers: QuizAnswer[]): QuizResult {
  const traitScores = new Map<string, number>();

  for (const answer of answers) {
    const question = QUIZ_QUESTIONS.find((q) => q.id === answer.questionId);
    const option = question?.options.find((o) => o.id === answer.optionId);
    if (!option) continue;
    for (const trait of option.traits) {
      traitScores.set(trait, (traitScores.get(trait) ?? 0) + 1);
    }
  }

  let bestVehicle = VEHICLES_DATA[0];
  let bestScore = -1;

  for (const vehicle of VEHICLES_DATA) {
    let score = 0;
    for (const profile of vehicle.targetProfiles) {
      score += traitScores.get(profile) ?? 0;
    }
    if (vehicle.isHybrid) {
      score += (traitScores.get("Écolo") ?? 0) * 0.5;
      score += (traitScores.get("Technophile") ?? 0) * 0.5;
    }
    if (vehicle.specs.seats >= 7) {
      score += (traitScores.get("Grande famille") ?? 0) * 1.5;
    }
    if (vehicle.category === "Sport") {
      score += (traitScores.get("Sportif") ?? 0) * 2;
    }
    if (score > bestScore) {
      bestScore = score;
      bestVehicle = vehicle;
    }
  }

  const persona = PERSONA_TEMPLATES[bestVehicle.id] ?? {
    title: "Légende Toyota",
    tagline: bestVehicle.tagline,
  };

  return {
    personaTitle: persona.title,
    tagline: persona.tagline,
    vehicleId: bestVehicle.id,
    vehicleName: bestVehicle.name,
    imageUrl: bestVehicle.imageUrl,
    source: "rules",
  };
}

async function groqMatch(answers: QuizAnswer[]): Promise<QuizResult | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  const answerSummary = answers
    .map((a) => {
      const q = QUIZ_QUESTIONS.find((x) => x.id === a.questionId);
      const o = q?.options.find((x) => x.id === a.optionId);
      return `${q?.question} → ${o?.label}`;
    })
    .join("\n");

  const catalog = VEHICLES_DATA.map((v) => ({
    id: v.id,
    name: v.name,
    category: v.category,
    tagline: v.tagline,
    targetProfiles: v.targetProfiles,
  }));

  const prompt = `Tu es le créateur du quiz « Toyota DNA — Permis de Légende » au Maroc.
Analyse ces réponses et choisis le véhicule Toyota le plus adapté.

RÉPONSES:
${answerSummary}

CATALOGUE:
${JSON.stringify(catalog, null, 2)}

PERSONAS DISPONIBLES:
${JSON.stringify(PERSONA_TEMPLATES, null, 2)}

Réponds UNIQUEMENT en JSON valide (sans markdown):
{"personaTitle":"...","tagline":"...","vehicleId":"..."}

Le personaTitle doit être créatif, marocain, premium (ex: « Conquérant du Sahara »).
Le tagline en une phrase poétique en français.
vehicleId doit être un id du catalogue.`;

  try {
    const groq = new Groq({ apiKey });
    const result = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      max_tokens: 256,
    });

    const raw = result.choices[0]?.message?.content?.trim() ?? "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]) as {
      personaTitle?: string;
      tagline?: string;
      vehicleId?: string;
    };

    const vehicle = VEHICLES_DATA.find((v) => v.id === parsed.vehicleId) ?? VEHICLES_DATA[0];
    const fallback = PERSONA_TEMPLATES[vehicle.id];

    return {
      personaTitle: parsed.personaTitle ?? fallback?.title ?? "Légende Toyota",
      tagline: parsed.tagline ?? fallback?.tagline ?? vehicle.tagline,
      vehicleId: vehicle.id,
      vehicleName: vehicle.name,
      imageUrl: vehicle.imageUrl,
      source: "groq",
    };
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { answers?: QuizAnswer[] };
    const answers = body.answers ?? [];

    if (!answers.length) {
      return NextResponse.json({ error: "Réponses requises" }, { status: 400 });
    }

    const groqResult = await groqMatch(answers);
    const result = groqResult ?? ruleBasedMatch(answers);

    return NextResponse.json(result);
  } catch (err) {
    console.error("[quiz]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
