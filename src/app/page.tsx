"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, useInView, useScroll, useTransform, type Variants } from "framer-motion";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Bot,
  Sparkles,
  Shield,
  Leaf,
  Star,
  Zap,
  Volume2,
  VolumeX,
  Play,
  Pause,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { VEHICLES_DATA } from "@/data/vehicles";
import { formatPrice, cn } from "@/lib/utils";

// ─── Hero VIDEO slides ────────────────────────────────────────────────────────
// To use videos: place .mp4 files in /public/videos/ and update src below.
// Falls back gracefully to the poster image if video fails.

const SLIDES = [
  {
    id: "supra",
    video: "https://drive.google.com/uc?export=download&id=1suXOrHbL31qeae1ItDGfG8n71yfC2KFu",
    poster: "/images/vehicles/supra.jpg",
    eyebrow: "Sport Collection",
    headline: "Performance",
    headlineAccent: "Légendaire",
    sub: "340 ch de pur plaisir de conduite. La Supra — une icône réinventée.",
    cta: "Découvrir la Supra",
    href: "/vehicles/supra",
    objectPosition: "center center",
  },
] as const;

const CATEGORY_PILLS = [
  { key: "all", label: "Tous", count: 10 },
  { key: "suv", label: "SUV", count: 4 },
  { key: "berline", label: "Berline", count: 2 },
  { key: "sport", label: "Sport", count: 1 },
  { key: "hybride", label: "Hybride", count: 6 },
  { key: "pickup", label: "Pick-up", count: 1 },
] as const;

const FEATURED_IDS = ["rav4", "supra", "landcruiser"];
const FEATURED_TAGLINES: Record<string, string> = {
  rav4: "Le SUV familial le plus vendu au Maroc.",
  supra: "L'apogée du sport automobile japonais.",
  landcruiser: "Indestructible. Luxueux. Légendaire.",
};

const STATS = [
  { value: "85 ans", label: "d'expérience", icon: Shield },
  { value: "2M+", label: "clients satisfaits", icon: Star },
  { value: "+50", label: "modèles historiques", icon: Zap },
  { value: "100 %", label: "hybrides disponibles", icon: Leaf },
];

// ─── Animation variants ───────────────────────────────────────────────────────

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: i * 0.1 },
  }),
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

// ─── Video Hero Slide ─────────────────────────────────────────────────────────

function VideoSlide({
  slide,
  active,
  muted,
  playing,
}: {
  slide: (typeof SLIDES)[number];
  active: boolean;
  muted: boolean;
  playing: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (active) {
      v.currentTime = 0;
      if (playing) {
        v.play().catch(() => {});
      } else {
        v.pause();
      }
    } else {
      v.pause();
    }
  }, [active, playing]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted;
  }, [muted]);

  return (
    <motion.div
      key={slide.id}
      initial={{ opacity: 0, scale: 1.02 }}
      animate={{ opacity: active ? 1 : 0, scale: active ? 1 : 1.02 }}
      transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
      className="absolute inset-0"
    >
      {/* Video element — shows when a video src is provided */}
      {(slide as any).video ? (
        <video
          ref={videoRef}
          src={(slide as any).video}
          poster={slide.poster}
          loop
          muted={muted}
          playsInline
          preload="metadata"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: (slide as any).objectPosition || "center center" }}
        />
      ) : (
        /* Fallback: static image with Ken Burns zoom */
        <motion.div
          className="absolute inset-0"
          animate={active ? { scale: [1, 1.02] } : { scale: 1 }}
          transition={{ duration: 8, ease: "linear" }}
        >
          <Image
            src={slide.poster}
            alt={slide.headline}
            fill
            className="object-cover"
            style={{
              // allow customizing objectPosition per-slide to show cars better
              objectPosition: (slide as any).objectPosition || "center center",
            }}
            priority={active}
            sizes="100vw"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        </motion.div>
      )}

      {/* Cinematic gradient layers */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/30" />
      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)",
        }}
      />
    </motion.div>
  );
}

// ─── Horizontal scan line decoration ─────────────────────────────────────────

function ScanLines() {
  return (
    <div
      className="absolute inset-0 pointer-events-none opacity-[0.03]"
      style={{
        backgroundImage: "repeating-linear-gradient(0deg, #fff 0px, #fff 1px, transparent 1px, transparent 4px)",
      }}
    />
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const statsRef = useRef<HTMLDivElement>(null);
  const featuredRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  const statsInView = useInView(statsRef, { once: true, amount: 0.2 });
  const featuredInView = useInView(featuredRef, { once: true, amount: 0.1 });

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const goTo = useCallback(
    (idx: number) => setSlide(((idx % SLIDES.length) + SLIDES.length) % SLIDES.length),
    []
  );

  useEffect(() => {
    if (paused || !playing || SLIDES.length <= 1) return;
    timerRef.current = setTimeout(() => goTo(slide + 1), 7000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [slide, paused, playing, goTo]);

  const featuredVehicles = FEATURED_IDS.map((id) =>
    VEHICLES_DATA.find((v) => v.id === id)
  ).filter(Boolean);

  return (
    <>
      <Header />
      <main className="flex flex-col bg-[#080808]">

        {/* ══ CINEMATIC VIDEO HERO ══════════════════════════════════════════════ */}
        <section
          ref={heroRef}
          className="relative h-screen min-h-[680px] overflow-hidden bg-black select-none"
        >
          {/* Video / image slides */}
          <motion.div className="absolute inset-0" style={{ y: heroY }}>
            {SLIDES.map((s, i) => (
              <VideoSlide key={s.id} slide={s} active={i === slide} muted={muted} playing={playing} />
            ))}
          </motion.div>

          {/* Subtle scan lines */}
          <ScanLines />

          {/* ── HERO TEXT ── */}
          <motion.div
            className="relative z-10 h-full flex items-start pt-16 lg:pt-20"
            style={{ opacity: heroOpacity }}
          >
            <div className="section-container w-full max-w-2xl ml-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={"text-" + slide}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, x: -30, transition: { duration: 0.4 } }}
                  variants={stagger}
                  className="max-w-sm"
                >
                  {/* Headline */}
                  <motion.h1
                    variants={fadeUp}
                    custom={1}
                    className="text-[clamp(2.5rem,7vw,5rem)] font-black text-white leading-[0.92] tracking-[-0.03em] mb-1"
                  >
                    {SLIDES[slide].headline}
                  </motion.h1>
                  <motion.h1
                    variants={fadeUp}
                    custom={2}
                    className="text-[clamp(2.5rem,7vw,5rem)] font-black leading-[0.92] tracking-[-0.03em] mb-4"
                    style={{
                      WebkitTextStroke: "2px #EB0A1E",
                      color: "transparent",
                    }}
                  >
                    {SLIDES[slide].headlineAccent}
                  </motion.h1>

                  {/* Sub */}
                  <motion.p
                    variants={fadeUp}
                    custom={3}
                    className="text-white/65 text-sm lg:text-base leading-relaxed mb-6 max-w-md font-light"
                  >
                    {SLIDES[slide].sub}
                  </motion.p>

                  {/* CTAs */}
                  <motion.div variants={fadeUp} custom={4} className="flex flex-wrap gap-4 items-center">
                    <Link
                      href={SLIDES[slide].href}
                      className="group inline-flex items-center gap-3 px-8 py-4 bg-toyota-red text-white font-bold text-sm tracking-wide rounded-full transition-all duration-300 hover:px-10 hover:shadow-2xl hover:shadow-toyota-red/40 active:scale-95"
                    >
                      {SLIDES[slide].cta}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                    <Link
                      href="/vehicles"
                      className="inline-flex items-center gap-3 px-8 py-4 bg-white/8 backdrop-blur-md border border-white/20 text-white font-semibold text-sm tracking-wide rounded-full hover:bg-white/15 hover:border-white/35 transition-all duration-300"
                    >
                      Tous les modèles
                    </Link>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>

          {/* ── SLIDE CONTROLS (bottom center) ── */}
          {SLIDES.length > 1 && (
          <div className="absolute bottom-8 left-0 right-0 z-20 flex items-center justify-center gap-2">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => { goTo(i); setPaused(true); }}
                aria-label={`Slide ${i + 1}`}
                className="group flex items-center"
              >
                <span
                  className={cn(
                    "block rounded-full transition-all duration-500",
                    i === slide
                      ? "w-12 h-[3px] bg-toyota-red"
                      : "w-[3px] h-[3px] bg-white/30 group-hover:bg-white/60"
                  )}
                />
              </button>
            ))}
          </div>
          )}

          {/* ── PREV / NEXT arrows ── */}
          {SLIDES.length > 1 && (
          <>
          <button
            onClick={() => { goTo(slide - 1); setPaused(true); }}
            className="absolute left-5 sm:left-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/15 hover:border-white/40 transition-all group"
            aria-label="Précédent"
          >
            <ChevronLeft className="h-5 w-5 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <button
            onClick={() => { goTo(slide + 1); setPaused(true); }}
            className="absolute right-5 sm:right-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/15 hover:border-white/40 transition-all group"
            aria-label="Suivant"
          >
            <ChevronRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
          </button>
          </>
          )}

          {/* ── MEDIA CONTROLS (bottom right) ── */}
          <div className="absolute bottom-6 right-10 z-20 flex flex-col items-center gap-6">
            <button
              onClick={() => setPlaying((v) => !v)}
              className="w-12 h-12 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white hover:bg-white/12 transition-all"
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setMuted((v) => !v)}
              className="w-12 h-12 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white hover:bg-white/12 transition-all"
              aria-label={muted ? "Activer le son" : "Couper le son"}
            >
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
          </div>

          {/* ── Slide counter ── */}
          {SLIDES.length > 1 && (
          <div className="absolute bottom-9 left-1/2 z-20 hidden sm:flex items-center gap-2 text-white/30 text-xs font-mono tabular-nums -translate-x-1/2">
            <span className="text-white/70">{String(slide + 1).padStart(2, "0")}</span>
            <span className="h-px w-5 bg-white/20" />
            <span>{String(SLIDES.length).padStart(2, "0")}</span>
          </div>
          )}

          {/* ── Bottom fade ── */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#080808] to-transparent pointer-events-none z-10" />
        </section>

        {/* ══ CATEGORY NAV ═════════════════════════════════════════════════════ */}
        <section className="bg-[#0C0C0C] border-b border-white/[0.06] sticky top-[64px] lg:top-[80px] z-30">
          <div className="section-container">
            <div
              className="flex items-center gap-2 py-4 overflow-x-auto"
              style={{ scrollbarWidth: "none" }}
            >
              <span className="text-white/20 text-[10px] font-bold uppercase tracking-[0.3em] shrink-0 mr-2 select-none">
                Gamme
              </span>
              {CATEGORY_PILLS.map(({ key, label, count }) => (
                <Link
                  key={key}
                  href={key === "all" ? "/vehicles" : `/vehicles?category=${key}`}
                  onClick={() => setActiveCategory(key)}
                  className={cn(
                    "shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-wide transition-all duration-300 border",
                    activeCategory === key
                      ? "bg-toyota-red text-white border-toyota-red shadow-lg shadow-toyota-red/20"
                      : "bg-white/[0.04] text-white/50 border-white/[0.08] hover:bg-white/[0.08] hover:text-white/80 hover:border-white/15"
                  )}
                >
                  {label}
                  <span
                    className={cn(
                      "text-[9px] font-bold px-1.5 py-0.5 rounded-full",
                      activeCategory === key
                        ? "bg-white/25 text-white"
                        : "bg-white/8 text-white/30"
                    )}
                  >
                    {count}
                  </span>
                </Link>
              ))}
              <Link
                href="/vehicles"
                className="shrink-0 ml-auto inline-flex items-center gap-1.5 text-xs text-white/30 hover:text-toyota-red transition-colors font-semibold whitespace-nowrap tracking-wide"
              >
                Tout voir
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </section>

        {/* ══ FEATURED VEHICLES ════════════════════════════════════════════════ */}
        <section className="bg-[#080808] py-24 lg:py-32">
          <div className="section-container">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="mb-14"
            >
              <motion.p
                variants={fadeUp}
                className="text-toyota-red text-[10px] font-bold uppercase tracking-[0.4em] mb-3 flex items-center gap-2"
              >
                <span className="h-px w-8 bg-toyota-red" />
                Sélection Premium
              </motion.p>
              <div className="flex items-end justify-between flex-wrap gap-4">
                <motion.h2
                  variants={fadeUp}
                  custom={1}
                  className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.0]"
                >
                  Nos Modèles<br />
                  <span className="text-white/25">Phares</span>
                </motion.h2>
                <motion.div variants={fadeUp} custom={2}>
                  <Link
                    href="/vehicles"
                    className="group flex items-center gap-2 text-xs font-bold text-white/30 hover:text-white transition-colors uppercase tracking-widest"
                  >
                    Voir toute la gamme
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              ref={featuredRef}
              variants={stagger}
              initial="hidden"
              animate={featuredInView ? "visible" : "hidden"}
              className="grid grid-cols-1 lg:grid-cols-12 gap-4"
            >
              {featuredVehicles.map((vehicle, i) => {
                if (!vehicle) return null;
                const isMain = i === 0;
                return (
                  <motion.div
                    key={vehicle.id}
                    variants={fadeUp}
                    custom={i}
                    whileHover="hover"
                    className={cn(
                      "group relative rounded-2xl overflow-hidden bg-[#111111] cursor-pointer",
                      isMain ? "lg:col-span-7 lg:row-span-2" : "lg:col-span-5"
                    )}
                  >
                    {/* Image */}
                    <div className={cn("relative overflow-hidden", isMain ? "h-[420px] lg:h-full min-h-[420px]" : "h-56")}>
                      {vehicle.imageUrl && (
                        <motion.div
                          className="absolute inset-0"
                          variants={{ hover: { scale: 1.06 } }}
                          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                        >
                          <Image
                            src={vehicle.imageUrl}
                            alt={`Toyota ${vehicle.name}`}
                            fill
                            className="object-cover"
                            sizes={isMain ? "(max-width: 1024px) 100vw, 58vw" : "42vw"}
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).style.display = "none";
                            }}
                          />
                        </motion.div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/20 to-transparent" />
                      {/* Hover red glow */}
                      <div className="absolute inset-0 bg-toyota-red/0 group-hover:bg-toyota-red/6 transition-colors duration-700" />
                    </div>

                    {/* Card content */}
                    <div className={cn("p-6 lg:p-8", isMain ? "" : "")}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="h-px w-5 bg-toyota-red" />
                        <p className="text-white/30 text-[10px] uppercase tracking-[0.3em] font-bold">
                          {vehicle.category}
                        </p>
                      </div>
                      <h3 className={cn(
                        "text-white font-black group-hover:text-toyota-red transition-colors duration-300 mb-1.5",
                        isMain ? "text-3xl" : "text-xl"
                      )}>
                        {vehicle.name}
                      </h3>
                      <p className="text-white/40 text-sm mb-4 leading-relaxed line-clamp-2">
                        {FEATURED_TAGLINES[vehicle.id] ?? vehicle.description?.slice(0, 80) + "…"}
                      </p>
                      <p className="text-toyota-gold font-black text-xl mb-6">
                        À partir de {formatPrice(vehicle.priceFrom)}
                      </p>
                      <div className="flex gap-3">
                        <Link
                          href={"/vehicles/" + vehicle.id}
                          className="flex-1 text-center py-3 border border-white/12 text-white/70 text-xs font-bold tracking-wide uppercase rounded-full hover:bg-white/5 hover:text-white hover:border-white/25 transition-all duration-300"
                        >
                          Détails
                        </Link>
                        <Link
                          href={"/configurator/" + vehicle.id}
                          className="flex-1 text-center py-3 bg-toyota-red text-white text-xs font-black tracking-wide uppercase rounded-full hover:bg-toyota-red/85 transition-all duration-300 shadow-lg shadow-toyota-red/20 hover:shadow-toyota-red/35"
                        >
                          Configurer
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* ══ HORIZONTAL MARQUEE STRIP ═════════════════════════════════════════ */}
        <div className="bg-toyota-red py-3 overflow-hidden border-y border-toyota-red/20">
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="flex items-center gap-8 whitespace-nowrap"
          >
            {Array(8).fill(null).map((_, i) => (
              <span key={i} className="flex items-center gap-8 text-white/90 text-xs font-bold uppercase tracking-[0.3em]">
                <span>Performance Légendaire</span>
                <span className="text-white/30">◆</span>
                <span>Qualité Japonaise</span>
                <span className="text-white/30">◆</span>
                <span>Innovation Hybride</span>
                <span className="text-white/30">◆</span>
                <span>Excellence Toyota</span>
                <span className="text-white/30">◆</span>
              </span>
            ))}
          </motion.div>
        </div>

        {/* ══ AI ADVISOR SECTION ═══════════════════════════════════════════════ */}
        <section className="relative overflow-hidden py-28 lg:py-36">
          {/* Background */}
          <div className="absolute inset-0 bg-[#080808]" />
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `
                radial-gradient(ellipse 80% 60% at 70% 50%, rgba(235,10,30,0.12) 0%, transparent 60%),
                radial-gradient(ellipse 50% 50% at 20% 80%, rgba(235,10,30,0.06) 0%, transparent 50%)
              `,
            }}
          />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
              `,
              backgroundSize: "80px 80px",
            }}
          />

          <div className="section-container relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={stagger}
              >
                <motion.div
                  variants={fadeUp}
                  className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-toyota-red/10 border border-toyota-red/20 text-toyota-red text-[10px] font-bold uppercase tracking-[0.3em] mb-8"
                >
                  <Sparkles className="h-3 w-3" />
                  Propulsé par Gemini AI
                </motion.div>
                <motion.h2
                  variants={fadeUp}
                  custom={1}
                  className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.0] tracking-tight mb-6"
                >
                  Notre IA vous trouve{" "}
                  <span
                    style={{
                      WebkitTextStroke: "2px #EB0A1E",
                      color: "transparent",
                    }}
                  >
                    la Toyota parfaite
                  </span>{" "}
                  en 2 minutes
                </motion.h2>
                <motion.p
                  variants={fadeUp}
                  custom={2}
                  className="text-white/50 text-lg leading-relaxed mb-10 font-light"
                >
                  Dites-nous votre budget, vos besoins et votre style de vie. Notre conseiller virtuel analyse tout et vous recommande le modèle idéal.
                </motion.p>
                <motion.div variants={fadeUp} custom={3} className="flex items-center gap-4">
                  <button
                    onClick={() => window.dispatchEvent(new CustomEvent("openChatWidget"))}
                    className="group inline-flex items-center gap-3 px-8 py-4 bg-toyota-red text-white font-black text-sm tracking-wide rounded-full hover:px-10 transition-all duration-300 shadow-xl shadow-toyota-red/30 hover:shadow-toyota-red/50 active:scale-95"
                  >
                    Démarrer maintenant
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <span className="text-white/25 text-xs font-medium">Gratuit · 2 min · Sans inscription</span>
                </motion.div>
              </motion.div>

              {/* Right — decorative AI card */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                className="hidden lg:flex flex-col items-center justify-center"
              >
                <div className="relative">
                  {/* Glow rings */}
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.3, 0.15] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 rounded-full bg-toyota-red/20 blur-3xl"
                  />
                  <motion.div
                    animate={{ scale: [1.1, 1, 1.1], opacity: [0.1, 0.2, 0.1] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                    className="absolute -inset-8 rounded-full bg-toyota-red/10 blur-3xl"
                  />
                  {/* Bot icon card */}
                  <motion.div
                    animate={{ y: [-6, 6, -6] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="relative w-36 h-36 rounded-3xl bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-toyota-red/20 flex items-center justify-center shadow-2xl shadow-toyota-red/10"
                  >
                    <Bot className="h-16 w-16 text-toyota-red" />
                  </motion.div>
                </div>

                {/* Floating chips */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 }}
                  className="mt-8 flex flex-wrap gap-2 justify-center max-w-xs"
                >
                  {["Budget: 300k MAD", "7 places", "Hybride", "Famille"].map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-white/40 text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                  <span className="px-3 py-1.5 bg-toyota-red/10 border border-toyota-red/20 rounded-full text-toyota-red text-xs font-bold">
                    → Toyota Highlander Hybride
                  </span>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ══ STATS ROW ════════════════════════════════════════════════════════ */}
        <section className="py-20 border-y border-white/[0.05] bg-[#0C0C0C]">
          <div className="section-container">
            <motion.div
              ref={statsRef}
              variants={stagger}
              initial="hidden"
              animate={statsInView ? "visible" : "hidden"}
              className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 lg:divide-x lg:divide-white/[0.06]"
            >
              {STATS.map(({ value, label, icon: Icon }, i) => (
                <motion.div
                  key={label}
                  variants={fadeUp}
                  custom={i}
                  className="flex flex-col items-center text-center lg:px-12"
                >
                  <div className="w-10 h-10 rounded-xl bg-toyota-red/10 border border-toyota-red/15 flex items-center justify-center mb-4">
                    <Icon className="h-5 w-5 text-toyota-red" />
                  </div>
                  <p className="text-4xl lg:text-5xl font-black text-white mb-1.5 tracking-tight">{value}</p>
                  <p className="text-white/30 text-xs font-medium uppercase tracking-widest">{label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ══ FULL-WIDTH PROMO BANNER ══════════════════════════════════════════ */}
        <section className="relative h-[60vh] min-h-[420px] overflow-hidden">
          <Image
            src="/images/vehicles/highlander.jpg"
            alt="Toyota Highlander"
            fill
            className="object-cover"
            sizes="100vw"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          <div className="absolute inset-0 flex items-center">
            <div className="section-container">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={stagger}
              >
                <motion.p
                  variants={fadeUp}
                  className="text-toyota-gold font-bold text-[10px] uppercase tracking-[0.4em] mb-5 flex items-center gap-2"
                >
                  <span className="h-px w-8 bg-toyota-gold" />
                  Offres Spéciales 2026
                </motion.p>
                <motion.h2
                  variants={fadeUp}
                  custom={1}
                  className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[0.95] tracking-tight mb-6"
                >
                  L&apos;Été Commence Ici.<br />
                  <span
                    style={{
                      WebkitTextStroke: "2px #EB0A1E",
                      color: "transparent",
                    }}
                  >
                    Roulez Toyota.
                  </span>
                </motion.h2>
                <motion.p
                  variants={fadeUp}
                  custom={2}
                  className="text-white/55 text-lg mb-10 max-w-md leading-relaxed font-light"
                >
                  Profitez de nos offres saisonnières exclusives et de conditions de financement avantageuses sur toute la gamme.
                </motion.p>
                <motion.div variants={fadeUp} custom={3}>
                  <Link
                    href="/vehicles"
                    className="group inline-flex items-center gap-3 px-8 py-4 bg-toyota-red text-white font-black text-sm tracking-wide rounded-full hover:px-10 transition-all duration-300 shadow-xl shadow-toyota-red/30 hover:shadow-toyota-red/50"
                  >
                    Voir les offres
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </div>
          {/* Bottom fade into footer */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#080808] to-transparent pointer-events-none" />
        </section>

      </main>
      <Footer />
    </>
  );
}