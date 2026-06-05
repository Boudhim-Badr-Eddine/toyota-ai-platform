import type { Metadata } from "next";
import { getVehicleById } from "@/data/vehicles";
import { formatPrice } from "@/lib/utils";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const vehicle = getVehicleById(id);
  if (!vehicle) {
    return { title: "Véhicule introuvable" };
  }
  const price = formatPrice(vehicle.priceFrom);
  return {
    title: `${vehicle.name} — Prix, Fiche Technique`,
    description:
      `Découvrez la Toyota ${vehicle.name} à partir de ${price}. ${vehicle.tagline}. Configurez-la en 3D et réservez votre essai au Maroc.`,
    openGraph: {
      title: `Toyota ${vehicle.name} — ${vehicle.category}`,
      description: vehicle.tagline,
      images: vehicle.imageUrl
        ? [{ url: vehicle.imageUrl, width: 1200, height: 630, alt: vehicle.name }]
        : [],
    },
  };
}

export default function VehicleDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
