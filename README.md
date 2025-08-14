## Creator Hive — Next.js 14 Starter

Production-ready app with dark brand system, Revolut-style landing and Cash-App-inspired dashboard.

### Run locally
```bash
pnpm install
pnpm dev
```

### Deploy
- Push to GitHub and import in Vercel. Framework preset: Next.js. Set `NODE_VERSION` to 18+.

### Brand tokens
Colors and utilities live in `src/styles/brand.css` and are wired into Tailwind v4 via `@theme inline`.

Key tokens: `--bg #0A0A0A`, `--text #F2F2F2`, gradient `--accent-from #B5B6F3` → `--accent-to #667BFF`, greys, and status colors.

### UI Library
Custom primitives in `src/components/ui`: `Button`, `Card`, `Badge`, `Stat`, `Tabs`, `Tooltip`, `Toast`, `AccountCard`.

### Testing
- Unit: `pnpm test`
- E2E: `pnpm e2e`

