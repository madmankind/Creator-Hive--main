# Creator Hive — Quick Reference Card

**Last Updated:** 2026-01-12  
**Status:** Phase A & B Complete (89%)

---

## 🚀 COMMANDS

```bash
# Setup
pnpm install
pnpm db:generate
pnpm db:migrate

# Development
pnpm dev
pnpm typecheck
pnpm lint

# Testing
pnpm test
pnpm e2e

# Database
pnpm db:studio      # Prisma Studio
pnpm db:seed        # Seed database
pnpm db:reset       # Reset database
```

---

## 📁 KEY FILES

### Backend
- `prisma/schema.prisma` - Database schema
- `src/app/api/campaigns/[id]/brief/route.ts` - Brief CRUD
- `src/app/api/bookings/route.ts` - Booking flow
- `src/lib/payReadiness.ts` - Pay gating

### Frontend
- `src/features/campaign-intelligence/TrackScreen.tsx` - Track page
- `src/features/campaign-intelligence/ManageScreen.tsx` - Manage page
- `src/components/campaigns/CampaignBriefForm.tsx` - Brief form
- `src/components/ui/DateInputDMY.tsx` - Date input

---

## 🔌 API ENDPOINTS

### Brief APIs
- `GET /api/campaigns/[id]/brief` - Get brief
- `POST /api/campaigns/[id]/brief` - Create/update
- `POST /api/campaigns/[id]/brief/lock` - Lock
- `POST /api/campaigns/[id]/brief/send` - Send
- `GET /api/campaigns/[id]/brief/versions` - History

### Campaign APIs
- `GET /api/campaigns` - List
- `POST /api/agency/campaigns` - Create
- `GET /api/agency/campaigns/[id]` - Details

---

## 🗄️ DATABASE

### Status Enums
```prisma
CampaignStatus: DRAFT → PROVISIONAL → CONFIRMED_BRIEF_PENDING → BRIEF_SENT → ACTIVE → IN_PROGRESS → COMPLETED
BriefStatus: DRAFT → SENT → APPROVED/REJECTED
```

### Connection
- `DATABASE_URL` - Pooled (port 6543) for app
- `DIRECT_URL` - Direct (port 5432) for migrations

---

## 🎨 COMPONENTS

### DateInputDMY
```tsx
<DateInputDMY
  value={isoDate} // YYYY-MM-DD
  onChange={(isoDate) => handleDateChange(isoDate)}
/>
```

### Brief Button States
- No brief: "Create brief" (gray)
- Draft: "Complete brief" (purple dot)
- Sent: "Brief sent" (green dot)

---

## ⚠️ TROUBLESHOOTING

**Database Error:** Check `DATABASE_URL` and `DIRECT_URL`  
**Prisma Error:** Run `pnpm db:generate`  
**Date Clipping:** Check parent `overflow` (uses Portal)  
**Carousel Overlap:** Verify flex constraints

---

## 📚 DOCUMENTATION

1. **BUILD_STATUS_COMPLETE.md** - Full status
2. **HANDOVER_GUIDE.md** - Agent handover
3. **IMPLEMENTATION_REPORT.md** - Phase details
4. **DEVELOPER_SUMMARY.md** - Implementation status

---

## ✅ CHECKLIST

- [ ] Database migration run
- [ ] Environment variables set
- [ ] Brief flow tested
- [ ] Date inputs verified
- [ ] Talent carousel tested
- [ ] TypeScript compiles
- [ ] Linter passes

---

**For detailed info, see BUILD_STATUS_COMPLETE.md**
