"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { Search, Car, Settings2, ShoppingBag, MapPin, Bot, Home } from "lucide-react";
import { VEHICLES_DATA } from "@/data/vehicles";
import { cn } from "@/lib/utils";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />
      <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-full max-w-lg px-4">
        <Command
          className="rounded-2xl border border-white/10 bg-[#111] shadow-2xl overflow-hidden"
          label="Commandes"
        >
          <div className="flex items-center gap-2 border-b border-white/8 px-4">
            <Search className="h-4 w-4 text-toyota-muted shrink-0" />
            <Command.Input
              placeholder="Rechercher véhicules, pages, actions…"
              className="flex-1 h-12 bg-transparent text-white text-sm outline-none placeholder:text-toyota-muted/50"
            />
            <kbd className="hidden sm:inline text-[10px] text-toyota-muted/50 border border-white/10 rounded px-1.5 py-0.5">
              ESC
            </kbd>
          </div>
          <Command.List className="max-h-80 overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-toyota-muted">
              Aucun résultat.
            </Command.Empty>
            <Command.Group heading="Pages" className="text-[10px] uppercase tracking-wider text-toyota-muted/60 px-2 py-1.5">
              {[
                { href: "/", label: "Accueil", icon: Home },
                { href: "/vehicles", label: "Gamme véhicules", icon: Car },
                { href: "/configurator", label: "Configurateur 3D", icon: Settings2 },
                { href: "/acheter", label: "Acheter", icon: ShoppingBag },
                { href: "/concessions", label: "Concessions", icon: MapPin },
              ].map(({ href, label, icon: Icon }) => (
                <Command.Item
                  key={href}
                  value={label}
                  onSelect={() => go(href)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white cursor-pointer data-[selected=true]:bg-white/8"
                >
                  <Icon className="h-4 w-4 text-toyota-red" />
                  {label}
                </Command.Item>
              ))}
            </Command.Group>
            <Command.Group heading="Véhicules" className="text-[10px] uppercase tracking-wider text-toyota-muted/60 px-2 py-1.5 mt-2">
              {VEHICLES_DATA.map((v) => (
                <Command.Item
                  key={v.id}
                  value={v.name}
                  onSelect={() => go(`/vehicles/${v.id}`)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white cursor-pointer data-[selected=true]:bg-white/8"
                >
                  <Car className="h-4 w-4 text-toyota-muted" />
                  {v.name}
                </Command.Item>
              ))}
            </Command.Group>
            <Command.Group heading="Actions" className="text-[10px] uppercase tracking-wider text-toyota-muted/60 px-2 py-1.5 mt-2">
              <Command.Item
                value="Ouvrir chat IA"
                onSelect={() => {
                  setOpen(false);
                  window.dispatchEvent(new CustomEvent("open-chat"));
                }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white cursor-pointer data-[selected=true]:bg-white/8"
              >
                <Bot className="h-4 w-4 text-toyota-red" />
                Ouvrir le conseiller IA
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}

export function CommandSearchButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }));
      }}
      className={cn(
        "hidden lg:flex items-center gap-2 shrink-0 px-2.5 xl:px-3 py-2 rounded-md border border-white/10 bg-[#121212] text-white/40 text-xs hover:border-white/20 hover:text-white/60 transition-colors",
        className
      )}
      aria-label="Rechercher"
    >
      <Search className="h-3.5 w-3.5 shrink-0" />
      <span className="hidden xl:inline whitespace-nowrap">Rechercher</span>
      <kbd className="hidden xl:inline text-[10px] border border-white/10 rounded px-1 shrink-0">⌘K</kbd>
    </button>
  );
}
