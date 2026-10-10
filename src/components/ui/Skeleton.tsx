import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-md bg-white/[0.04] animate-shimmer",
        className
      )}
    />
  );
}

// ─── VehicleCard skeleton ─────────────────────────────────────────────────────

export function VehicleCardSkeleton({ delay = 0 }: { delay?: number }) {
  return (
    <div
      className="bg-[#111111] border border-white/[0.06] rounded-none overflow-hidden flex flex-col"
      style={{ animationDelay: `${delay}ms` }}
    >
      <Skeleton className="w-full h-[220px] md:h-[240px] rounded-none" />
      <div className="p-5 flex-1 flex flex-col gap-3">
        <Skeleton className="h-7 w-3/4 rounded-lg" />
        <Skeleton className="h-6 w-32 rounded-lg" />
        <div className="flex gap-4">
          <Skeleton className="h-3 w-16 rounded-full" />
          <Skeleton className="h-3 w-16 rounded-full" />
          <Skeleton className="h-3 w-20 rounded-full" />
        </div>
        <div className="mt-auto flex gap-2.5 pt-2">
          <Skeleton className="h-10 flex-1 rounded-full" />
          <Skeleton className="h-10 flex-1 rounded-full" />
        </div>
      </div>
    </div>
  );
}

// ─── VehicleGrid skeleton ─────────────────────────────────────────────────────

export function VehicleGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={i === 0 ? "md:col-span-2 lg:col-span-2" : undefined}>
          <VehicleCardSkeleton delay={i * 80} />
        </div>
      ))}
    </div>
  );
}

// ─── Vehicle detail skeleton ──────────────────────────────────────────────────

export function VehicleDetailSkeleton() {
  return (
    <div className="min-h-screen bg-toyota-dark">
      {/* Hero */}
      <Skeleton className="w-full h-[65vh]" />
      <div className="section-container py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-4/5" />
            <div className="grid grid-cols-3 gap-4 mt-4">
              {[1,2,3].map(i => <Skeleton key={i} className="h-20 rounded-2xl" />)}
            </div>
          </div>
          {/* Sidebar */}
          <div className="space-y-4">
            <Skeleton className="h-48 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Chat typing dots ─────────────────────────────────────────────────────────

export function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3 bg-[#1A1A1A] rounded-2xl rounded-tl-sm w-fit">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-toyota-muted/40 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s`, animationDuration: "0.8s" }}
        />
      ))}
    </div>
  );
}

// ─── Configurator loading bar ─────────────────────────────────────────────────

export function ConfiguratorLoadingBar({ label = "Chargement du modèle 3D…" }: { label?: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-toyota-dark z-20 gap-4">
      <div className="w-48 h-1 rounded-full bg-white/5 overflow-hidden">
        <div className="h-full bg-toyota-red rounded-full animate-[loading_1.5s_ease-in-out_infinite]" />
      </div>
      <p className="text-toyota-muted text-sm">{label}</p>
    </div>
  );
}
