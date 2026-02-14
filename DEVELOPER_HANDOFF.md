# Developer handoff – landing carousel & build status

Use this for review and next steps.

---

## Build status (as of handoff)

| Check | Status | Notes |
|-------|--------|--------|
| **Dev server** | ✅ OK | `pnpm dev` or `HOSTNAME=localhost npx next dev --port 3000 --webpack`. Homepage compiles and loads. |
| **Production build** | ⚠️ Env required | `pnpm run build` runs `prisma generate && next build --webpack`. Fails if `.env` / `.env.local` lack **DIRECT_URL** (and **DATABASE_URL**) for Prisma. Add those and re-run for a full build. |
| **TypeScript** | ✅ OK | `middleware.ts` and `prisma/seed.ts` use local `UserRole` types so the project compiles even when Prisma client is not yet generated. |

---

## README (project overview)

- **Repo:** Creator Hive – Next.js 15 creator marketplace (Fey-style UI, AI search, agency features).
- **Quick start:** `pnpm install` → copy `.env.example` to `.env.local` → `pnpm db:generate` + `pnpm db:push` → `pnpm dev`.
- **Docs:** [Setup Guide](./SETUP_GUIDE.md), [Project Checklist](./PROJECT_CHECKLIST.md), [Database Recommendation](./DATABASE_RECOMMENDATION.md).
- **Database:** Supabase (PostgreSQL) + Prisma. Schema: `prisma/schema.prisma`; client: `src/server/db.ts`.
- **Brand/UI:** `src/styles/brand.css` (Tailwind v4); components in `src/components/ui`.

---

## Code structure (landing & carousel)

**Entry:** Landing page is `src/app/page.tsx`. It renders the marketing layout and the “Among the brightest minds” carousel.

**Carousel & cards (edit these for landing behaviour):**

| Path | Purpose |
|------|--------|
| `src/app/page.tsx` | Renders `TalentCarousel` and talent gallery section (`id="talent-gallery"`). |
| `src/components/marketing/TalentCarousel.tsx` | “Among the brightest minds” section: purple gradient band, horizontal track, arrows outside card row, right-edge fade only. |
| `src/components/marketing/LandingTalentCard.tsx` | Card UI: fixed size (380×260), flip, expand modal, Prism badge. |

**Data & config:**

| Path | Purpose |
|------|--------|
| `src/lib/curatedTalent.ts` | `CuratedTalent` type and curated list for the carousel. |
| `src/lib/prism/` | `prism.types.ts`, `prism.config.ts`, `prism.scoring.ts`. |
| `src/components/prism/PrismBadge.tsx` | Prism methodology badge used on cards. |

**Out of scope for landing (do not change for carousel work):**  
`src/features/campaign-intelligence/**`, `src/app/dashboard/**`, `src/app/discovery/**`, and dashboard discovery flows.

---

## Design spec (current implementation)

- **Carousel:** 3 full cards + 4th partial (peek). Single purple radial gradient band; no left fade; right-only fade overlay. Arrows in padding, outside card row. Scroll: 2 cards per step; snap; `scrollbar-hide`.
- **Card:** `380×260` px; dark glass; description 13px, chips 11px; back face: Portfolio tab scrollable inside card (`min-h-0` + `overflow-y-auto`). Hover: glow only (no translate). Header: Prism badge + Flip + Expand.

---

## Next steps for developer

1. **Build & env:** Ensure `.env` / `.env.local` include **DIRECT_URL** and **DATABASE_URL** for `pnpm run build`. Use `next build --webpack` (already in `package.json` build script) for production build.
2. **Verify on desktop:** Confirm 3 full cards + 4th peek, no left fade, arrows in padding, purple band without hard line, back-face Portfolio scrolls inside card, no clipping of CTA/text.
3. **Optional:** Remove or leave `DEBUG_BOUNDS` / `DEBUG_CARD_BOUNDS` (currently `false`) in `TalentCarousel.tsx` and `LandingTalentCard.tsx` if you added them for layout debugging.

---

## Recent fixes applied

- **Middleware:** Replaced `import type { UserRole } from "@prisma/client"` with a local `UserRole` type so the app builds when Prisma client is not generated.
- **Seed:** Same local `UserRole` in `prisma/seed.ts` for consistent TypeScript.
- **Build script:** `package.json` build is `prisma generate && next build --webpack` so production uses webpack.
