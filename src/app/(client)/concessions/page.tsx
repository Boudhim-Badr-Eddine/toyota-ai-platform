"use client";

import { useCallback, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Loader2,
  Search,
  LocateFixed,
  Heart,
  Phone,
  Clock,
  Navigation,
  Building2,
} from "lucide-react";
import { toast } from "sonner";
import { DEALERSHIPS, TOYOTA_HOTLINE, type Dealership } from "@/data/dealerships";
import { DealerMap, type DealerWithDistance } from "@/components/dealer/DealerMap";
import { dealershipGoogleMaps } from "@/lib/geo";
import { requestUserLocation, getGeolocationErrorMessage, sortByDistance } from "@/lib/geo";
import { BorderDrawButton } from "@/components/ui/BorderDrawButton";
import { cn } from "@/lib/utils";
import { PremiumHeroDecor } from "@/components/ui/PremiumHeroDecor";
import { PageSectionReveal } from "@/components/ui/PageSectionReveal";

const TOYOTA_RED = "#EB0A1E";
const EASE_PREMIUM = [0.22, 1, 0.36, 1] as const;

const CITIES = [...new Set(DEALERSHIPS.map((d) => d.city))].sort();

const TYPE_FILTERS = [
  { id: "" as const, label: "Tous" },
  { id: "succursale" as const, label: "Succursales" },
  { id: "concessionnaire" as const, label: "Agréés" },
];

const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.55, ease: EASE_PREMIUM },
  }),
};

function formatHours(hours: Dealership["hours"]) {
  const parts = [hours.weekdays, hours.saturday].filter(Boolean);
  return parts.join(" · ");
}

function ConcessionCard({
  dealer,
  index,
  selected,
  isRecommended,
  isFavorite,
  userLocation,
  onSelect,
  onToggleFavorite,
}: {
  dealer: DealerWithDistance;
  index: number;
  selected: boolean;
  isRecommended: boolean;
  isFavorite: boolean;
  userLocation: { lat: number; lng: number } | null;
  onSelect: () => void;
  onToggleFavorite: () => void;
}) {
  const maps = dealershipGoogleMaps(dealer);
  const phoneHref = `tel:${dealer.phone.replace(/\s/g, "")}`;

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      onClick={onSelect}
      onKeyDown={(e) => e.key === "Enter" && onSelect()}
      role="button"
      tabIndex={0}
      className={cn(
        "group rounded-none border bg-[#111111] p-5 cursor-pointer transition-[border-color] duration-300",
        selected
          ? "border-[#EB0A1E]/35"
          : "border-white/[0.06] hover:border-[#EB0A1E]/25"
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          {isRecommended && (
            <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#EB0A1E] block mb-1.5">
              Recommandé
            </span>
          )}
          <h3 className="text-white font-black text-base leading-snug tracking-tight">
            {dealer.name}
          </h3>
          <span
            className={cn(
              "inline-flex mt-2 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-none border",
              dealer.type === "succursale"
                ? "bg-[#EB0A1E]/10 text-[#EB0A1E] border-[#EB0A1E]/25"
                : "bg-white/[0.04] text-white/45 border-white/10"
            )}
          >
            {dealer.type === "succursale" ? "Officiel" : "Agréé"}
          </span>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className="shrink-0 w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white/25 hover:text-[#EB0A1E] hover:border-[#EB0A1E]/30 transition-colors"
          aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
        >
          <Heart className={cn("h-3.5 w-3.5", isFavorite && "fill-[#EB0A1E] text-[#EB0A1E]")} />
        </button>
      </div>

      <p className="text-white/40 text-xs leading-relaxed flex items-start gap-2 mb-2">
        <MapPin className="h-3.5 w-3.5 text-white/25 shrink-0 mt-0.5" />
        {dealer.address}
      </p>

      <a
        href={phoneHref}
        onClick={(e) => e.stopPropagation()}
        className="inline-flex items-center gap-1.5 text-[#EB0A1E] text-sm font-bold hover:underline underline-offset-2 mb-2"
      >
        <Phone className="h-3.5 w-3.5" />
        {dealer.phone}
      </a>

      <p className="text-white/30 text-[11px] flex items-start gap-1.5 mb-3">
        <Clock className="h-3.5 w-3.5 shrink-0 mt-0.5 text-white/20" />
        {formatHours(dealer.hours)}
      </p>

      {dealer.distanceKm != null && (
        <p className="text-[#EB0A1E] text-xs font-bold tabular-nums mb-3">
          {dealer.distanceKm.toFixed(1)} km
        </p>
      )}

      <div className="flex gap-2 mt-1" onClick={(e) => e.stopPropagation()}>
        <BorderDrawButton
          href={maps.directions(userLocation ?? undefined)}
          accent="red"
          className="flex-1 !px-3 !py-2.5 !text-[11px] uppercase tracking-wide font-bold justify-center"
        >
          <Navigation className="h-3.5 w-3.5" />
          Itinéraire
        </BorderDrawButton>
        <a
          href={phoneHref}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-none border border-white/15 bg-white/[0.04] text-white/70 text-[11px] font-bold uppercase tracking-wide hover:border-white/30 hover:bg-white/[0.08] hover:text-white transition-colors"
        >
          <Phone className="h-3.5 w-3.5" />
          Appeler
        </a>
      </div>
    </motion.div>
  );
}

export default function ConcessionsPage() {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [flyToUser, setFlyToUser] = useState(false);
  const [cityFilter, setCityFilter] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"" | "succursale" | "concessionnaire">("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [searchFocused, setSearchFocused] = useState(false);

  const requestGeo = useCallback(async () => {
    setLoading(true);
    try {
      const loc = await requestUserLocation();
      setUserLocation(loc);
      setFlyToUser(true);
      toast.success("Position détectée");
    } catch (error) {
      setUserLocation(null);
      setFlyToUser(false);
      toast.error("Géolocalisation impossible", {
        description: getGeolocationErrorMessage(error),
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const dealers = useMemo((): DealerWithDistance[] => {
    let list = DEALERSHIPS;
    if (typeFilter) list = list.filter((d) => d.type === typeFilter);
    if (cityFilter) list = list.filter((d) => d.city === cityFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.city.toLowerCase().includes(q) ||
          d.address.toLowerCase().includes(q)
      );
    }
    if (userLocation) {
      return sortByDistance(list, userLocation).map(({ item, distanceKm }) => ({
        ...item,
        distanceKm,
      }));
    }
    return list;
  }, [userLocation, cityFilter, search, typeFilter]);

  const effectiveSelectedId =
    selectedId ?? (userLocation && dealers[0] ? dealers[0].id : null);

  const cityPills = ["", ...CITIES];

  return (
    <div className="toyota-page pb-28 lg:pb-12 bg-[#080808]">
      {/* ── Dark hero ───────────────────────────────────────────────────── */}
      <section className="relative w-full overflow-hidden bg-[#080808] border-b border-white/[0.06]">
        <PremiumHeroDecor variant="dealers" />

        <div className="section-container relative z-10 py-14 md:py-20 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE_PREMIUM }}
            className="mb-5 inline-flex items-center gap-2 rounded-none border border-[#EB0A1E]/25 bg-[#EB0A1E]/[0.08] px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#EB0A1E]/90"
          >
            <Building2 className="h-3.5 w-3.5" />
            Réseau officiel
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.06, ease: EASE_PREMIUM }}
            className="text-[clamp(2.75rem,9vw,5.5rem)] font-black text-white leading-[0.92] tracking-[-0.04em] mb-5"
          >
            Nos
            <br />
            <span className="text-[#EB0A1E]/88">Concessions</span>
          </motion.h1>

          <motion.span
            className="block h-[3px] bg-[#EB0A1E]/70 mb-6 max-w-[100px]"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.7, delay: 0.18, ease: EASE_PREMIUM }}
            style={{ transformOrigin: "left" }}
          />

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.24, ease: EASE_PREMIUM }}
            className="text-white/45 text-sm md:text-base max-w-2xl leading-relaxed"
          >
            <span className="text-[#EB0A1E]/85 font-bold">{DEALERSHIPS.length} points de vente</span>{" "}
            — succursales officielles et concessionnaires agréés à travers le Maroc.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="text-[11px] text-white/25 mt-4 uppercase tracking-wider"
          >
            Source : toyota.co.ma · Assistance : {TOYOTA_HOTLINE}
          </motion.p>
        </div>
      </section>

      <div className="section-container py-8 lg:py-10">
        {/* ── Search & filters ──────────────────────────────────────────── */}
        <PageSectionReveal className="flex flex-col gap-5 mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <div
              className={cn(
                "relative flex-1 rounded-none border bg-[#0a0a0a] transition-[border-color] duration-300 overflow-hidden",
                searchFocused
                  ? "border-[#EB0A1E]/35"
                  : "border-white/[0.08]"
              )}
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 z-10" />
              <input
                type="search"
                placeholder="Rechercher une ville..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="relative z-[1] w-full bg-transparent pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-white/30 focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={() => void requestGeo()}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 h-[50px] px-5 rounded-none border border-white/10 bg-[#111111] text-white/70 text-sm font-semibold hover:border-[#EB0A1E]/30 hover:text-white transition-colors disabled:opacity-50 shrink-0"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LocateFixed className="h-4 w-4 text-[#EB0A1E]" />
              )}
              Ma position
            </button>
          </div>

          {/* Type filter pills */}
          <div className="flex flex-wrap gap-2">
            {TYPE_FILTERS.map((t) => (
              <button
                key={t.id || "all"}
                type="button"
                onClick={() => setTypeFilter(t.id)}
                className={cn(
                  "relative px-4 py-2 rounded-none text-xs font-bold uppercase tracking-wide transition-colors",
                  typeFilter === t.id ? "text-white" : "text-white/40 hover:text-white/70"
                )}
              >
                {typeFilter === t.id && (
                  <motion.span
                    layoutId="type-pill"
                    className="absolute inset-0 rounded-none bg-[#EB0A1E]/[0.08] border border-[#EB0A1E]/30"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{t.label}</span>
              </button>
            ))}
          </div>

          {/* City filter pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
            {cityPills.map((city) => {
              const label = city || "Toutes";
              const active = cityFilter === city;
              return (
                <button
                  key={city || "all"}
                  type="button"
                  onClick={() => setCityFilter(city)}
                  className={cn(
                    "relative shrink-0 px-4 py-2 rounded-none text-xs font-bold transition-colors",
                    active ? "text-white" : "text-white/40 hover:text-white/65"
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="city-pill"
                      className="absolute inset-0 rounded-none bg-white/[0.06] border border-[#EB0A1E]/30"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{label}</span>
                </button>
              );
            })}
          </div>
        </PageSectionReveal>

        {/* ── Map + cards ───────────────────────────────────────────────── */}
        <div className="grid lg:grid-cols-5 gap-6 lg:gap-8">
          {/* Interactive map */}
          <PageSectionReveal direction="left" delay={0.05} className="lg:col-span-3 relative">
            <div className="rounded-none overflow-hidden border border-white/[0.08] bg-[#111111]">
              <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
                <p className="text-white font-bold text-sm">Carte interactive</p>
                <span className="text-[10px] text-white/35 uppercase tracking-wider">
                  {dealers.length} concession{dealers.length !== 1 ? "s" : ""}
                </span>
              </div>
              <DealerMap
                dealers={dealers}
                userLocation={userLocation}
                selectedId={effectiveSelectedId ?? undefined}
                onSelect={(d) => {
                  setSelectedId(d.id);
                  setFlyToUser(false);
                }}
                flyToUser={flyToUser}
                height="calc(100vh - 380px)"
                className="min-h-[420px]"
              />
            </div>
            <div className="absolute bottom-4 left-4 z-[1000] flex items-center gap-2 px-3 py-2 rounded-full bg-black/80 border border-white/10 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/70">
                {dealers.length} concessions · Horaires selon agence
              </span>
            </div>
          </PageSectionReveal>

          {/* Concession cards */}
          <PageSectionReveal direction="right" delay={0.1} className="lg:col-span-2 space-y-4 max-h-[calc(100vh-380px)] overflow-y-auto pr-1">
            {dealers.length === 0 ? (
              <div className="rounded-none border border-white/[0.06] bg-[#111111] p-8 text-center">
                <p className="text-white/40 text-sm">Aucune concession trouvée.</p>
              </div>
            ) : (
              dealers.map((d, i) => (
                <ConcessionCard
                  key={d.id}
                  dealer={d}
                  index={i}
                  selected={effectiveSelectedId === d.id}
                  isRecommended={i === 0 && !!userLocation}
                  isFavorite={favorites.has(d.id)}
                  userLocation={userLocation}
                  onSelect={() => setSelectedId(d.id)}
                  onToggleFavorite={() =>
                    setFavorites((prev) => {
                      const next = new Set(prev);
                      if (next.has(d.id)) next.delete(d.id);
                      else next.add(d.id);
                      return next;
                    })
                  }
                />
              ))
            )}
          </PageSectionReveal>
        </div>
      </div>
    </div>
  );
}
