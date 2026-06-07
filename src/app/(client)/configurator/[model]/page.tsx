"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams, notFound } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Camera, Download, X, SlidersHorizontal, Share2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import dynamic from "next/dynamic";
import { getVehicleById } from "@/data/vehicles";
import { useConfiguratorStore } from "@/store/configuratorStore";
import { ConfigPanel } from "@/components/configurator/ConfigPanel";
import { cn } from "@/lib/utils";
import { Photo360Fallback, shouldUsePhotoFallback } from "@/components/configurator/Photo360Fallback";
import type { CarSceneControls } from "@/components/configurator/CarScene";
import { BorderDrawButton } from "@/components/ui/BorderDrawButton";

const EASE_PREMIUM = [0.22, 1, 0.36, 1] as const;

// ─── Lazy-load CarScene ───────────────────────────────────────────────────────

const CarScene = dynamic(
  () => import("@/components/configurator/CarScene").then((m) => m.CarScene),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#050505] gap-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full border-2 border-[#EB0A1E]/20 border-t-[#EB0A1E] animate-spin" />
          <p className="text-white/50 text-sm font-medium">Chargement du modèle 3D…</p>
        </div>
        <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full w-full origin-left bg-[#EB0A1E] rounded-full will-change-transform"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 0.75 }}
            transition={{ duration: 2.5, ease: "easeOut" }}
          />
        </div>
        <p className="text-white/25 text-xs">Fichier GLB en cours…</p>
      </div>
    ),
  }
);

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ duration: 0.3, ease: EASE_PREMIUM }}
        className="w-full max-w-lg bg-[#0d0d0d] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <div>
            <h2 className="text-white font-bold text-base">Ma Configuration</h2>
            <p className="text-white/40 text-xs">{vehicleName} · {colorName}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/8 transition-colors text-white/50 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={dataUrl}
          alt={`${vehicleName} configuré`}
          className="w-full aspect-video object-cover bg-black"
        />
        <div className="flex gap-2 p-4">
          <a
            href={dataUrl}
            download={filename}
            className="flex-1 flex items-center justify-center gap-2 bg-[#EB0A1E]/[0.08] text-[#EB0A1E] hover:bg-[#EB0A1E]/[0.14] border border-[#EB0A1E]/30 font-semibold py-3 text-sm transition-colors"
          >
            <Download className="h-4 w-4" />
            Télécharger
          </a>
          <a
            href={`mailto:?subject=Ma configuration Toyota ${vehicleName}&body=Voici ma configuration Toyota ${vehicleName} en ${colorName}.`}
            className="flex-1 flex items-center justify-center gap-2 border border-white/15 hover:border-white/30 bg-white/[0.04] hover:bg-white/[0.08] text-white/60 hover:text-white font-semibold py-3 text-sm transition-colors"
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
  const searchParams = useSearchParams();
  const modelId = params.model;

  const vehicle = getVehicleById(modelId);
  const { setVehicle, selectedVehicle, selectedColor, selectedWheels, selectedInterior, selectedTrim, applyFromUrl } = useConfiguratorStore();

  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [clientReady, setClientReady] = useState(false);
  const [sceneControls, setSceneControls] = useState<CarSceneControls | null>(null);

  useEffect(() => {
    setClientReady(true);
  }, []);

  const usePhotoMode = clientReady && shouldUsePhotoFallback();
  const showArHint = clientReady && typeof navigator !== "undefined" && "xr" in navigator;

  const handleSceneControlsReady = useCallback((controls: CarSceneControls | null) => {
    setSceneControls(controls);
  }, []);

  const handleCapture = useCallback(() => {
    const url = captureCanvas();
    if (url) {
      setScreenshotUrl(url);
      toast.success("📸 Configuration sauvegardée !");
    }
  }, []);

  useEffect(() => {
    if (vehicle && selectedVehicle?.id !== vehicle.id) {
      setVehicle(vehicle);
    }
  }, [vehicle, selectedVehicle?.id, setVehicle]);

  useEffect(() => {
    if (!vehicle || selectedVehicle?.id !== vehicle.id) return;
    applyFromUrl({
      colorId: searchParams.get("c") ?? undefined,
      wheelId: searchParams.get("w") ?? undefined,
      interiorId: searchParams.get("i") ?? undefined,
      trimId: searchParams.get("t") ?? undefined,
    });
  }, [vehicle, selectedVehicle?.id, searchParams, applyFromUrl]);

  if (!vehicle) return notFound();

  const activeColorHex = selectedColor?.hex ?? vehicle.colors[0]?.hex ?? "#EB0A1E";
  const activeColorType = selectedColor?.type ?? vehicle.colors[0]?.type ?? "solid";

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#050505]">

      {/* ── Full-screen 3D canvas ─────────────────────────────────────────── */}
      <div className="absolute inset-0">
        {usePhotoMode ? (
          <Photo360Fallback
            images={vehicle.images?.length ? vehicle.images : [vehicle.imageUrl]}
            vehicleName={vehicle.name}
            colorHex={activeColorHex}
          />
        ) : (
          <CarScene
            vehicleId={vehicle.id}
            colorHex={activeColorHex}
            colorType={activeColorType}
            vehicleName={vehicle.name}
            selectedWheelId={selectedWheels?.id ?? ""}
            selectedInteriorId={selectedInterior?.id ?? ""}
            onSceneControlsReady={handleSceneControlsReady}
          />
        )}

        {/* Subtle vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 40% 50%, transparent 30%, rgba(0,0,0,0.55) 100%)",
          }}
        />
      </div>

      {/* ── Floating top controls ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE_PREMIUM }}
        className="absolute top-0 left-0 right-0 z-20 flex items-start justify-between gap-3 px-4 py-3 lg:px-6 pointer-events-none"
      >
        <div className="pointer-events-auto flex flex-col items-start gap-2">
          <div className="flex items-center gap-2">
            <Link
              href={`/vehicles/${vehicle.id}`}
              className="flex items-center gap-1.5 px-3 py-2 rounded-none bg-[#111]/80 border border-white/10 text-white/60 hover:text-white hover:bg-[#161616] hover:border-white/20 text-xs font-medium backdrop-blur-md transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Retour</span>
            </Link>
            <nav className="hidden md:flex items-center gap-1.5 text-[10px] text-white/35 ml-1">
              <Link href="/vehicles" className="hover:text-white/70 transition-colors">Véhicules</Link>
              <span>/</span>
              <span className="text-white/55">{vehicle.name.replace(/^Toyota\s+/i, "")}</span>
            </nav>
          </div>
          {sceneControls?.isReady && (
            <div className="flex flex-col gap-1.5">
              {sceneControls.showDoorControls && (
                <>
                  <button
                    type="button"
                    onClick={sceneControls.toggleAllDoors}
                    className="px-3 py-2 min-w-[7.5rem] rounded-none border border-white/10 bg-[#111]/80 backdrop-blur-md text-white/65 hover:text-white hover:bg-[#161616] hover:border-white/20 text-xs font-medium transition-colors"
                  >
                    Portes
                  </button>
                  <button
                    type="button"
                    onClick={sceneControls.toggleHood}
                    className="px-3 py-2 min-w-[7.5rem] rounded-none border border-white/10 bg-[#111]/80 backdrop-blur-md text-white/65 hover:text-white hover:bg-[#161616] hover:border-white/20 text-xs font-medium transition-colors"
                  >
                    Capot
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={sceneControls.toggleViewMode}
                className={cn(
                  "px-3 py-2 min-w-[7.5rem] rounded-none border backdrop-blur-md text-xs font-medium transition-colors",
                  sceneControls.viewMode === "interior"
                    ? "border-white/25 bg-white/[0.08] text-white"
                    : "border-white/10 bg-[#111]/80 text-white/65 hover:text-white hover:bg-[#161616] hover:border-white/20"
                )}
              >
                {sceneControls.viewMode === "exterior" ? "Vue Intérieure" : "Vue Extérieure"}
              </button>
            </div>
          )}
        </div>

        <div className="pointer-events-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const params = new URLSearchParams({
                c: selectedColor?.id ?? "",
                w: selectedWheels?.id ?? "",
                i: selectedInterior?.id ?? "",
                t: selectedTrim?.id ?? "",
              });
              const url = `${window.location.origin}/configurator/${vehicle.id}?${params}`;
              void navigator.clipboard.writeText(url);
              toast.success("Lien de configuration copié");
            }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-full bg-black/50 border border-white/10 text-white/50 hover:text-white hover:border-white/25 text-xs font-medium backdrop-blur-md transition-all"
          >
            <Share2 className="h-3.5 w-3.5" />
            Partager
          </button>
          <button
            onClick={handleCapture}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-black/50 border border-white/10 text-white/50 hover:text-white hover:border-white/25 text-xs font-medium backdrop-blur-md transition-all"
          >
            <Camera className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Capturer</span>
          </button>
        </div>
      </motion.div>

      {showArHint && !usePhotoMode && (
        <a
          href={`/models/${vehicle.id}.glb`}
          rel="ar"
          className="lg:hidden absolute bottom-24 left-4 z-20 px-3 py-2 rounded-full bg-black/55 border border-white/15 text-white text-xs font-semibold backdrop-blur-md"
        >
          Vue AR
        </a>
      )}

      {/* ── Floating config panel — desktop ───────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease: EASE_PREMIUM }}
        className="hidden lg:flex absolute top-4 right-4 bottom-4 z-30 w-[min(420px,36vw)] min-w-[340px]"
      >
        <ConfigPanel floating />
      </motion.div>

      {/* ── Mobile config toggle ──────────────────────────────────────────── */}
      <div className="lg:hidden absolute bottom-5 right-5 z-30">
        <BorderDrawButton
          accent="red"
          onClick={() => setSheetOpen((v) => !v)}
          className="!text-sm"
        >
          <SlidersHorizontal className="h-4 w-4" />
          {sheetOpen ? "Fermer" : "Configurer"}
        </BorderDrawButton>
      </div>

      {/* ── Mobile bottom sheet ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {sheetOpen && (
          <>
            <motion.div
              key="sheet-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSheetOpen(false)}
              className="lg:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              key="sheet-panel"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="lg:hidden fixed bottom-0 left-0 right-0 z-50 max-h-[88vh] flex flex-col rounded-t-2xl overflow-hidden border-t border-white/[0.08] shadow-2xl"
            >
              <div
                className="flex justify-center pt-3 pb-1 shrink-0 bg-[#0d0d0d]"
                onClick={() => setSheetOpen(false)}
              >
                <div className="w-10 h-1 rounded-full bg-white/15" />
              </div>
              <div className="flex-1 overflow-hidden bg-[#0d0d0d]">
                <ConfigPanel />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
