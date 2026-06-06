"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown, Calendar, ChevronLeft, DiscAlbum, Sparkles } from "lucide-react";
import { LeadFormContent } from "@/components/forms/LeadForm";
import Link from "next/link";
import { useConfiguratorStore } from "@/store/configuratorStore";
import { formatPrice, cn } from "@/lib/utils";
import type { VehicleColor, VehicleWheel, VehicleInterior } from "@/types";
import { AIStyleAdvisor } from "./AIStyleAdvisor";
import { FinanceSimulator } from "@/components/commerce/FinanceSimulator";
import { getTrimsForVehicle, type VehicleTrim } from "@/data/vehicleTrims";
import { toast } from "sonner";
import { FileDown } from "lucide-react";

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

// ─── Trim cards ────────────────────────────────────────────────────────────────

function TrimCard({
  trim,
  isSelected,
  onSelect,
}: {
  trim: VehicleTrim;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full text-left rounded-xl border p-3.5 transition-all",
        isSelected
          ? "border-toyota-red bg-toyota-red/10 shadow-lg shadow-toyota-red/10"
          : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
      )}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-bold text-white">{trim.name}</span>
        {isSelected && <Check className="h-4 w-4 text-toyota-red" />}
      </div>
      <p className="text-[11px] text-white/45 mb-2">{trim.tagline}</p>
      <p className="text-xs font-semibold text-toyota-red">
        {trim.priceFrom > 0 ? `À partir de ${formatPrice(trim.priceFrom)}` : "Inclus"}
      </p>
    </button>
  );
}

async function downloadQuotePdf(
  vehicleName: string,
  trimName: string | undefined,
  base: number,
  total: number,
  selectedColor: VehicleColor | null,
  selectedWheels: VehicleWheel | null,
  selectedInterior: VehicleInterior | null
) {
  const cExtra = selectedColor ? colorExtra(selectedColor.type) : 0;
  const wExtra = selectedWheels ? wheelExtra(selectedWheels.size) : 0;
  const iExtra = selectedInterior ? interiorExtra(selectedInterior.material) : 0;

  const res = await fetch("/api/quote", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      vehicleName,
      trimName,
      color: selectedColor?.name,
      wheels: selectedWheels?.name,
      interior: selectedInterior?.name,
      basePrice: base,
      options: [
        ...(cExtra > 0 ? [{ label: `Couleur ${selectedColor?.name}`, amount: cExtra }] : []),
        ...(wExtra > 0 ? [{ label: `Jantes ${selectedWheels?.name}`, amount: wExtra }] : []),
        ...(iExtra > 0 ? [{ label: `Sellerie ${selectedInterior?.name}`, amount: iExtra }] : []),
      ],
      totalPrice: total,
      downPayment: Math.round(total * 0.2),
      termMonths: 48,
      annualRate: 5.9,
    }),
  });
  if (!res.ok) {
    toast.error("Impossible de générer le devis PDF");
    return;
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `devis-toyota-${vehicleName.toLowerCase().replace(/\s+/g, "-")}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success("Devis PDF téléchargé");
}

// ─── Section wrapper ───────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold mb-3.5">
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
            className="w-3.5 h-3.5 rounded-full border border-white/10 shrink-0"
            style={{ backgroundColor: selected.hex }}
          />
          <span className="text-sm font-semibold text-white">{selected.name}</span>
          <span className="text-xs text-white/40">
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
          : "border-white/10 bg-white/5 hover:border-gray-300 hover:bg-white/10"
      )}
    >
      <div className={cn(
        "w-9 h-9 rounded-full border-2 flex items-center justify-center shrink-0",
        isSelected ? "border-toyota-red bg-toyota-red/10" : "border-gray-300 bg-[#121212]"
      )}>
        <DiscAlbum className={cn("h-4 w-4", isSelected ? "text-toyota-red" : "text-white/40")} />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-sm text-white font-semibold block truncate">{wheel.name}</span>
        <span className="text-[11px] text-white/40">{wheel.size}</span>
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
          : "border-white/10 bg-white/5 hover:border-gray-300 hover:bg-white/10"
      )}
    >
      <span
        className="w-7 h-7 rounded-full border-2 border-white/10 shrink-0 shadow-sm"
        style={{ backgroundColor: interior.colorHex }}
      />
      <span className="flex-1 text-sm text-white font-semibold truncate">{interior.name}</span>
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
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-0.5">
            Prix configuré
          </p>
          <p className="text-3xl font-black text-white tracking-tight leading-tight">
            <AnimatedPrice value={total} />
          </p>
        </div>
        {hasOptions && (
          <div className="text-right">
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-0.5">Options</p>
            <p className="text-sm font-bold text-toyota-red">+<AnimatedPrice value={total - base} /></p>
          </div>
        )}
      </div>

      {/* Breakdown rows */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-white/50">
          <span>Prix de base</span>
          <span className="font-medium text-gray-700">{formatPrice(base)}</span>
        </div>
        {colorExtras > 0 && selectedColor && (
          <div className="flex justify-between text-white/50">
            <span>Couleur {selectedColor.type === "pearl" ? "nacrée" : "métallisée"}</span>
            <span className="font-medium text-toyota-red">+{formatPrice(colorExtras)}</span>
          </div>
        )}
        {wheelExtras > 0 && selectedWheels && (
          <div className="flex justify-between text-white/50">
            <span>Jantes {selectedWheels.size}</span>
            <span className="font-medium text-toyota-red">+{formatPrice(wheelExtras)}</span>
          </div>
        )}
        {intExtras > 0 && selectedInterior && (
          <div className="flex justify-between text-white/50">
            <span>{selectedInterior.material === "leather" ? "Cuir" : "Cuir Premium"}</span>
            <span className="font-medium text-toyota-red">+{formatPrice(intExtras)}</span>
          </div>
        )}
        <div className="border-t border-white/10 pt-2 flex justify-between font-bold text-white">
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
    <div className="border border-white/10 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3.5 bg-white/5 hover:bg-white/10 transition-colors text-left"
      >
        <div className="w-8 h-8 rounded-lg bg-toyota-red/10 flex items-center justify-center shrink-0">
          <Sparkles className="h-4 w-4 text-toyota-red" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-white">Conseiller Style IA</p>
          <p className="text-[11px] text-white/40">Recommandations personnalisées</p>
        </div>
        <ChevronDown className={cn("h-4 w-4 text-white/40 transition-transform", open && "rotate-180")} />
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
            <div className="p-4 border-t border-white/10">
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
    selectedVehicle, selectedTrim, selectedColor, selectedWheels, selectedInterior,
    totalPrice, setTrim, setColor, setWheels, setInterior, getConfiguration,
  } = useConfiguratorStore();

  const [showLeadModal, setShowLeadModal] = useState(false);

  if (!selectedVehicle) {
    return (
      <div className="flex items-center justify-center h-full bg-[#121212]">
        <p className="text-white/40 text-sm">Aucun véhicule sélectionné.</p>
      </div>
    );
  }

  const trims = getTrimsForVehicle(selectedVehicle.id);
  const config = getConfiguration();

  return (
    <>
      <div className="flex flex-col h-full bg-[#121212]">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="px-5 pt-4 pb-4 border-b border-white/10 shrink-0">
          <Link
            href={`/vehicles/${selectedVehicle.id}`}
            className="inline-flex items-center gap-1 text-white/40 hover:text-toyota-red transition-colors text-xs font-medium mb-3"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Changer de modèle
          </Link>
          <h2 className="text-white text-xl font-black leading-tight tracking-tight">
            {selectedVehicle.name}
          </h2>
          <p className="text-white/40 text-xs mt-0.5">{selectedVehicle.category}</p>
        </div>

        {/* ── Scrollable options ──────────────────────────────────────────── */}
        <div
          className="flex-1 overflow-y-auto px-5 pt-5 pb-3 min-h-0"
          style={{ scrollbarWidth: "thin", scrollbarColor: "#e5e7eb transparent" }}
        >
          {/* Trim / finition */}
          {trims.length > 1 && (
            <Section title="Finition">
              <div className="space-y-2">
                {trims.map((trim) => (
                  <TrimCard
                    key={trim.id}
                    trim={trim}
                    isSelected={selectedTrim?.id === trim.id}
                    onSelect={() => setTrim(trim)}
                  />
                ))}
              </div>
            </Section>
          )}

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
          <div className="border-t border-white/10 mb-5" />

          {/* Price breakdown */}
          <PriceBreakdown
            base={config.basePrice}
            total={totalPrice}
            selectedColor={selectedColor}
            selectedInterior={selectedInterior}
            selectedWheels={selectedWheels}
          />

          <div className="mb-5">
            <FinanceSimulator key={totalPrice} defaultPrice={totalPrice} className="!p-4 !rounded-xl" />
            <button
              type="button"
              onClick={() =>
                void downloadQuotePdf(
                  selectedVehicle.name,
                  selectedTrim?.name,
                  config.basePrice,
                  totalPrice,
                  selectedColor,
                  selectedWheels,
                  selectedInterior
                )
              }
              className="mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-white/10 text-white/70 hover:text-white hover:border-toyota-red/40 hover:bg-toyota-red/5 text-sm font-semibold transition-colors"
            >
              <FileDown className="h-4 w-4" />
              Télécharger le devis PDF
            </button>
          </div>

          {/* Reserve + Buy */}
          <motion.button
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.975 }}
            onClick={() => setShowLeadModal(true)}
            className="w-full bg-toyota-red hover:bg-toyota-red/90 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors shadow-xl shadow-toyota-red/25 text-base mb-3"
          >
            <Calendar className="h-5 w-5" />
            Réserver un Essai
          </motion.button>
          <Link
            href={`/acheter?vehicle=${selectedVehicle.id}`}
            className="w-full block text-center py-3 rounded-2xl border border-white/10 text-gray-700 font-semibold text-sm hover:bg-white/5 transition-colors mb-4"
          >
            Acheter chez un concessionnaire →
          </Link>

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
              className="w-full max-w-md bg-[#121212] rounded-2xl p-6 shadow-2xl"
            >
              <h2 className="text-white text-xl font-bold mb-1">Réserver un Essai</h2>
              <p className="text-white/50 text-sm mb-5">Un conseiller vous contacte sous 24h.</p>
              <LeadFormContent
                showSummary
                onSuccess={() => setTimeout(() => setShowLeadModal(false), 2500)}
              />
              <button
                onClick={() => setShowLeadModal(false)}
                className="w-full mt-2 py-3 rounded-xl border border-white/10 text-white/50 text-sm hover:bg-white/5 transition-colors"
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
