"use client";

import { Suspense, useEffect, useMemo, useRef, useState, Component, type ReactNode } from "react";
import { useGLTF, Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { GLTF } from "three-stdlib";
import { MODEL_PATHS, getModelPath } from "@/lib/modelPaths";
import {
  setupVehicleHinges,
  applyVehicleHingeRotation,
  type VehicleDoorId,
  type VehicleHingeSetup,
  type VehicleAnimState,
} from "@/lib/vehicleHinges";

export type ColorType = "solid" | "metallic" | "pearl" | string;

export interface CarModelProps {
  vehicleId: string;
  colorHex: string;
  colorType?: ColorType;
  vehicleName: string;
  selectedWheelId?: string;
  selectedInteriorId?: string;
  vehicleAnim?: VehicleAnimState;
}

const GLASS_RE = /glass|window|windshield|windscreen|visor|light|lamp|lens/i;
const TIRE_RE = /tire|tyre|rubber|wheel_tire/i;
const CHROME_RE = /chrome|trim|emblem|logo|badge/i;

const PART_KEYWORDS = {
  frontLeftDoor: /door.*front.*left|left.*front.*door|porte.*avant.*gauche|door_fl|fl_door|e180_door_fl|door_lf\b/i,
  frontRightDoor: /door.*front.*right|right.*front.*door|porte.*avant.*droit|door_fr|fr_door|e180_door_fr|door_rf\b/i,
  rearLeftDoor: /door.*rear.*left|door.*back.*left|left.*rear.*door|porte.*arri[eè]re.*gauche|door_rl|rl_door|e180_door_rl|door_lr\b/i,
  rearRightDoor: /door.*rear.*right|door.*back.*right|right.*rear.*door|porte.*arri[eè]re.*droit|door_rr|rr_door|e180_door_rr/i,
  hood: /hood|bonnet|capot(?!.*coffre)|e180_hood\b/i,
  trunk: /trunk|boot|coffre|tailgate(?!.*glass)|e180_trunk(?!body|lights)/i,
};

function bodyPaintProps(type: ColorType) {
  if (type === "metallic") return { metalness: 0.75, roughness: 0.25, envMapIntensity: 1.3 };
  if (type === "pearl") return { metalness: 0.55, roughness: 0.2, envMapIntensity: 1.5 };
  return { metalness: 0.1, roughness: 0.5, envMapIntensity: 0.9 };
}

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
  modelPath: string;
  colorHex: string;
  colorType: ColorType;
  selectedWheelId: string;
  selectedInteriorId: string;
  vehicleAnim?: VehicleAnimState;
}

function GltfModel({
  modelPath,
  colorHex,
  colorType,
  selectedWheelId,
  selectedInteriorId,
  vehicleAnim,
}: GltfModelProps) {
  const gltf = useGLTF(modelPath) as GLTF & { scene: THREE.Group };
  const scene = useMemo(() => gltf.scene.clone(true), [gltf.scene]);

  const [parts, setParts] = useState({
    frontLeftDoor: null as THREE.Object3D | null,
    frontRightDoor: null as THREE.Object3D | null,
    rearLeftDoor: null as THREE.Object3D | null,
    rearRightDoor: null as THREE.Object3D | null,
    hood: null as THREE.Object3D | null,
    trunk: null as THREE.Object3D | null,
  });
  const [sceneReady, setSceneReady] = useState(false);

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

  useEffect(() => {
    setSceneReady(false);
    scene.scale.setScalar(1);
    scene.position.set(0, 0, 0);

    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim > 0) {
      const scale = 3.5 / maxDim;
      scene.scale.setScalar(scale);
      scene.position.copy(center.clone().multiplyScalar(-scale));
      scene.position.y = 0;
    }
    setSceneReady(true);
  }, [scene]);

  useEffect(() => {
    const bodyColor = new THREE.Color(colorHex);
    const paint = bodyPaintProps(colorType);
    const WHEEL_RE = /wheel|rim|jante|felge|alloy/i;
    const INTERIOR_RE = /seat|interior|cabin|cockpit|upholstery|leather|fabric|dashboard|si[eè]ge/i;

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

      if (!(node instanceof THREE.Mesh)) return;

      const matName = Array.isArray(node.material)
        ? ((node.material[0] as THREE.Material)?.name ?? "")
        : ((node.material as THREE.Material)?.name ?? "");
      const combined = (matName + " " + node.name).toLowerCase();

      const remap = (mat: THREE.Material): THREE.Material => {
        if (!(mat instanceof THREE.MeshStandardMaterial)) return mat;
        const m = mat.clone() as THREE.MeshStandardMaterial;

        if (GLASS_RE.test(combined)) {
          m.color.set("#aaccff");
          m.transparent = true;
          m.opacity = 0.25;
          m.metalness = 0.1;
          m.roughness = 0.05;
        } else if (TIRE_RE.test(combined)) {
          m.color.set("#111111");
          m.metalness = 0.05;
          m.roughness = 0.9;
        } else if (CHROME_RE.test(combined)) {
          m.metalness = 0.95;
          m.roughness = 0.05;
        } else if (WHEEL_RE.test(combined)) {
          if (/racing|forged/.test(selectedWheelId)) {
            m.color.set("#2a2a2a");
            m.metalness = 0.95;
            m.roughness = 0.1;
          } else if (/diamond|luxury|prestige/.test(selectedWheelId)) {
            m.color.set("#c8c8c8");
            m.metalness = 1.0;
            m.roughness = 0.05;
          } else {
            m.color.set("#888888");
            m.metalness = 0.8;
            m.roughness = 0.2;
          }
        } else if (INTERIOR_RE.test(combined)) {
          if (/beige|ivoire/.test(selectedInteriorId)) {
            m.color.set("#c8a882");
            m.roughness = 0.7;
          } else if (/brown|brun/.test(selectedInteriorId)) {
            m.color.set("#5c2e0e");
            m.roughness = 0.5;
          } else if (/red|rouge/.test(selectedInteriorId)) {
            m.color.set("#7a0000");
            m.roughness = 0.4;
          } else {
            m.color.set("#111111");
            m.roughness = 0.6;
          }
          if (/leather|cuir/.test(selectedInteriorId)) {
            m.metalness = 0.05;
            m.roughness = 0.35;
          } else {
            m.metalness = 0.0;
          }
        } else {
          m.color.copy(bodyColor);
          m.metalness = paint.metalness;
          m.roughness = paint.roughness;
          m.envMapIntensity = paint.envMapIntensity;
        }
        m.needsUpdate = true;
        return m;
      };

      if (Array.isArray(node.material)) {
        node.material = (node.material as THREE.Material[]).map(remap);
      } else {
        node.material = remap(node.material as THREE.Material);
      }
    });

    setParts(found);
  }, [scene, colorHex, colorType, selectedWheelId, selectedInteriorId]);

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
  });

  return <primitive object={scene} visible={sceneReady} />;
}

export function CarModel({
  vehicleId,
  colorHex,
  colorType = "solid",
  vehicleName,
  selectedWheelId = "",
  selectedInteriorId = "",
  vehicleAnim,
}: CarModelProps) {
  const modelPath = getModelPath(vehicleId);
  const fallback = <FallbackBox colorHex={colorHex} vehicleName={vehicleName} />;

  return (
    <LoadErrorBoundary fallback={fallback}>
      <Suspense fallback={<LoadingCar />}>
        <GltfModel
          modelPath={modelPath}
          colorHex={colorHex}
          colorType={colorType}
          selectedWheelId={selectedWheelId}
          selectedInteriorId={selectedInteriorId}
          vehicleAnim={vehicleAnim}
        />
      </Suspense>
    </LoadErrorBoundary>
  );
}

if (typeof window !== "undefined") {
  Object.values(MODEL_PATHS).forEach((path) => {
    try {
      useGLTF.preload(path);
    } catch {
      /* ignore */
    }
  });
}
