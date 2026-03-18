# Creator Hive — Go Live & Testing Mode

## Pre-deploy commands (run in order)

```bash
# 1. Apply all pending migrations
npx prisma migrate deploy

# 2. Regenerate Prisma client (required after schema changes)
npx prisma generate

# 3. Seed test accounts and admin user
pnpm db:seed

# 4. Promote your real account to ADMIN (Supabase SQL editor or psql)
# Replace with your actual email
UPDATE "creatorhive"."users"
SET role = 'ADMIN', "legalAcceptedAt" = NOW(), "legalVersion" = '2026-03'
WHERE email = 'ajil@creatorhive.ae';

# 5. Production build check
pnpm build
```

## Required environment variables

Set all of these in Vercel before deploying:

| Variable | Required | Notes |
|----------|----------|-------|
| `DATABASE_URL` | ✅ | Supabase pooled connection with `?schema=creatorhive` |
| `DIRECT_URL` | ✅ | Supabase direct connection — required for migrations |
| `AUTH_SECRET` | ✅ | Generate: `openssl rand -base64 32` |
| `NEXTAUTH_SECRET` | ✅ | Same value as AUTH_SECRET |
| `AUTH_URL` | ✅ | Production domain e.g. `https://creatorhive.ae` |
| `NEXTAUTH_URL` | ✅ | Same as AUTH_URL |
| `AUTH_TRUST_HOST` | ✅ | Set to `"true"` on Vercel (replaces blanket trustHost) |
| `NEXT_PUBLIC_ENVIRONMENT` | ✅ | Set to `"production"` — activates real robots.txt |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Required for agreement PDF uploads to storage |
| `STRIPE_SECRET_KEY` | ⚠️ | Use `sk_test_` for testing, `sk_live_` for production |
| `STRIPE_PUBLISHABLE_KEY` | ⚠️ | Matching publishable key |
| `STRIPE_WEBHOOK_SECRET` | ⚠️ | From Stripe dashboard webhook config |
| `OPENAI_API_KEY` | ⚠️ | Required for AI search feature |
| `SEED_ADMIN_EMAIL` | Optional | Override default admin@creatorhive.test in seed |

## Deploy (Vercel)

```bash
vercel --prod
# or push to main branch if auto-deploy is configured
```

## Post-deploy manual tests

Run these after every deploy, in order:

### 1. Admin access
- Sign in with `ajil@creatorhive.ae`
- Visit `/admin` — must load without redirect
- Sign in with a non-admin account → visit `/admin` → must redirect to `/`

### 2. Legal gate
- Sign in with any fresh test account (e.g. `agency@creatorhive.test`)
- Visit `/dashboard` — must redirect to `/legal/accept?returnTo=/dashboard`
- Check both links (Terms / Privacy Policy) open correctly
- Tick checkbox, click Continue → must land on `/dashboard`
- Refresh `/dashboard` — must NOT redirect again (acceptance persisted)

### 3. Agreement generation (blocked without legal acceptance)
- Agreement generation is **admin-only**. Endpoint: `POST /api/admin/user-agreement/[userId]`.
- The **target user** (the userId in the path) must have `legalAcceptedAt` set before an agreement can be generated.
- Test via Admin panel: Users → select user → generate agreement. If target has not accepted legal → 500 "Legal acceptance required". After target accepts via `/legal/accept`, retry → 201.
- Or via API: sign in as admin, then `POST https://your-domain/api/admin/user-agreement/[userId]` with admin session cookie.

### 4. Booking flow
- Homepage → add talent to pod → confirm campaign
- Visit `/dashboard/contracts` → contract should appear

### 5. Messages page
- Visit `/dashboard/messages` — must show empty state, no fake names

### 6. Robots
- Visit `/robots.txt` on preview/staging → must show `Disallow: /`
- Visit `/robots.txt` on production → must show allow/disallow rules

### 7. Error boundary
- Visit `/error-test` (non-existent route) — 404 handled gracefully
- Any unhandled error → should show "Something went wrong" screen with Try again

## Testing accounts (seeded)

| Email | Role | Password |
|-------|------|----------|
| `admin@creatorhive.test` | ADMIN | Credentials auth — set in Supabase Auth |
| `agency@creatorhive.test` | AGENCY | Credentials auth |
| `creator@creatorhive.test` | CREATOR | Credentials auth |

> Note: Seeded accounts use Prisma upsert — they exist in the DB but have no
> Supabase Auth password unless you create them via Supabase Auth dashboard.
> For testing, use your real email account via the app's sign-in flow.

## Supabase storage setup (required for agreements)

1. Go to Supabase dashboard → Storage
2. Create a bucket named `user-agreements`
3. Set bucket to **Public** (agreements are accessed by authenticated URL)
4. Confirm `SUPABASE_SERVICE_ROLE_KEY` is set in Vercel env vars

## Testing modes

### Option A: Vercel Preview (recommended)
- Push to a branch → Vercel creates preview URL automatically
- Set `NEXT_PUBLIC_ENVIRONMENT` to anything other than `"production"` on preview
- Robots.txt will block all crawlers on preview automatically

### Option B: Local against staging DB
- Use `.env.local` with staging `DATABASE_URL`
- `pnpm dev` → test at `http://localhost:3000`

### Option C: Local against production DB (use with caution)
- Test data will appear in production DB
- Acceptable for smoke tests, not for load or stress tests

## Admin panel connectivity

| Tab | Data source | Endpoint |
|-----|-------------|----------|
| Overview | Prisma stats | `/api/admin/stats` |
| Bookings | BookingRequest | `/api/admin/bookings`, `/api/admin/bookings/[id]` |
| Campaigns | Campaign | `/api/admin/campaigns`, `/api/admin/campaigns/[id]` |
| Talent | CreatorProfile | Server component + `/api/admin/talent/[id]` |
| Users | User + agreements | `/api/admin/users` |
| Agreements | UserAgreement + Supabase | `/api/admin/user-agreement/[userId]` |

## Known constraints for controlled testing (not blockers)

| Issue | Impact | Fix before public launch |
|-------|--------|--------------------------|
| No rate limiting on auth/booking APIs | Acceptable for internal testing with known users | Add Upstash Redis rate limiter |
| Stripe test keys in use | Payments are sandboxed, no real charges | Swap to `sk_live_` keys with Stripe team approval |
| No email provider configured | No onboarding emails or agreement delivery | Add Resend or Postmark |
| `admin@creatorhive.test` has no Supabase Auth password | Can't sign in via UI | Create via Supabase Auth dashboard if needed |

## Go / No-go summary

| Scenario | Status |
|----------|--------|
| Controlled internal testing | ✅ GO |
| Public launch | ❌ Not yet — rate limiting + email provider required |

## Verified commands (confirmed working as of 2026-03-18)

```bash
npx prisma migrate deploy   # ✅ All 7 migrations applied cleanly
npx prisma generate         # ✅ Client regenerated with legalAcceptedAt
pnpm db:seed                # ✅ Seeds admin + agency + creator accounts
pnpm build                  # ✅ Production build passes, zero TS errors
```
