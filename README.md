## Creator Hive — Next.js 15 Creator Marketplace

Production-ready creator marketplace platform with Fey-inspired monochrome UI, AI-powered search, and agency management features.

**Current Status:** Phase 1 (Critical Path) Complete - Booking → Dashboard → Brief → Pay Flow Ready  
**Last Updated:** 2026-01-13

---

### 🚀 Quick Start

**First time setup?** See the complete [Setup Guide](./SETUP_GUIDE.md)

```bash
# 1. Install dependencies
pnpm install

# 2. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
# CRITICAL: Set both DATABASE_URL (pooled) and DIRECT_URL (direct)

# 3. Set up database
pnpm db:generate
pnpm db:migrate  # Or: npx prisma migrate dev --name add_brief_status_and_audit

# 4. (Optional) Seed database
pnpm db:seed

# 5. Start development server
pnpm dev
```

**⚠️ Important:** Supabase requires dual connection strings:
- `DATABASE_URL` - Pooled connection (port 6543) for application
- `DIRECT_URL` - Direct connection (port 5432) for migrations

**Prisma Configuration:**
- Prisma reads from `.env` file in repo root (not `.env.local`)
- Next.js reads from `.env.local` for runtime
- Ensure both files have `DATABASE_URL` and `DIRECT_URL` set
- Run `npx prisma generate` after setting up `.env` to ensure TypeScript types match the database

---

### 📚 Documentation

#### For Developers
- **[Phase 1 Completion](./PHASE_1_COMPLETION.md)** ⭐ **NEW** - Critical path completion (Booking → Brief → Pay)
- **[Complete Build Status](./BUILD_STATUS_COMPLETE.md)** - Comprehensive frontend, backend, database status
- **[Handover Guide](./HANDOVER_GUIDE.md)** - Quick start for new developers/agents
- **[Implementation Report](./IMPLEMENTATION_REPORT.md)** - Phase A, B & Phase 1 completion details
- **[Developer Summary](./DEVELOPER_SUMMARY.md)** - Detailed implementation status
- **[Session Changelog](./SESSION_CHANGELOG_2026-01-12.md)** - Recent changes

#### Setup & Configuration
- **[Setup Guide](./SETUP_GUIDE.md)** - Complete setup instructions
- **[Database Setup](./DATABASE_SETUP.md)** - Database configuration guide
- **[Project Checklist](./PROJECT_CHECKLIST.md)** - Organization & best practices
- **[Database Recommendation](./DATABASE_RECOMMENDATION.md)** - Why Supabase + Prisma

#### Design System
- **[Design System Guide](./DESIGN_SYSTEM_GUIDE.md)** ⭐ **DESIGN** - Complete design system with dos and don'ts
- **[Design System Docs](./docs/design-system.md)** - Existing design system reference

### 🗄️ Database

This project uses **Supabase (PostgreSQL) + Prisma** for data management.

- **Schema:** `prisma/schema.prisma`
- **Client:** `src/server/db.ts`
- **Migrations:** `prisma/migrations/`
- **Commands:** See [Setup Guide](./SETUP_GUIDE.md#-useful-commands)

**Recent Updates (Phase 1 - 2026-01-13):**
- ✅ Booking flow redirects to campaign dashboard after talent selection
- ✅ Brief API endpoints complete (GET, POST, lock, send, versions)
- ✅ Pay blockers enforcement with deep-links to fix actions
- ✅ DateInputDMY integrated in Manage screen calendar
- ✅ Brief entry point and status tracking in Manage screen
- ✅ CampaignBrief model with versioning and audit fields
- ✅ CampaignStatus enum updated (PROVISIONAL, CONFIRMED_BRIEF_PENDING, etc.)
- ✅ Dual connection setup (pooled + direct for Supabase)

### 🚀 Deploy

**Vercel Deployment:**
1. Push to GitHub and import in Vercel
2. Framework preset: Next.js
3. Set `NODE_VERSION` to 18+
4. Configure environment variables in Vercel dashboard:
   - `DATABASE_URL` (pooled connection)
   - `DIRECT_URL` (direct connection)
   - All other required env vars (see [Build Status](./BUILD_STATUS_COMPLETE.md#-environment-variables))
5. Run migrations: `pnpm db:migrate:deploy`

**Pre-Deployment Checklist:**
- [ ] Run database migration
- [ ] Test brief flow end-to-end
- [ ] Verify date inputs work correctly
- [ ] Test talent carousel at different viewport widths
- [ ] Check TypeScript compilation: `pnpm typecheck`
- [ ] Run linter: `pnpm lint`

### Brand tokens
Colors and utilities live in `src/styles/brand.css` and are wired into Tailwind v4 via `@theme inline`.

Key tokens: `--bg #0A0A0A`, `--text #F2F2F2`, gradient `--accent-from #B5B6F3` → `--accent-to #667BFF`, greys, and status colors.

### UI Library
Custom primitives in `src/components/ui`: `Button`, `Card`, `Badge`, `Stat`, `Tabs`, `Tooltip`, `Toast`, `AccountCard`.

### Testing

**Test Commands:**
```bash
pnpm test          # Unit tests (Vitest)
pnpm test:watch    # Watch mode
pnpm e2e           # E2E tests (Playwright)
pnpm typecheck     # TypeScript check
pnpm lint          # ESLint
```

**Manual Testing Checklist:**
See [Build Status](./BUILD_STATUS_COMPLETE.md#-manual-testing-checklist) for complete checklist.

**Current Test Coverage:**
- ⏳ Unit tests: Partial coverage
- ⏳ E2E tests: Basic setup
- ⏳ Manual testing: Required before production

