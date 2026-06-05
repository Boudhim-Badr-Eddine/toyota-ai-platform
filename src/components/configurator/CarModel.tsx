"use client";

import { Suspense, useEffect, useMemo, useRef, useState, Component, type ReactNode } from "react";
import { useGLTF, Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { GLTF } from "three-stdlib";
import { getModelPath } from "@/lib/modelPaths";

// ─── Model manifest cache ────────────────────────────────────────────────────
declare global {
  interface Window { __TOYOTA_MODEL_MANIFEST?: Promise<Set<string>> }
}
function getModelManifest(): Promise<Set<string>> {
  if (typeof window === "undefined") return Promise.resolve(new Set());
  if (!window.__TOYOTA_MODEL_MANIFEST) {
    window.__TOYOTA_MODEL_MANIFEST = fetch("/models/manifest.json")
      .then((r) => (r.ok ? r.json() : []))
      .then((arr: string[]) => new Set(arr))
      .catch(() => new Set());
  }
  return window.__TOYOTA_MODEL_MANIFEST;
}

// ─── Types ───────────────────────────────────────────────────────────────────
export type ColorType = "solid" | "metallic" | "pearl" | string;

export interface CarModelProps {
  vehicleId: string;
  colorHex: string;
  colorType?: ColorType;
  vehicleName: string;
  selectedWheelId?: string;
  selectedInteriorId?: string;
  doorsOpen?: boolean;
  hoodOpen?: boolean;
  trunkOpen?: boolean;
  hideHotspots?: boolean;
  onHotspotClick?: (cameraCoords: THREE.Vector3, lookAtCoords: THREE.Vector3) => void;
}

// ─── Paint per color type ────────────────────────────────────────────────────
function bodyPaintProps(type: ColorType) {
  switch (type) {
    case "metallic": return { metalness: 0.90, roughness: 0.12, envMapIntensity: 1.8 };
    case "pearl":    return { metalness: 0.75, roughness: 0.15, envMapIntensity: 2.0 };
    default:         return { metalness: 0.85, roughness: 0.10, envMapIntensity: 1.5 };
  }
}

// ─── Loading placeholder ─────────────────────────────────────────────────────
function LoadingCar() {
  return (
    <mesh>
      <boxGeometry args={[0.1, 0.1, 0.1]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  );
}

// ─── Fallback box ────────────────────────────────────────────────────────────
export function FallbackBox({ colorHex, colorType = "solid", vehicleName }: {
  colorHex: string; colorType?: ColorType; vehicleName: string;
}) {
  const groupRef     = useRef<THREE.Group>(null);
  const currentColor = useRef(new THREE.Color(colorHex));
  const targetColor  = useRef(new THREE.Color(colorHex));
  const bodyMats     = useRef<THREE.MeshStandardMaterial[]>([]);
  const paint        = bodyPaintProps(colorType);

  useEffect(() => { targetColor.current.set(colorHex); }, [colorHex]);
  useFrame(({ clock }, delta) => {
    if (groupRef.current) groupRef.current.position.y = Math.sin(clock.elapsedTime * 0.7) * 0.025;
    currentColor.current.lerp(targetColor.current, Math.min(1, 6 * delta));
    bodyMats.current.forEach((m) => m.color.copy(currentColor.current));
  });

  const collect = (mesh: THREE.Mesh | null) => {
    if (mesh?.material instanceof THREE.MeshStandardMaterial)
      if (!bodyMats.current.includes(mesh.material as THREE.MeshStandardMaterial))
        bodyMats.current.push(mesh.material as THREE.MeshStandardMaterial);
  };

  return (
    <group ref={groupRef}>
      <mesh ref={(el) => collect(el as THREE.Mesh)} position={[0, 0.30, 0]}>
        <boxGeometry args={[2.2, 0.5, 1.0]} />
        <meshStandardMaterial color={colorHex} {...paint} />
      </mesh>
      <mesh ref={(el) => collect(el as THREE.Mesh)} position={[0, 0.76, 0]}>
        <boxGeometry args={[1.3, 0.45, 0.92]} />
        <meshStandardMaterial color={colorHex} {...paint} />
      </mesh>
      {([ [-0.8,0,0.55],[0.8,0,0.55],[-0.8,0,-0.55],[0.8,0,-0.55] ] as [number,number,number][]).map((pos,i)=>(
        <mesh key={i} position={pos} rotation={[Math.PI/2,0,0]}>
          <cylinderGeometry args={[0.28,0.28,0.22,24]}/>
          <meshStandardMaterial color="#111111" roughness={0.9} metalness={0.1}/>
        </mesh>
      ))}
    </group>
  );
}
export { FallbackBox as CarModelFallback };

// ─── Error boundary ──────────────────────────────────────────────────────────
class LoadErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode }, { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(e: Error) { console.error("[CarModel] GLTF load error:", e.message); }
  render() { return this.state.hasError ? this.props.fallback : this.props.children; }
}

// ─── Keywords for detecting car parts ────────────────────────────────────────
const PART_KEYWORDS = {
  frontLeftDoor:  /door.*front.*left|left.*front.*door|porte.*avant.*gauche|gauche.*avant.*porte|door_fl|fl_door/i,
  frontRightDoor: /door.*front.*right|right.*front.*door|porte.*avant.*droit|droit.*avant.*porte|door_fr|fr_door/i,
  rearLeftDoor:   /door.*rear.*left|door.*back.*left|left.*rear.*door|porte.*arri[eè]re.*gauche|door_rl|rl_door/i,
  rearRightDoor:  /door.*rear.*right|door.*back.*right|right.*rear.*door|porte.*arri[eè]re.*droit|door_rr|rr_door/i,
  hood:           /hood|bonnet|capot(?!.*coffre)/i,
  trunk:          /trunk|boot|coffre|tailgate(?!.*glass)/i,
  glass:          /glass|window|windshield|windscreen|visor|pare.brise|vitrage|cristal/i,
  tire:           /tire|tyre|rubber|pneu/i,
  chrome:         /chrome|trim|emblem|logo|badge/i,
  wheel:          /wheel|rim|jante|felge|alloy|hubcap|roue(?!_ext)/i,
  interior:       /seat|interior|cabin|cockpit|upholstery|leather|fabric|dashboard|steering|si[eè]ge|interieur|habitacle|\bint_/i,
  light:          /light|lamp|lens|headlight|taillight|phare|feu/i,
  body:           /body|panel|fender|bumper|hood_outer|carosserie/i,
};

// ─── GLTF model inner ────────────────────────────────────────────────────────
interface GltfModelProps {
  modelPath: string;
  colorHex: string;
  colorType: ColorType;
  selectedWheelId: string;
  selectedInteriorId: string;
  doorsOpen: boolean;
  hoodOpen: boolean;
  trunkOpen: boolean;
  hideHotspots: boolean;
  onHotspotClick?: (cameraCoords: THREE.Vector3, lookAtCoords: THREE.Vector3) => void;
}

function GltfModelInner({
  modelPath, colorHex, colorType,
  selectedWheelId, selectedInteriorId,
  doorsOpen, hoodOpen, trunkOpen,
  hideHotspots,
  onHotspotClick
}: GltfModelProps) {
  const gltf  = useGLTF(modelPath) as GLTF & { scene: THREE.Group };
  const scene = useMemo(() => gltf.scene.clone(true), [gltf.scene]);

  const bodyMatsRef  = useRef<THREE.MeshStandardMaterial[]>([]);
  const currentColor = useRef(new THREE.Color(colorHex));
  const targetColor  = useRef(new THREE.Color(colorHex));

  const [parts, setParts] = useState<{
    frontLeftDoor: THREE.Object3D | null;
    frontRightDoor: THREE.Object3D | null;
    rearLeftDoor: THREE.Object3D | null;
    rearRightDoor: THREE.Object3D | null;
    hood: THREE.Object3D | null;
    trunk: THREE.Object3D | null;
  }>({
    frontLeftDoor: null, frontRightDoor: null,
    rearLeftDoor: null, rearRightDoor: null,
    hood: null, trunk: null,
  });

  // Auto-center + scale
  useEffect(() => {
    const box    = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    const size   = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim === 0) return;
    const scale = 3.5 / maxDim;
    scene.scale.setScalar(scale);
    // Center X/Z and place the model's bottom exactly on y=0 (the floor plane).
    // Using box.min.y * scale ensures models whose local origin is not at ground
    // level (e.g. granvia, kijang) don't sink below the floor and disappear.
    scene.position.set(
      -center.x * scale,
      -box.min.y * scale,
      -center.z * scale,
    );
  }, [scene]);

  // Material + part detection
  useEffect(() => {
    bodyMatsRef.current = [];
    const paint = bodyPaintProps(colorType);
    const found: typeof parts = {
      frontLeftDoor: null, frontRightDoor: null,
      rearLeftDoor: null, rearRightDoor: null,
      hood: null, trunk: null,
    };

    scene.traverse((node) => {
      const n = node.name;
      if (!found.frontLeftDoor  && PART_KEYWORDS.frontLeftDoor.test(n))  found.frontLeftDoor  = node;
      if (!found.frontRightDoor && PART_KEYWORDS.frontRightDoor.test(n)) found.frontRightDoor = node;
      if (!found.rearLeftDoor   && PART_KEYWORDS.rearLeftDoor.test(n))   found.rearLeftDoor   = node;
      if (!found.rearRightDoor  && PART_KEYWORDS.rearRightDoor.test(n))  found.rearRightDoor  = node;
      if (!found.hood           && PART_KEYWORDS.hood.test(n))           found.hood           = node;
      if (!found.trunk          && PART_KEYWORDS.trunk.test(n))          found.trunk          = node;

      if (!(node instanceof THREE.Mesh)) return;
      node.castShadow    = true;
      node.receiveShadow = true;

      const mats    = Array.isArray(node.material) ? node.material : [node.material];
      const matName = ((mats[0] as THREE.Material)?.name ?? "").toLowerCase();
      const nodeName = node.name.toLowerCase();
      const combined = matName + " " + nodeName;

      const remap = (mat: THREE.Material): THREE.Material => {
        if (!(mat instanceof THREE.MeshStandardMaterial)) return mat;
        const m = mat.clone() as THREE.MeshStandardMaterial;

        if (PART_KEYWORDS.glass.test(combined)) {
          // Crystal-clear realistic glass
          m.color.set("#ffffff"); m.transparent = true; m.opacity = 0.20;
          m.metalness = 1.0; m.roughness = 0.0; m.envMapIntensity = 2.0; m.depthWrite = false;

        } else if (PART_KEYWORDS.light.test(combined)) {
          m.emissive = m.color.clone().multiplyScalar(0.2); m.emissiveIntensity = 0.3;
          m.roughness = 0.05; m.metalness = 0.9;

        } else if (PART_KEYWORDS.tire.test(combined)) {
          m.color.set("#151515"); m.metalness = 0.1; m.roughness = 0.85; m.envMapIntensity = 0.1;

        } else if (PART_KEYWORDS.chrome.test(combined)) {
          // Mirror metallic finish — preserve original colour, no override
          // (Toyota badge stays red, chrome trim stays silver, etc.)
          m.metalness = 1.0; m.roughness = 0.02; m.envMapIntensity = 2.5;

        } else if (PART_KEYWORDS.wheel.test(combined)) {
          if (/racing|forged/.test(selectedWheelId)) {
            m.color.set("#1a1a1a"); m.metalness = 0.90; m.roughness = 0.12; m.envMapIntensity = 1.2;
          } else if (/diamond|luxury|prestige/.test(selectedWheelId)) {
            m.color.set("#d0d0d0"); m.metalness = 0.95; m.roughness = 0.06; m.envMapIntensity = 1.6;
          } else {
            m.color.set("#e0e0e0"); m.metalness = 0.95; m.roughness = 0.10; m.envMapIntensity = 1.5;
          }

        } else if (PART_KEYWORDS.interior.test(combined)) {
          // Preserve original texture / colour completely — only tune PBR values
          // so leather looks like leather and plastic looks like plastic.
          if (/leather|cuir/.test(combined)) {
            m.roughness = 0.35; m.metalness = 0.03; m.envMapIntensity = 0.5;
          } else if (/dashboard|dash|instrument|console/.test(combined)) {
            m.roughness = 0.70; m.metalness = 0.02; m.envMapIntensity = 0.15;
          } else if (/steering/.test(combined)) {
            m.roughness = 0.45; m.metalness = 0.05; m.envMapIntensity = 0.3;
          } else {
            // Seats, fabric, carpet, headliner, etc.
            m.roughness = 0.75; m.metalness = 0.0;  m.envMapIntensity = 0.1;
          }

        } else {
          // ── Body paint (catch-all) ────────────────────────────────────────
          // Every mesh that isn't glass / light / tyre / chrome / wheel /
          // interior is treated as a painted body panel.  Clearing the albedo
          // texture (m.map) ensures the paint colour renders as a pure,
          // clean coat rather than being multiplied with a baked-in texture.
          // Normal-maps, roughness-maps and metalness-maps are intentionally
          // kept so the panel still reacts to light correctly.
          m.map = null;
          m.color.copy(currentColor.current);
          m.metalness = paint.metalness;
          m.roughness = paint.roughness;
          m.envMapIntensity = paint.envMapIntensity;
          bodyMatsRef.current.push(m);
        }

        m.needsUpdate = true;
        return m;
      };

      if (Array.isArray(node.material)) {
        node.material = (node.material as THREE.Material[]).map((m) => m ? remap(m) : m);
      } else if (node.material) {
        node.material = remap(node.material as THREE.Material);
      }
    });

    setParts(found);
    currentColor.current.set(colorHex);
    targetColor.current.set(colorHex);
  }, [scene, colorType, selectedWheelId, selectedInteriorId]);

  useEffect(() => { targetColor.current.set(colorHex); }, [colorHex]);

  const doorFLRot  = useRef(0);
  const doorFRRot  = useRef(0);
  const doorRLRot  = useRef(0);
  const doorRRRot  = useRef(0);
  const hoodRot    = useRef(0);
  const trunkRot   = useRef(0);

  const DOOR_OPEN  =  Math.PI / 4;
  const HOOD_OPEN  = -Math.PI / 3;
  const TRUNK_OPEN =  Math.PI / 3;
  const ANIM_SPEED = 2.5;

  useFrame((_, delta) => {
    currentColor.current.lerp(targetColor.current, Math.min(1, 4 * delta));
    bodyMatsRef.current.forEach((m) => m.color.copy(currentColor.current));

    const lerp = (cur: number, target: number) =>
      THREE.MathUtils.lerp(cur, target, Math.min(1, ANIM_SPEED * delta));

    const targetDoor = doorsOpen ? DOOR_OPEN : 0;
    doorFLRot.current = lerp(doorFLRot.current, targetDoor);
    doorFRRot.current = lerp(doorFRRot.current, -targetDoor);
    doorRLRot.current = lerp(doorRLRot.current, targetDoor);
    doorRRRot.current = lerp(doorRRRot.current, -targetDoor);

    if (parts.frontLeftDoor)  parts.frontLeftDoor.rotation.y  = doorFLRot.current;
    if (parts.frontRightDoor) parts.frontRightDoor.rotation.y = doorFRRot.current;
    if (parts.rearLeftDoor)   parts.rearLeftDoor.rotation.y   = doorRLRot.current;
    if (parts.rearRightDoor)  parts.rearRightDoor.rotation.y  = doorRRRot.current;

    hoodRot.current = lerp(hoodRot.current, hoodOpen ? HOOD_OPEN : 0);
    if (parts.hood) parts.hood.rotation.x = hoodRot.current;

    trunkRot.current = lerp(trunkRot.current, trunkOpen ? TRUNK_OPEN : 0);
    if (parts.trunk) parts.trunk.rotation.x = trunkRot.current;
  });

  // ─── HOTSPOT DATA MANIFEST ─────────────────────────────────────────────────
  // pos  = 3D badge location on car
  // cam  = where the camera flies to (must be 3-5 units from look so the part is actually visible)
  // look = what point the camera points at
  const hotspots = [
    {
      id: 1,
      pos: [-1.6, 0.45, 0.0] as [number,number,number], // Front grille / headlights
      cam:  new THREE.Vector3(-3.2, 0.9,  3.2),          // front 3/4 left — ~5 units from look
      look: new THREE.Vector3(-1.4, 0.4,  0.0),
    },
    {
      id: 2,
      pos: [ 1.6, 0.7,  0.0] as [number,number,number], // Rear trunk / spoiler
      cam:  new THREE.Vector3( 3.2, 1.0, -3.2),          // rear 3/4 right
      look: new THREE.Vector3( 1.4, 0.6,  0.0),
    },
    {
      id: 3,
      pos: [ 0.0, 0.8, -0.5] as [number,number,number], // Passenger-side window / dash
      cam:  new THREE.Vector3(-0.5, 1.4, -4.0),          // looking in from behind the car
      look: new THREE.Vector3( 0.0, 0.8,  0.0),
    },
    {
      id: 4,
      pos: [ 1.15, 0.35, 1.1] as [number,number,number], // Front-left wheel rim
      cam:  new THREE.Vector3( 2.2, 0.9,  3.8),           // wheel close-up from outside
      look: new THREE.Vector3( 1.1, 0.3,  0.9),
    },
    {
      id: 5,
      pos: [ 0.0, 1.45, 0.0] as [number,number,number], // Roof / panoramic glass
      cam:  new THREE.Vector3( 0.5, 5.0,  2.5),          // aerial top-down
      look: new THREE.Vector3( 0.0, 0.8,  0.0),
    },
    {
      id: 6,
      pos: [-0.6, 0.95, 0.0] as [number,number,number], // Windshield
      cam:  new THREE.Vector3(-2.5, 1.8,  3.5),          // front-left looking at glass
      look: new THREE.Vector3(-0.4, 0.9,  0.0),
    },
    {
      id: 7,
      pos:  [ 0.0, 0.95, -0.15] as [number,number,number], // Center gap between seats
      cam:  new THREE.Vector3( 0.0,  0.95, -0.4),           // pulled back into cabin
      look: new THREE.Vector3( 0.0,  0.90,  2.0),           // dead straight through windshield
    },
  ];

  return (
    <group>
      <primitive object={scene} />

      {/* Render all 7 Sketchfab style hotspots */}
      {!hideHotspots && hotspots.map((h) => (
        <Html key={h.id} position={h.pos} distanceFactor={5} center>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onHotspotClick?.(h.cam, h.look); }}
            className="w-7 h-7 rounded-full bg-white text-black font-black flex items-center justify-center shadow-[0_0_15px_rgba(235,10,30,0.5)] border border-red-600 hover:bg-red-600 hover:text-white transition-all duration-300 transform hover:scale-110 text-xs select-none"
          >
            {h.id}
          </button>
        </Html>
      ))}
    </group>
  );
}

// ─── Public export ───────────────────────────────────────────────────────────
export function CarModel({
  vehicleId, colorHex, colorType = "solid", vehicleName,
  selectedWheelId = "", selectedInteriorId = "",
  doorsOpen = false, hoodOpen = false, trunkOpen = false,
  hideHotspots = false,
  onHotspotClick,
}: CarModelProps) {
  const modelPath = getModelPath(vehicleId);
  const fallback  = <FallbackBox colorHex={colorHex} colorType={colorType} vehicleName={vehicleName} />;
  const [available, setAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    getModelManifest().then((set) => { if (mounted) setAvailable(set.has(vehicleId)); });
    return () => { mounted = false; };
  }, [vehicleId]);

  if (available === null) return (
    <LoadErrorBoundary fallback={fallback}>
      <Suspense fallback={<LoadingCar />}><LoadingCar /></Suspense>
    </LoadErrorBoundary>
  );
  if (!available) return fallback;

  return (
    <LoadErrorBoundary fallback={fallback}>
      <Suspense fallback={<LoadingCar />}>
        <GltfModelInner
          modelPath={modelPath}
          colorHex={colorHex}
          colorType={colorType}
          selectedWheelId={selectedWheelId}
          selectedInteriorId={selectedInteriorId}
          doorsOpen={doorsOpen}
          hoodOpen={hoodOpen}
          trunkOpen={trunkOpen}
          hideHotspots={hideHotspots}
          onHotspotClick={onHotspotClick}
        />
      </Suspense>
    </LoadErrorBoundary>
  );
}