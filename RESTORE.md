# Restore to Golden Fey Dashboard State

This document provides exact commands to restore the repository to the golden Fey unified dashboard state.

## Golden State Info

- **Branch**: `golden/fey-dashboard-v1`
- **Tag**: `golden/fey-dashboard-v1`
- **Commit**: See `git rev-parse golden/fey-dashboard-v1`

## Quick Restore (Hard Reset)

⚠️ **WARNING**: This will discard all uncommitted changes. Stash first if you need to keep them.

```bash
# 1. Stash any uncommitted changes (optional but recommended)
git stash push -m "backup-before-restore-$(date +%Y%m%d-%H%M%S)"

# 2. Hard reset to golden tag
git fetch --tags
git reset --hard golden/fey-dashboard-v1

# 3. Clean any untracked files (optional)
git clean -fd
```

## Switch to Golden Branch (Keep History)

If you want to switch to the golden branch without losing history:

```bash
# 1. Stash any uncommitted changes
git stash push -m "backup-before-switch-$(date +%Y%m%d-%H%M%S)"

# 2. Switch to golden branch
git checkout golden/fey-dashboard-v1

# 3. If branch doesn't exist locally, fetch and checkout
git fetch origin golden/fey-dashboard-v1
git checkout golden/fey-dashboard-v1
```

## What's Included in Golden State

- ✅ Fey unified dashboard (dark gradient, glass panels, bottom dock navigation)
- ✅ All campaign modes (Track/Manage/Pay/Discover) use unified shell
- ✅ No white sidebar on campaign routes
- ✅ Landing page with "Welcome to Creator Hive"
- ✅ Dev-auth fallback (localStorage session when auth not configured)
- ✅ Legacy routes redirect to unified route

## Verify Restore

After restoring, verify:

1. `/dashboard/campaigns` renders dark Fey dashboard
2. `/dashboard/campaigns?mode=track` shows Track screen with bottom dock
3. `/dashboard/campaigns?mode=manage` shows Manage screen with bottom dock
4. `/dashboard/campaigns?mode=pay` shows Pay screen with bottom dock
5. `/dashboard/campaigns?mode=discover` shows Discover screen with bottom dock
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
