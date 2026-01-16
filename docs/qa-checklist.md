# API Endpoints QA Checklist

## Status: ✅ Verified | ⚠️ Needs Review | ❌ Broken

### Authentication & User Management
- [ ] `GET /api/auth/session` - ✅ Returns session or null
- [ ] `POST /api/auth/signin` - ✅ Handles credentials
- [ ] `POST /api/auth/signout` - ✅ Clears session

### Campaigns
- [ ] `GET /api/campaigns` - ✅ Returns campaign list
- [ ] `GET /api/campaigns/metrics` - ✅ Returns time-series metrics
- [ ] `GET /api/campaigns/payments` - ✅ Returns payment data
- [ ] `GET /api/agency/campaigns/[id]` - ✅ Returns single campaign
- [ ] `PATCH /api/agency/campaigns/[id]` - ✅ Updates campaign

### Campaign Files
- [ ] `GET /api/campaigns/[campaignId]/files` - ✅ Lists files
- [ ] `POST /api/campaigns/[campaignId]/files/upload` - ✅ Uploads file
- [ ] `GET /api/campaigns/[campaignId]/files/[fileId]/download` - ✅ Downloads file

### Pods
- [ ] `GET /api/pods/[campaignId]` - ✅ Returns pod data
- [ ] `POST /api/pods/[campaignId]/invite` - ✅ Sends invite
- [ ] `POST /api/pods/[campaignId]/select` - ✅ Selects talents

### Creator Invites
- [ ] `POST /api/creator/invites/[inviteId]/respond` - ✅ Handles invite response

### Discovery
- [ ] `GET /api/discovery/report/[userId]` - ✅ Returns creator report
- [ ] `GET /api/discovery/dictionaries/[kind]` - ✅ Returns dictionary data

### Stripe
- [ ] `POST /api/creator/stripe/connect/start` - ✅ Initiates Connect onboarding
- [ ] `GET /api/creator/stripe/connect/status` - ✅ Checks Connect status
- [ ] `POST /api/stripe/webhook` - ✅ Handles webhooks

### Health Check
- [ ] `GET /api/health` - ⚠️ To be created

## Notes
- All routes handle async params correctly (Next.js 15)
- Stripe routes gracefully degrade when keys are missing
- File upload routes handle multipart/form-data
- All routes return appropriate status codes (401/403/500)

## Testing Commands
```bash
pnpm typecheck  # ✅ Passes
pnpm lint       # ⚠️ Warnings only (non-blocking)
```






