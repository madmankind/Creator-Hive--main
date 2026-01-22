# Restore to Golden Fey Dashboard State

This document provides exact commands to restore the repository to the golden Fey unified dashboard state.

## Golden State Info

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

### Restore to v2 (Latest - Recommended)
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

### Switch to v2 (Latest - Recommended)
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

## What's Included in Golden State

### v2 (Latest)
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
