# Cursor Handoff — Creator Hive

> Read `AGENTS.md` at repo root first — it has the full stack, commands, and gotchas.
> This file has Cursor-specific workflow notes.

## Open folder in Cursor
```
File → Open Folder → /Users/ajil/creator-hive-next
```
Same folder Claude uses. Single source of truth.

## Before you edit anything
```bash
git pull origin main        # get latest from Claude's pushes
npx tsc --noEmit            # confirm clean baseline
```

## After you edit
```bash
bash scripts/verify.sh      # tsc + build
git add -A
git commit -m "feat/fix: description"
git push origin main        # Vercel auto-deploys
```

## Key files Cursor should know about

| File | Purpose |
|---|---|
| `src/app/layout.tsx` | Root layout — provider nesting is critical here |
| `src/components/HeroBar.tsx` | AI intake + Grok advisor chat |
| `src/components/discovery/ClientDiscoveryFlow.tsx` | 3-step discovery (new users) |
| `src/store/useDiscoveryStore.ts` | Zustand store for discovery brief |
| `src/lib/curatedTalent.ts` | 31 talent profiles — AI roster context |
| `src/lib/editorial/sources.ts` | 18 RSS feed sources for Hive Culture |
| `src/lib/rateLimit.ts` | AI rate limiting (ai_search, ai_analyze) |
| `src/app/api/ai-chat/route.ts` | Grok conversational endpoint |
| `src/app/api/ai-search/route.ts` | Talent search endpoint |
| `prisma/schema.prisma` | DB schema |
| `vercel.json` | Cron jobs for editorial ingestion |

## Things Claude handles, Cursor should not override
- `prisma db push` / migrations — coordinate before schema changes
- Vercel env vars — don't add new env dependencies without adding to AGENTS.md
- Rate limit config in `src/lib/rateLimit.ts` — changing limits affects production

## Syncing between Claude and Cursor
Both work on the same repo. Workflow:
1. Check `git log --oneline -5` to see what Claude last committed
2. `git pull` before starting
3. Small focused commits — easier for Claude to read context later
4. If you leave a TODO or known issue, add it to AGENTS.md Known Gotchas

## Last verified
**Date:** 2026-03-26  
**Build:** ✅ passes  
**TSC:** ✅ clean
