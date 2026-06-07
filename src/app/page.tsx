"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  motion,
  AnimatePresence,
  useInView,
  useScroll,
  useTransform,
  type Variants,
} from "framer-motion";
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
import { ContactStrip } from "@/components/layout/ContactInfo";
import { VEHICLES_DATA, getVehicleDisplayImage } from "@/data/vehicles";
import { cn } from "@/lib/utils";

const HERO_IMAGES = {
  supra: "/images/vehicles/supra-hero-2.png",
  rav4: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=1600&q=85",
  highlander: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=1600&q=85",
  camry: "/images/vehicles/camry-hero-2.png",
  promo: "/images/vehicles/rav4-hero-2.png",
} as const;

// ─── Video hero slides (Cloudinary Supra) ─────────────────────────────────────

const DEFAULT_HERO_VIDEO =
  "https://res.cloudinary.com/de73zfmty/video/upload/v1780692824/ytmp3gg-youtube-2025-toyota-gr-supra-overview-toyota-media-cd0zyb-zsc8-001-1080p_peOQ6QCh_online-video-cutter.com_kycvow.mp4";

const HERO_VIDEO = process.env.NEXT_PUBLIC_HERO_VIDEO_URL ?? DEFAULT_HERO_VIDEO;

const VIDEO_SLIDES = [
  {
    id: "supra",
    video: HERO_VIDEO,
    eyebrow: "Sport Collection",
    headline: "Performance",
    headlineAccent: "Légendaire",
    sub: "340 ch de pur plaisir de conduite. La Supra — une icône réinventée.",
    cta: "Découvrir la Supra",
    href: "/vehicles/supra",
    objectPosition: "center center",
  },
] as const;

// ─── Model showcase slides (all catalog vehicles) ───────────────────────────

const HERO_SLIDES = VEHICLES_DATA.map((vehicle) => ({
  id: vehicle.id,
  image: getVehicleDisplayImage(vehicle),
  eyebrow: vehicle.category,
  headline: vehicle.name,
  headlineRed: vehicle.tagline,
  sub: vehicle.description,
  cta: `Découvrir ${vehicle.name.replace(/^Toyota\s+/i, "")}`,
  href: `/vehicles/${vehicle.id}`,
}));

function getSlideStats(vehicleId: string) {
  const vehicle = VEHICLES_DATA.find((v) => v.id === vehicleId);
  if (!vehicle) return [];

  const { specs } = vehicle;
  return [
    {
      label: `${specs.power} ch`,
      value: "Puissance",
      sub: specs.engineType,
    },
    {
      label: specs.consumption ? `${specs.consumption} L` : `${specs.zeroto100} s`,
      value: specs.consumption ? "/100 km" : "0-100 km/h",
      sub: specs.consumption ? "Consommation" : "Accélération",
    },
    {
      label: `${specs.seats} places`,
      value: "Capacité",
      sub: specs.drivetrain,
    },
  ];
}

const CATEGORY_PILLS = [
  { key: "all", label: "Tous", count: 13 },
  { key: "suv", label: "SUV", count: 4 },
  { key: "berline", label: "Berline", count: 3 },
  { key: "sport", label: "Sport", count: 1 },
  { key: "hybride", label: "Hybride", count: 6 },
  { key: "pickup", label: "Pick-up", count: 1 },
] as const;

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
  slide: (typeof VIDEO_SLIDES)[number];
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
      {slide.video ? (
        <video
          ref={videoRef}
          src={slide.video}
          loop
          muted={muted}
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover bg-black"
          style={{ objectPosition: slide.objectPosition || "center center" }}
        />
      ) : null}

      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/30" />
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
    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.04]">
      <motion.div
        className="absolute inset-[-4px]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, #fff 0px, #fff 1px, transparent 1px, transparent 4px)",
        }}
        animate={{ y: [0, 4] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [videoSlide, setVideoSlide] = useState(0);
  const [imageSlide, setImageSlide] = useState(0);
  const [slideDirection, setSlideDirection] = useState(1);
  const [videoPaused, setVideoPaused] = useState(false);
  const [imagePaused, setImagePaused] = useState(false);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const videoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const imageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const videoHeroRef = useRef<HTMLDivElement>(null);

  const statsInView = useInView(statsRef, { once: true, amount: 0.2 });

  const { scrollYProgress } = useScroll({
    target: videoHeroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const goToVideo = useCallback(
    (idx: number) =>
      setVideoSlide(
        ((idx % VIDEO_SLIDES.length) + VIDEO_SLIDES.length) % VIDEO_SLIDES.length
      ),
    []
  );

  const goToImage = useCallback((idx: number, dir?: number) => {
    const len = HERO_SLIDES.length;
    const next = ((idx % len) + len) % len;
    setImageSlide((current) => {
      const forward =
        dir ?? (next > current || (current === len - 1 && next === 0) ? 1 : -1);
      setSlideDirection(forward);
      return next;
    });
  }, []);

  useEffect(() => {
    if (videoPaused || !playing || VIDEO_SLIDES.length <= 1) return;
    videoTimerRef.current = setTimeout(() => goToVideo(videoSlide + 1), 7000);
    return () => {
      if (videoTimerRef.current) clearTimeout(videoTimerRef.current);
    };
  }, [videoSlide, videoPaused, playing, goToVideo]);

  useEffect(() => {
    if (imagePaused) return;
    imageTimerRef.current = setTimeout(() => goToImage(imageSlide + 1), 6000);
    return () => {
      if (imageTimerRef.current) clearTimeout(imageTimerRef.current);
    };
  }, [imageSlide, imagePaused, goToImage]);

  return (
    <>
      <Header />
      <main className="flex flex-col bg-[#080808]">

        {/* ══ CINEMATIC VIDEO HERO ══════════════════════════════════════════════ */}
        <section
          ref={videoHeroRef}
          className="relative h-screen min-h-[680px] overflow-hidden bg-black select-none"
        >
          <motion.div className="absolute inset-0" style={{ y: heroY }}>
            {VIDEO_SLIDES.map((s, i) => (
              <VideoSlide
                key={s.id}
                slide={s}
                active={i === videoSlide}
                muted={muted}
                playing={playing}
              />
            ))}
          </motion.div>

          <ScanLines />

          <motion.div
            className="relative z-10 h-full flex items-start pt-16 lg:pt-20"
            style={{ opacity: heroOpacity }}
          >
            <div className="section-container w-full max-w-2xl ml-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={"video-text-" + videoSlide}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, x: -30, transition: { duration: 0.4 } }}
                  variants={stagger}
                  className="max-w-sm"
                >
                  <motion.h1
                    variants={fadeUp}
                    custom={1}
                    className="text-[clamp(2.5rem,7vw,5rem)] font-black text-white leading-[0.92] tracking-[-0.03em] mb-1"
                  >
                    {VIDEO_SLIDES[videoSlide].headline}
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
                    {VIDEO_SLIDES[videoSlide].headlineAccent}
                  </motion.h1>

                  <motion.p
                    variants={fadeUp}
                    custom={3}
                    className="text-white/65 text-sm lg:text-base leading-relaxed mb-6 max-w-md font-light"
                  >
                    {VIDEO_SLIDES[videoSlide].sub}
                  </motion.p>

                  <motion.div variants={fadeUp} custom={4} className="flex flex-wrap gap-4 items-center">
                    <Link
                      href={VIDEO_SLIDES[videoSlide].href}
                      className="group inline-flex items-center gap-3 px-8 py-4 bg-toyota-red text-white font-bold text-sm tracking-wide rounded-full transition-all duration-300 hover:px-10 hover:shadow-2xl hover:shadow-toyota-red/40 active:scale-95"
                    >
                      {VIDEO_SLIDES[videoSlide].cta}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                    <Link
                      href="/vehicles"
                      className="inline-flex items-center gap-3 px-8 py-4 bg-white/8 backdrop-blur-md border border-white/20 text-white font-semibold text-sm tracking-wide rounded-none hover:bg-white/15 hover:border-white/35 transition-all duration-300"
                    >
                      Tous les modèles
                    </Link>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>

          {VIDEO_SLIDES.length > 1 && (
            <div className="absolute bottom-8 left-0 right-0 z-20 flex items-center justify-center gap-2">
              {VIDEO_SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    goToVideo(i);
                    setVideoPaused(true);
                  }}
                  aria-label={`Slide ${i + 1}`}
                  className="group flex items-center"
                >
                  <span
                    className={cn(
                      "block rounded-full transition-all duration-500",
                      i === videoSlide
                        ? "w-12 h-[3px] bg-toyota-red"
                        : "w-[3px] h-[3px] bg-white/30 group-hover:bg-white/60"
                    )}
                  />
                </button>
              ))}
            </div>
          )}

          {VIDEO_SLIDES.length > 1 && (
            <>
              <button
                onClick={() => {
                  goToVideo(videoSlide - 1);
                  setVideoPaused(true);
                }}
                className="absolute left-5 sm:left-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-none border border-white/20 bg-white/5 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/15 hover:border-white/40 transition-all group"
                aria-label="Précédent"
              >
                <ChevronLeft className="h-5 w-5 group-hover:-translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={() => {
                  goToVideo(videoSlide + 1);
                  setVideoPaused(true);
                }}
                className="absolute right-5 sm:right-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-none border border-white/20 bg-white/5 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/15 hover:border-white/40 transition-all group"
                aria-label="Suivant"
              >
                <ChevronRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </>
          )}

          <div className="absolute bottom-[94px] right-6 z-20 flex flex-col items-center gap-3">
            <button
              onClick={() => setPlaying((v) => !v)}
              className="w-12 h-12 rounded-none border border-white/20 bg-white/5 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white hover:bg-white/12 transition-all"
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setMuted((v) => !v)}
              className="w-12 h-12 rounded-none border border-white/20 bg-white/5 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white hover:bg-white/12 transition-all"
              aria-label={muted ? "Activer le son" : "Couper le son"}
            >
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
          </div>

          {VIDEO_SLIDES.length > 1 && (
            <div className="absolute bottom-9 left-1/2 z-20 hidden sm:flex items-center gap-2 text-white/30 text-xs font-mono tabular-nums -translate-x-1/2">
              <span className="text-white/70">{String(videoSlide + 1).padStart(2, "0")}</span>
              <span className="h-px w-5 bg-white/20" />
              <span>{String(VIDEO_SLIDES.length).padStart(2, "0")}</span>
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#080808] to-transparent pointer-events-none z-10" />
        </section>

        {/* ══ MODEL SHOWCASE — compact cinematic slider ══════════════════════════ */}
        <section className="relative bg-[#080808] pt-10 pb-14 lg:pt-14 lg:pb-20">
          <div className="section-container">
            <div className="flex items-end justify-between gap-4 mb-6 lg:mb-8">
              <div>
                <p className="text-toyota-red text-[10px] font-bold uppercase tracking-[0.4em] mb-2 flex items-center gap-2">
                  <span className="h-px w-8 bg-toyota-red" />
                  Explorez la gamme
                </p>
                <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                  Modèles Toyota
                </h2>
              </div>
              <span className="text-white/25 text-xs font-mono tabular-nums hidden sm:block">
                {String(imageSlide + 1).padStart(2, "0")} / {String(HERO_SLIDES.length).padStart(2, "0")}
              </span>
            </div>

            <div className="relative h-[min(52vh,480px)] min-h-[320px] sm:min-h-[380px] overflow-hidden rounded-2xl border border-white/[0.06] bg-black shadow-2xl shadow-black/60 select-none">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={imageSlide}
                  custom={slideDirection}
                  initial={{ opacity: 0, x: slideDirection * 120, scale: 1.04 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: slideDirection * -120, scale: 1.02 }}
                  transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0"
                >
                  <motion.div
                    className="absolute inset-6 sm:inset-10 lg:inset-12"
                    animate={{ scale: [1, 1.02] }}
                    transition={{ duration: 7, ease: "linear" }}
                  >
                    <Image
                      src={HERO_SLIDES[imageSlide].image}
                      alt={HERO_SLIDES[imageSlide].headline}
                      fill
                      className="object-contain object-right"
                      priority={imageSlide < 2}
                      sizes="(max-width: 1280px) 100vw, 1280px"
                    />
                  </motion.div>
                  <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-black/15" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/25" />
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        "radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.45) 100%)",
                    }}
                  />
                </motion.div>
              </AnimatePresence>

              <ScanLines />

              <div className="relative z-10 h-full flex items-center px-6 sm:px-10 lg:px-14">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={"showcase-text-" + imageSlide}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, x: slideDirection * -24, transition: { duration: 0.3 } }}
                    variants={stagger}
                    className="max-w-md lg:max-w-lg"
                  >
                    <motion.p
                      variants={fadeUp}
                      className="text-white/40 text-[10px] font-bold uppercase tracking-[0.35em] mb-3"
                    >
                      {HERO_SLIDES[imageSlide].eyebrow}
                    </motion.p>
                    <motion.h3
                      variants={fadeUp}
                      custom={1}
                      className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-[0.95] tracking-tight mb-1"
                    >
                      {HERO_SLIDES[imageSlide].headline}
                    </motion.h3>
                    <motion.h3
                      variants={fadeUp}
                      custom={2}
                      className="text-3xl sm:text-4xl lg:text-5xl font-black leading-[0.95] tracking-tight mb-4"
                      style={{
                        WebkitTextStroke: "1.5px #EB0A1E",
                        color: "transparent",
                      }}
                    >
                      {HERO_SLIDES[imageSlide].headlineRed}
                    </motion.h3>
                    <motion.p
                      variants={fadeUp}
                      custom={3}
                      className="text-white/55 text-sm lg:text-base leading-relaxed mb-6 max-w-sm font-light"
                    >
                      {HERO_SLIDES[imageSlide].sub}
                    </motion.p>
                    <motion.div
                      variants={fadeUp}
                      custom={4}
                      className="hidden md:flex gap-8 mb-6"
                    >
                      {getSlideStats(HERO_SLIDES[imageSlide].id).map((s) => (
                        <div key={s.label}>
                          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-toyota-red/80 mb-0.5">
                            {s.sub}
                          </p>
                          <p className="text-lg lg:text-xl font-black text-white">{s.label}</p>
                        </div>
                      ))}
                    </motion.div>
                    <motion.div variants={fadeUp} custom={5}>
                      <Link
                        href={HERO_SLIDES[imageSlide].href}
                        className="group inline-flex items-center gap-2.5 px-6 py-3 bg-toyota-red text-white font-bold text-xs tracking-wide rounded-full transition-all duration-300 hover:px-8 hover:shadow-xl hover:shadow-toyota-red/35"
                      >
                        {HERO_SLIDES[imageSlide].cta}
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </motion.div>
                  </motion.div>
                </AnimatePresence>
              </div>

              <button
                onClick={() => {
                  goToImage(imageSlide - 1, -1);
                  setImagePaused(true);
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-none border border-white/20 bg-white/5 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/15 hover:border-white/40 transition-all group"
                aria-label="Précédent"
              >
                <ChevronLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => {
                  goToImage(imageSlide + 1, 1);
                  setImagePaused(true);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-none border border-white/20 bg-white/5 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/15 hover:border-white/40 transition-all group"
                aria-label="Suivant"
              >
                <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <div
                className="absolute bottom-5 right-6 sm:right-10 z-20 flex items-center gap-1.5 max-w-[45%] overflow-x-auto"
                style={{ scrollbarWidth: "none" }}
              >
                {HERO_SLIDES.map((slide, i) => (
                  <button
                    key={slide.id}
                    onClick={() => {
                      goToImage(i, i > imageSlide ? 1 : -1);
                      setImagePaused(true);
                    }}
                    aria-label={slide.headline}
                    title={slide.headline}
                    className="group flex items-center shrink-0"
                  >
                    <span
                      className={cn(
                        "block rounded-full transition-all duration-500",
                        i === imageSlide
                          ? "w-8 h-[3px] bg-toyota-red"
                          : "w-[3px] h-[3px] bg-white/30 group-hover:bg-white/60"
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══ CATEGORY NAV ═════════════════════════════════════════════════════ */}
        <section className="bg-[#080808] pb-6 lg:pb-8">
          <div className="section-container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-2xl border border-white/[0.06] bg-black px-4 py-3 lg:px-5"
            >
              <div
                className="flex items-center gap-2 overflow-x-auto"
                style={{ scrollbarWidth: "none" }}
              >
                <span className="text-white/25 text-[10px] font-bold uppercase tracking-[0.35em] shrink-0 mr-1 select-none">
                  Gamme
                </span>
                {CATEGORY_PILLS.map(({ key, label, count }) => (
                  <Link
                    key={key}
                    href={key === "all" ? "/vehicles" : `/vehicles?category=${key}`}
                    onClick={() => setActiveCategory(key)}
                    className={cn(
                      "shrink-0 inline-flex items-center gap-2 px-3.5 py-2 text-[11px] font-bold tracking-wide transition-all duration-300 border",
                      activeCategory === key
                        ? "bg-toyota-red text-white border-toyota-red"
                        : "bg-white/[0.03] text-white/45 border-white/[0.08] hover:bg-white/[0.06] hover:text-white/75 hover:border-white/15"
                    )}
                  >
                    {label}
                    <span
                      className={cn(
                        "text-[9px] font-bold px-1.5 py-0.5",
                        activeCategory === key
                          ? "bg-white/20 text-white"
                          : "bg-white/[0.06] text-white/30"
                      )}
                    >
                      {count}
                    </span>
                  </Link>
                ))}
                <Link
                  href="/vehicles"
                  className="shrink-0 ml-auto inline-flex items-center gap-1.5 text-[10px] text-white/30 hover:text-toyota-red transition-colors font-bold whitespace-nowrap tracking-[0.2em] uppercase"
                >
                  Tout voir
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ══ INGÉNIERIE DE PRÉCISION — bento grid ═════════════════════════════ */}
        <section className="bg-[#080808] py-14 lg:py-20">
          <div className="section-container">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="mb-8 lg:mb-10"
            >
              <motion.p
                variants={fadeUp}
                className="text-toyota-red text-[10px] font-bold uppercase tracking-[0.4em] mb-2 flex items-center gap-2"
              >
                <span className="h-px w-8 bg-toyota-red" />
                Technologie
              </motion.p>
              <motion.h2
                variants={fadeUp}
                custom={1}
                className="text-2xl md:text-3xl font-black text-white tracking-tight"
              >
                Ingénierie de{" "}
                <span
                  style={{ WebkitTextStroke: "1.5px #EB0A1E", color: "transparent" }}
                >
                  Précision
                </span>
              </motion.h2>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="lg:row-span-2 overflow-hidden group relative min-h-[300px] rounded-2xl border border-white/[0.06] bg-black"
              >
                <Image
                  src={HERO_IMAGES.supra}
                  alt="Moteur Supra"
                  fill
                  className="object-cover object-center opacity-55 group-hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/20" />
                <ScanLines />
                <div className="absolute bottom-0 p-6 lg:p-8">
                  <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-toyota-red">
                    Performance
                  </span>
                  <h3 className="text-xl lg:text-2xl font-black text-white mt-2">
                    Transmission Manuelle à 6 rapports
                  </h3>
                  <p className="text-white/45 text-sm mt-2 max-w-sm font-light">
                    Contrôle total, réponse instantanée — l&apos;ADN sport Toyota.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
                className="rounded-2xl border border-white/[0.06] bg-black p-6 flex flex-col justify-between min-h-[160px]"
              >
                <div className="w-10 h-10 border border-toyota-red/20 bg-toyota-red/10 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-toyota-red" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Aérodynamisme</h3>
                  <p className="text-white/40 text-sm mt-2 font-light">
                    Stabilité à haute vitesse et efficience énergétique optimisées.
                  </p>
                  <Link
                    href="/vehicles/supra"
                    className="inline-flex items-center gap-1.5 mt-4 text-[10px] font-bold text-toyota-red uppercase tracking-[0.25em] hover:gap-2.5 transition-all"
                  >
                    En savoir plus
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.16 }}
                className="rounded-2xl border border-white/[0.06] bg-black p-6 min-h-[160px]"
              >
                <h3 className="text-lg font-black text-white">Suspension Active</h3>
                <p className="text-white/40 text-sm mt-2 font-light">
                  Confort quotidien et tenue de route sportive en un seul châssis.
                </p>
                <Link
                  href="/vehicles"
                  className="inline-flex items-center gap-1.5 mt-4 text-[10px] font-bold text-toyota-red uppercase tracking-[0.25em] hover:gap-2.5 transition-all"
                >
                  Détails techniques
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.24 }}
                className="lg:col-span-2 overflow-hidden flex flex-col md:flex-row min-h-[180px] rounded-2xl border border-white/[0.06] bg-black"
              >
                <div className="p-6 lg:p-8 flex-1 flex flex-col justify-center">
                  <h3 className="text-lg font-black text-white">Cockpit Centré Conducteur</h3>
                  <p className="text-white/40 text-sm mt-2 font-light max-w-md">
                    Ergonomie pensée pour le plaisir de conduire — chaque commande à portée de main.
                  </p>
                </div>
                <div className="relative w-full md:w-80 min-h-[160px] bg-[#0d0d0d]">
                  <Image
                    src={HERO_IMAGES.camry}
                    alt="Intérieur Toyota"
                    fill
                    className="object-cover object-center opacity-80"
                    sizes="320px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-l from-black/60 to-transparent" />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ══ HORIZONTAL MARQUEE STRIP ═════════════════════════════════════════ */}
        <div className="relative bg-black py-4 overflow-hidden border-y border-white/[0.06]">
          <div className="absolute inset-0 bg-toyota-red/[0.07]" />
          <ScanLines />
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
            className="relative flex items-center gap-10 whitespace-nowrap"
          >
            {Array(8)
              .fill(null)
              .map((_, i) => (
                <span
                  key={i}
                  className="flex items-center gap-10 text-white/50 text-[10px] font-bold uppercase tracking-[0.35em]"
                >
                  <span className="text-white/70">Performance Légendaire</span>
                  <span className="text-toyota-red/60">—</span>
                  <span>Qualité Japonaise</span>
                  <span className="text-toyota-red/60">—</span>
                  <span>Innovation Hybride</span>
                  <span className="text-toyota-red/60">—</span>
                  <span>Excellence Toyota</span>
                  <span className="text-toyota-red/60">—</span>
                </span>
              ))}
          </motion.div>
        </div>

        {/* ══ AI ADVISOR SECTION ═══════════════════════════════════════════════ */}
        <section className="bg-[#080808] py-14 lg:py-20">
          <div className="section-container">
            <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-black">
              <div
                className="absolute inset-0 opacity-40"
                style={{
                  backgroundImage: `
                    radial-gradient(ellipse 70% 60% at 75% 50%, rgba(235,10,30,0.14) 0%, transparent 60%),
                    radial-gradient(ellipse 40% 40% at 15% 80%, rgba(235,10,30,0.06) 0%, transparent 50%)
                  `,
                }}
              />
              <ScanLines />

              <div className="relative z-10 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center p-8 lg:p-14">
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={stagger}
                >
                  <motion.p
                    variants={fadeUp}
                    className="text-toyota-red text-[10px] font-bold uppercase tracking-[0.4em] mb-6 flex items-center gap-2"
                  >
                    <Sparkles className="h-3 w-3" />
                    Propulsé par Gemini AI
                  </motion.p>
                  <motion.h2
                    variants={fadeUp}
                    custom={1}
                    className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-[0.95] tracking-tight mb-5"
                  >
                    Notre IA vous trouve{" "}
                    <span
                      style={{
                        WebkitTextStroke: "1.5px #EB0A1E",
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
                    className="text-white/45 text-sm lg:text-base leading-relaxed mb-8 font-light max-w-md"
                  >
                    Dites-nous votre budget, vos besoins et votre style de vie. Notre conseiller
                    virtuel analyse tout et vous recommande le modèle idéal.
                  </motion.p>
                  <motion.div variants={fadeUp} custom={3} className="flex flex-wrap items-center gap-4">
                    <button
                      onClick={() => window.dispatchEvent(new CustomEvent("openChatWidget"))}
                      className="group inline-flex items-center gap-2.5 px-6 py-3 bg-toyota-red text-white font-bold text-xs tracking-wide rounded-full hover:px-8 transition-all duration-300 shadow-lg shadow-toyota-red/25 hover:shadow-toyota-red/40 active:scale-95"
                    >
                      Démarrer maintenant
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <span className="text-white/25 text-[10px] font-medium tracking-wide">
                      Gratuit · 2 min · Sans inscription
                    </span>
                  </motion.div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
                  className="hidden lg:flex flex-col items-center justify-center"
                >
                  <div className="relative">
                    <motion.div
                      animate={{ scale: [1, 1.15, 1], opacity: [0.12, 0.25, 0.12] }}
                      transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute inset-0 bg-toyota-red/20 blur-3xl"
                    />
                    <motion.div
                      animate={{ y: [-5, 5, -5] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="relative w-28 h-28 border border-toyota-red/20 bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] flex items-center justify-center shadow-xl shadow-toyota-red/10"
                    >
                      <Bot className="h-14 w-14 text-toyota-red" />
                    </motion.div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 }}
                    className="mt-7 flex flex-wrap gap-2 justify-center max-w-xs"
                  >
                    {["Budget: 300k MAD", "7 places", "Hybride", "Famille"].map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1.5 bg-white/[0.03] border border-white/[0.08] text-white/35 text-[10px] font-medium tracking-wide"
                      >
                        {tag}
                      </span>
                    ))}
                    <Link
                      href="/vehicles/highlander"
                      className="px-3 py-1.5 bg-toyota-red/10 border border-toyota-red/25 text-toyota-red text-[10px] font-bold hover:bg-toyota-red/20 transition-colors"
                    >
                      → Toyota Highlander Hybride
                    </Link>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ STATS ROW ════════════════════════════════════════════════════════ */}
        <section className="bg-[#080808] py-14 lg:py-20">
          <div className="section-container">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="mb-8"
            >
              <motion.p
                variants={fadeUp}
                className="text-toyota-red text-[10px] font-bold uppercase tracking-[0.4em] mb-2 flex items-center gap-2"
              >
                <span className="h-px w-8 bg-toyota-red" />
                Héritage
              </motion.p>
              <motion.h2 variants={fadeUp} custom={1} className="text-2xl md:text-3xl font-black text-white tracking-tight">
                Toyota en chiffres
              </motion.h2>
            </motion.div>

            <motion.div
              ref={statsRef}
              variants={stagger}
              initial="hidden"
              animate={statsInView ? "visible" : "hidden"}
              className="rounded-2xl border border-white/[0.06] bg-black grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-white/[0.06]"
            >
              {STATS.map(({ value, label, icon: Icon }, i) => (
                <motion.div
                  key={label}
                  variants={fadeUp}
                  custom={i}
                  className="flex flex-col items-center text-center px-6 py-10 lg:py-12"
                >
                  <div className="w-10 h-10 border border-toyota-red/15 bg-toyota-red/10 flex items-center justify-center mb-4">
                    <Icon className="h-5 w-5 text-toyota-red" />
                  </div>
                  <p className="text-3xl lg:text-4xl font-black text-white mb-1 tracking-tight">
                    {value}
                  </p>
                  <p className="text-white/30 text-[10px] font-bold uppercase tracking-[0.25em]">
                    {label}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ══ PROMO BANNER ═════════════════════════════════════════════════════ */}
        <section className="bg-[#080808] pb-14 lg:pb-20">
          <div className="section-container">
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="relative h-[min(48vh,420px)] min-h-[320px] overflow-hidden rounded-2xl border border-white/[0.06] bg-black shadow-2xl shadow-black/60 group"
            >
              <motion.div
                className="absolute inset-y-0 right-0 w-[72%] sm:w-[65%] lg:w-[58%]"
                animate={{ scale: [1, 1.03] }}
                transition={{ duration: 14, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
              >
                <Image
                  src={HERO_IMAGES.promo}
                  alt="Toyota — offres été 2026"
                  fill
                  className="object-contain object-center opacity-90 transition-opacity duration-700 group-hover:opacity-100"
                  sizes="(max-width: 1280px) 65vw, 750px"
                />
              </motion.div>
              <div className="absolute inset-0 bg-gradient-to-r from-black/92 via-black/55 to-black/20" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/30" />
              <motion.div
                className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-toyota-red/20 blur-3xl pointer-events-none"
                animate={{ opacity: [0.35, 0.65, 0.35], scale: [1, 1.15, 1] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.5) 100%)",
                }}
              />
              <ScanLines />

              <div className="relative z-10 h-full flex items-center px-6 sm:px-10 lg:px-14">
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={stagger}
                  className="max-w-lg"
                >
                  <motion.p
                    variants={fadeUp}
                    className="text-white/40 text-[10px] font-bold uppercase tracking-[0.4em] mb-4 flex items-center gap-2"
                  >
                    <span className="h-px w-8 bg-toyota-red" />
                    Offres Spéciales 2026
                  </motion.p>
                  <motion.h2
                    variants={fadeUp}
                    custom={1}
                    className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-[0.95] tracking-tight mb-4"
                  >
                    L&apos;Été Commence Ici.
                    <br />
                    <motion.span
                      className="inline-block"
                      animate={{
                        filter: [
                          "drop-shadow(0 0 0px rgba(235,10,30,0))",
                          "drop-shadow(0 0 12px rgba(235,10,30,0.35))",
                          "drop-shadow(0 0 0px rgba(235,10,30,0))",
                        ],
                      }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      style={{
                        WebkitTextStroke: "1.5px #EB0A1E",
                        color: "transparent",
                      }}
                    >
                      Roulez Toyota.
                    </motion.span>
                  </motion.h2>
                  <motion.p
                    variants={fadeUp}
                    custom={2}
                    className="text-white/50 text-sm lg:text-base mb-7 max-w-sm leading-relaxed font-light"
                  >
                    Profitez de nos offres saisonnières exclusives et de conditions de financement
                    avantageuses sur toute la gamme.
                  </motion.p>
                  <motion.div variants={fadeUp} custom={3}>
                    <Link
                      href="/vehicles"
                      className="group inline-flex items-center gap-2.5 px-6 py-3 bg-toyota-red text-white font-bold text-xs tracking-wide rounded-full hover:px-8 transition-all duration-300 shadow-lg shadow-toyota-red/30 hover:shadow-toyota-red/45"
                    >
                      Voir les offres
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

      </main>
      <div className="section-container pb-8">
        <ContactStrip />
      </div>
      <Footer />
    </>
  );
}
