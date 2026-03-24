# Campaign Lifecycle Refactor - Implementation Summary

## Status: In Progress

### Completed

1. **Schema Updates**
   - ✅ Added `PROVISIONAL` and `CONFIRMED_BRIEF_PENDING` to `CampaignStatus` enum
   - ✅ Created `CampaignBrief` model with versioning and locking
   - ✅ Updated checkpoint system to Day 1/3/7/14

2. **Campaign Brief Form**
   - ✅ Created `CampaignBriefForm` component with all required sections:
     - Campaign Snapshot (read-only)
     - Primary Objective (awareness/consideration/conversion)
     - Key Message (280 chars)
     - Creative Direction (checkbox-driven + notes)
     - Mandatory Requirements
     - Approval & Posting Rules
     - Attachments
   - ✅ Lock and version functionality
   - ✅ "Send Brief to Talent" CTA

3. **Track Refactor**
   - ✅ Updated checkpoints to Day 1/3/7/14
   - ✅ Added objective-specific score calculations:
     - `calculateAwarenessScore()` - Focus: Reach, Impressions, Views
     - `calculateConsiderationScore()` - Focus: Engagement rate, Saves, Shares
     - `calculateConversionScore()` - Focus: Link clicks, DMs
   - ✅ Updated `TrackChartSimplified` to use objective-specific scores
   - ✅ Hide unused metrics (only show relevant to objective)

4. **Cost Structure Simplification**
   - ✅ Updated `TalentCampaignCard` type:
     - Removed: `perDiemRate`, `perDiemDays`, `travelCost`, `accommodationCost`, `miscExpenses` (separate)
     - Added: `talentFee`, `exclusivityFee` (auto-calculated), `additionalProductionCost` (single field)
   - ⚠️ Need to update `TalentCard` component to use new structure

### In Progress / TODO

1. **Booking Flow**
   - ⏳ Refactor to create Provisional Campaign on talent selection
   - ⏳ Move to CONFIRMED_BRIEF_PENDING on talent acceptance
   - ⏳ Update booking API/UI

2. **Manage Task Logic**
   - ⏳ Replace manual tasks with system-generated milestones:
     - Brief sent
     - Content submitted
     - Approved & posted
   - ⏳ Auto-generate attention flags

3. **Contract Automation**
   - ⏳ Generate Agency–Client contract
   - ⏳ Generate Agency–Talent contract
   - ⏳ Embed 12% fee invisibly
   - ⏳ Include usage, exclusivity, anti-circumvention clauses

4. **UX Cleanup**
   - ⏳ Remove redundant buttons and metric toggles
   - ⏳ Replace unused action with "View / Complete Brief"
   - ⏳ Ensure Track → Manage → Pay flows without dead ends

5. **TalentCard Financial Updates**
   - ⏳ Update financial calculations to use simplified structure
   - ⏳ Add exclusivity auto-calculation
   - ⏳ Update UI to show new cost breakdown

### Files Modified

- `prisma/schema.prisma` - Campaign status enum, CampaignBrief model
- `src/lib/types/snapshots.ts` - Checkpoint updates, objective-specific scores
- `src/components/campaigns/TrackChartSimplified.tsx` - Objective-specific scoring
- `src/components/campaigns/CampaignBriefForm.tsx` - New brief form component
- `src/components/campaigns/types.ts` - Simplified cost structure

### Next Steps

1. Update booking flow to create Provisional Campaign
2. Implement system-generated milestones in Manage
3. Update TalentCard to use simplified cost structure
4. Add contract generation
5. UX cleanup and flow optimization
