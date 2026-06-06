"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Car, Settings2, ShoppingBag, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { isImmersiveConfigurator } from "@/lib/routes";

const TABS = [
  { href: "/", label: "Accueil", icon: Home },
  { href: "/vehicles", label: "Gamme", icon: Car },
  { href: "/configurator", label: "Configurer", icon: Settings2 },
  { href: "/acheter", label: "Acheter", icon: ShoppingBag },
  { href: "#chat", label: "IA", icon: Bot, action: "chat" as const },
];

export function MobileTabBar() {
  const pathname = usePathname();

  if (isImmersiveConfigurator(pathname)) return null;

  return (
    <nav
      aria-label="Navigation mobile"
      className="fixed bottom-0 inset-x-0 z-50 lg:hidden border-t border-white/10 bg-black/80 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]"
    >
      <div className="flex items-stretch justify-around h-16">
        {TABS.map(({ href, label, icon: Icon, action }) => {
          const active =
            action !== "chat" &&
            (href === "/" ? pathname === "/" : pathname.startsWith(href));

          if (action === "chat") {
            return (
              <button
                key={label}
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent("open-chat"))}
                className="flex flex-col items-center justify-center gap-0.5 flex-1 text-toyota-muted hover:text-white transition-colors"
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{label}</span>
              </button>
            );
          }

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 flex-1 transition-colors",
                active ? "text-toyota-red" : "text-toyota-muted hover:text-white"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
