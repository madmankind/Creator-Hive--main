# Quick Start Guide - Campaign Lifecycle Refactor

## 🚀 Immediate Next Steps (Today)

### 1. Database Migration (5 minutes)
```bash
# Apply schema changes
npx prisma migrate dev --name add_campaign_brief

# Generate Prisma client
npx prisma generate
```

**What this does:**
- Adds `PROVISIONAL` and `CONFIRMED_BRIEF_PENDING` to CampaignStatus enum
- Creates `CampaignBrief` table with versioning and locking
- Adds `campaignBrief` relation to Campaign model

---

### 2. Test DateInputDMY Component (10 minutes)

**File:** `src/components/ui/DateInputDMY.tsx`

**Quick Test:**
```tsx
import { DateInputDMY } from "@/components/ui/DateInputDMY";

function TestDateInput() {
  const [date, setDate] = useState<string>("");
  
  return (
    <DateInputDMY
      value={date}
      onChange={(isoDate) => setDate(isoDate)}
      placeholder="DD/MM/YYYY"
    />
  );
}
```

**Test Cases:**
- Type "01022026" → Should format to "01/02/2026"
- Paste "1 Feb 2026" → Should normalize
- Press Ctrl+M → Should open month dropdown
- Click month segment → Should open dropdown
- Invalid date → Should revert to last valid

---

### 3. Integrate DateInputDMY in Manage (30 minutes)

**Files to Update:**
- `src/components/manage/WeeklyCalendarPanel.tsx`
- Any other date inputs in Manage screen

**Find and Replace:**
```tsx
// OLD
<SegmentedDateInput ... />

// NEW
<DateInputDMY
  value={isoDate}
  onChange={(iso) => handleDateChange(iso)}
/>
```

---

### 4. Add Brief Button in Manage (20 minutes)

**File:** `src/features/campaign-intelligence/ManageScreen.tsx`

**Add to header or card actions:**
```tsx
<button
  onClick={() => setShowBriefModal(true)}
  className="..."
>
  {campaignBrief ? "View Brief" : "Complete Brief"}
</button>
```

**Add Brief Status Pill:**
```tsx
{campaignBrief && (
  <div className="brief-status-pill">
    {campaignBrief.status === "SENT" ? "✓ Sent" : "Draft"}
  </div>
)}
```

---

## 📋 This Week's Goals

### Day 1-2: Backend Foundation
- [ ] Database migration
- [ ] CampaignBrief API endpoints (CRUD)
- [ ] Brief lock/send endpoints

### Day 3-4: Frontend Integration
- [ ] DateInputDMY integration
- [ ] Brief entry point in Manage
- [ ] Brief modal/drawer

### Day 5: Testing & Polish
- [ ] Test date input across browsers
- [ ] Test brief creation flow
- [ ] Fix any z-index/portal issues

---

## 🔍 Quick Reference

### New Components
- `DateInputDMY` - Single DD/MM/YYYY input with month dropdown
- `CampaignBriefForm` - Unified brief form (needs API connection)

### New Types
- `CampaignBrief` - Prisma model
- `BriefStatus` - DRAFT | SENT | APPROVED | REJECTED
- Updated `CampaignStatus` - Added PROVISIONAL, CONFIRMED_BRIEF_PENDING

### Key Functions
- `getCheckpointDates()` - Day 1/3/7/14 checkpoints
- `calculateAwarenessScore()` - Objective-specific scoring
- `calculateConsiderationScore()` - Objective-specific scoring
- `calculateConversionScore()` - Objective-specific scoring

---

## ⚠️ Common Issues

### DateInputDMY dropdown behind cards
**Fix:** Ensure z-index is 60+ and uses Portal (already implemented)

### Talent cards overlapping
**Fix:** Already fixed in TalentCarousel.tsx (flexGrow: 0, minWidth, maxWidth)

### Track page empty
**Fix:** Layout restored, but needs data connection

---

## 📞 Need Help?

1. Check `DEVELOPER_SUMMARY.md` for detailed info
2. Review component code comments
3. Check TypeScript types for expected structures
