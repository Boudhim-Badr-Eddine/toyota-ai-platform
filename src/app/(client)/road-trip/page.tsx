import type { Metadata } from "next";
import { Map } from "lucide-react";
import { RoadTripWizard } from "@/components/fun/RoadTripWizard";

export const metadata: Metadata = {
  title: "Road Trip Légendaire — Toyota Maroc",
  description:
    "Planifiez votre road trip légendaire au Maroc avec Toyota — itinéraires personnalisés, landmarks et arrêts concession.",
};

export default function RoadTripPage() {
  return (
    <div className="toyota-page pb-28 lg:pb-16">
      <section className="border-b border-white/[0.06] bg-[#000000]">
        <div className="section-container py-12 md:py-16">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-toyota-red/25 bg-toyota-red/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-toyota-red">
              <Map className="h-3.5 w-3.5" />
              Road Trip Légendaire
            </div>
            <h1 className="text-display text-white">
              Votre <span className="text-toyota-red">Aventure</span> Marocaine
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-white/45">
              De Casablanca aux dunes de Merzouga — planifiez un itinéraire sur mesure avec arrêts culturels et concessions Toyota.
            </p>
          </div>
        </div>
      </section>

      <RoadTripWizard />
    </div>
  );
}
