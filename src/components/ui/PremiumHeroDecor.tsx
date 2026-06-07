"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { DEALERSHIPS } from "@/data/dealerships";
import { cn } from "@/lib/utils";

export type HeroDecorVariant = "dealers" | "contact" | "purchase" | "road" | "minimal";

const EASE_PREMIUM = [0.22, 1, 0.36, 1] as const;

const PARTICLES = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  left: `${(i * 37) % 100}%`,
  top: `${(i * 23 + 11) % 100}%`,
  delay: (i % 8) * 0.45,
  duration: 4 + (i % 6),
  size: i % 3 === 0 ? 3 : 2,
}));

function DealerNetworkMap() {
  const dots = useMemo(() => {
    const lats = DEALERSHIPS.map((d) => d.lat);
    const lngs = DEALERSHIPS.map((d) => d.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    return DEALERSHIPS.map((d, i) => ({
      id: d.id,
      x: 14 + ((d.lng - minLng) / (maxLng - minLng || 1)) * 72,
      y: 12 + (1 - (d.lat - minLat) / (maxLat - minLat || 1)) * 76,
      delay: i * 0.06,
    }));
  }, []);

  return (
    <div className="absolute right-[-4%] top-1/2 -translate-y-1/2 w-[58%] max-w-[680px] h-[90%] pointer-events-none hidden lg:block">
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full opacity-70"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden
      >
        <motion.path
          d="M 22 18 C 38 8, 62 10, 78 22 C 88 38, 86 58, 74 72 C 58 86, 36 88, 24 76 C 12 62, 10 38, 22 18 Z"
          fill="rgba(235,10,30,0.04)"
          stroke="rgba(235,10,30,0.18)"
          strokeWidth="0.35"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2.2, ease: EASE_PREMIUM }}
        />

        {dots.map((dot) => (
          <motion.line
            key={`line-${dot.id}`}
            x1="48"
            y1="50"
            x2={dot.x}
            y2={dot.y}
            stroke="rgba(235,10,30,0.1)"
            strokeWidth="0.15"
            strokeDasharray="1 2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 + dot.delay, duration: 0.6 }}
          />
        ))}

        {dots.map((dot) => (
          <g key={dot.id}>
            <motion.circle
              cx={dot.x}
              cy={dot.y}
              r="2.5"
              fill="rgba(235,10,30,0.2)"
              initial={{ scale: 0 }}
              animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.35, 0.15] }}
              transition={{
                delay: 0.7 + dot.delay,
                duration: 2.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.circle
              cx={dot.x}
              cy={dot.y}
              r="0.9"
              fill="rgba(235,10,30,0.55)"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5 + dot.delay, type: "spring", stiffness: 260, damping: 18 }}
            />
          </g>
        ))}
      </svg>

      <motion.div
        className="absolute bottom-6 right-10 text-[clamp(5rem,12vw,9rem)] font-black text-white/[0.04] leading-none select-none tabular-nums"
        initial={{ opacity: 0, x: 48, filter: "blur(8px)" }}
        animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
        transition={{ duration: 1.1, delay: 0.35, ease: EASE_PREMIUM }}
      >
        {DEALERSHIPS.length}
      </motion.div>
    </div>
  );
}

function OrbitalRings({ accent = "right" }: { accent?: "right" | "center" }) {
  const pos =
    accent === "center"
      ? "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      : "right-[-5%] top-1/3";

  return (
    <>
      <motion.div
        className={cn("absolute w-[min(480px,55vw)] h-[min(480px,55vw)] rounded-full border border-[#EB0A1E]/12", pos)}
        animate={{ rotate: 360 }}
        transition={{ duration: 42, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className={cn(
          "absolute w-[min(360px,42vw)] h-[min(360px,42vw)] rounded-full border border-dashed border-white/[0.06]",
          accent === "center" ? "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" : "right-[2%] top-[38%]"
        )}
        animate={{ rotate: -360 }}
        transition={{ duration: 58, repeat: Infinity, ease: "linear" }}
      />
    </>
  );
}

export function PremiumHeroDecor({ variant = "minimal" }: { variant?: HeroDecorVariant }) {
  const isPhotoHero = variant === "road";

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {!isPhotoHero && (
        <div
          className="absolute inset-0 opacity-[0.028]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.85) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.85) 1px, transparent 1px)
            `,
            backgroundSize: "48px 48px",
          }}
        />
      )}

      <motion.div
        className={cn(
          "absolute -top-40 -right-40 w-[480px] h-[480px] rounded-full blur-3xl",
          isPhotoHero ? "bg-[#EB0A1E]/[0.08]" : "bg-[#EB0A1E]/[0.06]"
        )}
        animate={{ scale: [1, 1.04, 1], opacity: [0.35, 0.5, 0.35] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
      {!isPhotoHero && (
        <motion.div
          className="absolute -bottom-32 left-[15%] w-[360px] h-[360px] rounded-full bg-[#EB0A1E]/[0.04] blur-3xl"
          animate={{ scale: [1, 1.06, 1], opacity: [0.2, 0.35, 0.2] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      )}

      {PARTICLES.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-full bg-[#EB0A1E]/40 animate-particle-drift"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            opacity: 0.12 + (p.id % 4) * 0.05,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}

      <motion.div
        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#EB0A1E]/25 to-transparent"
        animate={{ top: ["8%", "88%", "8%"], opacity: [0.1, 0.25, 0.1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      {variant === "dealers" && <DealerNetworkMap />}
      {(variant === "contact" || variant === "purchase" || variant === "minimal") && (
        <OrbitalRings accent="right" />
      )}
      {variant === "road" && <OrbitalRings accent="center" />}
    </div>
  );
}
