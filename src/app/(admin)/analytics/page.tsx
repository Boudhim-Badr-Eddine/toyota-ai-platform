"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  BarChart3,
  RefreshCw,
  TrendingUp,
  Users,
  CalendarCheck,
  Loader2,
} from "lucide-react";
import { StatsCard } from "@/components/admin/StatsCard";
import { StatusBadge } from "@/components/admin/DataTable";
import { cn } from "@/lib/utils";

type Range = "7d" | "30d" | "all";

interface AnalyticsData {
  kpis: {
    totalLeads: number;
    leadsToday: number;
    pendingReservations: number;
    conversionRate: number;
  };
  timeline: Array<{ date: string; count: number }>;
  leadsByVehicle: Array<{ name: string; count: number }>;
  leadsByType: Array<{ type: string; count: number }>;
  leadsByDealership: Array<{ city: string; count: number }>;
  funnel: {
    new: number;
    contacted: number;
    converted: number;
    lost: number;
  };
  recentLeads: Array<{
    id: string;
    name: string;
    email: string;
    type: string;
    status: string;
    vehicle: string;
    dealership: string | null;
    createdAt: string;
  }>;
}

export default function AnalyticsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [range, setRange] = useState<Range>("30d");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/analytics?range=${range}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as { data: AnalyticsData };
      setData(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    if (status === "authenticated") fetchAnalytics();
  }, [status, fetchAnalytics]);

  if (status === "loading" || (loading && !data)) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-toyota-red" />
      </div>
    );
  }

  const maxTimeline = Math.max(...(data?.timeline.map((t) => t.count) ?? [1]), 1);
  const maxVehicle = Math.max(...(data?.leadsByVehicle.map((v) => v.count) ?? [1]), 1);
  const funnelTotal = data
    ? data.funnel.new + data.funnel.contacted + data.funnel.converted + data.funnel.lost
    : 1;

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="h-5 w-5 text-toyota-red" />
            <h1 className="text-2xl font-black text-white">Analytics</h1>
          </div>
          <p className="text-toyota-muted/50 text-sm">Performance commerciale et tendances leads</p>
        </div>
        <div className="flex items-center gap-2">
          {(["7d", "30d", "all"] as Range[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors",
                range === r
                  ? "bg-toyota-red border-toyota-red text-white"
                  : "border-white/10 text-toyota-muted hover:text-white"
              )}
            >
              {r === "7d" ? "7 jours" : r === "30d" ? "30 jours" : "Tout"}
            </button>
          ))}
          <button
            type="button"
            onClick={fetchAnalytics}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-xs font-semibold text-white/70 hover:text-white disabled:opacity-50"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {data && (
        <>
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            <StatsCard
              title="Leads (période)"
              value={data.kpis.totalLeads}
              changeLabel={`+${data.kpis.leadsToday} aujourd'hui`}
              icon={<Users className="h-4 w-4" />}
              variant="leads"
              index={0}
            />
            <StatsCard
              title="Conversion"
              value={`${data.kpis.conversionRate}%`}
              icon={<TrendingUp className="h-4 w-4" />}
              variant="conversion"
              index={1}
            />
            <StatsCard
              title="Réservations en attente"
              value={data.kpis.pendingReservations}
              icon={<CalendarCheck className="h-4 w-4" />}
              variant="reservations"
              index={2}
            />
            <StatsCard
              title="Types de demande"
              value={data.leadsByType.length}
              changeLabel={`${data.leadsByDealership.length} concessions actives`}
              icon={<BarChart3 className="h-4 w-4" />}
              variant="vehicles"
              index={3}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div className="toyota-panel p-5">
              <h3 className="text-sm font-bold text-white mb-4">Timeline leads</h3>
              {data.timeline.length === 0 ? (
                <p className="text-white/30 text-sm text-center py-8">Aucune donnée</p>
              ) : (
                <div className="flex items-end gap-1 h-40">
                  {data.timeline.slice(-14).map((point) => (
                    <div key={point.date} className="flex-1 flex flex-col items-center gap-1">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${(point.count / maxTimeline) * 100}%` }}
                        className="w-full min-h-[4px] rounded-t bg-toyota-red/80"
                        title={`${point.date}: ${point.count}`}
                      />
                      <span className="text-[8px] text-white/25 rotate-[-45deg] origin-top-left whitespace-nowrap">
                        {point.date.slice(5)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="toyota-panel p-5">
              <h3 className="text-sm font-bold text-white mb-4">Funnel de conversion</h3>
              <div className="space-y-3">
                {(
                  [
                    ["new", "Nouveau", "bg-blue-500"],
                    ["contacted", "Contacté", "bg-yellow-500"],
                    ["converted", "Converti", "bg-emerald-500"],
                    ["lost", "Perdu", "bg-red-500"],
                  ] as const
                ).map(([key, label, color]) => {
                  const count = data.funnel[key];
                  const pct = Math.round((count / funnelTotal) * 100);
                  return (
                    <div key={key}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-white/70">{label}</span>
                        <span className="text-white font-semibold">{count} ({pct}%)</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                        <div className={cn("h-full rounded-full", color)} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div className="toyota-panel p-5">
              <h3 className="text-sm font-bold text-white mb-4">Leads par véhicule</h3>
              <div className="space-y-3">
                {data.leadsByVehicle.slice(0, 8).map((v) => (
                  <div key={v.name}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white/70 truncate">{v.name}</span>
                      <span className="text-white font-semibold shrink-0 ml-2">{v.count}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-linear-to-r from-toyota-red to-toyota-red/40"
                        style={{ width: `${(v.count / maxVehicle) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="toyota-panel p-5">
              <h3 className="text-sm font-bold text-white mb-4">Leads récents</h3>
              <ul className="space-y-2">
                {data.recentLeads.map((lead) => (
                  <li
                    key={lead.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-white/[0.06] bg-[#0A0A0A] px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="text-white text-xs font-semibold truncate">{lead.name}</p>
                      <p className="text-white/35 text-[10px] truncate">
                        {lead.vehicle}
                        {lead.dealership ? ` · ${lead.dealership}` : ""}
                      </p>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <StatusBadge status={lead.type} />
                      <StatusBadge status={lead.status} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
