# Restore to Golden Fey Dashboard State

This document provides exact commands to restore the repository to the golden Fey unified dashboard state.

## Golden State Info

### Baseline (Pre-Discovery+Booking Refactor): Latest Stable
- **Branch**: `golden/baseline-pre-discovery-booking`
- **Tag**: `golden/baseline-pre-discovery-booking`
- **Commit**: See `git rev-parse golden/baseline-pre-discovery-booking`
- **Features**: Landing page + dev-auth fallback + Fey unified dashboard v2 (right KPI panel, scroll, refined manage, no top pills)
- **Purpose**: Safe restore point before Discovery + Booking refactor (Phase 1+)

### Latest (v2): Right KPI Panel + Scroll + Refined
- **Branch**: `golden/fey-dashboard-v2`
- **Tag**: `golden/fey-dashboard-v2`
- **Commit**: See `git rev-parse golden/fey-dashboard-v2`
- **Features**: Right-side KPI panel, scrollable pages, no top pills, refined Manage layout

### Previous (v1): Base Unified Dashboard
- **Branch**: `golden/fey-dashboard-v1`
- **Tag**: `golden/fey-dashboard-v1`
- **Commit**: See `git rev-parse golden/fey-dashboard-v1`

## Quick Restore (Hard Reset)

⚠️ **WARNING**: This will discard all uncommitted changes. Stash first if you need to keep them.

### Restore to Baseline (Pre-Discovery+Booking - Recommended)
```bash
# 1. Stash any uncommitted changes (optional but recommended)
git stash push -m "backup-before-restore-$(date +%Y%m%d-%H%M%S)"

# 2. Hard reset to baseline tag
git fetch --tags
git reset --hard refs/tags/golden/baseline-pre-discovery-booking

# 3. Clean any untracked files (optional)
git clean -fd
```

### Restore to v2 (Latest Dashboard)
```bash
# 1. Stash any uncommitted changes (optional but recommended)
git stash push -m "backup-before-restore-$(date +%Y%m%d-%H%M%S)"

# 2. Hard reset to golden v2 tag
git fetch --tags
git reset --hard golden/fey-dashboard-v2

# 3. Clean any untracked files (optional)
git clean -fd
```

### Restore to v1 (Previous)
```bash
# 1. Stash any uncommitted changes
git stash push -m "backup-before-restore-$(date +%Y%m%d-%H%M%S)"

# 2. Hard reset to golden v1 tag
git fetch --tags
git reset --hard golden/fey-dashboard-v1

# 3. Clean any untracked files (optional)
git clean -fd
```

## Switch to Golden Branch (Keep History)

If you want to switch to the golden branch without losing history:

### Switch to Baseline (Pre-Discovery+Booking - Recommended)
```bash
# 1. Stash any uncommitted changes
git stash push -m "backup-before-switch-$(date +%Y%m%d-%H%M%S)"

# 2. Fetch tags and switch to baseline (detached HEAD at tag)
git fetch --tags
git checkout refs/tags/golden/baseline-pre-discovery-booking
```

### Switch to v2 (Latest Dashboard)
```bash
# 1. Stash any uncommitted changes
git stash push -m "backup-before-switch-$(date +%Y%m%d-%H%M%S)"

# 2. Switch to golden v2 branch
git checkout golden/fey-dashboard-v2

# 3. If branch doesn't exist locally, fetch and checkout
git fetch origin golden/fey-dashboard-v2
git checkout golden/fey-dashboard-v2
```

### Switch to v1 (Previous)
```bash
# 1. Stash any uncommitted changes
git stash push -m "backup-before-switch-$(date +%Y%m%d-%H%M%S)"

# 2. Switch to golden v1 branch
git checkout golden/fey-dashboard-v1

# 3. If branch doesn't exist locally, fetch and checkout
git fetch origin golden/fey-dashboard-v1
git checkout golden/fey-dashboard-v1
```

## Recover WIP Stash

If you stashed work before a restore and need to recover it:

```bash
# 1. List all stashes
git stash list

# 2. View a specific stash
git stash show -p stash@{N}

# 3. Apply a stash (keeps it in stash list)
git stash apply stash@{N}

# 4. Apply and remove from stash list
git stash pop stash@{N}

# 5. Create a branch from a stash
git stash branch recovery-branch-name stash@{N}
```

**Common stash names:**
- `WIP before Discovery+Booking refactor (Phase 0)` - Work stashed before Phase 1

## Important Notes

⚠️ **Do not continue Phase 1 (Discovery + Booking refactor) unless `git status` is clean.**

Before starting any refactor:
1. Ensure you're on the intended baseline branch
2. Run `git status --porcelain` and confirm it's empty
3. If you have uncommitted changes, commit or stash them first

## What's Included in Golden State

### Baseline (Pre-Discovery+Booking)
- ✅ Landing page with "Welcome to Creator Hive"
- ✅ Dev-auth fallback (localStorage session when auth not configured)
- ✅ Fey unified dashboard v2 (all features below)
- ✅ All campaign modes (Track/Manage/Pay/Discover) use unified shell
- ✅ No white sidebar on campaign routes
- ✅ Legacy routes redirect to unified route

### v2 (Latest Dashboard)
- ✅ Fey unified dashboard (dark gradient, glass panels, bottom dock navigation)
- ✅ KPI/Planned panel on RIGHT side (not floating overlay)
- ✅ Scrollable pages (no fixed viewport trap)
- ✅ No top-right Track/Manage/Pay pills (bottom dock only)
- ✅ Refined Manage layout (scrollable, calendar aligned)
- ✅ All campaign modes (Track/Manage/Pay/Discover) use unified shell
- ✅ No white sidebar on campaign routes
- ✅ Landing page with "Welcome to Creator Hive"
- ✅ Dev-auth fallback (localStorage session when auth not configured)
- ✅ Legacy routes redirect to unified route

### v1 (Previous)
- ✅ Fey unified dashboard (dark gradient, glass panels, bottom dock navigation)
- ✅ All campaign modes (Track/Manage/Pay/Discover) use unified shell
- ✅ No white sidebar on campaign routes
- ✅ Landing page with "Welcome to Creator Hive"
- ✅ Dev-auth fallback (localStorage session when auth not configured)
- ✅ Legacy routes redirect to unified route

## Verify Restore

After restoring, verify:

1. `/dashboard/campaigns` renders dark Fey dashboard
2. `/dashboard/campaigns?mode=track` shows Track screen:
   - ✅ No top-right pills (only bottom dock)
   - ✅ KPI/Planned panel on RIGHT side
   - ✅ Page scrolls naturally
3. `/dashboard/campaigns?mode=manage` shows Manage screen:
   - ✅ No top-right pills (only bottom dock)
   - ✅ Scrollable content
   - ✅ Calendar aligned properly
4. `/dashboard/campaigns?mode=pay` shows Pay screen:
   - ✅ No top-right pills (only bottom dock)
   - ✅ Scrollable content
   - ✅ Fey dark shell
5. `/dashboard/campaigns?mode=discover` shows Discover screen:
   - ✅ No top-right pills (only bottom dock)
   - ✅ Scrollable content
   - ✅ Fey dark shell
6. Landing page (`/`) shows "Welcome to Creator Hive"
7. Auth modal works with dev fallback (no "Configuration" error)

## Recovery from Stash

If you stashed changes and want to recover them:

```bash
# List stashes
git stash list

# Apply most recent stash
git stash pop

# Or apply a specific stash
git stash apply stash@{0}
```
