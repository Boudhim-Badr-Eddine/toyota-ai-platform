"use client";

import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import type { ItineraryStop } from "./ItineraryDayCard";

const TripMapInner = dynamic(() => import("./TripMapInner").then((m) => m.TripMapInner), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl bg-white/5 border border-white/10 animate-pulse min-h-[360px]" />
  ),
});

interface TripMapProps {
  stops: ItineraryStop[];
  origin?: string;
  className?: string;
  height?: string;
  activeDay?: number;
}

export function TripMap({ stops, origin, className, height = "360px", activeDay }: TripMapProps) {
  return (
    <TripMapInner
      stops={stops}
      origin={origin}
      className={cn(className)}
      height={height}
      activeDay={activeDay}
    />
  );
}
