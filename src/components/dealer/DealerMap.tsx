"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { MapPin, Navigation, Phone } from "lucide-react";
import type { Dealership } from "@/data/dealerships";
import { formatDistance, dealershipGoogleMaps } from "@/lib/geo";
import { cn } from "@/lib/utils";
import { BorderDrawButton } from "@/components/ui/BorderDrawButton";

export type { DealerWithDistance } from "./DealerMapInner";

const DealerMapInner = dynamic(
  () => import("./DealerMapInner").then((m) => m.DealerMapInner),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-2xl bg-white/5 border border-white/10 animate-pulse min-h-[400px]" />
    ),
  }
);

interface DealerMapProps {
  dealers: import("./DealerMapInner").DealerWithDistance[];
  userLocation?: { lat: number; lng: number } | null;
  selectedId?: string;
  onSelect?: (dealer: Dealership) => void;
  className?: string;
  height?: string;
  flyToUser?: boolean;
}

export function DealerMap({
  dealers,
  userLocation,
  selectedId,
  onSelect,
  className,
  height = "400px",
  flyToUser = false,
}: DealerMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={cn("rounded-2xl bg-white/5 border border-white/10 animate-pulse", className)}
        style={{ height }}
      />
    );
  }

  return (
    <DealerMapInner
      dealers={dealers}
      userLocation={userLocation}
      selectedId={selectedId}
      onSelect={onSelect}
      className={className}
      height={height}
      flyToUser={flyToUser}
    />
  );
}

export function DealerCard({
  dealer,
  distanceKm,
  selected,
  recommended,
  onSelect,
}: {
  dealer: Dealership;
  distanceKm?: number;
  selected?: boolean;
  recommended?: boolean;
  onSelect?: () => void;
}) {
  return (
    <div
      className={cn(
        "toyota-dealer-card w-full text-left",
        selected && "toyota-dealer-card--selected",
        recommended && !selected && "ring-1 ring-toyota-red/30"
      )}
    >
      <button type="button" onClick={onSelect} className="w-full text-left p-4 pb-0">
        {recommended && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-toyota-red mb-2 block">
            Recommandé — le plus proche
          </span>
        )}
        <div className="flex items-center gap-2 mb-1">
          <p className="text-white font-semibold text-sm flex-1">{dealer.name}</p>
          <span
            className={cn(
              "text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0",
              dealer.type === "succursale"
                ? "bg-toyota-red/15 text-toyota-red"
                : "bg-white/8 text-toyota-muted"
            )}
          >
            {dealer.type === "succursale" ? "Officiel" : "Agréé"}
          </span>
        </div>
        <p className="text-toyota-muted text-xs mt-1 flex items-start gap-1.5">
          <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5 text-toyota-red" />
          {dealer.address}
        </p>
        <p className="text-xs text-toyota-muted/70 mt-1.5 flex items-center gap-1">
          <Phone className="h-3 w-3" />
          {dealer.phone}
        </p>
      </button>
      <div className="flex items-center gap-3 mt-3 px-4 pb-4">
        <BorderDrawButton
          href={dealershipGoogleMaps(dealer).place}
          className="!px-3 !py-1.5 !text-xs"
        >
          Google Maps
        </BorderDrawButton>
        <BorderDrawButton
          href={dealershipGoogleMaps(dealer).directions()}
          accent="red"
          className="!px-3 !py-2 !text-xs font-bold"
        >
          <Navigation className="h-3 w-3" />
          Itinéraire
        </BorderDrawButton>
        {distanceKm != null && (
          <span className="text-xs font-bold text-toyota-red ml-auto">{formatDistance(distanceKm)}</span>
        )}
      </div>
    </div>
  );
}
