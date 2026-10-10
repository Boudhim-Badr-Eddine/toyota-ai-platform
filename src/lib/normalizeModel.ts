import * as THREE from "three";

/** Target max dimension (meters-ish) so every vehicle fills the viewport consistently. */
export const VEHICLE_TARGET_MAX_DIM = 4.2;

export interface NormalizedModelInfo {
  scale: number;
  size: THREE.Vector3;
  centerY: number;
}

/**
 * Scale and ground any GLTF scene to a consistent showroom size.
 * Works across Sketchfab exports with wildly different unit scales.
 */
export function normalizeVehicleScene(
  scene: THREE.Object3D,
  targetMaxDim = VEHICLE_TARGET_MAX_DIM
): NormalizedModelInfo {
  scene.scale.setScalar(1);
  scene.position.set(0, 0, 0);
  scene.rotation.set(0, 0, 0);
  scene.updateMatrixWorld(true);

  const box = new THREE.Box3().setFromObject(scene);
  if (box.isEmpty()) {
    return { scale: 1, size: new THREE.Vector3(targetMaxDim, 1, targetMaxDim), centerY: 0.5 };
  }

  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z, 0.0001);
  const scale = targetMaxDim / maxDim;

  scene.scale.setScalar(scale);
  scene.updateMatrixWorld(true);

  const grounded = new THREE.Box3().setFromObject(scene);
  const center = grounded.getCenter(new THREE.Vector3());
  const finalSize = grounded.getSize(new THREE.Vector3());

  scene.position.set(-center.x, -grounded.min.y, -center.z);
  scene.updateMatrixWorld(true);

  return {
    scale,
    size: finalSize,
    centerY: finalSize.y * 0.45,
  };
}
