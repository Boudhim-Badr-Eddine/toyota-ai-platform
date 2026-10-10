"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileTabBar } from "@/components/layout/MobileTabBar";
import { WhatsAppFab } from "@/components/layout/WhatsAppFab";
import { isImmersiveConfigurator } from "@/lib/routes";

const CommandPalette = dynamic(
  () => import("@/components/layout/CommandPalette").then((m) => m.CommandPalette),
  { ssr: false }
);

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const immersive = isImmersiveConfigurator(pathname);

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[#EB0A1E]/[0.08] focus:text-[#EB0A1E] focus:border focus:border-[#EB0A1E]/30"
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
