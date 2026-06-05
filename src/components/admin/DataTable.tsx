"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface ColumnDef<T> {
  key: string;
  header: string;
  sortable?: boolean;
  /** Custom cell renderer — receives the row object */
  render?: (row: T) => React.ReactNode;
  /** CSS class for the <td> */
  className?: string;
}

export interface DataTableProps<T extends Record<string, unknown>> {
  columns: ColumnDef<T>[];
  data: T[];
  pageSize?: number;
  searchable?: boolean;
  searchPlaceholder?: string;
  /** Key to use for row key (defaults to "id") */
  rowKey?: string;
  /** Shown when table is empty */
  emptyMessage?: string;
  /** Extra content rendered to the right of the search bar */
  actions?: React.ReactNode;
}

// ─── Status badge ──────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  // Leads
  new: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  contacted: "bg-yellow-500/15 text-yellow-400 border-yellow-500/25",
  converted: "bg-green-500/15 text-green-400 border-green-500/25",
  lost: "bg-red-500/15 text-red-400 border-red-500/25",
  // Reservations
  pending: "bg-yellow-500/15 text-yellow-400 border-yellow-500/25",
  confirmed: "bg-green-500/15 text-green-400 border-green-500/25",
  cancelled: "bg-red-500/15 text-red-400 border-red-500/25",
  completed: "bg-purple-500/15 text-purple-400 border-purple-500/25",
};

const STATUS_LABELS: Record<string, string> = {
  new: "Nouveau",
  contacted: "Contacté",
  converted: "Converti",
  lost: "Perdu",
  pending: "En attente",
  confirmed: "Confirmé",
  cancelled: "Annulé",
  completed: "Terminé",
  test_drive: "Essai routier",
  quote: "Devis",
  visit: "Visite",
};

export function StatusBadge({ status }: { status: string }) {
  const styleClass = STATUS_STYLES[status] ?? "bg-white/5 text-white/50 border-white/10";
  const label = STATUS_LABELS[status] ?? status;
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border whitespace-nowrap",
        styleClass
      )}
    >
      {label}
    </span>
  );
}

// ─── Sort icon ─────────────────────────────────────────────────────────────────

function SortIcon({ direction }: { direction: "asc" | "desc" | null }) {
  if (direction === "asc") return <ChevronUp className="h-3.5 w-3.5 text-toyota-red" />;
  if (direction === "desc") return <ChevronDown className="h-3.5 w-3.5 text-toyota-red" />;
  return <ChevronsUpDown className="h-3.5 w-3.5 text-toyota-muted/30" />;
}

// ─── DataTable ─────────────────────────────────────────────────────────────────

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  pageSize = 10,
  searchable = true,
  searchPlaceholder = "Rechercher…",
  rowKey = "id",
  emptyMessage = "Aucun résultat",
  actions,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  // ── Filter ────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter((row) =>
      Object.values(row).some(
        (v) => v !== null && v !== undefined && String(v).toLowerCase().includes(q)
      )
    );
  }, [data, search]);

  // ── Sort ──────────────────────────────────────────────────────────────────
  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      const aStr = av !== null && av !== undefined ? String(av) : "";
      const bStr = bv !== null && bv !== undefined ? String(bv) : "";
      const aNum = Number(av);
      const bNum = Number(bv);
      const isNumeric = !isNaN(aNum) && !isNaN(bNum);
      const cmp = isNumeric ? aNum - bNum : aStr.localeCompare(bStr, "fr");
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  // ── Pagination ────────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);

  const handleSort = useCallback(
    (key: string) => {
      if (sortKey === key) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortKey(key);
        setSortDir("asc");
      }
      setPage(1);
    },
    [sortKey]
  );

  const handleSearch = (q: string) => {
    setSearch(q);
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        {searchable && (
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-toyota-muted/40 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-white/4 border border-white/8 text-white text-sm placeholder:text-toyota-muted/30 rounded-xl pl-9 pr-9 py-2.5 focus:outline-none focus:border-toyota-red/40 transition-colors"
            />
            <AnimatePresence>
              {search && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => handleSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-toyota-muted/40 hover:text-white transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        )}
        {actions && <div className="flex items-center gap-2 ml-auto">{actions}</div>}
      </div>

      {/* Results count */}
      <div className="text-xs text-toyota-muted/50">
        <span className="text-white font-semibold">{filtered.length}</span> résultat
        {filtered.length !== 1 ? "s" : ""}
        {search && ` pour "${search}"`}
      </div>

      {/* ── Table ────────────────────────────────────────────────────────── */}
      <div className="overflow-x-auto rounded-xl border border-white/5">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-white/5 bg-white/2">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "text-left px-4 py-3 text-[11px] font-semibold text-toyota-muted/60 uppercase tracking-wider whitespace-nowrap",
                    col.sortable && "cursor-pointer select-none hover:text-white transition-colors"
                  )}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                >
                  <div className="flex items-center gap-1.5">
                    {col.header}
                    {col.sortable && (
                      <SortIcon direction={sortKey === col.key ? sortDir : null} />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="wait" initial={false}>
              {paginated.length === 0 ? (
                <tr key="empty">
                  <td colSpan={columns.length} className="text-center py-16 text-toyota-muted/50">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                paginated.map((row, i) => (
                  <motion.tr
                    key={String(row[rowKey] ?? i)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-b border-white/3 hover:bg-white/2 transition-colors"
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cn(
                          "px-4 py-3 text-white/80 whitespace-nowrap",
                          col.className
                        )}
                      >
                        {col.render
                          ? col.render(row)
                          : String(row[col.key] ?? "—")}
                      </td>
                    ))}
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* ── Pagination ───────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-toyota-muted/50">
            Page <span className="text-white">{safePage}</span> sur{" "}
            <span className="text-white">{totalPages}</span>
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="w-8 h-8 rounded-lg bg-white/4 border border-white/8 flex items-center justify-center text-toyota-muted hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* Page numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (safePage <= 3) {
                pageNum = i + 1;
              } else if (safePage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = safePage - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={cn(
                    "w-8 h-8 rounded-lg text-xs font-semibold transition-colors",
                    safePage === pageNum
                      ? "bg-toyota-red text-white"
                      : "bg-white/4 border border-white/8 text-toyota-muted hover:text-white"
                  )}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="w-8 h-8 rounded-lg bg-white/4 border border-white/8 flex items-center justify-center text-toyota-muted hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
