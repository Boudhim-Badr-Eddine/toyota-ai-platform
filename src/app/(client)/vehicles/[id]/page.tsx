"use client";

import { useState } from "react";
import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { VEHICLES_DATA } from "@/data/vehicles";
import { getEnrichedVehicle } from "@/data/vehicleEnrichments";
import { formatPrice, cn } from "@/lib/utils";
import { VehicleSpecTabs } from "@/components/vehicle/VehicleSpecTabs";

// ─── Page ───────────────────────────────────────────────────────────────────────

export default function VehicleDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : "";

  const raw = VEHICLES_DATA.find((v) => v.id === id);
  if (!raw) notFound();
  const vehicle = getEnrichedVehicle(raw);

  const [activeColor, setActiveColor] = useState(0);
  const [galleryIdx, setGalleryIdx] = useState(0);

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

  return (
    <div className="bg-toyota-dark min-h-screen pt-16">
        {/* ══ HERO IMAGE ═══════════════════════════════════════════════════════ */}
        <section className="relative h-[75vh] min-h-[520px] overflow-hidden bg-black">
          <AnimatePresence mode="sync">
            <motion.div
              key={galleryIdx}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              {images[galleryIdx] && (
                <Image
                  src={images[galleryIdx]}
                  alt={`Toyota ${vehicle.name}`}
                  fill
                  className="object-cover"
                  priority
                  sizes="100vw"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Overlays */}
          <div className="absolute inset-0 bg-linear-to-t from-toyota-dark via-toyota-dark/15 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-linear-to-r from-toyota-dark/55 to-transparent pointer-events-none" />

          {/* Breadcrumbs */}
          <div className="absolute top-20 left-0 right-0 z-10">
            <div className="section-container">
              <nav className="flex items-center gap-1.5 text-xs text-white/50" aria-label="Fil d'Ariane">
                <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
                <ChevronRight className="h-3 w-3" />
                <Link href="/vehicles" className="hover:text-white transition-colors">Véhicules</Link>
                <ChevronRight className="h-3 w-3" />
                <span className="text-white/80 font-medium">{vehicle.name}</span>
              </nav>
            </div>
          </div>

          {/* Gallery nav arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImg}
                className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/25 transition-all"
                aria-label="Image précédente"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={nextImg}
                className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/25 transition-all"
                aria-label="Image suivante"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}

          {/* Title overlay at bottom */}
          <div className="absolute bottom-0 left-0 right-0 z-10">
            <div className="section-container pb-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <span className="text-toyota-red text-xs font-bold uppercase tracking-widest">
                  {vehicle.category}
                </span>
                <h1 className="text-4xl md:text-6xl font-black text-white mt-1 mb-2 tracking-tight">
                  {vehicle.name}
                </h1>
                <p className="text-toyota-gold text-xl font-bold">
                  À partir de {formatPrice(vehicle.priceFrom)}
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Gallery dots */}
        {images.length > 1 && (
          <div className="flex justify-center gap-2 py-4 bg-toyota-dark border-b border-white/5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setGalleryIdx(i)}
                className={cn(
                  "rounded-full transition-all duration-300",
                  i === galleryIdx
                    ? "w-7 h-2 bg-toyota-red"
                    : "w-2 h-2 bg-white/25 hover:bg-white/50"
                )}
                aria-label={"Photo " + (i + 1)}
              />
            ))}
          </div>
        )}

        {/* ══ MAIN CONTENT ════════════════════════════════════════════════════ */}
        <div className="section-container py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* ── LEFT: info ──────────────────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-12">
              {/* Tagline + Description */}
              <div>
                <h2 className="text-white text-2xl font-bold mb-2">
                  {vehicle.tagline}
                </h2>
                <p className="text-toyota-muted leading-relaxed text-base">
                  {vehicle.description}
                </p>
              </div>

              {/* Full spec tabs */}
              <VehicleSpecTabs vehicle={vehicle} />

              {/* Color options */}
              <div>
                <h2 className="text-white text-2xl font-bold mb-6">
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
                          "w-10 h-10 rounded-full border-2 transition-all duration-200",
                          i === activeColor
                            ? "border-toyota-red scale-110 shadow-lg shadow-black/30"
                            : "border-white/20 hover:border-white/50 hover:scale-105"
                        )}
                        style={{ backgroundColor: color.hex }}
                      />
                      <span
                        className={cn(
                          "text-[10px] font-medium transition-colors",
                          i === activeColor ? "text-white" : "text-toyota-muted/50"
                        )}
                      >
                        {color.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Wheels */}
              <div>
                <h2 className="text-white text-2xl font-bold mb-5">
                  Options de Jantes
                </h2>
                <div className="flex flex-wrap gap-3">
                  {vehicle.wheels.map((wheel) => (
                    <div
                      key={wheel.id}
                      className="px-4 py-2.5 rounded-xl bg-[#111111] border border-white/5 text-sm"
                    >
                      <p className="text-white font-semibold">{wheel.name}</p>
                      <p className="text-toyota-muted text-xs">{wheel.size}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── RIGHT: sticky CTA panel ──────────────────────────────────── */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-4">
                {/* Price + CTAs */}
                <div className="p-6 rounded-2xl bg-[#111111] border border-white/5">
                  <p className="text-toyota-muted text-sm mb-1">Prix de départ</p>
                  <p className="text-3xl font-black text-white mb-0.5">
                    {formatPrice(vehicle.priceFrom)}
                  </p>
                  <p className="text-toyota-muted/50 text-xs mb-6">
                    Tarif Maroc TTC · Hors options
                  </p>
                  <div className="space-y-3">
                    <Link
                      href={"/configurator/" + vehicle.id}
                      className="flex items-center justify-center gap-2 w-full py-3.5 bg-toyota-red text-white font-bold rounded-full hover:bg-toyota-red/90 transition-colors"
                    >
                      <Settings className="h-4 w-4" />
                      Configurer en 3D
                    </Link>
                    <Link
                      href={`/acheter?vehicle=${vehicle.id}&type=test_drive`}
                      className="flex items-center justify-center gap-2 w-full py-3.5 border border-white/15 text-white font-semibold rounded-full hover:bg-white/5 transition-colors"
                    >
                      Réserver un Essai
                    </Link>
                    <button
                      onClick={() => window.dispatchEvent(new CustomEvent('openChatWidget'))}
                      className="flex items-center justify-center gap-2 w-full py-3 border border-toyota-red/30 text-toyota-red font-semibold rounded-full hover:bg-toyota-red/10 transition-colors text-sm"
                    >
                      Aide du Conseiller IA
                    </button>
                  </div>
                </div>

                {/* Quick highlights */}
                <div className="p-5 rounded-2xl bg-[#111111] border border-white/5 space-y-3">
                  <p className="text-white font-semibold text-sm mb-1">Points Forts</p>
                  {[
                    vehicle.specs.power + " ch — 0 à 100 en " + vehicle.specs.zeroto100 + "s",
                    vehicle.specs.seats + " places — " + vehicle.specs.engine,
                    vehicle.specs.consumption + " L/100km — efficacité optimale",
                  ].map((point) => (
                    <div key={point} className="flex items-start gap-2.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-toyota-red mt-1.5 shrink-0" />
                      <p className="text-toyota-muted text-xs leading-relaxed">{point}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── RELATED VEHICLES ────────────────────────────────────────── */}
          {relatedVehicles.length > 0 && (
            <div className="mt-24">
              <div className="flex items-end justify-between mb-8">
                <h2 className="text-white text-2xl font-bold">Véhicules Similaires</h2>
                <Link
                  href="/vehicles"
                  className="flex items-center gap-1.5 text-sm font-semibold text-toyota-muted hover:text-white transition-colors"
                >
                  Voir tout
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {relatedVehicles.map((rv) => (
                  <Link
                    key={rv.id}
                    href={"/vehicles/" + rv.id}
                    className="group rounded-2xl overflow-hidden bg-[#111111] border border-white/5 hover:border-toyota-red/30 transition-all duration-300"
                  >
                    <div className="relative h-44 overflow-hidden bg-[#0D0D0D]">
                      {rv.imageUrl && (
                        <Image
                          src={rv.imageUrl}
                          alt={`Toyota ${rv.name}`}
                          fill
                          className="object-cover group-hover:scale-[1.04] transition-transform duration-500"
                          sizes="(max-width: 768px) 50vw, 33vw"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                        />
                      )}
                      <div className="absolute inset-0 bg-linear-to-t from-[#111111]/60 to-transparent pointer-events-none" />
                    </div>
                    <div className="p-4">
                      <p className="text-white font-bold text-sm group-hover:text-toyota-red transition-colors">
                        {rv.name}
                      </p>
                      <p className="text-toyota-gold text-xs font-semibold mt-0.5">
                        {formatPrice(rv.priceFrom)}
                      </p>
                      <p className="text-toyota-muted/60 text-xs mt-0.5">{rv.category}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
