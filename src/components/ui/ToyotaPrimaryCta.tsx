"use client";

import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { BorderDrawButton } from "./BorderDrawButton";

type ToyotaPrimaryCtaProps = {
  href: string;
  children: React.ReactNode;
  size?: "sm" | "md";
  showArrow?: boolean;
  className?: string;
  onClick?: () => void;
};

export function ToyotaPrimaryCta({
  href,
  children,
  size = "md",
  showArrow = true,
  className,
  onClick,
}: ToyotaPrimaryCtaProps) {
  return (
    <BorderDrawButton
      href={href}
      onClick={onClick}
      accent="red"
      className={cn(size === "sm" && "!px-5 !py-2.5 !text-xs", className)}
    >
      {children}
      {showArrow && (
        <ArrowRight className={cn("shrink-0", size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4")} />
      )}
    </BorderDrawButton>
  );
}
