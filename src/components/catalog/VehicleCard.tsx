"use client";

import { memo, useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, type Variants } from "framer-motion";
import Link from "next/link";
import { BorderDrawButton } from "@/components/ui/BorderDrawButton";
import { Zap, Users, Fuel, ArrowRight, Settings, Scale } from "lucide-react";
import type { Vehicle } from "@/types";
import { getVehicleDisplayImage } from "@/data/vehicles";
import { formatPrice, formatPower, formatConsumption, cn } from "@/lib/utils";
import { useCompareStore } from "@/store/compareStore";
import { MOTION_GPU_CLASS } from "@/lib/motion";

const TOYOTA_RED = "#EB0A1E";
const EASE_PREMIUM = [0.22, 1, 0.36, 1] as const;

const CATEGORY_DOT: Record<string, string> = {
  Sport: "#EF4444",
  "SUV Familial": "#3B82F6",
  Citadine: "#EAB308",
  "Compacte Hybride": "#22C55E",
  "Berline Confort": "#A855F7",
  "Tout-terrain extrême": "#F97316",
  "Pick-up utilitaire": "#A8A29E",
  "Éco/Tech": "#10B981",
  "SUV Urbain": "#06B6D4",
  "SUV 7 places": "#6366F1",
  Berline: "#8B5CF6",
  "Van Premium": "#94A3B8",
  "Monospace Familial": "#14B8A6",
};

export const cardVariants: Variants = {
  hidden: { opacity: 0, y: 56 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.65, ease: EASE_PREMIUM },
  }),
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.25 } },
};

interface VehicleCardProps {
  vehicle: Vehicle;
  index?: number;
  featured?: boolean;
}

export const VehicleCard = memo(function VehicleCard({
  vehicle,
  index = 0,
  featured = false,
}: VehicleCardProps) {
  const [imgError, setImgError] = useState(false);
  const [imageMounted, setImageMounted] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const imageWrapRef = useRef<HTMLDivElement>(null);
  const { selectedIds, toggle } = useCompareStore();
  const isCompared = selectedIds.includes(vehicle.id);
  const handleCompareToggle = useCallback(() => toggle(vehicle.id), [toggle, vehicle.id]);

  const { scrollYProgress } = useScroll({
    target: imageWrapRef,
    offset: ["start end", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);

  const dotColor = CATEGORY_DOT[vehicle.category] ?? TOYOTA_RED;
  const displayImage = getVehicleDisplayImage(vehicle);
  const isStudioImage =
    (/hero(-2)?\.(png|webp|jpe?g)$/.test(displayImage) ||
      /yaris-gr-hero\.png$/.test(displayImage)) &&
    vehicle.id !== "kijang";

  useEffect(() => {
    setImageMounted(true);
  }, []);

  return (
    <motion.article
      ref={cardRef}
      layout="position"
      initial={{ opacity: 0, y: 56 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ delay: index * 0.08, duration: 0.65, ease: EASE_PREMIUM }}
      whileHover={{
        y: -8,
        transition: { duration: 0.35, ease: EASE_PREMIUM },
      }}
      className={cn(
        MOTION_GPU_CLASS,
        "group relative flex flex-col bg-[#111111] border border-white/[0.06] rounded-none overflow-hidden",
        "hover:border-[#EB0A1E]/30 transition-[border-color] duration-300",
        featured && "md:min-h-[420px]"
      )}
    >
      {/* Image — top 60% */}
      <div
        ref={imageWrapRef}
        className={cn(
          "relative overflow-hidden shrink-0 bg-black",
          featured ? "h-[280px] md:h-[320px]" : "h-[220px] md:h-[240px]"
        )}
      >
        {displayImage && !imgError && imageMounted ? (
          <motion.div
            className={cn(
              "absolute will-change-transform",
              isStudioImage ? "inset-2 sm:inset-3" : "inset-0"
            )}
            style={{ y: imageY }}
          >
            <Image
              key={displayImage}
              src={displayImage}
              alt={`Toyota ${vehicle.name}`}
              fill
              sizes={
                featured
                  ? "(max-width: 768px) 100vw, 66vw"
                  : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              }
              className={cn(
                "transition-transform duration-700 ease-out group-hover:scale-105",
                vehicle.id === "kijang"
                  ? "object-cover object-[center_40%]"
                  : isStudioImage
                    ? "object-contain object-center drop-shadow-[0_12px_32px_rgba(0,0,0,0.5)]"
                    : "object-cover"
              )}
              onError={() => setImgError(true)}
              priority={index === 0}
              loading={index === 0 ? "eager" : "lazy"}
            />
          </motion.div>
        ) : (
          <div className="absolute inset-0 bg-[#0D0D0D] flex items-center justify-center">
            <span className="text-3xl font-black text-white/15 tracking-tighter">
              {vehicle.name.split(" ").slice(0, 2).map((w) => w[0]).join("")}
            </span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent pointer-events-none" />

        {/* Category badge */}
        <div className="absolute top-3 left-3 z-10">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-white/90 bg-black/55 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: dotColor }}
            />
            {vehicle.category}
          </span>
        </div>

        {/* Compare toggle */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            handleCompareToggle();
          }}
          className={cn(
            "absolute top-3 right-3 z-10 w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-300",
            isCompared
              ? "bg-[#EB0A1E]/20 border-[#EB0A1E] text-white"
              : "bg-black/50 border-white/15 text-white/60 opacity-0 group-hover:opacity-100 hover:text-white hover:border-white/30"
          )}
          aria-label={isCompared ? "Retirer de la comparaison" : "Ajouter à la comparaison"}
        >
          <Scale className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Body — bottom 40% */}
      <div className="flex flex-col flex-1 p-5">
        <motion.h3
          className="text-white font-black text-xl md:text-2xl leading-tight tracking-tight mb-2 transition-transform duration-300 group-hover:-translate-y-0.5"
        >
          {vehicle.name}
        </motion.h3>

        <p className="text-[#D4AF37] font-black text-lg md:text-xl tabular-nums mb-3">
          dès {formatPrice(vehicle.priceFrom)}
        </p>

        <div className="flex items-center gap-3 flex-wrap mb-5">
          <SpecItem icon={<Zap className="h-3 w-3" />} label={formatPower(vehicle.specs.power)} />
          <SpecItem icon={<Users className="h-3 w-3" />} label={`${vehicle.specs.seats} places`} />
          <SpecItem icon={<Fuel className="h-3 w-3" />} label={formatConsumption(vehicle.specs.consumption)} />
        </div>

        <div className="mt-auto flex gap-2.5">
          <BorderDrawButton
            href={`/vehicles/${vehicle.id}`}
            className="flex-1 !px-4 !py-2.5 !text-xs justify-center"
          >
            Détails
          </BorderDrawButton>
          <BorderDrawButton
            href={`/configurator/${vehicle.id}`}
            accent="red"
            className="flex-1 !px-4 !py-2.5 !text-xs justify-center"
          >
            <Settings className="h-3.5 w-3.5" />
            Configurer
            <ArrowRight className="h-3.5 w-3.5" />
          </BorderDrawButton>
        </div>
      </div>
    </motion.article>
  );
});

function SpecItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-[11px] text-white/40 font-medium">
      <span className="text-white/25">{icon}</span>
      {label}
    </div>
  );
}
