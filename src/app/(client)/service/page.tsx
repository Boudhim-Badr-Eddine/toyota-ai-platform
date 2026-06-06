import type { Metadata } from "next";
import { ServiceBookingClient } from "./ServiceBookingClient";

export const metadata: Metadata = {
  title: "Service après-vente",
  description: "Réservez votre entretien Toyota au Maroc — SAV, pièces et rappels.",
};

export default function ServicePage() {
  return <ServiceBookingClient />;
}
