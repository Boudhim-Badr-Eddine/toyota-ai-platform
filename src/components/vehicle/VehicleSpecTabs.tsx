"use client";

import type { Vehicle } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatPower, formatConsumption } from "@/lib/utils";
import { ScenarioScoreBars } from "@/components/vehicle/ScenarioScoreBars";
import { Star } from "lucide-react";

interface VehicleSpecTabsProps {
  vehicle: Vehicle;
}

export function VehicleSpecTabs({ vehicle }: VehicleSpecTabsProps) {
  const s = vehicle.specs;

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="w-full flex-wrap h-auto gap-1">
        <TabsTrigger value="overview">Aperçu</TabsTrigger>
        <TabsTrigger value="specs">Fiche technique</TabsTrigger>
        <TabsTrigger value="equipment">Équipements</TabsTrigger>
        <TabsTrigger value="ideal">Idéal pour</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        <p className="text-toyota-muted leading-relaxed">{vehicle.description}</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {vehicle.highlights.map((h) => (
            <div key={h} className="glass-card p-4 text-sm text-white">{h}</div>
          ))}
        </div>
        {vehicle.pros && vehicle.cons && (
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-green-400 text-xs font-bold uppercase mb-2">Points forts</h4>
              <ul className="space-y-1">{vehicle.pros.map((p) => <li key={p} className="text-sm text-toyota-muted">+ {p}</li>)}</ul>
            </div>
            <div>
              <h4 className="text-orange-400 text-xs font-bold uppercase mb-2">À considérer</h4>
              <ul className="space-y-1">{vehicle.cons.map((c) => <li key={c} className="text-sm text-toyota-muted">− {c}</li>)}</ul>
            </div>
          </div>
        )}
      </TabsContent>

      <TabsContent value="specs">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            ["Moteur", s.engine],
            ["Type", s.engineType],
            ["Puissance", formatPower(s.power)],
            ["Couple", `${s.torque} Nm`],
            ["Transmission", s.transmission],
            ["Transmission", s.drivetrain],
            ["0–100 km/h", `${s.zeroto100} s`],
            ["Vitesse max", `${s.topSpeed} km/h`],
            ["Consommation", formatConsumption(s.consumption)],
            ["Coffre", `${s.trunkLiters} L`],
            ["Places", `${s.seats}`],
            ["Poids", `${s.weight} kg`],
            ["Longueur", `${s.length} mm`],
            ["Garantie", s.warranty],
          ].map(([label, value]) => (
            <div key={label + String(value)} className="glass-card p-3">
              <p className="text-[10px] text-toyota-muted uppercase">{label}</p>
              <p className="text-white text-sm font-semibold mt-0.5">{value}</p>
            </div>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="equipment" className="space-y-4">
        {vehicle.safetyFeatures && (
          <div>
            <h4 className="text-white font-semibold mb-2">Sécurité</h4>
            <div className="flex flex-wrap gap-2">{vehicle.safetyFeatures.map((f) => <Badge key={f} variant="secondary">{f}</Badge>)}</div>
          </div>
        )}
        {vehicle.techFeatures && (
          <div>
            <h4 className="text-white font-semibold mb-2">Technologie</h4>
            <div className="flex flex-wrap gap-2">{vehicle.techFeatures.map((f) => <Badge key={f} variant="gold">{f}</Badge>)}</div>
          </div>
        )}
        {vehicle.standardEquipment && (
          <ul className="grid sm:grid-cols-2 gap-2">
            {vehicle.standardEquipment.map((e) => (
              <li key={e} className="text-sm text-toyota-muted flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-toyota-red" />{e}
              </li>
            ))}
          </ul>
        )}
      </TabsContent>

      <TabsContent value="ideal" className="space-y-4">
        {vehicle.scenarioScores && <ScenarioScoreBars scores={vehicle.scenarioScores} />}
        {vehicle.estimatedMonthlyPayment && (
          <div className="glass-card p-4 flex justify-between items-center">
            <span className="text-toyota-muted text-sm">Mensualité estimée</span>
            <span className="text-toyota-gold font-bold">{formatPrice(vehicle.estimatedMonthlyPayment)}/mois</span>
          </div>
        )}
        {vehicle.annualFuelCostMAD && (
          <div className="glass-card p-4 flex justify-between items-center">
            <span className="text-toyota-muted text-sm">Carburant annuel estimé</span>
            <span className="text-white font-semibold">{formatPrice(vehicle.annualFuelCostMAD)}/an</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-toyota-gold fill-toyota-gold" />
          <span className="text-white font-semibold">{vehicle.rating}</span>
          <span className="text-toyota-muted text-sm">({vehicle.reviewCount} avis)</span>
        </div>
      </TabsContent>
    </Tabs>
  );
}
