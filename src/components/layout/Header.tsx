"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Bot, User, ChevronDown, ChevronRight, Settings2 } from "lucide-react";
import { VEHICLES_DATA } from "@/data/vehicles";
import { cn } from "@/lib/utils";

// ─── Nav structure ─────────────────────────────────────────────────────────────

type NavItem = {
  label: string;
  href: string;
  hasMega?: boolean;
};

const TOP_NAV: NavItem[] = [
  { href: "/vehicles", label: "Véhicules", hasMega: true },
  { href: "/configurator", label: "Configurateur" },
];

// ─── Header component ──────────────────────────────────────────────────────────

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const megaRef = useRef<HTMLDivElement>(null);

  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMenuOpen(false);
    setMegaOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (megaRef.current && !megaRef.current.contains(e.target as Node)) {
        setMegaOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const light = scrolled || !isHome;

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        light ? "bg-white shadow-sm shadow-black/8" : "bg-transparent"
      )}
    >
      <div className="section-container">
        <div className="flex items-center justify-between h-16 lg:h-20">

          {/* ── Logo ─────────────────────────────────────────────────────────── */}
          <Link href="/" className="flex items-center gap-2.5 select-none" aria-label="Toyota — Accueil">
            <div className="w-9 h-9 bg-toyota-red flex items-center justify-center rounded shrink-0">
              <span className="text-white font-black text-[11px] tracking-widest leading-none select-none">T</span>
            </div>
            <span className={cn(
              "font-black text-xl tracking-tight transition-colors duration-300",
              light ? "text-gray-900" : "text-white"
            )}>
              TOYOTA
            </span>
          </Link>

          {/* ── Desktop nav ──────────────────────────────────────────────────── */}
          <nav
            ref={megaRef}
            className="hidden md:flex items-center gap-1 relative"
            aria-label="Navigation principale"
          >
            {TOP_NAV.map(({ href, label, hasMega }) => {
              const active = pathname === href || (href !== "/" && pathname.startsWith(href));
              const textClass = light
                ? active ? "text-toyota-red" : "text-gray-700 hover:text-toyota-red"
                : active ? "text-white" : "text-white/80 hover:text-white";

              if (hasMega) {
                return (
                  <button
                    key={label}
                    onClick={() => setMegaOpen((v) => !v)}
                    className={cn(
                      "flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-semibold transition-colors",
                      textClass
                    )}
                  >
                    {label}
                    <ChevronDown className={cn(
                      "h-3.5 w-3.5 transition-transform duration-200",
                      megaOpen && "rotate-180"
                    )} />
                  </button>
                );
              }

              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-semibold transition-colors",
                    textClass
                  )}
                >
                  {label}
                </Link>
              );
            })}

            {/* ── Véhicules mega-menu ─────────────────────────────────────── */}
            <AnimatePresence>
              {megaOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-185 bg-white rounded-2xl shadow-2xl shadow-black/15 border border-gray-100 overflow-hidden"
                >
                  <div className="p-6">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">
                      Notre Gamme — 10 Modèles
                    </p>
                    <div className="grid grid-cols-5 gap-3">
                      {VEHICLES_DATA.map((v) => (
                        <Link
                          key={v.id}
                          href={"/vehicles/" + v.id}
                          onClick={() => setMegaOpen(false)}
                          className="group flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-gray-50 transition-colors text-center"
                        >
                          <div className="relative w-full h-14 rounded-lg overflow-hidden bg-gray-100">
                            {v.imageUrl && (
                              <Image
                                src={v.imageUrl}
                                alt={v.name}
                                fill
                                className="object-cover group-hover:scale-[1.06] transition-transform duration-300"
                                sizes="120px"
                              />
                            )}
                          </div>
                          <p className="text-gray-800 text-[11px] font-semibold leading-tight group-hover:text-toyota-red transition-colors">
                            {v.name.replace("Toyota ", "")}
                          </p>
                          <p className="text-gray-400 text-[10px] leading-none">{v.category}</p>
                        </Link>
                      ))}
                    </div>

                    {/* Footer row */}
                    <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                      <Link
                        href="/vehicles"
                        onClick={() => setMegaOpen(false)}
                        className="flex items-center gap-1 text-sm font-semibold text-toyota-red hover:underline underline-offset-2"
                      >
                        Voir tous les véhicules
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                      <div className="flex gap-2">
                        <Link
                          href="/configurator"
                          onClick={() => setMegaOpen(false)}
                          className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <Settings2 className="h-3 w-3" />
                          Configurateur
                        </Link>
                        <button
                          onClick={() => { setMegaOpen(false); window.dispatchEvent(new CustomEvent('openChatWidget')) }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-toyota-red text-white text-xs font-bold rounded-lg hover:bg-toyota-red/90 transition-colors"
                        >
                          <Bot className="h-3 w-3" />
                          Aide IA
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </nav>

          {/* ── Right actions ─────────────────────────────────────────────────── */}
          <div className="flex items-center gap-2">
            {/* Account icon */}
            <button
              className={cn(
                "hidden sm:flex w-9 h-9 items-center justify-center rounded-full border transition-colors",
                light
                  ? "border-gray-200 text-gray-600 hover:bg-gray-100"
                  : "border-white/20 text-white/80 hover:bg-white/10"
              )}
              aria-label="Mon compte"
            >
              <User className="h-4 w-4" />
            </button>

            {/* AI CTA */}
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('openChatWidget'))}
              className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-toyota-red text-white text-sm font-bold rounded-full hover:bg-toyota-red/90 transition-colors"
            >
              <Bot className="h-4 w-4" />
              Consulter l&apos;IA
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className={cn(
                "md:hidden p-2 rounded-xl transition-colors",
                light
                  ? "text-gray-700 hover:bg-gray-100"
                  : "text-white/80 hover:bg-white/10"
              )}
              aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile drawer ────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="mob-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            />
            {/* Side drawer */}
            <motion.nav
              key="mob-drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed top-0 right-0 h-full z-50 w-[300px] md:hidden flex flex-col bg-toyota-dark border-l border-white/8 shadow-2xl"
              aria-label="Navigation mobile"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
                <Link href="/" onClick={() => setMenuOpen(false)} className="flex items-center gap-1.5">
                  <span className="text-toyota-red font-black text-xl tracking-tight">TOYOTA</span>
                  <span className="text-white/30 font-light text-sm tracking-widest mt-0.5">AI</span>
                </Link>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/8 transition-colors text-white/60 hover:text-white"
                  aria-label="Fermer le menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {/* Nav links */}
              <div className="flex-1 flex flex-col gap-1 px-4 py-6">
                <Link href="/vehicles" onClick={() => setMenuOpen(false)} className="px-4 py-4 text-white font-semibold text-base rounded-xl hover:bg-white/5 transition-colors flex items-center justify-between">
                  Véhicules
                  <ChevronRight className="h-4 w-4 text-white/30" />
                </Link>
                <Link href="/configurator" onClick={() => setMenuOpen(false)} className="px-4 py-4 text-white font-semibold text-base rounded-xl hover:bg-white/5 transition-colors flex items-center justify-between">
                  Configurateur 3D
                  <ChevronRight className="h-4 w-4 text-white/30" />
                </Link>
                <Link href="/contact" onClick={() => setMenuOpen(false)} className="px-4 py-4 text-white font-semibold text-base rounded-xl hover:bg-white/5 transition-colors flex items-center justify-between">
                  Contact
                  <ChevronRight className="h-4 w-4 text-white/30" />
                </Link>
              </div>
              {/* AI CTA */}
              <div className="px-4 pb-8 pt-4 border-t border-white/8">
                <button
                  onClick={() => { setMenuOpen(false); window.dispatchEvent(new CustomEvent('openChatWidget')) }}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-toyota-red hover:bg-toyota-red/90 text-white font-bold text-base rounded-2xl transition-colors"
                >
                  <Bot className="h-5 w-5" />
                  Consulter l&apos;IA
                </button>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
