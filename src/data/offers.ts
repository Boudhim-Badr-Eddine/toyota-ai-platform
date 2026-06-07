export type OfferCategory = "financing" | "trade-in" | "seasonal" | "hybrid" | "fleet";

export interface Offer {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: OfferCategory;
  badge?: string;
  validUntil: string;
  vehicleIds?: string[];
  highlight: string;
  ctaLabel: string;
  ctaHref: string;
  imageUrl: string;
}

export const OFFER_CATEGORIES: Record<OfferCategory, string> = {
  financing: "Financement",
  "trade-in": "Reprise",
  seasonal: "Saisonnière",
  hybrid: "Hybride",
  fleet: "Professionnel",
};

export const OFFERS_DATA: Offer[] = [
  {
    id: "ete-2026",
    title: "Offre Été 2026",
    subtitle: "0% d'apport sur les SUV hybrides",
    description:
      "Profitez d'un financement à taux préférentiel sur le RAV4 Hybrid, C-HR et Highlander. Mensualités adaptées à votre budget.",
    category: "seasonal",
    badge: "Populaire",
    validUntil: "2026-08-31",
    vehicleIds: ["rav4", "chr", "highlander"],
    highlight: "À partir de 4 200 MAD/mois",
    ctaLabel: "Simuler mon financement",
    ctaHref: "#finance",
    imageUrl: "/images/vehicles/rav4.jpg",
  },
  {
    id: "reprise-voiture",
    title: "Reprise Garantie",
    subtitle: "Votre ancienne voiture = apport immédiat",
    description:
      "Estimation gratuite en concession. Reprise de votre véhicule actuel pour réduire votre apport sur un nouveau Toyota.",
    category: "trade-in",
    validUntil: "2026-12-31",
    highlight: "Jusqu'à 80 000 MAD de reprise",
    ctaLabel: "Demander une estimation",
    ctaHref: "/contact",
    imageUrl: "/images/vehicles/camry.jpg",
  },
  {
    id: "hybrid-bonus",
    title: "Bonus Hybride",
    subtitle: "-15 000 MAD sur les modèles hybrides",
    description:
      "Réduction immédiate sur Corolla Hybrid, Yaris Cross Hybrid et Prius. Économisez sur le carburant dès le premier jour.",
    category: "hybrid",
    badge: "Éco",
    validUntil: "2026-09-30",
    vehicleIds: ["corolla", "chr", "prius"],
    highlight: "15 000 MAD offerts",
    ctaLabel: "Voir les modèles hybrides",
    ctaHref: "/vehicles?category=hybride",
    imageUrl: "/images/vehicles/corolla.jpg",
  },
  {
    id: "supra-sport",
    title: "GR Supra — Offre Sport",
    subtitle: "Pack performance inclus",
    description:
      "Achat de la GR Supra avec pack performance (jantes 19\", échappement sport) offert. Financement sur 60 mois disponible.",
    category: "seasonal",
    validUntil: "2026-07-31",
    vehicleIds: ["supra"],
    highlight: "Pack 45 000 MAD offert",
    ctaLabel: "Découvrir la Supra",
    ctaHref: "/vehicles/supra",
    imageUrl: "/images/vehicles/supra.jpg",
  },
  {
    id: "fleet-pro",
    title: "Toyota Fleet Pro",
    subtitle: "Solutions entreprises & flottes",
    description:
      "Tarifs préférentiels pour les professionnels. Hilux, Proace et Corolla disponibles en leasing opérationnel.",
    category: "fleet",
    validUntil: "2026-12-31",
    vehicleIds: ["hilux", "corolla", "camry"],
    highlight: "Leasing dès 3 800 MAD/mois",
    ctaLabel: "Contacter l'équipe pro",
    ctaHref: "/contact",
    imageUrl: "/images/vehicles/hilux.jpg",
  },
  {
    id: "taux-fixe",
    title: "Taux Fixe 5,9%",
    subtitle: "Financement transparent sur 48 mois",
    description:
      "Un taux unique sur toute la gamme berline et citadine. Pas de frais cachés, simulation en ligne immédiate.",
    category: "financing",
    validUntil: "2026-10-31",
    highlight: "TAEG 5,9% fixe",
    ctaLabel: "Calculer ma mensualité",
    ctaHref: "#finance",
    imageUrl: "/images/vehicles/yaris-gr-hero.png",
  },
];
