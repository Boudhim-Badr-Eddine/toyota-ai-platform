import { VEHICLES_DATA } from "@/data/vehicles";
import { getEnrichedVehicle } from "@/data/vehicleEnrichments";
import type { CompareResult, CompareRow } from "@/app/api/compare/route";

function formatPrice(n: number): string {
  return `${n.toLocaleString("fr-MA")} MAD`;
}

export function buildLocalCompare(
  vehicleIds: string[],
  scenario = "general"
): CompareResult | null {
  const vehicles = vehicleIds
    .map((id) => VEHICLES_DATA.find((v) => v.id === id))
    .filter(Boolean)
    .map((v) => getEnrichedVehicle(v!));

  if (vehicles.length < 2) return null;

  const rows: CompareRow[] = [
    {
      label: "Prix à partir de",
      values: Object.fromEntries(vehicles.map((v) => [v.id, formatPrice(v.priceFrom)])),
      winner: vehicles.reduce((a, b) => (a.priceFrom <= b.priceFrom ? a : b)).id,
      relevance: 95,
      whyItMatters: "Budget d'entrée de gamme au Maroc.",
    },
    {
      label: "Puissance",
      values: Object.fromEntries(vehicles.map((v) => [v.id, `${v.specs.power} ch`])),
      winner: vehicles.reduce((a, b) => (a.specs.power >= b.specs.power ? a : b)).id,
      relevance: 80,
    },
    {
      label: "Consommation",
      values: Object.fromEntries(
        vehicles.map((v) => [v.id, v.specs.consumption ? `${v.specs.consumption} L/100km` : "—"])
      ),
      winner:
        vehicles.filter((v) => v.specs.consumption).sort((a, b) => (a.specs.consumption ?? 99) - (b.specs.consumption ?? 99))[0]
          ?.id ?? vehicles[0].id,
      relevance: 75,
    },
    {
      label: "Places",
      values: Object.fromEntries(vehicles.map((v) => [v.id, `${v.specs.seats}`])),
      relevance: scenario === "family" ? 90 : 60,
    },
    {
      label: "Catégorie",
      values: Object.fromEntries(vehicles.map((v) => [v.id, v.category])),
      relevance: 70,
    },
    {
      label: "Hybride",
      values: Object.fromEntries(vehicles.map((v) => [v.id, v.isHybrid ? "Oui" : "Non"])),
      relevance: 65,
    },
  ];

  if (scenario === "family") {
    rows.push({
      label: "Score famille",
      values: Object.fromEntries(
        vehicles.map((v) => [v.id, `${(v as { scenarioScores?: { family?: number } }).scenarioScores?.family ?? "—"}/100`])
      ),
      winner: vehicles.reduce((a, b) => {
        const sa = (a as { scenarioScores?: { family?: number } }).scenarioScores?.family ?? 0;
        const sb = (b as { scenarioScores?: { family?: number } }).scenarioScores?.family ?? 0;
        return sa >= sb ? a : b;
      }).id,
      relevance: 88,
    });
  }

  const names = vehicles.map((v) => v.name.replace(/^Toyota\s+/i, "")).join(" vs ");
  const cheapest = vehicles.reduce((a, b) => (a.priceFrom <= b.priceFrom ? a : b));

  return {
    vehicles: vehicles.map((v) => ({ id: v.id, name: v.name })),
    summary: `Comparaison ${names} : le ${cheapest.name.replace(/^Toyota\s+/i, "")} est le plus accessible (${formatPrice(cheapest.priceFrom)}). Choisissez selon vos priorités — espace, conso ou performance.`,
    rows: rows.filter((r) => r.relevance >= 30),
    suggestedAlternatives: null,
    scenario,
  };
}
