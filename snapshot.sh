#!/usr/bin/env bash
set -euo pipefail

# Ensure we're in a git repo
git rev-parse --is-inside-work-tree >/dev/null

rm -rf _snapshot
mkdir -p _snapshot/files

# 1) Tree / file inventory
git ls-files > _snapshot/FILES.txt

# Prefer tree if installed, otherwise use find
if command -v tree >/dev/null 2>&1; then
  tree -a -I 'node_modules|.next|.git|dist|build|coverage|.turbo|.vercel|.DS_Store|*.log' > _snapshot/TREE.txt
else
  find . -maxdepth 8 \
    -not -path '*/node_modules/*' \
    -not -path '*/.next/*' \
    -not -path '*/.git/*' \
    -not -path '*/dist/*' \
    -not -path '*/build/*' \
    -not -path '*/coverage/*' \
    -not -path '*/.turbo/*' \
    -not -path '*/.vercel/*' \
    -not -name '*.log' \
    -print > _snapshot/TREE.txt
fi

# 2) Copy key config files (ignore if missing)
cp -f package.json pnpm-lock.yaml tsconfig.json 2>/dev/null || true
cp -f next.config.* tailwind.config.* postcss.config.* 2>/dev/null || true
cp -f eslint.config.* .eslintrc* 2>/dev/null || true
cp -f playwright.config.* vitest.config.* 2>/dev/null || true

# Put them in snapshot/files
for f in package.json pnpm-lock.yaml tsconfig.json; do [ -f "$f" ] && cp -f "$f" _snapshot/files/; done
for f in next.config.* tailwind.config.* postcss.config.* eslint.config.* .eslintrc* playwright.config.* vitest.config.*; do
  for g in $f; do [ -f "$g" ] && cp -f "$g" _snapshot/files/; done
done

# 3) Prisma
mkdir -p _snapshot/files/prisma
[ -f prisma/schema.prisma ] && cp -f prisma/schema.prisma _snapshot/files/prisma/ || true
[ -d prisma/migrations ] && cp -R prisma/migrations _snapshot/files/prisma/ || true

# 4) App/src (tracked only)
# Export tracked folders if they exist
TMP_TAR="_snapshot/repo.tar"
git archive --format=tar HEAD \
  src app pages prisma \
  2>/dev/null > "$TMP_TAR" || true

if [ -s "$TMP_TAR" ]; then
  tar -xf "$TMP_TAR" -C _snapshot/files
  rm -f "$TMP_TAR"
fi

# 5) Env example only
[ -f .env.example ] && cp -f .env.example _snapshot/files/.env.example || true

# 6) Zip
zip -r creatorhive_repo_snapshot.zip _snapshot \
  -x "**/node_modules/**" "**/.next/**" "**/.git/**" "**/*.log"

echo "Created: creatorhive_repo_snapshot.zip"
