export interface VehicleTrim {
  id: string;
  name: string;
  tagline: string;
  priceFrom: number;
  highlights: string[];
}

/** Trim levels per vehicle — affects base price in configurator */
export const VEHICLE_TRIMS: Record<string, VehicleTrim[]> = {
  supra: [
    { id: "essentiel", name: "Essentiel", tagline: "Performance pure", priceFrom: 520000, highlights: ["BMW B58 340 ch", "Freins Brembo", "Mode Sport"] },
    { id: "gr", name: "GR", tagline: "Circuit ready", priceFrom: 585000, highlights: ["Suspension adaptative", "Diff actif", "Échappement Akrapovic"] },
  ],
  rav4: [
    { id: "essentiel", name: "Essentiel", tagline: "Hybride accessible", priceFrom: 310000, highlights: ["Hybride 218 ch", "TSS 2.0", "AWD-i"] },
    { id: "lounge", name: "Lounge", tagline: "Confort premium", priceFrom: 365000, highlights: ["Sièges chauffants", "Hayon électrique", "Caméra 360°"] },
    { id: "gr-sport", name: "GR Sport", tagline: "Look sportif", priceFrom: 398000, highlights: ["Suspension sport", "Jantes 19\"", "Sellerie mixte"] },
  ],
  yaris: [
    { id: "essentiel", name: "Essentiel", tagline: "Citadine maline", priceFrom: 185000, highlights: ["Hybride 116 ch", "TSS", "5 portes"] },
    { id: "lounge", name: "Lounge", tagline: "Finitions soignées", priceFrom: 215000, highlights: ["Climatisation auto", "Caméra recul", "Jantes 16\""] },
  ],
  corolla: [
    { id: "essentiel", name: "Essentiel", tagline: "Berline fiable", priceFrom: 245000, highlights: ["Hybride 140 ch", "TSS 3.0", "LED"] },
    { id: "lounge", name: "Lounge", tagline: "Technologie avancée", priceFrom: 285000, highlights: ["Écran 10.5\"", "Charge sans fil", "Sièges confort"] },
  ],
  camry: [
    { id: "essentiel", name: "Essentiel", tagline: "Berline exécutive", priceFrom: 385000, highlights: ["Hybride 218 ch", "TSS 2.5+", "Sièges confort"] },
    { id: "lounge", name: "Lounge", tagline: "Luxe discret", priceFrom: 445000, highlights: ["Cuir", "HUD", "JBL audio"] },
  ],
  highlander: [
    { id: "essentiel", name: "Essentiel", tagline: "7 places", priceFrom: 480000, highlights: ["Hybride AWD", "7 places", "TSS 2.5+"] },
    { id: "lounge", name: "Lounge", tagline: "Famille premium", priceFrom: 545000, highlights: ["Cuir ventilé", "Toit panoramique", "JBL 11 HP"] },
  ],
  hilux: [
    { id: "essentiel", name: "Essentiel", tagline: "Pick-up robuste", priceFrom: 295000, highlights: ["4x4", "1 tonne charge", "Climatisation"] },
    { id: "lounge", name: "Lounge", tagline: "Confort tout-terrain", priceFrom: 355000, highlights: ["Cuir", "Caméra recul", "Jantes 18\""] },
  ],
  "land-cruiser": [
    { id: "essentiel", name: "Essentiel", tagline: "Légende du désert", priceFrom: 890000, highlights: ["V6 Twin Turbo", "4WD permanent", "Multi-terrain"] },
    { id: "lounge", name: "Lounge", tagline: "Expédition luxe", priceFrom: 980000, highlights: ["7 places cuir", "Suspension KDSS", "JBL premium"] },
  ],
  "c-hr": [
    { id: "essentiel", name: "Essentiel", tagline: "SUV crossover", priceFrom: 265000, highlights: ["Hybride 140 ch", "Design avant-garde", "TSS"] },
    { id: "lounge", name: "Lounge", tagline: "Style & tech", priceFrom: 305000, highlights: ["Toit bi-ton", "Sièges chauffants", "HUD"] },
  ],
  "bz4x": [
    { id: "essentiel", name: "Essentiel", tagline: "100% électrique", priceFrom: 420000, highlights: ["450 km autonomie", "AWD", "Charge rapide"] },
    { id: "lounge", name: "Lounge", tagline: "EV premium", priceFrom: 475000, highlights: ["Toit solaire", "Sièges ventilés", "Pack tech"] },
  ],
};

export function getTrimsForVehicle(vehicleId: string): VehicleTrim[] {
  return VEHICLE_TRIMS[vehicleId] ?? [
    {
      id: "essentiel",
      name: "Essentiel",
      tagline: "Finition standard",
      priceFrom: 0,
      highlights: ["Garantie Toyota", "Entretien inclus 1 an"],
    },
  ];
}

export function getTrimById(vehicleId: string, trimId: string): VehicleTrim | undefined {
  return getTrimsForVehicle(vehicleId).find((t) => t.id === trimId);
}
