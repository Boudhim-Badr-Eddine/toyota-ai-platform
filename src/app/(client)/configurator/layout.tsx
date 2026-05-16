import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Configurateur 3D Toyota",
  description:
    "Personnalisez votre Toyota en 3D — couleur, jantes, intérieur. Visualisez votre véhicule en temps réel et obtenez un devis instantané.",
};

export default function ConfiguratorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
