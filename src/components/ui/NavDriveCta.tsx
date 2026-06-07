"use client";

import { ArrowRight } from "lucide-react";
import { BorderDrawButton } from "@/components/ui/BorderDrawButton";
import { cn } from "@/lib/utils";

type NavDriveCtaProps = {
  href: string;
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
};

export function NavDriveCta({
  href,
  children = "Essai routier",
  className,
  onClick,
}: NavDriveCtaProps) {
  return (
    <BorderDrawButton
      href={href}
      onClick={onClick}
      accent="red"
      className={cn(
        "!px-4 !py-2.5 !text-[11px] !font-bold !uppercase !tracking-[0.14em] !gap-2 justify-center",
        className
      )}
    >
      {children}
      <ArrowRight className="h-3.5 w-3.5 shrink-0" />
    </BorderDrawButton>
  );
}
