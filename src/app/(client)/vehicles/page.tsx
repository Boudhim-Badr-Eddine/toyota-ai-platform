'use client';

import { Suspense } from "react";
import { LayoutGrid, Sparkles } from "lucide-react";
import { VEHICLES_DATA } from "@/data/vehicles";
import { VehicleGrid } from "@/components/catalog/VehicleGrid";
import { ComparisonBanner } from "@/components/catalog/ComparisonBanner";

// ─── Catalog page (Client Component) ──────────────────────────────────────────
// Mark as client to allow onClick handlers
// Vehicles are read directly from the static data file to avoid a round-trip
// network fetch in server components. The API route serves external consumers.

export const metadata = {
  title: "Véhicules Toyota — Découvrez tous nos modèles",
  description:
    "Parcourez l'intégralité de la gamme Toyota disponible au Maroc. Filtrez par catégorie, comparez les specs et configurez votre véhicule idéal en 3D.",
};

// ─── Skeleton loader for the grid ─────────────────────────────────────────────

function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="bg-[#111111] border border-white/5 rounded-2xl overflow-hidden animate-pulse"
        >
          <div className="h-52 bg-white/4" />
          <div className="p-4 space-y-3">
            <div className="h-5 bg-white/4 rounded-lg w-3/4" />
            <div className="h-3 bg-white/3 rounded w-1/2" />
            <div className="flex gap-3">
              <div className="h-3 bg-white/3 rounded w-16" />
              <div className="h-3 bg-white/3 rounded w-16" />
              <div className="h-3 bg-white/3 rounded w-20" />
            </div>
            <div className="flex gap-2 pt-2">
              <div className="flex-1 h-9 bg-toyota-red/10 rounded-xl" />
              <div className="w-24 h-9 bg-white/3 rounded-xl" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function VehiclesPage() {
  const vehicles = VEHICLES_DATA;

  const handleOpenChat = () => {
    // Dispatch custom event to open chat widget
    window.dispatchEvent(new CustomEvent('openChatWidget'));
  };

  return (
    <div className="min-h-screen bg-toyota-dark">
      {/* ── Hero ──────────────────────────────────────────────────────────────── */}
      <section className="relative pt-28 pb-16 overflow-hidden">
        {/* Background glow */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 40% at 50% 0%, rgba(235,10,30,0.07) 0%, transparent 70%)",
          }}
        />

        <div className="section-container text-center relative z-10">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-toyota-red/8 border border-toyota-red/15 text-toyota-red text-sm font-medium mb-5">
            <LayoutGrid className="h-4 w-4" />
            <span>Gamme complète Toyota Maroc</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight tracking-tight">
            Découvrez la{" "}
            <span className="gradient-text">Gamme Toyota</span>
          </h1>

          <p className="text-toyota-muted text-lg md:text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
            {vehicles.length} modèles d&apos;exception. Filtrez, comparez et configurez votre
            véhicule Toyota idéal — le tout en 3D.
          </p>

          {/* Stats row */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            {[
              { value: `${vehicles.length}`, label: "Modèles disponibles" },
              { value: "10+", label: "Couleurs par modèle" },
              { value: "3D", label: "Configurateur interactif" },
              { value: "100%", label: "Hybrides disponibles" },
            ].map(({ value, label }) => (
              <div key={label} className="flex flex-col items-center gap-0.5">
                <span className="text-white font-black text-2xl leading-none">{value}</span>
                <span className="text-toyota-muted/70 text-xs">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Comparison hint banner ──────────────────────────────────────────────── */}
      <section className="section-container pb-2">
        <ComparisonBanner />
      </section>

      {/* ── AI Advisor CTA ──────────────────────────────────────────────────────── */}
      <section className="section-container pb-4">
        <div className="bg-linear-to-r from-toyota-red/10 via-toyota-red/5 to-transparent border border-toyota-red/15 rounded-2xl px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-toyota-red/15 border border-toyota-red/25 flex items-center justify-center shrink-0">
              <Sparkles className="h-4 w-4 text-toyota-red" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm leading-tight">
                Vous ne savez pas quel modèle choisir ?
              </p>
              <p className="text-toyota-muted text-xs">
                Notre IA Toyota vous guide en moins de 2 minutes.
              </p>
            </div>
          </div>
          <button
            onClick={handleOpenChat}
            className="shrink-0 flex items-center gap-2 px-4 py-2 bg-toyota-red text-white text-sm font-bold rounded-xl hover:bg-toyota-red/90 transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Consulter l&apos;IA
          </button>
        </div>
      </section>

      {/* ── Vehicle Grid ───────────────────────────────────────────────────────── */}
      <section className="section-container py-10">
        <Suspense fallback={<GridSkeleton />}>
          <VehicleGrid vehicles={vehicles} />
        </Suspense>
      </section>
    </div>
  );
}