import { VEHICLES_DATA } from "@/data/vehicles";
import { getEnrichedVehicle } from "@/data/vehicleEnrichments";

import { detectVehicleIds } from "@/lib/compareIntent";

function pickByIntent(msg: string) {
  const lower = msg.toLowerCase();
  if (/suv|famil|7 place|enfant/.test(lower)) {
    return (
      VEHICLES_DATA.find((v) => v.id === "highlander") ??
      VEHICLES_DATA.find((v) => v.id === "rav4")
    );
  }
  if (/sport|supra|perf|rapide/.test(lower)) return VEHICLES_DATA.find((v) => v.id === "supra");
  if (/hybride|eco|conso|ville|citad/.test(lower)) {
    return (
      VEHICLES_DATA.find((v) => v.id === "yaris") ??
      VEHICLES_DATA.find((v) => v.id === "prius")
    );
  }
  if (/pick|hilux|travail|chantier|4x4|tout.?terrain|desert/.test(lower)) {
    return (
      VEHICLES_DATA.find((v) => v.id === "hilux") ??
      VEHICLES_DATA.find((v) => v.id === "landcruiser")
    );
  }
  if (/luxe|premium|berline|camry/.test(lower)) return VEHICLES_DATA.find((v) => v.id === "camry");
  if (/monospace|van|granvia|kijang|passager/.test(lower)) {
    return VEHICLES_DATA.find((v) => v.id === "granvia") ?? VEHICLES_DATA.find((v) => v.id === "kijang");
  }
  return VEHICLES_DATA.find((v) => v.id === "rav4") ?? VEHICLES_DATA[0];
}

export function buildChatFallback(userMessage: string): string {
  const msg = userMessage.trim();
  const lower = msg.toLowerCase();
  const ids = detectVehicleIds(msg);

  if (/compar| vs |versus|diff[eé]ren|analys|quelle.*(mieux|choisir)/.test(lower) && ids.length >= 2) {
    const [a, b] = ids.slice(0, 2);
    const va = VEHICLES_DATA.find((v) => v.id === a)!;
    const vb = VEHICLES_DATA.find((v) => v.id === b)!;
    const scenario = /famil/.test(lower) ? "family" : "general";
    return `Voici mon analyse **${va.name.replace(/^Toyota\s+/i, "")}** vs **${vb.name.replace(/^Toyota\s+/i, "")}** :

• **${va.name}** — ${va.tagline} · dès ${va.priceFrom.toLocaleString("fr-MA")} MAD · ${va.specs.power} ch
• **${vb.name}** — ${vb.tagline} · dès ${vb.priceFrom.toLocaleString("fr-MA")} MAD · ${vb.specs.power} ch

{"compare":{"ids":["${a}","${b}"],"scenario":"${scenario}","summary":"Comparaison ${a} vs ${b}"}}`;
  }

  if (/compar| vs |versus/.test(lower) && ids.length === 1) {
    const other =
      ids[0] === "rav4"
        ? "highlander"
        : ids[0] === "supra"
          ? "chr"
          : "rav4";
    return `Pour comparer, j'ai besoin de deux modèles. Voulez-vous **${ids[0]}** vs **${other}** ?

{"compare":{"ids":["${ids[0]}","${other}"],"scenario":"general","summary":"Suggestion de comparaison"}}`;
  }

  if (/analys|fiche|d[eé]tail|caract[eé]ristique|spec/.test(lower) && ids.length >= 1) {
    const v = VEHICLES_DATA.find((x) => x.id === ids[0])!;
    const e = getEnrichedVehicle(v);
    const pros = (e as { pros?: string[] }).pros?.slice(0, 2).join(", ") ?? v.tagline;
    return `**${v.name}** — ${v.description.slice(0, 120)}…

Points forts : ${pros}. Puissance ${v.specs.power} ch, ${v.specs.seats} places, dès **${v.priceFrom.toLocaleString("fr-MA")} MAD**.

{"recommendation":"${v.id}","configuratorUrl":"/configurator/${v.id}","detailUrl":"/vehicles/${v.id}","acheterUrl":"/acheter?vehicle=${v.id}"}`;
  }

  const pick = ids.length === 1 ? VEHICLES_DATA.find((v) => v.id === ids[0])! : pickByIntent(msg)!;

  return `Pour votre besoin, je recommande la **${pick.name}** — ${pick.tagline}. Budget à partir de **${pick.priceFrom.toLocaleString("fr-MA")} MAD** (${pick.specs.power} ch, ${pick.specs.seats} places).

Souhaitez-vous un essai ou une comparaison avec un autre modèle ?

{"recommendation":"${pick.id}","configuratorUrl":"/configurator/${pick.id}","detailUrl":"/vehicles/${pick.id}","acheterUrl":"/acheter?vehicle=${pick.id}"}`;
}
