export const MODEL_PATHS: Record<string, string> = {
  supra: "/models/supra/scene.gltf",
  rav4: "/models/rav4/scene.gltf",
  yaris: "/models/yaris/scene.gltf",
  corolla: "/models/corolla/scene.gltf",
  camry: "/models/camry/scene.gltf",
  landcruiser: "/models/landcruiser/scene.gltf",
  hilux: "/models/hilux/scene.gltf",
  prius: "/models/prius/scene.gltf",
  chr: "/models/chr/scene.gltf",
  highlander: "/models/highlander/scene.gltf",
  granvia: "/models/granvia/scene.gltf",
  "corolla-2": "/models/corolla-2/scene.gltf",
  kijang: "/models/kijang/scene.gltf",
};

/** Paths tried in order — first existing file wins. */
export function getModelCandidates(vehicleId: string): string[] {
  const primary = MODEL_PATHS[vehicleId] ?? `/models/${vehicleId}/scene.gltf`;
  const base = `/models/${vehicleId}`;
  return [...new Set([primary, `${base}/scene.gltf`, `${base}.gltf`, `${base}.glb`, `/models/${vehicleId}.glb`])];
}

export function getModelPath(vehicleId: string): string {
  return getModelCandidates(vehicleId)[0];
}

/** Resolve the first model URL that exists on the server (HEAD). */
export async function resolveModelPath(vehicleId: string): Promise<string | null> {
  for (const path of getModelCandidates(vehicleId)) {
    try {
      const res = await fetch(path, { method: "HEAD", cache: "no-store" });
      if (res.ok) return path;
    } catch {
      /* try next */
    }
  }
  return null;
}
