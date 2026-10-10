"use client";

import type { ScenarioScores } from "@/types";
import { cn } from "@/lib/utils";

const LABELS: Record<keyof ScenarioScores, string> = {
  family: "Famille",
  city: "Ville",
  sport: "Sport",
  value: "Rapport qualité/prix",
  tech: "Technologie",
  offroad: "Tout-terrain",
};

export function ScenarioScoreBars({ scores }: { scores: ScenarioScores }) {
  return (
    <div className="space-y-3">
      {(Object.keys(scores) as (keyof ScenarioScores)[]).map((key) => (
        <div key={key}>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-toyota-muted">{LABELS[key]}</span>
            <span className="text-white font-semibold">{scores[key]}</span>
          </div>
          <div className="h-2 rounded-full bg-white/5 overflow-hidden">
            <div
              className={cn("h-full rounded-full bg-gradient-to-r from-toyota-red to-toyota-gold transition-all")}
              style={{ width: `${scores[key]}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
