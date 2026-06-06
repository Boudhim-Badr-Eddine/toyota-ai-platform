import type { Metadata } from "next";
import { Suspense } from "react";
import { ShoppingBag } from "lucide-react";
import { PurchaseWizard } from "@/components/dealer/PurchaseWizard";

export const metadata: Metadata = {
  title: "Acheter votre Toyota",
  description: "Parcours d'achat Toyota Maroc — renseignez vos informations et trouvez la concession la plus proche.",
};

export default function AcheterPage() {
  return (
    <div className="toyota-page pb-28 lg:pb-16">
      <section className="border-b border-white/[0.06] bg-[#000000]">
        <div className="section-container py-12 md:py-16">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-toyota-red/25 bg-toyota-red/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-toyota-red">
              <ShoppingBag className="h-3.5 w-3.5" />
              Parcours d&apos;achat
            </div>
            <h1 className="text-display text-white">
              Acheter votre <span className="text-toyota-red">Toyota</span>
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-white/45">
              Choisissez votre modèle, confirmez vos coordonnées et sélectionnez la concession Toyota la plus proche de vous.
            </p>
          </div>
        </div>
      </section>
      <Suspense fallback={<div className="section-container py-20 text-white/40">Chargement…</div>}>
        <PurchaseWizard />
      </Suspense>
    </div>
  );
}
