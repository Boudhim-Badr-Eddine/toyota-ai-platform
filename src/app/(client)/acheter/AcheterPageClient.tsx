"use client";

import { Suspense, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  Car,
  Settings,
  Calculator,
  MapPin,
  CheckCircle2,
  Shield,
  CreditCard,
  Truck,
  ShoppingBag,
} from "lucide-react";
import { PurchaseWizard } from "@/components/dealer/PurchaseWizard";
import { FinanceSimulator } from "@/components/commerce/FinanceSimulator";
import { formatPrice } from "@/lib/utils";
import { PremiumHeroDecor } from "@/components/ui/PremiumHeroDecor";
import { PageSectionReveal } from "@/components/ui/PageSectionReveal";
import { BorderDrawButton } from "@/components/ui/BorderDrawButton";

const TOYOTA_RED = "#EB0A1E";
const EASE_PREMIUM = [0.22, 1, 0.36, 1] as const;

const BUYING_STEPS = [
  {
    icon: Car,
    title: "Choisissez votre modèle",
    description: "Parcourez la gamme Toyota et sélectionnez le véhicule qui correspond à votre style de vie.",
  },
  {
    icon: Settings,
    title: "Configurez & personnalisez",
    description: "Couleurs, finitions, options — créez la Toyota qui vous ressemble via notre configurateur.",
  },
  {
    icon: Calculator,
    title: "Simulez votre financement",
    description: "Estimez votre mensualité en temps réel et trouvez la formule adaptée à votre budget.",
  },
  {
    icon: MapPin,
    title: "Trouvez votre concession",
    description: "Localisez le concessionnaire Toyota le plus proche, trié automatiquement par distance.",
  },
  {
    icon: CheckCircle2,
    title: "Confirmez & roulez",
    description: "Réservez votre créneau, finalisez votre demande et laissez nos conseillers vous accompagner.",
  },
] as const;

const TRUST_BADGES = [
  {
    icon: Shield,
    title: "Garantie",
    description: "3 ans / 100 000 km sur tous les modèles neufs",
  },
  {
    icon: CreditCard,
    title: "Financement",
    description: "Taux préférentiels et mensualités sur mesure",
  },
  {
    icon: Truck,
    title: "Livraison",
    description: "Livraison à domicile ou en concession",
  },
] as const;

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: EASE_PREMIUM },
  }),
};

function TimelineSection() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });

  return (
    <section ref={ref} className="section-container py-16 md:py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: EASE_PREMIUM }}
        className="text-center mb-14 md:mb-16"
      >
        <p className="text-[#EB0A1E] text-[10px] font-bold uppercase tracking-[0.4em] mb-3">
          Parcours simplifié
        </p>
        <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
          Votre achat en{" "}
          <span style={{ WebkitTextStroke: `1.5px ${TOYOTA_RED}`, color: "transparent" }}>
            5 étapes
          </span>
        </h2>
      </motion.div>

      <div className="relative max-w-5xl mx-auto">
        {/* Connecting line — desktop */}
        <div
          className="hidden lg:block absolute top-[2.75rem] left-[10%] right-[10%] h-px bg-white/[0.08]"
          aria-hidden
        >
          <motion.div
            className="h-full bg-gradient-to-r from-transparent via-[#EB0A1E]/60 to-transparent origin-left"
            initial={{ scaleX: 0 }}
            animate={inView ? { scaleX: 1 } : {}}
            transition={{ duration: 1.2, delay: 0.3, ease: EASE_PREMIUM }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 lg:gap-4">
          {BUYING_STEPS.map((step, i) => (
            <motion.div
              key={step.title}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              className="relative flex flex-col items-center text-center"
            >
              {/* Mobile vertical line */}
              {i < BUYING_STEPS.length - 1 && (
                <div
                  className="lg:hidden absolute left-1/2 top-[3.5rem] w-px h-[calc(100%-1rem)] bg-white/[0.08] -translate-x-1/2"
                  aria-hidden
                />
              )}

              <div className="relative z-10 mb-5">
                <div className="w-14 h-14 rounded-full bg-[#111111] border-2 border-[#EB0A1E] flex items-center justify-center">
                  <step.icon className="h-6 w-6 text-[#EB0A1E]" />
                </div>
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#EB0A1E] text-white text-[10px] font-black flex items-center justify-center">
                  {i + 1}
                </span>
              </div>

              <div className="rounded-2xl border border-white/[0.06] bg-[#111111] p-5 w-full hover:border-[#EB0A1E]/30 transition-colors duration-300">
                <h3 className="text-white font-bold text-sm mb-2 leading-snug">{step.title}</h3>
                <p className="text-white/40 text-xs leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinanceSection() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.12 });
  const [budget, setBudget] = useState(350000);

  const budgetMin = 150000;
  const budgetMax = 800000;
  const budgetPct = ((budget - budgetMin) / (budgetMax - budgetMin)) * 100;

  return (
    <section
      ref={ref}
      id="finance"
      className="relative border-y border-white/[0.06] bg-[#0a0a0a] py-16 md:py-24 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#EB0A1E]/[0.04] via-transparent to-transparent pointer-events-none" />

      <div className="section-container relative">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: EASE_PREMIUM }}
          className="mb-10 md:mb-12"
        >
          <p className="text-[#EB0A1E] text-[10px] font-bold uppercase tracking-[0.4em] mb-3">
            Financement
          </p>
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-3">
            Calculez votre mensualité
          </h2>
          <p className="text-white/40 text-sm max-w-lg">
            Ajustez votre budget et visualisez votre mensualité estimée en temps réel.
          </p>
        </motion.div>

        {/* Budget range slider */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.1, ease: EASE_PREMIUM }}
          className="mb-8 rounded-none border border-white/[0.08] bg-[#111111] p-6 md:p-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/35 mb-1">
                Budget véhicule
              </p>
              <p className="text-3xl md:text-4xl font-black text-white tabular-nums">
                {formatPrice(budget)}
              </p>
            </div>
            <p className="text-white/30 text-xs">
              {formatPrice(budgetMin)} — {formatPrice(budgetMax)}
            </p>
          </div>

          <div className="relative">
            <input
              type="range"
              min={budgetMin}
              max={budgetMax}
              step={5000}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full h-2 rounded-none appearance-none cursor-pointer bg-white/[0.08] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-none [&::-webkit-slider-thumb]:bg-[#EB0A1E]/70 [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-white/25 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-none [&::-moz-range-thumb]:bg-[#EB0A1E]/70 [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-white/25"
              style={{
                background: `linear-gradient(to right, rgba(235,10,30,0.45) 0%, rgba(235,10,30,0.45) ${budgetPct}%, rgba(255,255,255,0.08) ${budgetPct}%, rgba(255,255,255,0.08) 100%)`,
              }}
              aria-label="Budget véhicule"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2, ease: EASE_PREMIUM }}
        >
          <FinanceSimulator
            key={budget}
            defaultPrice={budget}
            className="!bg-[#111111] !border-white/[0.08] !rounded-none"
          />
        </motion.div>
      </div>
    </section>
  );
}

function TrustBadgesSection() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section ref={ref} className="section-container py-14 md:py-20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {TRUST_BADGES.map((badge, i) => (
          <motion.div
            key={badge.title}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="flex items-start gap-4 p-6 rounded-2xl border border-white/[0.06] bg-[#111111] hover:border-[#EB0A1E]/25 transition-colors duration-300"
          >
            <div className="w-12 h-12 rounded-full bg-[#EB0A1E]/10 border border-[#EB0A1E]/25 flex items-center justify-center shrink-0">
              <badge.icon className="h-5 w-5 text-[#EB0A1E]" />
            </div>
            <div>
              <h3 className="text-white font-bold text-base mb-1">{badge.title}</h3>
              <p className="text-white/40 text-sm leading-relaxed">{badge.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function HeroCta({ onStart }: { onStart: () => void }) {
  return (
    <BorderDrawButton accent="red" onClick={onStart}>
      Démarrer mon achat
    </BorderDrawButton>
  );
}

export function AcheterPageClient() {
  const wizardRef = useRef<HTMLDivElement>(null);

  const scrollToWizard = () => {
    wizardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="toyota-page pb-28 lg:pb-16">
      {/* ── Dark hero ───────────────────────────────────────────────────── */}
      <section className="relative w-full overflow-hidden bg-[#080808] border-b border-white/[0.06]">
        <PremiumHeroDecor variant="purchase" />

        <div className="section-container relative z-10 py-16 md:py-24 lg:py-28 text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE_PREMIUM }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#EB0A1E]/25 bg-[#EB0A1E]/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#EB0A1E]"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            Parcours d&apos;achat
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 32, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.85, delay: 0.08, ease: EASE_PREMIUM }}
            className="text-[clamp(2.75rem,9vw,5.75rem)] font-black text-white leading-[0.92] tracking-[-0.04em] mb-6"
          >
            Acheter Votre
            <br />
            <span className="text-[#EB0A1E]">Toyota</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: EASE_PREMIUM }}
            className="mx-auto max-w-xl text-base md:text-lg text-white/45 leading-relaxed mb-10"
          >
            Choisissez votre modèle, simulez votre financement et trouvez la concession Toyota
            la plus proche de vous.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.32, ease: EASE_PREMIUM }}
          >
            <HeroCta onStart={scrollToWizard} />
          </motion.div>
        </div>
      </section>

      <PageSectionReveal>
        <TimelineSection />
      </PageSectionReveal>
      <FinanceSection />
      <PageSectionReveal delay={0.05}>
        <TrustBadgesSection />
      </PageSectionReveal>

      {/* CTA repeat before wizard */}
      <PageSectionReveal className="section-container pb-10 text-center">
        <HeroCta onStart={scrollToWizard} />
      </PageSectionReveal>

      {/* ── Purchase wizard (logic untouched) ───────────────────────────── */}
      <div
        id="purchase-wizard"
        ref={wizardRef}
        className="border-t border-white/[0.06] bg-[#050505]"
      >
        <PageSectionReveal className="section-container pt-10 pb-4">
          <p className="text-[#EB0A1E] text-[10px] font-bold uppercase tracking-[0.4em] mb-2 text-center">
            Commencer maintenant
          </p>
          <h2 className="text-2xl md:text-3xl font-black text-white text-center tracking-tight">
            Votre parcours d&apos;achat
          </h2>
        </PageSectionReveal>
        <Suspense fallback={<div className="section-container py-20 text-white/40">Chargement…</div>}>
          <PurchaseWizard />
        </Suspense>
      </div>
    </div>
  );
}
