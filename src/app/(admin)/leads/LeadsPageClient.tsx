"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Download, RefreshCw, X, MessageSquare, Settings2 } from "lucide-react";
import { DataTable, StatusBadge, type ColumnDef } from "@/components/admin/DataTable";
import { VEHICLES_DATA } from "@/data/vehicles";
import { cn } from "@/lib/utils";

interface Lead extends Record<string, unknown> {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  vehicleId: string;
  type: string;
  status: string;
  createdAt: string;
  configuration: {
    selectedColor?: { name: string; hex?: string } | null;
    selectedWheel?: { name: string; size: string } | null;
    selectedInterior?: { name: string; material?: string } | null;
  } | null;
  chatHistory: Array<{
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: string;
  }>;
  vehicle: {
    id: string;
    name: string;
    slug: string;
  };
}

interface LeadsResponse {
  data: Lead[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const VEHICLE_NAME: Record<string, string> = Object.fromEntries(
  VEHICLES_DATA.map((v) => [v.id, v.name])
);

function resolveVehicleName(vehicleId: string, vehicle?: { name: string }): string {
  return vehicle?.name ?? VEHICLE_NAME[vehicleId] ?? vehicleId;
}

const LEAD_STATUSES = [
  { value: "new", label: "Nouveau" },
  { value: "contacted", label: "Contacté" },
  { value: "converted", label: "Converti" },
  { value: "lost", label: "Perdu" },
] as const;

function StatusSelect({
  leadId,
  current,
  onUpdate,
}: {
  leadId: string;
  current: string;
  onUpdate: (id: string, status: string) => Promise<void>;
}) {
  const [value, setValue] = useState(current);
  const [busy, setBusy] = useState(false);

  const handleChange = async (next: string) => {
    setValue(next);
    setBusy(true);
    try {
      await onUpdate(leadId, next);
    } finally {
      setBusy(false);
    }
  };

  return (
    <select
      value={value}
      onChange={(e) => handleChange(e.target.value)}
      onClick={(e) => e.stopPropagation()}
      disabled={busy}
      className={cn(
        "bg-white/4 border border-white/8 text-white text-[11px] font-semibold rounded-lg px-2 py-1.5 focus:outline-none focus:border-toyota-red/40 transition-colors",
        busy && "opacity-50 cursor-not-allowed"
      )}
    >
      {LEAD_STATUSES.map((s) => (
        <option key={s.value} value={s.value} className="bg-[#111111]">
          {s.label}
        </option>
      ))}
    </select>
  );
}

function exportCSV(leads: Lead[]) {
  const headers = ["ID", "Prénom", "Nom", "Email", "Téléphone", "Véhicule", "Type", "Statut", "Date"];
  const rows = leads.map((l) => [
    l.id,
    l.firstName,
    l.lastName,
    l.email,
    l.phone ?? "",
    resolveVehicleName(l.vehicleId, l.vehicle),
    l.type,
    l.status,
    new Date(l.createdAt).toLocaleDateString("fr-MA"),
  ]);
  const csv = [headers, ...rows]
    .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `leads-toyota-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function LeadDetailDrawer({
  lead,
  onClose,
}: {
  lead: Lead;
  onClose: () => void;
}) {
  const config = lead.configuration;
  const messages = lead.chatHistory ?? [];

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.aside
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
        className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-[#111111] border-l border-white/10 overflow-y-auto"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#111111] px-5 py-4">
          <div>
            <p className="text-white font-bold">
              {lead.firstName} {lead.lastName}
            </p>
            <p className="text-toyota-muted text-xs">{lead.email}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/50 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Settings2 className="h-4 w-4 text-toyota-red" />
              <h3 className="text-sm font-bold text-white">Configuration</h3>
            </div>
            <div className="rounded-xl border border-white/5 bg-[#0A0A0A] p-4 space-y-2 text-sm">
              <p className="text-white/70">
                <span className="text-toyota-muted">Véhicule :</span>{" "}
                {resolveVehicleName(lead.vehicleId, lead.vehicle)}
              </p>
              {config?.selectedColor && (
                <p className="text-white/70 flex items-center gap-2">
                  <span className="text-toyota-muted">Couleur :</span>
                  <span
                    className="inline-block h-4 w-4 rounded-full border border-white/20"
                    style={{ backgroundColor: config.selectedColor.hex ?? "#888" }}
                  />
                  {config.selectedColor.name}
                </p>
              )}
              {config?.selectedWheel && (
                <p className="text-white/70">
                  <span className="text-toyota-muted">Jantes :</span>{" "}
                  {config.selectedWheel.name} ({config.selectedWheel.size})
                </p>
              )}
              {config?.selectedInterior && (
                <p className="text-white/70">
                  <span className="text-toyota-muted">Intérieur :</span>{" "}
                  {config.selectedInterior.name}
                </p>
              )}
              {!config?.selectedColor && !config?.selectedWheel && !config?.selectedInterior && (
                <p className="text-toyota-muted/50 text-xs">Aucune configuration détaillée</p>
              )}
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="h-4 w-4 text-toyota-red" />
              <h3 className="text-sm font-bold text-white">
                Historique chat ({messages.length})
              </h3>
            </div>
            {messages.length === 0 ? (
              <p className="text-toyota-muted/50 text-xs">Aucun échange enregistré</p>
            ) : (
              <ul className="space-y-2 max-h-80 overflow-y-auto">
                {messages.map((msg) => (
                  <li
                    key={msg.id}
                    className={cn(
                      "rounded-lg px-3 py-2 text-xs leading-relaxed",
                      msg.role === "user"
                        ? "bg-toyota-red/10 text-white/90 ml-4"
                        : "bg-white/5 text-white/70 mr-4"
                    )}
                  >
                    <span className="text-[9px] font-bold uppercase tracking-wider text-toyota-muted/50 block mb-0.5">
                      {msg.role === "user" ? "Client" : "IA"}
                    </span>
                    {msg.content}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </motion.aside>
    </>
  );
}

export function LeadsPageClient() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q") ?? "";
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/leads?limit=100");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as LeadsResponse;
      setLeads(json.data);
      setTotal(json.pagination.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") fetchLeads();
  }, [status, fetchLeads]);

  const updateLeadStatus = async (id: string, newStatus: string) => {
    const res = await fetch("/api/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus }),
    });
    if (!res.ok) throw new Error("Mise à jour échouée");
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l)));
  };

  const columns: ColumnDef<Lead>[] = [
    {
      key: "createdAt",
      header: "Date",
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
      key: "firstName",
      header: "Nom",
      sortable: true,
      render: (row) => (
        <div>
          <p className="text-white font-semibold text-sm">{row.firstName} {row.lastName}</p>
          <p className="text-toyota-muted/50 text-xs">{row.email}</p>
        </div>
      ),
    },
    {
      key: "email",
      header: "Email",
      className: "hidden lg:table-cell",
      render: (row) => (
        <a
          href={`mailto:${row.email}`}
          onClick={(e) => e.stopPropagation()}
          className="text-toyota-red hover:underline text-xs"
        >
          {row.email}
        </a>
      ),
    },
    {
      key: "vehicleId",
      header: "Véhicule",
      sortable: true,
      render: (row) => (
        <span className="text-white text-xs font-medium">
          {resolveVehicleName(row.vehicleId, row.vehicle)}
        </span>
      ),
    },
    {
      key: "configuration",
      header: "Config",
      render: (row) => {
        const config = row.configuration;
        const parts: string[] = [];
        if (config?.selectedColor?.name) parts.push(config.selectedColor.name);
        if (config?.selectedWheel?.size) parts.push(config.selectedWheel.size);
        return (
          <span className="text-toyota-muted/60 text-xs">
            {parts.length > 0 ? parts.join(" · ") : "—"}
          </span>
        );
      },
    },
    {
      key: "type",
      header: "Type",
      render: (row) => <StatusBadge status={row.type} />,
    },
    {
      key: "status",
      header: "Statut",
      render: (row) => (
        <StatusSelect
          leadId={row.id}
          current={row.status}
          onUpdate={updateLeadStatus}
        />
      ),
    },
  ];

  if (status === "loading" || (loading && leads.length === 0)) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3 text-toyota-muted">
          <div className="w-8 h-8 border-2 border-toyota-red border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Chargement des leads…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 min-w-0">
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="text-white text-3xl font-black tracking-tight">Leads</h1>
          <p className="text-toyota-muted/50 text-sm mt-1">
            <span className="text-white font-semibold">{total}</span> demandes au total
          </p>
        </div>
        <div className="flex items-center gap-2.5 mt-1">
          <button
            onClick={fetchLeads}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white/4 border border-white/8 text-white text-xs font-semibold rounded-xl hover:bg-white/8 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
            Actualiser
          </button>
          <button
            onClick={() => exportCSV(leads)}
            disabled={leads.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-toyota-red hover:bg-toyota-red/80 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </button>
        </div>
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

      <div className="bg-[#111111] border border-white/5 rounded-2xl p-5">
        <DataTable
          columns={columns}
          data={leads}
          pageSize={20}
          defaultSearch={urlQuery}
          searchPlaceholder="Chercher un lead…"
          emptyMessage="Aucun lead trouvé"
          onRowClick={setSelectedLead}
          actions={
            <span className="text-toyota-muted/50 text-xs">
              {leads.length} affiché{leads.length !== 1 ? "s" : ""}
            </span>
          }
        />
      </div>

      <AnimatePresence>
        {selectedLead && (
          <LeadDetailDrawer lead={selectedLead} onClose={() => setSelectedLead(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
