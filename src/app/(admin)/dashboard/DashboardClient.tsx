"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Users,
  CalendarCheck,
  TrendingUp,
  Banknote,
  Bot,
  RefreshCw,
  Loader2,
  Plus,
} from "lucide-react";
import { StatsCard } from "@/components/admin/StatsCard";
import { VEHICLES_DATA } from "@/data/vehicles";
import type { MLPredictionInput, MLPrediction, MLSeason, MLTargetSegment } from "@/types";

interface RecentReservation {
  id: string;
  clientName: string;
  clientEmail: string;
  vehicleName: string;
  vehicleCategory: string;
  vehicleSlug: string;
  date: string;
  status: string;
}

interface VehicleCount {
  name: string;
  count: number;
}

function pctChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

interface DashboardData {
  stats: {
    totalLeads: number;
    newLeadsToday: number;
    newLeadsMonth: number;
    previousMonthLeads: number;
    totalReservations: number;
    pendingReservations: number;
    monthReservations: number;
    previousMonthReservations: number;
    convertedLeads: number;
    previousMonthConverted: number;
    conversionRate: number;
    topVehicle: string;
    estimatedRevenueM: number;
  };
  leadsByVehicle: VehicleCount[];
  recentReservations: RecentReservation[];
}

const SHOWROOM_MODELS = VEHICLES_DATA.slice(0, 4);

const SEASON_OPTIONS: { value: MLSeason; label: string }[] = [
  { value: "spring", label: "Printemps" },
  { value: "summer", label: "Été" },
  { value: "autumn", label: "Automne" },
  { value: "winter", label: "Hiver" },
];

const SEGMENT_OPTIONS: { value: MLTargetSegment; label: string }[] = [
  { value: "families", label: "Familles" },
  { value: "young", label: "Jeunes" },
  { value: "professional", label: "Professionnels" },
  { value: "adventure", label: "Aventuriers" },
];

function currentSeason(): MLSeason {
  const m = new Date().getMonth();
  if (m >= 2 && m <= 4) return "spring";
  if (m >= 5 && m <= 7) return "summer";
  if (m >= 8 && m <= 10) return "autumn";
  return "winter";
}

function MLWidget() {
  const [input, setInput] = useState<MLPredictionInput>({
    vehicle_category: "SUV Familial",
    price_range: "200000-350000",
    season: currentSeason(),
    target_segment: "families",
  });
  const [prediction, setPrediction] = useState<MLPrediction | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const predict = async () => {
    setLoading(true);
    setError("");
    setPrediction(null);
    try {
      const res = await fetch("/api/ml-predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = (await res.json()) as MLPrediction & { error?: string; source?: string };
      if (!res.ok) throw new Error(data.error ?? "Service ML indisponible");
      setPrediction(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="toyota-panel p-5">
      <div className="mb-4 flex items-center gap-2">
        <Bot className="h-4 w-4 text-purple-400" />
        <h3 className="text-sm font-bold text-white">Prédiction Marketing ML</h3>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <select
          value={input.season}
          onChange={(e) => setInput((p) => ({ ...p, season: e.target.value as MLSeason }))}
          className="rounded-lg border border-white/10 bg-[#0A0A0A] px-2 py-2 text-xs text-white"
        >
          {SEASON_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <select
          value={input.target_segment}
          onChange={(e) => setInput((p) => ({ ...p, target_segment: e.target.value as MLTargetSegment }))}
          className="rounded-lg border border-white/10 bg-[#0A0A0A] px-2 py-2 text-xs text-white"
        >
          {SEGMENT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
      <button
        type="button"
        onClick={predict}
        disabled={loading}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-purple-600 py-2 text-xs font-bold text-white disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
        Prédire
      </button>
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
      {prediction && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 rounded-lg border border-white/[0.08] bg-[#0A0A0A] p-4 space-y-3"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-white">{prediction.campaign_type}</p>
              <p className="text-xs text-white/40">{prediction.channel}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-black text-emerald-400">×{prediction.predicted_roi}</p>
              <p className="text-[10px] text-white/30">ROI prédit</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-md bg-white/[0.04] p-2">
              <p className="text-[9px] uppercase tracking-wider text-white/30">Budget</p>
              <p className="text-xs font-bold text-white">{prediction.budget_allocation}%</p>
            </div>
            <div className="rounded-md bg-white/[0.04] p-2">
              <p className="text-[9px] uppercase tracking-wider text-white/30">Thème</p>
              <p className="text-xs font-bold text-white truncate">{prediction.message_theme}</p>
            </div>
            <div className="rounded-md bg-white/[0.04] p-2">
              <p className="text-[9px] uppercase tracking-wider text-white/30">Confiance</p>
              <p className="text-xs font-bold text-white">{Math.round(prediction.confidence * 100)}%</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function categoryBadge(category: string) {
  const upper = category.toUpperCase();
  if (upper.includes("SPORT")) return "border-toyota-red/40 text-toyota-red";
  if (upper.includes("HYBRID")) return "border-emerald-500/40 text-emerald-400";
  return "border-white/20 text-white/60";
}

interface DashboardClientProps {
  data: DashboardData;
  adminName?: string;
  dbError?: string | null;
}

export function DashboardClient({ data, dbError }: DashboardClientProps) {
  const { stats, leadsByVehicle, recentReservations } = data;
  const leadTrend = pctChange(stats.newLeadsMonth, stats.previousMonthLeads);
  const reservationTrend = pctChange(stats.monthReservations, stats.previousMonthReservations);
  const prevConversionRate =
    stats.previousMonthLeads > 0
      ? Math.round((stats.previousMonthConverted / stats.previousMonthLeads) * 100)
      : 0;
  const conversionTrend = stats.conversionRate - prevConversionRate;
  const revenueTrend = Math.round((leadTrend + conversionTrend) / 2);

  const maxLeadCount = Math.max(...leadsByVehicle.map((d) => d.count), 1);

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {dbError && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          Base de données indisponible — connectez Supabase puis exécutez{" "}
          <code className="text-amber-100">npm run db:setup</code>. Les comptes démo admin fonctionnent
          sans DB pour la connexion.
        </div>
      )}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatsCard
          title="Total Leads"
          value={stats.totalLeads.toLocaleString("fr-MA")}
          change={leadTrend}
          changeLabel={`+${stats.newLeadsToday} aujourd'hui`}
          icon={<Users className="h-4 w-4" />}
          variant="leads"
          index={0}
        />
        <StatsCard
          title="Taux de conversion"
          value={`${stats.conversionRate}%`}
          change={conversionTrend}
          changeLabel={`${stats.convertedLeads} convertis`}
          icon={<TrendingUp className="h-4 w-4" />}
          variant="conversion"
          index={1}
        />
        <StatsCard
          title="Réservations"
          value={stats.totalReservations}
          change={reservationTrend}
          changeLabel={`${stats.pendingReservations} en attente`}
          icon={<CalendarCheck className="h-4 w-4" />}
          variant="reservations"
          index={2}
        />
        <StatsCard
          title="Revenu estimé"
          value={`${stats.estimatedRevenueM}M DH`}
          change={revenueTrend}
          changeLabel="vs mois précédent"
          icon={<Banknote className="h-4 w-4" />}
          variant="revenue"
          index={3}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 toyota-panel overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
            <div>
              <h3 className="text-sm font-bold text-white">Réservations récentes</h3>
              <p className="text-[10px] uppercase tracking-wider text-white/30">Activité showroom</p>
            </div>
            <Link href="/reservations" className="text-xs font-bold text-toyota-red hover:underline">
              Voir tout →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[540px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-[10px] font-bold uppercase tracking-wider text-white/30">
                  <th className="px-5 py-3">Client</th>
                  <th className="px-5 py-3">Modèle / Gamme</th>
                  <th className="px-5 py-3">Date & Heure</th>
                </tr>
              </thead>
              <tbody>
                {recentReservations.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-5 py-10 text-center text-white/30">
                      Aucune réservation pour l&apos;instant
                    </td>
                  </tr>
                ) : (
                  recentReservations.map((row) => (
                    <tr key={row.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-white">{row.clientName}</p>
                        <p className="text-xs text-white/35">{row.clientEmail}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-block rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${categoryBadge(row.vehicleCategory)}`}
                        >
                          {row.vehicleName.replace("Toyota ", "").toUpperCase()}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-white/50">
                        {new Date(row.date).toLocaleString("fr-MA", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {recentReservations.length > 0 && (
            <div className="border-t border-white/[0.06] px-5 py-3">
              <Link
                href="/reservations"
                className="text-[10px] font-bold uppercase tracking-wider text-white/30 hover:text-toyota-red"
              >
                Voir les {Math.max(stats.totalReservations - recentReservations.length, 0)} autres réservations
              </Link>
            </div>
          )}
        </div>

        <div className="relative toyota-panel p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Showroom Elite</h3>
            <span className="text-[9px] font-bold uppercase tracking-wider text-toyota-red">Top modèles</span>
          </div>

          <div className="mb-4 overflow-hidden rounded-lg border border-white/[0.08]">
            <div className="relative h-32">
              <Image
                src={VEHICLES_DATA[0]?.imageUrl ?? "/images/vehicles/supra.jpg"}
                alt="GR Supra"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-3 left-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-toyota-red">GR Supra</p>
                <p className="text-xs text-white/60">Performance légendaire</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {SHOWROOM_MODELS.slice(1).map((v, i) => {
              const leadCount = leadsByVehicle.find((l) => l.name === v.name)?.count ?? 0;
              const pct = Math.round((leadCount / maxLeadCount) * 100) || 20 + i * 15;
              return (
                <div key={v.id}>
                  <div className="mb-1.5 flex items-center gap-3">
                    <div className="relative h-10 w-14 shrink-0 overflow-hidden rounded-md">
                      <Image src={v.imageUrl} alt={v.name} fill className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-white">{v.name}</p>
                      <p className="text-[10px] text-white/30">{v.category}</p>
                    </div>
                    <span className="text-xs font-bold text-white/50">{pct}%</span>
                  </div>
                  <div className="h-1 overflow-hidden rounded-full bg-white/[0.06]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: i * 0.1 }}
                      className="h-full rounded-full bg-linear-to-r from-toyota-red to-toyota-red/40"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <Link
            href="/vehicles"
            className="mt-5 block w-full rounded-md border border-white/10 py-2.5 text-center text-[10px] font-bold uppercase tracking-wider text-white/50 transition-colors hover:border-white/20 hover:text-white"
          >
            Rapport de stock complet
          </Link>

          <button
            type="button"
            className="absolute bottom-5 right-5 flex h-11 w-11 items-center justify-center rounded-full bg-toyota-red text-white shadow-lg shadow-toyota-red/40"
            aria-label="Ajouter"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>

      <MLWidget />
    </div>
  );
}
