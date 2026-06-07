import type { Metadata } from "next";
import { AcheterPageClient } from "./AcheterPageClient";

export const metadata: Metadata = {
  title: "Acheter votre Toyota",
  description:
    "Parcours d'achat Toyota Maroc — renseignez vos informations et trouvez la concession la plus proche.",
};

export default function AcheterPage() {
  return <AcheterPageClient />;
}
