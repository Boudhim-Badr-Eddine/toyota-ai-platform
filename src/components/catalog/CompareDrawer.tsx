"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Sparkles, Trophy, Scale, ArrowRight, Zap, Users, Fuel } from "lucide-react";
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
  const { selectedIds, scenario, chatSummary, drawerOpen, setDrawerOpen, clear } = useCompareStore();
  const [result, setResult] = useState<CompareResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!drawerOpen || selectedIds.length < 2) return;
    setLoading(true);
    setResult(null);
    fetch("/api/compare", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vehicleIds: selectedIds,
        context: { scenario, userMessage: chatSummary ?? undefined },
      }),
    })
      .then((r) => r.json())
      .then((d: { data?: CompareResult }) => setResult(d.data ?? null))
      .finally(() => setLoading(false));
  }, [drawerOpen, selectedIds, scenario, chatSummary]);

  const vehicles = selectedIds
    .map((id) => {
      const base = VEHICLES_DATA.find((v) => v.id === id);
      return base ? getEnrichedVehicle(base) : null;
    })
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
          if (v?.scenarioScores) row[v.id] = v.scenarioScores[key];
        });
        return row;
      })
    : [];

  const barData = vehicles.map((v) => ({
    name: v!.name.replace("Toyota ", ""),
    Puissance: v!.specs.power,
    Consommation: v!.specs.consumption,
  }));

  const displaySummary = result?.summary ?? chatSummary;

  return (
    <AnimatePresence>
      {drawerOpen && selectedIds.length >= 2 && (
        <div className="fixed inset-0 z-[10020] flex items-center justify-center p-3 sm:p-6 pointer-events-none">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-lg pointer-events-auto"
            onClick={() => setDrawerOpen(false)}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="compare-title"
            initial={{ opacity: 0, scale: 0.92, y: 28 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: "spring", damping: 26, stiffness: 340 }}
            className={cn(
              "relative pointer-events-auto w-full max-w-4xl max-h-[min(92vh,860px)] flex flex-col overflow-hidden",
              "rounded-[28px] border border-white/[0.12]",
              "bg-[#0a0a0a]",
              "shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_40px_100px_-24px_rgba(0,0,0,0.9),0_0_80px_-20px_rgba(235,10,30,0.25)]",
              "xl:mr-[min(200px,14vw)]"
            )}
          >
            {/* Ambient layers */}
            <div className="absolute inset-0 bg-gradient-to-br from-toyota-red/[0.08] via-transparent to-toyota-gold/[0.05] pointer-events-none" />
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-toyota-red to-transparent opacity-80" />
            <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-40 bg-toyota-red/25 blur-[100px] pointer-events-none" />

            {/* Header */}
            <div className="shrink-0 relative px-5 sm:px-7 pt-6 pb-5 border-b border-white/[0.08]">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-toyota-red/25 to-toyota-red/5 border border-toyota-red/30 flex items-center justify-center shadow-lg shadow-toyota-red/10">
                      <Scale className="h-5 w-5 text-toyota-red" />
                    </div>
                    {loading && (
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#0a0a0a] border border-toyota-red/40 flex items-center justify-center">
                        <Loader2 className="h-2.5 w-2.5 animate-spin text-toyota-red" />
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-toyota-red/90 mb-1">
                      Toyota AI · Analyse
                    </p>
                    <h2 id="compare-title" className="text-white font-bold text-xl sm:text-2xl tracking-tight">
                      Comparaison intelligente
                    </h2>
                    <p className="text-white/45 text-xs mt-1">
                      {vehicles.length} modèles · scénario{" "}
                      <span className="text-white/70 font-medium capitalize">{scenario.replace("_", " ")}</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Fermer"
                  className="w-10 h-10 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all hover:rotate-90 duration-200"
                >
                  <X className="h-4 w-4 text-white/70" />
                </button>
              </div>

              {/* Vehicle cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
                {vehicles.map((v, i) => (
                  <motion.div
                    key={v!.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="group relative flex items-center gap-4 p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-white/15 transition-colors overflow-hidden"
                  >
                    <div
                      className="absolute inset-y-0 left-0 w-1 rounded-full opacity-80"
                      style={{ background: CHART_COLORS[i] }}
                    />
                    <div className="relative w-[88px] h-[58px] rounded-xl overflow-hidden bg-black/50 shrink-0 ring-1 ring-white/10">
                      {v!.imageUrl && (
                        <Image src={v!.imageUrl} alt={v!.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="88px" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-white text-sm font-bold truncate">{v!.name.replace("Toyota ", "")}</p>
                      <p className="text-[11px] text-white/40 mt-0.5">{v!.category}</p>
                      <div className="flex flex-wrap gap-2 mt-2 text-[10px] text-white/55">
                        <span className="inline-flex items-center gap-1">
                          <Zap className="h-3 w-3" style={{ color: CHART_COLORS[i] }} />
                          {v!.specs.power} ch
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {v!.specs.seats} pl.
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Fuel className="h-3 w-3" />
                          {v!.specs.consumption} L
                        </span>
                      </div>
                      <p className="text-sm font-black mt-1.5" style={{ color: CHART_COLORS[i] }}>
                        {formatPrice(v!.priceFrom)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-5 space-y-5 compare-scroll">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-14 gap-4">
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-2 border-toyota-red/20" />
                    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-toyota-red animate-spin" />
                    <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-toyota-red" />
                  </div>
                  <div className="text-center">
                    <p className="text-white font-semibold text-sm">Analyse en cours…</p>
                    <p className="text-white/40 text-xs mt-1 max-w-xs">
                      L&apos;IA compare prix, usage, puissance et consommation pour le Maroc
                    </p>
                  </div>
                  <div className="flex gap-2 mt-2">
                    {vehicles.map((v, i) => (
                      <span
                        key={v!.id}
                        className="text-[10px] px-2.5 py-1 rounded-full border font-medium"
                        style={{ borderColor: `${CHART_COLORS[i]}44`, color: CHART_COLORS[i] }}
                      >
                        {v!.name.replace("Toyota ", "")}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {displaySummary && (
                    <div className="relative rounded-2xl p-5 border border-toyota-red/25 bg-gradient-to-br from-toyota-red/[0.12] via-[#141414] to-transparent overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-toyota-red/10 blur-3xl pointer-events-none" />
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="h-4 w-4 text-toyota-red" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-toyota-red">
                          Verdict IA
                        </span>
                      </div>
                      <p className="text-white/92 text-sm sm:text-[15px] leading-relaxed relative">{displaySummary}</p>
                    </div>
                  )}

                  {result?.suggestedAlternatives && !Array.isArray(result.suggestedAlternatives) && (
                    <div className="rounded-2xl p-4 border border-toyota-gold/30 bg-toyota-gold/[0.06]">
                      <p className="text-toyota-gold text-[10px] font-bold uppercase mb-1.5 tracking-wider">Suggestion</p>
                      <p className="text-sm text-white/88 leading-relaxed">{result.suggestedAlternatives.reasoning}</p>
                    </div>
                  )}

                  <div className="grid lg:grid-cols-2 gap-4">
                    {radarData.length > 0 && (
                      <div className="rounded-2xl p-4 border border-white/[0.08] bg-black/40 h-60">
                        <p className="text-[10px] font-bold text-white/50 uppercase tracking-[0.15em] mb-3">
                          Profils d&apos;usage
                        </p>
                        <ResponsiveContainer width="100%" height="82%">
                          <RadarChart data={radarData}>
                            <PolarGrid stroke="#2a2a2a" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: "#9CA3AF", fontSize: 10 }} />
                            {vehicles.map((v, i) => (
                              <Radar
                                key={v!.id}
                                name={v!.name.replace("Toyota ", "")}
                                dataKey={v!.id}
                                stroke={CHART_COLORS[i]}
                                fill={CHART_COLORS[i]}
                                fillOpacity={0.18}
                                strokeWidth={2}
                              />
                            ))}
                            <Legend wrapperStyle={{ fontSize: 10, paddingTop: 8 }} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    )}

                    <div className="rounded-2xl p-4 border border-white/[0.08] bg-black/40 h-60">
                      <p className="text-[10px] font-bold text-white/50 uppercase tracking-[0.15em] mb-3">
                        Puissance & consommation
                      </p>
                      <ResponsiveContainer width="100%" height="82%">
                        <BarChart data={barData} barGap={6}>
                          <CartesianGrid stroke="#222" vertical={false} />
                          <XAxis dataKey="name" tick={{ fill: "#9CA3AF", fontSize: 10 }} />
                          <YAxis tick={{ fill: "#666", fontSize: 9 }} width={32} />
                          <Tooltip
                            contentStyle={{
                              background: "#111",
                              border: "1px solid #333",
                              borderRadius: 12,
                              fontSize: 12,
                            }}
                          />
                          <Bar dataKey="Puissance" fill="#EB0A1E" radius={[6, 6, 0, 0]} />
                          <Bar dataKey="Consommation" fill="#C9A84C" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {result?.rows && result.rows.length > 0 && (
                    <div className="rounded-2xl border border-white/[0.08] overflow-hidden bg-black/20">
                      <div className="px-5 py-3.5 bg-white/[0.03] border-b border-white/[0.08] flex items-center justify-between">
                        <p className="text-xs font-bold text-white uppercase tracking-[0.12em]">Fiche comparative</p>
                        <span className="text-[10px] text-white/35">{result.rows.length} critères</span>
                      </div>
                      <div className="divide-y divide-white/[0.06]">
                        {result.rows.map((row) => (
                          <div key={row.label} className="px-5 py-4 hover:bg-white/[0.02] transition-colors">
                            <div className="flex items-center justify-between gap-2 mb-2.5">
                              <span className="text-white text-sm font-semibold">{row.label}</span>
                              {row.winner && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-toyota-gold uppercase bg-toyota-gold/10 px-2 py-0.5 rounded-full">
                                  <Trophy className="h-3 w-3" />
                                  {row.winner}
                                </span>
                              )}
                            </div>
                            {row.whyItMatters && (
                              <p className="text-white/45 text-xs mb-2.5 italic leading-relaxed">{row.whyItMatters}</p>
                            )}
                            <div className="grid gap-2 sm:grid-cols-2">
                              {Object.entries(row.values).map(([id, val]) => {
                                const isWinner = row.winner === id;
                                return (
                                  <div
                                    key={id}
                                    className={cn(
                                      "rounded-xl px-3.5 py-2.5 text-xs border transition-colors",
                                      isWinner
                                        ? "border-toyota-red/50 bg-toyota-red/10 text-white shadow-[inset_0_0_0_1px_rgba(235,10,30,0.15)]"
                                        : "border-white/[0.06] bg-white/[0.02] text-white/80"
                                    )}
                                  >
                                    <span
                                      className="uppercase text-[10px] font-bold tracking-wide"
                                      style={{ color: isWinner ? "#EB0A1E" : "rgba(255,255,255,0.4)" }}
                                    >
                                      {id}
                                    </span>
                                    <p className="font-semibold mt-1 text-sm">{String(val)}</p>
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
            <div className="shrink-0 flex flex-wrap gap-3 px-5 sm:px-7 py-4 border-t border-white/[0.08] bg-black/50 backdrop-blur-sm">
              {configuratorWinner && (
                <Button asChild className="flex-1 min-w-[160px] gap-2 h-11">
                  <a href={`/configurator/${configuratorWinner}`}>
                    Configurer le gagnant
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
              )}
              <Button variant="secondary" className="flex-1 h-11" onClick={clear}>
                Effacer
              </Button>
              <Button className="flex-1 h-11" onClick={() => setDrawerOpen(false)}>
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
  const { selectedIds, drawerOpen, setDrawerOpen, clear } = useCompareStore();

  if (selectedIds.length === 0 || drawerOpen) return null;

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-[10010] flex items-center gap-3 px-5 py-3 rounded-2xl bg-black/95 backdrop-blur-xl border border-white/10 shadow-2xl xl:-translate-x-[calc(50%+90px)]"
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
