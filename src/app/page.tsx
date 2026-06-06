"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, useInView, type Variants } from "framer-motion";
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
import { AppShell } from "@/components/layout/AppShell";
import { VEHICLES_DATA } from "@/data/vehicles";
import { formatPrice, cn } from "@/lib/utils";

// ─── Hero slides ─────────────────────────────────────────────────────────────

type HeroSlide = {
  id: string;
  image: string;
  video?: string;
  eyebrow: string;
  headline: string;
  headlineRed: string;
  sub: string;
  cta: string;
  href: string;
  objectPosition?: string;
};

const SLIDES: HeroSlide[] = [
  {
    id: "rav4",
    image: "/images/vehicles/rav4.jpg",
    eyebrow: "Toyota Maroc",
    headline: "L’Aventure",
    headlineRed: "Commence Ici",
    sub: "Le RAV4 hybride redéfinit l’exploration — économique, spacieux, indestructible.",
    cta: "Explorer le RAV4",
    href: "/vehicles/rav4",
  },
  {
    id: "supra",
    image: "/images/vehicles/supra.jpg",
    video:
      "https://drive.google.com/uc?export=download&id=1suXOrHbL31qeae1ItDGfG8n71yfC2KFu",
    eyebrow: "Sport Collection",
    headline: "Performance",
    headlineRed: "Légendaire",
    sub: "340 ch de pur plaisir de conduite. La Supra — une icône réinventée.",
    cta: "Découvrir la Supra",
    href: "/vehicles/supra",
    objectPosition: "center center",
  },
  {
    id: "highlander",
    image: "/images/vehicles/highlander.jpg",
    eyebrow: "SUV Premium",
    headline: "Votre Famille,",
    headlineRed: "Notre Priorité",
    sub: "Le Highlander hybride — 7 places, luxe raffiné, zéro compromis.",
    cta: "Voir le Highlander",
    href: "/vehicles/highlander",
  },
];

// ─── Category pills ───────────────────────────────────────────────────────────

const CATEGORY_PILLS = [
  { key: "all", label: "Tous", count: 10 },
  { key: "suv", label: "SUV", count: 4 },
  { key: "berline", label: "Berline", count: 2 },
  { key: "sport", label: "Sport", count: 1 },
  { key: "hybride", label: "Hybride", count: 6 },
  { key: "pickup", label: "Pick-up", count: 1 },
] as const;

// ─── Featured vehicles ────────────────────────────────────────────────────────

const FEATURED_IDS = ["rav4", "supra", "landcruiser"];
const FEATURED_TAGLINES: Record<string, string> = {
  rav4: "Le SUV familial le plus vendu au Maroc.",
  supra: "L’apogée du sport automobile japonais.",
  landcruiser: "Indestructible. Luxueux. Légendaire.",
};

// ─── Stats ────────────────────────────────────────────────────────────────────

const SLIDE_STATS: Record<string, { label: string; value: string; sub: string }[]> = {
  supra: [
    { label: "3.0L TURBO", value: "Moteur", sub: "Moteur" },
    { label: "4.3s", value: "0-100 KM/H", sub: "0-100 KM/H" },
    { label: "500 NM", value: "Couple", sub: "Couple" },
  ],
  rav4: [
    { label: "Hybride", value: "218 ch", sub: "Puissance" },
    { label: "5.8L", value: "/100 km", sub: "Consommation" },
    { label: "AWD", value: "4x4", sub: "Traction" },
  ],
  highlander: [
    { label: "7 places", value: "SUV", sub: "Capacité" },
    { label: "Hybride", value: "248 ch", sub: "Puissance" },
    { label: "5★", value: "NCAP", sub: "Sécurité" },
  ],
};

const STATS = [
  { value: "85 ans", label: "d’expérience", icon: Shield },
  { value: "2M+", label: "clients satisfaits", icon: Star },
  { value: "+50", label: "modèles historiques", icon: Zap },
  { value: "6", label: "modèles hybrides", icon: Leaf },
];

// ─── Animation variants ───────────────────────────────────────────────────────

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};
const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

// ─── Sparkle dots ─────────────────────────────────────────────────────────────

const SPARK_POS = [
  { x: "12%", y: "25%", d: 0 },
  { x: "78%", y: "18%", d: 0.5 },
  { x: "45%", y: "72%", d: 0.9 },
  { x: "88%", y: "65%", d: 1.3 },
  { x: "22%", y: "78%", d: 0.65 },
  { x: "62%", y: "38%", d: 1.1 },
];
function SparkleAnim() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {SPARK_POS.map(({ x, y, d }, i) => (
        <motion.span
          key={i}
          style={{ left: x, top: y, position: "absolute" }}
          animate={{ opacity: [0, 1, 0], scale: [0.4, 1.3, 0.4] }}
          transition={{ duration: 2.8, repeat: Infinity, delay: d, ease: "easeInOut" }}
          className="w-1.5 h-1.5 rounded-full bg-white/50 block"
        />
      ))}
    </div>
  );
}

function HeroMedia({
  slide,
  active,
  muted,
  playing,
}: {
  slide: HeroSlide;
  active: boolean;
  muted: boolean;
  playing: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (active && playing) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [active, playing]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted;
  }, [muted]);

  if (slide.video) {
    return (
      <video
        ref={videoRef}
        src={slide.video}
        poster={slide.image}
        loop
        muted={muted}
        playsInline
        preload="metadata"
        className="absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: slide.objectPosition ?? "center center" }}
      />
    );
  }

  return (
    <Image
      src={slide.image}
      alt={slide.headline}
      fill
      className="object-cover"
      priority={active}
      sizes="100vw"
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).style.display = "none";
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
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const statsRef = useRef<HTMLDivElement>(null);
  const featuredRef = useRef<HTMLDivElement>(null);
  const statsInView = useInView(statsRef, { once: true, amount: 0.2 });
  const featuredInView = useInView(featuredRef, { once: true, amount: 0.1 });

  const goTo = useCallback(
    (idx: number) => setSlide(((idx % SLIDES.length) + SLIDES.length) % SLIDES.length),
    []
  );

  useEffect(() => {
    if (paused || !playing) return;
    timerRef.current = setTimeout(() => goTo(slide + 1), 6000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [slide, paused, playing, goTo]);

  const featuredVehicles = FEATURED_IDS.map((id) =>
    VEHICLES_DATA.find((v) => v.id === id)
  ).filter(Boolean);

  return (
    <>
      <AppShell>
      <main className="flex flex-col">

        {/* ══ HERO SLIDER ══════════════════════════════════════════════════════ */}
        <section className="relative h-screen min-h-[600px] overflow-hidden bg-black select-none">
          <AnimatePresence mode="sync">
            <motion.div
              key={slide}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <HeroMedia
                slide={SLIDES[slide]}
                active
                muted={muted}
                playing={playing}
              />
              {/* Multi-layer gradient for depth */}
              <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/45 to-black/10" />
              <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-black/20" />
            </motion.div>
          </AnimatePresence>

          {/* Text overlay */}
          <div className="relative z-10 h-full flex items-center">
            <div className="section-container w-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={"text-" + slide}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ duration: 0.55, ease: "easeOut" }}
                  className="max-w-2xl"
                >
                  <p className="text-toyota-red text-xs font-bold uppercase tracking-[0.35em] mb-5">
                    {SLIDES[slide].eyebrow}
                  </p>
                  <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black text-white leading-[1.0] tracking-tight mb-2">
                    {SLIDES[slide].headline}
                  </h1>
                  <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black text-toyota-red leading-[1.0] tracking-tight mb-7">
                    {SLIDES[slide].headlineRed}
                  </h1>
                  <p className="text-white/75 text-xl leading-relaxed mb-10 max-w-lg">
                    {SLIDES[slide].sub}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Link href={SLIDES[slide].href} className="toyota-btn-primary inline-flex items-center gap-2.5 px-8 py-3.5">
                      {SLIDES[slide].cta}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link href="/vehicles" className="toyota-btn-secondary inline-flex items-center gap-2 px-8 py-3.5">
                      Tous les modèles
                    </Link>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Prev arrow */}
          <button
            onClick={() => { goTo(slide - 1); setPaused(true); }}
            className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/25 flex items-center justify-center text-white hover:bg-white/25 transition-all group"
            aria-label="Diapositive précédente"
          >
            <ChevronLeft className="h-5 w-5 group-hover:-translate-x-0.5 transition-transform" />
          </button>

          {/* Next arrow */}
          <button
            onClick={() => { goTo(slide + 1); setPaused(true); }}
            className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/25 flex items-center justify-center text-white hover:bg-white/25 transition-all group"
            aria-label="Diapositive suivante"
          >
            <ChevronRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Hero performance stats — mockup bottom-left */}
          <div className="absolute bottom-24 left-0 right-0 z-20 hidden md:block">
            <div className="section-container">
              <div className="flex gap-12">
                {(SLIDE_STATS[SLIDES[slide].id] ?? SLIDE_STATS.supra).map((s) => (
                  <div key={s.label}>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-toyota-red mb-1">{s.sub}</p>
                    <p className="text-2xl lg:text-3xl font-black text-white">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Video controls — visible when slide has video */}
          {SLIDES[slide].video && (
            <div className="absolute top-24 right-6 z-20 flex gap-2 sm:right-8">
              <button
                type="button"
                onClick={() => setPlaying((p) => !p)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-sm hover:bg-white/10"
                aria-label={playing ? "Pause vidéo" : "Lire la vidéo"}
              >
                {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={() => setMuted((m) => !m)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-sm hover:bg-white/10"
                aria-label={muted ? "Activer le son" : "Couper le son"}
              >
                {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>
            </div>
          )}

          {/* Dot indicators */}
          <div className="absolute bottom-8 left-0 right-0 z-20 flex items-center justify-center gap-3">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => { goTo(i); setPaused(true); }}
                className={cn(
                  "rounded-full transition-all duration-400",
                  i === slide
                    ? "w-8 h-2.5 bg-toyota-red shadow-lg shadow-toyota-red/40"
                    : "w-2.5 h-2.5 bg-white/35 hover:bg-white/65"
                )}
                aria-label={"Diapositive " + (i + 1)}
              />
            ))}
          </div>

          {/* Slide counter bottom-right */}
          <div className="absolute bottom-8 right-8 z-20 text-white/40 text-xs font-mono tabular-nums hidden sm:block">
            {String(slide + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}
          </div>
        </section>

        {/* ══ CATEGORY PILLS — dark strip ═══════════════════════════════════════ */}
        <section className="bg-black py-5 border-b border-white/[0.06] sticky top-[72px] z-30">
          <div className="section-container">
            <div className="flex items-center gap-3 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
              <span className="text-white/30 text-[10px] font-bold uppercase tracking-widest shrink-0 mr-1">Gamme</span>
              {CATEGORY_PILLS.map(({ key, label, count }) => (
                <Link
                  key={key}
                  href={key === "all" ? "/vehicles" : `/vehicles?category=${key}`}
                  onClick={() => setActiveCategory(key)}
                  className={cn(
                    "shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wide transition-all border",
                    activeCategory === key
                      ? "bg-toyota-red text-white border-toyota-red"
                      : "bg-[#121212] text-white/60 border-white/10 hover:border-white/25 hover:text-white"
                  )}
                >
                  {label}
                  <span className={cn("text-[10px] px-1.5 py-0.5 rounded", activeCategory === key ? "bg-white/20" : "bg-white/10")}>
                    {count}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ══ FEATURED VEHICLES ════════════════════════════════════════════════ */}
        <section className="bg-toyota-dark py-20 lg:py-28">
          <div className="section-container">
            <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
              <div>
                <p className="text-toyota-red text-xs font-bold uppercase tracking-[0.25em] mb-2">
                  Sélection Premium
                </p>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight">
                  Nos Modèles Phares
                </h2>
              </div>
              <Link
                href="/vehicles"
                className="flex items-center gap-2 text-sm font-semibold text-toyota-muted hover:text-white transition-colors"
              >
                Voir toute la gamme
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <motion.div
              ref={featuredRef}
              variants={stagger}
              initial="hidden"
              animate={featuredInView ? "visible" : "hidden"}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {featuredVehicles.map((vehicle, i) => {
                if (!vehicle) return null;
                return (
                  <motion.div
                    key={vehicle.id}
                    variants={fadeIn}
                    whileHover={{ y: -6, transition: { duration: 0.22 } }}
                    className={cn(
                      "group relative rounded-2xl overflow-hidden bg-[#111111] border border-white/5 hover:border-toyota-red/30 transition-colors duration-300",
                      i === 0 ? "lg:col-span-2" : ""
                    )}
                  >
                    {/* Image */}
                    <div className={cn("relative overflow-hidden", i === 0 ? "h-72" : "h-64")}>
                      {vehicle.imageUrl && (
                        <Image
                          src={vehicle.imageUrl}
                          alt={`Toyota ${vehicle.name}`}
                          fill
                          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                          sizes={i === 0 ? "(max-width: 1024px) 100vw, 67vw" : "(max-width: 768px) 100vw, 33vw"}
                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                        />
                      )}
                      <div className="absolute inset-0 bg-linear-to-t from-[#111111] via-[#111111]/30 to-transparent" />
                      {/* Red glow on hover */}
                      <div className="absolute inset-0 bg-toyota-red/0 group-hover:bg-toyota-red/5 transition-colors duration-500" />
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <p className="text-toyota-muted/60 text-xs uppercase tracking-widest mb-1">{vehicle.category}</p>
                      <h3 className="text-white text-xl font-black mb-1.5 group-hover:text-toyota-red transition-colors">
                        {vehicle.name}
                      </h3>
                      <p className="text-toyota-muted text-sm mb-3 leading-relaxed line-clamp-2">
                        {FEATURED_TAGLINES[vehicle.id] ?? vehicle.description.slice(0, 80) + "…"}
                      </p>
                      <p className="text-toyota-gold font-bold text-lg mb-5">
                        À partir de {formatPrice(vehicle.priceFrom)}
                      </p>
                      <div className="flex gap-3">
                        <Link
                          href={"/vehicles/" + vehicle.id}
                          className="flex-1 text-center py-2.5 border border-white/15 text-white text-sm font-semibold rounded-full hover:bg-white/5 transition-colors"
                        >
                          Détails
                        </Link>
                        <Link
                          href={"/configurator/" + vehicle.id}
                          className="flex-1 text-center py-2.5 bg-toyota-red text-white text-sm font-bold rounded-full hover:bg-toyota-red/90 transition-colors shadow-lg shadow-toyota-red/20"
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

        {/* ══ INGÉNIERIE DE PRÉCISION — bento grid ═══════════════════════════════ */}
        <section className="bg-black py-20 lg:py-28 border-t border-white/[0.06]">
          <div className="section-container">
            <div className="mb-12">
              <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">Ingénierie de Précision</h2>
              <div className="h-0.5 w-12 bg-toyota-red mt-4" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="toyota-panel lg:row-span-2 overflow-hidden group relative min-h-[280px]">
                <Image src="/images/vehicles/supra.jpg" alt="Moteur Supra" fill className="object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-linear-to-t from-black via-black/50 to-transparent" />
                <div className="absolute bottom-0 p-6">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-toyota-red">Performance</span>
                  <h3 className="text-xl font-black text-white mt-2">Transmission Manuelle à 6 rapports</h3>
                  <p className="text-white/50 text-sm mt-2 max-w-sm">Contrôle total, réponse instantanée — l&apos;ADN sport Toyota.</p>
                </div>
              </div>
              <div className="toyota-panel p-6 flex flex-col justify-between min-h-[160px]">
                <div className="w-10 h-10 rounded-md bg-toyota-red/15 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-toyota-red" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Aérodynamisme</h3>
                  <p className="text-white/45 text-sm mt-2">Stabilité à haute vitesse et efficience énergétique optimisées.</p>
                  <Link href="/vehicles/supra" className="inline-block mt-4 text-xs font-bold text-toyota-red uppercase tracking-wide hover:underline">En savoir plus →</Link>
                </div>
              </div>
              <div className="toyota-panel p-6 min-h-[160px]">
                <h3 className="text-lg font-bold text-white">Suspension Active</h3>
                <p className="text-white/45 text-sm mt-2">Confort quotidien et tenue de route sportive en un seul châssis.</p>
                <Link href="/vehicles" className="inline-block mt-4 text-xs font-bold text-toyota-red uppercase tracking-wide hover:underline">Détails techniques →</Link>
              </div>
              <div className="toyota-panel lg:col-span-2 overflow-hidden flex flex-col md:flex-row min-h-[180px]">
                <div className="p-6 flex-1 flex flex-col justify-center">
                  <h3 className="text-lg font-bold text-white">Cockpit Centré Conducteur</h3>
                  <p className="text-white/45 text-sm mt-2">Ergonomie pensée pour le plaisir de conduire — chaque commande à portée de main.</p>
                </div>
                <div className="relative w-full md:w-72 min-h-[140px] bg-[#1a1a1a]">
                  <Image src="/images/vehicles/camry.jpg" alt="Intérieur Toyota" fill className="object-cover opacity-80" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ AI ADVISOR BANNER ════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden py-20 lg:py-24" style={{ background: "linear-gradient(135deg, #0A0A0A 0%, #1a0305 50%, #0A0A0A 100%)" }}>
          {/* Animated red glow */}
          <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.15, 1] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-toyota-red/10 rounded-full blur-3xl pointer-events-none"
          />
          <SparkleAnim />

          <div className="section-container relative z-10">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
              {/* Left */}
              <div className="text-center lg:text-left max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-toyota-red/10 border border-toyota-red/25 text-toyota-red text-xs font-bold uppercase tracking-widest mb-5">
                  <Sparkles className="h-3.5 w-3.5" />
                  Propulsé par Groq AI
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
                  Notre IA vous trouve<br />
                  <span className="text-toyota-red">la Toyota parfaite</span><br />
                  en 2 minutes
                </h2>
                <p className="text-white/65 text-lg leading-relaxed">
                  Dites-nous votre budget, vos besoins et votre style de vie. Notre conseiller virtuel analyse tout et vous recommande le modèle idéal.
                </p>
              </div>

              {/* Right */}
              <div className="flex flex-col items-center gap-6 shrink-0">
                <motion.div
                  animate={{ scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="w-24 h-24 rounded-3xl bg-toyota-red/15 border border-toyota-red/30 flex items-center justify-center shadow-2xl shadow-toyota-red/20"
                >
                  <Bot className="h-12 w-12 text-toyota-red" />
                </motion.div>
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('openChatWidget'))}
                  className="inline-flex items-center gap-3 px-10 py-5 bg-toyota-red text-white font-black text-lg rounded-full hover:bg-toyota-red/90 transition-all shadow-2xl shadow-toyota-red/40 hover:shadow-toyota-red/60 hover:gap-5 hover:scale-105"
                >
                  Démarrer →
                </button>
                <p className="text-white/30 text-xs">
                  Gratuit &middot; Sans inscription &middot; 2 min
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ══ STATS ROW ════════════════════════════════════════════════════════ */}
        <section className="bg-[#0D0D0D] py-14 border-y border-white/5">
          <div className="section-container">
            <motion.div
              ref={statsRef}
              variants={stagger}
              initial="hidden"
              animate={statsInView ? "visible" : "hidden"}
              className="grid grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {STATS.map(({ value, label, icon: Icon }) => (
                <motion.div
                  key={label}
                  variants={fadeIn}
                  className="flex flex-col items-center text-center"
                >
                  <div className="w-12 h-12 rounded-2xl bg-toyota-red/10 border border-toyota-red/20 flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-toyota-red" />
                  </div>
                  <p className="text-4xl font-black text-white mb-1">{value}</p>
                  <p className="text-toyota-muted text-sm">{label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ══ FULL-WIDTH PROMO BANNER ══════════════════════════════════════════ */}
        <section className="relative h-[55vh] min-h-[400px] overflow-hidden">
          <Image
            src="/images/vehicles/highlander.jpg"
            alt="Toyota Highlander"
            fill
            className="object-cover"
            sizes="100vw"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
          <div className="absolute inset-0 bg-linear-to-r from-black/85 via-black/55 to-black/15" />
          <div className="absolute inset-0 flex items-center">
            <div className="section-container">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.65 }}
              >
                <p className="text-toyota-gold font-bold text-xs uppercase tracking-[0.3em] mb-4">
                  Offres Spéciales 2026
                </p>
                <h2 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6">
                  L&apos;Été Commence Ici.<br />
                  <span className="text-toyota-red">Roulez Toyota.</span>
                </h2>
                <p className="text-white/70 text-lg mb-8 max-w-md leading-relaxed">
                  Profitez de nos offres saisonnières exclusives et de conditions de financement avantageuses sur toute la gamme.
                </p>
                <Link
                  href="/offres"
                  className="inline-flex items-center gap-2.5 px-8 py-4 bg-toyota-red text-white font-bold rounded-full hover:bg-toyota-red/90 transition-all shadow-xl shadow-toyota-red/30 hover:gap-4"
                >
                  Voir les offres
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

      </main>
      </AppShell>
    </>
  );
}
