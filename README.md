## Creator Hive — Next.js 15 Creator Marketplace

Production-ready creator marketplace platform with Fey-inspired monochrome UI, AI-powered search, and agency management features.

### 🚀 Quick Start

**First time setup?** See the complete [Setup Guide](./SETUP_GUIDE.md)

```bash
# Install dependencies
pnpm install

# Set up environment variables (see .env.example)
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

> **Note:** Changes to `.env.local` require a **server restart** to take effect. Stop the dev server (Ctrl+C) and run `pnpm dev` or `pnpm dev:local` again.

# Set up database
pnpm db:generate
pnpm db:push

# Start development server
pnpm dev
```

### 📚 Documentation

- **[Setup Guide](./SETUP_GUIDE.md)** - Complete setup instructions
- **[Project Checklist](./PROJECT_CHECKLIST.md)** - Organization & best practices
- **[Database Recommendation](./DATABASE_RECOMMENDATION.md)** - Why Supabase + Prisma

### 🗄️ Database

This project uses **Supabase (PostgreSQL) + Prisma** for data management.

- **Schema:** `prisma/schema.prisma`
- **Client:** `src/server/db.ts`
- **Commands:** See [Setup Guide](./SETUP_GUIDE.md#-useful-commands)

### 🚀 Deploy

- Push to GitHub and import in Vercel
- Framework preset: Next.js
- Set `NODE_VERSION` to 18+
- Configure environment variables in Vercel dashboard
- Run migrations: `pnpm db:migrate:deploy`

### Brand tokens
Colors and utilities live in `src/styles/brand.css` and are wired into Tailwind v4 via `@theme inline`.

Key tokens: `--bg #0A0A0A`, `--text #F2F2F2`, gradient `--accent-from #B5B6F3` → `--accent-to #667BFF`, greys, and status colors.

### UI Library
Custom primitives in `src/components/ui`: `Button`, `Card`, `Badge`, `Stat`, `Tabs`, `Tooltip`, `Toast`, `AccountCard`.

### Testing
- Unit: `pnpm test`
- E2E: `pnpm e2e`

