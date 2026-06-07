"use client";

import { useRef, useState, useEffect, Suspense } from "react";
import Image from "next/image";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from "framer-motion";
import {
  Map,
  ArrowRight,
  Mountain,
  X,
  ChevronLeft,
  ChevronRight,
  Compass,
} from "lucide-react";
import { RoadTripWizard } from "@/components/fun/RoadTripWizard";
import { cn } from "@/lib/utils";
import { PremiumHeroDecor } from "@/components/ui/PremiumHeroDecor";
import { BorderDrawButton } from "@/components/ui/BorderDrawButton";
import { PageSectionReveal } from "@/components/ui/PageSectionReveal";

const TOYOTA_RED = "#EB0A1E";
const EASE_PREMIUM = [0.22, 1, 0.36, 1] as const;

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80";

const PEXELS = (id: number, w = 800) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;

const FEATURED_DESTINATIONS = [
  {
    id: "merzouga",
    name: "Désert de Merzouga",
    location: "Sahara · Sud-Est",
    distance: "560 km",
    difficulty: "Difficile" as const,
    image:
      "https://images.unsplash.com/photo-1757307046224-4f91157d1578?w=800&q=80",
    description: "Dunes dorées, bivouac sous les étoiles et lever de soleil légendaire.",
  },
  {
    id: "atlas",
    name: "Route de l'Atlas",
    location: "Haut Atlas · Centre",
    distance: "320 km",
    difficulty: "Modéré" as const,
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    description: "Cols sinueux, villages berbères et panoramas à couper le souffle.",
  },
  {
    id: "chefchaouen",
    name: "Chefchaouen",
    location: "Rif · Nord",
    distance: "180 km",
    difficulty: "Facile" as const,
    image: PEXELS(31661542),
    description: "La perle bleue du Rif — ruelles colorées et artisanat local.",
  },
  {
    id: "essaouira",
    name: "Côte Atlantique",
    location: "Essaouira · Ouest",
    distance: "240 km",
    difficulty: "Facile" as const,
    image: PEXELS(2425011),
    description: "Brise marine, médina fortifiée et couchers de soleil inoubliables.",
  },
  {
    id: "dades",
    name: "Vallée du Dadès",
    location: "Gorges · Sud",
    distance: "410 km",
    difficulty: "Modéré" as const,
    image:
      "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80",
    description: "Gorges du Dadès, kasbahs en pisé et routes serpentines.",
  },
  {
    id: "ouarzazate",
    name: "Ouarzazate",
    location: "Porte du désert",
    distance: "380 km",
    difficulty: "Modéré" as const,
    image: PEXELS(1365425),
    description: "Hollywood du Maroc — studios Atlas et kasbah d'Aït Benhaddou.",
  },
] as const;

const GALLERY_PHOTOS = [
  {
    id: "g1",
    src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80",
    alt: "Route de montagne au Maroc",
  },
  {
    id: "g2",
    src: "https://images.unsplash.com/photo-1757307046224-4f91157d1578?w=1200&q=80",
    alt: "Dunes du Sahara",
  },
  {
    id: "g3",
    src: PEXELS(31661542, 1200),
    alt: "Chefchaouen",
  },
  {
    id: "g4",
    src: PEXELS(2425011, 1200),
    alt: "Côte atlantique marocaine",
  },
  {
    id: "g5",
    src: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80",
    alt: "Montagnes de l'Atlas",
  },
  {
    id: "g6",
    src: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200&q=80",
    alt: "Gorges du Dadès",
  },
  {
    id: "g7",
    src: PEXELS(1365425, 1200),
    alt: "Kasbah marocaine",
  },
  {
    id: "g8",
    src: PEXELS(2574489, 1200),
    alt: "Route désertique",
  },
] as const;

const DIFFICULTY_STYLES = {
  Facile: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  Modéré: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  Difficile: "bg-[#EB0A1E]/15 text-[#EB0A1E] border-[#EB0A1E]/30",
} as const;

const cardVariants = {
  hidden: { opacity: 0, y: 48 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.65, ease: EASE_PREMIUM },
  }),
};

function DifficultyBadge({ level }: { level: keyof typeof DIFFICULTY_STYLES }) {
  return (
    <span
      className={cn(
        "inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
        DIFFICULTY_STYLES[level]
      )}
    >
      {level}
    </span>
  );
}

function DestinationCard({
  dest,
  index,
}: {
  dest: (typeof FEATURED_DESTINATIONS)[number];
  index: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 200, damping: 22 });
  const springY = useSpring(mouseY, { stiffness: 200, damping: 22 });
  const rotateX = useTransform(springY, [-0.5, 0.5], [10, -10]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-10, 10]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      custom={index}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      style={{ rotateX, rotateY, transformPerspective: 1000 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group relative"
    >
      <div className="relative rounded-2xl border border-white/[0.06] bg-[#111111] overflow-hidden transition-[border-color] duration-500 hover:border-[#EB0A1E]/50">
        <div className="relative h-48 overflow-hidden">
          <Image
            src={dest.image}
            alt={dest.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/20 to-transparent" />
          <div className="absolute top-3 right-3">
            <DifficultyBadge level={dest.difficulty} />
          </div>
        </div>

        <div className="p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/35 mb-1">
            {dest.location}
          </p>
          <h3 className="text-white font-black text-lg mb-2 tracking-tight">{dest.name}</h3>
          <p className="text-white/40 text-xs leading-relaxed mb-4 line-clamp-2">
            {dest.description}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-[#D4AF37] text-sm font-bold tabular-nums">{dest.distance}</span>
            <Compass className="h-4 w-4 text-white/20 group-hover:text-[#EB0A1E] transition-colors" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function GalleryLightbox({
  photos,
  index,
  onClose,
  onPrev,
  onNext,
}: {
  photos: typeof GALLERY_PHOTOS;
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onPrev, onNext]);

  const photo = photos[index];
  if (!photo) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 md:p-10"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-5 right-5 w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-colors z-10"
        aria-label="Fermer"
      >
        <X className="h-5 w-5" />
      </button>

      {photos.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 z-10"
            aria-label="Précédent"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 z-10"
            aria-label="Suivant"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        transition={{ duration: 0.35, ease: EASE_PREMIUM }}
        className="relative w-full max-w-5xl aspect-[16/10] rounded-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          sizes="100vw"
          className="object-cover"
          loading="lazy"
        />
        <p className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white text-sm font-medium">
          {photo.alt}
        </p>
      </motion.div>

      <p className="absolute bottom-6 text-white/40 text-xs tabular-nums">
        {index + 1} / {photos.length}
      </p>
    </motion.div>
  );
}

function GallerySection() {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const openLightbox = (idx: number) => setLightboxIdx(idx);
  const closeLightbox = () => setLightboxIdx(null);
  const prevPhoto = () =>
    setLightboxIdx((i) => (i === null ? null : (i - 1 + GALLERY_PHOTOS.length) % GALLERY_PHOTOS.length));
  const nextPhoto = () =>
    setLightboxIdx((i) => (i === null ? null : (i + 1) % GALLERY_PHOTOS.length));

  return (
    <section className="section-container py-16 md:py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: EASE_PREMIUM }}
        className="text-center mb-12"
      >
        <p className="text-[#EB0A1E] text-[10px] font-bold uppercase tracking-[0.4em] mb-3">
          Galerie
        </p>
        <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
          L&apos;aventure en images
        </h2>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {GALLERY_PHOTOS.map((photo, i) => (
          <motion.button
            key={photo.id}
            type="button"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05, duration: 0.5, ease: EASE_PREMIUM }}
            whileHover={{ scale: 1.03 }}
            onClick={() => openLightbox(i)}
            className={cn(
              "relative rounded-xl overflow-hidden border border-white/[0.06] group cursor-pointer",
              i === 0 && "md:col-span-2 md:row-span-2 aspect-square md:aspect-auto md:min-h-[320px]",
              i !== 0 && "aspect-square"
            )}
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <span className="w-10 h-10 rounded-full bg-[#EB0A1E]/80 flex items-center justify-center text-white text-lg">
                +
              </span>
            </div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {lightboxIdx !== null && (
          <GalleryLightbox
            photos={GALLERY_PHOTOS}
            index={lightboxIdx}
            onClose={closeLightbox}
            onPrev={prevPhoto}
            onNext={nextPhoto}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

function PulseCta({ onClick }: { onClick: () => void }) {
  return (
    <BorderDrawButton accent="red" onClick={onClick}>
      Planifier mon Road Trip
    </BorderDrawButton>
  );
}

function CinematicHero({ onPlan }: { onPlan: () => void }) {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  const words = ["Road", "Trip", "Toyota"];

  return (
    <section
      ref={heroRef}
      className="relative h-[100svh] min-h-[600px] max-h-[900px] overflow-hidden"
    >
      <motion.div className="absolute inset-0 will-change-transform" style={{ y: imageY, scale: imageScale }}>
        <Image
          src={HERO_IMAGE}
          alt="Route panoramique au Maroc"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </motion.div>

      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-[#080808]" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/40" />
      <PremiumHeroDecor variant="road" />

      <motion.div
        style={{ opacity: contentOpacity, y: contentY }}
        className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6"
      >
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE_PREMIUM }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#EB0A1E]/30 bg-black/40 backdrop-blur-md px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#EB0A1E]"
        >
          <Map className="h-3.5 w-3.5" />
          Road Trip Légendaire
        </motion.div>

        <h1 className="flex flex-col items-center gap-0 mb-8">
          {words.map((word, i) => (
            <motion.span
              key={word}
              initial={{ opacity: 0, y: 60, filter: "blur(12px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{
                duration: 0.85,
                delay: 0.15 + i * 0.12,
                ease: EASE_PREMIUM,
              }}
              className={cn(
                "text-[clamp(3.5rem,12vw,8rem)] font-black leading-[0.88] tracking-[-0.04em]",
                word === "Toyota" ? "text-[#EB0A1E]" : "text-white"
              )}
            >
              {word}
            </motion.span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.55, ease: EASE_PREMIUM }}
          className="max-w-lg text-base md:text-lg text-white/60 leading-relaxed mb-10"
        >
          De Casablanca aux dunes de Merzouga — explorez le Maroc au volant de votre Toyota.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.68, ease: EASE_PREMIUM }}
          className="flex flex-col gap-3 items-center"
        >
          <PulseCta onClick={onPlan} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
        >
          <span className="text-white/30 text-[10px] uppercase tracking-[0.2em]">Défiler</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="w-px h-10 bg-gradient-to-b from-[#EB0A1E] to-transparent"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}

export function RoadTripPageClient() {
  const wizardRef = useRef<HTMLDivElement>(null);

  const scrollToWizard = () => {
    wizardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="toyota-page pb-28 lg:pb-16 bg-[#080808]">
      <CinematicHero onPlan={scrollToWizard} />

      {/* Featured destinations */}
      <section className="section-container py-16 md:py-24">
        <PageSectionReveal className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <p className="text-[#EB0A1E] text-[10px] font-bold uppercase tracking-[0.4em] mb-3">
              Destinations
            </p>
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              Routes légendaires du Maroc
            </h2>
          </div>
          <div className="flex items-center gap-2 text-white/30 text-xs">
            <Mountain className="h-4 w-4" />
            <span>6 itinéraires sélectionnés par Toyota Maroc</span>
          </div>
        </PageSectionReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {FEATURED_DESTINATIONS.map((dest, i) => (
            <DestinationCard key={dest.id} dest={dest} index={i} />
          ))}
        </div>

        <PageSectionReveal className="mt-14 text-center">
          <PulseCta onClick={scrollToWizard} />
        </PageSectionReveal>
      </section>

      <PageSectionReveal>
        <GallerySection />
      </PageSectionReveal>

      {/* Wizard — logic untouched */}
      <div
        id="road-trip-wizard"
        ref={wizardRef}
        className="border-t border-white/[0.06] bg-[#050505]"
      >
        <PageSectionReveal className="section-container pt-12 pb-4">
          <p className="text-[#EB0A1E] text-[10px] font-bold uppercase tracking-[0.4em] mb-2 text-center">
            Planificateur IA
          </p>
          <h2 className="text-2xl md:text-3xl font-black text-white text-center tracking-tight mb-2">
            Créez votre itinéraire
          </h2>
          <p className="text-white/40 text-sm text-center max-w-md mx-auto">
            Personnalisez votre aventure — ville de départ, durée, voyageurs et véhicule.
          </p>
        </PageSectionReveal>
        <Suspense fallback={<div className="section-container py-20 text-white/40">Chargement…</div>}>
          <RoadTripWizard />
        </Suspense>
      </div>
    </div>
  );
}
