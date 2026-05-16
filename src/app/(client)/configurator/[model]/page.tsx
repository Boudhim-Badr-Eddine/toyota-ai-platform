"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, notFound } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Tag, Camera, Download, X, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import dynamic from "next/dynamic";
import { getVehicleById } from "@/data/vehicles";
import { useConfiguratorStore } from "@/store/configuratorStore";
import { ConfigPanel } from "@/components/configurator/ConfigPanel";
import { getModelPath } from "@/lib/modelPaths";
import { cn } from "@/lib/utils";

// ─── Lazy-load CarScene ───────────────────────────────────────────────────────

const CarScene = dynamic(
  () => import("@/components/configurator/CarScene").then((m) => m.CarScene),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#050505] gap-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full border-2 border-toyota-red/20 border-t-toyota-red animate-spin" />
          <p className="text-toyota-muted text-sm font-medium">Chargement du modèle 3D…</p>
        </div>
        {/* Loading bar */}
        <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-toyota-red rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: "75%" }}
            transition={{ duration: 2.5, ease: "easeOut" }}
          />
        </div>
        <p className="text-toyota-muted/40 text-xs">Fichier GLB en cours…</p>
      </div>
    ),
  }
);

// ─── Category badge colors ─────────────────────────────────────────────────────

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

// ─── Screenshot capture ───────────────────────────────────────────────────────

function captureCanvas(): string | null {
  const canvas = document.querySelector<HTMLCanvasElement>("canvas");
  if (!canvas) return null;
  try {
    return canvas.toDataURL("image/png");
  } catch {
    return null;
  }
}

// ─── Screenshot Modal ─────────────────────────────────────────────────────────

function ScreenshotModal({
  dataUrl,
  vehicleName,
  colorName,
  onClose,
}: {
  dataUrl: string;
  vehicleName: string;
  colorName: string;
  onClose: () => void;
}) {
  const filename = `${vehicleName.toLowerCase().replace(/\s+/g, "-")}-${colorName.toLowerCase().replace(/\s+/g, "-")}.png`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="w-full max-w-lg bg-[#111111] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
          <div>
            <h2 className="text-white font-bold text-base">Ma Configuration</h2>
            <p className="text-toyota-muted text-xs">{vehicleName} · {colorName}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/8 transition-colors text-toyota-muted hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Image preview */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={dataUrl}
          alt={`${vehicleName} configuré`}
          className="w-full aspect-video object-cover"
        />

        {/* Actions */}
        <div className="flex gap-2 p-4">
          <a
            href={dataUrl}
            download={filename}
            className="flex-1 flex items-center justify-center gap-2 bg-toyota-red hover:bg-toyota-red/90 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
          >
            <Download className="h-4 w-4" />
            Télécharger
          </a>
          <a
            href={`mailto:?subject=Ma configuration Toyota ${vehicleName}&body=Voici ma configuration Toyota ${vehicleName} en ${colorName}.`}
            className="flex-1 flex items-center justify-center gap-2 border border-white/10 hover:border-white/25 text-toyota-muted hover:text-white font-semibold py-3 rounded-xl text-sm transition-colors"
          >
            Partager par Email
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function ConfiguratorPage() {
  const params = useParams<{ model: string }>();
  const modelId = params.model;

  const vehicle = getVehicleById(modelId);
  const { setVehicle, selectedVehicle, selectedColor, selectedWheels, selectedInterior } = useConfiguratorStore();

  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  // Mobile bottom-sheet toggle — must be before early return
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleCapture = useCallback(() => {
    const url = captureCanvas();
    if (url) {
      setScreenshotUrl(url);
      toast.success('📸 Configuration sauvegardée !');
    }
  }, []);

  useEffect(() => {
    if (vehicle && selectedVehicle?.id !== vehicle.id) {
      setVehicle(vehicle);
    }
  }, [vehicle, selectedVehicle?.id, setVehicle]);

  if (!vehicle) return notFound();

  const badgeClass = BADGE_COLORS[vehicle.category] ?? "bg-white/10 text-white/60 border-white/20";
  const activeColorHex = selectedColor?.hex ?? vehicle.colors[0]?.hex ?? "#EB0A1E";
  const activeColorType = selectedColor?.type ?? vehicle.colors[0]?.type ?? "solid";

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-toyota-dark">

      {/* ── Top bar ────────────────────────────────────────────────────────── */}
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="shrink-0 flex items-center gap-4 px-4 lg:px-6 py-3 border-b border-white/5 bg-toyota-dark/95 backdrop-blur-md z-30"
      >
        <div className="hidden sm:flex items-center gap-1 text-toyota-muted/50 text-xs">
          <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
          <ChevronLeft className="h-3 w-3 rotate-180" />
          <Link href="/vehicles" className="hover:text-white transition-colors">Véhicules</Link>
          <ChevronLeft className="h-3 w-3 rotate-180" />
          <Link href={`/vehicles/${vehicle.id}`} className="hover:text-white transition-colors">{vehicle.name}</Link>
          <ChevronLeft className="h-3 w-3 rotate-180" />
          <span className="text-toyota-muted">Configurateur</span>
        </div>
        {/* Mobile: simple back button */}
        <Link
          href={`/vehicles/${vehicle.id}`}
          className="sm:hidden flex items-center gap-1 text-toyota-muted hover:text-white transition-colors text-sm font-medium"
        >
          <ChevronLeft className="h-4 w-4" />
          Retour
        </Link>

        <div className="flex-1 flex items-center gap-3">
          <h1 className="text-white font-bold text-base leading-tight">{vehicle.name}</h1>
          <span className={cn(
            "flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border",
            badgeClass
          )}>
            <Tag className="h-2.5 w-2.5" />
            {vehicle.category}
          </span>
        </div>

        {/* Screenshot button */}
        <button
          onClick={handleCapture}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-toyota-muted hover:text-white text-xs font-medium transition-all"
        >
          <Camera className="h-3.5 w-3.5" />
          Capturer
        </button>

        <p className="hidden lg:block text-[11px] text-toyota-muted/40 select-none">
          Faites tourner le véhicule avec la souris
        </p>
      </motion.header>

      {/* ── Main content ───────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 relative">

        {/* 3D Viewport — left 60% on desktop */}
        <div className="relative flex-1 min-h-0">
          {process.env.NODE_ENV === "development" && (
            <div className="fixed top-2 left-2 z-50 bg-black/90 text-green-400 text-xs font-mono p-2 rounded pointer-events-none">
              Model: {getModelPath(vehicle.id)}
            </div>
          )}
          <CarScene
            vehicleId={vehicle.id}
            colorHex={activeColorHex}
            colorType={activeColorType}
            vehicleName={vehicle.name}
            selectedWheelId={selectedWheels?.id ?? ""}
            selectedInteriorId={selectedInterior?.id ?? ""}
          />

          {/* Mobile: floating button to toggle config sheet */}
          <button
            onClick={() => setSheetOpen((v) => !v)}
            className="lg:hidden absolute bottom-4 right-4 z-20 flex items-center gap-2 bg-toyota-red hover:bg-toyota-red/90 text-white text-sm font-semibold px-4 py-2.5 rounded-full shadow-xl transition-all"
          >
            <SlidersHorizontal className="h-4 w-4" />
            {sheetOpen ? "Fermer" : "Configurer"}
          </button>
        </div>

        {/* Config Panel — desktop sidebar (right 40%) */}
        <div className="hidden lg:flex lg:w-[380px] xl:w-[440px] shrink-0 flex-col min-h-0">
          <ConfigPanel />
        </div>

        {/* Config Panel — mobile bottom sheet */}
        <AnimatePresence>
          {sheetOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                key="sheet-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSheetOpen(false)}
                className="lg:hidden absolute inset-0 z-30 bg-black/60 backdrop-blur-sm"
              />
              {/* Sheet */}
              <motion.div
                key="sheet-panel"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 300 }}
                className="lg:hidden absolute bottom-0 left-0 right-0 z-40 max-h-[82vh] flex flex-col rounded-t-3xl overflow-hidden bg-[#0E0E0E] border-t border-white/10"
              >
                {/* Drag handle */}
                <div
                  className="flex justify-center pt-3 pb-1 shrink-0"
                  onClick={() => setSheetOpen(false)}
                >
                  <div className="w-10 h-1 rounded-full bg-white/15" />
                </div>
                <div className="flex-1 overflow-y-auto overscroll-contain">
                  <ConfigPanel />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Screenshot modal */}
      <AnimatePresence>
        {screenshotUrl && (
          <ScreenshotModal
            dataUrl={screenshotUrl}
            vehicleName={vehicle.name}
            colorName={selectedColor?.name ?? ""}
            onClose={() => setScreenshotUrl(null)}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
