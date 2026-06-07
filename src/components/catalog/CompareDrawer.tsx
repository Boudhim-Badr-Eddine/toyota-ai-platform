"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Sparkles, Trophy, Scale } from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from "recharts";
import type { CompareResult } from "@/app/api/compare/route";
import { useCompareStore } from "@/store/compareStore";
import { VEHICLES_DATA } from "@/data/vehicles";
import { getEnrichedVehicle } from "@/data/vehicleEnrichments";
import { Button } from "@/components/ui/button";
import { formatPrice, cn } from "@/lib/utils";

const CHART_COLORS = ["#EB0A1E", "#C9A84C", "#60A5FA"];

export function CompareDrawer() {
  const { selectedIds, drawerOpen, setDrawerOpen, clear } = useCompareStore();
  const [result, setResult] = useState<CompareResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!drawerOpen || selectedIds.length < 2) return;
    setLoading(true);
    setResult(null);
    fetch("/api/compare", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vehicleIds: selectedIds, context: { scenario: "general" } }),
    })
      .then((r) => r.json())
      .then((d: { data?: CompareResult }) => setResult(d.data ?? null))
      .finally(() => setLoading(false));
  }, [drawerOpen, selectedIds]);

  const vehicles = selectedIds
    .map((id) => getEnrichedVehicle(VEHICLES_DATA.find((v) => v.id === id)!))
    .filter(Boolean);

  const configuratorWinner = result?.rows?.length
    ? Object.entries(
        result.rows.reduce<Record<string, number>>((acc, row) => {
          if (row.winner) acc[row.winner] = (acc[row.winner] ?? 0) + 1;
          return acc;
        }, {})
      ).sort((a, b) => b[1] - a[1])[0]?.[0]
    : undefined;

  const radarData = vehicles[0]?.scenarioScores
    ? (["family", "city", "sport", "value", "tech", "offroad"] as const).map((key) => {
        const row: Record<string, string | number> = {
          subject: { family: "Famille", city: "Ville", sport: "Sport", value: "Valeur", tech: "Tech", offroad: "4x4" }[key],
        };
        vehicles.forEach((v) => {
          if (v.scenarioScores) row[v.id] = v.scenarioScores[key];
        });
        return row;
      })
    : [];

  const barData = vehicles.map((v) => ({
    name: v.name.replace("Toyota ", ""),
    Puissance: v.specs.power,
    Consommation: v.specs.consumption,
  }));

  return (
    <AnimatePresence>
      {drawerOpen && (
        <div className="fixed inset-0 z-[9985] flex items-center justify-center p-4 sm:p-6 pointer-events-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/75 backdrop-blur-md pointer-events-auto"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Centered panel — shifted slightly left on xl to sit beside chat widget */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="compare-title"
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className={cn(
              "relative pointer-events-auto w-full max-w-3xl max-h-[min(90vh,820px)] flex flex-col overflow-hidden",
              "rounded-3xl border border-white/10",
              "bg-gradient-to-b from-[#141414] via-[#0c0c0c] to-[#080808]",
              "shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_32px_80px_-20px_rgba(0,0,0,0.85)]",
              "xl:-translate-x-[min(180px,12vw)]"
            )}
          >
            {/* Accent glow */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-toyota-red/80 to-transparent" />

            {/* Header */}
            <div className="shrink-0 relative px-5 sm:px-6 pt-5 pb-4 border-b border-white/8">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-toyota-red/15 border border-toyota-red/25 flex items-center justify-center">
                    <Scale className="h-5 w-5 text-toyota-red" />
                  </div>
                  <div>
                    <h2 id="compare-title" className="text-white font-bold text-lg tracking-tight">
                      Comparaison intelligente
                    </h2>
                    <p className="text-toyota-muted text-xs mt-0.5">Analyse IA · {vehicles.length} modèles</p>
                  </div>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Fermer"
                  className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors"
                >
                  <X className="h-4 w-4 text-toyota-muted" />
                </button>
              </div>

              {/* Vehicle strip */}
              <div className="flex gap-3 mt-4 overflow-x-auto pb-1">
                {vehicles.map((v, i) => (
                  <div
                    key={v.id}
                    className="flex items-center gap-3 min-w-[200px] flex-1 p-3 rounded-2xl bg-white/[0.03] border border-white/8"
                    style={{ boxShadow: `inset 0 0 0 1px ${CHART_COLORS[i]}22` }}
                  >
                    <div className="relative w-16 h-11 rounded-lg overflow-hidden bg-black/40 shrink-0">
                      {v.imageUrl && (
                        <Image
                          src={v.imageUrl}
                          alt={v.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                          loading="lazy"
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white text-sm font-semibold truncate">{v.name.replace("Toyota ", "")}</p>
                      <p className="text-[11px] text-toyota-muted">{v.category}</p>
                      <p className="text-xs font-bold mt-0.5" style={{ color: CHART_COLORS[i] }}>
                        {formatPrice(v.priceFrom)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-5 compare-scroll">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Loader2 className="h-9 w-9 animate-spin text-toyota-red" />
                  <p className="text-toyota-muted text-sm">L&apos;IA analyse les véhicules…</p>
                </div>
              ) : (
                <>
                  {result?.summary && (
                    <div className="relative rounded-2xl p-4 border border-toyota-red/20 bg-gradient-to-br from-toyota-red/10 to-transparent">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-4 w-4 text-toyota-red" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-toyota-red">
                          Verdict IA
                        </span>
                      </div>
                      <p className="text-white/90 text-sm leading-relaxed">{result.summary}</p>
                    </div>
                  )}

                  {result?.suggestedAlternatives && !Array.isArray(result.suggestedAlternatives) && (
                    <div className="rounded-2xl p-4 border border-toyota-gold/25 bg-toyota-gold/5">
                      <p className="text-toyota-gold text-[10px] font-bold uppercase mb-1">Suggestion</p>
                      <p className="text-sm text-white/85">{result.suggestedAlternatives.reasoning}</p>
                    </div>
                  )}

                  <div className="grid sm:grid-cols-2 gap-4">
                    {radarData.length > 0 && (
                      <div className="rounded-2xl p-4 border border-white/8 bg-black/30 h-56">
                        <p className="text-xs font-semibold text-toyota-muted uppercase tracking-wider mb-2">
                          Profils d&apos;usage
                        </p>
                        <ResponsiveContainer width="100%" height="85%">
                          <RadarChart data={radarData}>
                            <PolarGrid stroke="#333" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: "#9CA3AF", fontSize: 9 }} />
                            {vehicles.map((v, i) => (
                              <Radar
                                key={v.id}
                                name={v.name.replace("Toyota ", "")}
                                dataKey={v.id}
                                stroke={CHART_COLORS[i]}
                                fill={CHART_COLORS[i]}
                                fillOpacity={0.15}
                                strokeWidth={2}
                              />
                            ))}
                            <Legend wrapperStyle={{ fontSize: 10 }} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    )}

                    <div className="rounded-2xl p-4 border border-white/8 bg-black/30 h-56">
                      <p className="text-xs font-semibold text-toyota-muted uppercase tracking-wider mb-2">
                        Puissance & consommation
                      </p>
                      <ResponsiveContainer width="100%" height="85%">
                        <BarChart data={barData} barGap={4}>
                          <CartesianGrid stroke="#222" vertical={false} />
                          <XAxis dataKey="name" tick={{ fill: "#9CA3AF", fontSize: 9 }} />
                          <YAxis tick={{ fill: "#666", fontSize: 9 }} width={28} />
                          <Tooltip
                            contentStyle={{
                              background: "#111",
                              border: "1px solid #333",
                              borderRadius: 12,
                              fontSize: 12,
                            }}
                          />
                          <Bar dataKey="Puissance" fill="#EB0A1E" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="Consommation" fill="#C9A84C" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {result?.rows && result.rows.length > 0 && (
                    <div className="rounded-2xl border border-white/8 overflow-hidden">
                      <div className="px-4 py-3 bg-white/[0.03] border-b border-white/8">
                        <p className="text-xs font-bold text-white uppercase tracking-wider">Fiche comparative</p>
                      </div>
                      <div className="divide-y divide-white/5">
                        {result.rows.map((row) => (
                          <div key={row.label} className="px-4 py-3 hover:bg-white/[0.02] transition-colors">
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span className="text-white text-sm font-medium">{row.label}</span>
                              {row.winner && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-toyota-gold uppercase">
                                  <Trophy className="h-3 w-3" />
                                  {row.winner}
                                </span>
                              )}
                            </div>
                            {row.whyItMatters && (
                              <p className="text-toyota-muted text-xs mb-2 italic">{row.whyItMatters}</p>
                            )}
                            <div className="grid gap-2 sm:grid-cols-2">
                              {Object.entries(row.values).map(([id, val]) => {
                                const isWinner = row.winner === id;
                                return (
                                  <div
                                    key={id}
                                    className={cn(
                                      "rounded-xl px-3 py-2 text-xs border",
                                      isWinner
                                        ? "border-toyota-red/40 bg-toyota-red/10 text-white"
                                        : "border-white/5 bg-white/[0.02] text-white/80"
                                    )}
                                  >
                                    <span className="text-toyota-muted uppercase text-[10px]">{id}</span>
                                    <p className="font-semibold mt-0.5">{String(val)}</p>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="shrink-0 flex flex-wrap gap-3 px-5 sm:px-6 py-4 border-t border-white/8 bg-black/40">
              {configuratorWinner && (
                <Button asChild className="flex-1 min-w-[140px]">
                  <a href={`/configurator/${configuratorWinner}`}>Configurer le gagnant</a>
                </Button>
              )}
              <Button variant="secondary" className="flex-1" onClick={clear}>
                Effacer
              </Button>
              <Button className="flex-1" onClick={() => setDrawerOpen(false)}>
                Fermer
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function CompareBar() {
  const { selectedIds, setDrawerOpen, clear } = useCompareStore();

  if (selectedIds.length === 0) return null;

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-[9980] flex items-center gap-3 px-5 py-3 rounded-2xl bg-black/90 backdrop-blur-xl border border-white/10 shadow-2xl xl:-translate-x-[calc(50%+90px)]"
    >
      <Scale className="h-4 w-4 text-toyota-red shrink-0" />
      <span className="text-white text-sm font-semibold">{selectedIds.length} sélectionné(s)</span>
      <Button size="sm" disabled={selectedIds.length < 2} onClick={() => setDrawerOpen(true)}>
        Comparer
      </Button>
      <button onClick={clear} className="text-toyota-muted text-xs hover:text-white px-1">
        Effacer
      </button>
    </motion.div>
  );
}
