"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface Photo360FallbackProps {
  images: string[];
  vehicleName: string;
  colorHex: string;
  className?: string;
}

/** Cinematic photo carousel when WebGL/GLB is unavailable or on low-end devices. */
export function Photo360Fallback({
  images,
  vehicleName,
  colorHex,
  className,
}: Photo360FallbackProps) {
  const slides = images.length > 0 ? images : ["/images/placeholder-car.jpg"];
  const [index, setIndex] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % slides.length);
  }, [slides.length]);

  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (!autoRotate || slides.length <= 1) return;
    const id = setInterval(next, 3500);
    return () => clearInterval(id);
  }, [autoRotate, next, slides.length]);

  return (
    <div className={cn("relative w-full h-full bg-[#050505] overflow-hidden", className)}>
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 80%, ${colorHex}55 0%, transparent 65%)`,
        }}
      />

      {slides.map((src, i) => (
        <div
          key={src + i}
          className={cn(
            "absolute inset-0 transition-opacity duration-700",
            i === index ? "opacity-100" : "opacity-0"
          )}
        >
          <Image
            src={src}
            alt={`${vehicleName} — vue ${i + 1}`}
            fill
            className="object-contain object-center"
            sizes="100vw"
            priority={i === 0}
            style={{ filter: `hue-rotate(0deg) saturate(1.05)` }}
          />
        </div>
      ))}

      <div className="absolute top-3 left-3 z-10 px-3 py-1.5 rounded-lg bg-black/60 border border-white/10 text-[10px] uppercase tracking-wider text-white/70">
        Vue 360° · {index + 1}/{slides.length}
      </div>

      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => { setAutoRotate(false); prev(); }}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/50 border border-white/15 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/70 transition-colors"
            aria-label="Vue précédente"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => { setAutoRotate(false); next(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/50 border border-white/15 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/70 transition-colors"
            aria-label="Vue suivante"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      <button
        type="button"
        onClick={() => setAutoRotate((v) => !v)}
        className="absolute bottom-4 right-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/15 bg-black/50 text-white/70 hover:text-white text-xs font-medium transition-all"
      >
        <RotateCcw className={cn("h-3.5 w-3.5", autoRotate && "animate-spin")} />
        {autoRotate ? "Rotation auto" : "Rotation manuelle"}
      </button>

      <p className="absolute bottom-4 left-4 z-10 text-[11px] text-white/40 max-w-[200px]">
        Mode photo — modèle 3D indisponible sur cet appareil
      </p>
    </div>
  );
}

/** Detect low-end GPU or missing WebGL for automatic fallback. */
export function shouldUsePhotoFallback(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") ?? canvas.getContext("experimental-webgl");
    if (!gl) return true;
    const debugInfo = (gl as WebGLRenderingContext).getExtension("WEBGL_debug_renderer_info");
    if (debugInfo) {
      const renderer = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) as string;
      if (/swiftshader|llvmpipe|software/i.test(renderer)) return true;
    }
  } catch {
    return true;
  }
  const cores = navigator.hardwareConcurrency ?? 4;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  return cores <= 2 || memory <= 2;
}
