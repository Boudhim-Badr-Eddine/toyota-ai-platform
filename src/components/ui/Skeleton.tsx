import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-white/5",
        className
      )}
    />
  );
}

// ─── VehicleCard skeleton ─────────────────────────────────────────────────────

export function VehicleCardSkeleton() {
  return (
    <div className="bg-[#111111] border border-white/5 rounded-2xl overflow-hidden flex flex-col">
      {/* Image */}
      <Skeleton className="w-full aspect-[16/9]" />
      {/* Body */}
      <div className="p-5 flex-1 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24 rounded-full" />
          <Skeleton className="h-4 w-16 rounded-full" />
        </div>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex gap-3 mt-2">
          <Skeleton className="h-8 w-8 rounded-xl" />
          <Skeleton className="h-8 w-8 rounded-xl" />
          <Skeleton className="h-8 w-8 rounded-xl" />
        </div>
        <div className="mt-auto pt-3 border-t border-white/5 flex items-center justify-between">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-9 w-28 rounded-full" />
        </div>
      </div>
    </div>
  );
}

// ─── VehicleGrid skeleton ─────────────────────────────────────────────────────

export function VehicleGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <VehicleCardSkeleton key={i} />
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
