import type { Vehicle, ScenarioScores } from "@/types";
import { VEHICLES_DATA } from "./vehicles";

export interface VehicleEnrichment {
  scenarioScores: ScenarioScores;
  safetyFeatures: string[];
  techFeatures: string[];
  standardEquipment: string[];
  pros: string[];
  cons: string[];
  idealFor: string[];
  estimatedMonthlyPayment: number;
  annualFuelCostMAD: number;
}

function monthlyPayment(price: number): number {
  return Math.round((price * 0.85 * 0.0065) / 100) * 100;
}

function annualFuel(consumption: number): number {
  return Math.round(consumption * 150 * 14.5);
}

export const VEHICLE_ENRICHMENTS: Record<string, VehicleEnrichment> = {
  supra: {
    scenarioScores: { family: 15, city: 45, sport: 98, value: 40, tech: 75, offroad: 10 },
    safetyFeatures: ["7 airbags", "ABS + EBD", "Contrôle de stabilité VSC", "Freinage d'urgence"],
    techFeatures: ["Écran 8.8\"", "Apple CarPlay", "JBL Premium Sound", "Mode Sport/Sport+"],
    standardEquipment: ["Sièges sport Alcantara", "Différentiel actif", "Échappement actif", "Freins Brembo", "Caméra de recul", "Climatisation bi-zone"],
    pros: ["Performance exceptionnelle", "Design iconique", "Tenue de route précise"],
    cons: ["2 places seulement", "Consommation élevée", "Coffre limité"],
    idealFor: ["sport", "city"],
    estimatedMonthlyPayment: monthlyPayment(520000),
    annualFuelCostMAD: annualFuel(10.2),
  },
  rav4: {
    scenarioScores: { family: 90, city: 75, sport: 35, value: 80, tech: 85, offroad: 70 },
    safetyFeatures: ["Toyota Safety Sense 2.0", "Alerte angle mort", "Freinage pré-collision", "Régulateur adaptatif"],
    techFeatures: ["Écran 10.5\"", "Apple CarPlay / Android Auto", "Charge sans fil", "AWD-i intelligent"],
    standardEquipment: ["Sièges chauffants", "Hayon électrique", "Caméra 360°", "Climatisation auto", "Jantes 17\"", "LED avant/arrière"],
    pros: ["Hybride économique", "Espace généreux", "Fiabilité Toyota"],
    cons: ["CVT moins sportive", "Finitions plastiques", "Prix options élevé"],
    idealFor: ["family", "eco", "offroad"],
    estimatedMonthlyPayment: monthlyPayment(310000),
    annualFuelCostMAD: annualFuel(6.0),
  },
  highlander: {
    scenarioScores: { family: 98, city: 65, sport: 25, value: 70, tech: 80, offroad: 55 },
    safetyFeatures: ["Toyota Safety Sense 2.5+", "7 airbags", "Alerte fatigue", "Surveillance trafic arrière"],
    techFeatures: ["Écran 12.3\"", "HUD tête haute", "JBL 11 haut-parleurs", "Sièges ventilés"],
    standardEquipment: ["7 places", "3ème rangée", "Toit panoramique", "Hayon mains libres", "AWD", "Sièges cuir"],
    pros: ["7 vraies places", "Confort premium", "Hybride AWD"],
    cons: ["Encombrement urbain", "Prix élevé", "Consommation en charge"],
    idealFor: ["family7", "family"],
    estimatedMonthlyPayment: monthlyPayment(480000),
    annualFuelCostMAD: annualFuel(6.8),
  },
  yaris: {
    scenarioScores: { family: 55, city: 95, sport: 30, value: 92, tech: 70, offroad: 15 },
    safetyFeatures: ["Toyota Safety Sense", "Freinage auto ville", "Alerte sortie de voie"],
    techFeatures: ["Écran 8\"", "CarPlay", "Caméra de recul", "Clé intelligente"],
    standardEquipment: ["Hybride 116 ch", "5 portes", "Climatisation", "Régulateur", "Bluetooth"],
    pros: ["Parfaite en ville", "Très économique", "Facile à garer"],
    cons: ["Espace arrière limité", "Autoroute bruyante", "Coffre modeste"],
    idealFor: ["city", "eco", "value"],
    estimatedMonthlyPayment: monthlyPayment(185000),
    annualFuelCostMAD: annualFuel(3.8),
  },
  corolla: {
    scenarioScores: { family: 75, city: 85, sport: 40, value: 88, tech: 82, offroad: 20 },
    safetyFeatures: ["Toyota Safety Sense 3.0", "Freinage pré-collision piétons/vélos", "Alerte angle mort"],
    techFeatures: ["Écran 10.5\"", "Charge sans fil", "Digital Key", "Assistant vocal"],
    standardEquipment: ["Hybride 140 ch", "Sièges confort", "Jantes 16\"", "LED", "Climatisation auto"],
    pros: ["Fiabilité légendaire", "Hybride accessible", "Confort quotidien"],
    cons: ["Design conservateur", "Performances modérées", "Options chères"],
    idealFor: ["family", "city", "eco"],
    estimatedMonthlyPayment: monthlyPayment(245000),
    annualFuelCostMAD: annualFuel(4.2),
  },
  camry: {
    scenarioScores: { family: 85, city: 70, sport: 50, value: 75, tech: 88, offroad: 15 },
    safetyFeatures: ["TSS 3.0 complet", "Surveillance angles morts", "Freinage intersection"],
    techFeatures: ["Écran 12.3\"", "HUD", "JBL Premium", "Sièges ventilés"],
    standardEquipment: ["Hybride 218 ch", "Cuir", "Toit ouvrant", "Sièges électriques", "Charge sans fil"],
    pros: ["Silencieuse", "Spacieuse", "Technologie avancée"],
    cons: ["Prix premium", "Encombrement", "Style sobre"],
    idealFor: ["family", "eco"],
    estimatedMonthlyPayment: monthlyPayment(380000),
    annualFuelCostMAD: annualFuel(5.1),
  },
  chr: {
    scenarioScores: { family: 60, city: 88, sport: 55, value: 78, tech: 90, offroad: 25 },
    safetyFeatures: ["TSS 2.0", "Alerte sortie de voie", "Freinage pré-collision"],
    techFeatures: ["Écran 12.3\"", "Design avant-garde", "Hybride 140 ch", "Mode EV City"],
    standardEquipment: ["Crossover compact", "Toit bi-ton", "Jantes 18\"", "Caméra recul", "Climatisation auto"],
    pros: ["Design unique", "Agile en ville", "Hybride efficient"],
    cons: ["Visibilité arrière", "Coffre limité", "Places arrière serrées"],
    idealFor: ["city", "eco", "sport"],
    estimatedMonthlyPayment: monthlyPayment(265000),
    annualFuelCostMAD: annualFuel(4.5),
  },
  hilux: {
    scenarioScores: { family: 50, city: 40, sport: 45, value: 85, tech: 55, offroad: 98 },
    safetyFeatures: ["7 airbags", "VSC", "Contrôle descente", "Caméra multi-vues"],
    techFeatures: ["Écran 8\"", "CarPlay", "4x4 sélectionnable", "Différentiel verrouillable"],
    standardEquipment: ["Benne 1 tonne", "4x4", "Barres de toit", "Protection sous caisse", "Climatisation"],
    pros: ["Indestructible", "4x4 légendaire", "Charge utile"],
    cons: ["Confort route limité", "Consommation diesel", "Manœuvres difficiles"],
    idealFor: ["offroad", "pro"],
    estimatedMonthlyPayment: monthlyPayment(350000),
    annualFuelCostMAD: annualFuel(8.5),
  },
  landcruiser: {
    scenarioScores: { family: 80, city: 45, sport: 35, value: 55, tech: 70, offroad: 99 },
    safetyFeatures: ["TSS complet", "10 airbags", "Surveillance tout-terrain", "Freinage multi-terrain"],
    techFeatures: ["Écran 14\"", "Multi-Terrain Select", "Crawl Control", "Suspension Kinetic Dynamic"],
    standardEquipment: ["7 places luxe", "4x4 permanent", "Cuir Nappa", "Toit panoramique", "JBL"],
    pros: ["Roi du tout-terrain", "Prestige", "Durabilité extrême"],
    cons: ["Prix très élevé", "Consommation", "Encombrement"],
    idealFor: ["offroad", "family7"],
    estimatedMonthlyPayment: monthlyPayment(850000),
    annualFuelCostMAD: annualFuel(11.2),
  },
  prius: {
    scenarioScores: { family: 70, city: 92, sport: 25, value: 85, tech: 95, offroad: 10 },
    safetyFeatures: ["TSS 3.0", "Freinage pré-collision", "Alerte piétons"],
    techFeatures: ["Hybride 5ème gen", "Écran 12.3\"", "Solar roof option", "Mode EV"],
    standardEquipment: ["Design aérodynamique", "Consommation record", "Sièges recyclés", "Charge sans fil"],
    pros: ["Meilleure conso", "Technologie hybride", "Éco-responsable"],
    cons: ["Style polarisant", "Performances modestes", "Prix hybride"],
    idealFor: ["eco", "city"],
    estimatedMonthlyPayment: monthlyPayment(295000),
    annualFuelCostMAD: annualFuel(3.5),
  },
};

export function getEnrichedVehicle(vehicle: Vehicle): Vehicle {
  const e = VEHICLE_ENRICHMENTS[vehicle.id];
  if (!e) return vehicle;
  return { ...vehicle, ...e };
}

export function getEnrichedVehicles(): Vehicle[] {
  return VEHICLES_DATA.map(getEnrichedVehicle);
}
