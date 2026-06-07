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
  useMotionValue,
  useSpring,
  animate,
  type Variants,
} from "framer-motion";
import {
  ArrowRight,
  ChevronDown,
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
import { ToyotaPrimaryCta } from "@/components/ui/ToyotaPrimaryCta";
import { BorderDrawButton } from "@/components/ui/BorderDrawButton";
import { RedScanBeam } from "@/components/ui/RedScanBeam";
import { VEHICLES_DATA, getVehicleDisplayImage } from "@/data/vehicles";
import { cn } from "@/lib/utils";

const TOYOTA_RED = "#EB0A1E";
const SLIDE_DURATION_MS = 4000;
const SLIDE_DURATION_S = SLIDE_DURATION_MS / 1000;

const HERO_IMAGES = {
  supra: "/images/vehicles/supra-hero-2.png",
  rav4: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=1600&q=85",
  highlander: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=1600&q=85",
  camry: "/images/vehicles/camry-hero-2.png",
  promo: "/images/vehicles/rav4-hero-2.png",
} as const;

const VIDEO_SLIDES = [
  {
    id: "supra",
    video:
      "https://res.cloudinary.com/de73zfmty/video/upload/v1780692824/ytmp3gg-youtube-2025-toyota-gr-supra-overview-toyota-media-cd0zyb-zsc8-001-1080p_peOQ6QCh_online-video-cutter.com_kycvow.mp4",
    eyebrow: "Sport Collection",
    headline: "Performance",
    headlineAccent: "Légendaire",
    sub: "340 ch de pur plaisir de conduite. La Supra — une icône réinventée.",
    cta: "Découvrir la Supra",
    href: "/vehicles/supra",
    objectPosition: "center center",
  },
] as const;

const HERO_SLIDES = VEHICLES_DATA.filter((vehicle) => vehicle.id !== "yaris").map((vehicle) => ({
  id: vehicle.id,
  image: getVehicleDisplayImage(vehicle),
  eyebrow: vehicle.category,
  headline: vehicle.name,
  headlineRed: vehicle.tagline,
  sub: vehicle.description,
  cta: `Découvrir ${vehicle.name.replace(/^Toyota\s+/i, "")}`,
  href: `/vehicles/${vehicle.id}`,
}));

const FEATURED_VEHICLE_IDS = ["supra", "rav4", "camry", "highlander"] as const;
const FEATURED_VEHICLES = VEHICLES_DATA.filter((v) =>
  (FEATURED_VEHICLE_IDS as readonly string[]).includes(v.id)
);

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
  { value: "85 ans", label: "d'expérience", icon: Shield, numeric: 85, suffix: " ans" },
  { value: "2M+", label: "clients satisfaits", icon: Star, numeric: 2, suffix: "M+" },
  { value: "+50", label: "modèles historiques", icon: Zap, numeric: 50, suffix: "", prefix: "+" },
  { value: "100 %", label: "hybrides disponibles", icon: Leaf, numeric: 100, suffix: " %" },
];

const ENGINEERING_STATS = [
  { value: 340, suffix: " ch", label: "Puissance max" },
  { value: 6, suffix: " rapports", label: "Transmission" },
  { value: 0.28, suffix: " Cd", label: "Coefficient aéro", decimals: 2 },
];

const EASE_PREMIUM = [0.22, 1, 0.36, 1] as const;

function seededUnit(seed: number) {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function roundFixed(value: number, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

const FLOATING_PARTICLES = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  x: roundFixed(seededUnit(i * 6 + 1) * 100),
  y: roundFixed(seededUnit(i * 6 + 2) * 100),
  size: roundFixed(2 + seededUnit(i * 6 + 3) * 3),
  duration: roundFixed(12 + seededUnit(i * 6 + 4) * 18, 1),
  delay: roundFixed(seededUnit(i * 6 + 5) * 4, 1),
  opacity: roundFixed(0.15 + seededUnit(i * 6 + 6) * 0.25, 3),
}));

// ─── Animation helpers ────────────────────────────────────────────────────────

function BlurInWords({
  text,
  className,
  delay = 0,
  as: Tag = "span",
}: {
  text: string;
  className?: string;
  delay?: number;
  as?: "span" | "h1" | "h2" | "h3" | "p";
}) {
  const words = text.split(" ");
  return (
    <Tag className={className}>
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          className="inline-block mr-[0.28em] last:mr-0"
          initial={{ opacity: 0, filter: "blur(12px)", y: 14 }}
          animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          transition={{
            duration: 0.65,
            delay: delay + i * 0.12,
            ease: EASE_PREMIUM,
          }}
        >
          {word}
        </motion.span>
      ))}
    </Tag>
  );
}

function AnimatedUnderline({ className }: { className?: string }) {
  return (
    <motion.span
      className={cn("block h-[3px] bg-[#EB0A1E] mt-2 origin-left", className)}
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{ duration: 0.9, delay: 0.55, ease: EASE_PREMIUM }}
    />
  );
}

function ScrollIndicator() {
  return (
    <motion.div
      className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.2, duration: 0.8 }}
    >
      <span className="text-[9px] font-bold uppercase tracking-[0.35em] text-white/30">
        Défiler
      </span>
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      >
        <ChevronDown className="h-5 w-5 text-white/50" strokeWidth={1.5} />
      </motion.div>
    </motion.div>
  );
}

function CountUpNumber({
  value,
  suffix = "",
  prefix = "",
  decimals = 0,
  duration = 1.8,
  delay = 0,
  active = true,
  className,
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  duration?: number;
  delay?: number;
  active?: boolean;
  className?: string;
}) {
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!active) {
      setDisplay(decimals > 0 ? (0).toFixed(decimals) : "0");
      return;
    }

    let controls: ReturnType<typeof animate> | undefined;
    setDisplay(decimals > 0 ? (0).toFixed(decimals) : "0");

    const timer = window.setTimeout(() => {
      controls = animate(0, value, {
        duration,
        ease: EASE_PREMIUM,
        onUpdate: (v) => {
          setDisplay(
            decimals > 0 ? v.toFixed(decimals) : Math.round(v).toLocaleString("fr-MA")
          );
        },
      });
    }, delay * 1000);

    return () => {
      window.clearTimeout(timer);
      controls?.stop();
    };
  }, [active, value, duration, decimals, delay]);

  return (
    <span className={className}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}

function SlideProgressBar({ slideIndex }: { slideIndex: number }) {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    bar.style.transformOrigin = "0% 50%";
    bar.style.transform = "scaleX(0)";

    const controls = animate(0, 1, {
      duration: SLIDE_DURATION_S,
      ease: "linear",
      onUpdate: (value) => {
        bar.style.transform = `scaleX(${value})`;
      },
    });

    return () => controls.stop();
  }, [slideIndex]);

  return (
    <div
      className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/10 z-30 overflow-hidden pointer-events-none"
      role="progressbar"
      aria-label={`Progression slide ${slideIndex + 1}`}
    >
      <div
        ref={barRef}
        className="h-full w-full bg-[#EB0A1E] will-change-transform"
        style={{ transform: "scaleX(0)", transformOrigin: "0% 50%" }}
      />
    </div>
  );
}

function isStudioHeroImage(src: string) {
  return /hero(-2)?\.png$/.test(src) || /yaris-gr-hero\.png$/.test(src);
}

function SliderCarImage({
  src,
  alt,
  vehicleId,
  priority,
}: {
  src: string;
  alt: string;
  vehicleId: string;
  priority?: boolean;
}) {
  const isStudio = isStudioHeroImage(src);
  const needsCrop = vehicleId === "yaris" || src.includes("media.toyota");

  return (
    <motion.div
      className="absolute inset-6 sm:inset-10 lg:inset-12 will-change-transform [transform:translateZ(0)]"
      initial={{ scale: 1 }}
      animate={{ scale: 1.06 }}
      transition={{ duration: SLIDE_DURATION_S, ease: "linear" }}
    >
      <div className="relative w-full h-full bg-black overflow-hidden">
        <Image
          src={src}
          alt={alt}
          fill
          className={cn(
            "object-contain object-right drop-shadow-[0_24px_48px_rgba(0,0,0,0.65)]",
            needsCrop &&
              "scale-[1.55] sm:scale-[1.45] origin-[72%_50%] brightness-[0.95] contrast-[1.08] saturate-[0.88]"
          )}
          priority={priority}
          sizes="(max-width: 1280px) 100vw, 1280px"
        />
        {!isStudio && (
          <>
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-transparent z-[1] pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/55 z-[1] pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_78%_52%,transparent_0%,#000_68%)] z-[1] pointer-events-none" />
          </>
        )}
      </div>
    </motion.div>
  );
}

const MARQUEE_ITEMS = [
  "Performance Légendaire",
  "Qualité Japonaise",
  "Innovation Hybride",
  "Excellence Toyota",
] as const;

function PremiumMarquee() {
  const strip = (
    <div className="flex items-center gap-10 shrink-0 px-5">
      {MARQUEE_ITEMS.map((item) => (
        <span
          key={item}
          className="flex items-center gap-10 text-white/50 text-[10px] font-bold uppercase tracking-[0.35em] whitespace-nowrap"
        >
          <span className="text-white/70">{item}</span>
          <span className="text-[#EB0A1E]/60">—</span>
        </span>
      ))}
    </div>
  );

  return (
    <div className="relative bg-black py-4 overflow-hidden border-y border-white/[0.06]">
      <div className="absolute inset-0 bg-[#EB0A1E]/[0.07]" />
      <ScanLines />
      <div className="flex w-max animate-marquee-scroll will-change-transform">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} aria-hidden={i > 0}>
            {strip}
          </div>
        ))}
      </div>
    </div>
  );
}

function SlideDotNav({
  slides,
  activeIndex,
  onSelect,
}: {
  slides: typeof HERO_SLIDES;
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="absolute bottom-10 right-6 sm:right-10 z-20 flex items-center gap-2 px-3 py-2 rounded-full bg-black/50 backdrop-blur-md border border-white/[0.08]">
      {slides.map((slide, i) => {
        const isActive = i === activeIndex;
        return (
          <button
            key={slide.id}
            onClick={() => onSelect(i)}
            aria-label={slide.headline}
            title={slide.headline}
            className="relative flex items-center justify-center h-5 min-w-[12px]"
          >
            {isActive ? (
              <motion.span
                layoutId="slider-dot-active"
                className="block h-[3px] w-8 rounded-full bg-[#EB0A1E]"
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
              />
            ) : (
              <motion.span
                className="block h-[3px] w-[3px] rounded-full bg-white/30"
                animate={{
                  opacity: [0.25, 0.65, 0.25],
                  scale: [1, 1.35, 1],
                }}
                transition={{
                  duration: 2.4,
                  repeat: Infinity,
                  delay: i * 0.14,
                  ease: "easeInOut",
                }}
                whileHover={{ scale: 1.6, backgroundColor: "rgba(255,255,255,0.65)" }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {FLOATING_PARTICLES.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-full bg-[#EB0A1E]/80 animate-particle-drift"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity * 1.6,
            animationDuration: `${p.duration * 0.65}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

function CockpitHudVisual() {
  const hudReadouts = [
    { label: "HUD", value: "Actif" },
    { label: "Mode", value: "Sport" },
    { label: "Réponse", value: "< 80 ms" },
  ];

  const cockpitFeatures = [
    "Volant multi-fonctions",
    "Écran 12.3\"",
    "Paddle shifters",
  ];

  return (
    <div className="relative flex-1 min-h-[260px] md:min-h-[280px] overflow-hidden bg-[#080808]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_72%_55%,rgba(235,10,30,0.06)_0%,transparent_58%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_80%,rgba(235,10,30,0.03)_0%,transparent_45%)]" />
      <ScanLines />

      <div className="relative z-10 flex h-full min-h-[260px] md:min-h-[280px]">
        <div className="flex w-[42%] sm:w-[38%] shrink-0 flex-col justify-between gap-4 py-5 pl-4 sm:pl-5 pr-2 border-r border-white/[0.04]">
          <div className="flex flex-col gap-2">
            {hudReadouts.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: 14 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.25 + i * 0.1, ease: EASE_PREMIUM }}
                className="px-3 py-1.5 border border-white/[0.08] bg-black/70 backdrop-blur-sm"
              >
                <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-[#EB0A1E]/75">
                  {item.label}
                </p>
                <p className="text-sm font-black text-white tabular-nums">{item.value}</p>
              </motion.div>
            ))}
          </div>

          <div className="flex flex-col gap-1.5">
            {cockpitFeatures.map((feature, i) => (
              <motion.span
                key={feature}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.45 + i * 0.08, ease: EASE_PREMIUM }}
                className="inline-flex w-fit px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-white/40 border border-white/[0.08] bg-white/[0.03]"
              >
                {feature}
              </motion.span>
            ))}
          </div>
        </div>

        <div className="relative flex-1 min-w-0">
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 rounded-full border border-white/[0.05] pointer-events-none"
            animate={{ rotate: 360 }}
            transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full border border-[#EB0A1E]/20 border-dashed pointer-events-none"
            animate={{ rotate: -360 }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          />

          <motion.div
            className="absolute top-6 right-6 z-10 hidden sm:block pointer-events-none"
            animate={{ opacity: [0.35, 0.7, 0.35] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
          >
            <p className="text-[9px] font-bold uppercase tracking-[0.35em] text-white/25 text-right mb-0.5">
              Rapport
            </p>
            <p
              className="text-5xl lg:text-6xl font-black leading-none tabular-nums text-right"
              style={{ WebkitTextStroke: "1px rgba(235,10,30,0.5)", color: "transparent" }}
            >
              6
            </p>
          </motion.div>

          <motion.div
            className="absolute inset-0"
            animate={{ scale: [1, 1.04, 1], x: [0, -6, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          >
            <Image
              src={HERO_IMAGES.camry}
              alt="Toyota Camry — cockpit centré conducteur"
              fill
              className="object-contain object-right-bottom opacity-95 drop-shadow-[0_24px_48px_rgba(0,0,0,0.85)]"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </motion.div>
        </div>
      </div>

      <RedScanBeam duration={3.5} />

      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent pointer-events-none z-[5]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none z-[5]" />
    </div>
  );
}

function TypingIndicator() {
  return (
    <span className="inline-flex items-center gap-1 ml-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1 h-1 rounded-full bg-white/80"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut",
          }}
        />
      ))}
    </span>
  );
}

function CurtainReveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.25 });

  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, delay: delay + 0.45, ease: EASE_PREMIUM }}
      >
        {children}
      </motion.div>
      <motion.div
        className="absolute inset-0 bg-[#080808] z-10 pointer-events-none"
        initial={{ scaleX: 1 }}
        animate={inView ? { scaleX: 0 } : {}}
        transition={{ duration: 0.85, delay, ease: EASE_PREMIUM }}
        style={{ transformOrigin: "left" }}
      />
    </div>
  );
}

function MagneticVehicleCard({
  vehicle,
  index,
}: {
  vehicle: (typeof VEHICLES_DATA)[number];
  index: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const priceInView = useInView(cardRef, { once: true, amount: 0.4 });
  const [hovered, setHovered] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 180, damping: 22 });
  const springY = useSpring(mouseY, { stiffness: 180, damping: 22 });
  const rotateX = useTransform(springY, [-0.5, 0.5], [6, -6]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-6, 6]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    setHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, delay: index * 0.1, ease: EASE_PREMIUM }}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="group relative"
    >
      <Link
        href={`/vehicles/${vehicle.id}`}
        className="block relative overflow-hidden rounded-2xl border border-white/[0.06] bg-black"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-[#0d0d0d]">
          <motion.div
            className="absolute inset-0"
            animate={{ scale: hovered ? 1.08 : 1 }}
            transition={{ duration: 0.7, ease: EASE_PREMIUM }}
          >
            <Image
              key={getVehicleDisplayImage(vehicle)}
              src={getVehicleDisplayImage(vehicle)}
              alt={vehicle.name}
              fill
              className={cn(
                isStudioHeroImage(getVehicleDisplayImage(vehicle))
                  ? "object-contain object-center drop-shadow-[0_12px_32px_rgba(0,0,0,0.5)]"
                  : "object-cover object-center"
              )}
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

          <AnimatePresence>
            {hovered && (
              <motion.div
                className="absolute inset-x-0 h-[2px] bg-[#EB0A1E] z-10"
                initial={{ top: "0%", opacity: 0 }}
                animate={{ top: ["0%", "100%"], opacity: [0, 1, 1, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
              />
            )}
          </AnimatePresence>
        </div>

        <div className="p-5 lg:p-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#EB0A1E]/80 mb-1">
            {vehicle.category}
          </p>
          <h3 className="text-lg font-black text-white tracking-tight mb-2">
            {vehicle.name.replace(/^Toyota\s+/i, "")}
          </h3>
          <p className="text-white/40 text-xs font-light line-clamp-2 mb-4">
            {vehicle.tagline}
          </p>
          <div className="flex items-center justify-between">
            <p className="text-sm font-black text-white">
              <CountUpNumber
                value={vehicle.priceFrom}
                suffix=" MAD"
                prefix="dès "
                active={priceInView}
                delay={index * 0.15}
                duration={1.6}
                className="tabular-nums"
              />
            </p>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 group-hover:text-[#EB0A1E] transition-colors duration-300">
              Explorer
              <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function CategoryPill({
  pillKey,
  label,
  count,
  active,
  index,
  onClick,
}: {
  pillKey: string;
  label: string;
  count: number;
  active: boolean;
  index: number;
  onClick: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -28 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.55, delay: index * 0.07, ease: EASE_PREMIUM }}
    >
      <Link
        href={pillKey === "all" ? "/vehicles" : `/vehicles?category=${pillKey}`}
        onClick={onClick}
        className={cn(
          "relative shrink-0 inline-flex items-center gap-2 px-3.5 py-2 rounded-none text-[11px] font-bold tracking-wide border transition-colors duration-300",
          active
            ? "border-[#EB0A1E]/35 bg-[#EB0A1E]/[0.08] text-[#EB0A1E]/90"
            : "bg-white/[0.03] text-white/45 border-white/[0.08] hover:text-white/75 hover:border-white/15"
        )}
      >
        <span>{label}</span>
        <span
          className={cn(
            "text-[9px] font-bold px-1.5 py-0.5 rounded-none",
            active ? "bg-[#EB0A1E]/15 text-[#EB0A1E]/80" : "bg-white/[0.06] text-white/30"
          )}
        >
          {count}
        </span>
      </Link>
    </motion.div>
  );
}

function StatItem({
  label,
  icon: Icon,
  numeric,
  suffix,
  prefix = "",
  index,
}: {
  label: string;
  icon: typeof Shield;
  numeric: number;
  suffix: string;
  prefix?: string;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 48, filter: "blur(8px)" }}
      animate={
        inView
          ? { opacity: 1, y: 0, filter: "blur(0px)" }
          : { opacity: 0, y: 48, filter: "blur(8px)" }
      }
      transition={{ duration: 0.75, delay: index * 0.12, ease: EASE_PREMIUM }}
      whileHover={{ y: -6 }}
      className="group relative flex flex-col items-center text-center px-6 py-10 lg:py-12 overflow-hidden"
    >
      <motion.span
        className="absolute top-0 left-0 h-full w-px bg-[#EB0A1E]/0 group-hover:bg-[#EB0A1E]/40 transition-colors duration-500"
        initial={{ scaleY: 0 }}
        animate={inView ? { scaleY: 1 } : {}}
        transition={{ duration: 0.6, delay: index * 0.12 + 0.2, ease: EASE_PREMIUM }}
        style={{ transformOrigin: "top" }}
      />

      <motion.div
        className="relative w-10 h-10 border border-[#EB0A1E]/15 bg-[#EB0A1E]/10 flex items-center justify-center mb-4"
        initial={{ scale: 0, rotate: -180 }}
        animate={inView ? { scale: 1, rotate: 0 } : {}}
        transition={{
          type: "spring",
          stiffness: 280,
          damping: 20,
          delay: index * 0.12 + 0.15,
        }}
      >
        <Icon className="h-5 w-5 text-[#EB0A1E] relative z-10" />
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: index * 0.12 + 0.3, ease: EASE_PREMIUM }}
        className="text-3xl lg:text-4xl font-black text-white mb-1 tracking-tight tabular-nums"
      >
        <CountUpNumber
          active={inView}
          value={numeric}
          suffix={suffix}
          prefix={prefix}
          delay={index * 0.12 + 0.35}
          duration={1.6}
        />
      </motion.p>

      <motion.span
        className="block h-[2px] bg-[#EB0A1E] mb-2"
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 0.55, delay: index * 0.12 + 0.45, ease: EASE_PREMIUM }}
        style={{ width: 32, transformOrigin: "center" }}
      />

      <motion.p
        initial={{ opacity: 0, letterSpacing: "0.35em" }}
        animate={inView ? { opacity: 1, letterSpacing: "0.25em" } : {}}
        transition={{ duration: 0.6, delay: index * 0.12 + 0.5, ease: EASE_PREMIUM }}
        className="text-white/30 text-[10px] font-bold uppercase tracking-[0.25em]"
      >
        {label}
      </motion.p>
    </motion.div>
  );
}

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
    if (!active) {
      v.pause();
      return;
    }
    v.currentTime = 0;
    if (playing) v.play().catch(() => {});
  }, [active]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !active) return;
    if (playing) {
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [playing, active]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted;
  }, [muted]);

  return (
    <motion.div
      key={slide.id}
      initial={{ opacity: 0, scale: 1.03 }}
      animate={{ opacity: active ? 1 : 0, scale: active ? 1 : 1.03 }}
      transition={{ duration: 1.4, ease: EASE_PREMIUM }}
      className="absolute inset-0"
    >
      {slide.video ? (
        <video
          ref={videoRef}
          src={slide.video}
          loop
          muted={muted}
          playsInline
          preload="metadata"
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
  const [videoPaused, setVideoPaused] = useState(false);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const videoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const imageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const videoHeroRef = useRef<HTMLDivElement>(null);
  const promoRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress: heroScroll } = useScroll({
    target: videoHeroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(heroScroll, [0, 1], ["0%", "18%"]);
  const heroOpacity = useTransform(heroScroll, [0, 0.75], [1, 0]);

  const { scrollYProgress: promoScroll } = useScroll({
    target: promoRef,
    offset: ["start end", "end start"],
  });
  const promoImageY = useTransform(promoScroll, [0, 1], ["-8%", "8%"]);

  const goToVideo = useCallback(
    (idx: number) =>
      setVideoSlide(
        ((idx % VIDEO_SLIDES.length) + VIDEO_SLIDES.length) % VIDEO_SLIDES.length
      ),
    []
  );

  const goToImage = useCallback((idx: number) => {
    const len = HERO_SLIDES.length;
    setImageSlide(((idx % len) + len) % len);
  }, []);

  useEffect(() => {
    if (videoPaused || !playing || VIDEO_SLIDES.length <= 1) return;
    videoTimerRef.current = setTimeout(() => goToVideo(videoSlide + 1), 7000);
    return () => {
      if (videoTimerRef.current) clearTimeout(videoTimerRef.current);
    };
  }, [videoSlide, videoPaused, playing, goToVideo]);

  useEffect(() => {
    imageTimerRef.current = setTimeout(() => goToImage(imageSlide + 1), SLIDE_DURATION_MS);
    return () => {
      if (imageTimerRef.current) clearTimeout(imageTimerRef.current);
    };
  }, [imageSlide, goToImage]);

  const currentVideo = VIDEO_SLIDES[videoSlide];
  const currentImageSlide = HERO_SLIDES[imageSlide];
  const slideStats = getSlideStats(currentImageSlide.id);

  return (
    <>
      <Header />
      <main className="flex flex-col bg-[#080808]">

        {/* ══ CINEMATIC VIDEO HERO ══════════════════════════════════════════════ */}
        <section
          ref={videoHeroRef}
          className="relative h-screen min-h-[680px] overflow-hidden bg-black select-none"
        >
          {/* Letterbox bars */}
          <div className="absolute top-0 left-0 right-0 h-[3.5vh] min-h-[18px] max-h-[32px] bg-black z-30 pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-[3.5vh] min-h-[18px] max-h-[32px] bg-black z-30 pointer-events-none" />

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
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.35 } }}
                  className="max-w-sm"
                >
                  <h1 className="text-[clamp(2.5rem,7vw,5rem)] font-black text-white leading-[0.92] tracking-[-0.03em] mb-1">
                    <BlurInWords text={currentVideo.headline} delay={0.1} />
                  </h1>

                  <div className="mb-4">
                    <h1
                      className="text-[clamp(2.5rem,7vw,5rem)] font-black leading-[0.92] tracking-[-0.03em]"
                      style={{
                        WebkitTextStroke: `2px ${TOYOTA_RED}`,
                        color: "transparent",
                      }}
                    >
                      <BlurInWords text={currentVideo.headlineAccent} delay={0.35} />
                    </h1>
                    <AnimatedUnderline className="max-w-[min(100%,280px)]" />
                  </div>

                  <motion.p
                    initial={{ opacity: 0, filter: "blur(8px)", y: 16 }}
                    animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                    transition={{ duration: 0.7, delay: 0.75, ease: EASE_PREMIUM }}
                    className="text-white/65 text-sm lg:text-base leading-relaxed mb-6 max-w-md font-light"
                  >
                    {currentVideo.sub}
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.95, ease: EASE_PREMIUM }}
                    className="flex flex-col gap-3 items-start"
                  >
                    <BorderDrawButton href={currentVideo.href} accent="red">
                      {currentVideo.cta}
                    </BorderDrawButton>
                    <BorderDrawButton href="/vehicles">Tous les modèles</BorderDrawButton>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>

          <ScrollIndicator />

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
                        ? "w-12 h-[3px] bg-[#EB0A1E]"
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
                className="absolute left-5 sm:left-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 border border-white/20 bg-white/5 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/15 hover:border-white/40 transition-all group"
                aria-label="Précédent"
              >
                <ChevronLeft className="h-5 w-5 group-hover:-translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={() => {
                  goToVideo(videoSlide + 1);
                  setVideoPaused(true);
                }}
                className="absolute right-5 sm:right-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 border border-white/20 bg-white/5 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/15 hover:border-white/40 transition-all group"
                aria-label="Suivant"
              >
                <ChevronRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </>
          )}

          <div className="absolute bottom-[94px] right-6 z-20 flex flex-col items-center gap-3">
            <button
              onClick={() => setPlaying((v) => !v)}
              className="w-12 h-12 border border-white/20 bg-white/5 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white hover:bg-white/12 transition-all"
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setMuted((v) => !v)}
              className="w-12 h-12 border border-white/20 bg-white/5 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white hover:bg-white/12 transition-all"
              aria-label={muted ? "Activer le son" : "Couper le son"}
            >
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#080808] to-transparent pointer-events-none z-10" />
        </section>

        {/* ══ MODEL SHOWCASE — cinematic crossfade slider ════════════════════════ */}
        <section className="relative bg-[#080808] pt-10 pb-14 lg:pt-14 lg:pb-20">
          <div className="section-container">
            <div className="flex items-end justify-between gap-4 mb-6 lg:mb-8">
              <div>
                <p className="text-[#EB0A1E] text-[10px] font-bold uppercase tracking-[0.4em] mb-2 flex items-center gap-2">
                  <span className="h-px w-8 bg-[#EB0A1E]" />
                  Explorez la gamme
                </p>
                <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                  Modèles Toyota
                </h2>
              </div>
            </div>

            <div className="relative h-[min(58vh,520px)] min-h-[400px] sm:min-h-[440px] lg:min-h-[480px] overflow-hidden rounded-2xl border border-white/[0.06] bg-black shadow-2xl shadow-black/60 select-none">
              {/* Background slide number */}
              <AnimatePresence mode="wait">
                <motion.span
                  key={`bg-num-${imageSlide}`}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 0.06, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.8, ease: EASE_PREMIUM }}
                  className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 text-[clamp(6rem,18vw,12rem)] font-black text-white leading-none pointer-events-none z-[1] tabular-nums"
                  aria-hidden
                >
                  {String(imageSlide + 1).padStart(2, "0")}
                </motion.span>
              </AnimatePresence>

              {/* Crossfade slides with Ken Burns */}
              <AnimatePresence mode="sync">
                <motion.div
                  key={imageSlide}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.1, ease: EASE_PREMIUM }}
                  className="absolute inset-0"
                >
                  <SliderCarImage
                    src={currentImageSlide.image}
                    alt={currentImageSlide.headline}
                    vehicleId={currentImageSlide.id}
                    priority={imageSlide === 0}
                  />
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

              <div className="relative z-10 h-full flex items-start px-6 sm:px-10 lg:px-14 pt-8 sm:pt-10 lg:pt-12 pb-16 sm:pb-[4.5rem]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={"showcase-text-" + imageSlide}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.3 } }}
                    className="max-w-md lg:max-w-lg flex flex-col justify-between min-h-0"
                  >
                    <motion.p
                      initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      transition={{ duration: 0.55, ease: EASE_PREMIUM }}
                      className="text-white/40 text-[10px] font-bold uppercase tracking-[0.35em] mb-2"
                    >
                      {currentImageSlide.eyebrow}
                    </motion.p>
                    <motion.h3
                      initial={{ opacity: 0, y: 28, filter: "blur(8px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      transition={{ duration: 0.6, delay: 0.08, ease: EASE_PREMIUM }}
                      className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-[0.95] tracking-tight mb-0.5"
                    >
                      {currentImageSlide.headline}
                    </motion.h3>
                    <motion.h3
                      initial={{ opacity: 0, y: 28, filter: "blur(8px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      transition={{ duration: 0.6, delay: 0.16, ease: EASE_PREMIUM }}
                      className="text-2xl sm:text-3xl lg:text-4xl font-black leading-[0.95] tracking-tight mb-3"
                      style={{
                        WebkitTextStroke: `1.5px ${TOYOTA_RED}`,
                        color: "transparent",
                      }}
                    >
                      {currentImageSlide.headlineRed}
                    </motion.h3>
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.55, delay: 0.24, ease: EASE_PREMIUM }}
                      className="text-white/55 text-sm leading-relaxed mb-4 max-w-sm font-light line-clamp-2 sm:line-clamp-3"
                    >
                      {currentImageSlide.sub}
                    </motion.p>

                    <div className="hidden md:flex gap-6 lg:gap-8 mb-4 overflow-hidden">
                      {slideStats.map((s, i) => (
                        <motion.div
                          key={s.label}
                          initial={{ opacity: 0, y: 36 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.6,
                            delay: 0.32 + i * 0.1,
                            ease: EASE_PREMIUM,
                          }}
                        >
                          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#EB0A1E]/80 mb-0.5">
                            {s.sub}
                          </p>
                          <p className="text-lg lg:text-xl font-black text-white">{s.label}</p>
                        </motion.div>
                      ))}
                    </div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.5, ease: EASE_PREMIUM }}
                      className="mt-auto pt-1"
                    >
                      <ToyotaPrimaryCta href={currentImageSlide.href} size="sm">
                        {currentImageSlide.cta}
                      </ToyotaPrimaryCta>
                    </motion.div>
                  </motion.div>
                </AnimatePresence>
              </div>

              <button
                onClick={() => goToImage(imageSlide - 1)}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 border border-white/20 bg-white/5 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/15 hover:border-white/40 transition-all group"
                aria-label="Précédent"
              >
                <ChevronLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => goToImage(imageSlide + 1)}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 border border-white/20 bg-white/5 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/15 hover:border-white/40 transition-all group"
                aria-label="Suivant"
              >
                <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <SlideDotNav
                slides={HERO_SLIDES}
                activeIndex={imageSlide}
                onSelect={goToImage}
              />

              <SlideProgressBar slideIndex={imageSlide} />
            </div>
          </div>
        </section>

        {/* ══ CATEGORY NAV ═════════════════════════════════════════════════════ */}
        <section className="bg-[#080808] pb-6 lg:pb-8">
          <div className="section-container">
            <div className="rounded-none border border-white/[0.06] bg-black px-4 py-3 lg:px-5">
              <div
                className="flex items-center gap-2 overflow-x-auto"
                style={{ scrollbarWidth: "none" }}
              >
                <motion.span
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, ease: EASE_PREMIUM }}
                  className="text-white/25 text-[10px] font-bold uppercase tracking-[0.35em] shrink-0 mr-1 select-none"
                >
                  Gamme
                </motion.span>
                {CATEGORY_PILLS.map(({ key, label, count }, i) => (
                  <CategoryPill
                    key={key}
                    pillKey={key}
                    label={label}
                    count={count}
                    active={activeCategory === key}
                    index={i}
                    onClick={() => setActiveCategory(key)}
                  />
                ))}
                <motion.div
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.45, ease: EASE_PREMIUM }}
                  className="shrink-0 ml-auto"
                >
                  <Link
                    href="/vehicles"
                    className="inline-flex items-center gap-1.5 text-[10px] text-white/30 hover:text-[#EB0A1E] transition-colors font-bold whitespace-nowrap tracking-[0.2em] uppercase"
                  >
                    Tout voir
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ FEATURED VEHICLES — Nos Modèles Phares ═══════════════════════════ */}
        <section className="bg-[#080808] py-14 lg:py-20">
          <div className="section-container">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, ease: EASE_PREMIUM }}
              className="mb-8 lg:mb-10"
            >
              <p className="text-[#EB0A1E] text-[10px] font-bold uppercase tracking-[0.4em] mb-2 flex items-center gap-2">
                <span className="h-px w-8 bg-[#EB0A1E]" />
                Sélection Premium
              </p>
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                Nos Modèles{" "}
                <span
                  style={{ WebkitTextStroke: `1.5px ${TOYOTA_RED}`, color: "transparent" }}
                >
                  Phares
                </span>
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
              {FEATURED_VEHICLES.map((vehicle, i) => (
                <MagneticVehicleCard key={vehicle.id} vehicle={vehicle} index={i} />
              ))}
            </div>
          </div>
        </section>

        {/* ══ INGÉNIERIE DE PRÉCISION — bento grid ═════════════════════════════ */}
        <section className="bg-[#080808] py-14 lg:py-20">
          <div className="section-container">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: EASE_PREMIUM }}
              className="mb-8 lg:mb-10"
            >
              <p className="text-[#EB0A1E] text-[10px] font-bold uppercase tracking-[0.4em] mb-2 flex items-center gap-2">
                <span className="h-px w-8 bg-[#EB0A1E]" />
                Technologie
              </p>
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                Ingénierie de{" "}
                <span
                  style={{ WebkitTextStroke: `1.5px ${TOYOTA_RED}`, color: "transparent" }}
                >
                  Précision
                </span>
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <CurtainReveal
                delay={0}
                className="lg:row-span-2 min-h-[300px] rounded-2xl border border-white/[0.06] bg-black group"
              >
                <div className="relative h-full min-h-[300px] overflow-hidden">
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
                    <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#EB0A1E]">
                      Performance
                    </span>
                    <h3 className="text-xl lg:text-2xl font-black text-white mt-2">
                      Transmission Manuelle à 6 rapports
                    </h3>
                    <p className="text-white/45 text-sm mt-2 max-w-sm font-light">
                      Contrôle total, réponse instantanée — l&apos;ADN sport Toyota.
                    </p>
                    <div className="flex gap-8 mt-5">
                      {ENGINEERING_STATS.map((stat) => (
                        <div key={stat.label}>
                          <p className="text-lg font-black text-white tabular-nums">
                            <CountUpNumber
                              value={stat.value}
                              suffix={stat.suffix}
                              decimals={stat.decimals ?? 0}
                            />
                          </p>
                          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/30">
                            {stat.label}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CurtainReveal>

              <CurtainReveal
                delay={0.1}
                className="rounded-2xl border border-white/[0.06] bg-black p-6 flex flex-col justify-between min-h-[160px]"
              >
                <div className="w-10 h-10 border border-[#EB0A1E]/20 bg-[#EB0A1E]/10 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-[#EB0A1E]" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Aérodynamisme</h3>
                  <p className="text-white/40 text-sm mt-2 font-light">
                    Stabilité à haute vitesse et efficience énergétique optimisées.
                  </p>
                  <p className="text-2xl font-black text-white mt-3 tabular-nums">
                    <CountUpNumber value={0.28} suffix=" Cd" decimals={2} />
                  </p>
                  <Link
                    href="/vehicles/supra"
                    className="inline-flex items-center gap-1.5 mt-4 text-[10px] font-bold text-[#EB0A1E] uppercase tracking-[0.25em] hover:gap-2.5 transition-all"
                  >
                    En savoir plus
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </CurtainReveal>

              <CurtainReveal
                delay={0.2}
                className="rounded-2xl border border-white/[0.06] bg-black p-6 min-h-[160px]"
              >
                <h3 className="text-lg font-black text-white">Suspension Active</h3>
                <p className="text-white/40 text-sm mt-2 font-light">
                  Confort quotidien et tenue de route sportive en un seul châssis.
                </p>
                <p className="text-2xl font-black text-white mt-3 tabular-nums">
                  <CountUpNumber value={340} suffix=" ch" />
                </p>
                <Link
                  href="/vehicles"
                  className="inline-flex items-center gap-1.5 mt-4 text-[10px] font-bold text-[#EB0A1E] uppercase tracking-[0.25em] hover:gap-2.5 transition-all"
                >
                  Détails techniques
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </CurtainReveal>

              <CurtainReveal
                delay={0.3}
                className="lg:col-span-2 overflow-hidden rounded-2xl border border-white/[0.06] bg-black"
              >
                <div className="flex flex-col md:flex-row min-h-[260px] md:min-h-[280px]">
                  <div className="relative z-10 p-6 lg:p-8 md:w-[38%] lg:w-[36%] flex flex-col justify-center border-b md:border-b-0 md:border-r border-white/[0.06]">
                    <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#EB0A1E] mb-2">
                      Ergonomie
                    </span>
                    <h3 className="text-lg lg:text-xl font-black text-white">
                      Cockpit Centré Conducteur
                    </h3>
                    <p className="text-white/40 text-sm mt-2 font-light">
                      Ergonomie pensée pour le plaisir de conduire — chaque commande à portée de main.
                    </p>
                    <p className="text-2xl font-black text-white mt-4 tabular-nums">
                      <CountUpNumber value={6} suffix=" rapports" />
                    </p>
                    <Link
                      href="/vehicles/camry"
                      className="inline-flex items-center gap-1.5 mt-5 text-[10px] font-bold text-[#EB0A1E] uppercase tracking-[0.25em] hover:gap-2.5 transition-all w-fit"
                    >
                      Explorer le cockpit
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                  <CockpitHudVisual />
                </div>
              </CurtainReveal>
            </div>
          </div>
        </section>

        <PremiumMarquee />

        {/* ══ AI ADVISOR SECTION ═══════════════════════════════════════════════ */}
        <section className="bg-[#080808] py-14 lg:py-20">
          <div className="section-container">
            <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-black">
              <FloatingParticles />
              <div
                className="absolute inset-0 opacity-40"
                style={{
                  backgroundImage: `
                    radial-gradient(ellipse 70% 60% at 75% 50%, rgba(235,10,30,0.05) 0%, transparent 60%),
                    radial-gradient(ellipse 40% 40% at 15% 80%, rgba(235,10,30,0.03) 0%, transparent 50%)
                  `,
                }}
              />
              <ScanLines />

              <div className="relative z-10 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center p-8 lg:p-14">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, ease: EASE_PREMIUM }}
                >
                  <p className="text-[#EB0A1E] text-[10px] font-bold uppercase tracking-[0.4em] mb-6 flex items-center gap-2">
                    <Sparkles className="h-3 w-3" />
                    Propulsé par Gemini AI
                  </p>
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-[0.95] tracking-tight mb-5">
                    Notre IA vous trouve{" "}
                    <span
                      style={{
                        WebkitTextStroke: `1.5px ${TOYOTA_RED}`,
                        color: "transparent",
                      }}
                    >
                      la Toyota parfaite
                    </span>{" "}
                    en 2 minutes
                  </h2>
                  <p className="text-white/45 text-sm lg:text-base leading-relaxed mb-8 font-light max-w-md">
                    Dites-nous votre budget, vos besoins et votre style de vie. Notre conseiller
                    virtuel analyse tout et vous recommande le modèle idéal.
                  </p>
                  <div className="flex flex-wrap items-center gap-4">
                    <BorderDrawButton
                      accent="red"
                      onClick={() => window.dispatchEvent(new CustomEvent("openChatWidget"))}
                      className="!text-xs"
                    >
                      Démarrer maintenant
                      <TypingIndicator />
                      <ArrowRight className="h-3.5 w-3.5" />
                    </BorderDrawButton>
                    <span className="text-white/25 text-[10px] font-medium tracking-wide">
                      Gratuit · 2 min · Sans inscription
                    </span>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, ease: EASE_PREMIUM, delay: 0.15 }}
                  className="hidden lg:flex flex-col items-center justify-center"
                >
                  <div className="relative">
                    <motion.div
                      animate={{ scale: [1, 1.15, 1], opacity: [0.12, 0.25, 0.12] }}
                      transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute inset-0 bg-[#EB0A1E]/8 blur-3xl"
                    />
                    <motion.div
                      animate={{
                        scale: [1, 1.06, 1, 1.1, 1],
                      }}
                      transition={{
                        duration: 1.4,
                        repeat: Infinity,
                        ease: "easeInOut",
                        times: [0, 0.2, 0.4, 0.55, 1],
                      }}
                      className="relative w-28 h-28 border border-[#EB0A1E]/20 bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] flex items-center justify-center"
                    >
                      <Bot className="h-14 w-14 text-[#EB0A1E]" />
                    </motion.div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5, ease: EASE_PREMIUM }}
                    className="mt-7 flex flex-wrap gap-2 justify-center max-w-xs"
                  >
                    {["Budget: 300k MAD", "7 places", "Hybride", "Famille"].map((tag, i) => (
                      <motion.span
                        key={tag}
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.45, delay: 0.55 + i * 0.1, ease: EASE_PREMIUM }}
                        className="px-3 py-1.5 bg-white/[0.03] border border-white/[0.08] text-white/35 text-[10px] font-medium tracking-wide animate-tag-float"
                        style={{ animationDuration: `${3.2 + i * 0.4}s`, animationDelay: `${i * 0.35}s` }}
                      >
                        {tag}
                      </motion.span>
                    ))}
                    <motion.div
                      initial={{ opacity: 0, x: -16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 1, type: "spring", stiffness: 200, damping: 22 }}
                    >
                      <Link
                        href="/vehicles/highlander"
                        className="inline-flex px-3 py-1.5 bg-[#EB0A1E]/10 border border-[#EB0A1E]/25 text-[#EB0A1E] text-[10px] font-bold hover:bg-[#EB0A1E]/20 transition-colors animate-tag-float"
                        style={{ animationDuration: "2.8s", animationDelay: "0.2s" }}
                      >
                        → Toyota Highlander Hybride
                      </Link>
                    </motion.div>
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
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.75, ease: EASE_PREMIUM }}
              className="mb-8 lg:mb-10"
            >
              <p className="text-[#EB0A1E] text-[10px] font-bold uppercase tracking-[0.4em] mb-2 flex items-center gap-2">
                <motion.span
                  className="block h-px bg-[#EB0A1E]"
                  initial={{ width: 0 }}
                  whileInView={{ width: 32 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, ease: EASE_PREMIUM }}
                />
                Héritage
              </p>
              <motion.h2
                initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.1, ease: EASE_PREMIUM }}
                className="text-2xl md:text-3xl font-black text-white tracking-tight"
              >
                Toyota en chiffres
              </motion.h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 32, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.8, delay: 0.15, ease: EASE_PREMIUM }}
              className="relative rounded-2xl border border-white/[0.06] bg-black grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-white/[0.06] overflow-hidden"
            >
              <motion.div
                className="absolute bottom-0 left-0 h-[2px] bg-[#EB0A1E]/60 z-10"
                initial={{ width: "0%" }}
                whileInView={{ width: "100%" }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, delay: 0.3, ease: EASE_PREMIUM }}
              />
              {STATS.map((stat, i) => (
                <StatItem key={stat.label} {...stat} index={i} />
              ))}
            </motion.div>
          </div>
        </section>

        {/* ══ PROMO BANNER ═════════════════════════════════════════════════════ */}
        <section className="bg-[#080808] pb-14 lg:pb-20">
          <div className="section-container">
            <motion.div
              ref={promoRef}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.8, ease: EASE_PREMIUM }}
              className="relative h-[min(48vh,420px)] min-h-[320px] overflow-hidden rounded-2xl border border-white/[0.06] bg-black shadow-2xl shadow-black/60 group"
            >
              <motion.div
                className="absolute inset-y-0 right-0 w-[72%] sm:w-[65%] lg:w-[58%]"
                style={{ y: promoImageY }}
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
                className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-[#EB0A1E]/6 blur-3xl pointer-events-none"
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
                  initial={{ opacity: 0, x: -60 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{
                    type: "spring",
                    stiffness: 80,
                    damping: 18,
                    mass: 0.9,
                  }}
                  className="max-w-lg"
                >
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.4em] mb-4 flex items-center gap-2">
                    <span className="h-px w-8 bg-[#EB0A1E]" />
                    Offres Spéciales 2026
                  </p>
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-[0.95] tracking-tight mb-4">
                    L&apos;Été Commence Ici.
                    <br />
                    <span
                      className="inline-block"
                      style={{
                        WebkitTextStroke: `1.5px ${TOYOTA_RED}`,
                        color: "transparent",
                      }}
                    >
                      Roulez Toyota.
                    </span>
                  </h2>
                  <p className="text-white/50 text-sm lg:text-base mb-7 max-w-sm leading-relaxed font-light">
                    Profitez de nos offres saisonnières exclusives et de conditions de financement
                    avantageuses sur toute la gamme.
                  </p>
                  <BorderDrawButton href="/offres" accent="red" className="!text-xs">
                    Voir les offres
                    <ArrowRight className="h-3.5 w-3.5" />
                  </BorderDrawButton>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
