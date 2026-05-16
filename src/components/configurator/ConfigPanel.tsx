"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown, Calendar, ChevronLeft, DiscAlbum, Sparkles } from "lucide-react";
import Link from "next/link";
import { useConfiguratorStore } from "@/store/configuratorStore";
import { formatPrice, cn } from "@/lib/utils";
import type { VehicleColor, VehicleWheel, VehicleInterior } from "@/types";
import { AIStyleAdvisor } from "./AIStyleAdvisor";

// ─── Animated number counter ──────────────────────────────────────────────────

function AnimatedPrice({ value }: { value: number }) {
  const [displayed, setDisplayed] = useState(value);
  const prevRef = useRef(value);

  useEffect(() => {
    const start = prevRef.current;
    const end = value;
    if (start === end) return;
    prevRef.current = end;

    const duration = 500;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
      setDisplayed(Math.round(start + (end - start) * ease));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value]);

  return <>{formatPrice(displayed)}</>;
}

// ─── Material badge labels ─────────────────────────────────────────────────────

const MATERIAL_LABELS: Record<string, { label: string; className: string }> = {
  fabric:            { label: "Tissu",        className: "bg-blue-50 text-blue-600 border-blue-200" },
  leather:           { label: "Cuir",         className: "bg-amber-50 text-amber-600 border-amber-200" },
  "premium-leather": { label: "Cuir Premium", className: "bg-yellow-50 text-yellow-700 border-yellow-300" },
};

// ─── Color price extras ───────────────────────────────────────────────────────

function colorExtra(type: string): number {
  if (type === "pearl") return 5000;
  if (type === "metallic") return 3000;
  return 0;
}
function interiorExtra(material: string): number {
  if (material === "premium-leather") return 18000;
  if (material === "leather") return 8000;
  return 0;
}
function wheelExtra(size: string): number {
  const surcharge: Record<string, number> = {
    "16 pouces": 2000,
    "17 pouces": 4000,
    "18 pouces": 7000,
    "19 pouces": 10000,
    "20 pouces": 14000,
    "21 pouces": 18000,
  };
  return surcharge[size] ?? 0;
}

// ─── Section wrapper ───────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mb-3.5">
        {title}
      </h3>
      {children}
    </div>
  );
}

// ─── Color swatches (52px, name shown below selected) ────────────────────────

function ColorSwatches({
  colors, selected, onSelect,
}: {
  colors: VehicleColor[];
  selected: VehicleColor | null;
  onSelect: (c: VehicleColor) => void;
}) {
  return (
    <div>
      <div className="flex flex-wrap gap-3.5 mb-3">
        {colors.map((color) => {
          const isSel = selected?.id === color.id;
          const isLight = ["#FFFFFF", "#F5F5F5", "#F9FAFB", "#FFFAF0"].includes(color.hex.toUpperCase());
          return (
            <button
              key={color.id}
              title={color.name}
              onClick={() => onSelect(color)}
              className={cn(
                "relative w-13 h-13 rounded-full transition-all duration-200 focus:outline-none",
                isSel
                  ? "ring-3 ring-toyota-red ring-offset-3 ring-offset-white scale-110 shadow-xl"
                  : "ring-1 ring-gray-200 hover:ring-gray-400 hover:scale-105"
              )}
              style={{ width: 52, height: 52, backgroundColor: color.hex }}
              aria-label={color.name}
              aria-pressed={isSel}
            >
              <AnimatePresence>
                {isSel && (
                  <motion.span
                    key="check"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 450, damping: 20 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <Check
                      className="h-5 w-5 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]"
                      style={{ color: isLight ? "#000" : "#fff" }}
                      strokeWidth={3}
                    />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          );
        })}
      </div>
      {/* Selected color name */}
      {selected && (
        <motion.div
          key={selected.id}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2"
        >
          <span
            className="w-3.5 h-3.5 rounded-full border border-gray-200 shrink-0"
            style={{ backgroundColor: selected.hex }}
          />
          <span className="text-sm font-semibold text-gray-800">{selected.name}</span>
          <span className="text-xs text-gray-400">
            {selected.type === "pearl" ? "Nacré · +5 000 MAD"
              : selected.type === "metallic" ? "Métallisé · +3 000 MAD"
              : "Uni · inclus"}
          </span>
        </motion.div>
      )}
    </div>
  );
}

// ─── Wheel option card ────────────────────────────────────────────────────────

function WheelCard({
  wheel, isSelected, onSelect,
}: {
  wheel: VehicleWheel;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full flex items-center gap-3 px-3.5 py-3 rounded-xl border text-left transition-all duration-200",
        isSelected
          ? "border-toyota-red bg-toyota-red/5 shadow-sm shadow-toyota-red/10"
          : "border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100"
      )}
    >
      <div className={cn(
        "w-9 h-9 rounded-full border-2 flex items-center justify-center shrink-0",
        isSelected ? "border-toyota-red bg-toyota-red/10" : "border-gray-300 bg-white"
      )}>
        <DiscAlbum className={cn("h-4 w-4", isSelected ? "text-toyota-red" : "text-gray-400")} />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-sm text-gray-900 font-semibold block truncate">{wheel.name}</span>
        <span className="text-[11px] text-gray-400">{wheel.size}</span>
      </div>
      {isSelected && <Check className="h-4 w-4 text-toyota-red shrink-0" strokeWidth={2.5} />}
    </button>
  );
}

// ─── Interior option card ─────────────────────────────────────────────────────

function InteriorCard({
  interior, isSelected, onSelect,
}: {
  interior: VehicleInterior;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const matInfo = MATERIAL_LABELS[interior.material];
  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full flex items-center gap-3 px-3.5 py-3 rounded-xl border text-left transition-all duration-200",
        isSelected
          ? "border-toyota-red bg-toyota-red/5 shadow-sm shadow-toyota-red/10"
          : "border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100"
      )}
    >
      <span
        className="w-7 h-7 rounded-full border-2 border-gray-200 shrink-0 shadow-sm"
        style={{ backgroundColor: interior.colorHex }}
      />
      <span className="flex-1 text-sm text-gray-900 font-semibold truncate">{interior.name}</span>
      {matInfo && (
        <span className={cn("text-[10px] px-2 py-0.5 rounded-full border font-semibold shrink-0", matInfo.className)}>
          {matInfo.label}
        </span>
      )}
      {isSelected && <Check className="h-4 w-4 text-toyota-red shrink-0" strokeWidth={2.5} />}
    </button>
  );
}

// ─── Price breakdown (always visible, expanded) ───────────────────────────────

function PriceBreakdown({
  base, total, selectedColor, selectedInterior, selectedWheels,
}: {
  base: number;
  total: number;
  selectedColor: VehicleColor | null;
  selectedInterior: VehicleInterior | null;
  selectedWheels: VehicleWheel | null;
}) {
  const colorExtras = selectedColor ? colorExtra(selectedColor.type) : 0;
  const intExtras = selectedInterior ? interiorExtra(selectedInterior.material) : 0;
  const wheelExtras = selectedWheels ? wheelExtra(selectedWheels.size) : 0;
  const hasOptions = colorExtras > 0 || intExtras > 0 || wheelExtras > 0;

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-0.5">
            Prix configuré
          </p>
          <p className="text-3xl font-black text-gray-900 tracking-tight leading-tight">
            <AnimatedPrice value={total} />
          </p>
        </div>
        {hasOptions && (
          <div className="text-right">
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-0.5">Options</p>
            <p className="text-sm font-bold text-toyota-red">+<AnimatedPrice value={total - base} /></p>
          </div>
        )}
      </div>

      {/* Breakdown rows */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-gray-500">
          <span>Prix de base</span>
          <span className="font-medium text-gray-700">{formatPrice(base)}</span>
        </div>
        {colorExtras > 0 && selectedColor && (
          <div className="flex justify-between text-gray-500">
            <span>Couleur {selectedColor.type === "pearl" ? "nacrée" : "métallisée"}</span>
            <span className="font-medium text-toyota-red">+{formatPrice(colorExtras)}</span>
          </div>
        )}
        {wheelExtras > 0 && selectedWheels && (
          <div className="flex justify-between text-gray-500">
            <span>Jantes {selectedWheels.size}</span>
            <span className="font-medium text-toyota-red">+{formatPrice(wheelExtras)}</span>
          </div>
        )}
        {intExtras > 0 && selectedInterior && (
          <div className="flex justify-between text-gray-500">
            <span>{selectedInterior.material === "leather" ? "Cuir" : "Cuir Premium"}</span>
            <span className="font-medium text-toyota-red">+{formatPrice(intExtras)}</span>
          </div>
        )}
        <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-gray-900">
          <span>Total</span>
          <span><AnimatedPrice value={total} /></span>
        </div>
      </div>
    </div>
  );
}

// ─── AI Style Advisor (collapsible) ───────────────────────────────────────────

function AIAdvisorCard() {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3.5 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        <div className="w-8 h-8 rounded-lg bg-toyota-red/10 flex items-center justify-center shrink-0">
          <Sparkles className="h-4 w-4 text-toyota-red" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-gray-800">Conseiller Style IA</p>
          <p className="text-[11px] text-gray-400">Recommandations personnalisées</p>
        </div>
        <ChevronDown className={cn("h-4 w-4 text-gray-400 transition-transform", open && "rotate-180")} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="p-4 border-t border-gray-100">
              <AIStyleAdvisor />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── ConfigPanel ──────────────────────────────────────────────────────────────

export function ConfigPanel() {
  const {
    selectedVehicle, selectedColor, selectedWheels, selectedInterior,
    totalPrice, setColor, setWheels, setInterior,
  } = useConfiguratorStore();

  const [showLeadModal, setShowLeadModal] = useState(false);

  if (!selectedVehicle) {
    return (
      <div className="flex items-center justify-center h-full bg-white">
        <p className="text-gray-400 text-sm">Aucun véhicule sélectionné.</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-full bg-white">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="px-5 pt-4 pb-4 border-b border-gray-100 shrink-0">
          <Link
            href={`/vehicles/${selectedVehicle.id}`}
            className="inline-flex items-center gap-1 text-gray-400 hover:text-toyota-red transition-colors text-xs font-medium mb-3"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Changer de modèle
          </Link>
          <h2 className="text-gray-900 text-xl font-black leading-tight tracking-tight">
            {selectedVehicle.name}
          </h2>
          <p className="text-gray-400 text-xs mt-0.5">{selectedVehicle.category}</p>
        </div>

        {/* ── Scrollable options ──────────────────────────────────────────── */}
        <div
          className="flex-1 overflow-y-auto px-5 pt-5 pb-3 min-h-0"
          style={{ scrollbarWidth: "thin", scrollbarColor: "#e5e7eb transparent" }}
        >
          {/* Colors */}
          <Section title="Couleur extérieure">
            <ColorSwatches
              colors={selectedVehicle.colors}
              selected={selectedColor}
              onSelect={setColor}
            />
          </Section>

          {/* Wheels */}
          <Section title="Jantes">
            <div className="space-y-2">
              {selectedVehicle.wheels.map((wheel) => (
                <WheelCard
                  key={wheel.id}
                  wheel={wheel}
                  isSelected={selectedWheels?.id === wheel.id}
                  onSelect={() => setWheels(wheel)}
                />
              ))}
            </div>
          </Section>

          {/* Interior */}
          <Section title="Sellerie intérieure">
            <div className="space-y-2">
              {selectedVehicle.interiors.map((interior) => (
                <InteriorCard
                  key={interior.id}
                  interior={interior}
                  isSelected={selectedInterior?.id === interior.id}
                  onSelect={() => setInterior(interior)}
                />
              ))}
            </div>
          </Section>

          {/* Divider */}
          <div className="border-t border-gray-100 mb-5" />

          {/* Price breakdown */}
          <PriceBreakdown
            base={selectedVehicle.priceFrom}
            total={totalPrice}
            selectedColor={selectedColor}
            selectedInterior={selectedInterior}
            selectedWheels={selectedWheels}
          />

          {/* Reserve button */}
          <motion.button
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.975 }}
            onClick={() => setShowLeadModal(true)}
            className="w-full bg-toyota-red hover:bg-toyota-red/90 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors shadow-xl shadow-toyota-red/25 text-base mb-4"
          >
            <Calendar className="h-5 w-5" />
            Réserver un Essai
          </motion.button>

          {/* AI Advisor (collapsible) */}
          <AIAdvisorCard />

          <div className="h-4" />
        </div>
      </div>

      {/* Lead Modal */}
      <AnimatePresence>
        {showLeadModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && setShowLeadModal(false)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }} transition={{ duration: 0.3, ease: "easeOut" }}
              className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl"
            >
              <h2 className="text-gray-900 text-xl font-bold mb-1">Réserver un Essai</h2>
              <p className="text-gray-500 text-sm mb-5">Un conseiller vous contacte sous 24h.</p>
              <div className="text-center py-6">
                <Calendar className="h-10 w-10 text-toyota-red mx-auto mb-3" />
                <p className="text-gray-500 text-sm">
                  Rendez-vous sur la page{" "}
                  <a href="/contact" className="text-toyota-red underline font-medium">Contact</a>{" "}
                  pour finaliser votre demande d&apos;essai.
                </p>
              </div>
              <button
                onClick={() => setShowLeadModal(false)}
                className="w-full mt-2 py-3 rounded-xl border border-gray-200 text-gray-500 text-sm hover:bg-gray-50 transition-colors"
              >
                Fermer
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
