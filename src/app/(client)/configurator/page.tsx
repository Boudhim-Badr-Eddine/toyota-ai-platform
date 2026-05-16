"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { Settings2, ChevronRight, Zap } from "lucide-react";
import { VEHICLES_DATA } from "@/data/vehicles";
import { formatPrice, cn } from "@/lib/utils";

// ─── Category badge colors (matches configurator page) ────────────────────────

const BADGE_COLORS: Record<string, string> = {
  Sport:                  "bg-toyota-red/20 text-toyota-red border-toyota-red/30",
  "SUV Familial":         "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Citadine:               "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  "Compacte Hybride":     "bg-green-500/20 text-green-400 border-green-500/30",
  "Berline Confort":      "bg-purple-500/20 text-purple-400 border-purple-500/30",
  "Tout-terrain extrême": "bg-orange-500/20 text-orange-400 border-orange-500/30",
  "Pick-up utilitaire":   "bg-stone-400/20 text-stone-400 border-stone-400/30",
  "Éco/Tech":             "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  "SUV Urbain":           "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  "SUV 7 places":         "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
};

// ─── Animation variants ───────────────────────────────────────────────────────

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

// ─── VehicleConfigCard ────────────────────────────────────────────────────────

function VehicleConfigCard({ vehicle, index }: { vehicle: typeof VEHICLES_DATA[0]; index: number }) {
  const badge = BADGE_COLORS[vehicle.category] ?? "bg-white/10 text-white/60 border-white/20";
  return (
    <motion.div variants={item}>
      <Link
        href={"/configurator/" + vehicle.id}
        className="group flex flex-col bg-[#111111] border border-white/5 rounded-2xl overflow-hidden hover:border-toyota-red/30 hover:shadow-lg hover:shadow-toyota-red/8 transition-all duration-300"
      >
        {/* Image */}
        <div className="relative w-full aspect-[16/9] bg-[#0a0a0a] overflow-hidden">
          {vehicle.imageUrl ? (
            <Image
              src={vehicle.imageUrl}
              alt={vehicle.name}
              fill
              priority={index < 3}
              className="object-cover group-hover:scale-[1.04] transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 bg-linear-to-br from-toyota-dark to-toyota-card flex items-center justify-center">
              <span className="text-4xl font-black text-white/10">{vehicle.name[0]}</span>
            </div>
          )}
          {/* Configure overlay on hover */}
          <div className="absolute inset-0 bg-toyota-dark/0 group-hover:bg-toyota-dark/40 transition-colors duration-300 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileHover={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-2 bg-toyota-red text-white px-4 py-2 rounded-full text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              <Settings2 className="h-4 w-4" />
              Configurer
            </motion.div>
          </div>
          {/* Category badge */}
          <div className="absolute top-3 left-3">
            <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border", badge)}>
              {vehicle.category}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-4 flex items-center justify-between">
          <div>
            <h3 className="text-white font-bold text-sm leading-tight">{vehicle.name}</h3>
            <p className="text-toyota-muted text-xs mt-0.5">
              À partir de <span className="text-toyota-gold font-semibold">{formatPrice(vehicle.priceFrom)}</span>
            </p>
          </div>
          <div className={cn(
            "w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-200",
            "border-white/10 text-toyota-muted group-hover:border-toyota-red/50 group-hover:bg-toyota-red/10 group-hover:text-toyota-red"
          )}>
            <ChevronRight className="h-4 w-4" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function ConfiguratorIndexPage() {
  return (
    <div className="min-h-screen bg-toyota-dark pt-24 pb-20">
      <div className="section-container">

        {/* ── Hero header ──────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-toyota-red/30 bg-toyota-red/8 mb-5">
            <Zap className="h-3.5 w-3.5 text-toyota-red" />
            <span className="text-toyota-red text-xs font-bold tracking-wide uppercase">Configurateur 3D</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
            Choisissez le modèle
            <br />
            <span className="text-toyota-red">à configurer</span>
          </h1>
          <p className="text-toyota-muted text-lg max-w-xl mx-auto">
            Personnalisez votre Toyota en 3D — couleur, jantes, sellerie — en temps réel.
            Obtenez un devis instantané.
          </p>
        </motion.div>

        {/* ── Vehicle grid ──────────────────────────────────────────────────── */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
        >
          {VEHICLES_DATA.map((v, i) => (
            <VehicleConfigCard key={v.id} vehicle={v} index={i} />
          ))}
        </motion.div>

        {/* ── Bottom CTA ───────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-14 text-center"
        >
          <p className="text-toyota-muted text-sm mb-3">
            Vous ne savez pas quel modèle choisir ?
          </p>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('openChatWidget'))}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 hover:border-toyota-red/30 hover:bg-toyota-red/8 text-white font-semibold rounded-full text-sm transition-all duration-200"
          >
            Demander à l&apos;IA Toyota
            <ChevronRight className="h-4 w-4" />
          </button>
        </motion.div>
      </div>
    </div>
  );
}
