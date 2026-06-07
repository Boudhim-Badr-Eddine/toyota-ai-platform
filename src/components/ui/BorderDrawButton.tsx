"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { MOTION_GPU_CLASS } from "@/lib/motion";

type BorderDrawButtonBaseProps = {
  children: React.ReactNode;
  className?: string;
  accent?: "white" | "red";
};

type BorderDrawButtonAsLink = BorderDrawButtonBaseProps & {
  href: string;
  onClick?: () => void;
  type?: never;
  disabled?: never;
};

type BorderDrawButtonAsButton = BorderDrawButtonBaseProps & {
  href?: never;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
};

export type BorderDrawButtonProps = BorderDrawButtonAsLink | BorderDrawButtonAsButton;

export function BorderDrawButton(props: BorderDrawButtonProps) {
  const { children, className, accent = "white" } = props;
  const [hovered, setHovered] = useState(false);
  const isRed = accent === "red";
  const lineClass = isRed ? "bg-[#EB0A1E]" : "bg-white/70";

  const sharedClass = cn(
    MOTION_GPU_CLASS,
    "relative inline-flex items-center gap-3 px-8 py-4 backdrop-blur-md font-semibold text-sm tracking-wide transition-colors duration-300",
    isRed
      ? "bg-[#EB0A1E]/[0.08] text-[#EB0A1E] hover:bg-[#EB0A1E]/[0.14]"
      : "bg-white/[0.06] text-white hover:bg-white/[0.09]",
    className
  );

  const borderLines = (
    <>
      <motion.span
        className={cn("absolute top-0 left-0 h-px w-full origin-left", lineClass)}
        initial={false}
        animate={{ scaleX: hovered ? 1 : 0 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
      />
      <motion.span
        className={cn("absolute top-0 right-0 w-px h-full origin-top", lineClass)}
        initial={false}
        animate={{ scaleY: hovered ? 1 : 0 }}
        transition={{ duration: 0.22, delay: hovered ? 0.18 : 0, ease: "easeOut" }}
      />
      <motion.span
        className={cn("absolute bottom-0 right-0 h-px w-full origin-right", lineClass)}
        initial={false}
        animate={{ scaleX: hovered ? 1 : 0 }}
        transition={{ duration: 0.22, delay: hovered ? 0.36 : 0, ease: "easeOut" }}
      />
      <motion.span
        className={cn("absolute bottom-0 left-0 w-px h-full origin-bottom", lineClass)}
        initial={false}
        animate={{ scaleY: hovered ? 1 : 0 }}
        transition={{ duration: 0.22, delay: hovered ? 0.54 : 0, ease: "easeOut" }}
      />
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
    </>
  );

  if ("href" in props && props.href) {
    const { href, onClick } = props;
    const isExternal = /^https?:\/\//i.test(href) || href.startsWith("mailto:") || href.startsWith("tel:");
    const linkProps = {
      onClick,
      onMouseEnter: () => setHovered(true),
      onMouseLeave: () => setHovered(false),
      className: sharedClass,
    };

    if (isExternal) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" {...linkProps}>
          {borderLines}
        </a>
      );
    }

    return (
      <Link href={href} {...linkProps}>
        {borderLines}
      </Link>
    );
  }

  const { onClick, type = "button", disabled = false } = props;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => !disabled && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(sharedClass, disabled && "opacity-50 pointer-events-none")}
    >
      {borderLines}
    </button>
  );
}
