# Culture Editorial Ingestion Pipeline

Automated content ingestion for `/dashboard/hive` (Culture page).
Fetches editorial metadata from premium fashion, beauty, creator-economy,
and GCC sources via RSS, enriches with Grok AI, and surfaces ranked
stories on the Culture editorial desk.

## Architecture

```
RSS Feeds (10 sources)
      │
      ▼
  Ingestion Pipeline (src/lib/editorial/ingest.ts)
      │  fetch → dedupe → insert → enrich
      ▼
  Supabase Postgres (editorial_items, editorial_sources, editorial_runs)
      │
      ▼
  Culture Page (src/components/hive/HiveCulture.tsx)
      │  ranked by: tier bonus + AI relevance + recency
      ▼
  Links out to original source (no full-body mirroring)
```

## Sources (10 active)

| Source | Slug | Tier | Tags | Feed |
|--------|------|------|------|------|
| Vogue | vogue | hero | fashion, beauty, lifestyle, brands | RSS ✅ |
| Highsnobiety | highsnobiety | hero | fashion, brands, lifestyle, creator-products | RSS ✅ |
| GQ | gq | hero | fashion, beauty, lifestyle | RSS ✅ |
| Hypebeast | hypebeast | hero | fashion, brands, lifestyle, creator-products | RSS ✅ |
| Vogue Arabia | vogue-arabia | hero | fashion, beauty, gcc, lifestyle | RSS ✅ |
| Tubefilter | tubefilter | primary | creator-economy, platform-update, social-commerce | RSS ✅ (gzip) |
| Glossy | glossy | primary | beauty, brands, creator-products, social-commerce | RSS ✅ |
| Modern Retail | modern-retail | primary | social-commerce, platform-update, brands | RSS ✅ |
| WWD | wwd | primary | fashion, brands, beauty | RSS ✅ |
| Business of Fashion | business-of-fashion | primary | fashion, brands, creator-economy | RSS ✅ |

### Coverage mix
- 40% culture / fashion / beauty editorial (Vogue, GQ, Highsnobiety, Hypebeast, WWD)
- 25% creator + influencer products (Tubefilter, Glossy, BoF)
- 20% platform / social-commerce (Modern Retail, Tubefilter, Glossy)
- 15% GCC / Middle East (Vogue Arabia)

### Tier system
- **hero** — eligible for cover story and hero placement
- **primary** — story grid, secondary cards
- **brief** — compact briefs / lower rail (none currently; reserved for future)

### Sources NOT included (and why)
- **GQ Middle East** — no working RSS feed, site returns 404 on all feed URLs
- **Arab News** — Cloudflare 403 blocks all programmatic access
- **TikTok Newsroom** — no RSS/sitemap, static React SPA only

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `GROK_API_KEY` | Yes (for enrichment) | xAI Grok API key for AI summaries, tags, relevance |
| `CRON_SECRET` | Production only | Auth header for Vercel cron. Set in Vercel dashboard |

## How to Run

### Manual sync (local dev)
```bash
# Via API route (loads .env.local automatically)
curl -X POST http://localhost:3000/api/editorial/ingest

# Via CLI (needs manual env loading)
GROK_API_KEY=$(grep GROK_API_KEY .env.local | sed 's/.*=//') \
  npx tsx -e "const { runFullIngestion } = require('./src/lib/editorial/ingest'); runFullIngestion().then(console.log)"
```

### Check status
```bash
curl http://localhost:3000/api/editorial/status | jq .
```

### Production (Vercel)
Cron is configured in `vercel.json`:
```json
{
  "crons": [{ "path": "/api/editorial/ingest", "schedule": "0 */4 * * *" }]
}
```
Runs every 4 hours. Auth via `CRON_SECRET` env var in Vercel dashboard.

## Database Schema

### editorial_sources
Stores source configuration: slug, name, feedUrl, siteUrl, category, tags, tier, status.

### editorial_items
Stores ingested content metadata:
- `canonicalUrl` (unique, dedupe key)
- `title`, `excerpt`, `imageUrl`, `author`, `publishedAt`
- `category`, `tags[]` (AI-generated)
- `aiSummary` (Grok, max 160 chars)
- `aiRelevance` (0.0–1.0, culture relevance score)
- `aiTone` (editorial, news, opinion, review, interview, trade)
- `duplicateOf` (cross-source duplicate hint)
- `status`: PENDING → ENRICHED / HIDDEN / DUPLICATE

### editorial_runs
Logs each ingestion run: source, timestamps, items found/new/skipped, errors.

## How Culture Page Renders

1. `src/app/dashboard/hive/page.tsx` fetches via `getCultureStories(24)`
2. Stories are ranked: `(relevance + tierBonus) × (0.5 + 0.5 × recencyDecay)`
   - hero tier: +0.2 bonus
   - primary tier: +0.1 bonus
   - Recency decays over 7 days
3. If ≥3 DB items exist → renders DB content with MaybeLink click-through
4. If <3 DB items → falls back to hardcoded editorial data
5. Categories are pulled dynamically from enriched items

## Cost

- **RSS fetching**: Free (HTTP requests)
- **Grok enrichment**: ~$0.01–0.03 per run (batches of 5, grok-3-mini)
- **Vercel cron**: Free on Pro plan
- **Database**: Supabase free tier (271 items currently, grows ~100/day max)
- **Estimated monthly cost**: < $5

## Files

```
src/lib/editorial/
  sources.ts      — Source definitions (10 sources with tags + tier)
  rss.ts          — RSS fetcher with gzip fallback + image extraction
  enrich.ts       — Grok AI enrichment (summary, tags, relevance, tone)
  ingest.ts       — Main pipeline: seed → fetch → dedupe → insert → enrich
  queries.ts      — DB queries for Culture page (ranked stories, categories)
  index.ts        — Barrel export

src/app/api/editorial/
  ingest/route.ts — POST handler (Vercel cron target + manual trigger)
  status/route.ts — GET handler (admin health check)

prisma/schema.prisma — EditorialSource, EditorialItem, EditorialRun models
vercel.json          — Cron schedule (every 4 hours)
```
