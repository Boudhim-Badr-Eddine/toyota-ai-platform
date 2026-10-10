"use client";

import { Suspense, useEffect, useMemo, useRef, useState, Component, type ReactNode } from "react";
import { useGLTF, Html } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { GLTF } from "three-stdlib";
import { getModelPath } from "@/lib/modelPaths";
import { normalizeVehicleScene } from "@/lib/normalizeModel";
import {
  setupVehicleHinges,
  applyVehicleHingeRotation,
  type VehicleDoorId,
  type VehicleHingeSetup,
  type VehicleAnimState,
} from "@/lib/vehicleHinges";
import {
  applySlotMaterial,
  bodyPaintProps,
  buildMeshCatalog,
  optimizeVehicleTextures,
  type ColorType,
  type MeshCatalog,
} from "@/lib/vehicleMaterials";

export type { ColorType };

export interface CarModelProps {
  vehicleId: string;
  colorHex: string;
  colorType?: ColorType;
  vehicleName: string;
  selectedWheelId?: string;
  selectedInteriorId?: string;
  vehicleAnim?: VehicleAnimState;
  onLoaded?: () => void;
}

const PART_KEYWORDS = {
  frontLeftDoor: /door.*front.*left|left.*front.*door|porte.*avant.*gauche|door_fl|fl_door|e180_door_fl|door_lf\b/i,
  frontRightDoor: /door.*front.*right|right.*front.*door|porte.*avant.*droit|door_fr|fr_door|e180_door_fr|door_rf\b/i,
  rearLeftDoor: /door.*rear.*left|door.*back.*left|left.*rear.*door|porte.*arri[eè]re.*gauche|door_rl|rl_door|e180_door_rl|door_lr\b/i,
  rearRightDoor: /door.*rear.*right|door.*back.*right|right.*rear.*door|porte.*arri[eè]re.*droit|door_rr|rr_door|e180_door_rr/i,
  hood: /hood|bonnet|capot(?!.*coffre)|e180_hood\b/i,
  trunk: /trunk|boot|coffre|tailgate(?!.*glass)|e180_trunk(?!body|lights)/i,
};

function LoadingCar() {
  return (
    <Html center>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 14,
          userSelect: "none",
          pointerEvents: "none",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        <div style={{ position: "relative", width: 52, height: 52 }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: "2px solid rgba(255,255,255,0.07)",
            }}
          />
          <div
            className="animate-spin"
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: "2px solid transparent",
              borderTopColor: "#EB0A1E",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 900,
              fontSize: 18,
            }}
          >
            T
          </div>
        </div>
        <p
          style={{
            margin: 0,
            color: "#9CA3AF",
            fontSize: 11,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
          }}
        >
          Chargement…
        </p>
      </div>
    </Html>
  );
}

export function FallbackBox({ colorHex, vehicleName }: { colorHex: string; vehicleName: string }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(clock.elapsedTime * 0.7) * 0.025;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.5, 1.0]} />
        <meshStandardMaterial color={colorHex} metalness={0.4} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.76, 0]} castShadow>
        <boxGeometry args={[1.3, 0.45, 0.92]} />
        <meshStandardMaterial color={colorHex} metalness={0.4} roughness={0.3} />
      </mesh>
      {([[-0.8, 0, 0.55], [0.8, 0, 0.55], [-0.8, 0, -0.55], [0.8, 0, -0.55]] as [number, number, number][]).map(
        (pos, i) => (
          <mesh key={i} position={pos} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.28, 0.28, 0.22, 24]} />
            <meshStandardMaterial color="#111111" roughness={0.9} />
          </mesh>
        ),
      )}
      <Html center position={[0, 1.5, 0]}>
        <div
          style={{
            color: "#9CA3AF",
            fontSize: 11,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            userSelect: "none",
            fontFamily: "Inter, system-ui, sans-serif",
          }}
        >
          {vehicleName} — Modèle 3D non disponible
        </div>
      </Html>
    </group>
  );
}

export { FallbackBox as CarModelFallback };

interface EBState {
  hasError: boolean;
}

interface EBProps {
  children: ReactNode;
  fallback: ReactNode;
}

class LoadErrorBoundary extends Component<EBProps, EBState> {
  constructor(props: EBProps) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err: Error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[CarModel] Failed to load GLTF:", err.message);
    }
  }
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

interface GltfModelProps {
  vehicleId: string;
  modelPath: string;
  colorHex: string;
  colorType: ColorType;
  selectedWheelId: string;
  selectedInteriorId: string;
  vehicleAnim?: VehicleAnimState;
  onLoaded?: () => void;
}

function findVehicleParts(scene: THREE.Object3D) {
  const found = {
    frontLeftDoor: null as THREE.Object3D | null,
    frontRightDoor: null as THREE.Object3D | null,
    rearLeftDoor: null as THREE.Object3D | null,
    rearRightDoor: null as THREE.Object3D | null,
    hood: null as THREE.Object3D | null,
    trunk: null as THREE.Object3D | null,
  };

  const EXACT_PARTS: Array<[keyof typeof found, RegExp]> = [
    ["frontLeftDoor", /^door_FL$/i],
    ["frontRightDoor", /^door_FR$/i],
    ["rearLeftDoor", /^door_RL$/i],
    ["rearRightDoor", /^door_RR$/i],
    ["hood", /^hood$/i],
    ["trunk", /^trunk$/i],
  ];

  scene.traverse((node) => {
    for (const [key, pat] of EXACT_PARTS) {
      if (!found[key] && pat.test(node.name)) found[key] = node;
    }
  });

  scene.traverse((node) => {
    const n = node.name;
    if (!found.frontLeftDoor && PART_KEYWORDS.frontLeftDoor.test(n)) found.frontLeftDoor = node;
    if (!found.frontRightDoor && PART_KEYWORDS.frontRightDoor.test(n)) found.frontRightDoor = node;
    if (!found.rearLeftDoor && PART_KEYWORDS.rearLeftDoor.test(n)) found.rearLeftDoor = node;
    if (!found.rearRightDoor && PART_KEYWORDS.rearRightDoor.test(n)) found.rearRightDoor = node;
    if (!found.hood && PART_KEYWORDS.hood.test(n)) found.hood = node;
    if (!found.trunk && PART_KEYWORDS.trunk.test(n)) found.trunk = node;
  });

  return found;
}

function applyCatalogSlots(
  catalog: MeshCatalog,
  slots: Array<keyof MeshCatalog>,
  opts: Parameters<typeof applySlotMaterial>[2]
) {
  for (const slot of slots) {
    for (const mat of catalog[slot]) {
      applySlotMaterial(mat, slot, opts);
    }
  }
}

function GltfModel({
  vehicleId,
  modelPath,
  colorHex,
  colorType,
  selectedWheelId,
  selectedInteriorId,
  vehicleAnim,
  onLoaded,
}: GltfModelProps) {
  const gltf = useGLTF(modelPath) as GLTF & { scene: THREE.Group };
  const scene = useMemo(() => gltf.scene.clone(true), [gltf.scene]);
  const invalidate = useThree((s) => s.invalidate);

  const [parts, setParts] = useState({
    frontLeftDoor: null as THREE.Object3D | null,
    frontRightDoor: null as THREE.Object3D | null,
    rearLeftDoor: null as THREE.Object3D | null,
    rearRightDoor: null as THREE.Object3D | null,
    hood: null as THREE.Object3D | null,
    trunk: null as THREE.Object3D | null,
  });
  const [sceneReady, setSceneReady] = useState(false);

  const catalogRef = useRef<MeshCatalog | null>(null);
  const targetColorRef = useRef(new THREE.Color(colorHex));
  const paintRef = useRef(bodyPaintProps(colorType));
  const paintDirtyRef = useRef(true);

  const vehicleHinges = useRef<VehicleHingeSetup | null>(null);
  const vehicleRot = useRef({
    FL: 0,
    FR: 0,
    RL: 0,
    RR: 0,
    hood: 0,
    trunk: 0,
  });

  const HINGE_ANIM_SPEED = 1.6;
  const COLOR_LERP_SPEED = 9;

  useEffect(() => {
    setSceneReady(false);
    catalogRef.current = null;
    normalizeVehicleScene(scene);
    optimizeVehicleTextures(scene);
    const catalog = buildMeshCatalog(scene, vehicleId);
    catalogRef.current = catalog;
    setParts(findVehicleParts(scene));

    const initialPaint = bodyPaintProps(colorType);
    const initialColor = new THREE.Color(colorHex);
    targetColorRef.current.copy(initialColor);
    paintRef.current = initialPaint;

    const opts = {
      bodyColor: initialColor,
      paint: initialPaint,
      selectedWheelId,
      selectedInteriorId,
    };
    applyCatalogSlots(catalog, ["body", "glass", "chrome", "tire", "wheel", "interior", "emissive", "trim"], opts);

    setSceneReady(true);
  }, [scene, vehicleId, colorHex, colorType, selectedWheelId, selectedInteriorId]);

  useEffect(() => {
    if (sceneReady) onLoaded?.();
  }, [sceneReady, onLoaded]);

  useEffect(() => {
    targetColorRef.current.set(colorHex);
    paintRef.current = bodyPaintProps(colorType);
    paintDirtyRef.current = true;
    invalidate();
  }, [colorHex, colorType, invalidate]);

  useEffect(() => {
    const catalog = catalogRef.current;
    if (!catalog || !sceneReady) return;

    const opts = {
      bodyColor: targetColorRef.current,
      paint: paintRef.current,
      selectedWheelId,
      selectedInteriorId,
    };

    applyCatalogSlots(catalog, ["glass", "chrome", "tire", "emissive", "trim"], opts);
    applyCatalogSlots(catalog, ["wheel"], opts);
    applyCatalogSlots(catalog, ["interior"], opts);

    paintDirtyRef.current = true;
    invalidate();
  }, [sceneReady, selectedWheelId, selectedInteriorId, invalidate]);

  useEffect(() => {
    if (!sceneReady) return;
    paintDirtyRef.current = true;
    invalidate();
  }, [colorHex, colorType, sceneReady, invalidate]);

  useFrame((_, delta) => {
    const catalog = catalogRef.current;
    if (!catalog?.body.length) return;

    const target = targetColorRef.current;
    const paint = paintRef.current;
    const lerpT = Math.min(1, delta * COLOR_LERP_SPEED);
    let changed = false;

    for (const mat of catalog.body) {
      const dr = mat.color.r - target.r;
      const dg = mat.color.g - target.g;
      const db = mat.color.b - target.b;
      if (dr * dr + dg * dg + db * db > 0.00001) {
        mat.color.lerp(target, lerpT);
        changed = true;
      }
      if (paintDirtyRef.current) {
        mat.metalness = paint.metalness;
        mat.roughness = paint.roughness;
        mat.envMapIntensity = paint.envMapIntensity;
        if (mat instanceof THREE.MeshPhysicalMaterial) {
          mat.clearcoat = paint.clearcoat;
          mat.clearcoatRoughness = paint.clearcoatRoughness;
        }
      }
    }

    if (paintDirtyRef.current) paintDirtyRef.current = false;
    if (changed) invalidate();
  });

  useEffect(() => {
    if (!sceneReady) {
      vehicleHinges.current = null;
      return;
    }

    const hasParts =
      parts.frontLeftDoor ||
      parts.frontRightDoor ||
      parts.rearLeftDoor ||
      parts.rearRightDoor ||
      parts.hood ||
      parts.trunk;

    if (!hasParts) {
      vehicleHinges.current = null;
      return;
    }

    vehicleHinges.current = setupVehicleHinges(scene, parts);
    vehicleRot.current = { FL: 0, FR: 0, RL: 0, RR: 0, hood: 0, trunk: 0 };
  }, [scene, parts, sceneReady]);

  useFrame((_, delta) => {
    if (!vehicleHinges.current || !vehicleAnim) return;

    const anim = vehicleAnim;
    const anyDoorOpen = Object.values(anim.doors).some(Boolean);
    const hoodOpen = anim.hood;
    const trunkOpen = anim.trunk;
    if (!anyDoorOpen && !hoodOpen && !trunkOpen) {
      const rot = vehicleRot.current;
      if (rot.FL === 0 && rot.FR === 0 && rot.RL === 0 && rot.RR === 0 && rot.hood === 0 && rot.trunk === 0) {
        return;
      }
    }

    const lerp = (cur: number, target: number) =>
      THREE.MathUtils.lerp(cur, target, Math.min(1, HINGE_ANIM_SPEED * delta));

    const hinges = vehicleHinges.current;
    const rot = vehicleRot.current;

    (["FL", "FR", "RL", "RR"] as VehicleDoorId[]).forEach((id) => {
      const hinge = hinges.doors[id];
      if (!hinge) return;
      const target = vehicleAnim.doors[id] ? hinge.open : hinge.closed;
      rot[id] = lerp(rot[id], target);
      applyVehicleHingeRotation(hinge, rot[id]);
    });

    if (hinges.hood) {
      const target = vehicleAnim.hood ? hinges.hood.open : hinges.hood.closed;
      rot.hood = lerp(rot.hood, target);
      applyVehicleHingeRotation(hinges.hood, rot.hood);
    }

    if (hinges.trunk) {
      const target = vehicleAnim.trunk ? hinges.trunk.open : hinges.trunk.closed;
      rot.trunk = lerp(rot.trunk, target);
      applyVehicleHingeRotation(hinges.trunk, rot.trunk);
    }

    invalidate();
  });

  return <primitive object={scene} visible={sceneReady} dispose={null} />;
}

export function CarModel({
  vehicleId,
  colorHex,
  colorType = "solid",
  vehicleName,
  selectedWheelId = "",
  selectedInteriorId = "",
  vehicleAnim,
  onLoaded,
}: CarModelProps) {
  const modelPath = getModelPath(vehicleId);
  const fallback = <FallbackBox colorHex={colorHex} vehicleName={vehicleName} />;

  useEffect(() => {
    try {
      useGLTF.preload(modelPath);
    } catch {
      /* ignore */
    }
  }, [modelPath]);

  return (
    <LoadErrorBoundary fallback={fallback}>
      <Suspense fallback={<LoadingCar />}>
        <GltfModel
          vehicleId={vehicleId}
          modelPath={modelPath}
          colorHex={colorHex}
          colorType={colorType}
          selectedWheelId={selectedWheelId}
          selectedInteriorId={selectedInteriorId}
          vehicleAnim={vehicleAnim}
          onLoaded={onLoaded}
        />
      </Suspense>
    </LoadErrorBoundary>
  );
}
