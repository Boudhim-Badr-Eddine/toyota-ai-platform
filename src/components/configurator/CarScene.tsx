"use client";

import { Suspense, useRef, useEffect, useState, useCallback, Component, type ReactNode } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, Grid, Bounds, useBounds } from "@react-three/drei";
import { CarModel, CarModelFallback } from "./CarModel";
import { DEFAULT_VEHICLE_ANIM } from "@/lib/vehicleHinges";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";

const SCENE_BG = "#0A0A0A";

function CanvasLoader() {
  return (
    <mesh>
      <boxGeometry args={[0.1, 0.1, 0.1]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  );
}

function LoadingOverlay() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#0A0A0A]/90 backdrop-blur-sm z-10 pointer-events-none">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-2 border-white/5" />
        <div className="absolute inset-0 rounded-full border-2 border-t-toyota-red animate-spin" />
      </div>
      <p className="text-toyota-muted text-sm font-medium tracking-wide">Chargement du modèle 3D…</p>
    </div>
  );
}

interface ErrorBoundaryState {
  hasError: boolean;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

class ModelErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

/** Keeps R3F drawing buffer in sync when the flex layout settles. */
function CanvasResizeSync({ width, height }: { width: number; height: number }) {
  const { gl, set, invalidate } = useThree();

  useEffect(() => {
    if (width <= 0 || height <= 0) return;
    const dpr = Math.min(window.devicePixelRatio, 2);
    gl.setPixelRatio(dpr);
    gl.setSize(width, height, false);
    set({ size: { width, height, top: 0, left: 0 } });
    invalidate();
  }, [gl, set, invalidate, width, height]);

  return null;
}

interface AutoRotateProps {
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
}

function AutoRotate({ controlsRef }: AutoRotateProps) {
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const startRotate = () => {
      controls.autoRotate = true;
    };

    const resetTimer = () => {
      controls.autoRotate = false;
      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(startRotate, 4000);
    };

    idleTimer.current = setTimeout(startRotate, 4000);
    window.addEventListener("mousemove", resetTimer, { passive: true });
    window.addEventListener("touchstart", resetTimer, { passive: true });

    return () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("touchstart", resetTimer);
    };
  }, [controlsRef]);

  return null;
}

interface CameraAnimatorProps {
  targetPos: THREE.Vector3;
  targetFov: number;
  lookAt: THREE.Vector3;
}

function CameraAnimator({ targetPos, targetFov, lookAt }: CameraAnimatorProps) {
  const { camera } = useThree();
  const animRef = useRef<number | null>(null);
  const startPos = useRef<THREE.Vector3>(camera.position.clone());
  const startFov = useRef<number>((camera as THREE.PerspectiveCamera).fov ?? 40);
  const tRef = useRef(0);

  useEffect(() => {
    startPos.current = camera.position.clone();
    startFov.current = (camera as THREE.PerspectiveCamera).fov ?? 40;
    tRef.current = 0;
    if (animRef.current) cancelAnimationFrame(animRef.current);

    const step = () => {
      tRef.current = Math.min(tRef.current + 0.04, 1);
      const e = 1 - Math.pow(1 - tRef.current, 3);
      camera.position.lerpVectors(startPos.current, targetPos, e);
      (camera as THREE.PerspectiveCamera).fov = startFov.current + (targetFov - startFov.current) * e;
      (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
      camera.lookAt(lookAt);
      if (tRef.current < 1) animRef.current = requestAnimationFrame(step);
    };
    animRef.current = requestAnimationFrame(step);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [camera, targetPos, targetFov, lookAt]);

  return null;
}

function CameraFitHelper({ trigger, active }: { trigger: number; active: boolean }) {
  const bounds = useBounds();

  useEffect(() => {
    if (!active) return;
    bounds.refresh().clip().fit();
  }, [trigger, active, bounds]);

  return null;
}

interface CarSceneProps {
  vehicleId: string;
  colorHex: string;
  colorType?: string;
  vehicleName: string;
  selectedWheelId?: string;
  selectedInteriorId?: string;
}

export function CarScene({
  vehicleId,
  colorHex,
  colorType,
  vehicleName,
  selectedWheelId = "",
  selectedInteriorId = "",
}: CarSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const [fitTrigger, setFitTrigger] = useState(0);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const [modelReady, setModelReady] = useState(false);
  const [viewMode, setViewMode] = useState<"exterior" | "interior">("exterior");
  const [barWidth, setBarWidth] = useState(0);
  const [barVisible, setBarVisible] = useState(false);
  const [vehicleAnim, setVehicleAnim] = useState(DEFAULT_VEHICLE_ANIM);

  const INTERIOR_POS = new THREE.Vector3(0, 0.9, 0.35);
  const LOOK_AT = new THREE.Vector3(0, 0.85, 0);
  const INTERIOR_FOV = 68;

  const [interiorCamera, setInteriorCamera] = useState(false);

  const fitExteriorView = useCallback(() => {
    const controls = controlsRef.current;
    if (controls) {
      controls.target.set(LOOK_AT.x, LOOK_AT.y, LOOK_AT.z);
      controls.enablePan = false;
      controls.minDistance = 1.4;
      controls.maxDistance = 7;
      controls.update();
    }
    setFitTrigger((n) => n + 1);
  }, []);

  const isLoading = !modelReady;

  useEffect(() => {
    if (modelReady && viewMode === "exterior") {
      const t = setTimeout(() => fitExteriorView(), 80);
      return () => clearTimeout(t);
    }
  }, [modelReady, vehicleId, viewMode, fitExteriorView]);

  const measureViewport = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    const w = Math.round(width);
    const h = Math.round(height);
    if (w > 0 && h > 0) setViewport({ width: w, height: h });
  }, []);

  useEffect(() => {
    measureViewport();
    const el = containerRef.current;
    if (!el) return;

    const ro = new ResizeObserver(() => measureViewport());
    ro.observe(el);
    window.addEventListener("resize", measureViewport);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measureViewport);
    };
  }, [measureViewport]);

  useEffect(() => {
    setModelReady(false);
    setVehicleAnim(DEFAULT_VEHICLE_ANIM);
    const fallbackTimer = setTimeout(() => setModelReady(true), 12000);
    return () => clearTimeout(fallbackTimer);
  }, [vehicleId]);

  useEffect(() => {
    if (isLoading) {
      setBarVisible(true);
      setBarWidth(0);
      const t = setTimeout(() => setBarWidth(78), 50);
      return () => clearTimeout(t);
    }
    setBarWidth(100);
    const t = setTimeout(() => setBarVisible(false), 700);
    return () => clearTimeout(t);
  }, [isLoading]);

  const toggleAllDoors = useCallback(() => {
    setVehicleAnim((prev) => {
      const allOpen = Object.values(prev.doors).every(Boolean);
      return {
        ...prev,
        doors: { FL: !allOpen, FR: !allOpen, RL: !allOpen, RR: !allOpen },
      };
    });
  }, []);

  const toggleHood = useCallback(() => {
    setVehicleAnim((prev) => ({ ...prev, hood: !prev.hood }));
  }, []);

  const handleViewToggle = useCallback(() => {
    const next = viewMode === "exterior" ? "interior" : "exterior";
    setViewMode(next);
    if (next === "interior") {
      setInteriorCamera(true);
      if (controlsRef.current) {
        controlsRef.current.enablePan = true;
        controlsRef.current.minDistance = 0.15;
        controlsRef.current.maxDistance = 2.5;
        controlsRef.current.autoRotate = false;
      }
    } else {
      setInteriorCamera(false);
      if (controlsRef.current) {
        controlsRef.current.enablePan = false;
        controlsRef.current.minDistance = 1.4;
        controlsRef.current.maxDistance = 7;
      }
      setTimeout(() => fitExteriorView(), 50);
    }
  }, [viewMode, fitExteriorView]);

  const canvasReady = viewport.width > 0 && viewport.height > 0;

  return (
    <div ref={containerRef} className="absolute inset-0 bg-[#0A0A0A]">
      {isLoading && <LoadingOverlay />}

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

      <button
        type="button"
        onClick={handleViewToggle}
        className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/15 bg-black/50 backdrop-blur-sm hover:bg-white/10 hover:border-white/30 text-white/70 hover:text-white text-xs font-medium transition-all"
      >
        {viewMode === "exterior" ? (
          <>
            <span>&#8594;</span>
            <span>Vue Interieure</span>
          </>
        ) : (
          <>
            <span>&#8592;</span>
            <span>Vue Exterieure</span>
          </>
        )}
      </button>

      {!isLoading && viewMode === "exterior" && (
        <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
          <button
            type="button"
            onClick={toggleAllDoors}
            className="px-3 py-1.5 rounded-lg border border-white/15 bg-black/50 backdrop-blur-sm hover:bg-white/10 hover:border-white/30 text-white/70 hover:text-white text-xs font-medium transition-all"
          >
            Portes
          </button>
          <button
            type="button"
            onClick={toggleHood}
            className="px-3 py-1.5 rounded-lg border border-white/15 bg-black/50 backdrop-blur-sm hover:bg-white/10 hover:border-white/30 text-white/70 hover:text-white text-xs font-medium transition-all"
          >
            Capot
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={() => fitExteriorView()}
        title="Reinitialiser la camera"
        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-9 h-9 flex items-center justify-center rounded-full bg-black/50 border border-white/15 backdrop-blur-sm hover:bg-white/10 hover:border-white/30 text-white/55 hover:text-white transition-all text-lg font-bold select-none"
      >
        &#8635;
      </button>

      {viewMode === "interior" && (
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.6) 100%)",
          }}
        />
      )}

      {canvasReady && (
        <Canvas
          shadows
          dpr={[1, 2]}
          frameloop="always"
          resize={{ scroll: false, debounce: { scroll: 0, resize: 0 } }}
          camera={{ position: [3.8, 1.6, 4.6], fov: 36, near: 0.05, far: 200 }}
          gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
          style={{ width: viewport.width, height: viewport.height, display: "block", background: SCENE_BG }}
          onCreated={({ gl }) => {
            gl.setClearColor(SCENE_BG, 1);
          }}
        >
          <CanvasResizeSync width={viewport.width} height={viewport.height} />
          <color attach="background" args={[SCENE_BG]} />

          {interiorCamera && (
            <CameraAnimator
              targetPos={INTERIOR_POS}
              targetFov={INTERIOR_FOV}
              lookAt={LOOK_AT}
            />
          )}

          <ambientLight intensity={0.55} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1.2}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-camera-far={50}
            shadow-camera-left={-10}
            shadow-camera-right={10}
            shadow-camera-top={10}
            shadow-camera-bottom={-10}
          />
          <directionalLight position={[-5, 5, -5]} intensity={0.45} color="#4488ff" />
          <spotLight position={[0, 10, 0]} intensity={0.5} angle={0.3} />

          <Suspense fallback={null}>
            <Environment preset="city" background={false} />
          </Suspense>

          <Suspense key={vehicleId} fallback={<CanvasLoader />}>
            <ModelErrorBoundary
              fallback={<CarModelFallback colorHex={colorHex} vehicleName={vehicleName} />}
            >
              <Bounds fit clip observe margin={1.05} maxDuration={0.45}>
                <CarModel
                  key={vehicleId}
                  vehicleId={vehicleId}
                  colorHex={colorHex}
                  colorType={colorType}
                  vehicleName={vehicleName}
                  selectedWheelId={selectedWheelId}
                  selectedInteriorId={selectedInteriorId}
                  vehicleAnim={vehicleAnim}
                  onLoaded={() => setModelReady(true)}
                />
                <CameraFitHelper trigger={fitTrigger} active={viewMode === "exterior"} />
              </Bounds>
            </ModelErrorBoundary>
          </Suspense>

          <Grid
            position={[0, -0.01, 0]}
            args={[20, 20]}
            cellSize={0.6}
            cellThickness={0.5}
            cellColor="#2a2a2a"
            sectionSize={3}
            sectionThickness={1}
            sectionColor="#333333"
            fadeDistance={28}
            fadeStrength={1.5}
            infiniteGrid
          />

          <ContactShadows
            position={[0, -0.01, 0]}
            opacity={0.55}
            scale={10}
            blur={2.2}
            far={3.5}
            color="#000000"
          />

          <OrbitControls
            ref={controlsRef}
            target={LOOK_AT}
            enablePan={false}
            minDistance={1.4}
            maxDistance={7}
            minPolarAngle={0.25}
            maxPolarAngle={Math.PI / 2.05}
            autoRotateSpeed={0.65}
            enableDamping
            dampingFactor={0.08}
          />

          <AutoRotate controlsRef={controlsRef} />
        </Canvas>
      )}
    </div>
  );
}
