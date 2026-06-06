"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView, type Variants } from "framer-motion";
import {
  ArrowRight,
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
  ChevronDown,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { VEHICLES_DATA } from "@/data/vehicles";
import { formatPrice, cn } from "@/lib/utils";

// ─── Hero video (Cloudinary) ───────────────────────────────────────────────────

const HERO_VIDEO =
  "https://res.cloudinary.com/de73zfmty/video/upload/v1780692824/ytmp3gg-youtube-2025-toyota-gr-supra-overview-toyota-media-cd0zyb-zsc8-001-1080p_peOQ6QCh_online-video-cutter.com_kycvow.mp4";

const HERO = {
  poster: "/images/vehicles/supra.jpg",
  eyebrow: "Sport Collection · GR Supra 2025",
  headline: "Performance",
  headlineRed: "Légendaire",
  sub: "340 ch de pur plaisir de conduite. La Supra — une icône réinventée pour la route marocaine.",
  cta: "Découvrir la Supra",
  href: "/vehicles/supra",
  stats: [
    { label: "3.0L TURBO", sub: "Moteur" },
    { label: "4.3s", sub: "0-100 km/h" },
    { label: "500 Nm", sub: "Couple" },
  ],
};

type DiscoverCard = {
  id: string;
  image: string;
  eyebrow: string;
  headline: string;
  headlineAccent: string;
  sub: string;
  cta: string;
  href: string;
  accent: string;
  stats: { label: string; sub: string }[];
};

const DISCOVER_CARDS: DiscoverCard[] = [
  {
    id: "rav4",
    image: "/images/vehicles/rav4.jpg",
    eyebrow: "SUV Hybride",
    headline: "L'Aventure",
    headlineAccent: "Commence Ici",
    sub: "Le RAV4 hybride redéfinit l'exploration — économique, spacieux, indestructible.",
    cta: "Explorer le RAV4",
    href: "/vehicles/rav4",
    accent: "from-emerald-500/20 to-transparent",
    stats: [
      { label: "218 ch", sub: "Hybride" },
      { label: "5.8 L", sub: "/100 km" },
      { label: "AWD", sub: "4×4" },
    ],
  },
  {
    id: "highlander",
    image: "/images/vehicles/highlander.jpg",
    eyebrow: "SUV Premium · 7 places",
    headline: "Votre Famille,",
    headlineAccent: "Notre Priorité",
    sub: "Le Highlander hybride — luxe raffiné, sécurité maximale, zéro compromis.",
    cta: "Voir le Highlander",
    href: "/vehicles/highlander",
    accent: "from-amber-500/20 to-transparent",
    stats: [
      { label: "7 places", sub: "Capacité" },
      { label: "248 ch", sub: "Hybride" },
      { label: "5★", sub: "NCAP" },
    ],
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

// Avoid Supra (hero), RAV4 & Highlander (discover cards) — showcase the rest of the gamme.
const FEATURED_IDS = ["landcruiser", "camry", "hilux"];
const FEATURED_TAGLINES: Record<string, string> = {
  landcruiser: "Indestructible. Luxueux. Légendaire.",
  camry: "La berline de référence — confort, silence et élégance.",
  hilux: "Le pick-up le plus fiable au monde, prêt pour le Maroc.",
  prius: "L'hybride pionnier — efficience et technologie avant-gardiste.",
  corolla: "La compacte hybride la plus vendue au monde.",
  chr: "SUV urbain au design audacieux, parfait pour la ville.",
};

const STATS = [
  { value: "85 ans", label: "d'expérience", icon: Shield },
  { value: "2M+", label: "clients satisfaits", icon: Star },
  { value: "+50", label: "modèles historiques", icon: Zap },
  { value: "6", label: "modèles hybrides", icon: Leaf },
];

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};
const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

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

function HeroVideo({ muted, playing }: { muted: boolean; playing: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (playing) video.play().catch(() => {});
    else video.pause();
  }, [playing]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted;
  }, [muted]);

  return (
    <video
      ref={videoRef}
      src={HERO_VIDEO}
      poster={HERO.poster}
      loop
      muted={muted}
      autoPlay
      playsInline
      preload="auto"
      className="absolute inset-0 h-full w-full object-cover"
      onError={(e) => {
        e.currentTarget.style.display = "none";
      }}
    />
  );
}

function DiscoverModelCard({ card, index }: { card: DiscoverCard; index: number }) {
  const vehicle = VEHICLES_DATA.find((v) => v.id === card.id);

  return (
    <motion.article
      variants={fadeIn}
      className="group relative min-h-[480px] overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0a0a0a] shadow-2xl shadow-black/40"
    >
      <div className="absolute inset-0">
        <Image
          src={card.image}
          alt={`Toyota ${card.id}`}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, 50vw"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
        <div className={cn("absolute inset-0 bg-linear-to-br via-black/50 to-black/90", card.accent)} />
        <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-black/10" />
      </div>

      <div className="relative z-10 flex h-full min-h-[480px] flex-col justify-between p-8 md:p-10">
        <div className="flex items-start justify-between gap-4">
          <span className="inline-flex items-center rounded-full border border-white/15 bg-black/40 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/80 backdrop-blur-md">
            {card.eyebrow}
          </span>
          <span className="font-mono text-xs text-white/30">0{index + 2}</span>
        </div>

        <div>
          <h3 className="text-3xl font-black leading-[1.05] tracking-tight text-white md:text-4xl">
            {card.headline}
            <br />
            <span className="text-toyota-red">{card.headlineAccent}</span>
          </h3>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/60 md:text-base">{card.sub}</p>

          <div className="mt-6 flex flex-wrap gap-2">
            {card.stats.map((s) => (
              <div
                key={s.sub}
                className="rounded-xl border border-white/10 bg-black/50 px-3 py-2 backdrop-blur-md"
              >
                <p className="text-[9px] font-bold uppercase tracking-widest text-toyota-red">{s.sub}</p>
                <p className="text-sm font-black text-white">{s.label}</p>
              </div>
            ))}
          </div>

          {vehicle && (
            <p className="mt-5 text-sm font-semibold text-toyota-gold">
              À partir de {formatPrice(vehicle.priceFrom)}
            </p>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={card.href}
              className="inline-flex items-center gap-2 rounded-full bg-toyota-red px-6 py-3 text-sm font-bold text-white shadow-lg shadow-toyota-red/30 transition-all hover:gap-3 hover:bg-toyota-red/90"
            >
              {card.cta}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={`/configurator/${card.id}`}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/10"
            >
              Configurer
            </Link>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/0 transition-all duration-500 group-hover:ring-white/20" />
    </motion.article>
  );
}

export default function HomePage() {
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const statsRef = useRef<HTMLDivElement>(null);
  const featuredRef = useRef<HTMLDivElement>(null);
  const discoverRef = useRef<HTMLDivElement>(null);
  const statsInView = useInView(statsRef, { once: true, amount: 0.2 });
  const featuredInView = useInView(featuredRef, { once: true, amount: 0.1 });
  const discoverInView = useInView(discoverRef, { once: true, amount: 0.15 });

  const featuredVehicles = FEATURED_IDS.map((id) =>
    VEHICLES_DATA.find((v) => v.id === id)
  ).filter(Boolean);

  return (
    <>
      <AppShell>
        <div className="flex flex-col">
          {/* ══ CINEMATIC VIDEO HERO ═══════════════════════════════════════════ */}
          <section className="relative h-screen min-h-[640px] overflow-hidden bg-black select-none">
            <HeroVideo muted={muted} playing={playing} />

            <div className="absolute inset-0 bg-linear-to-r from-black/90 via-black/55 to-black/20" />
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-black/30" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_50%,transparent_0%,rgba(0,0,0,0.4)_100%)]" />

            <div className="absolute top-24 right-6 z-20 flex gap-2 sm:right-8">
              <button
                type="button"
                onClick={() => setPlaying((p) => !p)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-md transition-colors hover:bg-white/15"
                aria-label={playing ? "Pause vidéo" : "Lire la vidéo"}
              >
                {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={() => setMuted((m) => !m)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-md transition-colors hover:bg-white/15"
                aria-label={muted ? "Activer le son" : "Couper le son"}
              >
                {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>
            </div>

            <div className="relative z-10 flex h-full items-center">
              <div className="section-container w-full">
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="max-w-3xl"
                >
                  <p className="mb-5 text-xs font-bold uppercase tracking-[0.35em] text-toyota-red">
                    {HERO.eyebrow}
                  </p>
                  <h1 className="mb-2 text-5xl font-black leading-[0.95] tracking-tight text-white sm:text-6xl lg:text-7xl xl:text-8xl">
                    {HERO.headline}
                  </h1>
                  <h1 className="mb-7 text-5xl font-black leading-[0.95] tracking-tight text-toyota-red sm:text-6xl lg:text-7xl xl:text-8xl">
                    {HERO.headlineRed}
                  </h1>
                  <p className="mb-10 max-w-xl text-lg leading-relaxed text-white/75 md:text-xl">{HERO.sub}</p>
                  <div className="flex flex-wrap gap-4">
                    <Link href={HERO.href} className="toyota-btn-primary inline-flex items-center gap-2.5 px-8 py-3.5">
                      {HERO.cta}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link href="/configurator/supra" className="toyota-btn-secondary inline-flex items-center gap-2 px-8 py-3.5">
                      Configurer
                    </Link>
                  </div>
                </motion.div>
              </div>
            </div>

            <div className="absolute bottom-28 left-0 right-0 z-20 hidden md:block">
              <div className="section-container">
                <div className="flex gap-10 lg:gap-16">
                  {HERO.stats.map((s) => (
                    <div key={s.sub} className="border-l border-toyota-red/40 pl-5">
                      <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-toyota-red">{s.sub}</p>
                      <p className="text-2xl font-black text-white lg:text-3xl">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <motion.a
              href="#discover-models"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2 text-white/45 transition-colors hover:text-white/80"
            >
              <span className="text-[10px] font-bold uppercase tracking-[0.25em]">Explorer</span>
              <ChevronDown className="h-5 w-5" />
            </motion.a>
          </section>

          {/* ══ DISCOVER CARDS — scroll to explore ═════════════════════════════ */}
          <section id="discover-models" className="relative scroll-mt-20 bg-[#050505] py-20 lg:py-28">
            <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-toyota-red/40 to-transparent" />
            <div className="section-container">
              <motion.div
                ref={discoverRef}
                variants={stagger}
                initial="hidden"
                animate={discoverInView ? "visible" : "hidden"}
              >
                <motion.div
                  variants={fadeIn}
                  className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
                >
                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-toyota-red">
                      Faites défiler
                    </p>
                    <h2 className="text-3xl font-black tracking-tight text-white md:text-4xl lg:text-5xl">
                      D&apos;autres modèles
                      <br />
                      <span className="text-white/40">vous attendent</span>
                    </h2>
                  </div>
                  <Link
                    href="/vehicles"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-toyota-muted transition-colors hover:text-white"
                  >
                    Voir toute la gamme
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </motion.div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
                  {DISCOVER_CARDS.map((card, i) => (
                    <DiscoverModelCard key={card.id} card={card} index={i} />
                  ))}
                </div>
              </motion.div>
            </div>
          </section>

          {/* ══ CATEGORY PILLS ═══════════════════════════════════════════════════ */}
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
                  <p className="text-toyota-red text-xs font-bold uppercase tracking-[0.25em] mb-2">Sélection Premium</p>
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight">Nos Modèles Phares</h2>
                </div>
                <Link href="/vehicles" className="flex items-center gap-2 text-sm font-semibold text-toyota-muted hover:text-white transition-colors">
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
                        <div className="absolute inset-0 bg-toyota-red/0 group-hover:bg-toyota-red/5 transition-colors duration-500" />
                      </div>
                      <div className="p-6">
                        <p className="text-toyota-muted/60 text-xs uppercase tracking-widest mb-1">{vehicle.category}</p>
                        <h3 className="text-white text-xl font-black mb-1.5 group-hover:text-toyota-red transition-colors">{vehicle.name}</h3>
                        <p className="text-toyota-muted text-sm mb-3 leading-relaxed line-clamp-2">
                          {FEATURED_TAGLINES[vehicle.id] ?? vehicle.description.slice(0, 80) + "…"}
                        </p>
                        <p className="text-toyota-gold font-bold text-lg mb-5">À partir de {formatPrice(vehicle.priceFrom)}</p>
                        <div className="flex gap-3">
                          <Link href={"/vehicles/" + vehicle.id} className="flex-1 text-center py-2.5 border border-white/15 text-white text-sm font-semibold rounded-full hover:bg-white/5 transition-colors">
                            Détails
                          </Link>
                          <Link href={"/configurator/" + vehicle.id} className="flex-1 text-center py-2.5 bg-toyota-red text-white text-sm font-bold rounded-full hover:bg-toyota-red/90 transition-colors shadow-lg shadow-toyota-red/20">
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

          {/* ══ INGÉNIERIE DE PRÉCISION ═══════════════════════════════════════════ */}
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
            <motion.div
              animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.15, 1] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-toyota-red/10 rounded-full blur-3xl pointer-events-none"
            />
            <SparkleAnim />
            <div className="section-container relative z-10">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
                <div className="text-center lg:text-left max-w-xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-toyota-red/10 border border-toyota-red/25 text-toyota-red text-xs font-bold uppercase tracking-widest mb-5">
                    <Sparkles className="h-3.5 w-3.5" />
                    Propulsé par Groq AI
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
                    Notre IA vous trouve
                    <br />
                    <span className="text-toyota-red">la Toyota parfaite</span>
                    <br />
                    en 2 minutes
                  </h2>
                  <p className="text-white/65 text-lg leading-relaxed">
                    Dites-nous votre budget, vos besoins et votre style de vie. Notre conseiller virtuel analyse tout et vous recommande le modèle idéal.
                  </p>
                </div>
                <div className="flex flex-col items-center gap-6 shrink-0">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="w-24 h-24 rounded-3xl bg-toyota-red/15 border border-toyota-red/30 flex items-center justify-center shadow-2xl shadow-toyota-red/20"
                  >
                    <Bot className="h-12 w-12 text-toyota-red" />
                  </motion.div>
                  <button
                    onClick={() => window.dispatchEvent(new CustomEvent("openChatWidget"))}
                    className="inline-flex items-center gap-3 px-10 py-5 bg-toyota-red text-white font-black text-lg rounded-full hover:bg-toyota-red/90 transition-all shadow-2xl shadow-toyota-red/40 hover:shadow-toyota-red/60 hover:gap-5 hover:scale-105"
                  >
                    Démarrer →
                  </button>
                  <p className="text-white/30 text-xs">Gratuit · Sans inscription · 2 min</p>
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
                  <motion.div key={label} variants={fadeIn} className="flex flex-col items-center text-center">
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
                  <p className="text-toyota-gold font-bold text-xs uppercase tracking-[0.3em] mb-4">Offres Spéciales 2026</p>
                  <h2 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6">
                    L&apos;Été Commence Ici.
                    <br />
                    <span className="text-toyota-red">Roulez Toyota.</span>
                  </h2>
                  <p className="text-white/70 text-lg mb-8 max-w-md leading-relaxed">
                    Profitez de nos offres saisonnières exclusives et de conditions de financement avantageuses sur toute la gamme.
                  </p>
                  <Link href="/offres" className="inline-flex items-center gap-2.5 px-8 py-4 bg-toyota-red text-white font-bold rounded-full hover:bg-toyota-red/90 transition-all shadow-xl shadow-toyota-red/30 hover:gap-4">
                    Voir les offres
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </motion.div>
              </div>
            </div>
          </section>
        </div>
      </AppShell>
    </>
  );
}
