"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Map, Users, Calendar, Car, Loader2, Sparkles } from "lucide-react";
import { MOROCCO_CITIES } from "@/data/moroccoLandmarks";
import { VEHICLES_DATA } from "@/data/vehicles";
import { ItineraryDayCard, type ItineraryDay } from "./ItineraryDayCard";
import { TripMap } from "./TripMap";
import { CartePostaleCard } from "./CartePostaleCard";
import { cn } from "@/lib/utils";

interface RoadTripResult {
  title: string;
  summary: string;
  vehicleId: string;
  vehicleName: string;
  origin: string;
  duration: number;
  travelers: number;
  days: ItineraryDay[];
  totalKm: number;
  source: "groq" | "rules";
}

export function RoadTripWizard() {
  const [origin, setOrigin] = useState("Casablanca");
  const [duration, setDuration] = useState(3);
  const [travelers, setTravelers] = useState(2);
  const [vehicleId, setVehicleId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RoadTripResult | null>(null);
  const [activeDay, setActiveDay] = useState(1);
  const [error, setError] = useState("");

  const allStops = result?.days.flatMap((d) => d.stops) ?? [];
  const activeDayData = result?.days.find((d) => d.day === activeDay);
  const highlightStop = result?.days[0]?.stops[0]?.name;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/road-trip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin,
          duration,
          travelers,
          vehicleId: vehicleId || undefined,
        }),
      });

      if (!res.ok) throw new Error("Échec de la génération");
      const data = (await res.json()) as RoadTripResult;
      setResult(data);
      setActiveDay(1);
    } catch {
      setError("Impossible de générer l'itinéraire. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section-container py-12 md:py-16">
      <div className="mx-auto max-w-5xl">
        <form onSubmit={handleSubmit} className="toyota-panel p-6 md:p-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-white/40 mb-2">
                <Map className="h-3.5 w-3.5" /> Ville de départ
              </label>
              <select
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full rounded-md border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-toyota-red focus:outline-none"
              >
                {MOROCCO_CITIES.map((city) => (
                  <option key={city} value={city} className="bg-[#121212]">
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-white/40 mb-2">
                <Calendar className="h-3.5 w-3.5" /> Durée (jours)
              </label>
              <input
                type="range"
                min={1}
                max={7}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full accent-toyota-red"
              />
              <p className="mt-1 text-sm font-bold text-white">{duration} jour{duration > 1 ? "s" : ""}</p>
            </div>

            <div>
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-white/40 mb-2">
                <Users className="h-3.5 w-3.5" /> Voyageurs
              </label>
              <input
                type="number"
                min={1}
                max={8}
                value={travelers}
                onChange={(e) => setTravelers(Number(e.target.value))}
                className="w-full rounded-md border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-toyota-red focus:outline-none"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-white/40 mb-2">
                <Car className="h-3.5 w-3.5" /> Véhicule (optionnel)
              </label>
              <select
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                className="w-full rounded-md border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-toyota-red focus:outline-none"
              >
                <option value="" className="bg-[#121212]">Auto-sélection</option>
                {VEHICLES_DATA.map((v) => (
                  <option key={v.id} value={v.id} className="bg-[#121212]">
                    {v.name.replace("Toyota ", "")}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 toyota-btn-primary w-full md:w-auto inline-flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Génération en cours…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Créer mon road trip
              </>
            )}
          </button>

          {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
        </form>

        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-10 space-y-8"
            >
              <div className="text-center">
                <h2 className="text-2xl font-black text-white">{result.title}</h2>
                <p className="mt-2 text-sm text-white/45">{result.summary}</p>
                <p className="mt-1 text-xs text-toyota-muted">
                  Généré via {result.source === "groq" ? "IA Groq" : "moteur Toyota"} · {result.vehicleName}
                </p>
              </div>

              <TripMap
                stops={activeDayData?.stops ?? allStops}
                origin={result.origin}
                height="400px"
                activeDay={activeDay}
              />

              <div className="flex flex-wrap gap-2 justify-center">
                {result.days.map((d) => (
                  <button
                    key={d.day}
                    type="button"
                    onClick={() => setActiveDay(d.day)}
                    className={cn(
                      "rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide transition-all",
                      activeDay === d.day
                        ? "bg-toyota-red text-white"
                        : "bg-white/5 text-white/50 hover:bg-white/10"
                    )}
                  >
                    Jour {d.day}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                {result.days.map((day) => (
                  <ItineraryDayCard
                    key={day.day}
                    day={day}
                    highlighted={day.day === activeDay}
                  />
                ))}
              </div>

              <CartePostaleCard
                title={result.title}
                summary={result.summary}
                origin={result.origin}
                duration={result.duration}
                totalKm={result.totalKm}
                vehicleName={result.vehicleName}
                highlightStop={highlightStop}
              />

              <div className="flex flex-wrap gap-4 justify-center pt-4">
                <Link
                  href={`/configurator/${result.vehicleId}`}
                  className="toyota-btn-primary inline-flex items-center gap-2"
                >
                  Configurer {result.vehicleName.replace("Toyota ", "")}
                </Link>
                <Link
                  href={`/acheter?vehicle=${result.vehicleId}`}
                  className="toyota-btn-secondary inline-flex items-center gap-2"
                >
                  Réserver un essai
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
