"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import { ToyotaPrimaryCta } from "@/components/ui/ToyotaPrimaryCta";
import { BorderDrawButton } from "@/components/ui/BorderDrawButton";
import Image from "next/image";
import {
  motion,
  AnimatePresence,
  useInView,
} from "framer-motion";
import {
  ArrowRight,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  Zap,
  Fuel,
  Users,
  Gauge,
  Cog,
  Timer,
  Maximize2,
} from "lucide-react";
import { VEHICLES_DATA } from "@/data/vehicles";
import { getEnrichedVehicle } from "@/data/vehicleEnrichments";
import { formatPrice, formatPower, formatConsumption, cn } from "@/lib/utils";
import { VehicleSpecTabs } from "@/components/vehicle/VehicleSpecTabs";

const TOYOTA_RED = "#EB0A1E";
const EASE_PREMIUM = [0.22, 1, 0.36, 1] as const;

function ScrollReveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: EASE_PREMIUM }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function VehicleDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : "";

  const [activeColor, setActiveColor] = useState(0);
  const [galleryIdx, setGalleryIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const raw = VEHICLES_DATA.find((v) => v.id === id);

  useEffect(() => {
    setGalleryIdx(0);
    setActiveColor(0);
    setLightboxOpen(false);
  }, [id]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [lightboxOpen]);

  if (!raw) notFound();
  const vehicle = getEnrichedVehicle(raw);

  const images = vehicle.images?.length ? vehicle.images : vehicle.imageUrl ? [vehicle.imageUrl] : [];

  const related = VEHICLES_DATA.filter(
    (v) => v.id !== vehicle.id && v.category === vehicle.category
  ).slice(0, 3);
  const relatedVehicles =
    related.length > 0
      ? related
      : VEHICLES_DATA.filter((v) => v.id !== vehicle.id).slice(0, 3);

  const prevImg = () =>
    setGalleryIdx((i) => ((i - 1) + images.length) % images.length);
  const nextImg = () => setGalleryIdx((i) => (i + 1) % images.length);

  const keySpecs = [
    { icon: Zap, label: "Puissance", value: formatPower(vehicle.specs.power) },
    { icon: Fuel, label: "Consommation", value: formatConsumption(vehicle.specs.consumption) },
    { icon: Users, label: "Places", value: `${vehicle.specs.seats} places` },
    { icon: Timer, label: "0–100 km/h", value: `${vehicle.specs.zeroto100} s` },
    { icon: Cog, label: "Moteur", value: vehicle.specs.engineType },
    { icon: Gauge, label: "Transmission", value: vehicle.specs.drivetrain },
  ];

  return (
    <div className="bg-[#080808] min-h-screen pt-16">
      {/* ══ PAGE HERO — typography & breadcrumbs ═════════════════════════════ */}
      <section className="relative bg-[#080808] border-b border-white/[0.06] overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="section-container relative py-8 md:py-12">
          <motion.nav
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE_PREMIUM }}
            className="flex items-center gap-2 text-xs text-white/40 mb-6"
            aria-label="Fil d'Ariane"
          >
            <Link href="/" className="hover:text-white transition-colors">
              Accueil
            </Link>
            <ChevronRight className="h-3 w-3 shrink-0" />
            <Link href="/vehicles" className="hover:text-white transition-colors">
              Véhicules
            </Link>
            <ChevronRight className="h-3 w-3 shrink-0" />
            <span className="text-white/70 font-medium truncate">
              {vehicle.name.replace(/^Toyota\s+/i, "")}
            </span>
          </motion.nav>

          <motion.span
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease: EASE_PREMIUM }}
            className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.35em] text-[#EB0A1E] mb-4"
          >
            <span className="w-6 h-px bg-[#EB0A1E]" />
            {vehicle.category}
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 28, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.75, delay: 0.12, ease: EASE_PREMIUM }}
            className="text-[clamp(2.5rem,7vw,4.5rem)] font-black text-white leading-[0.92] tracking-[-0.03em] mb-3"
          >
            {vehicle.name}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.22, ease: EASE_PREMIUM }}
            className="text-toyota-gold text-xl md:text-2xl font-black tabular-nums"
          >
            À partir de {formatPrice(vehicle.priceFrom)}
          </motion.p>
        </div>
      </section>

      {/* ══ GALLERY — same carousel logic, premium shell + lightbox ════════ */}
      <section className="relative bg-black">
        <div className="relative h-[min(62vh,560px)] min-h-[360px] overflow-hidden">
          <AnimatePresence mode="sync">
            <motion.div
              key={galleryIdx}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.65, ease: EASE_PREMIUM }}
              className="absolute inset-0 cursor-zoom-in"
              onClick={() => images.length > 0 && setLightboxOpen(true)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && images.length > 0 && setLightboxOpen(true)}
              aria-label="Agrandir l'image"
            >
              {images[galleryIdx] && (
                <Image
                  src={images[galleryIdx]}
                  alt={`Toyota ${vehicle.name}`}
                  fill
                  className="object-contain object-center bg-black"
                  priority
                  sizes="100vw"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
              )}
            </motion.div>
          </AnimatePresence>

          <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-[#080808]/40 pointer-events-none" />

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevImg();
                }}
                className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-10 w-11 h-11 border border-white/15 bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/10 hover:border-white/30 transition-all"
                aria-label="Image précédente"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextImg();
                }}
                className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-10 w-11 h-11 border border-white/15 bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/10 hover:border-white/30 transition-all"
                aria-label="Image suivante"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}

          {images.length > 0 && (
            <button
              onClick={() => setLightboxOpen(true)}
              className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/55 border border-white/15 text-white/70 text-[10px] font-bold uppercase tracking-wider hover:text-white hover:border-white/30 transition-all"
            >
              <Maximize2 className="h-3 w-3" />
              Agrandir
            </button>
          )}
        </div>

        {images.length > 1 && (
          <div className="bg-[#080808] border-b border-white/[0.06] py-4">
            <div className="section-container flex justify-center gap-2">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setGalleryIdx(i)}
                  className={cn(
                    "rounded-full transition-all duration-300",
                    i === galleryIdx
                      ? "w-8 h-1.5 bg-[#EB0A1E]"
                      : "w-1.5 h-1.5 bg-white/25 hover:bg-white/50"
                  )}
                  aria-label={"Photo " + (i + 1)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Thumbnail strip — curtain wipe on scroll */}
        {images.length > 1 && (
          <ScrollReveal className="bg-[#080808] border-b border-white/[0.06] py-6">
            <div className="section-container">
              <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
                {images.map((src, i) => (
                  <motion.button
                    key={src + i}
                    initial={{ clipPath: "inset(0 100% 0 0)" }}
                    whileInView={{ clipPath: "inset(0 0% 0 0)" }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.55, delay: i * 0.08, ease: EASE_PREMIUM }}
                    onClick={() => {
                      setGalleryIdx(i);
                      setLightboxOpen(true);
                    }}
                    className={cn(
                      "relative shrink-0 w-28 h-20 md:w-36 md:h-24 rounded-lg overflow-hidden border transition-all duration-300",
                      i === galleryIdx
                        ? "border-[#EB0A1E]/60 ring-1 ring-[#EB0A1E]/30"
                        : "border-white/10 hover:border-white/25"
                    )}
                  >
                    <Image
                      src={src}
                      alt={`${vehicle.name} ${i + 1}`}
                      fill
                      className="object-contain bg-black p-1"
                      sizes="144px"
                    />
                  </motion.button>
                ))}
              </div>
            </div>
          </ScrollReveal>
        )}
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && images[galleryIdx] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 md:p-10"
            onClick={() => setLightboxOpen(false)}
          >
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-5 right-5 w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-colors z-10"
              aria-label="Fermer"
            >
              <X className="h-5 w-5" />
            </button>
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImg();
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 border border-white/20 flex items-center justify-center text-white hover:bg-white/10 z-10"
                  aria-label="Précédent"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImg();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 border border-white/20 flex items-center justify-center text-white hover:bg-white/10 z-10"
                  aria-label="Suivant"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.35, ease: EASE_PREMIUM }}
              className="relative w-full max-w-5xl aspect-[16/10]"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={images[galleryIdx]}
                alt={`Toyota ${vehicle.name}`}
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 1024px"
                loading="lazy"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ KEY SPECS GRID ═════════════════════════════════════════════════ */}
      <section className="bg-[#080808] py-12 md:py-16 border-b border-white/[0.06]">
        <div className="section-container">
          <ScrollReveal>
            <p className="text-white/45 text-[10px] font-bold uppercase tracking-[0.4em] mb-6 flex items-center gap-2">
              <span className="h-px w-8 bg-white/20" />
              Fiche rapide
            </p>
          </ScrollReveal>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            {keySpecs.map((spec, i) => (
              <motion.div
                key={spec.label}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.55, delay: i * 0.07, ease: EASE_PREMIUM }}
                className="relative bg-[#111111] border border-white/[0.06] rounded-xl p-4 overflow-hidden group hover:border-white/15 hover:bg-[#141414] transition-colors duration-300"
              >
                <span className="absolute top-0 left-0 right-0 h-px bg-white/10 group-hover:bg-white/25 transition-colors duration-300" />
                <spec.icon className="h-4 w-4 text-white/25 mb-3" />
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/35 mb-1">
                  {spec.label}
                </p>
                <p className="text-white font-black text-sm md:text-base leading-tight">
                  {spec.value}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ MAIN CONTENT ═══════════════════════════════════════════════════ */}
      <div className="section-container py-14 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
          <div className="lg:col-span-2 space-y-14">
            {/* Description */}
            <ScrollReveal>
              <blockquote
                className="text-[clamp(1.35rem,3vw,1.85rem)] font-black leading-snug tracking-tight mb-6 pl-5 border-l-[3px]"
                style={{ borderColor: TOYOTA_RED, color: TOYOTA_RED }}
              >
                &ldquo;{vehicle.tagline}&rdquo;
              </blockquote>
              <p className="text-white/55 text-base md:text-lg leading-[1.75] font-light max-w-3xl">
                {vehicle.description}
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <div className="rounded-2xl border border-white/[0.06] bg-[#111111] p-5 md:p-6">
                <VehicleSpecTabs vehicle={vehicle} />
              </div>
            </ScrollReveal>

            {/* Color options — logic unchanged */}
            <ScrollReveal delay={0.05}>
              <div>
                <h2 className="text-white text-xl md:text-2xl font-black mb-6 tracking-tight">
                  Couleurs Disponibles
                </h2>
                <div className="flex flex-wrap gap-5">
                  {vehicle.colors.map((color, i) => (
                    <button
                      key={color.id}
                      onClick={() => setActiveColor(i)}
                      title={color.name}
                      className="flex flex-col items-center gap-1.5 group"
                    >
                      <div
                        className={cn(
                          "w-11 h-11 rounded-full border-2 transition-all duration-200",
                          i === activeColor
                            ? "border-[#EB0A1E] scale-110 shadow-lg shadow-black/40"
                            : "border-white/20 hover:border-white/50 hover:scale-105"
                        )}
                        style={{ backgroundColor: color.hex }}
                      />
                      <span
                        className={cn(
                          "text-[10px] font-medium transition-colors",
                          i === activeColor ? "text-white" : "text-white/40"
                        )}
                      >
                        {color.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* Wheels */}
            <ScrollReveal delay={0.08}>
              <div>
                <h2 className="text-white text-xl md:text-2xl font-black mb-5 tracking-tight">
                  Options de Jantes
                </h2>
                <div className="flex flex-wrap gap-3">
                  {vehicle.wheels.map((wheel) => (
                    <div
                      key={wheel.id}
                      className="px-4 py-3 rounded-xl bg-[#111111] border border-white/[0.06] text-sm hover:border-white/15 transition-colors"
                    >
                      <p className="text-white font-semibold">{wheel.name}</p>
                      <p className="text-white/40 text-xs mt-0.5">{wheel.size}</p>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Sticky CTA panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.35, ease: EASE_PREMIUM }}
                className="p-6 md:p-7 rounded-2xl bg-[#111111] border border-white/[0.06]"
              >
                <p className="text-white/40 text-xs font-bold uppercase tracking-wider mb-1">
                  Prix de départ
                </p>
                <p className="text-3xl font-black text-white mb-0.5 tabular-nums">
                  {formatPrice(vehicle.priceFrom)}
                </p>
                <p className="text-white/30 text-xs mb-7">
                  Tarif Maroc TTC · Hors options
                </p>
                <div className="space-y-3">
                  <ToyotaPrimaryCta
                    href={"/configurator/" + vehicle.id}
                    className="w-full justify-center"
                    showArrow={false}
                  >
                    <Settings className="h-4 w-4" />
                    Configurer en 3D
                    <ArrowRight className="h-4 w-4" />
                  </ToyotaPrimaryCta>
                  <BorderDrawButton
                    href={`/acheter?vehicle=${vehicle.id}&type=test_drive`}
                    className="w-full justify-center"
                  >
                    Réserver un Essai
                  </BorderDrawButton>
                  <BorderDrawButton
                    accent="red"
                    onClick={() => window.dispatchEvent(new CustomEvent("openChatWidget"))}
                    className="w-full justify-center !text-sm"
                  >
                    Aide du Conseiller IA
                  </BorderDrawButton>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.45, ease: EASE_PREMIUM }}
                className="p-5 rounded-2xl bg-[#111111] border border-white/[0.06] space-y-3"
              >
                <p className="text-white font-bold text-sm mb-1">Points Forts</p>
                {[
                  vehicle.specs.power + " ch — 0 à 100 en " + vehicle.specs.zeroto100 + "s",
                  vehicle.specs.seats + " places — " + vehicle.specs.engine,
                  vehicle.specs.consumption + " L/100km — efficacité optimale",
                ].map((point) => (
                  <div key={point} className="flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#EB0A1E] mt-1.5 shrink-0" />
                    <p className="text-white/45 text-xs leading-relaxed">{point}</p>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>

        {/* Related vehicles */}
        {relatedVehicles.length > 0 && (
          <ScrollReveal className="mt-24 md:mt-28">
            <div className="flex items-end justify-between mb-8">
              <h2 className="text-white text-2xl font-black tracking-tight">
                Véhicules Similaires
              </h2>
              <Link
                href="/vehicles"
                className="group flex items-center gap-1.5 text-sm font-semibold text-white/40 hover:text-white transition-colors"
              >
                Voir tout
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 md:gap-6">
              {relatedVehicles.map((rv) => (
                <Link
                  key={rv.id}
                  href={"/vehicles/" + rv.id}
                  className="group rounded-2xl overflow-hidden bg-[#111111] border border-white/[0.06] hover:border-[#EB0A1E]/35 transition-colors duration-300"
                >
                  <div className="relative h-44 overflow-hidden bg-black">
                    {rv.imageUrl && (
                      <Image
                        src={rv.imageUrl}
                        alt={`Toyota ${rv.name}`}
                        fill
                        className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 50vw, 33vw"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = "none";
                        }}
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111111] to-transparent pointer-events-none" />
                  </div>
                  <div className="p-4">
                    <p className="text-white font-bold text-sm group-hover:text-[#EB0A1E] transition-colors">
                      {rv.name}
                    </p>
                    <p className="text-toyota-gold text-xs font-bold mt-0.5 tabular-nums">
                      {formatPrice(rv.priceFrom)}
                    </p>
                    <p className="text-white/35 text-xs mt-0.5">{rv.category}</p>
                  </div>
                </Link>
              ))}
            </div>
          </ScrollReveal>
        )}
      </div>
    </div>
  );
}
