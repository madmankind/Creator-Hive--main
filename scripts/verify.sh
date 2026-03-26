#!/usr/bin/env bash
# scripts/verify.sh — one-shot verification for Claude + Cursor
# Usage: bash scripts/verify.sh
set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "▶ tsc --noEmit"
npx tsc --noEmit
echo "✓ TypeScript clean"

echo ""
echo "▶ next build"
pnpm run build
echo "✓ Build passes"

echo ""
echo "✅ All checks green — safe to commit and push"
