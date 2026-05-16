import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact & Concessionnaires",
  description:
    "Contactez Toyota Maroc ou trouvez le concessionnaire le plus proche de chez vous. Casablanca, Rabat, Marrakech, Fès et Tanger.",
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
