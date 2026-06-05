"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";

// ─── Inline SVG social icons (lucide-react v1 dropped brand icons) ─────────────

function IconInstagram({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconFacebook({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function IconYoutube({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
      <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconTwitterX({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

// ─── Data ──────────────────────────────────────────────────────────────────────

const MODELS_LINKS = [
  { href: "/vehicles/supra", label: "Toyota Supra" },
  { href: "/vehicles/rav4", label: "Toyota RAV4" },
  { href: "/vehicles/yaris", label: "Toyota Yaris" },
  { href: "/vehicles/landcruiser", label: "Land Cruiser" },
  { href: "/vehicles/chr", label: "Toyota C-HR" },
  { href: "/vehicles", label: "Voir tous les modèles →" },
];

const SERVICES_LINKS = [
  { href: null, label: "Conseiller IA" },
  { href: "/configurator", label: "Configurateur 3D" },
  { href: "/vehicles", label: "Catalogue complet" },
  { href: "/contact", label: "Essai routier" },
  { href: "/contact", label: "Contactez-nous" },
];

type SocialIcon = React.FC<{ className?: string }>;

const SOCIAL_LINKS: { href: string; icon: SocialIcon; label: string }[] = [
  { href: "https://www.instagram.com/toyotamaroc", icon: IconInstagram, label: "Instagram" },
  { href: "https://www.facebook.com/toyotamaroc", icon: IconFacebook, label: "Facebook" },
  { href: "https://www.youtube.com/toyotamaroc", icon: IconYoutube, label: "YouTube" },
  { href: "https://twitter.com/toyotamaroc", icon: IconTwitterX, label: "Twitter / X" },
];

// ─── Animation variant ─────────────────────────────────────────────────────────

const slideUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

// ─── Component ─────────────────────────────────────────────────────────────────

export function Footer() {
  return (
    <footer className="bg-[#080808] border-t border-white/5 mt-auto">
      <motion.div
        variants={slideUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        className="section-container py-16"
      >
        {/* ── Top section ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">

          {/* Brand column */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-1.5 mb-4 group" aria-label="Toyota — Accueil">
              <span className="text-toyota-red font-black text-2xl tracking-tight group-hover:opacity-90 transition-opacity">
                TOYOTA
              </span>
              <span className="text-white/30 font-light text-sm tracking-widest mt-0.5">AI</span>
            </Link>

            <p className="text-toyota-gold font-medium text-sm italic mb-4">
              &ldquo;Let&apos;s Go Places&rdquo;
            </p>

            <p className="text-toyota-muted text-sm leading-relaxed mb-6">
              Découvrez l&apos;avenir de l&apos;automobile avec notre plateforme IA. Configurez, consultez et réservez votre Toyota idéale.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-3">
              {SOCIAL_LINKS.map(({ href, icon: Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-xl bg-toyota-gray border border-toyota-border flex items-center justify-center text-toyota-muted hover:text-white hover:border-toyota-red/50 hover:bg-toyota-red/10 transition-all"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Modèles */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-5">
              Modèles
            </h3>
            <ul className="space-y-3">
              {MODELS_LINKS.map(({ href, label }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-toyota-muted hover:text-white text-sm transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-5">
              Services
            </h3>
            <ul className="space-y-3">
              {SERVICES_LINKS.map(({ href, label }) => (
                <li key={label}>
                  {href === null ? (
                    <button
                      onClick={() => window.dispatchEvent(new CustomEvent('openChatWidget'))}
                      className="text-toyota-muted hover:text-white text-sm transition-colors"
                    >
                      {label}
                    </button>
                  ) : (
                    <Link
                      href={href}
                      className="text-toyota-muted hover:text-white text-sm transition-colors"
                    >
                      {label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Légal */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-5">
              Légal
            </h3>
            <ul className="space-y-3">
              <li><Link href="/privacy" className="text-toyota-muted hover:text-white text-sm transition-colors">Confidentialité</Link></li>
              <li><Link href="/terms" className="text-toyota-muted hover:text-white text-sm transition-colors">Conditions Générales</Link></li>
              <li><Link href="/sitemap" className="text-toyota-muted hover:text-white text-sm transition-colors">Plan du site</Link></li>
              <li><Link href="/contact" className="text-toyota-muted hover:text-white text-sm transition-colors">Nous contacter</Link></li>
              <li>
                <a href="tel:+212522123456" className="text-toyota-muted hover:text-white text-sm transition-colors">
                  +212 5 22 12 34 56
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-toyota-muted/60 text-xs text-center sm:text-left">
            &copy; {new Date().getFullYear()} Toyota Maroc. Tous droits réservés.
          </p>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="text-toyota-muted/60 hover:text-toyota-muted text-xs transition-colors">
              Confidentialité
            </Link>
            <Link href="/terms" className="text-toyota-muted/60 hover:text-toyota-muted text-xs transition-colors">
              CGU
            </Link>
            <Link href="/sitemap" className="text-toyota-muted/60 hover:text-toyota-muted text-xs transition-colors">
              Plan du site
            </Link>
          </div>
        </div>
      </motion.div>
    </footer>
  );
}
