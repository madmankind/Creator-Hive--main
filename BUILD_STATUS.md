# Creator Hive — Current Build Status (Feb 2025)

### Overview
- Version: 0.1.0
- Stack: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, Prisma + Supabase Postgres, Stripe (Connect + webhooks)
- Auth model: NextAuth v5 (credentials provider), role-based (AGENCY, CREATOR, ADMIN), no mock fallback

### Authentication & Authorization (COMPLETE)
- Middleware-enforced route protection by role
- Discovery restricted to AGENCY/ADMIN
- Creator-only routes for invites and payouts
- No mock auth fallback; DATABASE_URL required

### Discovery (COMPLETE)
- DB-backed via Prisma (`creator_profiles`)
- Filters: keywords, roles/skills, locations, interests/niches
- Pagination with total counts; `meta.ignoredFilters` for unsupported filters
- Dictionaries derived from DB values
- Report endpoint reads profiles by id or handle from DB

### Creator Onboarding (COMPLETE)
- Step 1 sets CREATOR role and initializes profile
- Step 2 persists `creator_profiles` with validation (name, handle, skills, location, niches, bio, avatar)
- Profiles appear immediately in discovery
- No follower/ER scraping

### Campaigns (COMPLETE)
- Agency can create, list, view, and edit campaigns
- Campaign ownership enforced (AGENCY/ADMIN)
- Campaign detail page present

### Pods & Invites (COMPLETE)
- Campaign-level pod selection stored in DB
- Invites can be sent to creators; creators accept/decline
- Accepted invites upsert `campaign_talents`
- Agency sees invite statuses on campaign detail

### Files & Attachments (COMPLETE)
- Campaign file uploads to Supabase private bucket (`campaign-files`)
- Server-side uploads using Supabase service role
- Metadata stored in DB with signed URL downloads
- 25MB per file limit enforced

### Payments — Phase 2.0 Foundation (COMPLETE)
- Stripe Connect Express onboarding for creators
- Creator payouts dashboard
- Wallet ledger implemented
- Stripe webhook with signature verification
- Events handled: account.updated, payment_intent.*, transfer.*, payout.*
- Ledger entries recorded idempotently

### Payments — Phase 2.1 (NOT IMPLEMENTED YET)
- Agency funding campaigns via Stripe PaymentIntent
- Releasing payments to creators via Stripe Transfer
- Campaign funding summaries
- To be implemented next

### Environment Variables
- `DATABASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_CONNECT_CLIENT_ID`
- `APP_URL`
- `OPENAI_API_KEY` (optional; mock fallback for /api/ai-search)

### Migrations
- Core schema
- Pods & invites
- Campaign files
- Stripe/wallet foundation

### Known Gaps / Intentional Omissions
- No agency payment flow yet (PaymentIntent funding)
- No milestone-based escrow
- No contracts/SOW system
- No messaging/chat
- No analytics or follower scraping

### Local Setup (Verified)
- `pnpm install`
- `pnpm db:migrate:deploy`
- `pnpm db:seed`
- `pnpm dev`
