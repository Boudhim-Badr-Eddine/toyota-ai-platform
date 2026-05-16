"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Users, CalendarCheck, TrendingUp, Car, Bot, RefreshCw, Loader2, AlertCircle } from "lucide-react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { StatsCard } from "@/components/admin/StatsCard";
import { DataTable, StatusBadge, type ColumnDef } from "@/components/admin/DataTable";
import type { MLPredictionInput, MLPrediction, MLSeason, MLTargetSegment } from "@/types";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface RecentLead {
  id: string;
  name: string;
  email: string;
  vehicleName: string;
  vehicleSlug: string;
  type: string;
  status: string;
  createdAt: string;
}

interface VehicleCount {
  name: string;
  count: number;
}

interface DashboardData {
  stats: {
    totalLeads: number;
    newLeadsToday: number;
    newLeadsMonth: number;
    totalReservations: number;
    pendingReservations: number;
    conversionRate: number;
    topVehicle: string;
  };
  leadsByVehicle: VehicleCount[];
  recentLeads: RecentLead[];
}

// ─── Bar chart (CSS-only) ──────────────────────────────────────────────────────

function LeadsBarChart({ data }: { data: VehicleCount[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="space-y-2.5">
      {data.map(({ name, count }, i) => (
        <div key={name} className="flex items-center gap-3">
          <p className="text-toyota-muted text-xs w-32 truncate shrink-0">{name}</p>
          <div className="flex-1 h-5 bg-white/4 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(count / max) * 100}%` }}
              transition={{ duration: 0.6, delay: i * 0.06, ease: "easeOut" }}
              className="h-full bg-linear-to-r from-toyota-red to-toyota-red/60 rounded-full"
            />
          </div>
          <span className="text-white text-xs font-bold w-6 text-right shrink-0">{count}</span>
        </div>
      ))}
    </div>
  );
}

// ─── ML Marketing Widget ───────────────────────────────────────────────────────

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

const CATEGORY_OPTIONS = [
  "Sport",
  "SUV Familial",
  "Citadine",
  "Compacte Hybride",
  "Berline Confort",
  "Tout-terrain extrême",
  "Pick-up utilitaire",
  "Éco/Tech",
  "SUV Urbain",
  "SUV 7 places",
];

const PRICE_RANGE_OPTIONS = [
  { value: "0-200000", label: "< 200 000 MAD" },
  { value: "200000-350000", label: "200 000 – 350 000 MAD" },
  { value: "350000-550000", label: "350 000 – 550 000 MAD" },
  { value: "550000+", label: "> 550 000 MAD" },
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
      const mlUrl = process.env.NEXT_PUBLIC_APP_URL
        ? `${process.env.NEXT_PUBLIC_APP_URL}/api/ml-predict`
        : "/api/ml-predict";
      const res = await fetch(mlUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error("Service ML indisponible");
      const data = (await res.json()) as MLPrediction;
      setPrediction(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#111111] border border-white/5 rounded-2xl p-5">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/20 flex items-center justify-center">
          <Bot className="h-4 w-4 text-purple-400" />
        </div>
        <div>
          <h3 className="text-white font-bold text-sm leading-tight">Prédiction Marketing ML</h3>
          <p className="text-toyota-muted/50 text-[10px]">Scikit-learn · Railway</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-toyota-muted/50 mb-1">
            Catégorie
          </label>
          <select
            value={input.vehicle_category}
            onChange={(e) => setInput((p) => ({ ...p, vehicle_category: e.target.value }))}
            className="w-full bg-white/4 border border-white/8 text-white text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-purple-500/40"
          >
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c} value={c} className="bg-[#111111]">{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-toyota-muted/50 mb-1">
            Gamme de prix
          </label>
          <select
            value={input.price_range}
            onChange={(e) => setInput((p) => ({ ...p, price_range: e.target.value }))}
            className="w-full bg-white/4 border border-white/8 text-white text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-purple-500/40"
          >
            {PRICE_RANGE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value} className="bg-[#111111]">{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-toyota-muted/50 mb-1">
            Saison
          </label>
          <select
            value={input.season}
            onChange={(e) => setInput((p) => ({ ...p, season: e.target.value as MLSeason }))}
            className="w-full bg-white/4 border border-white/8 text-white text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-purple-500/40"
          >
            {SEASON_OPTIONS.map((o) => (
              <option key={o.value} value={o.value} className="bg-[#111111]">{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-toyota-muted/50 mb-1">
            Segment cible
          </label>
          <select
            value={input.target_segment}
            onChange={(e) => setInput((p) => ({ ...p, target_segment: e.target.value as MLTargetSegment }))}
            className="w-full bg-white/4 border border-white/8 text-white text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-purple-500/40"
          >
            {SEGMENT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value} className="bg-[#111111]">{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={predict}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-colors mb-4"
      >
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
        Prédire la campagne
      </button>

      {error && (
        <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5 text-xs text-red-400 mb-3">
          <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {prediction && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/3 border border-white/8 rounded-xl p-4 space-y-2.5"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-white font-bold text-sm">{prediction.campaign_type}</p>
              <p className="text-toyota-muted/60 text-xs">{prediction.channel}</p>
            </div>
            <div className="text-right">
              <p className="text-green-400 font-black text-lg leading-none">×{prediction.predicted_roi}</p>
              <p className="text-toyota-muted/50 text-[10px]">ROI prédit</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Budget", value: `${prediction.budget_allocation}%` },
              { label: "Thème", value: prediction.message_theme },
              { label: "Confiance", value: `${Math.round(prediction.confidence * 100)}%` },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/3 rounded-lg p-2 text-center">
                <p className="text-toyota-muted/50 text-[9px] uppercase tracking-wider">{label}</p>
                <p className="text-white text-xs font-bold mt-0.5 truncate">{value}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ─── Column defs for recent leads table ───────────────────────────────────────

const recentLeadColumns: ColumnDef<RecentLead>[] = [
  {
    key: "name",
    header: "Client",
    render: (row) => <span className="text-white font-medium">{row.name}</span>,
  },
  {
    key: "email",
    header: "Email",
    render: (row) => <span className="text-toyota-muted/80 text-xs">{row.email}</span>,
  },
  {
    key: "vehicleName",
    header: "Véhicule",
    render: (row) => (
      <Link
        href={`/configurator/${row.vehicleSlug}`}
        className="text-toyota-red hover:underline text-xs font-semibold"
      >
        {row.vehicleName}
      </Link>
    ),
  },
  {
    key: "type",
    header: "Type",
    render: (row) => <StatusBadge status={row.type} />,
  },
  {
    key: "status",
    header: "Statut",
    render: (row) => <StatusBadge status={row.status} />,
  },
  {
    key: "createdAt",
    header: "Date",
    sortable: true,
    render: (row) => (
      <span className="text-toyota-muted/60 text-xs">
        {new Date(row.createdAt).toLocaleDateString("fr-MA", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}
      </span>
    ),
  },
];

// ─── DashboardClient ──────────────────────────────────────────────────────────

interface DashboardClientProps {
  data: DashboardData;
  adminName: string;
}

export function DashboardClient({ data, adminName }: DashboardClientProps) {
  const { stats, leadsByVehicle, recentLeads } = data;

  return (
    <div className="min-h-screen bg-toyota-dark flex">
      <AdminSidebar />

      {/* Main content — offset by sidebar width on desktop */}
      <main className="flex-1 lg:ml-60 p-6 lg:p-8 pt-16 lg:pt-8 min-w-0">
        {/* ── Page header ────────────────────────────────────────────────── */}
        <div className="mb-8">
          <p className="text-toyota-muted text-sm">Bienvenue,</p>
          <h1 className="text-white text-3xl font-black tracking-tight">{adminName}</h1>
          <p className="text-toyota-muted/50 text-xs mt-1">
            {new Date().toLocaleDateString("fr-MA", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {/* ── Stats row ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Total Leads"
            value={stats.totalLeads}
            change={stats.newLeadsToday > 0 ? stats.newLeadsToday : undefined}
            changeLabel={`+${stats.newLeadsToday} aujourd'hui`}
            icon={<Users className="h-5 w-5" />}
            variant="leads"
            index={0}
          />
          <StatsCard
            title="Réservations"
            value={stats.totalReservations}
            change={stats.pendingReservations}
            changeLabel={`${stats.pendingReservations} en attente`}
            icon={<CalendarCheck className="h-5 w-5" />}
            variant="reservations"
            index={1}
          />
          <StatsCard
            title="Taux de conversion"
            value={`${stats.conversionRate}%`}
            icon={<TrendingUp className="h-5 w-5" />}
            variant="conversion"
            index={2}
          />
          <StatsCard
            title="Modèle populaire"
            value={stats.topVehicle}
            icon={<Car className="h-5 w-5" />}
            variant="vehicles"
            index={3}
          />
        </div>

        {/* ── Middle row: chart + ML widget ──────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
          {/* Bar chart — 2/3 width */}
          <div className="xl:col-span-2 bg-[#111111] border border-white/5 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-white font-bold text-sm">Leads par modèle</h3>
                <p className="text-toyota-muted/50 text-xs">{stats.newLeadsMonth} ce mois</p>
              </div>
              <Link
                href="/leads"
                className="text-toyota-red text-xs font-semibold hover:underline"
              >
                Voir tous →
              </Link>
            </div>
            {leadsByVehicle.length > 0 ? (
              <LeadsBarChart data={leadsByVehicle} />
            ) : (
              <p className="text-toyota-muted/40 text-sm text-center py-8">
                Aucun lead pour l&apos;instant
              </p>
            )}
          </div>

          {/* ML widget — 1/3 width */}
          <div className="xl:col-span-1">
            <MLWidget />
          </div>
        </div>

        {/* ── Recent leads table ──────────────────────────────────────────── */}
        <div className="bg-[#111111] border border-white/5 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-white font-bold text-sm">Leads récents</h3>
              <p className="text-toyota-muted/50 text-xs">Les 10 dernières demandes</p>
            </div>
            <Link
              href="/leads"
              className="text-toyota-red text-xs font-semibold hover:underline"
            >
              Voir tous →
            </Link>
          </div>
          <DataTable
            columns={recentLeadColumns as unknown as import("@/components/admin/DataTable").ColumnDef<Record<string, unknown>>[]}
            data={recentLeads as unknown as Record<string, unknown>[]}
            pageSize={10}
            searchable={false}
            emptyMessage="Aucun lead pour l'instant"
          />
        </div>
      </main>
    </div>
  );
}
