"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  ChevronDown,
  ChevronRight,
  Settings2,
  Shield,
  LogOut,
  LogIn,
  UserPlus,
  Search,
} from "lucide-react";
import { VEHICLES_DATA, getVehicleDisplayImage } from "@/data/vehicles";
import { NavDriveCta } from "@/components/ui/NavDriveCta";
import { cn } from "@/lib/utils";
import { MOTION_GPU_CLASS } from "@/lib/motion";

const EASE_PREMIUM = [0.22, 1, 0.36, 1] as const;

const TOP_NAV = [
  { href: "/vehicles", label: "Véhicules", hasMega: true },
  { href: "/configurator", label: "Configurateur" },
  { href: "/quiz", label: "Quiz DNA", xlOnly: true },
  { href: "/road-trip", label: "Road Trip", xlOnly: true },
  { href: "/acheter", label: "Acheter" },
  { href: "/concessions", label: "Concessions" },
  { href: "/contact", label: "Contact" },
] as const;

function NavLink({
  href,
  label,
  active,
  xlOnly,
  onClick,
}: {
  href: string;
  label: string;
  active: boolean;
  xlOnly?: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "group relative inline-flex items-center px-2 xl:px-3 py-2.5 text-[11px] xl:text-xs font-semibold uppercase tracking-wide transition-colors whitespace-nowrap shrink-0",
        xlOnly && "hidden xl:inline-flex",
        active ? "text-[#EB0A1E]" : "text-white/60 hover:text-white"
      )}
    >
      {label}
      <motion.span
        className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#EB0A1E] rounded-full origin-left"
        initial={false}
        animate={{ scaleX: active ? 1 : 0 }}
        whileHover={{ scaleX: 1 }}
        transition={{ duration: 0.28, ease: EASE_PREMIUM }}
      />
    </Link>
  );
}

function ExpandableSearchButton({ className }: { className?: string }) {
  const [expanded, setExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const openPalette = () => {
    window.dispatchEvent(new CustomEvent("open-command-palette"));
  };

  return (
    <motion.button
      type="button"
      onClick={() => {
        if (!expanded) {
          setExpanded(true);
          setTimeout(() => inputRef.current?.focus(), 120);
        } else {
          openPalette();
        }
      }}
      onBlur={() => setTimeout(() => setExpanded(false), 180)}
      className={cn(
        MOTION_GPU_CLASS,
        "hidden lg:flex items-center gap-2 shrink-0 h-9 w-[220px] rounded-full border border-white/10 bg-[#121212] text-white/40 text-xs overflow-hidden transition-colors hover:border-white/20 hover:text-white/70",
        className
      )}
      animate={{
        clipPath: expanded
          ? "inset(0 0% 0 0 round 9999px)"
          : "inset(0 82% 0 0 round 9999px)",
      }}
      transition={{ duration: 0.35, ease: EASE_PREMIUM }}
      aria-label="Rechercher"
    >
      <Search className="h-3.5 w-3.5 shrink-0 ml-3" />
      <AnimatePresence>
        {expanded && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pr-3 whitespace-nowrap text-white/50"
          >
            Rechercher…
          </motion.span>
        )}
      </AnimatePresence>
      <input ref={inputRef} className="sr-only" tabIndex={-1} readOnly />
    </motion.button>
  );
}

function HamburgerButton({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden relative w-10 h-10 flex items-center justify-center rounded-md text-white/80 hover:bg-white/5 transition-colors"
      aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
      aria-expanded={open}
    >
      <div className="w-5 h-3.5 relative">
        <motion.span
          className="absolute left-0 right-0 top-0 h-0.5 bg-current rounded-full origin-center"
          animate={open ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
          transition={{ duration: 0.28, ease: EASE_PREMIUM }}
        />
        <motion.span
          className="absolute left-0 right-0 top-[6px] h-0.5 bg-current rounded-full"
          animate={open ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.2 }}
        />
        <motion.span
          className="absolute left-0 right-0 bottom-0 h-0.5 bg-current rounded-full origin-center"
          animate={open ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
          transition={{ duration: 0.28, ease: EASE_PREMIUM }}
        />
      </div>
    </button>
  );
}

export function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const megaRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  const user = session?.user;
  const isLoggedIn = !!user;
  const isAdmin = user?.role === "admin";
  const displayName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.name ?? "Compte";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setMegaOpen(false);
    setAccountOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (megaRef.current && !megaRef.current.contains(e.target as Node)) setMegaOpen(false);
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) setAccountOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <header
      className={cn(
        MOTION_GPU_CLASS,
        "fixed top-0 inset-x-0 z-50 overflow-visible transition-all duration-300",
        scrolled
          ? "bg-[rgba(0,0,0,0.95)] backdrop-blur-[20px] border-b border-[#EB0A1E]/35 shadow-[0_8px_32px_rgba(0,0,0,0.45)]"
          : "bg-black/80 backdrop-blur-md border-b border-white/[0.06]"
      )}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 overflow-visible">
        <div className="grid h-[72px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 xl:gap-6 overflow-visible">
          <Link
            href="/"
            className="group relative z-20 shrink-0 font-black text-2xl tracking-tight text-white pr-2"
            aria-label="Toyota Accueil"
          >
            TOYOTA
            <span className="absolute -bottom-0.5 left-0 h-0.5 w-0 bg-[#EB0A1E] transition-all duration-300 ease-out group-hover:w-full" />
          </Link>

          <nav
            ref={megaRef}
            className="relative z-10 hidden min-w-0 lg:flex items-center justify-center gap-0 overflow-visible"
          >
            {TOP_NAV.map(({ href, label, ...rest }) => {
              const hasMega = "hasMega" in rest && rest.hasMega;
              const xlOnly = "xlOnly" in rest && rest.xlOnly;
              const active = pathname === href || pathname.startsWith(`${href}/`);

              if (hasMega) {
                const megaActive = active || megaOpen;
                return (
                  <div key={label} className="relative shrink-0">
                    <button
                      onClick={() => setMegaOpen((v) => !v)}
                      className={cn(
                        "group relative inline-flex items-center gap-1 px-2 xl:px-3 py-2.5 text-[11px] xl:text-xs font-semibold uppercase tracking-wide transition-colors whitespace-nowrap",
                        megaActive ? "text-[#EB0A1E]" : "text-white/60 hover:text-white"
                      )}
                    >
                      {label}
                      <ChevronDown
                        className={cn("h-3.5 w-3.5 transition-transform duration-300", megaOpen && "rotate-180")}
                      />
                      <motion.span
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#EB0A1E] rounded-full origin-left"
                        initial={false}
                        animate={{ scaleX: megaActive ? 1 : 0 }}
                        whileHover={{ scaleX: 1 }}
                        transition={{ duration: 0.28, ease: EASE_PREMIUM }}
                      />
                    </button>

                  </div>
                );
              }

              return (
                <NavLink key={href} href={href} label={label} active={active} xlOnly={xlOnly} />
              );
            })}

            <AnimatePresence>
              {megaOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ duration: 0.32, ease: EASE_PREMIUM }}
                  className="fixed top-[calc(72px+0.75rem)] left-1/2 z-[100] w-[min(800px,calc(100vw-2rem))] -translate-x-1/2 rounded-2xl border border-white/[0.08] bg-[#0a0a0a]/95 backdrop-blur-xl shadow-[0_24px_64px_rgba(0,0,0,0.65)] overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em]">
                        Notre gamme
                      </p>
                      <span className="text-[10px] text-white/35 tabular-nums">
                        {VEHICLES_DATA.length} modèles
                      </span>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5 max-h-[min(420px,55vh)] overflow-y-auto pr-1 scrollbar-thin">
                      {VEHICLES_DATA.map((vehicle) => (
                        <Link
                          key={vehicle.id}
                          href={`/vehicles/${vehicle.id}`}
                          onClick={() => setMegaOpen(false)}
                          className="group rounded-xl border border-white/[0.08] bg-[#111] overflow-hidden hover:border-[#EB0A1E]/40 transition-colors duration-300"
                        >
                          <div className="relative h-16 bg-[#0a0a0a]">
                            <Image
                              src={getVehicleDisplayImage(vehicle)}
                              alt={vehicle.name}
                              fill
                              className={cn(
                                "object-center p-1.5 transition-transform duration-500 group-hover:scale-105",
                                vehicle.id === "kijang"
                                  ? "object-cover object-[center_40%]"
                                  : "object-contain"
                              )}
                              sizes="100px"
                              loading="lazy"
                            />
                          </div>
                          <div className="px-2.5 py-2 border-t border-white/[0.06]">
                            <p className="text-white text-[10px] font-bold truncate">
                              {vehicle.name.replace(/^Toyota\s+/i, "")}
                            </p>
                            <p className="text-white/45 text-[9px] mt-0.5 truncate">
                              {vehicle.category}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                    <div className="mt-5 pt-4 border-t border-white/[0.06] flex justify-between items-center">
                      <Link
                        href="/vehicles"
                        onClick={() => setMegaOpen(false)}
                        className="text-sm text-[#EB0A1E] font-semibold flex items-center gap-1 hover:gap-2 transition-all"
                      >
                        Voir tout <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                      <Link
                        href="/configurator"
                        onClick={() => setMegaOpen(false)}
                        className="text-xs text-white/45 flex items-center gap-1 hover:text-white transition-colors"
                      >
                        <Settings2 className="h-3 w-3" /> Configurateur
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </nav>

          <div
            className={cn(
              "relative z-20 flex shrink-0 items-center justify-end gap-2 sm:gap-3 pl-2 transition-colors duration-300",
              scrolled ? "bg-transparent" : "bg-transparent"
            )}
          >
            <ExpandableSearchButton />

            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent("open-command-palette"))}
              className="lg:hidden w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:border-white/20 hover:text-white transition-colors"
              aria-label="Rechercher"
            >
              <Search className="h-4 w-4" />
            </button>

            <NavDriveCta href="/acheter" className="hidden sm:inline-flex shrink-0" />

            <div ref={accountRef} className="relative hidden sm:block">
              <button
                onClick={() => setAccountOpen((v) => !v)}
                className="flex items-center gap-2 h-9 px-3 rounded-full border border-white/10 text-sm text-white/70 hover:text-white hover:border-white/20 transition-colors"
              >
                <User className="h-4 w-4" />
                <span className="hidden lg:inline max-w-[90px] truncate" suppressHydrationWarning>
                  {mounted && isLoggedIn ? displayName.split(" ")[0] : "Compte"}
                </span>
                <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", accountOpen && "rotate-180")} />
              </button>
              <AnimatePresence>
                {accountOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="absolute right-0 top-full mt-2 w-52 bg-[#111] rounded-xl border border-white/[0.08] shadow-2xl py-1 z-50"
                  >
                    {isLoggedIn ? (
                      <>
                        <AccountLink href="/compte" icon={<User className="h-4 w-4" />} onClick={() => setAccountOpen(false)}>
                          Mon compte
                        </AccountLink>
                        {isAdmin && (
                          <AccountLink href="/dashboard" icon={<Shield className="h-4 w-4" />} onClick={() => setAccountOpen(false)}>
                            Administration
                          </AccountLink>
                        )}
                        <button
                          onClick={() => signOut({ callbackUrl: "/" })}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-toyota-muted hover:text-white hover:bg-white/5"
                        >
                          <LogOut className="h-4 w-4" /> Déconnexion
                        </button>
                      </>
                    ) : (
                      <>
                        <AccountLink href="/compte/connexion" icon={<LogIn className="h-4 w-4" />} onClick={() => setAccountOpen(false)}>
                          Se connecter
                        </AccountLink>
                        <AccountLink href="/compte/inscription" icon={<UserPlus className="h-4 w-4" />} onClick={() => setAccountOpen(false)}>
                          Créer un compte
                        </AccountLink>
                        <div className="border-t border-white/[0.06] mt-1 pt-1">
                          <AccountLink href="/login" icon={<Shield className="h-4 w-4" />} onClick={() => setAccountOpen(false)}>
                            Admin
                          </AccountLink>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <HamburgerButton open={menuOpen} onClick={() => setMenuOpen((v) => !v)} />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
            />
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: EASE_PREMIUM }}
              className="relative z-50 lg:hidden overflow-hidden border-t border-white/[0.06] bg-[#0a0a0a]/95 backdrop-blur-xl"
            >
              <div className="px-4 py-4 space-y-1 max-h-[70vh] overflow-y-auto">
                {TOP_NAV.map(({ href, label }) => {
                  const active = pathname === href || pathname.startsWith(`${href}/`);
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMenuOpen(false)}
                      className={cn(
                        "block px-4 py-3 rounded-xl text-sm font-semibold uppercase transition-colors",
                        active
                          ? "text-[#EB0A1E] bg-[#EB0A1E]/10 border border-[#EB0A1E]/20"
                          : "text-white/80 hover:bg-white/5"
                      )}
                    >
                      {label}
                    </Link>
                  );
                })}
                <div className="pt-3">
                  <NavDriveCta
                    href="/acheter"
                    className="w-full"
                    onClick={() => setMenuOpen(false)}
                  />
                </div>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

function AccountLink({
  href,
  icon,
  children,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5"
    >
      {icon}
      {children}
    </Link>
  );
}
