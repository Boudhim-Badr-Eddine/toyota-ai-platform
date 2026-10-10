"use client";

import { Suspense, useRef, useEffect, useState, useCallback, useMemo, Component, type ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  ContactShadows,
  Grid,
  Bounds,
  useBounds,
  PerformanceMonitor,
} from "@react-three/drei";
import { CarModel, CarModelFallback } from "./CarModel";
import { DEFAULT_VEHICLE_ANIM } from "@/lib/vehicleHinges";
import { SHOWROOM } from "@/lib/showroomCamera";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";

const SCENE_BG = "#121218";
const SCENE_BG_TOP = "#1a1a24";

function CanvasLoader() {
  return (
    <mesh>
      <boxGeometry args={[0.1, 0.1, 0.1]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  );
}

function ShowroomBackdrop() {
  return (
    <mesh position={[0, 2.5, -6]} scale={[18, 10, 1]}>
      <planeGeometry />
      <meshBasicMaterial color={SCENE_BG_TOP} transparent opacity={0.35} depthWrite={false} />
    </mesh>
  );
}

function LoadingOverlay() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#121218]/90 backdrop-blur-sm z-10 pointer-events-none">
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

function CanvasResizeSync({ width, height }: { width: number; height: number }) {
  const { gl, camera, set, invalidate } = useThree();

  useEffect(() => {
    if (width <= 0 || height <= 0) return;
    const dpr = Math.min(window.devicePixelRatio, 1.75);
    gl.setPixelRatio(dpr);
    gl.setSize(width, height, false);
    const cam = camera as THREE.PerspectiveCamera;
    cam.clearViewOffset();
    cam.aspect = width / height;
    cam.updateProjectionMatrix();
    set({ size: { width, height, top: 0, left: 0 } });
    invalidate();
  }, [gl, camera, set, invalidate, width, height]);

  return null;
}

interface CameraFitProps {
  trigger: number;
  active: boolean;
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
}

function CameraFitHelper({ trigger, active, controlsRef }: CameraFitProps) {
  const bounds = useBounds();
  const { invalidate } = useThree();

  useEffect(() => {
    if (!active) return;
    bounds.refresh().clip().fit();

    const controls = controlsRef.current;
    if (controls) {
      controls.target.set(0, SHOWROOM.lookAtY, 0);
      controls.setAzimuthalAngle(SHOWROOM.defaultAzimuth);
      controls.setPolarAngle(SHOWROOM.defaultPolar);
      controls.minDistance = SHOWROOM.exterior.minDistance;
      controls.maxDistance = SHOWROOM.exterior.maxDistance;
      controls.update();
    }
    invalidate();
  }, [trigger, active, bounds, controlsRef, invalidate]);

  return null;
}

interface AutoRotateProps {
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
  enabled: boolean;
}

function DemandRenderLoop({ controlsRef, enabled }: AutoRotateProps) {
  const invalidate = useThree((s) => s.invalidate);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls || !enabled) return;

    const onChange = () => invalidate();
    controls.addEventListener("change", onChange);

    const startRotate = () => {
      if (controlsRef.current) controlsRef.current.autoRotate = true;
    };
    const resetTimer = () => {
      if (controlsRef.current) controlsRef.current.autoRotate = false;
      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(startRotate, 5000);
    };

    idleTimer.current = setTimeout(startRotate, 5000);
    window.addEventListener("pointerdown", resetTimer, { passive: true });
    window.addEventListener("wheel", resetTimer, { passive: true });

    return () => {
      controls.removeEventListener("change", onChange);
      if (idleTimer.current) clearTimeout(idleTimer.current);
      window.removeEventListener("pointerdown", resetTimer);
      window.removeEventListener("wheel", resetTimer);
    };
  }, [controlsRef, enabled, invalidate]);

  useFrame(() => {
    if (controlsRef.current?.autoRotate || controlsRef.current?.enableDamping) {
      invalidate();
    }
  });

  return null;
}

interface CameraAnimatorProps {
  targetPos: THREE.Vector3;
  targetFov: number;
  lookAt: THREE.Vector3;
}

function CameraAnimator({ targetPos, targetFov, lookAt }: CameraAnimatorProps) {
  const { camera, invalidate } = useThree();
  const animRef = useRef<number | null>(null);
  const startPos = useRef(new THREE.Vector3());
  const startFov = useRef(40);
  const tRef = useRef(0);

  useEffect(() => {
    startPos.current.copy(camera.position);
    startFov.current = (camera as THREE.PerspectiveCamera).fov ?? 40;
    tRef.current = 0;
    if (animRef.current) cancelAnimationFrame(animRef.current);

    const step = () => {
      tRef.current = Math.min(tRef.current + 0.045, 1);
      const e = 1 - Math.pow(1 - tRef.current, 3);
      camera.position.lerpVectors(startPos.current, targetPos, e);
      (camera as THREE.PerspectiveCamera).fov = startFov.current + (targetFov - startFov.current) * e;
      (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
      camera.lookAt(lookAt);
      invalidate();
      if (tRef.current < 1) animRef.current = requestAnimationFrame(step);
    };
    animRef.current = requestAnimationFrame(step);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [camera, targetPos, targetFov, lookAt, invalidate]);

  return null;
}

export interface CarSceneControls {
  toggleAllDoors: () => void;
  toggleHood: () => void;
  toggleViewMode: () => void;
  viewMode: "exterior" | "interior";
  showDoorControls: boolean;
  isReady: boolean;
}

interface CarSceneProps {
  vehicleId: string;
  colorHex: string;
  colorType?: string;
  vehicleName: string;
  selectedWheelId?: string;
  selectedInteriorId?: string;
  onSceneControlsReady?: (controls: CarSceneControls | null) => void;
}

export function CarScene({
  vehicleId,
  colorHex,
  colorType,
  vehicleName,
  selectedWheelId = "",
  selectedInteriorId = "",
  onSceneControlsReady,
}: CarSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const [fitTrigger, setFitTrigger] = useState(0);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const [dpr, setDpr] = useState(1.5);
  const [modelReady, setModelReady] = useState(false);
  const [viewMode, setViewMode] = useState<"exterior" | "interior">("exterior");
  const [barWidth, setBarWidth] = useState(0);
  const [barVisible, setBarVisible] = useState(false);
  const [vehicleAnim, setVehicleAnim] = useState(DEFAULT_VEHICLE_ANIM);

  const lookAt = useMemo(() => new THREE.Vector3(0, SHOWROOM.lookAtY, 0), []);
  const interiorPos = useMemo(
    () => new THREE.Vector3(...SHOWROOM.interior.cameraPos),
    []
  );

  const isLoading = !modelReady;

  const fitExteriorView = useCallback(() => {
    const controls = controlsRef.current;
    if (controls) {
      controls.target.copy(lookAt);
      controls.enablePan = true;
      controls.screenSpacePanning = true;
      controls.minDistance = SHOWROOM.exterior.minDistance;
      controls.maxDistance = SHOWROOM.exterior.maxDistance;
      controls.setAzimuthalAngle(SHOWROOM.defaultAzimuth);
      controls.setPolarAngle(SHOWROOM.defaultPolar);
      controls.update();
    }
    setFitTrigger((n) => n + 1);
  }, [lookAt]);

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
    const raf = requestAnimationFrame(measureViewport);

    return () => {
      cancelAnimationFrame(raf);
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
    if (!modelReady || viewMode !== "exterior") return;
    const t = setTimeout(() => fitExteriorView(), 80);
    return () => clearTimeout(t);
  }, [modelReady, vehicleId, viewMode, fitExteriorView]);

  /** Re-frame when the viewport container resizes (e.g. config panel open/close). */
  useEffect(() => {
    if (!modelReady || viewMode !== "exterior" || viewport.width <= 0) return;
    const t = setTimeout(() => fitExteriorView(), 360);
    return () => clearTimeout(t);
  }, [viewport.width, viewport.height, modelReady, viewMode, fitExteriorView]);

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
    const controls = controlsRef.current;
    if (!controls) return;

    if (next === "interior") {
      controls.enablePan = true;
      controls.minDistance = SHOWROOM.interior.minDistance;
      controls.maxDistance = SHOWROOM.interior.maxDistance;
      controls.autoRotate = false;
    } else {
      controls.enablePan = true;
      controls.screenSpacePanning = true;
      controls.minDistance = SHOWROOM.exterior.minDistance;
      controls.maxDistance = SHOWROOM.exterior.maxDistance;
      setTimeout(() => fitExteriorView(), 50);
    }
  }, [viewMode, fitExteriorView]);

  useEffect(() => {
    onSceneControlsReady?.({
      toggleAllDoors,
      toggleHood,
      toggleViewMode: handleViewToggle,
      viewMode,
      showDoorControls: !isLoading && viewMode === "exterior",
      isReady: !isLoading,
    });
    return () => onSceneControlsReady?.(null);
  }, [onSceneControlsReady, toggleAllDoors, toggleHood, handleViewToggle, isLoading, viewMode]);

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

  return (
    <div ref={containerRef} className="absolute inset-0 bg-[#121218]">
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

      {!onSceneControlsReady && (
        <button
          type="button"
          onClick={handleViewToggle}
          className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/15 bg-black/50 backdrop-blur-sm hover:bg-white/10 hover:border-white/30 text-white/70 hover:text-white text-xs font-medium transition-all"
        >
          {viewMode === "exterior" ? (
            <>
              <span>&#8594;</span>
              <span>Vue Intérieure</span>
            </>
          ) : (
            <>
              <span>&#8592;</span>
              <span>Vue Extérieure</span>
            </>
          )}
        </button>
      )}

      <button
        type="button"
        onClick={() => fitExteriorView()}
        title="Réinitialiser la caméra"
        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-9 h-9 flex items-center justify-center rounded-full bg-black/50 border border-white/15 backdrop-blur-sm hover:bg-white/10 hover:border-white/30 text-white/55 hover:text-white transition-all text-lg font-bold select-none"
      >
        &#8635;
      </button>

      <div
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          background:
            "radial-gradient(ellipse at 50% 48%, transparent 32%, rgba(0,0,0,0.42) 100%)",
        }}
      />

      {viewMode === "interior" && (
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.6) 100%)",
          }}
        />
      )}

      <Canvas
        dpr={dpr}
        frameloop="demand"
        performance={{ min: 0.5, max: 1, debounce: 200 }}
        className="absolute inset-0 touch-none"
        resize={{ scroll: false, debounce: { scroll: 0, resize: 0 } }}
        camera={{
          position: [4.2, 1.5, 5.2],
          fov: SHOWROOM.exterior.fov,
          near: 0.05,
          far: 120,
        }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
          stencil: false,
        }}
        style={{
          width: viewport.width > 0 ? viewport.width : "100%",
          height: viewport.height > 0 ? viewport.height : "100%",
          display: "block",
          background: SCENE_BG,
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(SCENE_BG, 1);
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.18;
        }}
      >
        <PerformanceMonitor
          onDecline={() => setDpr(1)}
          onIncline={() => setDpr(Math.min(1.75, window.devicePixelRatio))}
        />

        {viewport.width > 0 && viewport.height > 0 && (
          <CanvasResizeSync width={viewport.width} height={viewport.height} />
        )}

        <color attach="background" args={[SCENE_BG]} />

        {viewMode === "interior" && (
          <CameraAnimator
            targetPos={interiorPos}
            targetFov={SHOWROOM.interior.fov}
            lookAt={lookAt}
          />
        )}

        <ambientLight intensity={0.55} />
        <directionalLight position={[6, 10, 5]} intensity={1.35} color="#fff9f2" castShadow={false} />
        <directionalLight position={[-5, 3, -3]} intensity={0.55} color="#a8c4ff" />
        <spotLight
          position={[-4, 6, -5]}
          angle={0.45}
          penumbra={0.8}
          intensity={0.65}
          color="#ffffff"
          distance={22}
        />
        <hemisphereLight args={["#f0f0f5", "#181820", 0.42]} />

        <ShowroomBackdrop />

        <Suspense fallback={null}>
          <Environment preset="studio" background={false} blur={0.35} environmentIntensity={1.15} />
        </Suspense>

        <Suspense key={vehicleId} fallback={<CanvasLoader />}>
          <ModelErrorBoundary fallback={<CarModelFallback colorHex={colorHex} vehicleName={vehicleName} />}>
            <Bounds fit clip margin={SHOWROOM.boundsMargin} maxDuration={0.35}>
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
              <CameraFitHelper
                trigger={fitTrigger}
                active={viewMode === "exterior"}
                controlsRef={controlsRef}
              />
            </Bounds>
          </ModelErrorBoundary>
        </Suspense>

        <Grid
          position={[0, -0.01, 0]}
          args={[16, 16]}
          cellSize={0.75}
          cellThickness={0.35}
          cellColor="#2a2a32"
          sectionSize={3}
          sectionThickness={0.7}
          sectionColor="#353540"
          fadeDistance={18}
          fadeStrength={1.1}
          infiniteGrid
        />

        <ContactShadows
          position={[0, -0.01, 0]}
          opacity={0.52}
          scale={9}
          blur={2.2}
          far={3}
          frames={1}
          resolution={512}
          color="#000000"
        />

        <OrbitControls
          ref={controlsRef}
          target={lookAt}
          enablePan
          screenSpacePanning
          panSpeed={SHOWROOM.panSpeed}
          minDistance={viewMode === "interior" ? SHOWROOM.interior.minDistance : SHOWROOM.exterior.minDistance}
          maxDistance={viewMode === "interior" ? SHOWROOM.interior.maxDistance : SHOWROOM.exterior.maxDistance}
          minPolarAngle={SHOWROOM.exterior.minPolar}
          maxPolarAngle={SHOWROOM.exterior.maxPolar}
          autoRotateSpeed={SHOWROOM.autoRotateSpeed}
          rotateSpeed={SHOWROOM.rotateSpeed}
          enableDamping
          dampingFactor={SHOWROOM.dampingFactor}
          makeDefault
        />

        <DemandRenderLoop controlsRef={controlsRef} enabled={viewMode === "exterior"} />
      </Canvas>
    </div>
  );
}
