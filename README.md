# Vicarious

**An AI-powered interactive reading challenge that helps you explore world literature, one country at a time.**

[![Next.js](https://img.shields.io/badge/Next.js-14.x-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)](https://www.prisma.io/)
[![Three.js](https://img.shields.io/badge/Three.js-3D-000000?logo=three.js)](https://threejs.org/)
[![Gemini](https://img.shields.io/badge/Google-Gemini-4285F4)](https://ai.google.dev/)

## About

**Vicarious** is an interactive platform that helps readers diversify their reading by exploring literature from countries across the globe.

Unlike traditional reading trackers, this app combines:

- **Immersive 3D visualization** (interactive globe)
- **AI-powered recommendations** (Google Gemini)
- **Location-aware book discovery** (nearby shops/libraries + online options)
- **Gamified passport & achievements**
- **AI observability** (via Opik-style tracing)

so that a goal like \"read from 30 countries\" becomes a concrete, trackable journey.

---

## Features

### Interactive 3D Globe

- **3D globe** built with `react-globe.gl` and Three.js
- **Click countries** to zoom and see books you’ve read from there
- **Elevation & highlighting** based on how many books you’ve read from each country
- **Glow ring** and smooth camera animation around the selected country
- **Tooltips** with country name and book count
- **Theme-aware visuals** that adapt to the selected theme (Renaissance, Modern, Library)

### Reading Tracking

- **Add books** with:
  - Title, author
  - Country (ISO code + display name)
  - Start/end dates
  - Rating (1–5 stars)
  - Notes and reflections
  - Optional cover image URL
- **Per-user library** stored in PostgreSQL (via Prisma)
- **Reading stats** by country and continent

### Reading Passport & Gamification

- **Passport modal** with multiple tabs:
  - **Cover** — snapshot of your journey (books, countries, continents)
  - **Stamps** — one stamp per country, color-coded by continent
  - **Achievements** — tiered badges (Bronze / Silver / Gold / Platinum)
  - **Stats** — continent progress bars and breakdowns
- **Achievement system** (`lib/achievements.ts`):
  - Book milestones (1, 10, 25, 50 books)
  - Country milestones (5, 10, 25, 50 countries)
  - Continent milestones (2, 4, 6 continents)
  - Regional sets (e.g. African Safari, Asian Odyssey, European Tour, Americas Adventure, Pacific Voyager)

### Theming System

- **Multiple visual themes:**
  - **Renaissance** — classical, ornate design
  - **Modern** — glassmorphism / neon
  - **Library** — warm, bookish aesthetic
- **Dark / light mode** for each theme
- **Persistent preferences** stored per user or in localStorage (guest)

### AI Agent Features (Gemini)

#### AI Reading Coach (Sidebar & Navbar)

- **Sidebar AI coach**:
  - Generates **one focused recommendation** at a time
  - Uses your reading history + countries covered to suggest a new country/book
- **Navbar AI coach**:
  - Opens a modal with **multiple recommendations** at once
  - Each recommendation shows title, author, country, rationale, cultural context, and difficulty
  - **Add to To-Read list** in one click

#### How Gemini is used

- Centralized AI logic in `lib/ai.ts`
- Uses `@google/genai` (new Gemini SDK) plus a REST fallback
- **Dynamic model discovery**:
  - Calls the ListModels API to discover available Gemini models
  - Tries user-configured model first (`GEMINI_MODEL`)
  - Falls back through a set of current models (e.g. `gemini-2.0-flash`, `gemini-2.5-flash`, `gemini-2.0-flash-lite`)
- Generates:
  - **Book recommendations** (single and multi)
  - **Reflection prompts** after you finish a book
- Returns **structured JSON** so the UI can reliably render cards and metadata

### To-Read List

- Dedicated **To-Read section** showing books you’ve saved from:
  - AI recommendations
  - Manual additions
- Each item stores:
  - Title, author
  - Country code/name
  - Source (e.g. `recommendation`)
- Convert to-read items into fully tracked \"read\" books

### Book Finder & Location Features

- **Location settings** (`components/LocationSettings.tsx`):
  - Use browser geolocation (with reverse geocoding)
  - Look up a city by name via **OpenStreetMap Nominatim** (no API key)
  - Manually adjust/save coordinates
- **Nearby discovery** (`components/BookFinder.tsx`, `lib/location.ts`):
  - Uses **Google Places API (New)** (`places.googleapis.com/v1/places:searchNearby`)
  - Finds nearby **bookshops** and **libraries**
  - Returns name, address, distance, rating, `googleMapsUri`, and website where available
  - One-click **Directions** and **Website** buttons
- **Online options**:
  - \"Buy\" sources: Amazon Kindle, Google Play Books, Kobo, Bookshop.org
  - \"Free / library\" sources: Open Library, Project Gutenberg, Standard Ebooks, Libby
  - \"Discover\" sources: Goodreads, WorldCat
  - URLs are initially search-based, then refined using ISBN via Google Books API where possible

### Opik-style Observability

- Implemented in `lib/opik.ts` and wired into AI routes
- **Lazy initialization**:
  - Uses dynamic `require('opik')`
  - Only activates if `OPIK_API_KEY` is set
- Tracks:
  - **Recommendation traces** — prompt, model, latency, output
  - **LLM-as-judge evaluation** — scores on relevance, diversity, cultural authenticity
  - **User engagement** — viewed, clicked finder, added to list, marked read
- Offers a **metrics API** endpoint to view:
  - Total recommendations
  - Average quality score
  - Engagement rate
  - Top recommended countries
  - Basic in-memory fallback when Opik is not configured

### Authentication & Guest Mode

- **NextAuth.js** with:
  - Email/password (bcrypt) credentials provider
  - Optional Google / GitHub OAuth (when configured)
- **JWT sessions** via Prisma adapter
- **Guest mode**:
  - Full app works without signing in
  - Data stored in `localStorage`
  - Smooth path to persist data to the database once you sign up

---

## Tech Stack

### Frontend

- **Next.js 14** (App Router)
- **React + TypeScript**
- **Tailwind CSS**
- **react-globe.gl** + **Three.js** for the globe
- **d3-geo** and TopoJSON for geographic data

### Backend

- **Next.js API Routes** (`app/api/*`)
- **Prisma ORM**
- **PostgreSQL** (via Neon / Vercel Postgres)
- **bcrypt** for password hashing

### AI & Observability

- **Google Gemini** via `@google/genai` and REST API fallback
- Model discovery using Gemini **ListModels** API
- **Opik** for tracing, LLM-as-judge, and engagement tracking (optional but integrated)

### Location & Data APIs

- **Google Places API (New)** — nearby bookshops & libraries
- **OpenStreetMap Nominatim** — forward/reverse geocoding (no API key)
- **Google Books API** — metadata and ISBN lookup
- Multiple external book/link providers (Amazon, Google Play Books, Kobo, Bookshop.org, Open Library, Libby, Project Gutenberg, Standard Ebooks, Goodreads, WorldCat)

---

## Getting Started (Local Development)

### Prerequisites

- **Node.js** 18+
- **npm**
- **PostgreSQL** database (e.g. Neon or Vercel Postgres)
- A **Google Gemini** API key

### 1. Clone the repository

```bash
git clone https://github.com/Lynette7/vicarious.git
cd vicarious
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment variables

Create a `.env` file in the project root. Example (simplified):

```env
# Database (PostgreSQL)
DATABASE_URL="postgresql://user:password@host:port/dbname?sslmode=require"
# Direct URL for migrations / non-pooled connections
DIRECT_URL="postgresql://user:password@host:port/dbname?sslmode=require"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="dev-secret-change-in-production"

# Google Gemini
GOOGLE_GEMINI_API_KEY="your-gemini-api-key"
GEMINI_MODEL="gemini-2.0-flash"

# Google OAuth (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# GitHub OAuth (optional)
GITHUB_ID="your-github-client-id"
GITHUB_SECRET="your-github-client-secret"

# Google Places API (New)
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY="your-google-places-api-key"

# Opik (optional, for observability)
OPIK_API_KEY="your-opik-api-key"
OPIK_URL_OVERRIDE="https://www.comet.com/opik/api"
OPIK_PROJECT_NAME="vicarious"
OPIK_WORKSPACE_NAME="your-workspace-name"
```

### 4. Database setup (PostgreSQL via Prisma)

The app now uses PostgreSQL (e.g. Neon / Vercel Postgres) in both development and production.

```bash
# Run migrations (creates tables)
npx prisma migrate dev --name init

# Optional: open Prisma Studio
npx prisma studio
```

### 5. Run the dev server

```bash
npm run dev
```

Then open `http://localhost:3000` in your browser.

### First-time flow

1. Sign up for an account (or explore as a guest).
2. Set your **theme** and dark/light mode.
3. Configure your **location** in `Location Settings`.
4. Add a few books from different countries.
5. Open the **Passport** to see your stamps and achievements.
6. Try the **AI Reading Coach** from the sidebar and navbar.
7. Use **Book Finder** on a recommendation to see nearby and online options.

---

## Project Structure (High-Level)

```text
vicarious/
├── app/
│   ├── api/
│   │   ├── auth/                  # NextAuth routes
│   │   ├── books/                 # Book CRUD, to-read, finder
│   │   ├── ai/                    # Sidebar AI coach API
│   │   ├── recommendations/       # Navbar AI coach API
│   │   ├── user/                  # Preferences & location APIs
│   │   └── opik/                  # Metrics / engagement APIs
│   ├── auth/                      # Sign in / sign up pages
│   ├── layout.tsx                 # Root layout
│   └── page.tsx                   # Main dashboard (globe, sidebar, modals)
├── components/
│   ├── Globe.tsx                  # 3D globe visualization
│   ├── AddBookModal.tsx           # Add/edit book form
│   ├── BookList.tsx               # Books per country
│   ├── PassportModal.tsx          # Passport & achievements
│   ├── AIRecommendations.tsx      # Sidebar AI reading coach
│   ├── RecommendationsModal.tsx   # Navbar AI coach modal
│   ├── ToReadSection.tsx          # To-read list UI
│   ├── BookFinder.tsx             # Nearby & online availability
│   ├── LocationSettings.tsx       # Location management UI
│   ├── AuthButton.tsx             # Sign in/out button
│   ├── ThemeSwitcher.tsx          # Theme & mode switcher
│   └── CountrySelector.tsx        # Country dropdown / filters
├── lib/
│   ├── prisma.ts                  # Prisma client singleton
│   ├── auth.ts                    # NextAuth config
│   ├── ai.ts                      # Gemini integration & prompts
│   ├── opik.ts                    # Opik client + helpers
│   ├── location.ts                # Places + Nominatim helpers
│   ├── themes.ts                  # Theme definitions
│   ├── countries.ts               # Country data & mappings
│   ├── continents.ts              # Continent logic
│   ├── achievements.ts            # Achievement rules
│   └── storage.ts                 # localStorage utilities
├── prisma/
│   ├── schema.prisma              # PostgreSQL schema
│   └── migrations/                # Prisma migrations
└── types/
    ├── index.ts                   # Shared types
    └── next-auth.d.ts             # NextAuth type extensions
```

---

## License

This project is open source and available under the [MIT License](LICENSE).

---

*Turn your reading goals into a journey around the world—one book at a time.*
