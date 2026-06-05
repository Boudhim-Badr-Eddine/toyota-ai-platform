"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Variant config ────────────────────────────────────────────────────────────

const VARIANT_STYLES = {
  leads: {
    iconBg: "bg-blue-500/15 border-blue-500/20",
    iconColor: "text-blue-400",
    valueColor: "text-blue-400",
    glowColor: "rgba(59,130,246,0.08)",
  },
  reservations: {
    iconBg: "bg-green-500/15 border-green-500/20",
    iconColor: "text-green-400",
    valueColor: "text-green-400",
    glowColor: "rgba(34,197,94,0.08)",
  },
  conversion: {
    iconBg: "bg-toyota-gold/15 border-toyota-gold/20",
    iconColor: "text-toyota-gold",
    valueColor: "text-toyota-gold",
    glowColor: "rgba(201,168,76,0.08)",
  },
  vehicles: {
    iconBg: "bg-toyota-red/15 border-toyota-red/20",
    iconColor: "text-toyota-red",
    valueColor: "text-toyota-red",
    glowColor: "rgba(235,10,30,0.08)",
  },
} as const;

export type StatsCardVariant = keyof typeof VARIANT_STYLES;

// ─── Props ─────────────────────────────────────────────────────────────────────

export interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;        // percentage change (+12 → +12%, -5 → -5%)
  changeLabel?: string;   // e.g. "vs hier", "vs mois dernier"
  icon: React.ReactNode;
  variant?: StatsCardVariant;
  index?: number;
}

// ─── StatsCard ─────────────────────────────────────────────────────────────────

export function StatsCard({
  title,
  value,
  change,
  changeLabel = "vs hier",
  icon,
  variant = "leads",
  index = 0,
}: StatsCardProps) {
  const styles = VARIANT_STYLES[variant];

  const changePositive = change !== undefined && change > 0;
  const changeNegative = change !== undefined && change < 0;
  const changeNeutral = change === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: "easeOut" }}
      className="relative bg-[#111111] border border-white/5 rounded-2xl p-5 overflow-hidden"
      style={{ boxShadow: `0 4px 32px ${styles.glowColor}` }}
    >
      {/* Background glow blob */}
      <div
        aria-hidden
        className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-30 blur-2xl pointer-events-none"
        style={{ backgroundColor: styles.glowColor }}
      />

      <div className="relative flex items-start justify-between gap-3">
        {/* Icon */}
        <div
          className={cn(
            "w-10 h-10 rounded-xl border flex items-center justify-center shrink-0",
            styles.iconBg
          )}
        >
          <span className={styles.iconColor}>{icon}</span>
        </div>

        {/* Change badge */}
        {change !== undefined && (
          <div
            className={cn(
              "flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full",
              changePositive && "bg-green-500/10 text-green-400",
              changeNegative && "bg-red-500/10 text-red-400",
              changeNeutral && "bg-white/5 text-toyota-muted/60"
            )}
          >
            {changePositive && <TrendingUp className="h-3 w-3" />}
            {changeNegative && <TrendingDown className="h-3 w-3" />}
            {changeNeutral && <Minus className="h-3 w-3" />}
            {changePositive ? "+" : ""}
            {change}%
          </div>
        )}
      </div>

      <div className="mt-3">
        <p
          className={cn(
            "text-3xl font-black leading-none tracking-tight",
            styles.valueColor
          )}
        >
          {value}
        </p>
        <p className="text-white/80 text-sm font-semibold mt-1.5 leading-tight">{title}</p>
        {change !== undefined && changeLabel && (
          <p className="text-toyota-muted/40 text-[10px] mt-0.5">{changeLabel}</p>
        )}
      </div>
    </motion.div>
  );
}
