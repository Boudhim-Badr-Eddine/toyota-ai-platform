"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { DataTable, StatusBadge, type ColumnDef } from "@/components/admin/DataTable";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface ReservationLead {
  firstName: string;
  lastName: string;
  email: string;
}

interface ReservationVehicle {
  name: string;
  slug: string;
}

interface Reservation extends Record<string, unknown> {
  id: string;
  date: string;
  type: string;
  status: string;
  notes: string | null;
  createdAt: string;
  vehicle: ReservationVehicle;
  lead: ReservationLead;
}

interface ReservationsResponse {
  data: Reservation[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ─── Action buttons ────────────────────────────────────────────────────────────

function ActionButtons({
  reservation,
  onUpdate,
}: {
  reservation: Reservation;
  onUpdate: (id: string, status: string) => Promise<void>;
}) {
  const [busy, setBusy] = useState<string | null>(null);

  const handle = async (status: string) => {
    setBusy(status);
    try {
      await onUpdate(reservation.id, status);
    } finally {
      setBusy(null);
    }
  };

  const isPending = reservation.status === "pending";
  const isConfirmed = reservation.status === "confirmed";

  if (!isPending && !isConfirmed) {
    return <StatusBadge status={reservation.status} />;
  }

  return (
    <div className="flex items-center gap-1.5">
      {isPending && (
        <button
          onClick={() => handle("confirmed")}
          disabled={busy !== null}
          className={cn(
            "flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors",
            "bg-green-500/15 text-green-400 border border-green-500/20 hover:bg-green-500/25",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {busy === "confirmed" ? (
            <div className="h-3 w-3 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <CheckCircle className="h-3 w-3" />
          )}
          Confirmer
        </button>
      )}
      {(isPending || isConfirmed) && (
        <button
          onClick={() => handle("cancelled")}
          disabled={busy !== null}
          className={cn(
            "flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors",
            "bg-red-500/15 text-red-400 border border-red-500/20 hover:bg-red-500/25",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {busy === "cancelled" ? (
            <div className="h-3 w-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <XCircle className="h-3 w-3" />
          )}
          Annuler
        </button>
      )}
    </div>
  );
}

// ─── ReservationsPage ──────────────────────────────────────────────────────────

export default function ReservationsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  const fetchReservations = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/reservations?limit=100");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as ReservationsResponse;
      setReservations(json.data);
      setTotal(json.pagination.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") fetchReservations();
  }, [status, fetchReservations]);

  const updateStatus = async (id: string, newStatus: string) => {
    const res = await fetch("/api/reservations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus }),
    });
    if (!res.ok) throw new Error("Mise à jour échouée");
    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
  };

  const columns: ColumnDef<Reservation>[] = [
    {
      key: "createdAt",
      header: "Date réservation",
      sortable: true,
      render: (row) => (
        <span className="text-toyota-muted/60 text-xs whitespace-nowrap">
          {new Date(row.createdAt).toLocaleDateString("fr-MA", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      key: "lead",
      header: "Client",
      render: (row) => (
        <div>
          <p className="text-white font-semibold text-sm">
            {row.lead.firstName} {row.lead.lastName}
          </p>
          <p className="text-toyota-muted/50 text-xs">{row.lead.email}</p>
        </div>
      ),
    },
    {
      key: "vehicleId",
      header: "Véhicule",
      render: (row) => (
        <span className="text-white text-xs font-medium">{row.vehicle.name}</span>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (row) => <StatusBadge status={row.type} />,
    },
    {
      key: "date",
      header: "Date RDV",
      sortable: true,
      render: (row) => {
        const d = new Date(row.date);
        const past = d < new Date();
        return (
          <span className={cn("text-xs font-semibold whitespace-nowrap", past ? "text-toyota-muted/40" : "text-toyota-gold")}>
            {d.toLocaleDateString("fr-MA", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>
        );
      },
    },
    {
      key: "status",
      header: "Statut",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => <ActionButtons reservation={row} onUpdate={updateStatus} />,
    },
  ];

  if (status === "loading" || (loading && reservations.length === 0)) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
          <div className="flex flex-col items-center gap-3 text-toyota-muted">
            <div className="w-8 h-8 border-2 border-toyota-red border-t-transparent rounded-full animate-spin" />
            <p className="text-sm">Chargement des réservations…</p>
          </div>
      </div>
    );
  }

  // Status summary counts
  const pending = reservations.filter((r) => r.status === "pending").length;
  const confirmed = reservations.filter((r) => r.status === "confirmed").length;
  const cancelled = reservations.filter((r) => r.status === "cancelled").length;
  const completed = reservations.filter((r) => r.status === "completed").length;

  return (
    <div className="p-6 lg:p-8 min-w-0">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 gap-4">
          <div>
            <h1 className="text-white text-3xl font-black tracking-tight">Réservations</h1>
            <p className="text-toyota-muted/50 text-sm mt-1">
              <span className="text-white font-semibold">{total}</span> réservations au total
            </p>
          </div>
          <button
            onClick={fetchReservations}
            disabled={loading}
            className="flex items-center gap-1.5 mt-1 px-3.5 py-2 bg-white/4 border border-white/8 text-white text-xs font-semibold rounded-xl hover:bg-white/8 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
            Actualiser
          </button>
        </div>

        {/* Summary pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { label: "En attente", count: pending, color: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20" },
            { label: "Confirmées", count: confirmed, color: "bg-green-500/15 text-green-400 border-green-500/20" },
            { label: "Annulées", count: cancelled, color: "bg-red-500/15 text-red-400 border-red-500/20" },
            { label: "Terminées", count: completed, color: "bg-purple-500/15 text-purple-400 border-purple-500/20" },
          ].map(({ label, count, color }) => (
            <span
              key={label}
              className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border", color)}
            >
              <span className="font-black text-base leading-none">{count}</span>
              {label}
            </span>
          ))}
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3 mb-6"
          >
            {error}
          </motion.div>
        )}

        {/* Table */}
        <div className="bg-[#111111] border border-white/5 rounded-2xl p-5">
          <DataTable
            columns={columns}
            data={reservations}
            pageSize={20}
            searchPlaceholder="Chercher une réservation…"
            emptyMessage="Aucune réservation trouvée"
          />
        </div>
    </div>
  );
}
