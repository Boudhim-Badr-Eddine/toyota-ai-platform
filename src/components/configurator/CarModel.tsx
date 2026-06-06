"use client";

import { Suspense, useEffect, useMemo, useRef, Component, type ReactNode } from "react";
import { useGLTF, Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { GLTF } from "three-stdlib";
import { MODEL_PATHS, getModelPath } from "@/lib/modelPaths";

// --- Types -------------------------------------------------------------------

export type ColorType = "solid" | "metallic" | "pearl" | string;

export interface CarModelProps {
  vehicleId: string;
  colorHex: string;
  colorType?: ColorType;
  vehicleName: string;
  selectedWheelId?: string;
  selectedInteriorId?: string;
}

// --- Material name patterns --------------------------------------------------

const GLASS_RE  = /glass|window|windshield|windscreen|visor|light|lamp|lens/i;
const TIRE_RE   = /tire|tyre|rubber|wheel_tire/i;
const CHROME_RE = /chrome|trim|emblem|logo|badge/i;

function bodyPaintProps(type: ColorType) {
  if (type === "metallic") return { metalness: 0.75, roughness: 0.25, envMapIntensity: 1.3 };
  if (type === "pearl")    return { metalness: 0.55, roughness: 0.20, envMapIntensity: 1.5 };
  return                          { metalness: 0.10, roughness: 0.50, envMapIntensity: 0.9 };
}

// --- Loading spinner (inside Canvas) ----------------------------------------

function LoadingCar() {
  return (
    <Html center>
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        gap: 14, userSelect: "none", pointerEvents: "none",
        fontFamily: "Inter, system-ui, sans-serif",
      }}>
        <div style={{ position: "relative", width: 52, height: 52 }}>
          <div style={{
            position: "absolute", inset: 0, borderRadius: "50%",
            border: "2px solid rgba(255,255,255,0.07)",
          }} />
          <div className="animate-spin" style={{
            position: "absolute", inset: 0, borderRadius: "50%",
            border: "2px solid transparent", borderTopColor: "#EB0A1E",
          }} />
          <div style={{
            position: "absolute", inset: 0, display: "flex",
            alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 900, fontSize: 18,
          }}>T</div>
        </div>
        <p style={{ margin: 0, color: "#9CA3AF", fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase" }}>
          Chargement&hellip;
        </p>
      </div>
    </Html>
  );
}

// --- FallbackBox - shown when GLTF fails to load ----------------------------

export function FallbackBox({ colorHex, vehicleName }: { colorHex: string; vehicleName: string }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(clock.elapsedTime * 0.7) * 0.025;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh position={[0, 0.30, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.5, 1.0]} />
        <meshStandardMaterial color={colorHex} metalness={0.4} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.76, 0]} castShadow>
        <boxGeometry args={[1.3, 0.45, 0.92]} />
        <meshStandardMaterial color={colorHex} metalness={0.4} roughness={0.3} />
      </mesh>
      {([[-0.8, 0, 0.55], [0.8, 0, 0.55], [-0.8, 0, -0.55], [0.8, 0, -0.55]] as [number, number, number][]).map((pos, i) => (
        <mesh key={i} position={pos} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.28, 0.28, 0.22, 24]} />
          <meshStandardMaterial color="#111111" roughness={0.9} />
        </mesh>
      ))}
      <Html center position={[0, 1.5, 0]}>
        <div style={{
          color: "#9CA3AF", fontSize: 11, letterSpacing: "0.12em",
          textTransform: "uppercase", whiteSpace: "nowrap",
          pointerEvents: "none", userSelect: "none",
          fontFamily: "Inter, system-ui, sans-serif",
        }}>
          {vehicleName} — Modèle 3D non disponible
        </div>
      </Html>
    </group>
  );
}

export { FallbackBox as CarModelFallback };

// --- Error boundary ----------------------------------------------------------

interface EBState { hasError: boolean }
interface EBProps  { children: ReactNode; fallback: ReactNode }

class LoadErrorBoundary extends Component<EBProps, EBState> {
  constructor(props: EBProps) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(err: Error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[CarModel] Failed to load GLTF:", err.message);
    }
  }
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

// --- GltfModel - loads and colorizes the GLTF scene -------------------------

interface GltfModelProps {
  modelPath: string;
  colorHex: string;
  colorType: ColorType;
  selectedWheelId: string;
  selectedInteriorId: string;
}

function GltfModel({ modelPath, colorHex, colorType, selectedWheelId, selectedInteriorId }: GltfModelProps) {
  const gltf = useGLTF(modelPath) as GLTF & { scene: THREE.Group };

  // Clone the scene so we never mutate the useGLTF cache
  const scene = useMemo(() => gltf.scene.clone(true), [gltf.scene]);

  // Auto-center and fit to view
  useEffect(() => {
    const box    = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    const size   = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim === 0) return;
    const scale = 3.5 / maxDim;
    scene.scale.setScalar(scale);
    scene.position.copy(center.clone().multiplyScalar(-scale));
    scene.position.y = 0;
  }, [scene]);

  // Apply body color, wheel material, and interior material
  useEffect(() => {
    const bodyColor = new THREE.Color(colorHex);
    const paint     = bodyPaintProps(colorType);

    const WHEEL_RE    = /wheel|rim|jante|felge|alloy/i;
    const INTERIOR_RE = /seat|interior|cabin|cockpit|upholstery|leather|fabric|dashboard|si[eè]ge/i;

    scene.traverse((node) => {
      if (!(node instanceof THREE.Mesh)) return;

      const matName  = Array.isArray(node.material)
        ? (node.material[0] as THREE.Material)?.name ?? ""
        : (node.material as THREE.Material)?.name ?? "";
      const combined = (matName + " " + node.name).toLowerCase();

      const remap = (mat: THREE.Material): THREE.Material => {
        if (!(mat instanceof THREE.MeshStandardMaterial)) return mat;
        const m = mat.clone() as THREE.MeshStandardMaterial;

        if (GLASS_RE.test(combined)) {
          m.color.set("#aaccff");
          m.transparent = true; m.opacity = 0.25;
          m.metalness = 0.1; m.roughness = 0.05;
        } else if (TIRE_RE.test(combined)) {
          m.color.set("#111111");
          m.metalness = 0.05; m.roughness = 0.9;
        } else if (CHROME_RE.test(combined)) {
          m.metalness = 0.95; m.roughness = 0.05;
        } else if (WHEEL_RE.test(combined)) {
          // Wheel / rim material
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
          // Interior / seat material
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
          m.metalness    = paint.metalness;
          m.roughness    = paint.roughness;
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
  }, [scene, colorHex, colorType, selectedWheelId, selectedInteriorId]);

  return <primitive object={scene} />;
}

// --- Public CarModel export --------------------------------------------------

export function CarModel({ vehicleId, colorHex, colorType = "solid", vehicleName, selectedWheelId = "", selectedInteriorId = "" }: CarModelProps) {
  const modelPath = getModelPath(vehicleId);
  const fallback  = <FallbackBox colorHex={colorHex} vehicleName={vehicleName} />;

  return (
    <LoadErrorBoundary fallback={fallback}>
      <Suspense fallback={<LoadingCar />}>
        <GltfModel
          modelPath={modelPath}
          colorHex={colorHex}
          colorType={colorType}
          selectedWheelId={selectedWheelId}
          selectedInteriorId={selectedInteriorId}
        />
      </Suspense>
    </LoadErrorBoundary>
  );
}

// --- Preload all known models at app start -----------------------------------

if (typeof window !== "undefined") {
  Object.values(MODEL_PATHS).forEach((path) => {
    try { useGLTF.preload(path); } catch { /* ignore */ }
  });
}
