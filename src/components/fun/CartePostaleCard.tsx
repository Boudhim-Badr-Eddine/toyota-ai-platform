"use client";

import { useRef, useCallback } from "react";
import { Download, Share2, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CartePostaleProps {
  title: string;
  summary: string;
  origin: string;
  duration: number;
  totalKm: number;
  vehicleName: string;
  highlightStop?: string;
  className?: string;
}

export function CartePostaleCard({
  title,
  summary,
  origin,
  duration,
  totalKm,
  vehicleName,
  highlightStop,
  className,
}: CartePostaleProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const renderToCanvas = useCallback(async (): Promise<HTMLCanvasElement | null> => {
    const el = cardRef.current;
    if (!el) return null;

    const rect = el.getBoundingClientRect();
    const scale = 2;
    const canvas = document.createElement("canvas");
    canvas.width = rect.width * scale;
    canvas.height = rect.height * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.scale(scale, scale);

    const grad = ctx.createLinearGradient(0, 0, 0, rect.height);
    grad.addColorStop(0, "#1a0808");
    grad.addColorStop(0.4, "#0a0a0a");
    grad.addColorStop(1, "#121212");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Stamp area
    ctx.strokeStyle = "#C9A84C";
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(rect.width - 90, 24, 70, 70);
    ctx.setLineDash([]);
    ctx.fillStyle = "#C9A84C";
    ctx.font = "bold 10px Inter, system-ui, sans-serif";
    ctx.fillText("MAROC", rect.width - 78, 62);

    ctx.fillStyle = "#EB0A1E";
    ctx.font = "bold 14px Inter, system-ui, sans-serif";
    ctx.fillText("TOYOTA", 32, 48);

    ctx.fillStyle = "#C9A84C";
    ctx.font = "600 10px Inter, system-ui, sans-serif";
    ctx.fillText("ROAD TRIP LÉGENDAIRE", 32, 66);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 22px Inter, system-ui, sans-serif";
    const titleWords = title.split(" ");
    let titleLine = "";
    let ty = 100;
    for (const w of titleWords) {
      const test = titleLine + w + " ";
      if (ctx.measureText(test).width > rect.width - 64) {
        ctx.fillText(titleLine, 32, ty);
        titleLine = w + " ";
        ty += 26;
      } else {
        titleLine = test;
      }
    }
    ctx.fillText(titleLine, 32, ty);

    ctx.fillStyle = "#9CA3AF";
    ctx.font = "13px Inter, system-ui, sans-serif";
    const summaryWords = summary.split(" ");
    let sumLine = "";
    let sy = ty + 30;
    for (const w of summaryWords) {
      const test = sumLine + w + " ";
      if (ctx.measureText(test).width > rect.width - 64) {
        ctx.fillText(sumLine, 32, sy);
        sumLine = w + " ";
        sy += 18;
      } else {
        sumLine = test;
      }
    }
    ctx.fillText(sumLine, 32, sy);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 12px Inter, system-ui, sans-serif";
    ctx.fillText(`${duration} jours · ${totalKm} km · ${origin}`, 32, sy + 36);
    ctx.fillStyle = "#EB0A1E";
    ctx.fillText(vehicleName, 32, sy + 56);

    if (highlightStop) {
      ctx.fillStyle = "#6B7280";
      ctx.font = "11px Inter, system-ui, sans-serif";
      ctx.fillText(`✦ ${highlightStop}`, 32, sy + 78);
    }

    ctx.fillStyle = "#4B5563";
    ctx.font = "9px Inter, system-ui, sans-serif";
    ctx.fillText("toyota.co.ma — Road Trip Légendaire", 32, rect.height - 24);

    return canvas;
  }, [title, summary, origin, duration, totalKm, vehicleName, highlightStop]);

  const handleDownload = async () => {
    const canvas = await renderToCanvas();
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `carte-postale-toyota-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `🗺️ Mon Road Trip Légendaire Toyota\n\n` +
        `${title}\n${summary}\n\n` +
        `${duration} jours · ${totalKm} km depuis ${origin}\n` +
        `Véhicule: ${vehicleName}\n` +
        `Planifiez le vôtre → ${window.location.origin}/road-trip`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div
        ref={cardRef}
        className="relative overflow-hidden rounded-2xl border border-toyota-gold/30 bg-gradient-to-b from-[#1a0808] via-[#0a0a0a] to-[#121212] p-6 md:p-8 min-h-[280px]"
      >
        <div className="absolute top-6 right-6 h-16 w-16 rounded border-2 border-dashed border-toyota-gold/40 flex items-center justify-center">
          <span className="text-[9px] font-bold text-toyota-gold uppercase tracking-widest">Maroc</span>
        </div>

        <div className="relative z-10 max-w-[80%]">
          <div className="flex items-center gap-2 text-toyota-gold">
            <Mail className="h-4 w-4" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Carte Postale</span>
          </div>
          <p className="mt-2 font-black text-lg text-toyota-red">TOYOTA</p>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-toyota-gold">
            Road Trip Légendaire
          </p>

          <h3 className="mt-4 text-xl md:text-2xl font-black text-white leading-tight">{title}</h3>
          <p className="mt-2 text-sm text-white/50 leading-relaxed">{summary}</p>

          <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold">
            <span className="rounded-full bg-white/5 px-3 py-1 text-white/70">
              {duration} jours
            </span>
            <span className="rounded-full bg-white/5 px-3 py-1 text-white/70">{totalKm} km</span>
            <span className="rounded-full bg-white/5 px-3 py-1 text-white/70">{origin}</span>
          </div>

          <p className="mt-3 text-sm font-bold text-toyota-red">{vehicleName}</p>
          {highlightStop && (
            <p className="mt-2 text-xs text-white/40">✦ {highlightStop}</p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={handleDownload} className="toyota-btn-primary inline-flex items-center gap-2 !py-2.5 !px-5 !text-xs">
          <Download className="h-4 w-4" />
          Télécharger
        </button>
        <button
          type="button"
          onClick={handleWhatsAppShare}
          className="toyota-btn-secondary inline-flex items-center gap-2 !py-2.5 !px-5 !text-xs"
        >
          <Share2 className="h-4 w-4" />
          Partager WhatsApp
        </button>
      </div>
    </div>
  );
}
