import { VEHICLES_DATA } from "@/data/vehicles";

const ALIASES: Record<string, string> = {
  supra: "supra",
  rav4: "rav4",
  yaris: "yaris",
  corolla: "corolla",
  camry: "camry",
  hilux: "hilux",
  prius: "prius",
  "c-hr": "chr",
  chr: "chr",
  highlander: "highlander",
  "land cruiser": "landcruiser",
  landcruiser: "landcruiser",
  granvia: "granvia",
  kijang: "kijang",
  "corolla 2026": "corolla-2",
  "corolla-2": "corolla-2",
};

export function detectVehicleIds(text: string): string[] {
  const lower = text.toLowerCase();
  const found = new Set<string>();
  for (const v of VEHICLES_DATA) {
    const short = v.name.replace(/^Toyota\s+/i, "").toLowerCase();
    if (lower.includes(v.id) || lower.includes(short)) found.add(v.id);
  }
  for (const [alias, id] of Object.entries(ALIASES)) {
    if (lower.includes(alias)) found.add(id);
  }
  return [...found];
}

const COMPARE_INTENT =
  /compar| vs |versus|diff[eé]ren|analys|quelle.*(mieux|choisir)|lequel|entre.*et/i;

export function detectCompareIntent(text: string): { ids: string[]; scenario: string } | null {
  const trimmed = text.trim();
  if (!COMPARE_INTENT.test(trimmed)) return null;

  const ids = detectVehicleIds(trimmed);
  if (ids.length >= 2) {
    return { ids: ids.slice(0, 3), scenario: /famil/i.test(trimmed) ? "family" : "general" };
  }

  if (ids.length === 1 && /compar| vs |versus/i.test(trimmed)) {
    const other =
      ids[0] === "rav4" ? "highlander" : ids[0] === "supra" ? "chr" : ids[0] === "hilux" ? "rav4" : "rav4";
    return { ids: [ids[0], other], scenario: "general" };
  }

  return null;
}

export function extractCompareFromText(text: string): { ids: string[]; scenario?: string; summary?: string } | null {
  const marker = '"compare"';
  const i = text.indexOf(marker);
  if (i === -1) return null;

  const start = text.lastIndexOf("{", i);
  if (start === -1) return null;

  let depth = 0;
  for (let j = start; j < text.length; j++) {
    if (text[j] === "{") depth++;
    else if (text[j] === "}") {
      depth--;
      if (depth === 0) {
        try {
          const parsed = JSON.parse(text.slice(start, j + 1)) as {
            compare?: { ids: string[]; scenario?: string; summary?: string };
          };
          return parsed.compare ?? null;
        } catch {
          return null;
        }
      }
    }
  }
  return null;
}
