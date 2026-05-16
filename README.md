# 🚗 Toyota AI Experience Platform

An interactive vehicle consultation and configuration platform for Toyota Morocco. Powered by Google Gemini AI, a real-time 3D configurator (React Three Fiber), and a Python FastAPI ML service for marketing predictions.

Built by **Badr Eddine Boudhim** (Backend + AI + Architecture) & **Taha** (Frontend + 3D).

---

## ✨ Features

- **AI Chat Advisor** — Gemini 1.5 Flash streaming chatbot that guides users through 5 questions and recommends the perfect Toyota model
- **3D Vehicle Configurator** — Interactive React Three Fiber canvas with color, wheel, and interior customization + screenshot export
- **Vehicle Catalog** — 10 Toyota models with filters, lazy-loaded images, blur placeholders, and hover animations
- **Lead & Reservation System** — Full CRUD with Prisma + Supabase PostgreSQL
- **Admin Dashboard** — Leads table, reservations, stats cards, and ML marketing prediction widget
- **ML Marketing Service** — FastAPI + scikit-learn microservice predicting optimal campaign type, channel, and ROI
- **Page Transitions** — Smooth Framer Motion fade between all routes
- **Toast Notifications** — Sonner toasts for all feedback (screenshot saved, form submitted, errors)
- **Scroll-to-Top Button** — Auto-appears after 300px scroll
- **Mobile Side Drawer** — Full-height dark slide-in nav on mobile

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 · App Router · TypeScript 5 (strict) |
| Styling | Tailwind CSS v4 · Framer Motion v12 |
| 3D | React Three Fiber v9 · @react-three/drei · Three.js |
| AI | Google Gemini 1.5 Flash · Vercel AI SDK (`useChat`) |
| Auth | NextAuth.js v5 |
| ORM | Prisma v7 |
| Database | Supabase (PostgreSQL) |
| State | Zustand v5 |
| Forms | React Hook Form + Zod |
| Toasts | Sonner |
| ML Service | FastAPI · scikit-learn · Railway.app |

---

## 📋 Prerequisites

Make sure you have these installed before starting:

- **Node.js** `v20+` — [nodejs.org](https://nodejs.org)
- **npm** `v10+` (comes with Node.js)
- **Python** `3.10+` — only needed for the ML service
- **Git**

You also need free accounts on:
- [Supabase](https://supabase.com) — free tier is fine
- [Google AI Studio](https://aistudio.google.com) — for the Gemini API key (free)

---

## 🚀 Quick Start

### 1. Clone the repo

```bash
git clone https://github.com/Boudhim-Badr-Eddine/toyota-ai-platform.git
cd toyota-ai-platform
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create your `.env.local`

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in every value. Here's where to get each one:

| Variable | Where to get it |
|----------|----------------|
| `DATABASE_URL` | Supabase → your project → **Connect** → **ORMs** → copy **Transaction pooler** string |
| `DIRECT_URL` | Same page → copy **Session pooler** string |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → **Settings** → **API** → **Project URL** |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → **Settings** → **API** → **anon / public** key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → **Settings** → **API** → **service_role** key *(keep secret!)* |
| `GEMINI_API_KEY` | [aistudio.google.com](https://aistudio.google.com) → **Get API Key** → Create key |
| `NEXTAUTH_SECRET` | Run `openssl rand -base64 32` in your terminal and paste the output |
| `NEXTAUTH_URL` | `http://localhost:3000` |
| `ML_SERVICE_URL` | `http://localhost:8000` (or skip if not running ML service) |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` |

### 4. Set up the database

```bash
npx prisma generate      # Generate Prisma client
npx prisma db push       # Create all tables in Supabase
npx prisma db seed       # Seed 10 vehicles + admin account
```

After seeding you'll have:
- All 10 Toyota vehicles in the database
- Admin account: `admin@toyota-ma.com` / `Admin@2024!`

### 5. Add 3D model files

The GLTF model folders are not included in the repo (they're 20–60 MB each). Get the folders from Badr and place them inside `public/models/`:

```
public/models/
├── supra/          ← folder containing scene.gltf + scene.bin + textures/
├── rav4/
├── yaris/
├── corolla/
├── camry/
├── landcruiser/
├── hilux/
├── prius/
├── chr/
└── highlander/
```

> **No models yet?** No problem — the configurator automatically falls back to an animated colored 3D box for any missing model. Everything else still works.

### 6. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 🤖 ML Service (Optional)

The admin dashboard has a "Prédiction Marketing" widget that calls the FastAPI service. You only need this if you want that widget to work.

### Run locally

```bash
cd ml-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

First run trains the scikit-learn model (~2 seconds) and saves it to `ml-service/saved_models/`.

### Deploy to Railway (production)

1. Go to [railway.app](https://railway.app) and create a new project
2. Connect your GitHub repo and select the `ml-service/` directory as the root
3. Railway auto-detects the `Procfile` and deploys
4. Copy the generated Railway URL and set `ML_SERVICE_URL` in your Vercel env vars

---

## 🗂 Project Structure

```
toyota-ai-platform/
├── src/
│   ├── app/
│   │   ├── (client)/              # Public pages (all have Header + Footer)
│   │   │   ├── page.tsx               # Landing page
│   │   │   ├── vehicles/              # Vehicle catalog + detail
│   │   │   ├── configurator/[model]/  # 3D configurator
│   │   │   └── contact/               # Contact + lead form
│   │   ├── (admin)/               # Protected admin pages
│   │   │   ├── login/
│   │   │   ├── dashboard/
│   │   │   ├── leads/
│   │   │   └── reservations/
│   │   └── api/                   # Next.js API routes
│   │       ├── auth/              # NextAuth
│   │       ├── chat/              # Gemini streaming
│   │       ├── leads/
│   │       ├── reservations/
│   │       └── vehicles/
│   ├── components/
│   │   ├── chat/                  # ChatWidget + ChatMessage + ChatInput
│   │   ├── configurator/          # CarScene + CarModel + ConfigPanel
│   │   ├── catalog/               # VehicleCard + VehicleGrid + ComparisonBanner
│   │   ├── layout/                # Header + Footer
│   │   ├── providers/             # Providers.tsx + PageTransition.tsx
│   │   └── ui/                    # Skeleton + ScrollToTop
│   ├── store/
│   │   └── configuratorStore.ts   # Zustand — config state + price calculation
│   ├── types/index.ts             # All TypeScript interfaces
│   └── data/vehicles.ts           # Static vehicle catalog (10 models)
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── ml-service/                    # Python FastAPI ML microservice
│   ├── main.py
│   ├── model.py
│   └── requirements.txt
└── public/
    └── models/                    # Place your .gltf folders here (excluded from git)
```

---

## 🔑 Key Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page with hero, features, CTA |
| `/vehicles` | Catalog with filters, comparison banner, AI advisor CTA |
| `/vehicles/[id]` | Vehicle detail with full specs |
| `/configurator/[model]` | 3D configurator — colors, wheels, interior, price breakdown |
| `/contact` | Contact + lead capture form |
| `/login` | Admin login |
| `/dashboard` | Admin stats + ML marketing prediction |
| `/leads` | Admin leads table |
| `/reservations` | Admin reservations table |

---

## 🛠 Useful Scripts

```bash
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint check

npm run db:push      # Push schema changes to Supabase
npm run db:seed      # Seed vehicles + admin user
npm run db:studio    # Open Prisma Studio (visual database browser)
```

---

## 🔐 Admin Panel

After seeding, log in at `http://localhost:3000/login`:

- **Email:** `admin@toyota-ma.com`
- **Password:** `Admin@2024!`

All `/dashboard`, `/leads`, and `/reservations` routes are protected by `middleware.ts` and redirect to `/login` if not authenticated.

---

## ⚠️ Common Issues

**`PrismaClientInitializationError`** — Your `DATABASE_URL` is wrong or your Supabase project is paused (free tier pauses after 7 days of inactivity). Unpause it in the Supabase dashboard first.

**Gemini API errors** — Make sure the key is valid and the Generative Language API is enabled in your Google Cloud project.

**3D scene shows a spinning loader forever** — The model folder is missing from `public/models/`. Add it or wait ~10s for the colored-box fallback.

**`NEXTAUTH_SECRET` missing error** — Run `openssl rand -base64 32` and paste the result into `.env.local`.

**Port 3000 already in use** — Kill the process: `npx kill-port 3000`, or start on another port: `npm run dev -- -p 3001`.

**`Module not found` errors** — Delete caches and reinstall:
```bash
rm -rf .next node_modules
npm install
```

---

## 📝 Environment Variables Reference

```env
# Database (Supabase + Prisma)
DATABASE_URL=""          # Transaction pooler string
DIRECT_URL=""            # Session pooler string

# Supabase client (safe to expose to the browser)
NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_ANON_KEY=""

# Supabase server-only — NEVER expose to the browser
SUPABASE_SERVICE_ROLE_KEY=""

# AI
GEMINI_API_KEY=""

# Auth
NEXTAUTH_SECRET=""       # openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"

# ML service
ML_SERVICE_URL="http://localhost:8000"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```
