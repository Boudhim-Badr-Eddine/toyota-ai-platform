"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function RedScanBeam({
  className,
  duration = 3.2,
}: {
  className?: string;
  duration?: number;
}) {
  return (
    <motion.div
      aria-hidden
      className={cn(
        "absolute left-0 right-0 h-[2px] bg-[#EB0A1E] pointer-events-none z-20",
        className
      )}
      animate={{ top: ["0%", "100%", "0%"] }}
      transition={{ duration, repeat: Infinity, ease: "linear" }}
    />
  );
}
