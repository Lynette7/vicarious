# 🌍 Around the World in Books

**An AI-powered interactive reading challenge platform that turns your New Year's resolution to diversify your reading into real results.**

[![Next.js](https://img.shields.io/badge/Next.js-15.0-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)](https://www.prisma.io/)
[![Three.js](https://img.shields.io/badge/Three.js-3D-000000?logo=three.js)](https://threejs.org/)

## 📖 About

**Around the World in Books** is a beautiful, interactive platform that helps readers diversify their reading by exploring literature from countries around the globe. Unlike traditional reading trackers, this app combines immersive 3D visualization, AI-powered recommendations, and practical tools to help you actually acquire and read books from diverse cultures.

Whether your 2026 resolution is to "read more diversely," "visit every continent through literature," or "discover authors from 50 different countries," this platform turns those goals into actionable, trackable journeys.

### 🎯 Built for Hackathon: "Commit To Change"
**Category:** Personal Growth & Learning  
**Special Prize:** Best Use of Opik ($5,000)

This project leverages AI agents and observability tools to provide personalized reading recommendations and track reading progress systematically.

---

## ✨ Features

### 🌐 Current Features (Implemented)

#### Interactive 3D Globe
- **Beautiful 3D visualization** powered by Three.js and react-globe.gl
- **Click countries** to zoom in and explore books from that region
- **Auto-rotating globe** with smooth animations
- **Country-specific colors** with unique visual identity
- **Dynamic glow effects** when countries are selected
- **Responsive design** that works on desktop, tablet, and mobile

#### Reading Tracking
- **Add books** with title, author, country, start/end dates
- **Track reading progress** with visual indicators
- **Rating system** (1-5 stars) for books you've read
- **Notes and reflections** for each book
- **Reading statistics** by country and continent

#### Reading Passport 🪪
- **Visual passport** with stamps for each country visited
- **Achievement badges** (Bronze, Silver, Gold, Platinum)
- **Continent tracking** (Africa, Asia, Europe, etc.)
- **Reading statistics** and progress visualization
- **Gamification** to motivate continued exploration

#### Theming System 🎨
- **Three unique themes:**
  - **Renaissance** - Classical, ornate design inspired by "The Renaissance Edition" Awwwards template
  - **Modern** - Futuristic, glassmorphic design with neon effects
  - **Library** - Scholarly, bookish aesthetic with warm leather tones
- **Dark/Light mode** for each theme
- **Smooth theme transitions** with persistent user preferences

#### User Authentication & Backend
- **NextAuth.js** integration with Google OAuth and email/password
- **Prisma ORM** with SQLite (development) / PostgreSQL (production) support
- **User profiles** with saved preferences (theme, mode)
- **Secure book storage** per user account
- **Guest mode** with localStorage fallback

#### Responsive Design
- **Mobile-first** approach
- **Collapsible sidebar** for country navigation
- **Touch-friendly** interactions
- **Adaptive layouts** for all screen sizes

---

### 🤖 Upcoming AI Agent Features (In Development)

#### 📚 AI Reading Coach
- **Personalized recommendations** based on your reading history and preferences
- **Country suggestions** to help you explore underrepresented regions
- **Reading goal optimization** - breaks down ambitious goals into achievable milestones
- **Motivational nudges** - "You're 3 countries away from completing Africa!"
- **Progress analysis** - identifies patterns in your reading habits

#### 🔍 Intelligent Book Recommender
- **Smart suggestions** - "You loved *Things Fall Apart* (Nigeria). Try *Half of a Yellow Sun* or explore Ghana next..."
- **Cultural context** - AI-generated insights about authors, countries, and literary traditions
- **Diversity analysis** - ensures balanced representation across regions and genres
- **Difficulty adaptation** - suggests books matching your reading pace

#### 🏪 Bookshop & Library Finder
- **Find nearby bookstores** using Google Places API
- **Locate libraries** with real-time availability checking
- **Book availability** via Open Library and WorldCat APIs
- **Distance & ratings** for local bookshops and libraries
- **Online alternatives** - links to Bookshop.org, Libby, Open Library
- **Map integration** - visualize locations on an interactive map
- **One-click directions** to physical locations

#### 💭 Reflection Generator
- **Personalized discussion questions** after finishing a book
- **Journal prompts** to deepen understanding of cultural themes
- **Reading insights** - what patterns or themes did you notice?
- **Comparative analysis** - how does this book compare to others from the region?

#### 📊 Opik Observability Integration
- **Track recommendation quality** with LLM-as-judge evaluations
- **Monitor user engagement** - which recommendations led to actual reads?
- **A/B testing** different prompting strategies
- **Performance metrics** - response time, user satisfaction, goal completion rates
- **Experiment tracking** - compare GPT-4 vs Claude recommendations
- **Visual dashboards** for judging and evaluation

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Three.js** - 3D graphics and visualization
- **react-globe.gl** - Interactive globe component
- **d3-geo** - Geographic projections and calculations
- **NextAuth.js** - Authentication and session management

### Backend
- **Prisma ORM** - Database toolkit and query builder
- **SQLite** - Development database (file-based)
- **PostgreSQL** - Production database (recommended)
- **Next.js API Routes** - Serverless API endpoints
- **bcrypt** - Password hashing

### Data & APIs
- **TopoJSON** - Geographic data format (World Atlas)
- **Google Places API** - Find nearby bookshops and libraries (planned)
- **Google Books API** - Book metadata and ISBN lookup (planned)
- **Open Library API** - Book availability and lending (planned)
- **WorldCat API** - Library holdings search (planned)

### Observability (Planned)
- **Opik** - AI observability and evaluation platform
- **LLM-as-judge** - Automated quality assessments
- **Experiment tracking** - A/B testing and optimization

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ and npm
- **Git** for version control
- **Google Cloud account** (for Places API - optional for now)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/around-the-world-in-books.git
   cd around-the-world-in-books
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL="file:./dev.db"

   # NextAuth.js
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"

   # Google OAuth (optional)
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"

   # Google Places API (for bookshop/library finder - optional)
   NEXT_PUBLIC_GOOGLE_PLACES_API_KEY="your-google-places-api-key"

   # Opik API (for observability - optional)
   OPIK_API_KEY="your-opik-api-key"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma Client
   npx prisma generate

   # Create database and apply migrations
   npx prisma db push

   # (Optional) Open Prisma Studio to view database
   npx prisma studio
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

### First Steps

1. **Sign up** for an account or continue as a guest
2. **Choose a theme** (Renaissance, Modern, or Library) from the theme switcher
3. **Toggle dark/light mode** to match your preference
4. **Click on a country** in the sidebar to explore
5. **Add your first book** using the "Add Book" button
6. **View your Reading Passport** to see stamps and achievements

---

## 📁 Project Structure

```
around-the-world-in-books/
├── app/                      # Next.js App Router
│   ├── api/                  # API routes
│   │   ├── auth/             # NextAuth.js routes
│   │   └── books/            # Book CRUD endpoints
│   ├── auth/                 # Authentication pages
│   │   ├── signin/           # Sign in page
│   │   └── signup/           # Sign up page
│   ├── globals.css           # Global styles and theme variables
│   ├── layout.tsx            # Root layout with providers
│   └── page.tsx              # Main application page
├── components/               # React components
│   ├── Globe.tsx             # 3D globe visualization
│   ├── AddBookModal.tsx      # Add book form
│   ├── BookList.tsx          # Book list display
│   ├── PassportModal.tsx     # Reading passport
│   ├── AuthButton.tsx        # Authentication button
│   ├── ThemeSwitcher.tsx     # Theme selection
│   └── CountrySelector.tsx   # Country dropdown
├── context/                  # React Context providers
│   └── ThemeContext.tsx      # Theme and mode state
├── lib/                      # Utility libraries
│   ├── prisma.ts             # Prisma client singleton
│   ├── auth.ts               # NextAuth.js configuration
│   ├── themes.ts             # Theme definitions
│   ├── colors.ts             # Color utilities
│   ├── countries.ts          # Country data and mappings
│   ├── continents.ts         # Continent data
│   ├── achievements.ts       # Achievement definitions
│   └── storage.ts            # localStorage utilities (guest mode)
├── prisma/                   # Prisma schema and migrations
│   ├── schema.prisma         # Database schema
│   └── migrations/           # Database migrations
└── types/                    # TypeScript type definitions
    ├── index.ts              # Application types
    └── next-auth.d.ts        # NextAuth.js type extensions
```

---

## 🎯 Hackathon Alignment

### Category: Personal Growth & Learning

**How this project helps users grow:**
- ✅ **Intellectual growth** through exposure to diverse perspectives and cultures
- ✅ **Goal achievement** by breaking down "read more diversely" into trackable milestones
- ✅ **Self-awareness** through reading reflections and progress analysis
- ✅ **Consistent learning** with AI-powered recommendations and motivation

### Judging Criteria Match

| Criterion | How We Address It |
|-----------|-------------------|
| **Functionality** | Fully working app with globe, tracking, themes, authentication |
| **Real-world relevance** | Addresses common New Year's resolution, practical book acquisition tools |
| **Use of LLMs/Agents** | AI reading coach, book recommender, reflection generator (in development) |
| **Evaluation & Observability** | Opik integration planned for tracking recommendation quality and user engagement |
| **Goal Alignment** | Clearly helps users learn and grow through diverse reading |

### Opik Integration Plan (Best Use of Opik Prize)

- **Recommendation quality tracking** - LLM-as-judge evaluates if suggestions are relevant
- **User engagement metrics** - Track which recommendations lead to actual book reads
- **A/B testing** - Compare different prompting strategies for the AI coach
- **Goal completion tracking** - Monitor progress toward reading diversity goals
- **Performance monitoring** - Response time, user satisfaction scores
- **Experiment dashboards** - Visual representation for judging

---

## 🗺️ Roadmap

### Phase 1: Core Platform ✅ (Completed)
- [x] 3D interactive globe
- [x] Book tracking system
- [x] Reading passport with achievements
- [x] Theming system (3 themes, dark/light mode)
- [x] User authentication and backend
- [x] Responsive design

### Phase 2: AI Agent Features 🚧 (In Progress)
- [ ] AI reading coach with personalized recommendations
- [ ] Intelligent book recommender with cultural context
- [ ] Reading goal optimization
- [ ] Reflection generator with discussion questions

### Phase 3: Practical Tools 📅 (Planned)
- [ ] Bookshop finder (Google Places API)
- [ ] Library finder with availability checking
- [ ] Online alternatives integration (Bookshop.org, Libby)
- [ ] Map visualization for nearby locations

### Phase 4: Observability & Optimization 📊 (Planned)
- [ ] Opik integration for experiment tracking
- [ ] LLM-as-judge evaluation system
- [ ] A/B testing framework
- [ ] Analytics dashboard for recommendations

### Phase 5: Enhanced Features 💡 (Future)
- [ ] Social features (share reading journey, follow friends)
- [ ] Reading challenges (join community goals)
- [ ] Book clubs (discuss books with other readers)
- [ ] Export reading data (CSV, JSON, Goodreads sync)

---

## 🤝 Contributing

Contributions are welcome! This is a hackathon project, but we'd love to see:
- Bug fixes and improvements
- New theme designs
- Additional AI features
- Better observability integrations

Please open an issue or submit a pull request.

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🙏 Acknowledgments

- **Three.js** and **react-globe.gl** for the beautiful 3D globe
- **Awwwards "The Renaissance Edition"** for design inspiration
- **TopoJSON** World Atlas for country boundary data
- **Next.js** and **Prisma** teams for excellent developer experience

---

## 📧 Contact

Questions or suggestions? Feel free to open an issue or reach out!

---

**Happy Reading! 📚🌍**

*Turn your New Year's resolution into a journey around the world—one book at a time.*