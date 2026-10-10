"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { Settings2, ChevronRight, Zap } from "lucide-react";
import { VEHICLES_DATA } from "@/data/vehicles";
import { formatPrice, cn } from "@/lib/utils";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BorderDrawButton } from "@/components/ui/BorderDrawButton";

const BADGE_COLORS: Record<string, string> = {
  Sport: "bg-black/80 text-white border-white/20",
  "SUV Familial": "bg-blue-600/80 text-white border-blue-400/30",
  Citadine: "bg-yellow-600/80 text-black border-yellow-400/30",
  "Compacte Hybride": "bg-green-600/80 text-white border-green-400/30",
  "Berline Confort": "bg-purple-600/80 text-white border-purple-400/30",
  "Tout-terrain extrême": "bg-orange-600/80 text-white border-orange-400/30",
  "Pick-up utilitaire": "bg-stone-600/80 text-white border-stone-400/30",
  "Éco/Tech": "bg-emerald-600/80 text-white border-emerald-400/30",
  "SUV Urbain": "bg-cyan-600/80 text-white border-cyan-400/30",
  "SUV 7 places": "bg-indigo-600/80 text-white border-indigo-400/30",
};

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function VehicleConfigCard({ vehicle, index }: { vehicle: typeof VEHICLES_DATA[0]; index: number }) {
  const badge = BADGE_COLORS[vehicle.category] ?? "bg-black/70 text-white border-white/20";
  return (
    <motion.div variants={item}>
      <Link
        href={"/configurator/" + vehicle.id}
        className="group block toyota-panel overflow-hidden hover:border-toyota-red/30 transition-all duration-300"
      >
        <div className="relative w-full aspect-[16/10] bg-black overflow-hidden">
          {vehicle.imageUrl ? (
            <Image
              src={vehicle.imageUrl}
              alt={vehicle.name}
              fill
              priority={index === 0}
              loading={index === 0 ? "eager" : "lazy"}
              className="object-cover group-hover:scale-[1.03] transition-transform duration-700"
              sizes="(max-width: 640px) 100vw, 33vw"
            />
          ) : null}
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent" />
          <div className="absolute top-3 left-3">
            <span className={cn("text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded border", badge)}>
              {vehicle.category}
            </span>
          </div>
        </div>
        <div className="p-4 flex items-center justify-between gap-3 border-t border-white/[0.06]">
          <div>
            <h3 className="text-white font-bold text-sm">{vehicle.name}</h3>
            <p className="text-toyota-red text-xs font-semibold mt-1">
              À partir de {formatPrice(vehicle.priceFrom)}
            </p>
          </div>
          <div className="w-9 h-9 rounded-md border border-white/10 bg-[#1a1a1a] flex items-center justify-center text-white/50 group-hover:border-toyota-red/40 group-hover:text-toyota-red transition-colors">
            <ChevronRight className="h-4 w-4" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function ConfiguratorIndexPage() {
  return (
    <div className="toyota-page pb-24">
      <div className="section-container py-12 lg:py-16">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-md border border-toyota-red/40 bg-toyota-red/10 mb-6">
            <Zap className="h-3.5 w-3.5 text-toyota-red" />
            <span className="text-toyota-red text-[10px] font-bold tracking-[0.2em] uppercase">Configurateur 3D</span>
          </div>
          <SectionHeading
            align="center"
            title="Choisissez le modèle à configurer"
            subtitle="Personnalisez votre Toyota en 3D — couleur, jantes, sellerie — en temps réel. Obtenez un devis instantané."
          />
        </motion.div>

        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {VEHICLES_DATA.map((v, i) => (
            <VehicleConfigCard key={v.id} vehicle={v} index={i} />
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-14 text-center">
          <p className="text-white/40 text-sm mb-4">Vous ne savez pas quel modèle choisir ?</p>
          <BorderDrawButton
            onClick={() => window.dispatchEvent(new CustomEvent("open-chat"))}
            className="px-8 py-3"
          >
            <Settings2 className="h-4 w-4" />
            Demander à l&apos;IA Toyota
          </BorderDrawButton>
        </motion.div>
      </div>
    </div>
  );
}
