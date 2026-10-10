import * as THREE from "three";

export type ColorType = "solid" | "metallic" | "pearl" | string;

export type MaterialSlot =
  | "body"
  | "glass"
  | "chrome"
  | "tire"
  | "wheel"
  | "interior"
  | "emissive"
  | "trim";

export interface PaintProps {
  metalness: number;
  roughness: number;
  envMapIntensity: number;
  clearcoat: number;
  clearcoatRoughness: number;
}

export function bodyPaintProps(type: ColorType): PaintProps {
  if (type === "metallic") {
    return { metalness: 0.82, roughness: 0.22, envMapIntensity: 1.85, clearcoat: 0.35, clearcoatRoughness: 0.12 };
  }
  if (type === "pearl") {
    return { metalness: 0.55, roughness: 0.14, envMapIntensity: 2.1, clearcoat: 0.72, clearcoatRoughness: 0.08 };
  }
  return { metalness: 0.15, roughness: 0.42, envMapIntensity: 1.35, clearcoat: 0.12, clearcoatRoughness: 0.2 };
}

/** Per-vehicle overrides for mesh/material names (substring match, lowercase). */
export const VEHICLE_BODY_HINTS: Record<string, string[]> = {
  supra: ["carpaint", "body_carpaint", "[color", "color_0", "color_a"],
  rav4: ["body", "paint", "car", "exterior", "carpaint"],
  hilux: ["body", "paint", "cab", "bed", "exterior", "carpaint"],
  camry: ["body", "paint", "exterior", "carpaint"],
  corolla: ["body", "paint", "exterior", "carpaint"],
  "corolla-2": ["body", "paint", "exterior", "carpaint"],
  yaris: ["body", "paint", "exterior", "carpaint"],
  prius: ["body", "paint", "exterior", "carpaint"],
  chr: ["body", "paint", "exterior", "carpaint"],
  highlander: ["body", "paint", "exterior", "carpaint"],
  landcruiser: ["body", "paint", "exterior", "carpaint"],
  granvia: ["body", "paint", "exterior", "carpaint"],
  kijang: ["body", "paint", "exterior", "carpaint"],
};

const CARPAINT_RE = /carpaint|body_carpaint|\[color|color_0|color_a\d|_color_/i;
const GLASS_RE = /glass|window|windshield|windscreen|visor|doorglass|side_glass|rear_glass|front_glass/i;
const EMISSIVE_RE =
  /headlight|headlamp|taillight|tail_light|brake_light|indicator|turn_signal|drl|light_emissive|reflectled|glassredillum|glass_red|glass_orange/i;
const TIRE_RE = /(?:^|[^a-z])tire(?:$|[^a-z])|tyre|rubber|wheel_tire|tread/i;
const CHROME_RE = /chrome|trim|emblem|logo|badge|grille|mirror_cap|exhaust_tip|reflect_bump|reflect\.|wheelbrake/i;
const WHEEL_RE = /\brim|jante|felge|alloy|hubcap|rimdark|rimb\b/i;
const INTERIOR_RE =
  /seat|interior|cabin|cockpit|upholstery|leather|fabric|dashboard|steering|si[eè]ge|headliner|plastic_int|plasticblack_in/i;
const TRIM_RE =
  /plasticblack|plasticglossy|plasticblackd|plasticbb|plasticblack_matt|plasticblack_perf|plastic_intb|plasticbb1/i;
const BODY_RE =
  /(?:^|[^a-z])body(?:$|[^a-z])|car_paint|exterior|shell|chassis|door(?!_glass)|hood|bonnet|fender|quarter|roof|bumper|panel/i;

export function classifyMaterialSlot(
  meshName: string,
  materialName: string,
  vehicleId?: string
): MaterialSlot {
  const combined = `${materialName} ${meshName}`.toLowerCase();

  if (CARPAINT_RE.test(combined)) return "body";
  if (EMISSIVE_RE.test(combined)) return "emissive";
  if (GLASS_RE.test(combined)) return "glass";
  if (TIRE_RE.test(combined)) return "tire";
  if (CHROME_RE.test(combined)) return "chrome";
  if (WHEEL_RE.test(combined)) return "wheel";
  if (INTERIOR_RE.test(combined)) return "interior";
  if (TRIM_RE.test(combined)) return "trim";

  const hints = vehicleId ? VEHICLE_BODY_HINTS[vehicleId] : undefined;
  if (hints?.some((h) => combined.includes(h))) return "body";
  if (BODY_RE.test(combined)) return "body";

  return "trim";
}

type PBRMaterial = THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial;

export function cloneAsPBR(mat: THREE.Material): PBRMaterial {
  if (mat instanceof THREE.MeshPhysicalMaterial || mat instanceof THREE.MeshStandardMaterial) {
    return mat.clone() as PBRMaterial;
  }
  const physical = new THREE.MeshPhysicalMaterial();
  if ("color" in mat && mat.color instanceof THREE.Color) {
    physical.color.copy(mat.color as THREE.Color);
  }
  if ("map" in mat && mat.map) {
    physical.map = mat.map as THREE.Texture;
  }
  if ("normalMap" in mat && mat.normalMap) {
    physical.normalMap = mat.normalMap as THREE.Texture;
  }
  if ("roughnessMap" in mat && mat.roughnessMap) {
    physical.roughnessMap = mat.roughnessMap as THREE.Texture;
  }
  if ("metalnessMap" in mat && mat.metalnessMap) {
    physical.metalnessMap = mat.metalnessMap as THREE.Texture;
  }
  return physical;
}

export function applySlotMaterial(
  mat: PBRMaterial,
  slot: MaterialSlot,
  opts: {
    bodyColor: THREE.Color;
    paint: PaintProps;
    selectedWheelId: string;
    selectedInteriorId: string;
  }
): void {
  switch (slot) {
    case "glass":
      mat.color.set("#c8ddff");
      mat.transparent = true;
      mat.opacity = 0.28;
      mat.metalness = 0.05;
      mat.roughness = 0.04;
      mat.envMapIntensity = 1.2;
      if (mat instanceof THREE.MeshPhysicalMaterial) {
        mat.transmission = 0.55;
        mat.thickness = 0.4;
        mat.ior = 1.45;
      }
      break;
    case "emissive":
      mat.color.set("#fff4e0");
      mat.emissive = new THREE.Color("#ffeedd");
      mat.emissiveIntensity = 0.85;
      mat.metalness = 0.1;
      mat.roughness = 0.15;
      break;
    case "tire":
      mat.color.set("#0a0a0a");
      mat.metalness = 0.02;
      mat.roughness = 0.92;
      mat.envMapIntensity = 0.3;
      break;
    case "chrome":
      mat.color.set("#e8e8e8");
      mat.metalness = 0.98;
      mat.roughness = 0.06;
      mat.envMapIntensity = 2.2;
      break;
    case "trim":
      mat.color.set("#111116");
      mat.metalness = 0.08;
      mat.roughness = 0.72;
      mat.envMapIntensity = 0.45;
      break;
    case "wheel": {
      if (/racing|forged/.test(opts.selectedWheelId)) {
        mat.color.set("#1a1a1a");
        mat.metalness = 0.95;
        mat.roughness = 0.12;
      } else if (/diamond|luxury|prestige/.test(opts.selectedWheelId)) {
        mat.color.set("#d4d4d4");
        mat.metalness = 1.0;
        mat.roughness = 0.06;
      } else {
        mat.color.set("#7a7a7a");
        mat.metalness = 0.88;
        mat.roughness = 0.18;
      }
      mat.envMapIntensity = 1.6;
      break;
    }
    case "interior":
      if (/beige|ivoire/.test(opts.selectedInteriorId)) {
        mat.color.set("#c8a882");
        mat.roughness = 0.68;
      } else if (/brown|brun/.test(opts.selectedInteriorId)) {
        mat.color.set("#5c2e0e");
        mat.roughness = 0.48;
      } else if (/red|rouge/.test(opts.selectedInteriorId)) {
        mat.color.set("#7a0000");
        mat.roughness = 0.38;
      } else {
        mat.color.set("#141414");
        mat.roughness = 0.58;
      }
      mat.metalness = /leather|cuir/.test(opts.selectedInteriorId) ? 0.06 : 0;
      mat.envMapIntensity = 0.5;
      break;
    case "body":
      mat.color.copy(opts.bodyColor);
      mat.metalness = opts.paint.metalness;
      mat.roughness = opts.paint.roughness;
      mat.envMapIntensity = opts.paint.envMapIntensity;
      if (mat instanceof THREE.MeshPhysicalMaterial) {
        mat.clearcoat = opts.paint.clearcoat;
        mat.clearcoatRoughness = opts.paint.clearcoatRoughness;
      }
      break;
    default: {
      const _exhaustive: never = slot;
      return _exhaustive;
    }
  }
  mat.needsUpdate = true;
}

export interface MeshCatalog {
  body: PBRMaterial[];
  glass: PBRMaterial[];
  chrome: PBRMaterial[];
  tire: PBRMaterial[];
  wheel: PBRMaterial[];
  interior: PBRMaterial[];
  emissive: PBRMaterial[];
  trim: PBRMaterial[];
}

export function buildMeshCatalog(scene: THREE.Object3D, vehicleId: string): MeshCatalog {
  const catalog: MeshCatalog = {
    body: [],
    glass: [],
    chrome: [],
    tire: [],
    wheel: [],
    interior: [],
    emissive: [],
    trim: [],
  };

  scene.traverse((node) => {
    if (!(node instanceof THREE.Mesh)) return;

    const materials = Array.isArray(node.material) ? node.material : [node.material];
    const matName = (materials[0] as THREE.Material)?.name ?? "";
    const slot = classifyMaterialSlot(node.name, matName, vehicleId);

    const remapped = materials.map((m) => cloneAsPBR(m));
    node.material = Array.isArray(node.material) ? remapped : remapped[0];

    const list = catalog[slot];
    remapped.forEach((m) => {
      list.push(m);
      m.side = THREE.FrontSide;
    });
  });

  return catalog;
}

/** Cap GPU texture footprint for smoother mobile performance. */
export function optimizeVehicleTextures(scene: THREE.Object3D, maxSize = 2048): void {
  scene.traverse((node) => {
    if (!(node instanceof THREE.Mesh)) return;
    const materials = Array.isArray(node.material) ? node.material : [node.material];
    for (const mat of materials) {
      for (const key of ["map", "normalMap", "roughnessMap", "metalnessMap", "aoMap"] as const) {
        const tex = (mat as THREE.MeshStandardMaterial)[key];
        if (!tex?.image) continue;
        tex.anisotropy = 4;
        const img = tex.image as { width?: number; height?: number };
        const w = img.width ?? 0;
        const h = img.height ?? 0;
        if (w > maxSize || h > maxSize) {
          tex.minFilter = THREE.LinearFilter;
          tex.generateMipmaps = false;
        }
      }
    }
  });
}
