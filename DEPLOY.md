# Creator Hive — Vercel Environment Variables Checklist
# Set all of these in Vercel Dashboard → Settings → Environment Variables

## ✅ REQUIRED (app won't start without these)
NEXT_PUBLIC_SUPABASE_URL=           # Your Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=      # Supabase anon/public key
SUPABASE_SERVICE_ROLE_KEY=          # Supabase service role key (server-side only)
DATABASE_URL=                       # Supabase Postgres connection string (pooled)
DIRECT_URL=                         # Supabase Postgres direct connection (for migrations)
AUTH_SECRET=                        # NextAuth secret — generate: openssl rand -base64 32
NEXTAUTH_URL=                       # https://creatorhive.ae (production domain)
AUTH_URL=                           # Same as NEXTAUTH_URL

## ✅ REQUIRED FOR PAYMENTS (Stripe Connect)
STRIPE_SECRET_KEY=                  # sk_live_... (production) or sk_test_... (staging)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY= # pk_live_... or pk_test_...
STRIPE_WEBHOOK_SECRET=              # whsec_... from Stripe webhook endpoint config

## ⚠️ OPTIONAL (features degrade gracefully without these)
OPENAI_API_KEY=                     # For AI-powered search/match (discovery endpoint)
SLACK_WEBHOOK_URL=                  # For internal alerts
NEXT_PUBLIC_SITE_URL=               # https://creatorhive.ae (used in OG tags)

## NOTES
# 1. DATABASE_URL should use the pooled connection string from Supabase (port 6543)
# 2. DIRECT_URL should use the direct connection string (port 5432) — for prisma migrate
# 3. Never commit .env.local to git — it's in .gitignore
# 4. After deploying, run: npx prisma db push (or migrate deploy) from your machine
# 5. Then run: npm run seed:creators to seed the talent database

## POST-DEPLOY COMMANDS (run from local after first deploy)
# npx prisma db push
# npm run seed:creators
