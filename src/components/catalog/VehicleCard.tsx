"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import Link from "next/link";
import { Zap, Users, Fuel, ArrowRight, Settings, Star } from "lucide-react";
import type { Vehicle } from "@/types";
import { formatPrice, formatPower, formatConsumption, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useCompareStore } from "@/store/compareStore";

// ─── Category visual config ────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<
  string,
  { badge: string; gradientFrom: string; glowColor: string }
> = {
  Sport:                  { badge: "bg-red-500/20 text-red-400 border-red-500/30",     gradientFrom: "from-red-950/80",      glowColor: "rgba(239,68,68,0.18)" },
  "SUV Familial":         { badge: "bg-blue-500/20 text-blue-400 border-blue-500/30",   gradientFrom: "from-blue-950/80",     glowColor: "rgba(59,130,246,0.18)" },
  Citadine:               { badge: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", gradientFrom: "from-yellow-950/60", glowColor: "rgba(234,179,8,0.14)" },
  "Compacte Hybride":     { badge: "bg-green-500/20 text-green-400 border-green-500/30", gradientFrom: "from-green-950/80",   glowColor: "rgba(34,197,94,0.14)" },
  "Berline Confort":      { badge: "bg-purple-500/20 text-purple-400 border-purple-500/30", gradientFrom: "from-purple-950/80", glowColor: "rgba(168,85,247,0.18)" },
  "Tout-terrain extrême": { badge: "bg-orange-500/20 text-orange-400 border-orange-500/30", gradientFrom: "from-orange-950/70", glowColor: "rgba(249,115,22,0.14)" },
  "Pick-up utilitaire":   { badge: "bg-stone-400/20 text-stone-400 border-stone-400/30",  gradientFrom: "from-stone-900/80",   glowColor: "rgba(168,162,158,0.14)" },
  "Éco/Tech":              { badge: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", gradientFrom: "from-emerald-950/80", glowColor: "rgba(16,185,129,0.18)" },
  "SUV Urbain":           { badge: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",   gradientFrom: "from-cyan-950/80",     glowColor: "rgba(6,182,212,0.14)" },
  "SUV 7 places":         { badge: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30", gradientFrom: "from-indigo-950/80", glowColor: "rgba(99,102,241,0.18)" },
};

const DEFAULT_CATEGORY_CONFIG = {
  badge:        "bg-white/10 text-white/60 border-white/20",
  gradientFrom: "from-gray-900/80",
  glowColor:    "rgba(255,255,255,0.08)",
};

// ─── Card variants (for stagger from parent) ───────────────────────────────────

export const cardVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.065, duration: 0.4, ease: "easeOut" },
  }),
};

// ─── VehicleCard ──────────────────────────────────────────────────────────────

interface VehicleCardProps {
  vehicle: Vehicle;
  index?: number;
}

export function VehicleCard({ vehicle, index = 0 }: VehicleCardProps) {
  const [imgError, setImgError] = useState(false);
  const { selectedIds, toggle } = useCompareStore();
  const isCompared = selectedIds.includes(vehicle.id);

  const catConfig = CATEGORY_CONFIG[vehicle.category] ?? DEFAULT_CATEGORY_CONFIG;

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className="group relative bg-[#111111] border border-white/5 rounded-2xl overflow-hidden flex flex-col cursor-default"
      style={
        {
          "--glow-color": catConfig.glowColor,
          "--red-glow": "rgba(235,10,30,0.12)",
        } as React.CSSProperties
      }
    >
      {/* Hover glow ring */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ring-1 ring-inset ring-toyota-red/20 shadow-[0_0_50px_var(--red-glow)]" />

      {/* ── Image ─────────────────────────────────────────────────────────── */}
      <div
        className={cn(
          "relative overflow-hidden aspect-video",
          (!vehicle.imageUrl || imgError)
            ? `bg-linear-to-br to-[#0D0D0D] flex items-center justify-center ${catConfig.gradientFrom}`
            : "bg-[#0D0D0D]"
        )}
      >
        {/* Photo */}
        {vehicle.imageUrl && !imgError && (
          <Image
            src={vehicle.imageUrl}
            alt={`Toyota ${vehicle.name}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-600 ease-out group-hover:scale-[1.07]"
            onError={() => setImgError(true)}
            priority={index < 3}
            loading={index < 3 ? "eager" : "lazy"}
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIyNSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMTExMTExIi8+PC9zdmc+"
          />
        )}

        {/* Fallback */}
        {(!vehicle.imageUrl || imgError) && (
          <div className="flex flex-col items-center justify-center gap-2 select-none">
            <div className="w-16 h-16 rounded-full bg-white/3 border border-white/8 flex items-center justify-center">
              <span className="text-2xl font-black text-white/20 tracking-tighter">
                {vehicle.name.split(" ").slice(0, 2).map((w) => w[0]).join("")}
              </span>
            </div>
          </div>
        )}

        {/* Bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-linear-to-t from-[#111111] via-[#111111]/40 to-transparent pointer-events-none" />

        {/* Category badge — top left */}
        <div className="absolute top-3 left-3">
          <span className={cn("text-[10px] font-bold px-2.5 py-1 rounded-full border backdrop-blur-sm", catConfig.badge)}>
            {vehicle.category}
          </span>
        </div>

        {/* Price pill — top right */}
        <div className="absolute top-3 right-3">
          <span className="text-[11px] font-bold text-toyota-gold bg-black/65 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-toyota-gold/25">
            dès {formatPrice(vehicle.priceFrom)}
          </span>
        </div>

        {/* Configurer overlay — slides up from bottom of image on hover */}
        <div className="absolute inset-x-0 bottom-0 flex justify-center pb-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
          <span className="bg-toyota-red text-white text-[11px] font-bold px-4 py-1.5 rounded-full shadow-lg">
            Configurer →
          </span>
        </div>
      </div>

      {/* ── Card body ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 p-4 pt-3.5">
        {/* Name */}
        <h3 className="text-white font-black text-[19px] leading-snug mb-0.5 group-hover:text-toyota-red transition-colors duration-200">
          {vehicle.name}
        </h3>
        <p className="text-toyota-muted/60 text-xs mb-2 line-clamp-1">{vehicle.tagline}</p>
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1 text-xs text-toyota-gold">
            <Star className="h-3 w-3 fill-toyota-gold" />
            {vehicle.rating}
          </div>
          {vehicle.isHybrid && <Badge variant="success">Hybride</Badge>}
          {vehicle.isNew && <Badge variant="gold">Nouveau</Badge>}
        </div>

        {/* Spec pills */}
        <div className="flex items-center gap-2 flex-wrap mb-4">
          <SpecPill icon={<Zap className="h-3 w-3 text-toyota-gold" />} label={formatPower(vehicle.specs.power)} />
          <div className="w-px h-3 bg-white/10" />
          <SpecPill icon={<Users className="h-3 w-3 text-blue-400" />} label={`${vehicle.specs.seats} places`} />
          <div className="w-px h-3 bg-white/10" />
          <SpecPill icon={<Fuel className="h-3 w-3 text-green-400" />} label={formatConsumption(vehicle.specs.consumption)} />
        </div>

        {/* Push buttons to bottom */}
        <div className="flex-1" />

        {/* Action buttons */}
        <div className="flex gap-2 mt-2">
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); toggle(vehicle.id); }}
            className={cn(
              "px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all",
              isCompared ? "border-toyota-red bg-toyota-red/10 text-white" : "border-white/10 text-toyota-muted hover:text-white"
            )}
          >
            {isCompared ? "✓" : "Comparer"}
          </button>
          <Link
            href={`/configurator/${vehicle.id}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-toyota-red hover:bg-toyota-red/90 text-white text-sm font-bold rounded-xl transition-colors shadow-sm shadow-toyota-red/25"
          >
            <Settings className="h-3.5 w-3.5" />
            Configurer
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href={`/vehicles/${vehicle.id}`}
            aria-label={`Détails sur ${vehicle.name}`}
            className="flex items-center gap-1.5 px-3.5 py-2.5 border border-white/10 hover:border-white/25 hover:bg-white/4 text-toyota-muted hover:text-white text-sm rounded-xl transition-all"
          >
            <span className="text-xs font-semibold whitespace-nowrap">Détails</span>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

// ─── SpecPill ─────────────────────────────────────────────────────────────────

function SpecPill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-toyota-muted/80">
      {icon}
      <span>{label}</span>
    </div>
  );
}
