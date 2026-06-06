"use client";

import { Suspense } from "react";
import { LayoutGrid, Sparkles } from "lucide-react";
import { VEHICLES_DATA } from "@/data/vehicles";
import { VehicleGrid } from "@/components/catalog/VehicleGrid";
import { ComparisonBanner } from "@/components/catalog/ComparisonBanner";

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

export function VehiclesPageClient() {
  const vehicles = VEHICLES_DATA;

  const handleOpenChat = () => {
    window.dispatchEvent(new CustomEvent("openChatWidget"));
  };

  return (
    <div className="toyota-page pb-28 lg:pb-16">
      <section className="border-b border-white/[0.06]">
        <div className="section-container py-14 md:py-20 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-white/50 mb-6">
            <LayoutGrid className="h-3.5 w-3.5 text-toyota-red" />
            Gamme complète Toyota Maroc
          </div>

          <h1 className="text-display text-white mb-4">
            Découvrez la <span className="text-toyota-red">Gamme Toyota</span>
          </h1>

          <p className="text-white/45 text-sm md:text-base max-w-2xl mx-auto mb-10 leading-relaxed">
            {vehicles.length} modèles d&apos;exception. Filtrez, comparez et configurez votre
            véhicule Toyota idéal — le tout en 3D.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-8">
            {[
              { value: `${vehicles.length}`, label: "Modèles" },
              { value: "10+", label: "Couleurs" },
              { value: "3D", label: "Configurateur" },
              { value: "6", label: "Hybrides" },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-toyota-red mb-1">{label}</p>
                <p className="text-2xl font-black text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-container pb-2">
        <ComparisonBanner />
      </section>

      <section className="section-container pb-4">
        <div className="toyota-panel px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
            className="toyota-btn-primary shrink-0 flex items-center gap-2 !py-2.5 !px-4 !text-xs"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Consulter l&apos;IA
          </button>
        </div>
      </section>

      <section className="section-container py-10">
        <Suspense fallback={<GridSkeleton />}>
          <VehicleGrid vehicles={vehicles} />
        </Suspense>
      </section>
    </div>
  );
}
