# Creator Hive — Agent Handover Guide

**Purpose:** Complete handover documentation for AI agents (e.g., Gemini Pro) to continue development.

**Last Updated:** 2026-01-13  
**Status:** Phase 1 Complete - Ready for handover

---

## 🎯 QUICK START FOR NEW AGENT

### 1. Read These Documents First (Priority Order)
1. **`PHASE_1_COMPLETION.md`** ⭐ **NEW** - Phase 1 (Critical Path) completion details
2. **`BUILD_STATUS_COMPLETE.md`** - Complete build status (frontend, backend, database)
3. **`IMPLEMENTATION_REPORT.md`** - Phase A, B & Phase 1 completion details
4. **`DEVELOPER_SUMMARY.md`** - Detailed implementation status
5. **`SESSION_CHANGELOG_2026-01-12.md`** - Recent changes

### 2. Critical Actions Required
```bash
# 1. Verify environment variables
cat .env.local | grep -E "DATABASE_URL|DIRECT_URL"

# 2. Run database migration (if not done)
npx prisma migrate dev --name add_brief_status_and_audit
npx prisma generate

# 3. Verify build
pnpm typecheck
pnpm lint

# 4. Start dev server
pnpm dev
```

### 3. Test Critical Flows
- [ ] Create campaign → Create brief → Lock → Send
- [ ] Date input formatting (Type "01022026" → "01/02/2026")
- [ ] Talent carousel (no overlap at 1280px)
- [ ] Brief button state changes

---

## 📋 CURRENT STATE SUMMARY

### ✅ Completed (Phase 1 - 2026-01-13)
- **Backend:** Campaign Brief APIs, Booking flow, Pay gating logic
- **Frontend:** Brief form, Date inputs, Track/Manage screens, Brief button
- **Integration:** Booking → Dashboard redirect, Pay blockers with deep-links
- **Database:** Schema updated, migration ready

### ⏳ Pending
- **B4:** Expandable calendar board (nice-to-have)
- **Integration:** Pay UI gating, Talent acceptance UI
- **Testing:** Manual testing checklist

---

## 🔑 KEY CONCEPTS

### Campaign Lifecycle
```
DRAFT → PROVISIONAL → CONFIRMED_BRIEF_PENDING → BRIEF_SENT → ACTIVE → IN_PROGRESS → COMPLETED
```

### Brief Lifecycle
```
DRAFT → (Lock) → SENT → APPROVED/REJECTED
```

### Revenue Model
- **12% fee on BOTH sides** (client-side + talent-side)
- Not shown as single "platform fee"
- Each party sees only relevant totals

---

## 🗂️ FILE ORGANIZATION

### Backend APIs
```
src/app/api/
├── campaigns/[id]/
│   ├── brief/          # Brief CRUD (NEW)
│   │   ├── route.ts    # GET, POST
│   │   ├── lock/       # POST lock
│   │   ├── send/       # POST send
│   │   └── versions/   # GET history
│   └── accept/         # Dev acceptance (NEW)
├── bookings/           # Booking flow (updated)
└── agency/campaigns/   # Campaign management
```

### Frontend Components
```
src/components/
├── campaigns/
│   └── CampaignBriefForm.tsx  # Brief form (API integrated)
├── manage/
│   ├── ManageLayoutV2.tsx     # Brief button
│   ├── WeeklyCalendarPanel.tsx # DateInputDMY integrated
│   └── TalentCarousel.tsx     # Overlap fixed
└── ui/
    └── DateInputDMY.tsx       # Date input (NEW)
```

### Frontend Screens
```
src/features/campaign-intelligence/
├── TrackScreen.tsx     # Track dashboard
├── ManageScreen.tsx    # Manage screen (Brief modal)
└── PayScreen.tsx       # Pay screen (gating pending)
```

---

## 🔧 COMMON TASKS

### Add New API Endpoint
1. Create `src/app/api/[route]/route.ts`
2. Use Zod for validation
3. Check role with `requireUser()` or `getOrCreateAgency(user)`
4. Return consistent JSON: `{ ok: boolean, data?: T, error?: string }`

### Add New Component
1. Create in `src/components/[category]/`
2. Use `feyTokens` for styling
3. Add `"use client"` only if needed
4. Use TypeScript types from `src/lib/types/`

### Update Database Schema
1. Edit `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name [name]`
3. Run `npx prisma generate`
4. Update types in `src/lib/types/`

---

## 🐛 TROUBLESHOOTING

### Database Connection
**Error:** `P1013: Invalid database string`
**Fix:** Ensure both `DATABASE_URL` (pooled) and `DIRECT_URL` (direct) are set.

### Prisma Client
**Error:** `Cannot find module '@prisma/client'`
**Fix:** Run `pnpm db:generate`

### Date Input Clipping
**Issue:** Dropdown behind other elements
**Fix:** `DateInputDMY` uses Portal (z-index: 60). Check parent `overflow`.

### Talent Carousel Overlap
**Issue:** Cards overlapping
**Fix:** Verify flex constraints in `TalentCarousel.tsx`.

---

## 📝 CODE PATTERNS

### API Route Pattern
```typescript
import { requireUser } from "@/server/authz";
import { z } from "zod";
import { db } from "@/server/db";

const schema = z.object({
  // validation
});

export async function POST(req: Request) {
  const { user } = await requireUser();
  const body = await req.json();
  const data = schema.parse(body);
  
  // business logic
  
  return Response.json({ ok: true, data });
}
```

### Component Pattern
```typescript
"use client";

import { useState } from "react";
import { feyTokens } from "@/lib/fey-design-tokens";

export function MyComponent() {
  const [state, setState] = useState();
  
  return (
    <div className="glass-bg">
      {/* UI */}
    </div>
  );
}
```

---

## 🎯 NEXT PRIORITIES

### Immediate
1. Run database migration
2. Test brief flow end-to-end
3. Integrate Pay gating UI

### Short-term
1. Talent acceptance UI
2. Track metric simplification
3. Expandable calendar (B4)

---

## 📞 QUESTIONS?

1. Check `BUILD_STATUS_COMPLETE.md` first
2. Review code comments in implemented files
3. Check TypeScript types for expected data structures
4. Review `DEVELOPER_REFERENCE.md` for API docs

---

**Ready for handover:** ✅ Yes  
**Blockers:** None  
**Next Agent:** Can start immediately after reading documentation
