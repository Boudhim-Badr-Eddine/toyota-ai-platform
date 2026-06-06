"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, FormEvent } from "react";
import { Bell, Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": { title: "Vue d'ensemble", subtitle: "PERFORMANCE LÉGENDAIRE" },
  "/leads": { title: "Gestion Leads", subtitle: "DEMANDES CLIENTS" },
  "/reservations": { title: "Réservations", subtitle: "ESSAIS & RDV" },
  "/analytics": { title: "Analytics", subtitle: "INSIGHTS COMMERCIAUX" },
};

export function AdminTopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  const meta =
    PAGE_META[pathname] ??
    (pathname.startsWith("/leads")
      ? PAGE_META["/leads"]
      : pathname.startsWith("/reservations")
        ? PAGE_META["/reservations"]
        : pathname.startsWith("/analytics")
          ? PAGE_META["/analytics"]
          : PAGE_META["/dashboard"]);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (pathname.startsWith("/leads")) {
      router.push(q ? `/leads?q=${encodeURIComponent(q)}` : "/leads");
    } else {
      router.push(q ? `/leads?q=${encodeURIComponent(q)}` : "/leads");
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#0A0A0A]/95 backdrop-blur-xl">
      <div className="flex flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-black tracking-tight text-white lg:text-3xl">{meta.title}</h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-toyota-red/90">
            {meta.subtitle}
          </p>
        </div>

        <form
          onSubmit={handleSearch}
          className="flex flex-1 items-center gap-3 lg:max-w-xl lg:mx-8"
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un lead…"
              className="w-full rounded-full border border-white/10 bg-[#141414] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/25 focus:border-toyota-red/40 focus:outline-none"
            />
          </div>
        </form>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[#141414] text-white/70 transition-colors hover:text-white"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-toyota-red" />
          </button>
          <Link
            href="/leads"
            className={cn(
              "inline-flex items-center gap-2 rounded-md bg-toyota-red px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white",
              "shadow-lg shadow-toyota-red/30 transition-all hover:bg-[#c00818]"
            )}
          >
            <Plus className="h-4 w-4" />
            Nouveau lead
          </Link>
        </div>
      </div>
    </header>
  );
}
