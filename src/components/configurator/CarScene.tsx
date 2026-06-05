"use client";

import {
  Suspense,
  useRef,
  useEffect,
  useState,
  useCallback,
  Component,
  type ReactNode,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import { CarModel, CarModelFallback } from "./CarModel";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";

// ─── Canvas loader -----------------------------------------------------------

function CanvasLoader() {
  return (
    <mesh>
      <boxGeometry args={[0.1, 0.1, 0.1]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  );
}

// ─── HTML loading overlay ---------------------------------------------------

function LoadingOverlay() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#f2f2f2]/90 backdrop-blur-sm z-10 pointer-events-none">
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 rounded-full border-2 border-black/5" />
        <div className="absolute inset-0 rounded-full border-2 border-t-toyota-red animate-spin" />
      </div>
      <p className="text-black/40 text-sm font-medium tracking-wide">Chargement du modèle 3D…</p>
    </div>
  );
}

// ─── Error boundary ---------------------------------------------------------

class ModelErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() { return this.state.hasError ? this.props.fallback : this.props.children; }
}

// ─── Auto-rotate after idle -------------------------------------------------

function AutoRotate({ controlsRef }: { controlsRef: React.RefObject<OrbitControlsImpl | null> }) {
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    const start = () => { controls.autoRotate = true; };
    const reset = () => {
      controls.autoRotate = false;
      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(start, 4000);
    };
    idleTimer.current = setTimeout(start, 4000);
    window.addEventListener("mousemove", reset, { passive: true });
    window.addEventListener("touchstart", reset, { passive: true });
    return () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      window.removeEventListener("mousemove", reset);
      window.removeEventListener("touchstart", reset);
    };
  }, [controlsRef]);
  return null;
}

// ─── Camera controller (smooth ref-based lerp) ─────────────────────────────

const EXT_POS  = new THREE.Vector3(5, 2.5, 7);
const LOOK_EXT = new THREE.Vector3(0, 0.5, 0);

interface CameraControllerProps {
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
  cameraTarget: React.MutableRefObject<THREE.Vector3 | null>;
  lookAtTarget: React.MutableRefObject<THREE.Vector3 | null>;
  targetFov: number;
}

function CameraController({ controlsRef, cameraTarget, lookAtTarget, targetFov }: CameraControllerProps) {
  useFrame((state, delta) => {
    const controls = controlsRef.current;
    if (!controls) return;

    // 1. Smoothly transition the Field of View
    if (state.camera instanceof THREE.PerspectiveCamera) {
      state.camera.fov = THREE.MathUtils.lerp(state.camera.fov, targetFov, 5 * delta);
      state.camera.updateProjectionMatrix();
    }

    // 2. Smoothly glide camera position toward hotspot preset view
    if (cameraTarget.current) {
      state.camera.position.lerp(cameraTarget.current, 5 * delta);
      if (state.camera.position.distanceTo(cameraTarget.current) < 0.01) {
        cameraTarget.current = null;
      }
    }

    if (lookAtTarget.current) {
      controls.target.lerp(lookAtTarget.current, 5 * delta);
      if (controls.target.distanceTo(lookAtTarget.current) < 0.01) {
        lookAtTarget.current = null;
      }
    }

    controls.update();
  });

  return null;
}

// ─── Interior photo gallery -------------------------------------------------

const INTERIOR_LABELS = ["Vue conducteur", "Tableau de bord", "Sièges arrière"];

function InteriorGallery({ vehicleId, vehicleName }: { vehicleId: string; vehicleName: string }) {
  const count = 3;
  const [active, setActive]   = useState(0);
  const [loaded, setLoaded]   = useState<boolean[]>(Array(count).fill(false));
  const [errors, setErrors]   = useState<boolean[]>(Array(count).fill(false));

  const photos = Array.from({ length: count }, (_, i) => ({
    src:   `/images/interiors/${vehicleId}-${i + 1}.jpg`,
    label: INTERIOR_LABELS[i] ?? `Vue ${i + 1}`,
  }));

  const markLoaded = (i: number) => setLoaded((p) => { const n = [...p]; n[i] = true; return n; });
  const markError  = (i: number) => setErrors((p) => { const n = [...p]; n[i] = true; return n; });
  const allMissing = errors.every(Boolean);

  return (
    <div className="absolute inset-0 z-20 flex flex-col bg-[#111]">
      <div className="flex-1 relative overflow-hidden flex items-center justify-center">
        {allMissing ? (
          <div className="flex flex-col items-center gap-4 text-center px-8">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
              <svg className="w-8 h-8 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className="text-white/50 text-sm font-medium mb-1">Photos intérieures non disponibles</p>
              <p className="text-white/25 text-xs leading-relaxed">
                Ajoutez des photos dans<br />
                <code className="text-white/40 bg-white/5 px-1.5 py-0.5 rounded text-[11px]">
                  public/images/interiors/{vehicleId}-1.jpg
                </code>
              </p>
            </div>
          </div>
        ) : (
          photos.map((photo, i) => (
            <div
              key={i}
              className="absolute inset-0 transition-opacity duration-500"
              style={{ opacity: active === i && !errors[i] ? 1 : 0, pointerEvents: active === i ? "auto" : "none" }}
            >
              {!loaded[i] && !errors[i] && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-white/40 animate-spin" />
                </div>
              )}
              <img
                src={photo.src}
                alt={`${vehicleName} — ${photo.label}`}
                className="w-full h-full object-cover"
                onLoad={() => markLoaded(i)}
                onError={() => markError(i)}
                style={{ display: errors[i] ? "none" : "block" }}
              />
            </div>
          ))
        )}
        {!allMissing && (
          <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm text-white/70 text-xs px-3 py-1.5 rounded-full">
            {photos[active]?.label}
          </div>
        )}
      </div>
      {!allMissing && (
        <div className="shrink-0 flex gap-2 p-3 bg-black/60 backdrop-blur-sm overflow-x-auto">
          {photos.map((photo, i) => !errors[i] && (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                active === i ? "border-white" : "border-transparent opacity-50 hover:opacity-80"
              }`}
            >
              <img src={photo.src} alt={photo.label} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Professional studio stage ─────────────────────────────────────────────────────────

function StudioStage() {
  return (
    <group>
      {/* ── Main showroom floor — dark gloss epoxy look ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial
          color="#18181c"
          roughness={0.30}
          metalness={0.22}
          envMapIntensity={0.8}
        />
      </mesh>

      {/* ── Spotlight disc directly under the car ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]} receiveShadow>
        <circleGeometry args={[3.5, 64]} />
        <meshStandardMaterial
          color="#222232"
          roughness={0.15}
          metalness={0.38}
          envMapIntensity={1.2}
        />
      </mesh>

      {/* ── Glowing LED ring framing the spotlight ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0]}>
        <ringGeometry args={[3.55, 3.70, 128]} />
        <meshStandardMaterial
          color="#181830"
          emissive="#1a3aff"
          emissiveIntensity={0.55}
          roughness={0.18}
          metalness={0.75}
        />
      </mesh>

      {/* ── Floor accent lines running along the car’s length (Z-axis) ── */}
      {[-3.2, -2.0, -0.8, 0.8, 2.0, 3.2].map((x) => (
        <mesh key={x} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.002, 0]}>
          <planeGeometry args={[0.013, 30]} />
          <meshStandardMaterial
            color="#25253a"
            emissive="#3535a8"
            emissiveIntensity={0.10}
            roughness={0.22}
            metalness={0.55}
          />
        </mesh>
      ))}

      {/* ── Curved room walls — inside surface of a large cylinder ── */}
      <mesh position={[0, 9, 0]}>
        <cylinderGeometry args={[26, 26, 24, 72, 1, true]} />
        <meshStandardMaterial
          color="#0c0c0f"
          roughness={0.95}
          metalness={0.02}
          side={THREE.BackSide}
        />
      </mesh>

      {/* ── Ceiling — seals the room so the CSS gradient never bleeds through ── */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 21, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#08080a" roughness={1} metalness={0} />
      </mesh>
    </group>
  );
}

// ─── Environment presets ─────────────────────────────────────────────────────

type EnvType = "studio" | "street" | "cyber";

interface EnvConfig {
  label:               string;
  thumbGradient:       string;
  envFiles:            string | null;
  envPreset:           string | null;
  toneMappingExposure: number;
  ambientIntensity:    number;
  ambientColor:        string;
  keyIntensity:        number;
  fillIntensity:       number;
  fillColor:           string;
  bgGradient:          string;
}

const ENV_CONFIGS: Record<EnvType, EnvConfig> = {
  studio: {
    label:               "Studio",
    thumbGradient:       "radial-gradient(circle at 50% 55%, #3a3a50 0%, #1c1c28 50%, #0e0e12 100%)",
    envFiles:            "/hdr/studio_small_09_4k.hdr",
    envPreset:           null,
    toneMappingExposure: 0.90,
    ambientIntensity:    0.20,
    ambientColor:        "#8090a8",
    keyIntensity:        1.50,
    fillIntensity:       0.50,
    fillColor:           "#aec6e8",
    bgGradient:          "linear-gradient(180deg, #0f1623 0%, #1a2540 30%, #1e2d3d 55%, #151515 58%, #0d0d0d 100%)",
  },
  street: {
    label:               "Soleil",
    thumbGradient:       "linear-gradient(160deg, #ff9020 0%, #ffc655 35%, #85b8e8 65%, #1c4890 100%)",
    envFiles:            null,
    envPreset:           "sunset",
    toneMappingExposure: 1.25,
    ambientIntensity:    0.65,
    ambientColor:        "#ffe8b0",
    keyIntensity:        2.80,
    fillIntensity:       1.00,
    fillColor:           "#c8dff5",
    bgGradient:          "linear-gradient(180deg, #1a3a70 0%, #2d5f9a 30%, #4a8bc4 55%, #5a9fd4 70%, #1a2840 100%)",
  },
  cyber: {
    label:               "Cyber",
    thumbGradient:       "radial-gradient(circle at 35% 65%, rgba(255,0,204,0.27) 0%, rgba(0,255,238,0.2) 50%, #050010 80%, #000005 100%)",
    envFiles:            null,
    envPreset:           "night",
    toneMappingExposure: 0.55,
    ambientIntensity:    0.04,
    ambientColor:        "#180828",
    keyIntensity:        0.25,
    fillIntensity:       0.15,
    fillColor:           "#8020ff",
    bgGradient:          "linear-gradient(180deg, #030008 0%, #0a0018 30%, #0f0022 55%, #080012 80%, #000005 100%)",
  },
};

// Sync Three.js renderer exposure whenever the active environment changes.
// Must live inside the Canvas tree to access useThree.
function EnvironmentManager({ exposure }: { exposure: number }) {
  const { gl } = useThree();
  useEffect(() => { gl.toneMappingExposure = exposure; }, [gl, exposure]);
  return null;
}

// ─── Props ------------------------------------------------------------------

interface CarSceneProps {
  vehicleId: string;
  colorHex: string;
  colorType?: string;
  vehicleName: string;
  selectedWheelId?: string;
  selectedInteriorId?: string;
}

// ─── CarScene ---------------------------------------------------------------

export function CarScene({
  vehicleId,
  colorHex,
  colorType,
  vehicleName,
  selectedWheelId = "",
  selectedInteriorId = "",
}: CarSceneProps) {
  const controlsRef     = useRef<OrbitControlsImpl | null>(null);
  const cameraTargetRef = useRef<THREE.Vector3 | null>(null);
  const lookAtTargetRef = useRef<THREE.Vector3 | null>(null);
  const [isLoading, setIsLoading]   = useState(true);
  const [viewMode, setViewMode]     = useState<"exterior" | "interior">("exterior");
  const [isInterior, setIsInterior] = useState(false);
  const [isSelectMenuOpen, setIsSelectMenuOpen] = useState(false);
  const [currentFov, setCurrentFov] = useState(45);
  const [barWidth, setBarWidth]     = useState(0);
  const [barVisible, setBarVisible] = useState(false);
  const [envType, setEnvType]       = useState<EnvType>("studio");
  const cfg                          = ENV_CONFIGS[envType];

  const handleViewToggle = useCallback(() => {
    setViewMode((prev) => prev === "exterior" ? "interior" : "exterior");
  }, []);

  const handleHotspotNavigation = useCallback((cameraCoords: THREE.Vector3, lookAtCoords: THREE.Vector3) => {
    cameraTargetRef.current = cameraCoords.clone();
    lookAtTargetRef.current = lookAtCoords.clone();
    // Detect interior viewpoints (close cabin positions: hotspots 3 and 7)
    if (Math.abs(cameraCoords.z) < 0.6 && cameraCoords.y < 1.2) {
      setIsInterior(true);
      setCurrentFov(78); // Wide-angle lens for centered dash view
    } else {
      setIsInterior(false);
      setCurrentFov(45); // Standard lens for exterior
    }
  }, []);

  const handleResetHome = useCallback(() => {
    setIsInterior(false);
    setCurrentFov(45);
    cameraTargetRef.current = EXT_POS.clone();
    lookAtTargetRef.current = LOOK_EXT.clone();
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const t = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(t);
  }, [vehicleId]);

  useEffect(() => {
    if (isLoading) {
      setBarVisible(true); setBarWidth(0);
      const t = setTimeout(() => setBarWidth(78), 50);
      return () => clearTimeout(t);
    } else {
      setBarWidth(100);
      const t = setTimeout(() => setBarVisible(false), 700);
      return () => clearTimeout(t);
    }
  }, [isLoading]);

  return (
    <div
      className="relative w-full h-full"
      style={{ background: cfg.bgGradient }}
    >
      {isLoading && <LoadingOverlay />}

      {/* Progress bar */}
      {barVisible && (
        <div
          className="absolute top-0 left-0 right-0 z-30 h-[3px] pointer-events-none"
          style={{ opacity: barWidth >= 100 ? 0 : 1, transition: "opacity 0.5s ease 0.25s" }}
        >
          <div
            className="h-full bg-toyota-red"
            style={{ width: `${barWidth}%`, transition: "width 1s ease-out" }}
          />
        </div>
      )}

      {/* View toggle */}
      <button
        onClick={handleViewToggle}
        className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-black/10 bg-white/70 backdrop-blur-sm hover:bg-white/90 text-black/60 hover:text-black text-xs font-medium transition-all shadow-sm"
      >
        {viewMode === "exterior" ? (
          <><span>&#8594;</span><span>Vue Intérieure</span></>
        ) : (
          <><span>&#8592;</span><span>Vue Extérieure</span></>
        )}
      </button>

      {/* Reset camera / Home View Button */}
      {viewMode === "exterior" && (
        <button
          onClick={handleResetHome}
          title="Réinitialiser la caméra"
          className="absolute bottom-4 right-4 z-20 w-9 h-9 flex items-center justify-center rounded-full bg-white/70 border border-black/10 backdrop-blur-sm hover:bg-white/90 text-black/40 hover:text-black transition-all text-lg select-none shadow-sm"
        >
          &#8635;
        </button>
      )}

      {/* 3D Canvas */}
      <Canvas
        shadows
        camera={{ position: [10, 4, 12], fov: 40, near: 0.1, far: 100 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          logarithmicDepthBuffer: true,
        }}
        style={{
          background: "transparent",
          opacity: viewMode === "exterior" ? 1 : 0,
          transition: "opacity 0.3s ease",
          pointerEvents: viewMode === "exterior" ? "auto" : "none",
        }}
        onCreated={({ gl }) => {
          gl.toneMapping         = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = ENV_CONFIGS.studio.toneMappingExposure;
          gl.shadowMap.type      = THREE.PCFSoftShadowMap;
          setIsLoading(false);
        }}
      >
        <CameraController
          controlsRef={controlsRef}
          cameraTarget={cameraTargetRef}
          lookAtTarget={lookAtTargetRef}
          targetFov={currentFov}
        />

        {/* ─── Dynamic lighting — values driven by active environment ─── */}
        <EnvironmentManager exposure={cfg.toneMappingExposure} />
        <directionalLight
          position={[5, 10, 5]}
          intensity={cfg.keyIntensity}
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-camera-near={0.5}
          shadow-camera-far={30}
          shadow-camera-left={-6}
          shadow-camera-right={6}
          shadow-camera-top={6}
          shadow-camera-bottom={-6}
        />
        <directionalLight position={[-5, 5, -5]} intensity={cfg.fillIntensity} color={cfg.fillColor} />
        <ambientLight intensity={cfg.ambientIntensity} color={cfg.ambientColor} />
        <pointLight position={[0, -0.4, 0]} intensity={0.08} color="#c8a060" distance={5} />

        {/* Neon accent lights for Cyberpunk */}
        {envType === "cyber" && (
          <>
            <pointLight position={[-4.5, 2.5,  0]} intensity={2.5} color="#ff00cc" distance={9} />
            <pointLight position={[ 4.5, 2.5,  0]} intensity={2.5} color="#00ffee" distance={9} />
            <pointLight position={[ 0.0, 5.0, -3]} intensity={1.2} color="#8800ff" distance={8} />
          </>
        )}

        {/* Extra sun-fill for Street / Sunset */}
        {envType === "street" && (
          <directionalLight position={[8, 14, -5]} intensity={1.2} color="#fff8e0" />
        )}

        {/* HDR/preset environment — each key is stable so Canvas never remounts */}
        <Environment files="/hdr/studio_small_09_4k.hdr" background={false} />

        <StudioStage />

        {/* Car model */}
        <Suspense key={vehicleId} fallback={<CanvasLoader />}>
          <ModelErrorBoundary
            fallback={<CarModelFallback colorHex={colorHex} vehicleName={vehicleName} />}
          >
            <CarModel
              key={vehicleId}
              vehicleId={vehicleId}
              colorHex={colorHex}
              colorType={colorType}
              vehicleName={vehicleName}
              selectedWheelId={selectedWheelId}
              selectedInteriorId={selectedInteriorId}
              onHotspotClick={handleHotspotNavigation}
              hideHotspots={isSelectMenuOpen}
            />
          </ModelErrorBoundary>
        </Suspense>

        <ContactShadows
          position={[0, -0.01, 0]}
          opacity={0.55}
          scale={12}
          blur={1.5}
          far={3}
          samples={16}
          color="#000000"
        />

        <OrbitControls
          ref={controlsRef}
          enablePan={false}
          minDistance={isInterior ? 0.01 : 2.5}
          maxDistance={isInterior ? 1.5 : 12}
          minPolarAngle={isInterior ? 0 : 0.2}
          maxPolarAngle={isInterior ? Math.PI / 1.8 : Math.PI / 2.1}
          autoRotateSpeed={0.8}
          enableDamping
          dampingFactor={0.08}
        />

        <AutoRotate controlsRef={controlsRef} />
      </Canvas>

      {/* Exit Interior button — floats above the env switcher */}
      {isInterior && viewMode === "exterior" && (
        <button
          onClick={() => handleHotspotNavigation(new THREE.Vector3(4, 2, 4), new THREE.Vector3(0, 0.4, 0))}
          className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 px-4 py-2 bg-black/80 border border-red-600 rounded-full text-white text-xs tracking-wider uppercase font-bold hover:bg-red-600 transition-all duration-300 shadow-[0_0_15px_rgba(235,10,30,0.3)]"
        >
          Exit Interior
        </button>
      )}

      {/* ── Environment switcher ───────────────────────────────────────────── */}
      {viewMode === "exterior" && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 px-4 py-2 rounded-2xl bg-black/55 backdrop-blur-md border border-white/10 shadow-2xl">
          {(["studio", "street", "cyber"] as EnvType[]).map((key) => {
            const c      = ENV_CONFIGS[key];
            const active = envType === key;
            return (
              <button
                key={key}
                onClick={() => setEnvType(key)}
                title={c.label}
                className={`relative w-14 h-10 rounded-lg overflow-hidden flex-shrink-0 transition-all duration-300 ${
                  active
                    ? "ring-2 ring-[#eb0a1e] shadow-[0_0_10px_rgba(235,10,30,0.45)] scale-105"
                    : "ring-1 ring-white/10 opacity-60 hover:opacity-95 hover:ring-white/30 hover:scale-105"
                }`}
              >
                <div className="absolute inset-0" style={{ background: c.thumbGradient }} />
                <div className={`absolute bottom-0 left-0 right-0 py-[2px] text-[8px] font-bold tracking-wider uppercase text-center transition-colors ${
                  active ? "bg-[#eb0a1e] text-white" : "bg-black/65 text-white/55"
                }`}>
                  {c.label}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Interior photo gallery */}
      {viewMode === "interior" && (
        <InteriorGallery vehicleId={vehicleId} vehicleName={vehicleName} />
      )}
    </div>
  );
}