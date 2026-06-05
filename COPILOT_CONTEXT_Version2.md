# 🚗 Toyota AI Platform — Master Project Context

## ⚠️ CRITICAL INSTRUCTIONS FOR COPILOT
- You will create ALL files, ALL folders, ALL configuration
- The developer ONLY provides .env.local values and 3D model files
- Generate complete, production-ready code — never use placeholders like "// TODO" or "add logic here"
- Always create the full implementation, not stubs
- When asked to create a file, also create all parent directories

---

## Project Identity
- **Name:** Toyota AI Experience Platform
- **Type:** Full-Stack Web Application
- **Purpose:** Interactive Toyota vehicle consultation and configuration platform powered by AI
- **Team:** Badr Eddine Boudhim (Backend + AI + Architecture) & Taha (Frontend + 3D)
- **Timeline:** 3 weeks to full completion
- **Language:** French UI, multilingual AI (French/Arabic/English)

---

## Tech Stack (NON-NEGOTIABLE)

### Frontend
- **Framework:** Next.js 14 with App Router (`/app` directory, NOT `/pages`)
- **3D Engine:** React Three Fiber (`@react-three/fiber`) + `@react-three/drei`
- **Styling:** Tailwind CSS v3
- **UI Components:** shadcn/ui
- **Animations:** Framer Motion
- **State Management:** Zustand
- **Language:** TypeScript (strict mode, NO `any`)
- **Forms:** React Hook Form + Zod

### Backend
- **API:** Next.js 14 API Routes (`/app/api/`)
- **ORM:** Prisma with PostgreSQL
- **Auth:** NextAuth.js v5 (beta)
- **Runtime:** Node.js 20+

### Database
- **Provider:** Supabase (PostgreSQL)
- **ORM Layer:** Prisma

### AI / ML
- **Main AI:** Google Gemini 1.5 Flash (`@google/generative-ai`)
- **Streaming:** Vercel AI SDK (`ai` package) — `useChat` hook
- **ML Service:** Python FastAPI (scikit-learn) — in `/ml-service/` folder

### Deployment
- **App:** Vercel
- **DB:** Supabase  
- **ML:** Railway.app

---

## Complete File Structure (Create ALL of this)

```
toyota-ai-platform/
├── .env.local                          ← Developer fills this
├── .env.example                        ← Template with empty values
├── .gitignore                          ← Include .env.local, node_modules, .next
├── package.json
├── next.config.js                      ← GLB support + image domains
├── tailwind.config.ts
├── tsconfig.json
├── middleware.ts                       ← Protect admin routes
├── prisma/
│   ├── schema.prisma
│   └── seed.ts                         ← Full seed with 10 vehicles
├── public/
│   └── models/                         ← Developer places GLB files here
│       └── .gitkeep
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx                  ← Root layout with fonts + providers
│   │   ├── page.tsx                    ← Landing page
│   │   ├── (client)/
│   │   │   ├── chat/page.tsx           ← AI Chatbot
│   │   │   ├── catalog/page.tsx        ← All vehicles
│   │   │   ├── configurator/
│   │   │   │   └── [model]/page.tsx    ← 3D configurator per model
│   │   │   └── reservation/page.tsx    ← Book test drive
│   │   ├── (admin)/
│   │   │   ├── login/page.tsx          ← Admin login
│   │   │   ├── dashboard/page.tsx      ← Overview stats
│   │   │   ├── leads/page.tsx          ← All leads table
│   │   │   └── reservations/page.tsx   ← All reservations table
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts
│   │       ├── chat/route.ts           ← Gemini streaming chat
│   │       ├── recommend/route.ts      ← AI recommendation
│   │       ├── leads/route.ts          ← CRUD leads
│   │       ├── reservations/route.ts   ← CRUD reservations
│   │       └── vehicles/
│   │           ├── route.ts            ← GET all vehicles
│   │           └── [id]/route.ts       ← GET single vehicle
│   ├── components/
│   │   ├── ui/                         ← shadcn components (auto-generated)
│   │   ├── providers/
│   │   │   └── Providers.tsx           ← Wraps app with all context providers
│   │   ├── chat/
│   │   │   ├── ChatInterface.tsx
│   │   │   ├── ChatMessage.tsx
│   │   │   ├── ChatInput.tsx
│   │   │   └── VehicleRecommendationCard.tsx
│   │   ├── configurator/
│   │   │   ├── CarScene.tsx            ← R3F Canvas
│   │   │   ├── CarModel.tsx            ← GLB loader
│   │   │   ├── ConfigPanel.tsx         ← Options panel
│   │   │   └── AIStyleAdvisor.tsx      ← AI tips popup
│   │   ├── catalog/
│   │   │   ├── VehicleCard.tsx
│   │   │   └── VehicleGrid.tsx
│   │   ├── forms/
│   │   │   ├── LeadForm.tsx
│   │   │   └── ReservationForm.tsx
│   │   ├── admin/
│   │   │   ├── AdminSidebar.tsx
│   │   │   ├── StatsCard.tsx
│   │   │   └── DataTable.tsx
│   │   └── layout/
│   │       ├── Header.tsx
│   │       └── Footer.tsx
│   ├── lib/
│   │   ├── prisma.ts                   ← Prisma singleton
│   │   ├── gemini.ts                   ← Gemini client
│   │   ├── auth.ts                     ← NextAuth config
│   │   └── utils.ts                    ← cn() helper
│   ├── store/
│   │   ├── chatStore.ts
│   │   ├── configuratorStore.ts
│   │   └── userStore.ts
│   ├── types/
│   │   └── index.ts                    ← All TypeScript interfaces
│   └── data/
│       └── vehicles.ts                 ← Static vehicle data
└── ml-service/
    ├── main.py                         ← FastAPI app
    ├── model.py                        ← scikit-learn model
    ├── requirements.txt
    ├── Procfile                        ← Railway deployment
    └── .env.example
```

---

## Environment Variables (.env.local structure)

```env
# ─── DATABASE (Supabase + Prisma) ─────────────────────
DATABASE_URL=""          # Supabase → Connect → ORMs → "Transaction pooler" string
DIRECT_URL=""            # Supabase → Connect → ORMs → "Session pooler" or direct string

# ─── SUPABASE CLIENT ──────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=""        # Supabase → Settings → API → Project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=""   # Supabase → Settings → API → anon public key
SUPABASE_SERVICE_ROLE_KEY=""       # Supabase → Settings → API → service_role key (SECRET)

# ─── AI ───────────────────────────────────────────────
GEMINI_API_KEY=""        # aistudio.google.com → Get API Key

# ─── AUTH ─────────────────────────────────────────────
NEXTAUTH_SECRET=""       # Generate: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"

# ─── ML SERVICE ───────────────────────────────────────
ML_SERVICE_URL="http://localhost:8000"

# ─── APP ──────────────────────────────────────────────
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## Supabase Keys Usage in Code

```typescript
// NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY
// → Used in Supabase client for frontend (safe to expose)
// → Real-time subscriptions, storage for assets

// SUPABASE_SERVICE_ROLE_KEY  
// → Used ONLY in server-side API routes
// → Bypasses Row Level Security — NEVER expose to frontend

// DATABASE_URL + DIRECT_URL
// → Used ONLY by Prisma in prisma/schema.prisma
// → Never used directly in application code
```

---

## Vehicle Catalog (10 Models — Fixed)

```typescript
export const VEHICLES_DATA = [
  {
    id: "supra",
    name: "Toyota Supra",
    category: "Sport",
    model3dPath: "/models/supra.glb",
    priceFrom: 520000,
    colors: [
      { id: "white-pearl", name: "Blanc Nacré", hex: "#F5F5F5", type: "pearl" },
      { id: "black-midnight", name: "Noir Minuit", hex: "#0D0D0D", type: "metallic" },
      { id: "red-toyota", name: "Rouge Toyota", hex: "#EB0A1E", type: "solid" },
      { id: "blue-storm", name: "Bleu Tempête", hex: "#1B3A6B", type: "metallic" },
      { id: "silver-lunar", name: "Argent Lunaire", hex: "#C0C0C0", type: "metallic" },
    ],
    wheels: [
      { id: "sport-18", name: "Sport 18\"", size: "18 pouces" },
      { id: "racing-19", name: "Racing 19\"", size: "19 pouces" },
      { id: "forged-20", name: "Forgé 20\"", size: "20 pouces" },
    ],
    interiors: [
      { id: "black-fabric", name: "Tissu Noir Sport", material: "fabric", colorHex: "#1A1A1A" },
      { id: "red-leather", name: "Cuir Rouge", material: "leather", colorHex: "#8B0000" },
      { id: "black-premium", name: "Cuir Premium Noir", material: "premium-leather", colorHex: "#0A0A0A" },
    ],
    specs: { engine: "3.0L Turbo 6 cylindres", power: 340, torque: 500, consumption: 10.2, seats: 2, zeroto100: 4.3 },
    description: "La Toyota Supra représente l'apogée du sport automobile japonais. Avec son moteur turbo 6 cylindres de 340 ch, elle offre une expérience de conduite pure et adrénalinique.",
  },
  {
    id: "rav4",
    name: "Toyota RAV4",
    category: "SUV Familial",
    model3dPath: "/models/rav4.glb",
    priceFrom: 310000,
    colors: [
      { id: "white-pearl", name: "Blanc Nacré", hex: "#F5F5F5", type: "pearl" },
      { id: "black-midnight", name: "Noir Minuit", hex: "#0D0D0D", type: "metallic" },
      { id: "grey-urban", name: "Gris Urbain", hex: "#6B7280", type: "metallic" },
      { id: "blue-dynamic", name: "Bleu Dynamique", hex: "#2563EB", type: "metallic" },
      { id: "red-emotion", name: "Rouge Émotion", hex: "#DC2626", type: "solid" },
    ],
    wheels: [
      { id: "alloy-17", name: "Aluminium 17\"", size: "17 pouces" },
      { id: "sport-18", name: "Sport 18\"", size: "18 pouces" },
      { id: "diamond-19", name: "Diamant 19\"", size: "19 pouces" },
    ],
    interiors: [
      { id: "grey-fabric", name: "Tissu Gris", material: "fabric", colorHex: "#6B7280" },
      { id: "beige-leather", name: "Cuir Beige", material: "leather", colorHex: "#D4B896" },
      { id: "black-leather", name: "Cuir Noir", material: "leather", colorHex: "#1A1A1A" },
    ],
    specs: { engine: "2.5L Hybride", power: 222, torque: 385, consumption: 6.0, seats: 5, zeroto100: 8.1 },
    description: "Le RAV4 hybride est le SUV familial par excellence. Spacieux, économique et polyvalent, il s'adapte parfaitement à tous les styles de vie marocains.",
  },
  {
    id: "yaris",
    name: "Toyota Yaris",
    category: "Citadine",
    model3dPath: "/models/yaris.glb",
    priceFrom: 175000,
    colors: [
      { id: "white-pure", name: "Blanc Pur", hex: "#FFFFFF", type: "solid" },
      { id: "red-flash", name: "Rouge Flash", hex: "#EB0A1E", type: "solid" },
      { id: "yellow-solar", name: "Jaune Solaire", hex: "#FCD34D", type: "solid" },
      { id: "grey-tech", name: "Gris Tech", hex: "#9CA3AF", type: "metallic" },
      { id: "blue-electric", name: "Bleu Électrique", hex: "#3B82F6", type: "metallic" },
    ],
    wheels: [
      { id: "steel-15", name: "Acier 15\"", size: "15 pouces" },
      { id: "alloy-16", name: "Aluminium 16\"", size: "16 pouces" },
      { id: "sport-17", name: "Sport 17\"", size: "17 pouces" },
    ],
    interiors: [
      { id: "black-fabric", name: "Tissu Noir", material: "fabric", colorHex: "#1A1A1A" },
      { id: "blue-fabric", name: "Tissu Bleu", material: "fabric", colorHex: "#1E40AF" },
      { id: "grey-leather", name: "Cuir Gris", material: "leather", colorHex: "#6B7280" },
    ],
    specs: { engine: "1.5L Hybride", power: 116, torque: 185, consumption: 3.8, seats: 5, zeroto100: 9.4 },
    description: "La Yaris hybride est la citadine intelligente par excellence. Compacte, agile et ultra-économique, elle est parfaite pour naviguer dans les villes marocaines.",
  },
  {
    id: "corolla",
    name: "Toyota Corolla",
    category: "Compacte Hybride",
    model3dPath: "/models/corolla.glb",
    priceFrom: 235000,
    colors: [
      { id: "white-pearl", name: "Blanc Nacré", hex: "#F5F5F5", type: "pearl" },
      { id: "black-midnight", name: "Noir Minuit", hex: "#0D0D0D", type: "metallic" },
      { id: "grey-silver", name: "Gris Argent", hex: "#9CA3AF", type: "metallic" },
      { id: "red-crimson", name: "Rouge Cramoisi", hex: "#B91C1C", type: "solid" },
      { id: "blue-sapphire", name: "Bleu Saphir", hex: "#1E3A8A", type: "metallic" },
    ],
    wheels: [
      { id: "alloy-16", name: "Aluminium 16\"", size: "16 pouces" },
      { id: "sport-17", name: "Sport 17\"", size: "17 pouces" },
      { id: "diamond-18", name: "Diamant 18\"", size: "18 pouces" },
    ],
    interiors: [
      { id: "black-fabric", name: "Tissu Noir", material: "fabric", colorHex: "#1A1A1A" },
      { id: "grey-fabric", name: "Tissu Gris", material: "fabric", colorHex: "#6B7280" },
      { id: "black-leather", name: "Cuir Noir", material: "leather", colorHex: "#1A1A1A" },
    ],
    specs: { engine: "1.8L Hybride", power: 140, torque: 142, consumption: 4.5, seats: 5, zeroto100: 10.9 },
    description: "La Corolla hybride incarne la fiabilité Toyota réinventée. Élégante et technologique, elle offre le parfait équilibre entre confort quotidien et conscience écologique.",
  },
  {
    id: "camry",
    name: "Toyota Camry",
    category: "Berline Confort",
    model3dPath: "/models/camry.glb",
    priceFrom: 280000,
    colors: [
      { id: "white-pearl", name: "Blanc Nacré", hex: "#F5F5F5", type: "pearl" },
      { id: "black-obsidian", name: "Noir Obsidien", hex: "#0A0A0A", type: "metallic" },
      { id: "grey-platinum", name: "Gris Platine", hex: "#E5E7EB", type: "metallic" },
      { id: "silver-chrome", name: "Argent Chromé", hex: "#D1D5DB", type: "metallic" },
      { id: "bronze-gold", name: "Bronze Doré", hex: "#C9A84C", type: "metallic" },
    ],
    wheels: [
      { id: "alloy-17", name: "Aluminium 17\"", size: "17 pouces" },
      { id: "luxury-18", name: "Luxe 18\"", size: "18 pouces" },
      { id: "prestige-19", name: "Prestige 19\"", size: "19 pouces" },
    ],
    interiors: [
      { id: "beige-leather", name: "Cuir Beige Ivoire", material: "leather", colorHex: "#D4B896" },
      { id: "black-leather", name: "Cuir Noir", material: "leather", colorHex: "#1A1A1A" },
      { id: "brown-premium", name: "Cuir Brun Premium", material: "premium-leather", colorHex: "#7C3A1E" },
    ],
    specs: { engine: "2.5L Hybride", power: 218, torque: 221, consumption: 5.2, seats: 5, zeroto100: 8.3 },
    description: "La Camry hybride redéfinit la berline de confort. Silencieuse, spacieuse et luxueuse, elle offre une expérience de conduite apaisante pour les longs trajets.",
  },
  {
    id: "landcruiser",
    name: "Toyota Land Cruiser",
    category: "Tout-terrain extrême",
    model3dPath: "/models/landcruiser.glb",
    priceFrom: 680000,
    colors: [
      { id: "white-pearl", name: "Blanc Nacré", hex: "#F5F5F5", type: "pearl" },
      { id: "black-midnight", name: "Noir Minuit", hex: "#0D0D0D", type: "metallic" },
      { id: "grey-granite", name: "Gris Granit", hex: "#4B5563", type: "metallic" },
      { id: "beige-desert", name: "Beige Désert", hex: "#D4B896", type: "solid" },
      { id: "green-military", name: "Vert Militaire", hex: "#365314", type: "solid" },
    ],
    wheels: [
      { id: "allterrain-18", name: "Tout-terrain 18\"", size: "18 pouces" },
      { id: "allterrain-20", name: "Tout-terrain 20\"", size: "20 pouces" },
      { id: "rock-21", name: "Rock Crawler 21\"", size: "21 pouces" },
    ],
    interiors: [
      { id: "beige-leather", name: "Cuir Beige", material: "leather", colorHex: "#D4B896" },
      { id: "black-leather", name: "Cuir Noir", material: "leather", colorHex: "#1A1A1A" },
      { id: "brown-premium", name: "Cuir Brun Luxe", material: "premium-leather", colorHex: "#7C3A1E" },
    ],
    specs: { engine: "3.3L V6 Diesel", power: 309, torque: 700, consumption: 11.0, seats: 7, zeroto100: 6.7 },
    description: "Le Land Cruiser est une légende tout-terrain indestructible. Conçu pour les terrains les plus extrêmes du Maroc et du Sahara, il allie puissance brute et luxe raffiné.",
  },
  {
    id: "hilux",
    name: "Toyota Hilux",
    category: "Pick-up utilitaire",
    model3dPath: "/models/hilux.glb",
    priceFrom: 295000,
    colors: [
      { id: "white-solid", name: "Blanc Glacier", hex: "#FFFFFF", type: "solid" },
      { id: "black-metallic", name: "Noir Métallique", hex: "#1A1A1A", type: "metallic" },
      { id: "grey-silver", name: "Argent Glacier", hex: "#9CA3AF", type: "metallic" },
      { id: "red-strong", name: "Rouge Puissance", hex: "#991B1B", type: "solid" },
      { id: "blue-workman", name: "Bleu Travail", hex: "#1E3A8A", type: "solid" },
    ],
    wheels: [
      { id: "steel-16", name: "Acier 16\"", size: "16 pouces" },
      { id: "allterrain-17", name: "Tout-terrain 17\"", size: "17 pouces" },
      { id: "allterrain-18", name: "Tout-terrain 18\"", size: "18 pouces" },
    ],
    interiors: [
      { id: "black-fabric", name: "Tissu Noir Robuste", material: "fabric", colorHex: "#1A1A1A" },
      { id: "grey-fabric", name: "Tissu Gris", material: "fabric", colorHex: "#4B5563" },
      { id: "black-leather", name: "Cuir Noir", material: "leather", colorHex: "#1A1A1A" },
    ],
    specs: { engine: "2.8L Diesel D-4D", power: 204, torque: 500, consumption: 8.5, seats: 5, zeroto100: 10.5 },
    description: "Le Hilux est le pick-up le plus vendu au monde. Robuste, fiable et polyvalent, il est indispensable pour les professionnels et les aventuriers marocains.",
  },
  {
    id: "prius",
    name: "Toyota Prius",
    category: "Éco/Tech",
    model3dPath: "/models/prius.glb",
    priceFrom: 260000,
    colors: [
      { id: "white-pure", name: "Blanc Solaire", hex: "#F9FAFB", type: "pearl" },
      { id: "black-midnight", name: "Noir Midnight", hex: "#0A0A0A", type: "metallic" },
      { id: "grey-titanium", name: "Gris Titane", hex: "#6B7280", type: "metallic" },
      { id: "silver-eco", name: "Argent Éco", hex: "#D1D5DB", type: "metallic" },
      { id: "green-eco", name: "Vert Éco", hex: "#166534", type: "metallic" },
    ],
    wheels: [
      { id: "eco-15", name: "Éco 15\"", size: "15 pouces" },
      { id: "aero-17", name: "Aero 17\"", size: "17 pouces" },
      { id: "tech-19", name: "Tech 19\"", size: "19 pouces" },
    ],
    interiors: [
      { id: "grey-eco", name: "Tissu Eco Gris", material: "fabric", colorHex: "#6B7280" },
      { id: "black-fabric", name: "Tissu Noir", material: "fabric", colorHex: "#1A1A1A" },
      { id: "white-leather", name: "Cuir Blanc Tech", material: "leather", colorHex: "#F9FAFB" },
    ],
    specs: { engine: "2.0L Hybride Plug-in", power: 223, torque: 205, consumption: 1.0, seats: 5, zeroto100: 6.8 },
    description: "La Prius révolutionne la mobilité éco-responsable. Avec sa technologie hybride plug-in de dernière génération, elle offre jusqu'à 80 km en mode 100% électrique.",
  },
  {
    id: "chr",
    name: "Toyota C-HR",
    category: "SUV Urbain",
    model3dPath: "/models/chr.glb",
    priceFrom: 245000,
    colors: [
      { id: "white-pearl", name: "Blanc Nacré", hex: "#F5F5F5", type: "pearl" },
      { id: "black-roof", name: "Noir Toit Biton", hex: "#0A0A0A", type: "metallic" },
      { id: "red-dynamic", name: "Rouge Dynamique", hex: "#DC2626", type: "solid" },
      { id: "orange-pulse", name: "Orange Pulse", hex: "#EA580C", type: "metallic" },
      { id: "blue-urban", name: "Bleu Urbain", hex: "#2563EB", type: "metallic" },
    ],
    wheels: [
      { id: "alloy-17", name: "Aluminium 17\"", size: "17 pouces" },
      { id: "design-18", name: "Design 18\"", size: "18 pouces" },
      { id: "sport-19", name: "Sport 19\"", size: "19 pouces" },
    ],
    interiors: [
      { id: "black-fabric", name: "Tissu Sport Noir", material: "fabric", colorHex: "#1A1A1A" },
      { id: "red-fabric", name: "Tissu Rouge", material: "fabric", colorHex: "#7F1D1D" },
      { id: "black-leather", name: "Cuir Noir", material: "leather", colorHex: "#1A1A1A" },
    ],
    specs: { engine: "2.0L Hybride", power: 197, torque: 190, consumption: 5.5, seats: 5, zeroto100: 8.5 },
    description: "Le C-HR hybride s'impose comme le SUV urbain le plus audacieux. Son design coupé unique et ses technologies hybrides en font le choix parfait pour les citadins modernes.",
  },
  {
    id: "highlander",
    name: "Toyota Highlander",
    category: "SUV 7 places",
    model3dPath: "/models/highlander.glb",
    priceFrom: 580000,
    colors: [
      { id: "white-pearl", name: "Blanc Nacré", hex: "#F5F5F5", type: "pearl" },
      { id: "black-midnight", name: "Noir Minuit", hex: "#0A0A0A", type: "metallic" },
      { id: "grey-silver", name: "Gris Argent", hex: "#9CA3AF", type: "metallic" },
      { id: "bronze-luxury", name: "Bronze Luxe", hex: "#C9A84C", type: "metallic" },
      { id: "blue-deep", name: "Bleu Profond", hex: "#1E3A8A", type: "metallic" },
    ],
    wheels: [
      { id: "alloy-18", name: "Aluminium 18\"", size: "18 pouces" },
      { id: "luxury-20", name: "Luxe 20\"", size: "20 pouces" },
      { id: "prestige-21", name: "Prestige 21\"", size: "21 pouces" },
    ],
    interiors: [
      { id: "beige-leather", name: "Cuir Beige 7 places", material: "leather", colorHex: "#D4B896" },
      { id: "black-leather", name: "Cuir Noir 7 places", material: "leather", colorHex: "#1A1A1A" },
      { id: "brown-premium", name: "Cuir Brun Premium", material: "premium-leather", colorHex: "#7C3A1E" },
    ],
    specs: { engine: "2.5L Hybride AWD", power: 248, torque: 239, consumption: 6.8, seats: 7, zeroto100: 8.0 },
    description: "Le Highlander hybride est le SUV 7 places par excellence. Grand, luxueux et économique, il répond parfaitement aux besoins des grandes familles marocaines.",
  },
]
```

---

## Database Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

model Vehicle {
  id           String        @id @default(cuid())
  slug         String        @unique
  name         String
  category     String
  description  String
  priceFrom    Float
  model3dPath  String
  colors       Json
  wheels       Json
  interiors    Json
  specs        Json
  createdAt    DateTime      @default(now())
  leads        Lead[]
  reservations Reservation[]
}

model Lead {
  id            String      @id @default(cuid())
  firstName     String
  lastName      String
  email         String
  phone         String?
  vehicleId     String
  vehicle       Vehicle     @relation(fields: [vehicleId], references: [id])
  configuration Json
  chatHistory   Json
  type          String      // "test_drive" | "quote"
  status        String      @default("new")
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  reservation   Reservation?
}

model Reservation {
  id        String   @id @default(cuid())
  leadId    String   @unique
  lead      Lead     @relation(fields: [leadId], references: [id])
  vehicleId String
  vehicle   Vehicle  @relation(fields: [vehicleId], references: [id])
  date      DateTime
  type      String
  status    String   @default("pending")
  notes     String?
  createdAt DateTime @default(now())
}

model Admin {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String
  role      String   @default("admin")
  createdAt DateTime @default(now())
}
```

---

## Gemini AI System Prompt

```
You are "Toyota AI Advisor", an expert virtual sales consultant for Toyota Morocco.
Your personality: warm, professional, knowledgeable, and enthusiastic about cars.

CONVERSATION FLOW (follow this order strictly):
Step 1: Greet warmly and ask for the user's first name.
Step 2: Ask about budget in MAD:
  A) Moins de 200,000 MAD
  B) 200,000 – 350,000 MAD  
  C) 350,000 – 550,000 MAD
  D) Plus de 550,000 MAD
Step 3: Ask about primary usage:
  A) Famille / espace
  B) Trajets quotidiens / ville
  C) Aventure / tout-terrain
  D) Sport / performance
  E) Éco-responsabilité
Step 4: Ask about fuel preference:
  A) Hybride (économique)
  B) Essence
  C) Diesel
  D) Pas de préférence
Step 5: Ask about top priority:
  A) Confort et espace
  B) Économie de carburant
  C) Technologie et connectivité
  D) Puissance et performance
  E) Prix et rapport qualité/prix
Step 6: Based on ALL answers, recommend EXACTLY ONE model with clear reasoning.
Step 7: Invite them to configure their vehicle in the 3D configurator.

AVAILABLE MODELS (use exact IDs):
- supra (Sport, from 520,000 MAD)
- rav4 (SUV Familial, from 310,000 MAD)
- yaris (Citadine, from 175,000 MAD)
- corolla (Compacte Hybride, from 235,000 MAD)
- camry (Berline Confort, from 280,000 MAD)
- landcruiser (Tout-terrain, from 680,000 MAD)
- hilux (Pick-up, from 295,000 MAD)
- prius (Éco/Tech, from 260,000 MAD)
- chr (SUV Urbain, from 245,000 MAD)
- highlander (SUV 7 places, from 580,000 MAD)

CRITICAL RULES:
- Respond in the SAME language as the user (French, Arabic, or English)
- Keep each response to MAX 2-3 short sentences
- Ask only ONE question at a time
- When making final recommendation, end your message with this JSON on its own line:
  {"recommendation":"model-id-here"}
- Never discuss non-Toyota topics
- Never recommend more than one model
```

---

## Design System

```css
/* Brand Colors */
--toyota-red: #EB0A1E        /* Primary CTA, accents */
--toyota-dark: #0A0A0A       /* Main background */
--toyota-card: #111111       /* Card background */
--toyota-gray: #1A1A1A       /* Secondary background */
--toyota-border: #2A2A2A     /* Borders */
--toyota-text: #FFFFFF       /* Primary text */
--toyota-muted: #9CA3AF      /* Secondary text */
--toyota-gold: #C9A84C       /* Premium accents */

/* Typography */
Font: Inter (Google Fonts)
Headings: font-bold tracking-tight
Body: font-normal

/* Spacing */
Design: Dark mode by default, premium luxury feel
Cards: rounded-2xl with subtle border border-white/5
Buttons: rounded-full for CTAs, rounded-xl for secondary
```

---

## 3D Model Configuration

```typescript
// All GLB files in public/models/[id].glb
// If model fails to load, fallback to colored box primitive
// Use useGLTF.preload() for all models at app startup
// CarModel traverses scene and applies color to mesh materials with names containing:
// "body", "paint", "exterior", "car", "vehicle" (case insensitive)
```

---

## ML Service API Contract

```python
# POST /predict-campaign
# Input:
{
  "vehicle_category": "SUV Familial",  # string
  "price_range": "200000-350000",       # string
  "season": "summer",                   # spring|summer|autumn|winter
  "target_segment": "families"          # families|young|professional|adventure
}
# Output:
{
  "campaign_type": "Digital Social",
  "channel": "Instagram + Facebook",
  "budget_allocation": 35,              # percentage
  "predicted_roi": 2.8,                # multiplier
  "message_theme": "Aventure Familiale",
  "confidence": 0.87
}
```

---

## Key Rules for Code Generation

1. TypeScript everywhere — strict, no `any`
2. `async/await` — never `.then()/.catch()`
3. Proper HTTP status codes in all API routes
4. All forms: React Hook Form + Zod validation
5. Loading states: always use Suspense or skeleton
6. Mobile-first: sm → md → lg → xl breakpoints
7. 3D Canvas always wrapped in `<Suspense>` with fallback
8. Prisma: singleton import from `@/lib/prisma`
9. `NEXT_PUBLIC_*` for frontend, others server-only
10. Error boundaries around all 3D components
11. No hardcoded strings — use the vehicles data file
12. `cn()` from `@/lib/utils` for all className merges