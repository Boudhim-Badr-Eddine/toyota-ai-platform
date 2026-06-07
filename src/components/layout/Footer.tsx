"use client";

import Link from "next/link";
import { Globe, Share2 } from "lucide-react";
import { toast } from "sonner";
import { ContactFooterLinks } from "@/components/layout/ContactInfo";

const FOOTER_LINKS = [
  { href: "/terms", label: "Mentions légales" },
  { href: "/privacy", label: "Politique de confidentialité" },
  { href: "/privacy", label: "Cookies" },
  { href: "/acheter", label: "Acheter / RDV" },
];

export function Footer() {
  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const title = "Toyota AI Experience Maroc";
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        /* user cancelled */
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Lien copié dans le presse-papier");
    }
  };

  return (
    <footer className="bg-[#0a0a0a] border-t border-white/[0.06] mt-auto">
      <div className="section-container py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <Link href="/" className="font-black text-lg tracking-tight text-white">
              TOYOTA
            </Link>
            <ContactFooterLinks />
            <p className="text-[11px] text-white/35 uppercase tracking-wider mt-2" suppressHydrationWarning>
              © 2026 Toyota Maroc. Performance légendaire.
            </p>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {FOOTER_LINKS.map(({ href, label }) => (
              <Link
                key={label}
                href={href}
                className="text-xs text-white/40 hover:text-white/70 uppercase tracking-wide transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/vehicles"
              className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/20 transition-colors"
              aria-label="Français"
              title="Français (Maroc)"
            >
              <Globe className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={() => void handleShare()}
              className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/20 transition-colors"
              aria-label="Partager"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
