"use client";

import { memo, useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, Search, X } from "lucide-react";
import { VehicleCard, cardVariants } from "./VehicleCard";
import type { Vehicle } from "@/types";
import { cn } from "@/lib/utils";
import { useCompareStore } from "@/store/compareStore";
import { BorderDrawButton } from "@/components/ui/BorderDrawButton";

const EASE_PREMIUM = [0.22, 1, 0.36, 1] as const;

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

type SortKey = "price-asc" | "price-desc" | "power";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "price-asc", label: "Prix croissant" },
  { key: "price-desc", label: "Prix décroissant" },
  { key: "power", label: "Puissance" },
];

const gridVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

interface VehicleGridProps {
  vehicles: Vehicle[];
}

export const VehicleGrid = memo(function VehicleGrid({ vehicles }: VehicleGridProps) {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category") as FilterKey | null;
  const urlFilter =
    categoryParam && FILTERS.some((f) => f.key === categoryParam) ? categoryParam : null;

  const [manualFilter, setManualFilter] = useState<FilterKey | null>(null);
  const activeFilter = urlFilter ?? manualFilter ?? "all";
  const [sort, setSort] = useState<SortKey>("price-asc");
  const [search, setSearch] = useState("");
  const tabsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const compareParam = searchParams.get("compare");
    if (compareParam) {
      const ids = compareParam.split(",").filter(Boolean).slice(0, 3);
      if (ids.length >= 2) {
        useCompareStore.setState({ selectedIds: ids, drawerOpen: true });
      }
    }
  }, [searchParams]);

  const setActiveFilter = useCallback((key: FilterKey) => setManualFilter(key), []);

  const displayed = useMemo(() => {
    const filter = FILTERS.find((f) => f.key === activeFilter);

    let list = filter?.categories.length
      ? vehicles.filter((v) => filter.categories.includes(v.category))
      : [...vehicles];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.category.toLowerCase().includes(q) ||
          v.id.toLowerCase().includes(q)
      );
    }

    list = [...list].sort((a, b) => {
      if (sort === "price-asc") return a.priceFrom - b.priceFrom;
      if (sort === "price-desc") return b.priceFrom - a.priceFrom;
      return b.specs.power - a.specs.power;
    });

    return list;
  }, [vehicles, activeFilter, sort, search]);

  const visibleFilters = FILTERS.filter((f) => {
    if (f.key === "all") return true;
    return vehicles.some((v) => f.categories.includes(v.category));
  });

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-10 space-y-5">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 pointer-events-none" />
            <input
              type="text"
              placeholder="Rechercher un modèle…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/10 text-white text-sm placeholder:text-white/30 rounded-full pl-10 pr-9 py-3 focus:outline-none focus:border-[#EB0A1E]/50 focus:bg-white/[0.06] transition-all"
            />
            <AnimatePresence>
              {search && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <SlidersHorizontal className="h-4 w-4 text-white/35 shrink-0" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="bg-white/[0.04] border border-white/10 text-white/70 text-sm rounded-full px-4 py-2.5 focus:outline-none focus:border-[#EB0A1E]/40 cursor-pointer transition-colors"
            >
              {SORTS.map((s) => (
                <option key={s.key} value={s.key} className="bg-[#111111] text-white">
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category filter pills */}
        <div
          ref={tabsRef}
          className="relative -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto scrollbar-hide"
        >
          <div className="flex items-center gap-2 min-w-max rounded-none border border-white/[0.06] bg-black px-3 py-2.5">
            <span className="text-white/25 text-[10px] font-bold uppercase tracking-[0.35em] shrink-0 mr-1 select-none">
              Gamme
            </span>
            {visibleFilters.map((f, i) => {
              const count =
                f.key === "all"
                  ? vehicles.length
                  : vehicles.filter((v) => f.categories.includes(v.category)).length;

              const isActive = activeFilter === f.key;

              return (
                <motion.button
                  key={f.key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.4, ease: EASE_PREMIUM }}
                  onClick={() => setActiveFilter(f.key)}
                  className={cn(
                    "relative shrink-0 inline-flex items-center gap-2 px-3.5 py-2 rounded-none text-[11px] font-bold tracking-wide border transition-colors duration-300",
                    isActive
                      ? "border-[#EB0A1E]/35 bg-[#EB0A1E]/[0.08] text-[#EB0A1E]/90"
                      : "bg-white/[0.03] text-white/45 border-white/[0.08] hover:text-white/75 hover:border-white/15"
                  )}
                  whileTap={{ scale: 0.97 }}
                >
                  <span>{f.label}</span>
                  <span
                    className={cn(
                      "text-[9px] font-bold px-1.5 py-0.5 rounded-none",
                      isActive ? "bg-[#EB0A1E]/15 text-[#EB0A1E]/80" : "bg-white/[0.06] text-white/30"
                    )}
                  >
                    {count}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-white/40 text-sm">
          <span className="text-white font-bold">{displayed.length}</span>{" "}
          véhicule{displayed.length !== 1 ? "s" : ""}
          {search.trim() ? ` pour « ${search} »` : ""}
        </p>
      </div>

      <AnimatePresence mode="popLayout">
        {displayed.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: EASE_PREMIUM }}
            className="flex flex-col items-center justify-center py-28 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-white/[0.04] flex items-center justify-center mb-4">
              <Search className="h-7 w-7 text-white/25" />
            </div>
            <p className="text-white font-bold text-lg mb-1">Aucun résultat</p>
            <p className="text-white/40 text-sm mb-5">
              Essayez une autre catégorie ou modifiez votre recherche.
            </p>
            <BorderDrawButton
              accent="red"
              onClick={() => {
                setActiveFilter("all");
                setSearch("");
              }}
              className="!px-6 !py-2.5 !text-sm"
            >
              Réinitialiser les filtres
            </BorderDrawButton>
          </motion.div>
        ) : (
          <motion.div
            key={`${activeFilter}-${sort}-${search}`}
            layout="position"
            variants={gridVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6"
          >
            <AnimatePresence mode="popLayout">
              {displayed.map((vehicle, i) => (
                <motion.div
                  key={vehicle.id}
                  layout="position"
                  custom={i}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className={cn(i === 0 && "md:col-span-2 lg:col-span-2")}
                >
                  <VehicleCard vehicle={vehicle} index={i} featured={i === 0} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
