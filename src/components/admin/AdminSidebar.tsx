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
  LogOut,
  Menu,
  X,
  ChevronRight,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Nav links ─────────────────────────────────────────────────────────────────

type NavLink = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  external?: boolean;
};

const NAV_LINKS: NavLink[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    description: "Vue d'ensemble",
  },
  {
    href: "/leads",
    label: "Leads",
    icon: Users,
    description: "Demandes clients",
  },
  {
    href: "/reservations",
    label: "Réservations",
    icon: CalendarCheck,
    description: "Essais planifiés",
  },
  {
    href: "/vehicles",
    label: "Véhicules",
    icon: Car,
    description: "Catalogue modèles",
    external: true,
  },
];


// ─── Sidebar content (shared between desktop and mobile drawer) ────────────────

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <div className="flex flex-col h-full">
      {/* ── Logo ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-toyota-red flex items-center justify-center shadow-lg shadow-toyota-red/30">
            <span className="text-white font-black text-sm leading-none">T</span>
          </div>
          <div>
            <p className="text-white font-black text-sm leading-tight tracking-tight">Toyota</p>
            <p className="text-toyota-muted/50 text-[10px] leading-none">Admin Panel</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-toyota-muted hover:text-white transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* ── Navigation ───────────────────────────────────────────────────── */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-[9px] text-toyota-muted/30 font-semibold uppercase tracking-widest px-2 mb-2">
          Navigation
        </p>
        {NAV_LINKS.map(({ href, label, icon: Icon, description, external }) => {
          const isActive = external ? false : pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              target={external ? "_blank" : undefined}
              onClick={onClose}
              className={cn(
                "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                isActive
                  ? "bg-toyota-red/10 text-white"
                  : "text-toyota-muted hover:text-white hover:bg-white/4"
              )}
            >
              {/* Active left bar */}
              {isActive && (
                <motion.div
                  layoutId="activeBar"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-toyota-red rounded-full"
                />
              )}

              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  isActive ? "text-toyota-red" : "text-toyota-muted/60 group-hover:text-white/70"
                )}
              />
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-semibold leading-tight", isActive && "text-white")}>
                  {label}
                </p>
                <p className="text-[10px] text-toyota-muted/40 leading-none mt-0.5">{description}</p>
              </div>
              {external && (
                <ChevronRight className="h-3 w-3 text-toyota-muted/30 group-hover:text-toyota-muted/60 transition-colors" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── User info + logout ────────────────────────────────────────────── */}
      <div className="px-3 py-4 border-t border-white/5 space-y-2">
        {/* User card */}
        {session?.user && (
          <div className="flex items-center gap-2.5 px-3 py-2.5 bg-white/3 rounded-xl">
            <div className="w-7 h-7 rounded-full bg-toyota-red/20 border border-toyota-red/20 flex items-center justify-center shrink-0">
              <Shield className="h-3.5 w-3.5 text-toyota-red" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate leading-tight">
                {session.user.name ?? "Admin"}
              </p>
              <p className="text-toyota-muted/50 text-[10px] truncate leading-none mt-0.5">
                {session.user.email}
              </p>
            </div>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-toyota-muted hover:text-red-400 hover:bg-red-500/8 border border-transparent hover:border-red-500/15 transition-all duration-200"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span className="text-sm font-medium">Déconnexion</span>
        </button>
      </div>
    </div>
  );
}

// ─── AdminSidebar ──────────────────────────────────────────────────────────────

export function AdminSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* ── Desktop sidebar (fixed left) ─────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-60 bg-[#0A0A0A] border-r border-white/5 z-40">
        <SidebarContent />
      </aside>

      {/* ── Mobile: hamburger trigger ─────────────────────────────────────── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-9 h-9 rounded-xl bg-[#111111] border border-white/8 flex items-center justify-center text-toyota-muted hover:text-white transition-colors shadow-lg"
        aria-label="Ouvrir le menu"
      >
        <Menu className="h-4 w-4" />
      </button>

      {/* ── Mobile drawer ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            />
            {/* Drawer */}
            <motion.aside
              key="drawer"
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-60 bg-[#0A0A0A] border-r border-white/5 z-50"
            >
              <SidebarContent onClose={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
