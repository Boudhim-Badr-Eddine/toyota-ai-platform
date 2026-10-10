"use client";

import { MapPin, Car, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ItineraryStop {
  name: string;
  city: string;
  lat: number;
  lng: number;
  type: string;
  note: string;
  isDealer?: boolean;
  dealerId?: string;
}

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  drivingKm: number;
  stops: ItineraryStop[];
}

interface ItineraryDayCardProps {
  day: ItineraryDay;
  className?: string;
  highlighted?: boolean;
}

const TYPE_COLORS: Record<string, string> = {
  culture: "bg-purple-500/15 text-purple-300",
  nature: "bg-green-500/15 text-green-300",
  gastronomie: "bg-orange-500/15 text-orange-300",
  aventure: "bg-amber-500/15 text-amber-300",
  plage: "bg-blue-500/15 text-blue-300",
  concession: "bg-toyota-red/15 text-toyota-red",
};

export function ItineraryDayCard({ day, className, highlighted }: ItineraryDayCardProps) {
  return (
    <article
      className={cn(
        "toyota-panel p-5 md:p-6 transition-all",
        highlighted && "ring-1 ring-toyota-red/40",
        className
      )}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-toyota-red/15 text-toyota-red text-sm font-black">
            {day.day}
          </span>
          <h3 className="mt-2 font-bold text-white text-lg">{day.title}</h3>
          <p className="mt-1 text-sm text-white/45 leading-relaxed">{day.description}</p>
        </div>
        {day.drivingKm > 0 && (
          <div className="shrink-0 text-right">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/60">
              <Car className="h-3.5 w-3.5 text-toyota-red" />
              {day.drivingKm} km
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {day.stops.map((stop, i) => (
          <div
            key={`${stop.name}-${i}`}
            className={cn(
              "flex gap-3 rounded-lg border p-3",
              stop.isDealer ? "border-toyota-red/20 bg-toyota-red/5" : "border-white/[0.06] bg-white/[0.02]"
            )}
          >
            <div className="shrink-0 mt-0.5">
              {stop.isDealer ? (
                <Building2 className="h-4 w-4 text-toyota-red" />
              ) : (
                <MapPin className="h-4 w-4 text-toyota-gold" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-sm text-white">{stop.name}</p>
                <span
                  className={cn(
                    "text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded",
                    TYPE_COLORS[stop.type] ?? "bg-white/8 text-white/50"
                  )}
                >
                  {stop.isDealer ? "Concession Toyota" : stop.type}
                </span>
              </div>
              <p className="text-xs text-white/40 mt-0.5">{stop.city}</p>
              <p className="text-xs text-white/50 mt-1 leading-relaxed">{stop.note}</p>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
