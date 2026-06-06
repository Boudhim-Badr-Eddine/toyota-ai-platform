export const MODEL_PATHS: Record<string, string> = {
  supra:       "/models/supra/scene.gltf",
  rav4:        "/models/rav4/scene.gltf",
  yaris:       "/models/yaris/scene.gltf",
  corolla:     "/models/corolla/scene.gltf",
  camry:       "/models/camry/scene.gltf",
  landcruiser: "/models/landcruiser/scene.gltf",
  hilux:       "/models/hilux/scene.gltf",
  prius:       "/models/prius/scene.gltf",
  chr:         "/models/chr/scene.gltf",
  highlander:  "/models/highlander/scene.gltf",
  granvia:     "/models/granvia/scene.gltf",
  "corolla-2": "/models/corolla-2/scene.gltf",
  kijang:      "/models/kijang/scene.gltf",
};

export function getModelPath(vehicleId: string): string {
  const path = MODEL_PATHS[vehicleId];
  if (!path) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[CarModel] No model path for vehicleId:", vehicleId);
    }
    return `/models/${vehicleId}/scene.gltf`;
  }
  if (process.env.NODE_ENV === "development") {
    console.log("[CarModel] Loading:", path);
  }
  return path;
}
