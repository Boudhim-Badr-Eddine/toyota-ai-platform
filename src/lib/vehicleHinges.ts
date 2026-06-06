import * as THREE from "three";

export type VehicleDoorId = "FL" | "FR" | "RL" | "RR";

export interface VehicleAnimState {
  doors: Record<VehicleDoorId, boolean>;
  hood: boolean;
  trunk: boolean;
}

export interface VehicleHingePivot {
  pivot: THREE.Group;
  axis: "x" | "y" | "z";
  closed: number;
  open: number;
}

export interface VehicleHingeSetup {
  doors: Partial<Record<VehicleDoorId, VehicleHingePivot>>;
  hood: VehicleHingePivot | null;
  trunk: VehicleHingePivot | null;
}

export interface DetectedVehicleParts {
  frontLeftDoor: THREE.Object3D | null;
  frontRightDoor: THREE.Object3D | null;
  rearLeftDoor: THREE.Object3D | null;
  rearRightDoor: THREE.Object3D | null;
  hood: THREE.Object3D | null;
  trunk: THREE.Object3D | null;
}

const DOOR_GLASS_PATTERNS: Record<VehicleDoorId, RegExp> = {
  FL: /doorglass.*fl|door.*glass.*fl|glass.*door.*fl/i,
  FR: /doorglass.*fr|door.*glass.*fr|glass.*door.*fr/i,
  RL: /doorglass.*rl|door.*glass.*rl|glass.*door.*rl/i,
  RR: /doorglass.*rr|door.*glass.*rr|glass.*door.*rr/i,
};

function findNode(root: THREE.Object3D, pattern: RegExp): THREE.Object3D | null {
  let found: THREE.Object3D | null = null;
  root.traverse((node) => {
    if (!found && pattern.test(node.name)) found = node;
  });
  return found;
}

function worldBox(obj: THREE.Object3D) {
  const box = new THREE.Box3().setFromObject(obj);
  return {
    min: box.min.clone(),
    max: box.max.clone(),
    center: box.getCenter(new THREE.Vector3()),
  };
}

function createHingePivot(
  scene: THREE.Object3D,
  obj: THREE.Object3D,
  hingeWorld: THREE.Vector3,
): THREE.Group {
  scene.updateMatrixWorld(true);
  const pivot = new THREE.Group();
  pivot.name = `pivot_${obj.name}`;
  scene.add(pivot);
  pivot.position.copy(scene.worldToLocal(hingeWorld.clone()));
  pivot.attach(obj);
  return pivot;
}

function sceneFrontZ(sceneBox: ReturnType<typeof worldBox>, hood: THREE.Object3D | null) {
  if (hood) {
    return worldBox(hood).center.z;
  }
  return Math.abs(sceneBox.min.z) >= Math.abs(sceneBox.max.z)
    ? sceneBox.min.z
    : sceneBox.max.z;
}

function doorHingeZ(box: ReturnType<typeof worldBox>, frontZ: number) {
  return Math.abs(box.min.z - frontZ) < Math.abs(box.max.z - frontZ)
    ? box.min.z
    : box.max.z;
}

function setupDoorHinge(
  scene: THREE.Object3D,
  door: THREE.Object3D,
  id: VehicleDoorId,
  sceneBox: ReturnType<typeof worldBox>,
  frontZ: number,
): VehicleHingePivot {
  const box = worldBox(door);
  const sceneCenterX = sceneBox.center.x;
  const isLeftSide = box.center.x <= sceneCenterX;

  const hinge = new THREE.Vector3(
    isLeftSide ? box.min.x : box.max.x,
    box.center.y,
    doorHingeZ(box, frontZ),
  );

  const pivot = createHingePivot(scene, door, hinge);

  const glass = findNode(scene, DOOR_GLASS_PATTERNS[id]);
  if (glass?.parent && glass !== door) {
    const glassBox = worldBox(glass);
    const doorDist = box.center.distanceTo(glassBox.center);
    if (doorDist < 1.5) {
      pivot.attach(glass);
    }
  }

  const open = resolveOutwardAngle(pivot, door, sceneCenterX, isLeftSide ? -1.05 : 1.05);

  return {
    pivot,
    axis: "y",
    closed: 0,
    open,
  };
}

function resolveOutwardAngle(
  pivot: THREE.Group,
  door: THREE.Object3D,
  sceneCenterX: number,
  candidate: number,
): number {
  const before = worldBox(door).center.x;
  const saved = pivot.rotation.y;

  pivot.rotation.y = candidate;
  pivot.updateMatrixWorld(true);
  door.updateMatrixWorld(true);
  const after = worldBox(door).center.x;

  pivot.rotation.y = saved;
  pivot.updateMatrixWorld(true);

  const beforeDist = Math.abs(before - sceneCenterX);
  const afterDist = Math.abs(after - sceneCenterX);
  return afterDist > beforeDist ? candidate : -candidate;
}

export function setupVehicleHinges(
  scene: THREE.Object3D,
  parts: DetectedVehicleParts,
): VehicleHingeSetup {
  const doors: Partial<Record<VehicleDoorId, VehicleHingePivot>> = {};
  const sceneBox = worldBox(scene);
  const frontZ = sceneFrontZ(sceneBox, parts.hood);

  const doorMap: Array<[VehicleDoorId, THREE.Object3D | null]> = [
    ["FL", parts.frontLeftDoor],
    ["FR", parts.frontRightDoor],
    ["RL", parts.rearLeftDoor],
    ["RR", parts.rearRightDoor],
  ];

  for (const [id, door] of doorMap) {
    if (!door) continue;
    try {
      doors[id] = setupDoorHinge(scene, door, id, sceneBox, frontZ);
    } catch {
      // Skip doors that cannot be pivoted safely.
    }
  }

  let hood: VehicleHingePivot | null = null;
  if (parts.hood) {
    try {
      const box = worldBox(parts.hood);
      const hinge = new THREE.Vector3(box.center.x, box.max.y, box.min.z);
      const pivot = createHingePivot(scene, parts.hood, hinge);
      hood = { pivot, axis: "x", closed: 0, open: -0.95 };
    } catch {
      hood = null;
    }
  }

  let trunk: VehicleHingePivot | null = null;
  if (parts.trunk) {
    try {
      const box = worldBox(parts.trunk);
      const hinge = new THREE.Vector3(box.center.x, box.max.y, box.center.z);
      const pivot = createHingePivot(scene, parts.trunk, hinge);
      trunk = { pivot, axis: "x", closed: 0, open: 0.85 };
    } catch {
      trunk = null;
    }
  }

  return { doors, hood, trunk };
}

export function applyVehicleHingeRotation(hinge: VehicleHingePivot, amount: number) {
  hinge.pivot.rotation[hinge.axis] = amount;
}

export const DEFAULT_VEHICLE_ANIM: VehicleAnimState = {
  doors: { FL: false, FR: false, RL: false, RR: false },
  hood: false,
  trunk: false,
};
