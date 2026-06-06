"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, Search, X } from "lucide-react";
import { VehicleCard, cardVariants } from "./VehicleCard";
import type { Vehicle } from "@/types";
import { cn } from "@/lib/utils";
import { useCompareStore } from "@/store/compareStore";

// ─── Filter definitions ────────────────────────────────────────────────────────

type FilterKey =
  | "all"
  | "sport"
  | "suv"
  | "berline"
  | "citadine"
  | "hybride"
  | "pickup"
  | "eco";

const FILTERS: { key: FilterKey; label: string; categories: string[] }[] = [
  { key: "all", label: "Tous", categories: [] },
  { key: "sport", label: "Sport", categories: ["Sport"] },
  {
    key: "suv",
    label: "SUV",
    categories: ["SUV Familial", "SUV Urbain", "SUV 7 places", "Tout-terrain extrême"],
  },
  {
    key: "berline",
    label: "Berline",
    categories: ["Berline", "Berline Confort", "Compacte Hybride"],
  },
  { key: "citadine", label: "Citadine", categories: ["Citadine"] },
  {
    key: "hybride",
    label: "Hybride",
    categories: [
      "Compacte Hybride",
      "Éco/Tech",
      "SUV Familial",
      "Berline Confort",
      "Citadine",
      "SUV Urbain",
    ],
  },
  { key: "pickup", label: "Pick-up", categories: ["Pick-up utilitaire"] },
  { key: "eco", label: "Éco/Tech", categories: ["Éco/Tech"] },
];

// ─── Sort definitions ──────────────────────────────────────────────────────────

type SortKey = "price-asc" | "price-desc" | "power";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "price-asc", label: "Prix croissant" },
  { key: "price-desc", label: "Prix décroissant" },
  { key: "power", label: "Puissance" },
];

// ─── Grid container variants ───────────────────────────────────────────────────

const gridVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.065 },
  },
};

// ─── VehicleGrid ───────────────────────────────────────────────────────────────

interface VehicleGridProps {
  vehicles: Vehicle[];
}

export function VehicleGrid({ vehicles }: VehicleGridProps) {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category") as FilterKey | null;
  const urlFilter =
    categoryParam && FILTERS.some((f) => f.key === categoryParam) ? categoryParam : null;

  const [manualFilter, setManualFilter] = useState<FilterKey | null>(null);
  const activeFilter = urlFilter ?? manualFilter ?? "all";
  const [sort, setSort] = useState<SortKey>("price-asc");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const compareParam = searchParams.get("compare");
    if (compareParam) {
      const ids = compareParam.split(",").filter(Boolean).slice(0, 3);
      if (ids.length >= 2) {
        useCompareStore.setState({ selectedIds: ids, drawerOpen: true });
      }
    }
  }, [searchParams]);

  const setActiveFilter = (key: FilterKey) => setManualFilter(key);

  // ── Derived list ────────────────────────────────────────────────────────────
  const displayed = useMemo(() => {
    const filter = FILTERS.find((f) => f.key === activeFilter);

    // 1. Category filter
    let list = filter?.categories.length
      ? vehicles.filter((v) => filter.categories.includes(v.category))
      : [...vehicles];

    // 2. Search filter (name or category)
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.category.toLowerCase().includes(q) ||
          v.id.toLowerCase().includes(q)
      );
    }

    // 3. Sort
    list = [...list].sort((a, b) => {
      if (sort === "price-asc") return a.priceFrom - b.priceFrom;
      if (sort === "price-desc") return b.priceFrom - a.priceFrom;
      return b.specs.power - a.specs.power; // "power" sort
    });

    return list;
  }, [vehicles, activeFilter, sort, search]);

  return (
    <div>
      {/* ── Toolbar ─────────────────────────────────────────────────────────── */}
      <div className="mb-8 space-y-4">
        {/* Top row: search + sort */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          {/* Search */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-toyota-muted/40 pointer-events-none" />
            <input
              type="text"
              placeholder="Rechercher un modèle…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/4 border border-white/10 text-white text-sm placeholder:text-toyota-muted/35 rounded-xl pl-10 pr-9 py-3 focus:outline-none focus:border-toyota-red/50 focus:bg-white/6 transition-all"
            />
            <AnimatePresence>
              {search && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-toyota-muted/50 hover:text-white transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2 shrink-0">
            <SlidersHorizontal className="h-4 w-4 text-toyota-muted/50 shrink-0" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="bg-white/4 border border-white/8 text-toyota-muted text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-toyota-red/40 cursor-pointer transition-colors"
            >
              {SORTS.map((s) => (
                <option key={s.key} value={s.key} className="bg-[#111111] text-white">
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const count =
              f.key === "all"
                ? vehicles.length
                : vehicles.filter((v) => f.categories.includes(v.category)).length;

            if (count === 0 && f.key !== "all") return null;

            return (
              <motion.button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className={cn(
                  "relative flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium border transition-colors duration-200 overflow-hidden",
                  activeFilter === f.key
                    ? "text-white border-toyota-red shadow-md shadow-toyota-red/25"
                    : "bg-white/3 text-toyota-muted border-white/8 hover:border-white/20 hover:text-white"
                )}
                whileTap={{ scale: 0.96 }}
              >
                {activeFilter === f.key && (
                  <motion.span
                    layoutId="filter-indicator"
                    className="absolute inset-0 bg-toyota-red rounded-full -z-10"
                    transition={{ type: "spring", stiffness: 380, damping: 36 }}
                  />
                )}
                {f.label}
                <span
                  className={cn(
                    "text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center",
                    activeFilter === f.key
                      ? "bg-white/20 text-white"
                      : "bg-white/8 text-toyota-muted/70"
                  )}
                >
                  {count}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ── Results ─────────────────────────────────────────────────────────── */}
      {/* Status line */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-toyota-muted/60 text-sm">
          <span className="text-white font-semibold">{displayed.length}</span>{" "}
          véhicule{displayed.length !== 1 ? "s" : ""}
          {search.trim() ? ` pour "${search}"` : ""}
        </p>
      </div>

      {/* Empty state */}
      <AnimatePresence mode="wait">
        {displayed.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-28 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-white/4 flex items-center justify-center mb-4">
              <Search className="h-7 w-7 text-toyota-muted/40" />
            </div>
            <p className="text-white font-semibold text-lg mb-1">Aucun résultat</p>
            <p className="text-toyota-muted text-sm mb-4">
              Essayez une autre catégorie ou modifiez votre recherche.
            </p>
            <button
              onClick={() => {
                setActiveFilter("all");
                setSearch("");
              }}
              className="px-5 py-2 bg-toyota-red/10 text-toyota-red border border-toyota-red/20 rounded-full text-sm font-medium hover:bg-toyota-red/20 transition-colors"
            >
              Réinitialiser les filtres
            </button>
          </motion.div>
        ) : (
          <motion.div
            key={activeFilter + sort + search}
            variants={gridVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {displayed.map((vehicle, i) => (
              <motion.div key={vehicle.id} custom={i} variants={cardVariants}>
                <VehicleCard vehicle={vehicle} index={i} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
