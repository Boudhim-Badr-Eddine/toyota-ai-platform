# Toyota AI Experience Platform — Contexte Projet Complet

> **Document de référence** pour le développement, la maintenance et la rédaction du rapport technique.  
> Dernière mise à jour : juin 2026 — aligné sur l’état réel du dépôt `toyota-ai-platform`.

---

## Table des matières

1. [Identité du projet](#1-identité-du-projet)
2. [Objectifs et périmètre](#2-objectifs-et-périmètre)
3. [Stack technique](#3-stack-technique)
4. [Architecture globale](#4-architecture-globale)
5. [Parcours utilisateur](#5-parcours-utilisateur)
6. [Pages et écrans (inventaire complet)](#6-pages-et-écrans-inventaire-complet)
7. [Fonctionnalités détaillées](#7-fonctionnalités-détaillées)
8. [API REST (référence)](#8-api-rest-référence)
9. [Base de données (Prisma)](#9-base-de-données-prisma)
10. [Catalogue véhicules](#10-catalogue-véhicules)
11. [Configurateur 3D](#11-configurateur-3d)
12. [Intelligence artificielle](#12-intelligence-artificielle)
13. [Service ML (marketing)](#13-service-ml-marketing)
14. [Authentification et sécurité](#14-authentification-et-sécurité)
15. [État global (Zustand)](#15-état-global-zustand)
16. [Design system](#16-design-system)
17. [Variables d’environnement](#17-variables-denvironnement)
18. [Structure des fichiers](#18-structure-des-fichiers)
19. [Scripts et commandes](#19-scripts-et-commandes)
20. [Déploiement](#20-déploiement)
21. [Écarts avec l’ancienne spec (COPILOT_CONTEXT)](#21-écarts-avec-lancienne-spec-copilot_context)

---

## 1. Identité du projet

| Champ | Valeur |
|--------|--------|
| **Nom** | Toyota AI Experience Platform |
| **Type** | Application web full-stack (consultation + configuration véhicules Toyota Maroc) |
| **Langue UI** | Français (contenu IA : FR / AR / EN selon l’utilisateur) |
| **Équipe** | Badr Eddine Boudhim (Backend, IA, architecture) · Taha (Frontend, 3D, UI/UX) |
| **Repo** | `toyota-ai-platform` |
| **Version app** | `0.1.0` |

### Proposition de valeur

Plateforme interactive qui combine :

- **Catalogue** de 13 modèles Toyota avec fiches détaillées
- **Configurateur 3D** temps réel (couleur, jantes, sellerie, finitions)
- **Conseiller IA** (chat flottant) pour recommandations et comparaisons
- **Parcours commercial** : essai, devis, achat, réservation SAV
- **Espace client** : compte, leads, configurations sauvegardées
- **Back-office admin** : CRM leads/réservations, analytics, prédictions marketing ML

---

## 2. Objectifs et périmètre

### Objectifs métier

1. Digitaliser l’expérience concessionnaire Toyota au Maroc
2. Aider le client à choisir un véhicule via IA et outils visuels
3. Capturer des leads qualifiés (essai, devis, achat, contact, SAV)
4. Donner aux admins une vue consolidée (tableaux de bord, analytics, ML)

### Hors périmètre actuel

- Paiement en ligne réel
- Commande e-commerce complète
- Application mobile native
- Tous les modèles 3D ne sont pas forcément présents sur disque (fallback photo / boîte 3D)

---

## 3. Stack technique

| Couche | Technologies | Version / détail |
|--------|--------------|------------------|
| **Framework** | Next.js (App Router) | 16.x |
| **UI** | React | 19.x |
| **Langage** | TypeScript | strict |
| **Styles** | Tailwind CSS | v4 |
| **Composants** | Radix UI + composants maison (`src/components/ui/`) | — |
| **Animations** | Framer Motion | v12 |
| **3D** | Three.js, React Three Fiber, @react-three/drei | r184 / v9 |
| **État client** | Zustand | v5 (+ persist localStorage) |
| **Formulaires** | React Hook Form + Zod | — |
| **Toasts** | Sonner | — |
| **Cartes** | Leaflet + react-leaflet | concessions / road-trip |
| **Graphiques admin** | Recharts | analytics |
| **IA principale** | **Groq** (Llama 3.3 70B / 3.1 8B) | streaming chat |
| **IA secondaire** | `@google/generative-ai` présent en dépendance | usage limité / legacy |
| **Auth** | NextAuth.js | v5 beta |
| **ORM** | Prisma | v6 |
| **Base** | PostgreSQL via **Supabase** | — |
| **Email** | Nodemailer (Gmail SMTP) | notifications admin |
| **ML** | FastAPI + scikit-learn | microservice Python `ml-service/` |
| **Runtime** | Node.js 20+ | — |

> **Note importante :** l’IA conversationnelle utilise **Groq**, pas Gemini comme moteur principal. Gemini reste en dépendance mais le chat, quiz, road-trip et compare passent par Groq avec fallbacks locaux.

---

## 4. Architecture globale

```
┌─────────────────────────────────────────────────────────────────┐
│                        Navigateur (client)                       │
│  App Router · Zustand · ChatWidget · CompareOverlay · R3F Canvas │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS
┌────────────────────────────▼────────────────────────────────────┐
│                   Next.js (src/app/)                             │
│  Pages (client) + Pages (admin) + API Routes (/api/*)            │
│  NextAuth · Prisma · Groq SDK · Email · Rate limit               │
└─────┬──────────────────┬──────────────────┬─────────────────────┘
      │                  │                  │
      ▼                  ▼                  ▼
 Supabase          Groq API           ML Service (FastAPI)
 PostgreSQL        (Llama)            Railway / localhost:8000
```

### Groupes de routes Next.js

| Groupe | Layout | Rôle |
|--------|--------|------|
| `src/app/page.tsx` | Header/Footer dédiés | Homepage marketing |
| `src/app/(client)/` | `AppShell` (Header, Footer, mobile tab bar) | Parcours public / client |
| `src/app/(admin)/` | Sidebar admin | Back-office |
| `src/app/api/` | — | API REST serverless |

### Composants globaux (root `layout.tsx`)

- `Providers` — SessionProvider NextAuth
- `ChatWidgetLoader` — conseiller IA flottant (toutes pages client)
- `CompareOverlay` — tiroir comparaison véhicules
- `ScrollToTop` — retour haut de page
- `DebugPanelLoader` — panneau dev (statut modèles 3D)
- Toasts Sonner

---

## 5. Parcours utilisateur

### Visiteur anonyme

1. **Découverte** → `/` (vidéo hero, carousel modèles)
2. **Exploration** → `/vehicles` → fiche `/vehicles/[id]`
3. **Configuration** → `/configurator/[model]` (3D)
4. **Conseil IA** → widget chat (recommandation, comparaison)
5. **Engagement** → `/acheter`, `/contact`, `/quiz`, `/road-trip`
6. **Concession** → `/concessions` (carte, géolocalisation)

### Client enregistré

1. Inscription `/compte/inscription` → API register → connexion auto
2. Espace `/compte` : profil, mes leads, configurations sauvegardées
3. Sauvegarde config depuis le configurateur (API `saved-configurations`)

### Administrateur

1. Connexion `/login`
2. Dashboard `/dashboard` — KPIs
3. Gestion `/leads`, `/reservations`
4. Analytics `/analytics` — graphiques 7j / 30j / tout
5. Prédictions ML via widgets dashboard (proxy API)

---

## 6. Pages et écrans (inventaire complet)

### 6.1 Pages publiques — marketing & catalogue

| Route | Fichier | Rôle détaillé |
|-------|---------|-----------------|
| **`/`** | `src/app/page.tsx` | Page d’accueil cinématique : vidéo hero (Cloudinary), carousel véhicules, stats, bannières promo, CTA vers catalogue / IA / configurateur |
| **`/vehicles`** | `(client)/vehicles/page.tsx` | Grille catalogue avec filtres (catégorie, prix, hybride), bannière comparaison, lien chat IA |
| **`/vehicles/[id]`** | `(client)/vehicles/[id]/page.tsx` | Fiche véhicule : galerie + lightbox, onglets specs, barres scénarios, couleurs/jantes, CTA sticky (3D, essai, chat, acheter) |
| **`/offres`** | `(client)/offres/page.tsx` | Offres promotionnelles par catégorie + simulateur financement |
| **`/sitemap`** | `(client)/sitemap/page.tsx` | Plan du site HTML (pages + tous les véhicules) |

### 6.2 Configurateur 3D

| Route | Fichier | Rôle détaillé |
|-------|---------|-----------------|
| **`/configurator`** | `(client)/configurator/page.tsx` | Sélecteur de modèle (grille vers `/configurator/[model]`) |
| **`/configurator/[model]`** | `(client)/configurator/[model]/page.tsx` | **Écran principal 3D** : canvas plein écran, panneau options flottant (desktop) / bottom sheet (mobile), partage URL (`?c=&w=&i=&t=`), capture screenshot, contrôles portes/capot/vue intérieure, panneau masquable |

### 6.3 Parcours commercial & services

| Route | Fichier | Rôle détaillé |
|-------|---------|-----------------|
| **`/acheter`** | `(client)/acheter/page.tsx` | Parcours d’achat multi-étapes (`PurchaseWizard`) : véhicule, options, financement, concession la plus proche, soumission lead |
| **`/contact`** | `(client)/contact/page.tsx` | Formulaire contact : concession, véhicule, message → création lead |
| **`/service`** | `(client)/service/page.tsx` | Prise de RDV SAV (révision, vidange, etc.) → lead typé |
| **`/concessions`** | `(client)/concessions/page.tsx` | Carte interactive des concessions : filtres ville/type, géolocalisation, favoris, fiches détaillées |

### 6.4 Expériences « fun » / engagement

| Route | Fichier | Rôle détaillé |
|-------|---------|-----------------|
| **`/quiz`** | `(client)/quiz/page.tsx` | **Permis de Légende** : quiz personnalité multi-étapes → véhicule + persona (API Groq ou règles locales), carte collectionnable, confetti |
| **`/road-trip`** | `(client)/road-trip/page.tsx` | **Road Trip Légendaire** : assistant itinéraire Maroc (origine, durée, voyageurs, véhicule) → journées avec landmarks + arrêts concession |

### 6.5 Compte client

| Route | Fichier | Rôle détaillé |
|-------|---------|-----------------|
| **`/compte/inscription`** | `(client)/compte/inscription/page.tsx` | Création compte → `POST /api/auth/register` |
| **`/compte/connexion`** | `(client)/compte/connexion/page.tsx` | Connexion NextAuth credentials |
| **`/compte`** | `(client)/compte/page.tsx` | Profil éditable, liste des leads, configurations 3D sauvegardées (session requise) |

### 6.6 Pages légales

| Route | Rôle |
|-------|------|
| **`/privacy`** | Politique de confidentialité |
| **`/terms`** | Conditions d’utilisation |

### 6.7 Administration

| Route | Fichier | Rôle détaillé |
|-------|---------|-----------------|
| **`/login`** | `(admin)/login/page.tsx` | Connexion admin (redirige client → `/compte`, admin → `/dashboard`) |
| **`/dashboard`** | `(admin)/dashboard/page.tsx` | Tableau de bord : KPI leads/réservations, graphiques, widget ML campagne |
| **`/leads`** | `(admin)/leads/page.tsx` | Table CRM : filtres statut/type, mise à jour statut (new/contacted/converted/lost) |
| **`/reservations`** | `(admin)/reservations/page.tsx` | Liste réservations : confirmer / annuler |
| **`/analytics`** | `(admin)/analytics/page.tsx` | Analytics avancées : timeline, entonnoir, répartitions (API `/api/analytics`) |

---

## 7. Fonctionnalités détaillées

### 7.1 Chat IA (widget global)

- **Composant :** `ChatWidget` — bouton flottant, fenêtre déplaçable
- **API :** `POST /api/chat` — streaming Groq
- **Modèles :** `llama-3.3-70b-versatile` puis fallback `llama-3.1-8b-instant`
- **Rate limit :** 40 req/min par IP
- **Fallback :** `buildChatFallback()` si clé absente ou quota Groq (429)
- **Sorties structurées :**
  - Recommandation : `{"recommendation":"rav4","configuratorUrl":"..."}`
  - Comparaison : `{"compare":{"ids":["rav4","highlander"],...}}` → ouvre `CompareDrawer`
- **Historique :** persisté dans `chatStore` (localStorage)

### 7.2 Comparaison de véhicules

- **Store :** `compareStore` — max 3 véhicules
- **UI :** `ComparisonBanner`, `CompareDrawer`, `CompareOverlay`
- **API :** `POST /api/compare` — analyse IA ou `buildLocalCompare()`
- **Déclencheurs :** catalogue, fiche véhicule, chat IA

### 7.3 Configurateur 3D

Voir [section 11](#11-configurateur-3d).

Options configurables :

- Finition / trim (si plusieurs)
- Couleur extérieure (solid / metallic / pearl)
- Jantes
- Sellerie intérieure
- Prix dynamique (base + surcharges options)

Actions :

- Partager lien avec query params
- Capturer screenshot PNG
- Réserver / acheter (modales lead)
- Télécharger devis PDF (`/api/quote`)
- Conseiller style IA (`AIStyleAdvisor` → `/api/recommend`)
- Sauvegarder config (utilisateur connecté)

### 7.4 Simulateur de financement

- **Composant :** `FinanceSimulator`
- Calcul mensualité, coût total, intérêts
- Présent dans configurateur, `/offres`, `/acheter`

### 7.5 Gestion des leads

Types : `test_drive`, `quote`, `purchase`, `contact`, `service`, etc.

Chaque lead stocke :

- Coordonnées client
- Véhicule + configuration JSON
- Historique chat JSON
- Concession optionnelle + géolocalisation
- Lien utilisateur si connecté

**Notification email admin** via SMTP (nouveau lead).

### 7.6 Réservations

- Créées via `POST /api/reservations` (liées à un lead)
- Statuts : `pending`, `confirmed`, `cancelled`
- Gestion admin sur `/reservations`

### 7.7 Concessions

- Données : Prisma `Dealership` ou fallback `src/data/dealerships.ts`
- Carte Leaflet, tri par distance (`/api/dealerships/nearest`)
- Filtres ville, type de service

### 7.8 Quiz « Permis de Légende »

- Questions : `src/data/quizQuestions.ts`
- Profils cibles par véhicule : `targetProfiles`
- Résultat : carte `PermisLegendeCard` partageable

### 7.9 Road Trip

- Wizard : `RoadTripWizard`
- Landmarks Maroc + concessions dans l’itinéraire
- Carte `TripMap`, cartes par jour `ItineraryDayCard`

### 7.10 Navigation & UX transverses

| Élément | Rôle |
|---------|------|
| `CommandPalette` | Navigation ⌘K |
| `MobileTabBar` | Navigation mobile bas d’écran |
| `WhatsAppFab` | Contact WhatsApp flottant |
| `PageTransition` | Transitions Framer Motion entre routes |
| `Header` / `Footer` | Navigation principale |

---

## 8. API REST (référence)

| Endpoint | Méthodes | Auth | Description |
|----------|----------|------|-------------|
| `/api/auth/[...nextauth]` | GET, POST | — | Handlers NextAuth v5 |
| `/api/auth/register` | POST | — | Inscription client (bcrypt) |
| `/api/chat` | POST | — | Chat streaming Groq + fallback |
| `/api/chat/test` | GET | — | Test connectivité Groq (dev) |
| `/api/compare` | POST | — | Comparaison 2–3 véhicules |
| `/api/quiz` | POST | — | Résultat quiz personnalité |
| `/api/road-trip` | POST | — | Génération itinéraire |
| `/api/recommend` | POST | — | Conseils style configurateur |
| `/api/vehicles` | GET | — | Liste véhicules (DB → fallback static) |
| `/api/vehicles/[id]` | GET | — | Détail véhicule |
| `/api/dealerships` | GET | — | Liste concessions |
| `/api/dealerships/nearest` | GET | — | Tri par `lat`, `lng`, `limit` |
| `/api/leads` | POST | — | Créer lead (+ email admin) |
| `/api/leads` | GET, PATCH | Admin | Liste / mise à jour statut |
| `/api/my-leads` | GET | Client | Leads du user connecté |
| `/api/reservations` | POST | — | Créer réservation |
| `/api/reservations` | GET, PATCH | Admin | Liste / statut |
| `/api/saved-configurations` | GET, POST | Client | Configs 3D sauvegardées |
| `/api/profile` | PATCH | Client | Mise à jour profil |
| `/api/quote` | POST | — | Génération devis PDF |
| `/api/analytics` | GET | Admin | KPIs (`range=7d\|30d\|all`) |
| `/api/ml-predict` | POST | Admin | Proxy campagne marketing ML |
| `/api/ml-analyze` | POST | Admin | Proxy analyse leads ML |
| `/api/admin/email-test` | POST | Admin | Test SMTP |
| `/api/health` | GET | — | Santé DB |

---

## 9. Base de données (Prisma)

Fichier : `prisma/schema.prisma` — PostgreSQL (Supabase).

| Modèle | Description |
|--------|-------------|
| **Vehicle** | Catalogue persisté (slug, JSON colors/wheels/interiors/specs) |
| **Dealership** | Concessions (coords, horaires, services) |
| **User** | Compte client (email hashé, profil) |
| **Admin** | Compte administrateur séparé |
| **Lead** | Prospect : véhicule, config, chat, type, statut, concession |
| **Reservation** | RDV lié 1:1 à un lead |
| **SavedConfiguration** | Snapshot configurateur par utilisateur |

**Fallback :** si DB indisponible, les véhicules et concessions statiques dans `src/data/` alimentent l’app.

---

## 10. Catalogue véhicules

**Source :** `src/data/vehicles.ts` (`VEHICLES_DATA`) — 13 modèles.

| ID | Modèle | Catégorie (indicative) |
|----|--------|------------------------|
| `supra` | Toyota Supra | Sport |
| `rav4` | Toyota RAV4 | SUV familial |
| `yaris` | Toyota Yaris | Citadine |
| `corolla` | Toyota Corolla | Compacte hybride |
| `corolla-2` | Toyota Corolla 2026 | Berline |
| `camry` | Toyota Camry | Berline confort |
| `landcruiser` | Toyota Land Cruiser | Tout-terrain |
| `hilux` | Toyota Hilux | Pick-up |
| `prius` | Toyota Prius | Éco / tech |
| `chr` | Toyota C-HR | SUV urbain |
| `highlander` | Toyota Highlander | SUV 7 places |
| `granvia` | Toyota Granvia | Van premium |
| `kijang` | Toyota Kijang Innova | MPV familial |

Chaque entrée inclut : prix de base (MAD), couleurs, jantes, intérieurs, specs moteur, images, scores scénarios, drapeaux hybride/électrique.

**Modèles 3D :** `public/models/{id}/scene.gltf` (fichiers volumineux, pas tous versionnés).

---

## 11. Configurateur 3D

### Composants clés

| Fichier | Rôle |
|---------|------|
| `CarScene.tsx` | Canvas R3F, lumières studio, grille, orbit controls, panel-aware viewport |
| `CarModel.tsx` | Chargement GLTF, matériaux, animations portes/capot |
| `ConfigPanel.tsx` | Panneau options + financement + CTA |
| `AIStyleAdvisor.tsx` | Conseils IA personnalisés |
| `Photo360Fallback.tsx` | Fallback images si WebGL / modèle absent |

### Pipeline matériaux (`src/lib/vehicleMaterials.ts`)

- Support `MeshStandardMaterial` et `MeshPhysicalMaterial`
- Classification par slot : body, glass, chrome, tire, wheel, interior, emissive, trim
- Clearcoat pour finitions pearl/metallic
- Cache des meshes carrosserie — changement couleur sans re-traverse complet
- Optimisation textures (anisotropy, taille max)

### Caméra showroom (`src/lib/showroomCamera.ts`)

- Cible orbit : `(0, lookAtY, 0)` — voiture centrée dans la zone visible
- **Viewport physique** : le conteneur 3D se redimensionne à gauche du panneau (pas de view-offset CSS)
- Panneau masquable : slide GPU (Framer Motion spring) + refit caméra à la fin
- Contrôles : orbit, zoom, pan, reset ↻, auto-rotate après inactivité
- `frameloop="demand"` + invalidation pour performances

### Animations véhicule (`src/lib/vehicleHinges.ts`)

- Portes FL/FR/RL/RR, capot, coffre (si meshes nommés dans le GLTF)
- Détection heuristique des noms de nodes Sketchfab

### Normalisation (`src/lib/normalizeModel.ts`)

- Échelle ~4,2 m, position au sol, orientation cohérente

---

## 12. Intelligence artificielle

### Moteur principal : Groq

| Fonction | Route | Modèle | Fallback |
|----------|-------|--------|----------|
| Chat conseiller | `/api/chat` | Llama 3.3 70B | Catalog rules + 8B |
| Comparaison | `/api/compare` | Groq | `compareLocal.ts` |
| Quiz | `/api/quiz` | Groq | Scoring règles |
| Road trip | `/api/road-trip` | Groq | Itinéraire règles |
| Style advisor | `/api/recommend` | Groq | Texte statique |

### Prompt chat (résumé)

- Catalogue compact (1 ligne / véhicule) pour limiter les tokens
- Instructions JSON pour recommandation et comparaison
- Contexte page (`pageContext`) : pathname, compareIds, vehicleId
- Réponses courtes (~90 mots), une question à la fois

### Limites connues

- Tier gratuit Groq : quota journalier (~100k tokens) — fallback local activé
- Pas de mémoire serveur longue : historique côté client (`chatStore`)

---

## 13. Service ML (marketing)

**Dossier :** `ml-service/` — FastAPI.

| Endpoint Python | Proxy Next.js | Entrée | Sortie |
|-----------------|---------------|--------|--------|
| `POST /predict-campaign` | `/api/ml-predict` | catégorie, prix, saison, segment | type campagne, canal, ROI, confiance |
| `POST /analyze-leads` | `/api/ml-analyze` | batch leads | taux conversion, segments, recommandations |
| `GET /health` | — | — | statut modèle |

**Fallback :** `src/lib/ml-fallback.ts` si `ML_SERVICE_URL` injoignable ou `ML_USE_LOCAL=true`.

**Auth :** routes ML proxy réservées admin.

---

## 14. Authentification et sécurité

### NextAuth v5 — Credentials

- **Clients :** table `User` — register + login `/compte/*`
- **Admins :** table `Admin` — login `/login`
- Session JWT avec rôle `admin` | `customer`

### Middleware (`middleware.ts`)

Protège : `/dashboard`, `/leads`, `/reservations`, `/analytics` (+ sous-routes).

- Non authentifié → `/login`
- Client sur route admin → `/compte`

### Rate limiting (`src/lib/rateLimit.ts`)

- Chat : 40/min
- Leads : 20/min

### Emails

- SMTP Gmail pour notifications admin (nouveau lead)
- Variables `GMAIL_*`, `ADMIN_NOTIFICATION_EMAIL`

---

## 15. État global (Zustand)

| Store | Persist | Contenu |
|-------|---------|---------|
| `configuratorStore` | Oui | Véhicule, trim, couleur, jantes, intérieur, prix total, `applyFromUrl()` |
| `chatStore` | Oui | Sessions chat, messages, recommandations |
| `compareStore` | Non | IDs comparés (max 3), drawer ouvert |
| `userStore` | Oui | Préférences quiz (budget, usage, carburant, priorité) |

---

## 16. Design system

### Couleurs Toyota (Tailwind / CSS)

| Token | Hex | Usage |
|-------|-----|-------|
| Toyota Red | `#EB0A1E` | CTA, accents |
| Dark bg | `#0A0A0A` / `#050505` | Fond principal |
| Card | `#0d0d0d` / `#111` | Panneaux |
| Muted text | `#9CA3AF` | Texte secondaire |
| Gold | `#C9A84C` | Prix premium |

### Typographie

- **Inter** (Google Fonts)
- Titres : `font-black`, `tracking-tight`
- UI dark mode par défaut, esthétique premium

### Composants UI récurrents

- `BorderDrawButton` — bouton avec bordure animée
- Skeletons chargement catalogue / 3D
- Cartes `rounded-2xl`, bordures `white/5–15%`

---

## 17. Variables d’environnement

Fichier modèle : `.env.example`

| Variable | Obligatoire | Usage |
|----------|-------------|-------|
| `DATABASE_URL` | Oui (prod) | Prisma pooler Supabase |
| `DIRECT_URL` | Oui (prod) | Migrations Prisma |
| `NEXT_PUBLIC_SUPABASE_URL` | Optionnel | Client Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Optionnel | Client Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Optionnel | Server only |
| `GROQ_API_KEY` | Recommandé | Chat, quiz, road-trip, compare |
| `NEXTAUTH_SECRET` | Oui | Sessions |
| `NEXTAUTH_URL` | Oui | URL app |
| `AUTH_TRUST_HOST` | Dev | Auth.js localhost |
| `GMAIL_USER` / `GMAIL_APP_PASSWORD` | Optionnel | Emails admin |
| `ADMIN_NOTIFICATION_EMAIL` | Optionnel | Destinataire |
| `ML_SERVICE_URL` | Optionnel | Service Python |
| `ML_USE_LOCAL` | Optionnel | Force fallback ML |
| `NEXT_PUBLIC_APP_URL` | Oui | Liens absolus |
| `NEXT_PUBLIC_HERO_VIDEO_URL` | Optionnel | Vidéo homepage |

> **Ne jamais committer** `.env.local`.

---

## 18. Structure des fichiers

```
toyota-ai-platform/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── public/
│   └── models/              # GLTF par véhicule (souvent hors git)
├── ml-service/
│   ├── main.py
│   ├── model.py
│   └── requirements.txt
├── scripts/                   # sync-env, smoke-test, email-test
├── src/
│   ├── app/
│   │   ├── page.tsx           # Homepage
│   │   ├── layout.tsx
│   │   ├── (client)/          # Pages publiques + compte
│   │   ├── (admin)/           # Back-office
│   │   └── api/               # 23 routes API
│   ├── components/
│   │   ├── admin/
│   │   ├── catalog/
│   │   ├── chat/
│   │   ├── configurator/
│   │   ├── commerce/
│   │   ├── dealer/
│   │   ├── forms/
│   │   ├── fun/
│   │   ├── layout/
│   │   ├── ui/
│   │   └── vehicle/
│   ├── data/                  # vehicles, dealerships, quiz, offers
│   ├── hooks/                 # useChat, etc.
│   ├── lib/                   # auth, groq, prisma, 3D, ML fallback
│   ├── store/                 # Zustand
│   └── types/
├── middleware.ts
├── package.json
├── toyota_context.md          # Ce document
└── README.md
```

---

## 19. Scripts et commandes

```bash
npm run dev          # Dev Next.js (+ sync .env)
npm run build        # Build production
npm run start        # Serveur production
npm run lint         # ESLint
npm test             # Smoke test (scripts/run-smoke-test.mjs)

npm run db:setup     # generate + push + seed
npm run db:studio    # Prisma Studio

npm run ml:dev       # FastAPI local :8000
npm run ml:train     # Entraînement modèle

npm run email:test   # Test SMTP
```

---

## 20. Déploiement

| Composant | Cible typique |
|-----------|---------------|
| Next.js app | Vercel |
| PostgreSQL | Supabase |
| ML service | Railway.app |
| Assets 3D | `public/models/` (CDN / storage selon taille) |
| Vidéo hero | Cloudinary (URL env) |

---

## 21. Écarts avec l’ancienne spec (COPILOT_CONTEXT)

Éléments **supprimés ou obsolètes** dans l’ancien `COPILOT_CONTEXT_Version2.md` :

| Ancien document | Réalité actuelle |
|-----------------|------------------|
| Next.js **14** | Next.js **16** |
| IA principale **Gemini** | **Groq (Llama)** |
| Page `/chat` dédiée | Chat **widget global** (`ChatWidget`) |
| Page `/catalog` | Route **`/vehicles`** |
| Page `/reservation` client | Flux via **`/acheter`**, `/contact`, `/service` + API |
| 10 modèles seulement | **13 modèles** (+ granvia, corolla-2, kijang) |
| Modèles `.glb` racine | **`/models/{id}/scene.gltf`** |
| Instructions « Copilot génère tout » | Projet **déjà implémenté** — doc descriptive |
| Catalogue JSON entier dans prompt | **Prompt compact** (anti quota) |
| Pas de compte client | **`/compte`** + `User` + configs sauvegardées |
| Pas de compare / quiz / road-trip | **Fonctionnalités livrées** |
| Pas de concessions | **`/concessions`** + carte |
| shadcn/ui explicite | Radix + composants **maison** dans `ui/` |

---

## Annexe — Checklist rapport (suggestions de sections)

Pour un rapport académique / professionnel, ce document peut alimenter :

1. **Contexte & problématique** — digitalisation concession automobile Maroc
2. **Analyse des besoins** — parcours §5, pages §6
3. **Conception architecture** — §4, §8, §9
4. **Choix technologiques** — §3 avec justification (3D web, IA, full-stack JS)
5. **Réalisation** — configurateur §11, IA §12, ML §13
6. **Interface utilisateur** — §16, captures des pages §6
7. **Tests & validation** — `npm test`, smoke tests, fallbacks IA
8. **Déploiement** — §20
9. **Perspectives** — PWA, plus de modèles 3D, paiement, AR

---

*Document généré à partir de l’analyse du code source réel. Pour toute divergence, le dépôt Git fait foi.*
