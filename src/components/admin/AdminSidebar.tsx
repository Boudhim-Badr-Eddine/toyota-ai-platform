"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  Car,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavLink = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  external?: boolean;
};

const MAIN_LINKS: NavLink[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/reservations", label: "Réservations", icon: CalendarCheck },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/vehicles", label: "Véhicules", icon: Car, external: true },
];

const SYSTEM_LINKS: NavLink[] = [
  { href: "/dashboard", label: "Paramètres", icon: Settings },
];

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  const renderLink = ({ href, label, icon: Icon, external }: NavLink) => {
    const isActive = !external && (pathname === href || pathname.startsWith(href + "/"));
    return (
      <Link
        key={href + label}
        href={href}
        target={external ? "_blank" : undefined}
        onClick={onClose}
        className={cn(
          "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200",
          isActive
            ? "bg-white/[0.06] text-white"
            : "text-white/45 hover:bg-white/[0.04] hover:text-white/80"
        )}
      >
        {isActive && (
          <motion.div
            layoutId="adminActiveBar"
            className="absolute right-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-full bg-toyota-red"
          />
        )}
        <Icon
          className={cn(
            "h-4 w-4 shrink-0",
            isActive ? "text-toyota-red" : "text-white/35 group-hover:text-white/60"
          )}
        />
        <span className="flex-1 text-xs font-bold uppercase tracking-[0.12em]">{label}</span>
        {external && <ChevronRight className="h-3 w-3 text-white/20" />}
      </Link>
    );
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/[0.06] px-5 py-6">
        <Link href="/dashboard" className="block" onClick={onClose}>
          <span className="text-lg font-black tracking-[0.35em] text-white">TOYOTA</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        <div className="space-y-0.5">{MAIN_LINKS.map(renderLink)}</div>

        <div>
          <p className="mb-2 px-3 text-[9px] font-bold uppercase tracking-[0.2em] text-white/25">
            Système
          </p>
          <div className="space-y-0.5">{SYSTEM_LINKS.map(renderLink)}</div>
        </div>
      </nav>

      <div className="border-t border-white/[0.06] p-3">
        {session?.user && (
          <div className="mb-2 flex items-center gap-3 rounded-xl border border-white/[0.06] bg-[#141414] px-3 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-toyota-red/20 text-xs font-black text-toyota-red">
              {(session.user.name ?? "A").charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-white">{session.user.name ?? "Admin Toyota"}</p>
              <p className="truncate text-[9px] font-bold uppercase tracking-wider text-white/35">
                Manager Casablanca
              </p>
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={handleSignOut}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-semibold text-white/40 transition-colors hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Déconnexion
        </button>
      </div>
    </div>
  );
}

export function AdminSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <aside className="fixed bottom-0 left-0 top-0 z-40 hidden w-[240px] flex-col border-r border-white/[0.06] bg-[#0A0A0A] lg:flex">
        <SidebarContent />
      </aside>

      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-50 flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-[#111111] text-white/60 lg:hidden"
        aria-label="Ouvrir le menu"
      >
        <Menu className="h-4 w-4" />
      </button>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed bottom-0 left-0 top-0 z-50 w-[240px] border-r border-white/[0.06] bg-[#0A0A0A] lg:hidden"
            >
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/50"
              >
                <X className="h-4 w-4" />
              </button>
              <SidebarContent onClose={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
