# Creator Hive Booking Flow - CTO Implementation

## Status: Phase 1 Complete ✅

### Completed (Phase 1)

#### 1. ✅ Canonical Schemas Created
**File:** `src/lib/schemas/booking.ts`
- **Enums defined:**
  - `PricingTier`: HIVE_SELECT | HIVE_SIGNATURE (replaces Pro/Signature)
  - `Timeline`: ASAP | THIS_MONTH | NEXT_MONTH | FLEXIBLE
  - `Objective`: AWARENESS | GROWTH | CONVERSIONS | LAUNCH
  - `RequestStatus`: 13 states from DRAFT_BRIEF → CLOSED/CANCELLED
- **Core schemas:**
  - `BriefLiteSchema`: Complete brief with outputs, platforms, markets (multi-select), languages, keyMessaging, timeline, pricingTier
  - `PodSchema`: Talent IDs (1-10)
  - `BookingRequestCreateSchema`: Brief + pod + companyName + email (phone/note optional)
  - `MatchScoreSchema`: requestId + talentId + score (0-10) + rationale (≤60 chars)
- **Display helpers:** Labels and descriptions for all enums
- **Result:** Single source of truth, zero schema drift

#### 2. ✅ Match Score Computation (Scientific & Deterministic)
**File:** `src/lib/matching/match-score.ts`
- **Weighted algorithm:**
  - Role fit: 35%
  - Platform fit: 20%
  - Market/language fit: 15%
  - Objective/output fit: 20%
  - Tier appropriateness: 10%
- **Output:** Integer score 0-10 + one-liner rationale (≤60 chars)
- **Rationale generation:** Top 2 contributing factors auto-selected
- **Result:** Deterministic, repeatable match scoring

#### 3. ✅ Talent Cards Updated (Checkpoint Restored)
**File:** `src/components/marketing/LandingTalentCard.tsx`
- **Changes made:**
  - ✅ Removed "Hourly" and "Monthly" availability tags
  - ✅ Added tier tags with tooltips:
    - **Hive Select** (white/5 bg, white/70 text) - "Vetted premium talent"
    - **Hive Signature** (purple/10 bg, purple-300 text) - "Vetted premium talent with proven social influence"
  - ✅ Tier determination: 50k+ followers = Hive Signature
  - ✅ Fixed "+ Added" contrast: Changed from `bg-white/10 text-white/50` to `bg-white/20 text-white/70` (darker, more legible)
  - ✅ Prism persona icons: Already restored and showing with hover tooltips
  - ✅ Match score display: Schema imported, ready for display on card back
- **Result:** Consistent tier taxonomy, improved legibility

### In Progress / Next Phase

#### 4. ⚠️ Brief Wizard Refactor Needed
**Current issue:** `/dev/booking-preview` has components, but main `/discover` still uses old modal
**Required changes:**
- Replace modal popup with embedded scroll-in panel
- Match exact 420x285px frame dimensions
- Horizontal pane transitions (translateX only)
- Update copy: "Key messaging or Primary objective" (not "Key message (short)")
- Multi-select for markets (checkbox behavior)
- Larger pill hit areas

#### 5. ⚠️ Review & Send Modal → OS Sheet
**Required changes:**
- Convert from modal to right-side OS-style sheet
- Remove duplicate brief questions
- Only ask: companyName (required) + email (required)
- Optional: phone + note
- Remove trade license completely from initial flow

#### 6. ⚠️ Route Integration
**Required changes:**
- Update `/discover` to use embedded brief wizard (scroll into view)
- Remove old `BookingModal` component entirely
- Ensure `/dev/booking-preview` uses same components (no style drift)

### File Manifest

#### New Files Created:
1. `src/lib/schemas/booking.ts` (327 lines) - **Canonical schemas**
2. `src/lib/matching/match-score.ts` (154 lines) - **Match score computation**
3. `CTO_BOOKING_FLOW_IMPLEMENTATION.md` (this file) - **Implementation tracking**

#### Modified Files:
1. `src/components/marketing/LandingTalentCard.tsx` - **Tier tags, contrast fixes**

#### Files to Update (Next Phase):
1. `src/components/booking/BriefLiteWizard.tsx` - Update copy, multi-select markets, larger pills
2. `src/components/booking/SendRequestModal.tsx` - Convert to sheet, remove duplicates
3. `src/app/page.tsx` - Integrate embedded wizard (scroll behavior, no modal)
4. `src/app/dev/booking-preview/page.tsx` - Verify consistency with `/discover`

### Schema Alignment Summary

#### ✅ Canonical Enums Defined:
- PricingTier: `HIVE_SELECT` | `HIVE_SIGNATURE`
- Timeline: `ASAP` | `THIS_MONTH` | `NEXT_MONTH` | `FLEXIBLE`
- Objective: `AWARENESS` | `GROWTH` | `CONVERSIONS` | `LAUNCH`
- RequestStatus: 13-state flow (DRAFT_BRIEF → CLOSED)

#### ✅ Single Source of Truth:
- All schemas in `src/lib/schemas/booking.ts`
- Match score in `src/lib/matching/match-score.ts`
- No duplicate field definitions
- Display labels centralized

### Copy Updates Applied:
- ✅ "Pro" → "Hive Select"
- ✅ "Signature" → "Hive Signature"
- ✅ Tier tooltips added with descriptions
- ⚠️ "Key message (short)" → "Key messaging or Primary objective" (pending in wizard)

### UI Acceptance Criteria Status:

| Criterion | Status | Notes |
|-----------|--------|-------|
| A1. Fixed 420x285px frame system | ⚠️ Partial | Cards fixed, wizard needs update |
| A2. No popup wizard (scroll behavior) | ❌ Pending | Still modal, needs refactor |
| A3. Copy updates (Hive Select/Signature) | ✅ Done | Applied to talent cards |
| A4. Larger pills, multi-select markets | ❌ Pending | Wizard needs update |
| A5. Talent card tier tags | ✅ Done | Implemented with tooltips |
| A6. Match score (scientific) | ✅ Done | Algorithm implemented |
| A7. Review & Send as OS sheet | ❌ Pending | Still modal |
| A8. /dev/booking-preview consistency | ⚠️ Partial | Components exist, need verification |
| A9. Mock profile images (deep purple) | ❌ Pending | Need placeholder avatars |

### Next Steps (Priority Order):

1. **Refactor BriefLiteWizard:**
   - Update copy ("Key messaging or Primary objective")
   - Multi-select markets (checkboxes)
   - Larger pill hit areas (min-h-[36px], px-4)
   - Ensure 420x285px frame

2. **Convert SendRequestModal to Sheet:**
   - Right-side slide-in panel
   - Remove duplicate brief fields
   - Only: companyName + email (required), phone + note (optional)

3. **Update /discover Integration:**
   - Replace modal with embedded panel
   - Smooth scroll behavior (no blur overlay)
   - Remove old `BookingModal` component

4. **Consistency Check:**
   - Verify `/dev/booking-preview` uses production components
   - Ensure no CSS/token drift

5. **Mock Avatars:**
   - Add deep purple placeholder avatars for talent without images

### Database Migration Required:

```prisma
// Add to schema.prisma

enum PricingTier {
  HIVE_SELECT
  HIVE_SIGNATURE
}

enum Timeline {
  ASAP
  THIS_MONTH
  NEXT_MONTH
  FLEXIBLE
}

enum Objective {
  AWARENESS
  GROWTH
  CONVERSIONS
  LAUNCH
}

enum RequestStatus {
  DRAFT_BRIEF
  MATCHING
  POD_SELECTED
  REQUEST_SUBMITTED
  IN_REVIEW
  SCOPE_CONFIRMED
  CONTRACT_PENDING
  ACTIVE
  DELIVERED
  APPROVED
  PAID
  CLOSED
  CANCELLED
}

model BookingRequest {
  id            String        @id @default(cuid())
  briefSnapshot Json          // Snapshot of BriefLite
  talentIds     String[]
  companyName   String
  email         String
  phone         String?
  note          String?
  status        RequestStatus @default(REQUEST_SUBMITTED)
  userId        String?
  user          User?         @relation(fields: [userId], references: [id])
  matchScores   MatchScore[]
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
}

model MatchScore {
  id              String         @id @default(cuid())
  requestId       String
  request         BookingRequest @relation(fields: [requestId], references: [id], onDelete: Cascade)
  talentId        String
  score           Int            // 0-10
  rationale       String         // <=60 chars
  computedAt      DateTime       @default(now())

  @@unique([requestId, talentId])
}
```

### Testing URLs:

- **Preview:** http://localhost:3000/dev/booking-preview ✅
- **Discover:** http://localhost:3000 ⚠️ (needs refactor)

### Server Status:
- Running on: http://localhost:3000
- Clean cache restart: ✅ Done
- New components compiled: ✅ Yes

---

**Implementation Phase:** 1 of 3 complete
**Est. Completion:** Phase 2 (60%), Phase 3 (40%) remaining
**Blocking:** None
**Ready for:** Wizard refactor + sheet conversion
