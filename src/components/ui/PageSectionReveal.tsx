"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { MOTION_GPU_CLASS } from "@/lib/motion";
import { cn } from "@/lib/utils";

const EASE_PREMIUM = [0.22, 1, 0.36, 1] as const;

interface PageSectionRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right";
}

export function PageSectionReveal({
  children,
  className,
  delay = 0,
  direction = "up",
}: PageSectionRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const inView = useInView(ref, { once: true, amount: 0.12 });
  const reducedMotion = useReducedMotion() ?? false;

  useEffect(() => {
    setMounted(true);
  }, []);

  const offset = {
    up: { x: 0, y: 40 },
    left: { x: -32, y: 0 },
    right: { x: 32, y: 0 },
  }[direction];

  const hidden = { opacity: 0, x: offset.x, y: offset.y, filter: "blur(6px)" };
  const revealed = { opacity: 1, x: 0, y: 0, filter: "blur(0px)" };

  // SSR + first paint: static markup so server and client HTML match
  if (!mounted) {
    return (
      <div
        ref={ref}
        className={cn(className, MOTION_GPU_CLASS)}
        style={{
          opacity: 0,
          transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
        }}
      >
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={cn(className, MOTION_GPU_CLASS)}
      initial={reducedMotion ? revealed : hidden}
      animate={inView || reducedMotion ? revealed : hidden}
      transition={{ duration: reducedMotion ? 0 : 0.7, delay: reducedMotion ? 0 : delay, ease: EASE_PREMIUM }}
    >
      {children}
    </motion.div>
  );
}
