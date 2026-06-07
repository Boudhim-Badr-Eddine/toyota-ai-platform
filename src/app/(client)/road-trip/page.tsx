import type { Metadata } from "next";
import { RoadTripPageClient } from "./RoadTripPageClient";

export const metadata: Metadata = {
  title: "Road Trip Légendaire — Toyota Maroc",
  description:
    "Planifiez votre road trip légendaire au Maroc avec Toyota — itinéraires personnalisés, landmarks et arrêts concession.",
};

export default function RoadTripPage() {
  return <RoadTripPageClient />;
}
