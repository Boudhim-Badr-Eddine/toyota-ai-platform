"use client";

import { Suspense, useEffect, useState } from "react";
import { motion, animate } from "framer-motion";
import { Sparkles } from "lucide-react";
import { VEHICLES_DATA } from "@/data/vehicles";
import { VehicleGrid } from "@/components/catalog/VehicleGrid";
import { ComparisonBanner } from "@/components/catalog/ComparisonBanner";
import { VehicleGridSkeleton } from "@/components/ui/Skeleton";
import { BorderDrawButton } from "@/components/ui/BorderDrawButton";

const EASE_PREMIUM = [0.22, 1, 0.36, 1] as const;
const VEHICLE_COUNT = VEHICLES_DATA.length;

function CountUp({ value, duration = 1.4 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration,
      ease: EASE_PREMIUM,
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [value, duration]);

  return <>{display}</>;
}

export function VehiclesPageClient() {
  const [ready, setReady] = useState(false);
  const vehicles = VEHICLES_DATA;

  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), 480);
    return () => window.clearTimeout(timer);
  }, []);

  const handleOpenChat = () => {
    window.dispatchEvent(new CustomEvent("openChatWidget"));
  };

  return (
    <div className="toyota-page pb-28 lg:pb-16">
      {/* Premium header */}
      <section className="relative w-full overflow-hidden bg-[#050505] border-b border-white/[0.06]">
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)
            `,
            backgroundSize: "48px 48px",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#EB0A1E]/[0.04] via-transparent to-transparent pointer-events-none" />

        <div className="section-container relative py-16 md:py-24 lg:py-28">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE_PREMIUM }}
            className="text-[#EB0A1E] text-[10px] font-bold uppercase tracking-[0.45em] mb-4"
          >
            Catalogue officiel
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, delay: 0.08, ease: EASE_PREMIUM }}
            className="text-[clamp(2.75rem,8vw,5.5rem)] font-black text-white leading-[0.92] tracking-[-0.03em] mb-5"
          >
            Notre Gamme
          </motion.h1>

          <motion.span
            className="block h-[3px] bg-[#EB0A1E] mb-6"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.9, delay: 0.25, ease: EASE_PREMIUM }}
            style={{ width: 120, transformOrigin: "left" }}
          />

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.35, ease: EASE_PREMIUM }}
            className="text-white/45 text-sm md:text-base max-w-xl leading-relaxed mb-8"
          >
            <span className="text-white font-black text-2xl md:text-3xl tabular-nums">
              <CountUp value={VEHICLE_COUNT} />
            </span>{" "}
            modèles d&apos;exception. Filtrez, comparez et configurez votre véhicule Toyota idéal — le tout en 3D.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-wrap gap-6 md:gap-10"
          >
            {[
              { value: `${VEHICLE_COUNT}`, label: "Modèles", countUp: true },
              { value: "10+", label: "Couleurs" },
              { value: "3D", label: "Configurateur" },
              { value: "6", label: "Hybrides" },
            ].map(({ value, label, countUp }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 + i * 0.08, duration: 0.5, ease: EASE_PREMIUM }}
                className="text-left"
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#EB0A1E] mb-1">
                  {label}
                </p>
                <p className="text-xl md:text-2xl font-black text-white tabular-nums">
                  {countUp ? <CountUp value={VEHICLE_COUNT} duration={1.2} /> : value}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="section-container pt-8 pb-2">
        <ComparisonBanner />
      </section>

      <section className="section-container pb-4">
        <div className="rounded-none border border-white/[0.06] bg-[#0a0a0a] px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#EB0A1E]/15 border border-[#EB0A1E]/25 flex items-center justify-center shrink-0">
              <Sparkles className="h-4 w-4 text-[#EB0A1E]" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm leading-tight">
                Vous ne savez pas quel modèle choisir ?
              </p>
              <p className="text-white/40 text-xs">
                Notre IA Toyota vous guide en moins de 2 minutes.
              </p>
            </div>
          </div>
          <BorderDrawButton
            accent="red"
            onClick={handleOpenChat}
            className="shrink-0 !py-2.5 !px-5 !text-xs"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Consulter l&apos;IA
          </BorderDrawButton>
        </div>
      </section>

      <section className="section-container py-10 md:py-14">
        {!ready ? (
          <VehicleGridSkeleton count={6} />
        ) : (
          <Suspense fallback={<VehicleGridSkeleton count={6} />}>
            <VehicleGrid vehicles={vehicles} />
          </Suspense>
        )}
      </section>
    </div>
  );
}
