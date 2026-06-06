import type { MLPrediction, MLPredictionInput } from "@/types";

export interface LeadRecord {
  vehicle_category: string;
  price_range: string;
  season: string;
  target_segment: string;
  status: string;
  type: string;
}

export interface LeadInsights {
  total_leads: number;
  conversion_rate: number;
  top_category: string;
  top_segment: string;
  recommendations: string[];
  predicted_campaigns: Array<MLPrediction & { target_segment: string }>;
}

const CAMPAIGN_BY_SEGMENT: Record<string, string[]> = {
  young: ["Digital Social", "Influencer"],
  families: ["TV & Radio", "Outdoor", "Event Marketing", "Email Campaign"],
  professional: ["Search & Display", "Email Campaign"],
  adventure: ["Outdoor", "Event Marketing", "Digital Social"],
};

const CHANNEL_BY_CAMPAIGN: Record<string, string> = {
  "Digital Social": "Instagram + Facebook",
  Influencer: "YouTube + TikTok",
  "Search & Display": "Google Ads + Display",
  "Event Marketing": "Event + Showroom",
  "Email Campaign": "LinkedIn + Email",
  "TV & Radio": "TV + Digital",
  Outdoor: "Radio + Outdoor",
};

const THEME_BY_PAIR: Record<string, string> = {
  "Sport|young": "Performance & Adrénaline",
  "Sport|professional": "Performance & Adrénaline",
  "SUV Familial|families": "Aventure Familiale",
  "SUV 7 places|families": "Aventure Familiale",
  "Citadine|young": "Urban Lifestyle",
  "SUV Urbain|young": "Urban Lifestyle",
  "Éco/Tech|young": "Éco-mobilité Intelligente",
  "Éco/Tech|professional": "Innovation Technologique",
  "Compacte Hybride|professional": "Éco-mobilité Intelligente",
  "Berline Confort|professional": "Luxe & Confort",
  "Tout-terrain extrême|adventure": "Robustesse & Fiabilité",
  "Pick-up utilitaire|adventure": "Robustesse & Fiabilité",
  "Pick-up utilitaire|professional": "Robustesse & Fiabilité",
};

const DEFAULT_THEMES = [
  "Aventure Familiale",
  "Performance & Adrénaline",
  "Éco-mobilité Intelligente",
  "Luxe & Confort",
  "Urban Lifestyle",
  "Robustesse & Fiabilité",
  "Innovation Technologique",
  "Rapport Qualité-Prix",
];

function hashInput(input: MLPredictionInput): number {
  const s = `${input.vehicle_category}|${input.price_range}|${input.season}|${input.target_segment}`;
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function pick<T>(items: T[], seed: number, offset = 0): T {
  return items[(seed + offset) % items.length]!;
}

function campaignType(input: MLPredictionInput, seed: number): string {
  const options = CAMPAIGN_BY_SEGMENT[input.target_segment] ?? ["Digital Social", "Search & Display"];
  if (input.target_segment === "families" && (input.season === "spring" || input.season === "summer")) {
    return pick(["TV & Radio", "Outdoor", "Event Marketing"], seed);
  }
  if (input.target_segment === "families") {
    return pick(["TV & Radio", "Email Campaign"], seed);
  }
  return pick(options, seed);
}

function budgetAllocation(priceRange: string, campaign: string, seed: number): number {
  const base: Record<string, number> = {
    "0-200000": 20,
    "200000-350000": 30,
    "350000-550000": 40,
    "550000+": 50,
  };
  const bonus: Record<string, number> = {
    "TV & Radio": 10,
    Outdoor: 8,
    "Event Marketing": 12,
    "Digital Social": -5,
  };
  const raw = (base[priceRange] ?? 30) + (bonus[campaign] ?? 0) + (seed % 7) - 3;
  return Math.round(Math.min(70, Math.max(10, raw)));
}

function predictedRoi(input: MLPredictionInput, budget: number, seed: number): number {
  let base = 2.0;
  if (input.season === "spring" || input.season === "summer") base += 0.4;
  if (input.target_segment === "young" && ["Citadine", "SUV Urbain", "Sport"].includes(input.vehicle_category)) {
    base += 0.5;
  }
  if (input.target_segment === "families" && ["SUV Familial", "SUV 7 places"].includes(input.vehicle_category)) {
    base += 0.6;
  }
  if (input.target_segment === "professional" && ["Berline Confort", "Compacte Hybride"].includes(input.vehicle_category)) {
    base += 0.4;
  }
  if (input.target_segment === "adventure" && ["Tout-terrain extrême", "Pick-up utilitaire"].includes(input.vehicle_category)) {
    base += 0.7;
  }
  if (input.price_range === "550000+") base -= 0.3;
  const jitter = ((seed % 100) / 100 - 0.5) * 0.4;
  return Math.round(Math.min(5, Math.max(0.5, base + jitter)) * 100) / 100;
}

function messageTheme(input: MLPredictionInput, seed: number): string {
  const key = `${input.vehicle_category}|${input.target_segment}`;
  return THEME_BY_PAIR[key] ?? pick(DEFAULT_THEMES, seed, 2);
}

function confidence(roi: number, budget: number, seed: number): number {
  const jitter = ((seed % 50) / 1000) - 0.025;
  const c = 0.6 + (roi - 1) * 0.06 - Math.abs(budget - 35) * 0.002 + jitter;
  return Math.round(Math.min(0.97, Math.max(0.55, c)) * 100) / 100;
}

/** Local lead batch analysis when ml-service is offline. */
export function analyzeLeadsLocal(leads: LeadRecord[]): LeadInsights {
  const total = leads.length;
  const converted = leads.filter((l) => l.status === "converted").length;
  const conversion_rate = Math.round((converted / total) * 1000) / 10;

  const categoryCounts: Record<string, number> = {};
  const segmentCounts: Record<string, number> = {};
  for (const lead of leads) {
    const cat = lead.vehicle_category || "Unknown";
    const seg = lead.target_segment || "Unknown";
    categoryCounts[cat] = (categoryCounts[cat] ?? 0) + 1;
    segmentCounts[seg] = (segmentCounts[seg] ?? 0) + 1;
  }

  const top_category =
    Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
  const top_segment =
    Object.entries(segmentCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

  const recommendations: string[] = [
    `Concentrez vos efforts sur le segment '${top_segment}' — il représente ${segmentCounts[top_segment] ?? 0} leads.`,
    `Le modèle '${top_category}' génère le plus d'intérêt (${categoryCounts[top_category] ?? 0} leads).`,
  ];
  if (conversion_rate < 20) {
    recommendations.push(
      "Taux de conversion faible (<20%) — envisagez un suivi téléphonique plus rapide."
    );
  } else if (conversion_rate > 50) {
    recommendations.push(
      "Excellent taux de conversion (>50%) — renforcez le budget sur les canaux actuels."
    );
  }

  const seenSegments = new Set<string>();
  const predicted_campaigns: Array<MLPrediction & { target_segment: string }> = [];
  for (const lead of leads) {
    const seg = lead.target_segment;
    if (seenSegments.has(seg)) continue;
    seenSegments.add(seg);
    const pred = predictCampaignLocal({
      vehicle_category: lead.vehicle_category || top_category,
      price_range: lead.price_range,
      season: lead.season as MLPredictionInput["season"],
      target_segment: seg as MLPredictionInput["target_segment"],
    });
    predicted_campaigns.push({ ...pred, target_segment: seg });
  }

  return {
    total_leads: total,
    conversion_rate,
    top_category,
    top_segment,
    recommendations,
    predicted_campaigns,
  };
}

/** Deterministic local predictor — mirrors ml-service heuristics when FastAPI is offline. */
export function predictCampaignLocal(input: MLPredictionInput): MLPrediction {
  const seed = hashInput(input);
  const campaign = campaignType(input, seed);
  const budget = budgetAllocation(input.price_range, campaign, seed);
  const roi = predictedRoi(input, budget, seed);

  return {
    campaign_type: campaign,
    channel: CHANNEL_BY_CAMPAIGN[campaign] ?? "Google Ads + Display",
    budget_allocation: budget,
    predicted_roi: roi,
    message_theme: messageTheme(input, seed),
    confidence: confidence(roi, budget, seed),
  };
}
