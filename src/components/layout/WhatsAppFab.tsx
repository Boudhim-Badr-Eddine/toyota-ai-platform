"use client";

import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const WHATSAPP_NUMBER = "212522000000";
const DEFAULT_MESSAGE = encodeURIComponent(
  "Bonjour Toyota Maroc, je souhaite obtenir des informations sur vos véhicules."
);

export function WhatsAppFab({ className }: { className?: string }) {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${DEFAULT_MESSAGE}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contacter Toyota Maroc sur WhatsApp"
      className={cn(
        "fixed z-40 flex h-14 w-14 items-center justify-center rounded-full",
        "bg-[#25D366] text-white shadow-lg shadow-[#25D366]/30",
        "transition-transform hover:scale-105 active:scale-95",
        "bottom-[calc(4.5rem+env(safe-area-inset-bottom))] right-4",
        "lg:hidden",
        className
      )}
    >
      <MessageCircle className="h-7 w-7" fill="currentColor" strokeWidth={0} />
    </a>
  );
}
