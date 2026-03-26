# AGENTS.md — Creator Hive

Single source of truth for AI agents (Claude, Cursor) working on this repo.

## Working directory
```
/Users/ajil/creator-hive-next
```
Remote: `git@github.com:madmankind/Creator-Hive--main.git`  
Branch: `main` — Vercel auto-deploys on push.  
**Never force-push main without asking.**

---

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5, React 19 |
| Styling | Tailwind CSS v4 |
| ORM | Prisma 6 + Supabase Postgres |
| Auth | NextAuth / Auth.js v5 (JWT strategy) |
| Payments | Stripe Connect |
| Analytics | PostHog |
| AI | Grok (xAI) via `/api/ai-chat`, `/api/ai-search`, `/api/ai-analyze` |
| Deploy | Vercel (auto on push to main) |
| Package mgr | pnpm |

---

## Commands

```bash
pnpm install          # install deps
pnpm dev              # local dev server (localhost:3000)
pnpm run build        # production build — must pass before committing
pnpm start            # serve production build locally
npx tsc --noEmit      # type-check only (fast)
bash scripts/verify.sh  # tsc + build in one shot
```

---

## Env vars required

All in `.env` and `.env.local` (never commit `.env.local`):

```
DATABASE_URL              # Supabase Postgres connection string
NEXTAUTH_SECRET           # Auth.js secret
NEXTAUTH_URL              # https://creatorhive.ae (prod) or http://localhost:3000 (local)
GOOGLE_CLIENT_ID          # OAuth
GOOGLE_CLIENT_SECRET      # OAuth
GROK_API_KEY              # xAI Grok (ai-chat, ai-search, ai-analyze, editorial enrichment)
NEXT_PUBLIC_POSTHOG_KEY   # PostHog
NEXT_PUBLIC_POSTHOG_HOST  # https://app.posthog.com
STRIPE_SECRET_KEY         # Stripe Connect
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
CRON_SECRET               # Protects /api/editorial/ingest and /api/editorial/re-enrich
```

---

## Architecture — key rules

### Provider nesting (CRITICAL)
`SessionProvider` must wrap everything that calls `useSession`.  
Order in `src/app/layout.tsx`:
```tsx
<Providers>           // contains SessionProvider + QueryClientProvider
  <PostHogProvider>   // PostHogIdentify calls useSession — must be inside Providers
    <AppShell>
      {children}
    </AppShell>
  </PostHogProvider>
</Providers>
```
**Never move PostHogProvider outside Providers.** It will break static prerender.

### DB schema
Schema lives in `prisma/schema.prisma`.  
After schema changes: `npx prisma db push` (dev) or migration for prod.  
After adding models: `npx prisma generate` to regenerate client.

### Auth strategy
JWT (stateless) — no session rows written to DB on login.  
Role stored in JWT token: `AGENCY` (client), `CREATOR` (talent), `ADMIN`.

### Route structure
```
src/app/
  page.tsx                  # Landing / hero (HeroBar, discovery flow)
  dashboard/
    layout.tsx              # Auth gate — exempts /dashboard/hive/* (public)
    campaigns/              # Track / Manage / Pay screens
    hive/                   # Editorial (Culture, Shop, Build) — PUBLIC
    creator/                # Creator dashboard
    settings/               # Settings
  admin/                    # Admin panel — ADMIN role only
  api/
    ai-chat/                # Grok conversational advisor
    ai-search/              # Talent vector search
    ai-analyze/             # Campaign performance analysis
    editorial/ingest/       # RSS ingestion (cron: every 5 days)
    editorial/re-enrich/    # Promote PENDING→ENRICHED (cron: daily)
    discovery/brief/        # Save/load client discovery brief
```

### AI rate limits (src/lib/rateLimit.ts)
| Feature | Authed | Guest |
|---|---|---|
| ai_search | 5/day | 3/day |
| ai_analyze | 10/day | 0 |

### Editorial / Hive content
- 18 RSS sources in `src/lib/editorial/sources.ts`
- Enriched by Grok: tags, category, relevance score
- Displayed in `src/components/hive/HiveCulture.tsx`
- Cron runs via Vercel (`vercel.json`)

---

## Known gotchas

1. **`useSession` outside SessionProvider** — causes build to fail with `Cannot destructure property 'data'`. Always check provider nesting if build breaks with this error.

2. **`themeColor` metadata warnings** — benign Next.js 15 warnings on a few pages. Move to `generateViewport()` eventually.

3. **Legacy `/app/*` routes** — old scaffold, not part of main product. Files in `src/app/app/` are legacy. Don't remove yet but don't build on them.

4. **PostHog** — only client-side. `PostHogIdentify` runs on session establish. Events tracked via `src/lib/analytics.ts`.

5. **Prisma** — after any schema change, always run `npx prisma generate` locally before running code. Vercel build runs `prisma generate` automatically.

6. **Logo assets**:
   - `/public/logo-mark.png` — white C-mark, transparent bg. Used in LogoLoader (fill animation).
   - `/public/logo-circle.png` — dark circle badge. Deprecated in favour of inline circle containers.
   - Pattern: wrap `logo-mark.png` in a `rounded-full` div with `background: rgba(255,255,255,0.07)`.

7. **Hive showreel** — swap videos by editing `SHOWREEL` array in `src/components/hive/HiveCulture.tsx`. Drop MP4s in `/public/showreel/`.

---

## Git discipline

- Small commits with clear messages
- Run `bash scripts/verify.sh` before pushing
- PR or direct push to `main` — Vercel deploys automatically
- No force-push without asking

---

## Last verified

**Date:** 2026-03-26  
**Build passes:** ✅ yes  
**TSC clean:** ✅ yes  
**By:** Claude (automated via Desktop Commander)
