"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown, Calendar, ChevronLeft, DiscAlbum, Sparkles, ArrowRight } from "lucide-react";
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
import { BorderDrawButton } from "@/components/ui/BorderDrawButton";

const EASE_PREMIUM = [0.22, 1, 0.36, 1] as const;

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE_PREMIUM } },
};

// ─── Animated number counter ──────────────────────────────────────────────────

function AnimatedPrice({ value }: { value: number }) {
  const [displayed, setDisplayed] = useState(value);
  const prevRef = useRef(value);

  useEffect(() => {
    const start = prevRef.current;
    const end = value;
    if (start === end) return;
    prevRef.current = end;

    const duration = 550;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(start + (end - start) * ease));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value]);

  return <>{formatPrice(displayed)}</>;
}

// ─── Material badge labels ─────────────────────────────────────────────────────

const MATERIAL_LABELS: Record<string, { label: string; className: string }> = {
  fabric: { label: "Tissu", className: "bg-white/5 text-white/60 border-white/10" },
  leather: { label: "Cuir", className: "bg-amber-500/10 text-amber-400/90 border-amber-500/20" },
  "premium-leather": { label: "Cuir Premium", className: "bg-yellow-500/10 text-yellow-400/90 border-yellow-500/20" },
};

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

// ─── Section header ───────────────────────────────────────────────────────────

function Section({
  title,
  children,
  index = 0,
  accent = "red",
}: {
  title: string;
  children: React.ReactNode;
  index?: number;
  accent?: "red" | "neutral";
}) {
  const isNeutral = accent === "neutral";
  return (
    <motion.div
      variants={fadeUp}
      custom={index}
      className="mb-7"
    >
      <div className="flex items-center gap-2.5 mb-4">
        <motion.span
          className={cn("h-px w-6 origin-left will-change-transform", isNeutral ? "bg-white/25" : "bg-[#EB0A1E]")}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.5, delay: index * 0.05, ease: EASE_PREMIUM }}
        />
        <h3
          className={cn(
            "text-[10px] uppercase tracking-[0.28em] font-bold",
            isNeutral ? "text-white/50" : "text-[#EB0A1E]"
          )}
        >
          {title}
        </h3>
      </div>
      {children}
    </motion.div>
  );
}

// ─── Trim cards ───────────────────────────────────────────────────────────────

function TrimCard({
  trim,
  isSelected,
  onSelect,
  index,
}: {
  trim: VehicleTrim;
  isSelected: boolean;
  onSelect: () => void;
  index: number;
}) {
  return (
    <motion.button
      type="button"
      variants={fadeUp}
      custom={index}
      onClick={onSelect}
      layout="position"
      className={cn(
        "relative w-full text-left rounded-xl border p-3.5 transition-all duration-300 overflow-hidden",
        isSelected
          ? "border-white/30 bg-white/[0.06]"
          : "border-white/[0.08] bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
      )}
    >
      {isSelected && (
        <motion.span
          layoutId="config-option-highlight"
          className="absolute inset-0 border border-white/20 rounded-xl pointer-events-none"
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
        />
      )}
      <div className="relative flex items-center justify-between mb-1">
        <span className="text-sm font-bold text-white">{trim.name}</span>
        {isSelected && <Check className="h-4 w-4 text-white" />}
      </div>
      <p className="relative text-[11px] text-white/40 mb-2">{trim.tagline}</p>
      <p className="relative text-xs font-semibold text-white/65">
        {trim.priceFrom > 0 ? `À partir de ${formatPrice(trim.priceFrom)}` : "Inclus"}
      </p>
    </motion.button>
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

// ─── Color swatches ───────────────────────────────────────────────────────────

function ColorSwatches({
  colors,
  selected,
  onSelect,
}: {
  colors: VehicleColor[];
  selected: VehicleColor | null;
  onSelect: (c: VehicleColor) => void;
}) {
  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <div className="flex flex-wrap gap-3 mb-3">
        {colors.map((color, i) => {
          const isSel = selected?.id === color.id;
          const isLight = ["#FFFFFF", "#F5F5F5", "#F9FAFB", "#FFFAF0"].includes(color.hex.toUpperCase());
          return (
            <motion.button
              key={color.id}
              variants={fadeUp}
              custom={i}
              title={color.name}
              onClick={() => onSelect(color)}
              className={cn(
                "relative rounded-full transition-all duration-300 focus:outline-none",
                isSel
                  ? "ring-2 ring-[#EB0A1E] ring-offset-2 ring-offset-[#0d0d0d] scale-110"
                  : "ring-1 ring-white/15 hover:scale-110 hover:ring-white/35"
              )}
              style={{ width: 40, height: 40, backgroundColor: color.hex }}
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
                      className="h-3.5 w-3.5 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]"
                      style={{ color: isLight ? "#000" : "#fff" }}
                      strokeWidth={3}
                    />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>
      <AnimatePresence mode="wait">
        {selected && (
          <motion.div
            key={selected.id}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.25 }}
            className="flex items-center gap-2"
          >
            <span
              className="w-3 h-3 rounded-full border border-white/15 shrink-0"
              style={{ backgroundColor: selected.hex }}
            />
            <span className="text-sm font-semibold text-white">{selected.name}</span>
            <span className="text-[11px] text-white/35">
              {selected.type === "pearl"
                ? "Nacré · +5 000 MAD"
                : selected.type === "metallic"
                  ? "Métallisé · +3 000 MAD"
                  : "Uni · inclus"}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Wheel option card ────────────────────────────────────────────────────────

function WheelCard({
  wheel,
  isSelected,
  onSelect,
  index,
}: {
  wheel: VehicleWheel;
  isSelected: boolean;
  onSelect: () => void;
  index: number;
}) {
  return (
    <motion.button
      variants={fadeUp}
      custom={index}
      onClick={onSelect}
      layout="position"
      className={cn(
        "w-full flex items-center gap-3 px-3.5 py-3 rounded-xl border text-left transition-all duration-300",
        isSelected
          ? "border-[#EB0A1E]/50 bg-[#EB0A1E]/[0.06]"
          : "border-white/[0.08] bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
      )}
    >
      <div
        className={cn(
          "w-9 h-9 rounded-full border flex items-center justify-center shrink-0 transition-colors duration-300",
          isSelected ? "border-[#EB0A1E]/50 bg-[#EB0A1E]/10" : "border-white/15 bg-white/[0.03]"
        )}
      >
        <DiscAlbum className={cn("h-4 w-4", isSelected ? "text-[#EB0A1E]" : "text-white/35")} />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-sm text-white font-semibold block truncate">{wheel.name}</span>
        <span className="text-[11px] text-white/35">{wheel.size}</span>
      </div>
      {isSelected && <Check className="h-4 w-4 text-[#EB0A1E] shrink-0" strokeWidth={2.5} />}
    </motion.button>
  );
}

// ─── Interior option card ─────────────────────────────────────────────────────

function InteriorCard({
  interior,
  isSelected,
  onSelect,
  index,
}: {
  interior: VehicleInterior;
  isSelected: boolean;
  onSelect: () => void;
  index: number;
}) {
  const matInfo = MATERIAL_LABELS[interior.material];
  return (
    <motion.button
      variants={fadeUp}
      custom={index}
      onClick={onSelect}
      layout="position"
      className={cn(
        "w-full flex items-center gap-3 px-3.5 py-3 rounded-xl border text-left transition-all duration-300",
        isSelected
          ? "border-[#EB0A1E]/50 bg-[#EB0A1E]/[0.06]"
          : "border-white/[0.08] bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
      )}
    >
      <span
        className="w-7 h-7 rounded-full border-2 border-white/15 shrink-0"
        style={{ backgroundColor: interior.colorHex }}
      />
      <span className="flex-1 text-sm text-white font-semibold truncate">{interior.name}</span>
      {matInfo && (
        <span className={cn("text-[10px] px-2 py-0.5 rounded-full border font-semibold shrink-0", matInfo.className)}>
          {matInfo.label}
        </span>
      )}
      {isSelected && <Check className="h-4 w-4 text-[#EB0A1E] shrink-0" strokeWidth={2.5} />}
    </motion.button>
  );
}

// ─── Price breakdown ──────────────────────────────────────────────────────────

function PriceBreakdown({
  base,
  total,
  selectedColor,
  selectedInterior,
  selectedWheels,
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
    <motion.div
      variants={fadeUp}
      className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 mb-4"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[10px] text-white/35 uppercase tracking-[0.2em] font-bold mb-1">
            Prix configuré
          </p>
          <motion.p
            key={total}
            initial={{ opacity: 0.6, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl md:text-3xl font-black text-white tracking-tight leading-tight tabular-nums"
          >
            <AnimatedPrice value={total} />
          </motion.p>
        </div>
        {hasOptions && (
          <div className="text-right">
            <p className="text-[10px] text-white/35 uppercase tracking-[0.2em] font-bold mb-1">Options</p>
            <p className="text-sm font-bold text-[#EB0A1E] tabular-nums">
              +<AnimatedPrice value={total - base} />
            </p>
          </div>
        )}
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-white/45">
          <span>Prix de base</span>
          <span className="font-medium text-white/70 tabular-nums">{formatPrice(base)}</span>
        </div>
        {colorExtras > 0 && selectedColor && (
          <div className="flex justify-between text-white/45">
            <span>Couleur {selectedColor.type === "pearl" ? "nacrée" : "métallisée"}</span>
            <span className="font-medium text-[#EB0A1E] tabular-nums">+{formatPrice(colorExtras)}</span>
          </div>
        )}
        {wheelExtras > 0 && selectedWheels && (
          <div className="flex justify-between text-white/45">
            <span>Jantes {selectedWheels.size}</span>
            <span className="font-medium text-[#EB0A1E] tabular-nums">+{formatPrice(wheelExtras)}</span>
          </div>
        )}
        {intExtras > 0 && selectedInterior && (
          <div className="flex justify-between text-white/45">
            <span>{selectedInterior.material === "leather" ? "Cuir" : "Cuir Premium"}</span>
            <span className="font-medium text-[#EB0A1E] tabular-nums">+{formatPrice(intExtras)}</span>
          </div>
        )}
        <div className="border-t border-white/[0.08] pt-2 flex justify-between font-bold text-white">
          <span>Total</span>
          <span className="tabular-nums">
            <AnimatedPrice value={total} />
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── AI Style Advisor ─────────────────────────────────────────────────────────

function AIAdvisorCard() {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-white/[0.08] rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3.5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors text-left"
      >
        <div className="w-8 h-8 rounded-lg bg-[#EB0A1E]/10 flex items-center justify-center shrink-0">
          <Sparkles className="h-4 w-4 text-[#EB0A1E]" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-white">Conseiller Style IA</p>
          <p className="text-[11px] text-white/35">Recommandations personnalisées</p>
        </div>
        <ChevronDown className={cn("h-4 w-4 text-white/35 transition-transform duration-300", open && "rotate-180")} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: EASE_PREMIUM }}
            className="overflow-hidden"
          >
            <div className="p-4 border-t border-white/[0.06]">
              <AIStyleAdvisor />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── ConfigPanel ──────────────────────────────────────────────────────────────

export function ConfigPanel({ floating = false }: { floating?: boolean }) {
  const {
    selectedVehicle,
    selectedTrim,
    selectedColor,
    selectedWheels,
    selectedInterior,
    totalPrice,
    setTrim,
    setColor,
    setWheels,
    setInterior,
    getConfiguration,
  } = useConfiguratorStore();

  const [showLeadModal, setShowLeadModal] = useState(false);

  if (!selectedVehicle) {
    return (
      <div className="flex items-center justify-center h-full bg-[#0d0d0d]">
        <p className="text-white/40 text-sm">Aucun véhicule sélectionné.</p>
      </div>
    );
  }

  const trims = getTrimsForVehicle(selectedVehicle.id);
  const config = getConfiguration();

  return (
    <>
      <div
        className={cn(
          "flex flex-col h-full bg-[#0d0d0d] border border-white/[0.08]",
          floating && "rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.65)] backdrop-blur-xl"
        )}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-white/[0.06] shrink-0">
          <Link
            href={`/vehicles/${selectedVehicle.id}`}
            className="inline-flex items-center gap-1 text-white/35 hover:text-[#EB0A1E] transition-colors text-xs font-medium mb-3"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Changer de modèle
          </Link>
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedVehicle.id + (selectedTrim?.id ?? "")}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35, ease: EASE_PREMIUM }}
            >
              <h2 className="text-white text-xl font-black leading-tight tracking-tight">
                {selectedVehicle.name}
              </h2>
              <p className="text-white/35 text-xs mt-1">{selectedVehicle.category}</p>
              <p className="text-toyota-gold text-lg font-black mt-2 tabular-nums">
                <AnimatedPrice value={totalPrice} />
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Scrollable options */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="flex-1 overflow-y-auto px-5 pt-5 pb-3 min-h-0 scrollbar-thin"
          style={{ scrollbarColor: "rgba(255,255,255,0.1) transparent" }}
        >
          {trims.length > 1 && (
            <Section title="Finition" index={0} accent="neutral">
              <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-2">
                {trims.map((trim, i) => (
                  <TrimCard
                    key={trim.id}
                    trim={trim}
                    isSelected={selectedTrim?.id === trim.id}
                    onSelect={() => setTrim(trim)}
                    index={i}
                  />
                ))}
              </motion.div>
            </Section>
          )}

          <Section title="Couleur extérieure" index={1}>
            <ColorSwatches
              colors={selectedVehicle.colors}
              selected={selectedColor}
              onSelect={setColor}
            />
          </Section>

          <Section title="Jantes" index={2}>
            <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-2">
              {selectedVehicle.wheels.map((wheel, i) => (
                <WheelCard
                  key={wheel.id}
                  wheel={wheel}
                  isSelected={selectedWheels?.id === wheel.id}
                  onSelect={() => setWheels(wheel)}
                  index={i}
                />
              ))}
            </motion.div>
          </Section>

          <Section title="Sellerie intérieure" index={3}>
            <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-2">
              {selectedVehicle.interiors.map((interior, i) => (
                <InteriorCard
                  key={interior.id}
                  interior={interior}
                  isSelected={selectedInterior?.id === interior.id}
                  onSelect={() => setInterior(interior)}
                  index={i}
                />
              ))}
            </motion.div>
          </Section>

          <div className="border-t border-white/[0.06] mb-5" />

          <PriceBreakdown
            base={config.basePrice}
            total={totalPrice}
            selectedColor={selectedColor}
            selectedInterior={selectedInterior}
            selectedWheels={selectedWheels}
          />

          <motion.div variants={fadeUp} className="mb-5">
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
              className="mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-white/[0.08] text-white/55 hover:text-white hover:border-[#EB0A1E]/35 hover:bg-[#EB0A1E]/5 text-sm font-semibold transition-all duration-300"
            >
              <FileDown className="h-4 w-4" />
              Télécharger le devis PDF
            </button>
          </motion.div>

          <motion.div variants={fadeUp}>
            <AIAdvisorCard />
          </motion.div>

          <div className="h-4" />
        </motion.div>

        {/* Sticky footer CTA */}
        <div className="shrink-0 px-5 py-4 border-t border-white/[0.06] bg-[#0d0d0d]/95 backdrop-blur-md space-y-2.5">
          <BorderDrawButton
            accent="red"
            onClick={() => setShowLeadModal(true)}
            className="w-full justify-center"
          >
            <Calendar className="h-4 w-4" />
            Réserver cette configuration
            <ArrowRight className="h-4 w-4" />
          </BorderDrawButton>
          <BorderDrawButton
            href={`/acheter?vehicle=${selectedVehicle.id}`}
            className="w-full justify-center"
          >
            Acheter chez un concessionnaire
            <ArrowRight className="h-4 w-4" />
          </BorderDrawButton>
        </div>
      </div>

      {/* Lead Modal — logic unchanged */}
      <AnimatePresence>
        {showLeadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && setShowLeadModal(false)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ duration: 0.35, ease: EASE_PREMIUM }}
              className="w-full max-w-md bg-[#0d0d0d] border border-white/[0.08] rounded-2xl p-6 shadow-2xl"
            >
              <h2 className="text-white text-xl font-bold mb-1">Réserver un Essai</h2>
              <p className="text-white/45 text-sm mb-5">Un conseiller vous contacte sous 24h.</p>
              <LeadFormContent
                showSummary
                onSuccess={() => setTimeout(() => setShowLeadModal(false), 2500)}
              />
              <button
                onClick={() => setShowLeadModal(false)}
                className="w-full mt-2 py-3 rounded-xl border border-white/[0.08] text-white/45 text-sm hover:bg-white/5 transition-colors"
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
