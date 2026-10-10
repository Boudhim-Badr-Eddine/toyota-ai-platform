import type { Metadata } from "next";
import { VehiclesPageClient } from "./VehiclesPageClient";

export const metadata: Metadata = {
  title: "Véhicules Toyota — Découvrez tous nos modèles",
  description:
    "Parcourez l'intégralité de la gamme Toyota disponible au Maroc. Filtrez par catégorie, comparez les specs et configurez votre véhicule idéal en 3D.",
};

export default function VehiclesPage() {
  return <VehiclesPageClient />;
}
