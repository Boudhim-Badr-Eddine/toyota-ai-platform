"use client";

import { useRef, useCallback } from "react";
import Image from "next/image";
import { Download, Share2, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { BorderDrawButton } from "@/components/ui/BorderDrawButton";

export interface PermisLegendeProps {
  personaTitle: string;
  tagline: string;
  vehicleName: string;
  vehicleImageUrl: string;
  holderName?: string;
  className?: string;
}

export function PermisLegendeCard({
  personaTitle,
  tagline,
  vehicleName,
  vehicleImageUrl,
  holderName = "Légende Toyota",
  className,
}: PermisLegendeProps) {
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

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, rect.width, rect.height);
    grad.addColorStop(0, "#0a0a0a");
    grad.addColorStop(0.5, "#121212");
    grad.addColorStop(1, "#1a0a0a");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Gold border
    ctx.strokeStyle = "#C9A84C";
    ctx.lineWidth = 3;
    ctx.strokeRect(12, 12, rect.width - 24, rect.height - 24);

    // Red accent line
    ctx.fillStyle = "#EB0A1E";
    ctx.fillRect(12, 12, rect.width - 24, 4);

    // Toyota header
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 22px Inter, system-ui, sans-serif";
    ctx.fillText("TOYOTA MAROC", 32, 52);

    ctx.fillStyle = "#C9A84C";
    ctx.font = "600 11px Inter, system-ui, sans-serif";
    ctx.fillText("PERMIS DE LÉGENDE — TOYOTA DNA", 32, 72);

    // Persona title
    ctx.fillStyle = "#EB0A1E";
    ctx.font = "bold 28px Inter, system-ui, sans-serif";
    ctx.fillText(personaTitle, 32, 120);

    // Tagline (wrap)
    ctx.fillStyle = "#9CA3AF";
    ctx.font = "14px Inter, system-ui, sans-serif";
    const words = tagline.split(" ");
    let line = "";
    let y = 148;
    for (const word of words) {
      const test = line + word + " ";
      if (ctx.measureText(test).width > rect.width - 64) {
        ctx.fillText(line, 32, y);
        line = word + " ";
        y += 20;
      } else {
        line = test;
      }
    }
    ctx.fillText(line, 32, y);

    // Holder name
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 16px Inter, system-ui, sans-serif";
    ctx.fillText(holderName, 32, y + 40);

    // Vehicle
    ctx.fillStyle = "#9CA3AF";
    ctx.font = "12px Inter, system-ui, sans-serif";
    ctx.fillText("Véhicule recommandé", 32, y + 68);
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 18px Inter, system-ui, sans-serif";
    ctx.fillText(vehicleName, 32, y + 90);

    // Try to draw vehicle image
    try {
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject();
        img.src = vehicleImageUrl.startsWith("/")
          ? `${window.location.origin}${vehicleImageUrl}`
          : vehicleImageUrl;
      });
      const imgW = 200;
      const imgH = 120;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(rect.width - imgW - 32, y + 20, imgW, imgH, 8);
      ctx.clip();
      ctx.drawImage(img, rect.width - imgW - 32, y + 20, imgW, imgH);
      ctx.restore();
    } catch {
      // Skip image if CORS fails
    }

    // Footer
    ctx.fillStyle = "#4B5563";
    ctx.font = "10px Inter, system-ui, sans-serif";
    const date = new Date().toLocaleDateString("fr-MA", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    ctx.fillText(`Délivré le ${date} — toyota.co.ma`, 32, rect.height - 28);

    return canvas;
  }, [personaTitle, tagline, vehicleName, vehicleImageUrl, holderName]);

  const handleDownload = async () => {
    const canvas = await renderToCanvas();
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `permis-legende-toyota-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const handleWhatsAppShare = async () => {
    const text = encodeURIComponent(
      `🏆 Mon Permis de Légende Toyota DNA\n\n` +
        `Titre: ${personaTitle}\n` +
        `${tagline}\n\n` +
        `Véhicule: ${vehicleName}\n` +
        `Découvrez votre ADN Toyota → ${window.location.origin}/quiz`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div
        ref={cardRef}
        className="relative overflow-hidden rounded-2xl border-2 border-toyota-gold/40 bg-gradient-to-br from-[#0a0a0a] via-[#121212] to-[#1a0808] p-6 md:p-8"
      >
        <div className="absolute top-0 inset-x-0 h-1 bg-toyota-red" />
        <div className="absolute top-4 right-4 opacity-10">
          <Award className="h-24 w-24 text-toyota-gold" />
        </div>

        <div className="relative z-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-toyota-gold">
            Permis de Légende — Toyota DNA
          </p>
          <p className="mt-1 font-black text-xl text-white tracking-tight">TOYOTA MAROC</p>

          <h3 className="mt-6 text-2xl md:text-3xl font-black text-toyota-red leading-tight">
            {personaTitle}
          </h3>
          <p className="mt-2 text-sm text-white/50 max-w-md leading-relaxed">{tagline}</p>

          <div className="mt-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-white/40">Titulaire</p>
              <p className="font-bold text-white">{holderName}</p>
              <p className="mt-3 text-[10px] uppercase tracking-wider text-white/40">Véhicule recommandé</p>
              <p className="font-bold text-white">{vehicleName}</p>
            </div>
            <div className="relative h-24 w-40 shrink-0 rounded-lg overflow-hidden border border-white/10 bg-white/5">
              <Image
                src={vehicleImageUrl}
                alt={vehicleName}
                fill
                className="object-cover"
                sizes="160px"
              />
            </div>
          </div>

          <p className="mt-6 text-[10px] text-white/30">
            Délivré le{" "}
            {new Date().toLocaleDateString("fr-MA", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <BorderDrawButton accent="red" onClick={handleDownload} className="!py-2.5 !px-5 !text-xs">
          <Download className="h-4 w-4" />
          Télécharger
        </BorderDrawButton>
        <BorderDrawButton onClick={handleWhatsAppShare} className="!py-2.5 !px-5 !text-xs">
          <Share2 className="h-4 w-4" />
          Partager WhatsApp
        </BorderDrawButton>
      </div>
    </div>
  );
}
