"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
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
import { VEHICLES_DATA } from "@/data/vehicles";
import { CommandSearchButton } from "@/components/layout/CommandPalette";
import { cn } from "@/lib/utils";

const TOP_NAV = [
  { href: "/vehicles", label: "Véhicules", hasMega: true },
  { href: "/configurator", label: "Configurateur" },
  { href: "/quiz", label: "Quiz DNA", xlOnly: true },
  { href: "/road-trip", label: "Road Trip", xlOnly: true },
  { href: "/acheter", label: "Acheter" },
  { href: "/concessions", label: "Concessions" },
  { href: "/contact", label: "Contact" },
] as const;

export function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
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
    <header className="fixed top-0 inset-x-0 z-50 overflow-visible bg-black/95 backdrop-blur-md border-b border-white/[0.06]">
      <div className="w-full px-4 sm:px-6 lg:px-8 overflow-visible">
        <div className="grid h-[72px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 xl:gap-6 overflow-visible">
          {/* Logo — fixed column, never shrinks */}
          <Link
            href="/"
            className="relative z-20 shrink-0 font-black text-xl tracking-tight text-white pr-2"
            aria-label="Toyota Accueil"
          >
            TOYOTA
          </Link>

          {/* Desktop nav — middle column clips overflow; secondary links at xl+ */}
          <nav
            ref={megaRef}
            className="relative z-10 hidden min-w-0 lg:flex items-center justify-center gap-0 overflow-visible"
          >
            {TOP_NAV.map(({ href, label, ...rest }) => {
              const hasMega = "hasMega" in rest && rest.hasMega;
              const xlOnly = "xlOnly" in rest && rest.xlOnly;
              const active = pathname === href || pathname.startsWith(href);
              const linkClass = cn(
                "px-2 xl:px-3 py-2 text-[11px] xl:text-xs font-semibold uppercase tracking-wide transition-colors relative whitespace-nowrap shrink-0",
                xlOnly && "hidden xl:inline-flex",
                active ? "text-white toyota-nav-active" : "text-white/55 hover:text-white"
              );

              if (hasMega) {
                return (
                  <div key={label} className="relative shrink-0">
                    <button
                      onClick={() => setMegaOpen((v) => !v)}
                      className={cn(
                        linkClass,
                        "inline-flex items-center gap-1",
                        active || megaOpen ? "text-white toyota-nav-active" : undefined
                      )}
                    >
                      {label}
                      <ChevronDown className={cn("h-3.5 w-3.5", megaOpen && "rotate-180")} />
                    </button>
                    <AnimatePresence>
                      {megaOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          className="absolute top-full left-1/2 z-[100] mt-3 w-[min(640px,calc(100vw-2rem))] -translate-x-1/2 rounded-lg border border-white/10 bg-[#121212] shadow-2xl overflow-hidden"
                        >
                          <div className="p-5">
                            <p className="text-[10px] font-bold text-toyota-muted uppercase tracking-widest mb-3">Notre gamme</p>
                            <div className="grid grid-cols-5 gap-2">
                              {VEHICLES_DATA.map((v) => (
                                <Link
                                  key={v.id}
                                  href={`/vehicles/${v.id}`}
                                  onClick={() => setMegaOpen(false)}
                                  className="group p-2 rounded-md hover:bg-white/5 text-center"
                                >
                                  <div className="relative w-full h-12 rounded-md overflow-hidden bg-white/5 mb-1">
                                    {v.imageUrl && (
                                      <Image src={v.imageUrl} alt={v.name} fill className="object-cover" sizes="80px" />
                                    )}
                                  </div>
                                  <p className="text-white text-[10px] font-semibold">{v.name.replace("Toyota ", "")}</p>
                                </Link>
                              ))}
                            </div>
                            <div className="mt-4 pt-3 border-t border-white/8 flex justify-between">
                              <Link href="/vehicles" className="text-sm text-toyota-red font-semibold flex items-center gap-1">
                                Voir tout <ChevronRight className="h-3.5 w-3.5" />
                              </Link>
                              <Link href="/configurator" className="text-xs text-toyota-muted flex items-center gap-1 hover:text-white">
                                <Settings2 className="h-3 w-3" /> Configurateur
                              </Link>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              }
              return (
                <Link key={href} href={href} className={linkClass}>
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Right actions — fixed column with backdrop so nav never bleeds through */}
          <div className="relative z-20 flex shrink-0 items-center justify-end gap-2 sm:gap-3 pl-2 bg-black/95">
            <CommandSearchButton />
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent("open-command-palette"))}
              className="lg:hidden w-9 h-9 rounded-md border border-white/10 flex items-center justify-center text-white/60"
              aria-label="Rechercher"
            >
              <Search className="h-4 w-4" />
            </button>

            <Link href="/acheter" className="hidden sm:inline-flex toyota-btn-primary py-2.5 px-4 xl:px-5 text-xs shrink-0">
              Essai routier
            </Link>

            <div ref={accountRef} className="relative hidden sm:block">
              <button
                onClick={() => setAccountOpen((v) => !v)}
                className="flex items-center gap-2 h-9 px-3 rounded-md border border-white/10 text-sm text-white/70 hover:text-white hover:border-white/20 transition-colors"
              >
                <User className="h-4 w-4" />
                <span className="hidden lg:inline max-w-[90px] truncate" suppressHydrationWarning>
                  {mounted && isLoggedIn ? displayName.split(" ")[0] : "Compte"}
                </span>
                <ChevronDown className={cn("h-3.5 w-3.5", accountOpen && "rotate-180")} />
              </button>
              <AnimatePresence>
                {accountOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="absolute right-0 top-full mt-2 w-52 bg-[#121212] rounded-lg border border-white/10 shadow-2xl py-1 z-50"
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
                        <div className="border-t border-white/5 mt-1 pt-1">
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

            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="lg:hidden p-2 rounded-md text-white/80 hover:bg-white/10"
              aria-label="Menu"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMenuOpen(false)} className="fixed inset-0 z-40 bg-black/80 lg:hidden" />
            <motion.nav initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} className="fixed top-0 right-0 h-full z-50 w-[280px] bg-[#0a0a0a] border-l border-white/10 lg:hidden flex flex-col">
              <div className="p-5 border-b border-white/8 flex justify-between items-center">
                <span className="font-black text-white">TOYOTA</span>
                <button onClick={() => setMenuOpen(false)}><X className="h-5 w-5 text-white/60" /></button>
              </div>
              <div className="flex-1 p-4 space-y-1">
                {TOP_NAV.map(({ href, label }) => (
                  <Link key={href} href={href} onClick={() => setMenuOpen(false)} className="block px-4 py-3 rounded-md text-white font-semibold uppercase text-sm hover:bg-white/5">
                    {label}
                  </Link>
                ))}
                <Link href="/acheter" onClick={() => setMenuOpen(false)} className="block mt-4 toyota-btn-primary text-center py-3">
                  Essai routier
                </Link>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

function AccountLink({ href, icon, children, onClick }: { href: string; icon: React.ReactNode; children: React.ReactNode; onClick: () => void }) {
  return (
    <Link href={href} onClick={onClick} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/5">
      {icon}
      {children}
    </Link>
  );
}
