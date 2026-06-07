import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { DEALERSHIPS } from "@/data/dealerships";
import { VEHICLES_DATA } from "@/data/vehicles";
import {
  MOROCCO_CITIES,
  MOROCCO_LANDMARKS,
  CITY_ROUTES,
  getLandmarksForCity,
  type MoroccoLandmark,
} from "@/data/moroccoLandmarks";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RoadTripStop {
  name: string;
  city: string;
  lat: number;
  lng: number;
  type: string;
  note: string;
  isDealer?: boolean;
  dealerId?: string;
}

interface RoadTripDay {
  day: number;
  title: string;
  description: string;
  drivingKm: number;
  stops: RoadTripStop[];
}

interface RoadTripResult {
  title: string;
  summary: string;
  vehicleId: string;
  vehicleName: string;
  origin: string;
  duration: number;
  travelers: number;
  days: RoadTripDay[];
  totalKm: number;
  source: "groq" | "rules";
}

function normalizeCity(origin: string): string {
  const normalized = origin.trim();
  const match = MOROCCO_CITIES.find(
    (c) => c.toLowerCase() === normalized.toLowerCase()
  );
  return match ?? "Casablanca";
}

function pickVehicle(vehicleId?: string, travelers = 2): (typeof VEHICLES_DATA)[0] {
  if (vehicleId) {
    const v = VEHICLES_DATA.find((x) => x.id === vehicleId);
    if (v) return v;
  }
  if (travelers >= 6) return VEHICLES_DATA.find((v) => v.id === "highlander")!;
  if (travelers >= 4) return VEHICLES_DATA.find((v) => v.id === "rav4")!;
  return VEHICLES_DATA.find((v) => v.id === "corolla")!;
}

function nearestDealer(city: string) {
  const inCity = DEALERSHIPS.filter(
    (d) => d.city.toLowerCase() === city.toLowerCase()
  );
  if (inCity.length) return inCity[0];
  return DEALERSHIPS.find((d) => d.type === "succursale") ?? DEALERSHIPS[0];
}

function landmarkToStop(lm: MoroccoLandmark): RoadTripStop {
  return {
    name: lm.name,
    city: lm.city,
    lat: lm.lat,
    lng: lm.lng,
    type: lm.type,
    note: lm.description,
  };
}

function dealerToStop(city: string): RoadTripStop {
  const dealer = nearestDealer(city);
  return {
    name: dealer.name,
    city: dealer.city,
    lat: dealer.lat,
    lng: dealer.lng,
    type: "concession",
    note: `Pause Toyota — ${dealer.address}. Tél: ${dealer.phone}`,
    isDealer: true,
    dealerId: dealer.id,
  };
}

function buildRouteCities(origin: string, duration: number): string[] {
  const cities = [origin];
  const routes = CITY_ROUTES[origin] ?? CITY_ROUTES.Casablanca;
  const visited = new Set([origin]);

  for (let d = 1; d < duration; d++) {
    const current = cities[cities.length - 1];
    const options = (CITY_ROUTES[current] ?? routes).filter((r) => !visited.has(r.to));
    if (!options.length) break;
    const next = options[(d - 1) % options.length].to;
    cities.push(next);
    visited.add(next);
  }

  return cities;
}

function ruleBasedItinerary(
  origin: string,
  duration: number,
  travelers: number,
  vehicleId?: string
): RoadTripResult {
  const vehicle = pickVehicle(vehicleId, travelers);
  const routeCities = buildRouteCities(origin, duration);
  const days: RoadTripDay[] = [];
  let totalKm = 0;

  const dayTitles = [
    "Départ légendaire",
    "Sur la route royale",
    "Trésors cachés",
    "Horizons nouveaux",
    "Retour de conquérant",
    "Dernière étape",
    "Au revoir, aventure",
  ];

  for (let d = 0; d < duration; d++) {
    const city = routeCities[d] ?? routeCities[routeCities.length - 1];
    const landmarks = getLandmarksForCity(city);
    const stops: RoadTripStop[] = [];

    if (landmarks.length) {
      stops.push(landmarkToStop(landmarks[d % landmarks.length]));
      if (landmarks.length > 1) {
        stops.push(landmarkToStop(landmarks[(d + 1) % landmarks.length]));
      }
    }

    if (d === 0 || d === Math.floor(duration / 2)) {
      stops.push(dealerToStop(city));
    }

    let drivingKm = 0;
    if (d > 0) {
      const prev = routeCities[d - 1];
      const route = (CITY_ROUTES[prev] ?? []).find((r) => r.to === city);
      drivingKm = route?.km ?? 120;
      totalKm += drivingKm;
    }

    days.push({
      day: d + 1,
      title: `${dayTitles[d] ?? `Jour ${d + 1}`} — ${city}`,
      description: `Jour ${d + 1} de votre road trip légendaire au Maroc, au volant de la ${vehicle.name.replace("Toyota ", "")}.`,
      drivingKm,
      stops,
    });
  }

  return {
    title: `Road Trip Légendaire — ${origin}`,
    summary: `${duration} jours, ${travelers} voyageur${travelers > 1 ? "s" : ""}, ${totalKm} km de routes marocaines à bord de la ${vehicle.name}.`,
    vehicleId: vehicle.id,
    vehicleName: vehicle.name,
    origin,
    duration,
    travelers,
    days,
    totalKm,
    source: "rules",
  };
}

async function groqItinerary(
  origin: string,
  duration: number,
  travelers: number,
  vehicleId?: string
): Promise<RoadTripResult | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  const vehicle = pickVehicle(vehicleId, travelers);
  const landmarks = Object.entries(MOROCCO_LANDMARKS)
    .map(([city, lms]) => ({
      city,
      landmarks: lms.map((l) => ({ name: l.name, type: l.type, lat: l.lat, lng: l.lng })),
    }))
    .slice(0, 8);

  const dealers = DEALERSHIPS.slice(0, 10).map((d) => ({
    id: d.id,
    name: d.name,
    city: d.city,
    lat: d.lat,
    lng: d.lng,
  }));

  const prompt = `Tu es un planificateur de road trips Toyota au Maroc.
Crée un itinéraire « Road Trip Légendaire » de ${duration} jours depuis ${origin} pour ${travelers} voyageurs.
Véhicule: ${vehicle.name}.

LANDMARKS:
${JSON.stringify(landmarks)}

CONCESSIONS TOYOTA (inclure 1-2 arrêts):
${JSON.stringify(dealers)}

Réponds UNIQUEMENT en JSON valide:
{
  "title": "...",
  "summary": "...",
  "days": [
    {
      "day": 1,
      "title": "...",
      "description": "...",
      "drivingKm": 0,
      "stops": [{"name":"...","city":"...","lat":0,"lng":0,"type":"culture","note":"...","isDealer":false}]
    }
  ],
  "totalKm": 0
}

Utilise de vraies villes marocaines et coordonnées réalistes.`;

  try {
    const groq = new Groq({ apiKey });
    const result = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.75,
      max_tokens: 2048,
    });

    const raw = result.choices[0]?.message?.content?.trim() ?? "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]) as {
      title?: string;
      summary?: string;
      days?: RoadTripDay[];
      totalKm?: number;
    };

    if (!parsed.days?.length) return null;

    return {
      title: parsed.title ?? `Road Trip Légendaire — ${origin}`,
      summary: parsed.summary ?? `${duration} jours au Maroc`,
      vehicleId: vehicle.id,
      vehicleName: vehicle.name,
      origin,
      duration,
      travelers,
      days: parsed.days,
      totalKm: parsed.totalKm ?? parsed.days.reduce((s, d) => s + (d.drivingKm ?? 0), 0),
      source: "groq",
    };
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      origin?: string;
      duration?: number;
      travelers?: number;
      vehicleId?: string;
    };

    const origin = normalizeCity(body.origin ?? "Casablanca");
    const duration = Math.min(Math.max(body.duration ?? 3, 1), 7);
    const travelers = Math.min(Math.max(body.travelers ?? 2, 1), 8);

    const groqResult = await groqItinerary(origin, duration, travelers, body.vehicleId);
    const result = groqResult ?? ruleBasedItinerary(origin, duration, travelers, body.vehicleId);

    return NextResponse.json(result);
  } catch (err) {
    console.error("[road-trip]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
