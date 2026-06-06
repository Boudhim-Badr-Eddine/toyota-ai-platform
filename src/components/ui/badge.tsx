import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-toyota-red/30 bg-toyota-red/10 text-toyota-red",
        secondary: "border-white/10 bg-white/5 text-toyota-muted",
        success: "border-green-500/30 bg-green-500/10 text-green-400",
        gold: "border-toyota-gold/30 bg-toyota-gold/10 text-toyota-gold",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
