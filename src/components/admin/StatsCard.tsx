"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

const VARIANT_STYLES = {
  leads: { accent: "text-emerald-400", bar: "from-emerald-500/60 to-emerald-500/10" },
  reservations: { accent: "text-white", bar: "from-blue-500/50 to-blue-500/10" },
  conversion: { accent: "text-white", bar: "from-toyota-gold/50 to-toyota-gold/10" },
  revenue: { accent: "text-white", bar: "from-toyota-red/50 to-toyota-red/10" },
  vehicles: { accent: "text-white", bar: "from-white/30 to-white/5" },
} as const;

export type StatsCardVariant = keyof typeof VARIANT_STYLES;

export interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  variant?: StatsCardVariant;
  index?: number;
}

export function StatsCard({
  title,
  value,
  change,
  changeLabel,
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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      className="toyota-kpi-card relative overflow-hidden"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-white/50">
          {icon}
        </div>
        {change !== undefined && (
          <div
            className={cn(
              "flex items-center gap-0.5 text-[11px] font-bold",
              changePositive && "text-emerald-400",
              changeNegative && "text-red-400",
              changeNeutral && "text-white/35"
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

      <p className={cn("mt-4 text-3xl font-black tracking-tight", styles.accent)}>{value}</p>
      <p className="mt-1 text-xs font-bold uppercase tracking-wider text-white/50">{title}</p>
      {changeLabel && (
        <p className="mt-0.5 text-[10px] text-white/25">{changeLabel}</p>
      )}

      <div
        aria-hidden
        className={cn(
          "absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r opacity-80",
          styles.bar
        )}
      />
    </motion.div>
  );
}
