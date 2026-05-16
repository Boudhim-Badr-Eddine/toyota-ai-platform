import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers/Providers";
import { PageTransition } from "@/components/providers/PageTransition";
import { Toaster } from "sonner";
import { DebugPanel } from "@/components/dev/DebugPanel";
import ChatWidget from "@/components/chat/ChatWidget";
import { ScrollToTop } from "@/components/ui/ScrollToTop";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Toyota AI Experience Maroc | Trouvez Votre Toyota Ideale",
    template: "%s | Toyota AI Experience Maroc",
  },
  description:
    "Decouvrez, configurez et reservez votre Toyota ideale grace a notre conseiller IA personnalise. Explorez toute la gamme Toyota au Maroc — SUV, berlines, hybrides et sportives.",
  keywords: ["Toyota", "Maroc", "voiture", "hybride", "configurateur", "IA", "SUV", "berline", "Casablanca"],
  authors: [{ name: "Toyota Maroc" }],
  openGraph: {
    title: "Toyota AI Experience Maroc",
    description:
      "Configurez votre Toyota ideale avec notre IA et decouvrez l experience automobile du futur au Maroc.",
    locale: "fr_MA",
    type: "website",
    images: [{ url: "https://images.unsplash.com/photo-1632245889029-e406faaa34cd?w=1200&q=80", width: 1200, height: 630, alt: "Toyota AI Experience" }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-toyota-dark text-white font-sans">
        <Providers>
          <PageTransition>{children}</PageTransition>
        </Providers>
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: { background: "#111111", border: "1px solid rgba(255,255,255,0.08)", color: "#fff" },
          }}
        />
        <ChatWidget />
        <ScrollToTop />
        <DebugPanel />
      </body>
    </html>
  );
}
