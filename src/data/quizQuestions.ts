export interface QuizOption {
  id: string;
  label: string;
  emoji: string;
  traits: string[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  subtitle?: string;
  options: QuizOption[];
}

/** Toyota DNA — quiz « Permis de Légende » — saveurs Maroc */
export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "q1",
    question: "Votre week-end idéal au Maroc, c'est…",
    subtitle: "Choisissez l'aventure qui vous ressemble",
    options: [
      { id: "a", label: "Coucher de soleil sur les dunes de Merzouga", emoji: "🏜️", traits: ["Aventurier", "Grand voyageur"] },
      { id: "b", label: "Brunch face à l'Atlantique à Taghazout", emoji: "🌊", traits: ["Citadin branché", "Jeune professionnel"] },
      { id: "c", label: "Souk et riad dans la médina de Fès", emoji: "🕌", traits: ["Cadre", "Famille aisée"] },
      { id: "d", label: "Virée nocturne sur la corniche de Casa", emoji: "🌃", traits: ["Sportif", "Passionné"] },
    ],
  },
  {
    id: "q2",
    question: "Sur la route, vous êtes plutôt…",
    options: [
      { id: "a", label: "Pilote de rallye sur la route de l'Atlas", emoji: "🏎️", traits: ["Sportif", "Passionné"] },
      { id: "b", label: "Capitaine de famille vers Agadir", emoji: "👨‍👩‍👧‍👦", traits: ["Famille", "Grande famille"] },
      { id: "c", label: "Nomade digital Casablanca → Tanger", emoji: "💻", traits: ["Professionnel", "Trajet domicile-travail"] },
      { id: "d", label: "Explorateur off-road vers Ouarzazate", emoji: "🛻", traits: ["Aventurier", "Artisan", "Agriculteur"] },
    ],
  },
  {
    id: "q3",
    question: "Votre playlist pour traverser le pays ?",
    options: [
      { id: "a", label: "Gnawa + beats électro de Rabat", emoji: "🎧", traits: ["Citadin branché", "Design lover"] },
      { id: "b", label: "Classiques arabes et chaâbi marocain", emoji: "🎵", traits: ["Famille", "Cadre"] },
      { id: "c", label: "Rock & moteur — full volume", emoji: "🔊", traits: ["Sportif", "Passionné"] },
      { id: "d", label: "Podcasts éco & tech en silence hybride", emoji: "🌱", traits: ["Écolo", "Technophile", "Économe"] },
    ],
  },
  {
    id: "q4",
    question: "Le coffre doit contenir…",
    options: [
      { id: "a", label: "Planches de surf et combinaisons", emoji: "🏄", traits: ["Citadin branché", "Jeune actif"] },
      { id: "b", label: "Poussette, snacks et jeux pour les enfants", emoji: "🧸", traits: ["Famille", "Grande famille"] },
      { id: "c", label: "Outillage pro et échantillons clients", emoji: "🔧", traits: ["Professionnel", "Artisan"] },
      { id: "d", label: "Tentes, GPS et jerrycan de secours", emoji: "⛺", traits: ["Aventurier", "Grand voyageur"] },
    ],
  },
  {
    id: "q5",
    question: "Votre rapport à l'écologie sur les routes marocaines ?",
    options: [
      { id: "a", label: "Hybride ou rien — chaque litre compte", emoji: "♻️", traits: ["Écolo", "Technophile", "Navetteur urbain"] },
      { id: "b", label: "Équilibre : efficience sans sacrifier le confort", emoji: "⚖️", traits: ["Famille", "Professionnel"] },
      { id: "c", label: "Performance d'abord, le plaisir avant tout", emoji: "🔥", traits: ["Sportif", "Passionné", "Célibataire"] },
      { id: "d", label: "Robustesse diesel — fiabilité sur 500 000 km", emoji: "💪", traits: ["Artisan", "Agriculteur", "Aventurier"] },
    ],
  },
  {
    id: "q6",
    question: "Votre escale gastronomique préférée ?",
    options: [
      { id: "a", label: "Tajine aux amandes à Marrakech", emoji: "🍲", traits: ["Cadre", "Famille aisée", "Longue distance"] },
      { id: "b", label: "Poisson grillé au port d'Agadir", emoji: "🐟", traits: ["Famille", "Aventurier"] },
      { id: "c", label: "Sandwich bnin au bord de la route", emoji: "🥙", traits: ["Économe", "Jeune actif", "Citadin"] },
      { id: "d", label: "Dîner d'affaires à la Tour Hassan", emoji: "🥂", traits: ["Cadre", "Chef d'entreprise", "Long voyage"] },
    ],
  },
  {
    id: "q7",
    question: "Combien de passagers réguliers dans votre Toyota ?",
    options: [
      { id: "a", label: "Moi seul — liberté totale", emoji: "🧍", traits: ["Célibataire", "Sportif", "Jeune actif"] },
      { id: "b", label: "Couple ou duo d'amis", emoji: "👫", traits: ["Jeune professionnel", "Design lover", "Citadin branché"] },
      { id: "c", label: "Famille de 4-5 personnes", emoji: "👨‍👩‍👧", traits: ["Famille", "Professionnel"] },
      { id: "d", label: "Tribu entière — 6 places minimum", emoji: "👨‍👩‍👧‍👦", traits: ["Grande famille", "Chef d'entreprise"] },
    ],
  },
  {
    id: "q8",
    question: "Votre scène de film marocaine préférée ?",
    subtitle: "Dernière question — votre ADN Toyota se révèle",
    options: [
      { id: "a", label: "Car chase sur la corniche de Casablanca", emoji: "🎬", traits: ["Sportif", "Passionné"] },
      { id: "b", label: "Road trip familial Atlas → Essaouira", emoji: "🚗", traits: ["Famille", "Aventurier", "Long voyage"] },
      { id: "c", label: "Traversée du désert en convoi 4×4", emoji: "🐪", traits: ["Aventurier", "Grand voyageur"] },
      { id: "d", label: "Navette quotidienne Casa ↔ Rabat sans stress", emoji: "🛣️", traits: ["Trajet domicile-travail", "Navetteur urbain", "Économe"] },
    ],
  },
];

export const PERSONA_TEMPLATES: Record<
  string,
  { title: string; tagline: string }
> = {
  supra: {
    title: "Légende de la Corniche",
    tagline: "Vous tracez votre route comme un pilote — chaque virage est une victoire.",
  },
  rav4: {
    title: "Explorateur de l'Atlas",
    tagline: "Famille, aventure et routes marocaines : vous maîtrisez les trois.",
  },
  yaris: {
    title: "Maître des Médinas",
    tagline: "Agile dans les ruelles de Fès comme sur le boulevard de Casa.",
  },
  corolla: {
    title: "Pilier de la Nation",
    tagline: "Fiable, élégant, partout au Maroc — vous êtes la référence.",
  },
  camry: {
    title: "Ambassadeur du Royaume",
    tagline: "Longues distances, grands rendez-vous : vous voyagez en grand.",
  },
  landcruiser: {
    title: "Conquérant du Sahara",
    tagline: "Dunes, pistes, montagnes — rien ne vous arrête au Maroc.",
  },
  hilux: {
    title: "Bâtisseur du Territoire",
    tagline: "Chantiers, champs, pistes : votre Toyota travaille autant que vous.",
  },
  prius: {
    title: "Visionnaire Vert",
    tagline: "L'avenir hybride du Maroc passe par vous — silencieux et malin.",
  },
  chr: {
    title: "Icône Urbaine",
    tagline: "Design audacieux, esprit citadin : vous êtes la tendance.",
  },
  highlander: {
    title: "Chef de Tribu",
    tagline: "Sept places, zéro compromis — votre famille règne sur la route.",
  },
};
