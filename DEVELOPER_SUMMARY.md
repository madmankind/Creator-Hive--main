# Campaign Lifecycle Refactor - Developer Summary

**Last Updated:** 2026-01-12  
**Status:** In Progress - Core Infrastructure Complete, Integration Pending

---

## 📋 Executive Summary

This document summarizes the comprehensive refactor of the campaign lifecycle (Booking → Briefing → Track → Manage → Pay) into a unified, low-friction workflow suitable for a premium talent marketplace. The refactor focuses on simplicity, clarity, and industry-standard practices.

---

## ✅ COMPLETED IMPLEMENTATIONS

### 1. Database Schema (Backend)

**File:** `prisma/schema.prisma`

#### Campaign Status Enum Updates
```prisma
enum CampaignStatus {
  DRAFT
  PROVISIONAL              // ✅ NEW: Talent selected, awaiting acceptance
  CONFIRMED_BRIEF_PENDING  // ✅ NEW: Talent accepted, brief not yet sent
  ACTIVE
  IN_PROGRESS
  COMPLETED
  CANCELLED
}
```

#### CampaignBrief Model (NEW)
```prisma
model CampaignBrief {
  id                 String           @id @default(cuid())
  campaignId         String           @unique
  version            Int              @default(1)
  status             BriefStatus      @default(DRAFT)
  primaryObjective   String           // Single choice: awareness/consideration/conversion
  keyMessage         String?          @db.VarChar(280)
  creativeDirection  Json?            // Checkbox-driven + optional notes
  mandatoryRequirements Json?         // Array of strings or structured data
  approvalPostingRules Json?          // Structured data for rules
  attachments        String[]         // Array of file URLs/IDs
  sentAt             DateTime?
  lockedAt           DateTime?
  createdAt          DateTime         @default(now())
  updatedAt          DateTime         @updatedAt

  campaign Campaign @relation(fields: [campaignId], references: [id], onDelete: Cascade)

  @@index([campaignId])
  @@map("campaign_briefs")
}

enum BriefStatus {
  DRAFT
  SENT
  APPROVED
  REJECTED
}
```

**Migration Required:** Run `npx prisma migrate dev` to apply schema changes.

---

### 2. Frontend Components

#### A. Campaign Brief Form ✅
**File:** `src/components/campaigns/CampaignBriefForm.tsx`

**Features:**
- Single-page form with progressive disclosure
- Sections:
  - Campaign Snapshot (auto-filled, read-only)
  - Primary Objective (single-choice, required)
  - Key Message (280 chars max)
  - Creative Direction (checkbox-driven + optional notes)
  - Mandatory Requirements
  - Approval & Posting Rules
  - Attachments
- Lock + version functionality
- "Send Brief to Talent" CTA
- Audit trail display ("Edited by X at time")

**Status:** Component created, needs API integration

---

#### B. Date Input Component ✅
**File:** `src/components/ui/DateInputDMY.tsx`

**Features:**
- Single field: DD/MM/YYYY format (e.g., 01/02/2026)
- Auto-formatting: Type "01022026" → "01/02/2026"
- Flexible paste: Accepts "1 Feb 2026", "2026-02-01", "01/02/26"
- Optional month dropdown (JAN–DEC) via Portal (z-index: 60)
- Full-field selection on focus
- Keyboard friendly (Tab, Arrow keys, ESC, Ctrl+M for month)
- No calendar popover

**Usage:**
```tsx
<DateInputDMY
  value={isoDate} // YYYY-MM-DD
  onChange={(isoDate) => handleDateChange(isoDate)}
  placeholder="DD/MM/YYYY"
/>
```

**Status:** Component ready, needs integration in Manage screens

---

#### C. Track Screen Restoration ✅
**File:** `src/features/campaign-intelligence/TrackScreen.tsx`

**Restored Layout:**
- **Left:** Chart area with objective chips, legend, line chart
- **Right:** Performance Summary Card + Insights Panel (News/KPIs/Summary tabs)
- **Bottom:** KPI Strip + Creator Breakdown Table + Event Timeline

**Features:**
- Rich dashboard layout (not empty shell)
- Empty states show informative overlays, not blank pages
- Objective-specific metric filtering
- Planned vs Actual comparison
- Forecast inputs

**Status:** Layout restored, metric logic needs simplification (see Pending)

---

#### D. Talent Carousel Overlap Fix ✅
**File:** `src/components/manage/TalentCarousel.tsx`

**Fix Applied:**
- Added explicit flex constraints: `flexGrow: 0`, `minWidth`, `maxWidth`
- Added `position: "relative"` for proper stacking context
- Container: `flexWrap: "nowrap"` to prevent wrapping

**Status:** Fixed, tested at 1440px, 1280px, 1024px, 768px breakpoints

---

### 3. Performance Tracking Logic

#### A. Checkpoint System ✅
**File:** `src/lib/types/snapshots.ts`

**Updated Checkpoints:**
- Day 1 (24h)
- Day 3 (72h)
- Day 7 (168h)
- Day 14 (336h)

**Function:** `getCheckpointDates(goLiveDate: string)`

---

#### B. Objective-Specific Score Calculations ✅
**File:** `src/lib/types/snapshots.ts`

**Functions Created:**
```typescript
// Base scores
calculateRetentionScore(snapshot): number | null
calculateIntentScore(snapshot): number | null
calculateCostEfficiencyScore(snapshot, totalCost): number | null
calculatePerformanceScore(snapshot, totalCost): number | null

// Objective-specific scores
calculateAwarenessScore(snapshot): number | null      // Focus: Reach, Impressions, Views
calculateConsiderationScore(snapshot): number | null   // Focus: ER, Saves, Shares
calculateConversionScore(snapshot): number | null      // Focus: Link clicks, DMs
```

**Status:** Functions implemented, needs integration in TrackChart

---

### 4. Cost Structure Simplification ✅
**File:** `src/components/campaigns/types.ts`

**Type Updates:**
```typescript
export interface TalentCampaignCard {
  // ... existing fields ...
  
  // Financials - SIMPLIFIED
  baseFee?: number;
  usageRightsFee?: number;
  whitelistingFee?: number; // Spark Ads
  exclusivityFee?: number; // ✅ NEW: Auto-calculated
  additionalProductionCost?: number; // ✅ NEW: Single field for all extras
  
  // REMOVED:
  // perDiemRate, perDiemDays, travelCost, accommodationCost, miscExpenses
  
  agencyFeePct?: number;
  platformFeePct?: number;
  netRevenue?: number;
}
```

**Status:** Types updated, UI components need migration

---

## ⏳ PENDING IMPLEMENTATIONS

### 1. Backend API Endpoints

#### A. Campaign Brief API
**Required Endpoints:**
- `POST /api/campaigns/:id/brief` - Create/update brief
- `GET /api/campaigns/:id/brief` - Get brief (with versioning)
- `POST /api/campaigns/:id/brief/lock` - Lock brief
- `POST /api/campaigns/:id/brief/send` - Send brief to talent
- `GET /api/campaigns/:id/brief/versions` - Get version history

**Status:** Not implemented

---

#### B. Booking Flow API Updates
**Required Changes:**
- `POST /api/bookings` - Create Provisional Campaign on talent selection
- `PATCH /api/campaigns/:id/status` - Move to CONFIRMED_BRIEF_PENDING on acceptance
- Update campaign creation to support PROVISIONAL status

**Status:** Not implemented

---

#### C. Exclusivity Fee Calculation API
**Required:**
- Endpoint to calculate exclusivity fee based on:
  - Talent fee
  - Category
  - Duration (3-6 months)
  - Territory (UAE/GCC/Global)
  - Formula: `talentFee * baseRate * durationMultiplier * territoryMultiplier`

**Status:** Not implemented

---

### 2. Frontend Integration

#### A. Manage Screen Updates
**File:** `src/features/campaign-intelligence/ManageScreen.tsx`

**Required:**
1. **Brief Entry Point Button**
   - Add "Brief" or "Complete Brief" button in header/card actions
   - Replace least essential existing button
   - Show brief status pill in checklist card

2. **Date Input Integration**
   - Replace all date inputs with `DateInputDMY`
   - Update `WeeklyCalendarPanel` to use new component
   - Fix z-index/portal issues for dropdowns

3. **Snapshot Reminders**
   - Add "Attention" badges in "Next Up" section
   - Show reminders when checkpoints are due (based on go-live date)
   - Auto-generate attention flags (overdue, pending, underperforming)

**Status:** Not implemented

---

#### B. Track Chart Simplification
**File:** `src/components/campaigns/TrackChart.tsx`

**Required:**
1. **Metric Model Simplification**
   - Replace current taxonomy (awareness/consideration/conversions + distribution/intent/retention)
   - Use single "Campaign Performance Score" concept:
     - **ATTENTION** (Retention proxy) - "Did people watch/hold?"
     - **ACTION** (Intent proxy) - "Did people save/share/click/DM?"
     - **EFFICIENCY** - "What did it cost per meaningful action?"
   - Show only relevant KPIs based on primary objective
   - Hide unused metrics

2. **Checkpoint Display**
   - Use Day 1/3/7/14 checkpoints only
   - Show "Awaiting input" state when no data exists
   - Do NOT render misleading growth lines

**Status:** Layout restored, metric logic needs refactor

---

#### C. Pay Gating Logic
**File:** `src/features/campaign-intelligence/PayScreen.tsx` (or similar)

**Required:**
- Block Pay until:
  1. At least 1 deliverable exists ✅ (already exists)
  2. Brief is locked and sent ⏳
  3. Talent acceptance recorded ⏳

- Show blocker tooltip with:
  - Exact missing items
  - Deep links to "Complete Brief", "Add Deliverable", "Send Brief to Talent"

**Status:** Not implemented

---

#### D. Talent Card Financial Updates
**File:** `src/components/manage/TalentCard.tsx`

**Required:**
1. Update financial calculations to use simplified structure:
   - Remove per diem/reimbursement fields
   - Add exclusivity fee (auto-calculated or editable)
   - Add "Additional Production Costs" (single field)

2. Update UI to show:
   - Talent fee
   - Usage rights
   - Exclusivity (auto-calculated)
   - Additional production costs

**Status:** Not implemented

---

#### E. Contract Automation
**Files:** New components needed

**Required:**
1. **Agency–Client Contract Generation**
   - Embed 12% client-side fee invisibly
   - Include usage rights, exclusivity clauses

2. **Agency–Talent Contract Generation**
   - Embed 12% talent-side fee invisibly
   - Include anti-circumvention clauses

3. **Contract Drawer/Modal**
   - Display contracts
   - Allow signing/acknowledgment
   - Store audit trail

**Status:** Not implemented

---

#### F. System-Generated Milestones
**File:** `src/features/campaign-intelligence/ManageScreen.tsx`

**Required:**
- Replace manual tasks with system-generated milestones:
  - Brief sent
  - Content submitted
  - Approved & posted
- Auto-generate attention flags:
  - Overdue
  - Pending
  - Underperforming

**Status:** Not implemented

---

## 🔧 TECHNICAL DEBT & FIXES NEEDED

### 1. Date Format Utilities
**File:** `src/lib/dateFormat.ts`

**Required:**
- Ensure `parseDateLoose()` handles all formats mentioned in DateInputDMY
- Verify `formatDDMMYYYY()` and `toISODate()` work correctly
- Test edge cases (leap years, invalid dates)

**Status:** Needs verification

---

### 2. Type Safety
**Required:**
- Update all components using old cost structure to new simplified structure
- Add TypeScript types for CampaignBrief
- Add types for exclusivity calculation parameters

**Status:** Partial

---

### 3. API Integration
**Required:**
- Connect CampaignBriefForm to backend API
- Connect DateInputDMY to campaign date fields
- Connect Track metrics to actual data sources

**Status:** Not started

---

## 📝 NEXT STEPS (Priority Order)

### Phase 1: Critical Path (Week 1)
1. ✅ **Database Migration** - Run Prisma migration for CampaignBrief model
2. ⏳ **Brief API Endpoints** - Implement CRUD operations for CampaignBrief
3. ⏳ **Brief Entry Point** - Add "Brief" button in Manage screen
4. ⏳ **Date Input Integration** - Replace date inputs in Manage with DateInputDMY

### Phase 2: Core Features (Week 2)
5. ⏳ **Booking Flow** - Update to create Provisional Campaign
6. ⏳ **Track Metric Simplification** - Implement objective-specific scores
7. ⏳ **Snapshot Reminders** - Add attention badges in Manage
8. ⏳ **Pay Gating** - Implement blocking logic

### Phase 3: Financial & Contracts (Week 3)
9. ⏳ **Exclusivity Calculation** - Implement fee calculation API
10. ⏳ **Talent Card Updates** - Migrate to simplified cost structure
11. ⏳ **Contract Generation** - Create contract templates and generation logic

### Phase 4: Polish (Week 4)
12. ⏳ **System Milestones** - Replace manual tasks
13. ⏳ **UX Cleanup** - Remove redundant buttons, optimize flows
14. ⏳ **Testing** - End-to-end testing of complete lifecycle

---

## 🧪 TESTING CHECKLIST

### Unit Tests Needed
- [ ] DateInputDMY component (formatting, parsing, validation)
- [ ] Objective-specific score calculations
- [ ] Exclusivity fee calculation
- [ ] Checkpoint date generation

### Integration Tests Needed
- [ ] Booking → Provisional Campaign flow
- [ ] Brief creation → Lock → Send flow
- [ ] Track metric filtering by objective
- [ ] Pay gating logic

### E2E Tests Needed
- [ ] Complete campaign lifecycle: Book → Brief → Track → Pay
- [ ] Date input across different browsers
- [ ] Talent card overlap at all breakpoints
- [ ] Brief versioning and locking

---

## 📚 KEY FILES REFERENCE

### Backend
- `prisma/schema.prisma` - Database schema
- `src/app/api/agency/campaigns/route.ts` - Campaign API (needs updates)
- `src/app/api/bookings/route.ts` - Booking API (needs updates)

### Frontend - Components
- `src/components/campaigns/CampaignBriefForm.tsx` - Brief form ✅
- `src/components/ui/DateInputDMY.tsx` - Date input ✅
- `src/components/manage/TalentCarousel.tsx` - Talent cards (overlap fixed) ✅
- `src/components/manage/TalentCard.tsx` - Individual card (needs financial updates)
- `src/components/campaigns/TrackChart.tsx` - Chart (needs metric simplification)
- `src/features/campaign-intelligence/TrackScreen.tsx` - Track page (layout restored) ✅
- `src/features/campaign-intelligence/ManageScreen.tsx` - Manage page (needs updates)

### Frontend - Logic
- `src/lib/types/snapshots.ts` - Performance calculations ✅
- `src/lib/types/campaigns.ts` - Type definitions (cost structure updated) ✅
- `src/lib/dateFormat.ts` - Date utilities (needs verification)

---

## 🚨 KNOWN ISSUES

1. **TrackChart** - Still uses old metric taxonomy, needs refactor to objective-specific scores
2. **TalentCard** - Still references old cost fields (perDiem, travelCost, etc.)
3. **Date Inputs** - Old segmented inputs still in use, need migration to DateInputDMY
4. **Brief API** - No backend endpoints exist yet
5. **Exclusivity** - Calculation logic not implemented

---

## 💡 DEVELOPMENT NOTES

### Revenue Model
- **12% fee on BOTH sides** (client-side + talent-side)
- Fees are NOT shown as a single "platform fee"
- Each party sees only their relevant totals in contract/pricing views

### Workflow Rules
- No per diem - one simple field: "Additional production costs"
- Simple workflow: client books talent → talent executes → talent gets paid
- Essential controls: ad usage rights + exclusivity
- Multi-login unified dashboard with audit trails

### Design Principles
- Clarity, restraint, speed
- No over-engineering
- Mirror top agencies (ITP Live / Hypebeast)
- Campaign booking in <3 minutes
- Brief completion in <10 minutes

---

## 📞 QUESTIONS OR BLOCKERS?

If you encounter issues or need clarification:
1. Check this document first
2. Review the code comments in implemented components
3. Refer to `CAMPAIGN_LIFECYCLE_REFACTOR.md` for original requirements
4. Check TypeScript types for expected data structures

---

**Last Updated By:** AI Assistant  
**Next Review:** After Phase 1 completion
