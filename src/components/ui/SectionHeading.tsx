import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div className={cn(align === "center" && "text-center", className)}>
      {eyebrow && (
        <p className="text-toyota-red text-[10px] font-bold uppercase tracking-[0.35em] mb-3">
          {eyebrow}
        </p>
      )}
      <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white tracking-tight uppercase">
        {title}
      </h2>
      <div
        className={cn(
          "h-0.5 w-12 bg-toyota-red mt-4",
          align === "center" && "mx-auto"
        )}
      />
      {subtitle && (
        <div
          className={cn(
            "text-toyota-muted text-sm md:text-base mt-4 max-w-2xl leading-relaxed",
            align === "center" && "mx-auto"
          )}
        >
          {subtitle}
        </div>
      )}
    </div>
  );
}
