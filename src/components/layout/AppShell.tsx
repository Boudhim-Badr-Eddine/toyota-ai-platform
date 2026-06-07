"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileTabBar } from "@/components/layout/MobileTabBar";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { WhatsAppFab } from "@/components/layout/WhatsAppFab";
import { isImmersiveConfigurator } from "@/lib/routes";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const immersive = isImmersiveConfigurator(pathname);

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-toyota-red focus:text-white focus:rounded-lg"
      >
        Aller au contenu
      </a>
      {!immersive && <Header />}
      <main id="main-content" className="flex-1">
        {children}
      </main>
      {!immersive && <Footer />}
      {!immersive && <MobileTabBar />}
      {!immersive && <WhatsAppFab />}
      <CommandPalette />
    </>
  );
}
