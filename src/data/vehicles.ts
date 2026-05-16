import type { Vehicle, UserPreferences } from "@/types";

// ─── Complete Vehicle Catalog (10 Models) ──────────────────────────────────────

export const VEHICLES_DATA: Vehicle[] = [
  // ── 1. Toyota Supra ──────────────────────────────────────────────────────────
  {
    id: "supra",
    name: "Toyota Supra",
    category: "Sport",
    model3dPath: "/models/supra.glb",
    imageUrl: "/images/vehicles/supra.jpg",
    images: [
      "https://images.unsplash.com/photo-1632245889029-e406faaa34cd?w=1200&q=85",
      "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1200&q=85",
      "https://images.unsplash.com/photo-1550355291-bbee04a92027?w=1200&q=85",
      "https://images.unsplash.com/photo-1493238792000-8113da705763?w=1200&q=85",
    ],
    tagline: "L'art de la performance pure",
    highlights: [
      "340 ch — 0 à 100 km/h en 4,3 s",
      "Moteur 6 cylindres en ligne turbo BMW B58",
      "Propulsion arrière avec diff électronique",
      "Finition cockpit biplace racing",
    ],
    targetProfiles: ["Sportif", "Passionné", "Célibataire"],
    isHybrid: false,
    isNew: false,
    rating: 4.8,
    reviewCount: 142,
    priceFrom: 520000,
    colors: [
      { id: "white-pearl", name: "Blanc Nacré", hex: "#F5F5F5", type: "pearl" },
      { id: "black-midnight", name: "Noir Minuit", hex: "#0D0D0D", type: "metallic" },
      { id: "red-toyota", name: "Rouge Toyota", hex: "#EB0A1E", type: "solid" },
      { id: "blue-storm", name: "Bleu Tempête", hex: "#1B3A6B", type: "metallic" },
      { id: "silver-lunar", name: "Argent Lunaire", hex: "#C0C0C0", type: "metallic" },
    ],
    wheels: [
      { id: "sport-18", name: 'Sport 18"', size: "18 pouces" },
      { id: "racing-19", name: 'Racing 19"', size: "19 pouces" },
      { id: "forged-20", name: 'Forgé 20"', size: "20 pouces" },
    ],
    interiors: [
      { id: "black-fabric", name: "Tissu Noir Sport", material: "fabric", colorHex: "#1A1A1A" },
      { id: "red-leather", name: "Cuir Rouge", material: "leather", colorHex: "#8B0000" },
      { id: "black-premium", name: "Cuir Premium Noir", material: "premium-leather", colorHex: "#0A0A0A" },
    ],
    specs: {
      engine: "3.0L Turbo BMW B58",
      engineType: "Essence",
      power: 340,
      torque: 500,
      transmission: "Automatique 8 rapports",
      drivetrain: "RWD",
      zeroto100: 4.3,
      topSpeed: 250,
      consumption: 10.2,
      trunkLiters: 290,
      seats: 2,
      weight: 1570,
      length: 4379,
      width: 1854,
      height: 1294,
      wheelbase: 2470,
      warranty: "3 ans / 100 000 km",
    },
    description:
      "La Toyota Supra représente l'apogée du sport automobile japonais. Avec son moteur turbo 6 cylindres de 340 ch développé en partenariat avec BMW, elle offre une expérience de conduite pure et adrénalinique. Propulsion arrière, boîte automatique 8 rapports et différentiel électronique : chaque virage devient un plaisir.",
  },

  // ── 2. Toyota RAV4 ───────────────────────────────────────────────────────────
  {
    id: "rav4",
    name: "Toyota RAV4",
    category: "SUV Familial",
    model3dPath: "/models/rav4.glb",
    imageUrl: "/images/vehicles/rav4.jpg",
    images: [
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=1200&q=85",
      "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1200&q=85",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=85",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=85",
    ],
    tagline: "Le SUV hybride qui s'adapte à tout",
    highlights: [
      "2.5L Hybride — 222 ch et 6,0 L/100 km",
      "Intégrale AWD-i intelligente en option",
      "580 L de coffre modulable",
      "Toyota Safety Sense 2.0 de série",
    ],
    targetProfiles: ["Famille", "Professionnel", "Aventurier"],
    isHybrid: true,
    isNew: false,
    rating: 4.7,
    reviewCount: 389,
    priceFrom: 310000,
    colors: [
      { id: "white-pearl", name: "Blanc Nacré", hex: "#F5F5F5", type: "pearl" },
      { id: "black-midnight", name: "Noir Minuit", hex: "#0D0D0D", type: "metallic" },
      { id: "grey-urban", name: "Gris Urbain", hex: "#6B7280", type: "metallic" },
      { id: "blue-dynamic", name: "Bleu Dynamique", hex: "#2563EB", type: "metallic" },
      { id: "red-emotion", name: "Rouge Émotion", hex: "#DC2626", type: "solid" },
    ],
    wheels: [
      { id: "alloy-17", name: 'Aluminium 17"', size: "17 pouces" },
      { id: "sport-18", name: 'Sport 18"', size: "18 pouces" },
      { id: "diamond-19", name: 'Diamant 19"', size: "19 pouces" },
    ],
    interiors: [
      { id: "grey-fabric", name: "Tissu Gris", material: "fabric", colorHex: "#6B7280" },
      { id: "beige-leather", name: "Cuir Beige", material: "leather", colorHex: "#D4B896" },
      { id: "black-leather", name: "Cuir Noir", material: "leather", colorHex: "#1A1A1A" },
    ],
    specs: {
      engine: "2.5L Hybride (M20A-FXS)",
      engineType: "Hybride",
      power: 222,
      torque: 385,
      transmission: "CVT e-Drive",
      drivetrain: "AWD",
      zeroto100: 8.1,
      topSpeed: 180,
      consumption: 6.0,
      trunkLiters: 580,
      seats: 5,
      weight: 1795,
      length: 4600,
      width: 1855,
      height: 1685,
      wheelbase: 2690,
      groundClearance: 200,
      towingCapacity: 1650,
      warranty: "3 ans / 100 000 km",
    },
    description:
      "Le RAV4 hybride est le SUV familial par excellence. Spacieux, économique et polyvalent, il s'adapte parfaitement à tous les styles de vie marocains. Avec sa technologie hybride auto-rechargeable et son intégrale intelligente, il traverse les terrains urbains comme les pistes sahariennes.",
  },

  // ── 3. Toyota Yaris ──────────────────────────────────────────────────────────
  {
    id: "yaris",
    name: "Toyota Yaris",
    category: "Citadine",
    model3dPath: "/models/yaris.glb",
    imageUrl: "/images/vehicles/yaris.jpg",
    images: [
      "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1200&q=85",
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=1200&q=85",
      "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1200&q=85",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=85",
    ],
    tagline: "La ville à votre rythme, sans effort",
    highlights: [
      "Seulement 3,8 L/100 km — la plus économique",
      "Hybride auto-rechargeable de série",
      "Compacte 3,94 m — idéale pour se garer",
      "Écran 9\" avec CarPlay & Android Auto",
    ],
    targetProfiles: ["Citadin", "Jeune actif", "Économe"],
    isHybrid: true,
    isNew: false,
    rating: 4.6,
    reviewCount: 521,
    priceFrom: 175000,
    colors: [
      { id: "white-pure", name: "Blanc Pur", hex: "#FFFFFF", type: "solid" },
      { id: "red-flash", name: "Rouge Flash", hex: "#EB0A1E", type: "solid" },
      { id: "yellow-solar", name: "Jaune Solaire", hex: "#FCD34D", type: "solid" },
      { id: "grey-tech", name: "Gris Tech", hex: "#9CA3AF", type: "metallic" },
      { id: "blue-electric", name: "Bleu Électrique", hex: "#3B82F6", type: "metallic" },
    ],
    wheels: [
      { id: "steel-15", name: 'Acier 15"', size: "15 pouces" },
      { id: "alloy-16", name: 'Aluminium 16"', size: "16 pouces" },
      { id: "sport-17", name: 'Sport 17"', size: "17 pouces" },
    ],
    interiors: [
      { id: "black-fabric", name: "Tissu Noir", material: "fabric", colorHex: "#1A1A1A" },
      { id: "blue-fabric", name: "Tissu Bleu", material: "fabric", colorHex: "#1E40AF" },
      { id: "grey-leather", name: "Cuir Gris", material: "leather", colorHex: "#6B7280" },
    ],
    specs: {
      engine: "1.5L Hybride (M15A-FXE)",
      engineType: "Hybride",
      power: 116,
      torque: 185,
      transmission: "CVT e-Drive",
      drivetrain: "FWD",
      zeroto100: 9.4,
      topSpeed: 165,
      consumption: 3.8,
      trunkLiters: 286,
      seats: 5,
      weight: 1120,
      length: 3940,
      width: 1745,
      height: 1500,
      wheelbase: 2560,
      warranty: "3 ans / 100 000 km",
    },
    description:
      "La Yaris hybride est la citadine intelligente par excellence. Compacte, agile et ultra-économique, elle est parfaite pour naviguer dans les villes marocaines. Avec seulement 3,8 L/100 km, elle est la voiture la plus économique de sa catégorie.",
  },

  // ── 4. Toyota Corolla ─────────────────────────────────────────────────────────
  {
    id: "corolla",
    name: "Toyota Corolla",
    category: "Compacte Hybride",
    model3dPath: "/models/corolla.glb",
    imageUrl: "/images/vehicles/corolla.jpg",
    images: [
      "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=1200&q=85",
      "https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=1200&q=85",
      "https://images.unsplash.com/photo-1485291571150-772bcfc10da5?w=1200&q=85",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=85",
    ],
    tagline: "Fiabilité légendaire, technologie moderne",
    highlights: [
      "1.8L Hybride — 140 ch et 4,5 L/100 km",
      "La voiture la plus vendue de l'histoire",
      "Coffre de 361 L avec plancher plat",
      "Garantie 3 ans incluse",
    ],
    targetProfiles: ["Famille", "Professionnel", "Trajet domicile-travail"],
    isHybrid: true,
    isNew: false,
    rating: 4.7,
    reviewCount: 672,
    priceFrom: 235000,
    colors: [
      { id: "white-pearl", name: "Blanc Nacré", hex: "#F5F5F5", type: "pearl" },
      { id: "black-midnight", name: "Noir Minuit", hex: "#0D0D0D", type: "metallic" },
      { id: "grey-silver", name: "Gris Argent", hex: "#9CA3AF", type: "metallic" },
      { id: "red-crimson", name: "Rouge Cramoisi", hex: "#B91C1C", type: "solid" },
      { id: "blue-sapphire", name: "Bleu Saphir", hex: "#1E3A8A", type: "metallic" },
    ],
    wheels: [
      { id: "alloy-16", name: 'Aluminium 16"', size: "16 pouces" },
      { id: "sport-17", name: 'Sport 17"', size: "17 pouces" },
      { id: "diamond-18", name: 'Diamant 18"', size: "18 pouces" },
    ],
    interiors: [
      { id: "black-fabric", name: "Tissu Noir", material: "fabric", colorHex: "#1A1A1A" },
      { id: "grey-fabric", name: "Tissu Gris", material: "fabric", colorHex: "#6B7280" },
      { id: "black-leather", name: "Cuir Noir", material: "leather", colorHex: "#1A1A1A" },
    ],
    specs: {
      engine: "1.8L Hybride (2ZR-FXE)",
      engineType: "Hybride",
      power: 140,
      torque: 142,
      transmission: "CVT e-Drive",
      drivetrain: "FWD",
      zeroto100: 10.9,
      topSpeed: 180,
      consumption: 4.5,
      trunkLiters: 361,
      seats: 5,
      weight: 1370,
      length: 4620,
      width: 1780,
      height: 1435,
      wheelbase: 2700,
      warranty: "3 ans / 100 000 km",
    },
    description:
      "La Corolla hybride incarne la fiabilité Toyota réinventée. Élégante et technologique, elle offre le parfait équilibre entre confort quotidien et conscience écologique. La voiture la plus vendue de l'histoire continue d'évoluer avec une motorisation hybride efficiente.",
  },

  // ── 5. Toyota Camry ──────────────────────────────────────────────────────────
  {
    id: "camry",
    name: "Toyota Camry",
    category: "Berline Confort",
    model3dPath: "/models/camry.glb",
    imageUrl: "/images/vehicles/camry.jpg",
    images: [
      "https://images.unsplash.com/photo-1590362891991-f776e747a588?w=1200&q=85",
      "https://images.unsplash.com/photo-1606152421802-db97b9c7a11b?w=1200&q=85",
      "https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=1200&q=85",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=85",
    ],
    tagline: "Le confort premium accessible",
    highlights: [
      "2.5L Hybride — 218 ch et 5,2 L/100 km",
      "Intérieur luxueux avec cuir de série",
      "Isolation phonique niveau berline premium",
      "Head-up display et système audio JBL",
    ],
    targetProfiles: ["Cadre", "Famille aisée", "Longue distance"],
    isHybrid: true,
    isNew: false,
    rating: 4.6,
    reviewCount: 298,
    priceFrom: 280000,
    colors: [
      { id: "white-pearl", name: "Blanc Nacré", hex: "#F5F5F5", type: "pearl" },
      { id: "black-obsidian", name: "Noir Obsidien", hex: "#0A0A0A", type: "metallic" },
      { id: "grey-platinum", name: "Gris Platine", hex: "#E5E7EB", type: "metallic" },
      { id: "silver-chrome", name: "Argent Chromé", hex: "#D1D5DB", type: "metallic" },
      { id: "bronze-gold", name: "Bronze Doré", hex: "#C9A84C", type: "metallic" },
    ],
    wheels: [
      { id: "alloy-17", name: 'Aluminium 17"', size: "17 pouces" },
      { id: "luxury-18", name: 'Luxe 18"', size: "18 pouces" },
      { id: "prestige-19", name: 'Prestige 19"', size: "19 pouces" },
    ],
    interiors: [
      { id: "beige-leather", name: "Cuir Beige Ivoire", material: "leather", colorHex: "#D4B896" },
      { id: "black-leather", name: "Cuir Noir", material: "leather", colorHex: "#1A1A1A" },
      { id: "brown-premium", name: "Cuir Brun Premium", material: "premium-leather", colorHex: "#7C3A1E" },
    ],
    specs: {
      engine: "2.5L Hybride (A25A-FXS)",
      engineType: "Hybride",
      power: 218,
      torque: 221,
      transmission: "CVT e-Drive",
      drivetrain: "FWD",
      zeroto100: 8.3,
      topSpeed: 180,
      consumption: 5.2,
      trunkLiters: 524,
      seats: 5,
      weight: 1585,
      length: 4885,
      width: 1840,
      height: 1445,
      wheelbase: 2825,
      warranty: "3 ans / 100 000 km",
    },
    description:
      "La Camry hybride redéfinit la berline de confort. Silencieuse, spacieuse et luxueuse, elle offre une expérience de conduite apaisante pour les longs trajets. Son habitacle premium avec finitions soignées rivalise avec des berlines deux fois plus chères.",
  },

  // ── 6. Toyota Land Cruiser ────────────────────────────────────────────────────
  {
    id: "landcruiser",
    name: "Toyota Land Cruiser",
    category: "Tout-terrain extrême",
    model3dPath: "/models/landcruiser.glb",
    imageUrl: "/images/vehicles/landcruiser.jpg",
    images: [
      "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?w=1200&q=85",
      "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=1200&q=85",
      "https://images.unsplash.com/photo-1499946981954-9a7e214e77e6?w=1200&q=85",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=85",
    ],
    tagline: "Aucune limite, aucun terrain",
    highlights: [
      "3.3L V6 Diesel — 309 ch et 700 Nm de couple",
      "Boîte de transfert 4WD avec blocages",
      "7 places luxueuses tout-terrain",
      "Capacité de remorquage 3 500 kg",
    ],
    targetProfiles: ["Aventurier", "Famille", "Grand voyageur"],
    isHybrid: false,
    isNew: false,
    rating: 4.9,
    reviewCount: 187,
    priceFrom: 680000,
    colors: [
      { id: "white-pearl", name: "Blanc Nacré", hex: "#F5F5F5", type: "pearl" },
      { id: "black-midnight", name: "Noir Minuit", hex: "#0D0D0D", type: "metallic" },
      { id: "grey-granite", name: "Gris Granit", hex: "#4B5563", type: "metallic" },
      { id: "beige-desert", name: "Beige Désert", hex: "#D4B896", type: "solid" },
      { id: "green-military", name: "Vert Militaire", hex: "#365314", type: "solid" },
    ],
    wheels: [
      { id: "allterrain-18", name: 'Tout-terrain 18"', size: "18 pouces" },
      { id: "allterrain-20", name: 'Tout-terrain 20"', size: "20 pouces" },
      { id: "rock-21", name: 'Rock Crawler 21"', size: "21 pouces" },
    ],
    interiors: [
      { id: "beige-leather", name: "Cuir Beige", material: "leather", colorHex: "#D4B896" },
      { id: "black-leather", name: "Cuir Noir", material: "leather", colorHex: "#1A1A1A" },
      { id: "brown-premium", name: "Cuir Brun Luxe", material: "premium-leather", colorHex: "#7C3A1E" },
    ],
    specs: {
      engine: "3.3L V6 Biturbo Diesel (F33A-FTV)",
      engineType: "Diesel",
      power: 309,
      torque: 700,
      transmission: "Automatique 10 rapports",
      drivetrain: "4WD",
      zeroto100: 6.7,
      topSpeed: 210,
      consumption: 11.0,
      trunkLiters: 310,
      seats: 7,
      weight: 2580,
      length: 4985,
      width: 1980,
      height: 1925,
      wheelbase: 2850,
      groundClearance: 235,
      towingCapacity: 3500,
      warranty: "3 ans / 100 000 km",
    },
    description:
      "Le Land Cruiser est une légende tout-terrain indestructible. Conçu pour les terrains les plus extrêmes du Maroc et du Sahara, il allie puissance brute et luxe raffiné. Son V6 biturbo diesel de 700 Nm et sa transmission 4WD intégrale le rendent imbattable en hors-piste.",
  },

  // ── 7. Toyota Hilux ──────────────────────────────────────────────────────────
  {
    id: "hilux",
    name: "Toyota Hilux",
    category: "Pick-up utilitaire",
    model3dPath: "/models/hilux.glb",
    imageUrl: "/images/vehicles/hilux.jpg",
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=85",
      "https://images.unsplash.com/photo-1566473965997-3de9c817e938?w=1200&q=85",
      "https://images.unsplash.com/photo-1542362567-b07e54358753?w=1200&q=85",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=85",
    ],
    tagline: "Inarrêtable. Indestructible. Indispensable.",
    highlights: [
      "2.8L Diesel D-4D — 204 ch et 500 Nm",
      "Charge utile de 1 035 kg",
      "Remorquage jusqu'à 3 500 kg",
      "Le pick-up le plus vendu au monde",
    ],
    targetProfiles: ["Professionnel", "Artisan", "Agriculteur", "Aventurier"],
    isHybrid: false,
    isNew: false,
    rating: 4.8,
    reviewCount: 445,
    priceFrom: 295000,
    colors: [
      { id: "white-solid", name: "Blanc Glacier", hex: "#FFFFFF", type: "solid" },
      { id: "black-metallic", name: "Noir Métallique", hex: "#1A1A1A", type: "metallic" },
      { id: "grey-silver", name: "Argent Glacier", hex: "#9CA3AF", type: "metallic" },
      { id: "red-strong", name: "Rouge Puissance", hex: "#991B1B", type: "solid" },
      { id: "blue-workman", name: "Bleu Travail", hex: "#1E3A8A", type: "solid" },
    ],
    wheels: [
      { id: "steel-16", name: 'Acier 16"', size: "16 pouces" },
      { id: "allterrain-17", name: 'Tout-terrain 17"', size: "17 pouces" },
      { id: "allterrain-18", name: 'Tout-terrain 18"', size: "18 pouces" },
    ],
    interiors: [
      { id: "black-fabric", name: "Tissu Noir Robuste", material: "fabric", colorHex: "#1A1A1A" },
      { id: "grey-fabric", name: "Tissu Gris", material: "fabric", colorHex: "#4B5563" },
      { id: "black-leather", name: "Cuir Noir", material: "leather", colorHex: "#1A1A1A" },
    ],
    specs: {
      engine: "2.8L Diesel D-4D (1GD-FTV)",
      engineType: "Diesel",
      power: 204,
      torque: 500,
      transmission: "Automatique 6 rapports",
      drivetrain: "4WD",
      zeroto100: 10.5,
      topSpeed: 175,
      consumption: 8.5,
      trunkLiters: 0, // plateau extérieur
      seats: 5,
      weight: 2015,
      length: 5330,
      width: 1855,
      height: 1815,
      wheelbase: 3085,
      groundClearance: 310,
      towingCapacity: 3500,
      payload: 1035,
      warranty: "3 ans / 100 000 km",
    },
    description:
      "Le Hilux est le pick-up le plus vendu au monde depuis plus de 50 ans. Robuste, fiable et polyvalent, il est indispensable pour les professionnels et les aventuriers marocains. Sa garde au sol de 310 mm et son 4WD permanent le rendent imbattable.",
  },

  // ── 8. Toyota Prius ──────────────────────────────────────────────────────────
  {
    id: "prius",
    name: "Toyota Prius",
    category: "Éco/Tech",
    model3dPath: "/models/prius.glb",
    imageUrl: "/images/vehicles/prius.jpg",
    images: [
      "https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=1200&q=85",
      "https://images.unsplash.com/photo-1548612319-b0a2c2b399e1?w=1200&q=85",
      "https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=1200&q=85",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=85",
    ],
    tagline: "80 km 100% électrique, zéro compromis",
    highlights: [
      "PHEV — 80 km en mode 100% électrique",
      "1,0 L/100 km en cycle mixte rechargé",
      "Charge rapide DC en 2h30",
      "Design aérodynamique Cx 0,27",
    ],
    targetProfiles: ["Écolo", "Technophile", "Navetteur urbain"],
    isHybrid: true,
    isNew: true,
    rating: 4.5,
    reviewCount: 213,
    priceFrom: 260000,
    colors: [
      { id: "white-pure", name: "Blanc Solaire", hex: "#F9FAFB", type: "pearl" },
      { id: "black-midnight", name: "Noir Midnight", hex: "#0A0A0A", type: "metallic" },
      { id: "grey-titanium", name: "Gris Titane", hex: "#6B7280", type: "metallic" },
      { id: "silver-eco", name: "Argent Éco", hex: "#D1D5DB", type: "metallic" },
      { id: "green-eco", name: "Vert Éco", hex: "#166534", type: "metallic" },
    ],
    wheels: [
      { id: "eco-15", name: 'Éco 15"', size: "15 pouces" },
      { id: "aero-17", name: 'Aero 17"', size: "17 pouces" },
      { id: "tech-19", name: 'Tech 19"', size: "19 pouces" },
    ],
    interiors: [
      { id: "grey-eco", name: "Tissu Eco Gris", material: "fabric", colorHex: "#6B7280" },
      { id: "black-fabric", name: "Tissu Noir", material: "fabric", colorHex: "#1A1A1A" },
      { id: "white-leather", name: "Cuir Blanc Tech", material: "leather", colorHex: "#F9FAFB" },
    ],
    specs: {
      engine: "2.0L Hybride Plug-in (A25A-FXS + moteur électrique)",
      engineType: "PHEV",
      power: 223,
      torque: 205,
      transmission: "CVT e-Drive",
      drivetrain: "FWD",
      zeroto100: 6.8,
      topSpeed: 177,
      consumption: 1.0,
      autonomyEV: 80,
      trunkLiters: 284,
      seats: 5,
      weight: 1645,
      length: 4600,
      width: 1780,
      height: 1430,
      wheelbase: 2750,
      warranty: "3 ans / 100 000 km — 8 ans batterie",
    },
    description:
      "La Prius PHEV révolutionne la mobilité éco-responsable. Avec sa technologie hybride plug-in de dernière génération, elle offre jusqu'à 80 km en mode 100% électrique. Rechargée quotidiennement, la plupart des trajets urbains se font à coût quasi-zéro.",
  },

  // ── 9. Toyota C-HR ───────────────────────────────────────────────────────────
  {
    id: "chr",
    name: "Toyota C-HR",
    category: "SUV Urbain",
    model3dPath: "/models/chr.glb",
    imageUrl: "/images/vehicles/chr.jpg",
    images: [
      "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=1200&q=85",
      "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=1200&q=85",
      "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1200&q=85",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=85",
    ],
    tagline: "Design audacieux, âme hybride",
    highlights: [
      "2.0L Hybride — 197 ch et 5,5 L/100 km",
      "Design coupé SUV exclusif",
      "Mode Sport avec sonorité synthétique",
      "Écran 12,3\" avec son JBL 9 haut-parleurs",
    ],
    targetProfiles: ["Citadin branché", "Jeune professionnel", "Design lover"],
    isHybrid: true,
    isNew: true,
    rating: 4.5,
    reviewCount: 176,
    priceFrom: 245000,
    colors: [
      { id: "white-pearl", name: "Blanc Nacré", hex: "#F5F5F5", type: "pearl" },
      { id: "black-roof", name: "Noir Toit Biton", hex: "#0A0A0A", type: "metallic" },
      { id: "red-dynamic", name: "Rouge Dynamique", hex: "#DC2626", type: "solid" },
      { id: "orange-pulse", name: "Orange Pulse", hex: "#EA580C", type: "metallic" },
      { id: "blue-urban", name: "Bleu Urbain", hex: "#2563EB", type: "metallic" },
    ],
    wheels: [
      { id: "alloy-17", name: 'Aluminium 17"', size: "17 pouces" },
      { id: "design-18", name: 'Design 18"', size: "18 pouces" },
      { id: "sport-19", name: 'Sport 19"', size: "19 pouces" },
    ],
    interiors: [
      { id: "black-fabric", name: "Tissu Sport Noir", material: "fabric", colorHex: "#1A1A1A" },
      { id: "red-fabric", name: "Tissu Rouge", material: "fabric", colorHex: "#7F1D1D" },
      { id: "black-leather", name: "Cuir Noir", material: "leather", colorHex: "#1A1A1A" },
    ],
    specs: {
      engine: "2.0L Hybride (M20A-FXS)",
      engineType: "Hybride",
      power: 197,
      torque: 190,
      transmission: "CVT e-Drive",
      drivetrain: "FWD",
      zeroto100: 8.5,
      topSpeed: 180,
      consumption: 5.5,
      trunkLiters: 388,
      seats: 5,
      weight: 1615,
      length: 4365,
      width: 1830,
      height: 1565,
      wheelbase: 2640,
      groundClearance: 160,
      warranty: "3 ans / 100 000 km",
    },
    description:
      "Le C-HR hybride s'impose comme le SUV urbain le plus audacieux. Son design coupé unique avec toit flottant et ses technologies hybrides en font le choix parfait pour les citadins modernes qui refusent de sacrifier le style à la sobriété.",
  },

  // ── 10. Toyota Highlander ─────────────────────────────────────────────────────
  {
    id: "highlander",
    name: "Toyota Highlander",
    category: "SUV 7 places",
    model3dPath: "/models/highlander.glb",
    imageUrl: "/images/vehicles/highlander.jpg",
    images: [
      "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=1200&q=85",
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=1200&q=85",
      "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?w=1200&q=85",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=85",
    ],
    tagline: "Grand SUV, grande famille, grand confort",
    highlights: [
      "2.5L Hybride AWD — 248 ch et 6,8 L/100 km",
      "7 places avec 3ème rangée adultes",
      "Système Panoramic View Monitor 360°",
      "Intérieur luxueux 3 rangées en cuir",
    ],
    targetProfiles: ["Grande famille", "Chef d'entreprise", "Long voyage"],
    isHybrid: true,
    isNew: false,
    rating: 4.7,
    reviewCount: 134,
    priceFrom: 580000,
    colors: [
      { id: "white-pearl", name: "Blanc Nacré", hex: "#F5F5F5", type: "pearl" },
      { id: "black-midnight", name: "Noir Minuit", hex: "#0A0A0A", type: "metallic" },
      { id: "grey-silver", name: "Gris Argent", hex: "#9CA3AF", type: "metallic" },
      { id: "bronze-luxury", name: "Bronze Luxe", hex: "#C9A84C", type: "metallic" },
      { id: "blue-deep", name: "Bleu Profond", hex: "#1E3A8A", type: "metallic" },
    ],
    wheels: [
      { id: "alloy-18", name: 'Aluminium 18"', size: "18 pouces" },
      { id: "luxury-20", name: 'Luxe 20"', size: "20 pouces" },
      { id: "prestige-21", name: 'Prestige 21"', size: "21 pouces" },
    ],
    interiors: [
      { id: "beige-leather", name: "Cuir Beige 7 places", material: "leather", colorHex: "#D4B896" },
      { id: "black-leather", name: "Cuir Noir 7 places", material: "leather", colorHex: "#1A1A1A" },
      { id: "brown-premium", name: "Cuir Brun Premium", material: "premium-leather", colorHex: "#7C3A1E" },
    ],
    specs: {
      engine: "2.5L Hybride AWD (A25A-FXS + 2 moteurs électriques)",
      engineType: "Hybride",
      power: 248,
      torque: 239,
      transmission: "CVT e-Drive",
      drivetrain: "AWD",
      zeroto100: 8.0,
      topSpeed: 180,
      consumption: 6.8,
      trunkLiters: 658,
      seats: 7,
      weight: 2045,
      length: 4965,
      width: 1925,
      height: 1735,
      wheelbase: 2850,
      groundClearance: 195,
      towingCapacity: 2000,
      warranty: "3 ans / 100 000 km",
    },
    description:
      "Le Highlander hybride est le SUV 7 places par excellence. Grand, luxueux et économique, il répond parfaitement aux besoins des grandes familles marocaines. Sa motorisation hybride AWD procure agilité et économies, avec une 3ème rangée de sièges confortable pour adultes.",
  },
];

// ─── Utility Functions ─────────────────────────────────────────────────────────

export function getVehicleById(id: string): Vehicle | undefined {
  return VEHICLES_DATA.find((v) => v.id === id);
}

export function getVehiclesByCategory(category: string): Vehicle[] {
  return VEHICLES_DATA.filter(
    (v) => v.category.toLowerCase() === category.toLowerCase()
  );
}

export function searchVehicles(query: string): Vehicle[] {
  const q = query.toLowerCase().trim();
  if (!q) return VEHICLES_DATA;
  return VEHICLES_DATA.filter(
    (v) =>
      v.name.toLowerCase().includes(q) ||
      v.category.toLowerCase().includes(q) ||
      v.tagline.toLowerCase().includes(q) ||
      v.specs.engine.toLowerCase().includes(q) ||
      v.description.toLowerCase().includes(q)
  );
}

// ─── Pure-logic recommendation fallback ───────────────────────────────────────
// Used when Gemini is slow/unavailable. Scores each vehicle against user preferences.

export function getRecommendations(
  preferences: UserPreferences,
  limit = 3
): Vehicle[] {
  type Score = { vehicle: Vehicle; score: number };

  const scored: Score[] = VEHICLES_DATA.map((v) => {
    let score = 0;

    // Budget matching
    if (preferences.budget) {
      const price = v.priceFrom;
      const inBudget =
        (preferences.budget === "under-200k" && price < 200000) ||
        (preferences.budget === "200k-350k" && price >= 200000 && price <= 350000) ||
        (preferences.budget === "350k-550k" && price > 350000 && price <= 550000) ||
        (preferences.budget === "over-550k" && price > 550000);
      score += inBudget ? 30 : 0;
    }

    // Usage matching
    if (preferences.usage) {
      const usageMap: Record<string, string[]> = {
        family: ["SUV Familial", "SUV 7 places", "Berline Confort", "Compacte Hybride"],
        city: ["Citadine", "SUV Urbain", "Compacte Hybride", "Éco/Tech"],
        offroad: ["Tout-terrain extrême", "Pick-up utilitaire", "SUV Familial"],
        sport: ["Sport", "SUV Urbain"],
        eco: ["Éco/Tech", "Citadine", "Compacte Hybride", "SUV Familial"],
      };
      const matched = usageMap[preferences.usage] ?? [];
      if (matched.includes(v.category)) score += 25;
    }

    // Fuel type
    if (preferences.fuelType && preferences.fuelType !== "no-preference") {
      const engineType = v.specs.engineType.toLowerCase();
      const match =
        (preferences.fuelType === "hybrid" && (engineType === "hybride" || engineType === "phev")) ||
        (preferences.fuelType === "petrol" && engineType === "essence") ||
        (preferences.fuelType === "diesel" && engineType === "diesel");
      score += match ? 20 : 0;
    }

    // Priority
    if (preferences.priority) {
      if (preferences.priority === "comfort" && ["Berline Confort", "SUV 7 places", "SUV Familial"].includes(v.category)) score += 15;
      if (preferences.priority === "economy" && v.specs.consumption <= 5.5) score += 15;
      if (preferences.priority === "technology" && v.isHybrid) score += 10;
      if (preferences.priority === "performance" && v.specs.power >= 200) score += 15;
      if (preferences.priority === "value" && v.priceFrom <= 300000) score += 15;
    }

    // Bonus for high rating
    score += (v.rating - 4) * 5;

    return { vehicle: v, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.vehicle);
}
