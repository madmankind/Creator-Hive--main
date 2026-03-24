# Creator Hive — Developer Reference

**Last Updated:** January 2025  
**Version:** 0.1.0  
**Tech Stack:** Next.js 15, React 19, TypeScript, Prisma, Supabase, Tailwind CSS v4, Framer Motion

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture & Tech Stack](#architecture--tech-stack)
3. [Database Schema](#database-schema)
4. [Core Features](#core-features)
5. [API Routes](#api-routes)
6. [UI Components](#ui-components)
7. [Pages & Routes](#pages--routes)
8. [Design System](#design-system)
9. [External Integrations](#external-integrations)
10. [Development Workflow](#development-workflow)
11. [Known Issues & Limitations](#known-issues--limitations)

---

## 🎯 Project Overview

**Creator Hive** is a creator marketplace platform that connects brands/agencies with top-tier creators. The platform features:

- **AI-powered search** for matching brands with creators
- **Members-only discovery directory** backed by a curated internal dataset
- **Agency management** with talent management capabilities
- **Onboarding flows** for both creators and agencies
- **Fey-inspired monochrome UI** with smooth animations

### Key User Flows

1. **Brands/Agencies:** Search for creators → View results → Manage campaigns
2. **Creators:** Sign up → Build profile → Get discovered → Manage projects
3. **Discovery:** Browse Instagram creators → Filter by location/language/interests → View detailed reports

---

## 🏗️ Architecture & Tech Stack

### Core Technologies

- **Framework:** Next.js 15.4.6 (App Router)
- **React:** 19.1.0
- **TypeScript:** 5.x
- **Database:** PostgreSQL (Supabase) + Prisma ORM
- **Styling:** Tailwind CSS v4
- **Animations:** Framer Motion 12.23.12
- **State Management:** Zustand 5.0.8
- **Data Fetching:** SWR 2.3.6
- **Form Validation:** Zod 4.0.17
- **UI Components:** Radix UI primitives

### Project Structure

```
creator-hive-next/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (marketing)/        # Marketing pages
│   │   ├── (dashboard)/        # Dashboard pages
│   │   ├── api/                # API routes
│   │   ├── dashboard/          # Agency/Talent dashboard
│   │   ├── discovery/          # Curated discovery UI (members only)
│   │   ├── get-started/        # Agency onboarding (disabled)
│   │   ├── onboarding/         # Creator onboarding
│   │   └── results/            # AI search results
│   ├── components/             # React components
│   │   ├── agency/            # Agency-specific components
│   │   ├── marketing/          # Marketing page components
│   │   ├── onboarding/         # Onboarding components
│   │   └── ui/                 # Reusable UI primitives
│   ├── lib/                    # Utilities & helpers
│   ├── server/                 # Server-side utilities
│   └── store/                  # Zustand stores
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Database seeding
└── public/                    # Static assets
```

---

## 🗄️ Database Schema

### Core Models

#### **User & Authentication**
- `User` — Base user model (email, name, role, image)
- `Account` — OAuth provider accounts (Google, Apple, etc.)
- `Session` — User sessions
- `VerificationToken` — Email verification tokens

**Roles:** `AGENCY`, `CREATOR`, `ADMIN`

#### **Agency & Talent Management**
- `AgencyAccount` — Agency profiles (name, website, location)
- `CreatorProfile` — Creator profiles (bio, skills, rates, Instagram handle)

#### **Campaigns & Projects**
- `Campaign` — Campaign briefs (title, brief, status, budget, dates)
- `CampaignTalent` — Many-to-many relationship between campaigns and creators

**Campaign Statuses:** `DRAFT`, `ACTIVE`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`

#### **Messaging**
- `Message` — Messages between agencies and creators (linked to campaigns)

#### **Financial**
- `Invoice` — Invoices for creator work (amount, status, due date)
- `Transaction` — Payment transactions (linked to invoices)

**Invoice Statuses:** `PENDING`, `SENT`, `PAID`, `OVERDUE`, `CANCELLED`  
**Transaction Types:** `PAYMENT`, `REFUND`, `FEE`, `WITHDRAWAL`

### Key Relationships

- `User` → `AgencyAccount` (one-to-one)
- `User` → `CreatorProfile` (one-to-one)
- `AgencyAccount` → `CreatorProfile[]` (one-to-many)
- `Campaign` → `CampaignTalent[]` → `CreatorProfile[]` (many-to-many)
- `Invoice` → `Transaction` (one-to-one)

---

## ✨ Core Features

### 1. Landing Page (`/`)

**Location:** `src/app/page.tsx`

**Features:**
- Centered hero layout with Fey-style spotlight background
- Toggle between "Brands" and "Creators" modes
- **Brands mode:** AI-powered search bar with role selection
- **Creators mode:** Sign-up form (email, WhatsApp, Google/Apple OAuth)
- Smooth animations using Framer Motion

**Key Components:**
- `SearchBar` — AI search with role chips
- `AuthBar` — Inline sign-up form (rendered directly in page)

### 2. AI-Powered Search

**Location:** `src/components/SearchBar.tsx`

**Features:**
- Text input for campaign brief
- Horizontal dropdown with 30+ role chips (expandable/collapsible)
- Selected roles shown as removable chips (with "×" button)
- Circle logo "Go" button with loading animation
- "Discover" CTA button linking to `/discovery`
- Navigates to `/results` with search params

**Role List:** 30 roles including Influencer, Content Creator, Videographer, Designer, etc. (see `src/lib/roles.ts`)

**API Integration:** `POST /api/ai-search` (OpenAI GPT-4o-mini)

### 3. AI Search Results Page (`/results`)

**Location:** `src/app/results/page.tsx`

**Features:**
- Displays AI-interpreted search results
- Shows query and selected roles
- Grid layout with creator cards
- Match score percentage
- Skills/niches display
- "View Profile" buttons

**API:** Consumes `/api/ai-search` endpoint

### 4. Discovery Directory (`/discovery`)

**Location:** `src/app/discovery/page.tsx`

**Features (members-only):**
- **Left filter rail:**
  - Platform toggle (Instagram, YouTube, TikTok — Instagram active)
  - Keywords search
  - Dictionary-powered filters:
    - Location (countries/cities)
    - Language
    - Audience interests
    - Brands
  - Numeric filters:
    - Followers (min/max)
    - Engagement rate (min %)
- **Results list:**
  - Creator cards with avatar, name, handle
  - Stats: Followers, ER%, Engagement
  - "View" button opens detailed report modal
  - "Save" button (placeholder)
  - Pagination (Previous/Next)

**API Routes:**
- `POST /api/discovery/search` — Search the curated talent set
- `GET /api/discovery/report/[userId]` — Get curated profile details
- `GET /api/discovery/health` — Health check for the local dataset

**Data Model:**
- All results are sourced from `src/lib/curatedTalent.ts`
- Followers, engagement rate, interests, and brand partners are maintained manually
- Access is gated via NextAuth session — unauthenticated visitors see a "members only" message

### 5. Creator Onboarding

#### Step 1: Account Type Selection
**Location:** `src/app/onboarding/step-1/page.tsx`

**Features:**
- Choose between "Creator" or "Talent Manager"
- Navigation to step 2

#### Step 2: Build Profile
**Location:** `src/app/onboarding/step-2/page.tsx`

**Features:**
- **One-liner** (60 char limit)
- **Instagram display name** with live preview:
  - Auto-links to Instagram profile
  - Fetches OpenGraph data (avatar + title)
  - Shows preview card
  - Note about Instagram Graph API for follower counts
- **Skills** (max 3 chips)
- **Hourly rate** (dropdown: $25-50, $50-100, $100-200, $200+)
- **Profile photo** upload (placeholder UI)

**Instagram Preview Component:** `src/components/onboarding/InstaField.tsx`

**API:** `GET /api/social/instagram?username=...` — Fetches OpenGraph tags

### 6. Agency Dashboard

**Location:** `src/app/dashboard/`

**Layout:** `src/app/dashboard/layout.tsx`
- Left sidebar (3 cols on md, 2 cols on xl)
- Main content area (9 cols on md, 10 cols on xl)

**Pages:**
- `/dashboard` — Main dashboard (placeholder)
- `/dashboard/campaigns` — Campaign management
- `/dashboard/invoices` — Invoice management
- `/dashboard/messages` — Messaging
- `/dashboard/wallet` — Wallet/financial overview

**Sidebar Component:** `src/components/agency/Sidebar.tsx`
- Navigation links for Campaigns, Inbox, Invoices, Wallet
- Talent filtering (left sidebar)

**Note:** Agency onboarding at `/get-started/agency` is currently **disabled** and redirects to `/discovery`.

### 7. Marketing Pages

**Location:** `src/app/(marketing)/`

**Pages:**
- `/` — Landing page (handled by root `page.tsx`)
- `/for-brands` — Brands marketing page
- `/for-creators` — Creators marketing page
- `/pricing` — Pricing page
- `/talent` — Talent showcase
- `/docs` — Documentation

**Components:** `src/components/marketing/`
- `Hero`, `CTA`, `FAQ`, `Footer`, `Process`, `Proof`, `Roles`, `ValueGrid`, etc.

---

## 🔌 API Routes

### AI Search

**`POST /api/ai-search`**
- **Purpose:** AI-powered search interpretation
- **Request Body:**
  ```json
  {
    "query": "string (optional)",
    "roles": ["string[]"] (optional)
  }
  ```
- **Response:**
  ```json
  {
    "ok": true,
    "query": "string",
    "roles": ["string[]"],
    "ai": {
      "interpretedBrief": "string",
      "primaryRoles": ["string[]"],
      "secondaryKeywords": ["string[]"],
      "searchDSL": "string"
    },
    "source": "openai" | "mock"
  }
  ```
- **Features:**
  - Uses OpenAI GPT-4o-mini
  - Falls back to mock data if API unavailable
  - Validates input (requires query OR roles)

### Discovery Directory (Curated)

**`POST /api/discovery/search`**
- **Purpose:** Search the curated, invite-only creator directory
- **Request Body:**
  ```json
  {
    "page": 0,
    "sort": { "field": "followers", "direction": "desc" },
    "filter": {
      "locations": ["Dubai, UAE"],
      "languages": ["English"],
      "interests": ["Luxury Fashion"],
      "brands": ["Chalhoub Group"],
      "followers": { "min": 50000 },
      "engagementRate": { "min": 0.03 }
    }
  }
  ```
- **Response:**
  ```json
  {
    "data": [{
      "id": "talent-1",
      "username": "sarahalmansoori",
      "fullName": "Sarah Al-Mansoori",
      "followers": 185000,
      "engagementRate": 0.038,
      "engagement": 7030,
      "location": "Dubai, UAE",
      "languages": ["English", "Arabic"],
      "interests": ["Luxury Fashion", "Beauty"],
      "brands": ["Chalhoub Group", "Faces"]
    }],
    "meta": {
      "page": 0,
      "hasMore": false,
      "total": 8,
      "source": "curated"
    }
  }
  ```
- **Notes:**
  - Results are derived from `src/lib/curatedTalent.ts`
  - Pagination is handled in-memory (`PAGE_SIZE = 15`)

- **Purpose:** Get filter dictionary options derived from curated data
- **Kinds:** `locations`, `languages`, `interests`, `brands`
- **Query Params:** `query` (search term), `limit` (default: 50)
- **Response:**
  ```json
  {
    "data": [{ "id": "Dubai, UAE", "name": "Dubai, UAE" }],
    "meta": { "total": 8, "source": "curated" }
  }
  ```

**`GET /api/discovery/report/[userId]`**
- **Purpose:** Return the curated profile card for a given talent ID or Instagram handle
- **Response:** `{ "profile": { "name": "...", "followers": 185000, ... }, "meta": { "source": "curated" } }`

**`GET /api/discovery/health`**
- **Purpose:** Health check for the curated dataset service
- **Response:** `{ "ok": true, "message": "Discovery data served from curated talent set" }`

### Social Media

**`GET /api/social/instagram?username=...`**
- **Purpose:** Fetch Instagram profile preview (OpenGraph)
- **Response:**
  ```json
  {
    "title": "string",
    "image": "string (URL)",
    "url": "string"
  }
  ```
- **Implementation:**
  - Fetches Instagram HTML
  - Extracts `og:title` and `og:image` meta tags
  - No follower counts (requires Instagram Graph API)

## 🎨 UI Components

### Core Components

**`SearchBar`** (`src/components/SearchBar.tsx`)
- AI search input with role selection
- Horizontal dropdown with expand/collapse
- Removable role chips
- Loading states

**`InstaField`** (`src/components/onboarding/InstaField.tsx`)
- Instagram username input
- Live preview card
- OpenGraph data fetching

**`Sidebar`** (`src/components/agency/Sidebar.tsx`)
- Agency dashboard navigation
- Talent filtering

### UI Primitives (`src/components/ui/`)

- **`Button`** — Variants: default, outline, ghost, link
- **`Card`** — Container with header, content, footer
- **`Badge`** — Status badges
- **`Stat`** — Statistic display
- **`Tabs`** — Tab navigation (Radix UI)
- **`Tooltip`** — Tooltip (Radix UI)
- **`Toast`** — Toast notifications
- **`AccountCard`** — User account card
- **`EmptyState`** — Empty state placeholder

### Marketing Components (`src/components/marketing/`)

- `Hero`, `CTA`, `FAQ`, `Footer`, `Process`, `Proof`, `Roles`, `ValueGrid`, `Comparison`, `LogoCloud`, `Reveal`, `Section`

---

## 🛣️ Pages & Routes

### Public Routes

- `/` — Landing page (Brands/Creators toggle)
- `/discovery` — Curated discovery directory (members only)
- `/results` — AI search results
- `/onboarding/step-1` — Account type selection
- `/onboarding/step-2` — Build profile

### Marketing Routes (`(marketing)`)

- `/for-brands` — Brands marketing page
- `/for-creators` — Creators marketing page
- `/pricing` — Pricing page
- `/talent` — Talent showcase
- `/docs` — Documentation

### Dashboard Routes (`/dashboard`)

- `/dashboard` — Main dashboard
- `/dashboard/campaigns` — Campaigns
- `/dashboard/invoices` — Invoices
- `/dashboard/messages` — Messages
- `/dashboard/wallet` — Wallet

### Disabled Routes

- `/get-started/agency` — **Disabled** (redirects to `/discovery`)
- `/get-started/agency/talents` — **Disabled**
- `/get-started/agency/review` — **Disabled**

---

## 🎨 Design System

### Color Palette

**Background:**
- Primary: `#0B0F14` (dark blue-black)
- Surface: `#0D1117` (slightly lighter)
- Input: `#0F141A` (input backgrounds)

**Text:**
- Primary: `white/90` (`text-white/90`)
- Secondary: `white/70` (`text-white/70`)
- Muted: `white/60` (`text-white/60`)
- Weak: `white/40` (`text-white/40`)

**Borders:**
- Default: `ring-white/10`
- Hover: `ring-white/20`
- Focus: `ring-[rgb(var(--ring))]` (cyan: `#22D3EE`)

**Accents:**
- Ring color: `#22D3EE` (cyan)
- Glow effects: Radial gradients with white opacity

### Typography

- **Font:** Inter (via `next/font/google`)
- **Sizes:**
  - Headline: `text-[32px] md:text-[40px]`
  - Subhead: `text-[28px] md:text-[32px]`
  - Body: `text-[15px]` or `text-sm`
  - Small: `text-xs` or `text-[12px]`

### Spacing & Layout

- **Container:** `max-w-[1100px]` (landing), `max-w-7xl` (discovery)
- **Padding:** `px-6` (mobile), `p-8` (desktop)
- **Gaps:** `gap-2`, `gap-3`, `gap-4` (consistent spacing)

### Components

- **Buttons:** Rounded-full, `bg-white/10`, `ring-1 ring-white/10`
- **Inputs:** Rounded-full or `rounded-2xl`, `bg-white/5`, `ring-1 ring-white/10`
- **Cards:** `rounded-xl` or `rounded-2xl`, `bg-white/5`, `ring-1 ring-white/10`
- **Chips:** `rounded-full`, `bg-white/10`, `border border-white/10`

### Animations

- **Framer Motion:** Used for page transitions and component animations
- **Transitions:** `transition` class on interactive elements
- **Loading:** Spinning ring animation on search button

### Spotlight Effect

**Location:** `src/app/layout.tsx`

```tsx
<div
  aria-hidden
  className="pointer-events-none fixed inset-0 mx-auto max-w-[980px]
             bg-[radial-gradient(50%_40%_at_50%_0%,rgba(255,255,255,0.08),rgba(0,0,0,0)_60%)]
             opacity-80"
/>
```

---

## 🔗 External Integrations

### OpenAI

**Purpose:** AI-powered search interpretation

**API:** Chat Completions (GPT-4o-mini)

**Environment Variable:** `OPENAI_API_KEY`

**Fallback:** Mock response if API unavailable

### Discovery Dataset (Internal)

**Purpose:** Serve members-only discovery data without third-party APIs

**Implementation:**
- Data lives in `src/lib/curatedTalent.ts`
- API routes (`/api/discovery/*`) filter and paginate that dataset
- Access is restricted on the client (requires a valid NextAuth session)

### Supabase

**Purpose:** PostgreSQL database + authentication

**Environment Variables:**
- `DATABASE_URL` — PostgreSQL connection string
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anonymous key

**Connection:**
- Uses Prisma ORM
- Connection pooling via PgBouncer (port 6543)
- SSL required (`sslmode=require`)

### Instagram (OpenGraph)

**Purpose:** Profile preview (avatar + title)

**Implementation:** HTML scraping (no official API)

**Future:** Instagram Graph API for follower counts

---

## 🛠️ Development Workflow

### Setup

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Environment variables:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your credentials
   ```

3. **Database setup:**
   ```bash
   pnpm db:generate  # Generate Prisma Client
   pnpm db:push      # Push schema to database
   ```

4. **Start dev server:**
   ```bash
   pnpm dev
   ```

### Available Scripts

- `pnpm dev` — Start development server (with Turbopack)
- `pnpm build` — Build for production
- `pnpm start` — Start production server
- `pnpm lint` — Run ESLint
- `pnpm typecheck` — TypeScript type checking
- `pnpm test` — Run unit tests (Vitest)
- `pnpm e2e` — Run E2E tests (Playwright)

### Database Commands

- `pnpm db:generate` — Generate Prisma Client
- `pnpm db:push` — Push schema changes (dev)
- `pnpm db:migrate` — Create migration (dev)
- `pnpm db:migrate:deploy` — Deploy migrations (production)
- `pnpm db:studio` — Open Prisma Studio
- `pnpm db:seed` — Seed database
- `pnpm db:reset` — Reset database

### Code Quality

- **Linting:** ESLint (Next.js config)
- **Formatting:** Prettier
- **Type Checking:** TypeScript strict mode
- **Git Hooks:** Husky + lint-staged

---

## ⚠️ Known Issues & Limitations

### Current Limitations

1. **Agency Onboarding Disabled**
   - `/get-started/agency` redirects to `/discovery`
   - Agency onboarding flow is not functional

2. **Authentication Not Implemented**
   - Sign-up forms are UI-only
   - No actual OAuth or email verification
   - Session management placeholder

3. **Instagram Follower Counts**
   - OpenGraph scraping doesn't provide follower counts
   - Requires Instagram Graph API (Meta app setup needed)

4. **Discovery Dataset Maintenance**
   - Curated data is static JSON and must be updated manually
   - Add tooling/CRUD to keep followers and engagement stats fresh

5. **Database Connection Issues**
   - TLS certificate validation issues reported
   - May need `sslmode=require` or connection string adjustments

6. **Turbopack Stability**
   - Some Turbopack crashes reported
   - Can run without Turbopack: `next dev` (not `next dev --turbopack`)

### Future Enhancements

1. **Complete Authentication Flow**
   - Email/WhatsApp OTP
   - Google/Apple OAuth
   - Session management

2. **Campaign Management**
   - Full CRUD for campaigns
   - Talent assignment workflow
   - Status tracking

3. **Messaging System**
   - Real-time messaging
   - Campaign-linked conversations

4. **Payment Integration**
   - Stripe integration
   - Invoice generation
   - Wallet functionality

5. **Instagram Graph API**
   - Follower count fetching
   - Post analytics
   - Audience insights

6. **Advanced Search**
   - Full-text search
   - Filtering by skills, niches, rates
   - Saved searches

---

## 📚 Additional Documentation

- **[Setup Guide](./SETUP_GUIDE.md)** — Complete setup instructions
- **[Project Checklist](./PROJECT_CHECKLIST.md)** — Organization & best practices
- **[Quick Reference](./QUICK_REFERENCE.md)** — Common commands
- **[Database Recommendation](./DATABASE_RECOMMENDATION.md)** — Why Supabase + Prisma

---

## 🔐 Environment Variables Reference

### Required

```env
# Database
DATABASE_URL="postgresql://..."

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."

# NextAuth
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"
```

### Optional

```env
# OpenAI
OPENAI_API_KEY="sk-..."

# OAuth (for seed/development)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Email (for seed/development)
EMAIL_SERVER="..."
EMAIL_FROM="..."

# Stripe (future)
STRIPE_SECRET_KEY="..."
STRIPE_WEBHOOK_SECRET="..."
```

---

## 📝 Notes for Developers

1. **Always use TypeScript** — No `any` types in new code
2. **Follow design system** — Use existing color tokens and component patterns
3. **Error handling** — Always provide fallbacks and user-friendly messages
4. **API routes** — Use `export const dynamic = "force-dynamic"` for dynamic routes
5. **Client components** — Mark with `"use client"` directive
6. **Server components** — Default in App Router, use for data fetching
7. **Environment variables** — Never commit secrets, use `.env.local`

---

**End of Developer Reference**
