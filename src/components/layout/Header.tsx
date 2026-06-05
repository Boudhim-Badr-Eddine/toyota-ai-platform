"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Bot, User, ChevronDown, ChevronRight, Settings2 } from "lucide-react";
import { VEHICLES_DATA } from "@/data/vehicles";
import { cn } from "@/lib/utils";

type NavItem = { label: string; href: string; hasMega?: boolean };

const TOP_NAV: NavItem[] = [
  { href: "/vehicles", label: "Véhicules", hasMega: true },
  { href: "/configurator", label: "Configurateur" },
];

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const megaRef = useRef<HTMLDivElement>(null);
  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docH > 0 ? (y / docH) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
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
        "fixed top-0 inset-x-0 z-50 transition-all duration-500",
        light
          ? "bg-white/95 backdrop-blur-xl shadow-sm shadow-black/6 border-b border-black/[0.06]"
          : "bg-transparent"
      )}
    >
      {/* Scroll progress bar */}
      <div
        className="absolute bottom-0 left-0 h-[2px] bg-toyota-red transition-all duration-150 z-10"
        style={{ width: `${scrollProgress}%` }}
      />

      <div className="section-container">
        <div className="flex items-center justify-between h-16 lg:h-20">

          {/* Logo */}
          {!isHome && (
            <Link href="/" className="flex items-center gap-2.5 select-none group" aria-label="Toyota Accueil">
              <div className="relative w-9 h-9 bg-toyota-red flex items-center justify-center rounded overflow-hidden shrink-0">
                <span className="text-white font-black text-[11px] tracking-widest leading-none">T</span>
                {/* Shine effect on hover */}
                <div className="absolute -inset-1 bg-gradient-to-tr from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-700 skew-x-12" />
              </div>
              <span className={cn(
                "font-black text-xl tracking-tight transition-colors duration-300",
                light ? "text-gray-900" : "text-white"
              )}>
                TOYOTA
              </span>
            </Link>
          )}

          {/* Desktop nav */}
          <div ref={megaRef} className="hidden md:flex flex-1 justify-center relative">
            <nav className="flex items-center gap-1" aria-label="Navigation principale">
              {TOP_NAV.map(({ href, label, hasMega }) => {
                const active = pathname === href || (href !== "/" && pathname.startsWith(href));
                const textClass = light
                  ? active ? "text-toyota-red" : "text-gray-700 hover:text-gray-900"
                  : active ? "text-white" : "text-white/75 hover:text-white";

                if (hasMega) {
                  return (
                    <button
                      key={label}
                      onClick={() => setMegaOpen((v) => !v)}
                      className={cn(
                        "flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200",
                        textClass,
                        megaOpen && (light ? "bg-gray-100" : "bg-white/10")
                      )}
                    >
                      {label}
                      <ChevronDown className={cn(
                        "h-3.5 w-3.5 transition-transform duration-300",
                        megaOpen && "rotate-180"
                      )} />
                    </button>
                  );
                }
                return (
                  <Link key={href} href={href} className={cn("px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200", textClass)}>
                    {label}
                  </Link>
                );
              })}
            </nav>

            {/* Mega menu */}
            <AnimatePresence>
              {megaOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 12, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 12, scale: 0.97 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[680px] bg-white rounded-2xl shadow-2xl shadow-black/20 border border-gray-100/80 overflow-hidden"
                >
                  <div className="p-6">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] mb-4">
                      Notre Gamme — {VEHICLES_DATA.length} Modèles
                    </p>
                    <div className="grid grid-cols-5 gap-2">
                      {VEHICLES_DATA.map((v) => (
                        <Link
                          key={v.id}
                          href={"/vehicles/" + v.id}
                          onClick={() => setMegaOpen(false)}
                          className="group flex flex-col items-center gap-2 p-2.5 rounded-xl hover:bg-gray-50 transition-all duration-200"
                        >
                          <div className="relative w-full h-14 rounded-lg overflow-hidden bg-gray-100">
                            {v.imageUrl && (
                              <Image
                                src={v.imageUrl}
                                alt={v.name}
                                fill
                                className="object-cover group-hover:scale-[1.08] transition-transform duration-400"
                                sizes="120px"
                              />
                            )}
                          </div>
                          <p className="text-gray-800 text-[11px] font-bold leading-tight group-hover:text-toyota-red transition-colors text-center">
                            {v.name.replace("Toyota ", "")}
                          </p>
                          <p className="text-gray-400 text-[9px] uppercase tracking-wide leading-none">{v.category}</p>
                        </Link>
                      ))}
                    </div>
                    <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                      <Link
                        href="/vehicles"
                        onClick={() => setMegaOpen(false)}
                        className="flex items-center gap-1.5 text-sm font-bold text-toyota-red hover:underline underline-offset-2"
                      >
                        Voir tous les véhicules
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                      <div className="flex gap-2">
                        <Link
                          href="/configurator"
                          onClick={() => setMegaOpen(false)}
                          className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <Settings2 className="h-3 w-3" />
                          Configurateur
                        </Link>
                        <button
                          onClick={() => { setMegaOpen(false); window.dispatchEvent(new CustomEvent("openChatWidget")); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-toyota-red text-white text-xs font-black rounded-lg hover:bg-toyota-red/90 transition-colors"
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
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <button
              className={cn(
                "hidden sm:flex w-9 h-9 items-center justify-center rounded-full border transition-all duration-300",
                light
                  ? "border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                  : "border-white/20 text-white/70 hover:bg-white/10 hover:text-white"
              )}
              aria-label="Mon compte"
            >
              <User className="h-4 w-4" />
            </button>

            <button
              onClick={() => window.dispatchEvent(new CustomEvent("openChatWidget"))}
              className={cn(
                "hidden sm:flex items-center gap-2 px-5 py-2.5 text-sm font-black rounded-full transition-all duration-300 tracking-wide",
                light
                  ? "bg-toyota-red text-white hover:bg-toyota-red/90 shadow-md shadow-toyota-red/20"
                  : "bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-toyota-red hover:border-toyota-red"
              )}
            >
              <Bot className="h-4 w-4" />
              Consulter l&apos;IA
            </button>

            <button
              onClick={() => setMenuOpen((v) => !v)}
              className={cn(
                "md:hidden p-2 rounded-xl transition-colors",
                light ? "text-gray-700 hover:bg-gray-100" : "text-white hover:bg-white/10"
              )}
              aria-label={menuOpen ? "Fermer" : "Menu"}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
            />
            <motion.nav
              key="drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 340, damping: 34 }}
              className="fixed top-0 right-0 h-full z-50 w-[300px] md:hidden flex flex-col bg-[#0A0A0A] border-l border-white/[0.07] shadow-2xl"
            >
              <div className="flex items-center justify-between px-5 py-5 border-b border-white/[0.07]">
                <Link href="/" onClick={() => setMenuOpen(false)} className="flex items-center gap-1.5">
                  <span className="text-toyota-red font-black text-xl tracking-tight">TOYOTA</span>
                  <span className="text-white/25 font-light text-xs tracking-widest">AI</span>
                </Link>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/8 transition-colors text-white/50 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 flex flex-col gap-1 px-4 py-6">
                {[
                  { href: "/vehicles", label: "Véhicules" },
                  { href: "/configurator", label: "Configurateur 3D" },
                  { href: "/contact", label: "Contact" },
                ].map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className="px-4 py-4 text-white font-semibold text-base rounded-xl hover:bg-white/[0.05] transition-colors flex items-center justify-between group"
                  >
                    {label}
                    <ChevronRight className="h-4 w-4 text-white/25 group-hover:text-toyota-red transition-colors" />
                  </Link>
                ))}
              </div>

              <div className="px-4 pb-8 pt-4 border-t border-white/[0.07]">
                <button
                  onClick={() => { setMenuOpen(false); window.dispatchEvent(new CustomEvent("openChatWidget")); }}
                  className="w-full flex items-center justify-center gap-2.5 py-4 bg-toyota-red hover:bg-toyota-red/90 text-white font-black text-sm tracking-wide rounded-2xl transition-colors shadow-lg shadow-toyota-red/20"
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