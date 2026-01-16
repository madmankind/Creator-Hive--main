# Changelog - Track + Manage Stabilization

## F) TRACK — Simplified Performance Tracking Model (2026-01-12)

### Overview
Complete refactor of Track page to implement a simplified, industry-accurate performance tracking model suitable for a premium, curated marketplace. Eliminated metric overload and confusing funnel stages in favor of a single, clear Performance Score.

### Files Changed:
- `src/lib/types/snapshots.ts` (updated)
- `src/components/ui/CompactDateInput.tsx` (new)
- `src/components/campaigns/TrackChartSimplified.tsx` (new)
- `src/components/campaigns/CampaignPerformanceSummarySimplified.tsx` (new)
- `src/components/campaigns/DeliverablePerformanceList.tsx` (new)
- `src/features/campaign-intelligence/TrackScreen.tsx` (major refactor)
- `src/components/campaigns/SnapshotCapture.tsx` (updated)

### Changes:

1. **Performance Score Model (0-100)**
   - Single Deliverable Performance Score per deliverable
   - Score composition:
     - Retention Score (40%): 3s hold rate, avg watch time %, completion rate %
     - Intent Score (40%): Saves, Shares, Profile visits, Link clicks/DMs
     - Cost Efficiency (20%): Derived from Manage costs vs benchmark outcomes
   - Functions: `calculateRetentionScore()`, `calculateIntentScore()`, `calculateCostEfficiencyScore()`, `calculatePerformanceScore()`

2. **Checkpoint System**
   - Replaced arbitrary time series with fixed checkpoints: Day 1, Day 3, Day 7
   - Updated `getCheckpointDates()` to return Day 1/3/7 instead of T+0h/24h/72h/7d/14d
   - "Awaiting input" state for missing checkpoints (no misleading growth lines)

3. **TrackChartSimplified Component**
   - X-axis: Checkpoints (Day 1, Day 3, Day 7)
   - Y-axis: Performance Score (0-100) or Retention/Intent scores
   - Toggle: Score / Retention / Intent
   - Only shows data for checkpoints that exist
   - No fabricated time-series data

4. **Campaign Performance Summary**
   - Overall Performance Score (average of all deliverables)
   - Benchmark label (Above/At/Below Benchmark, Needs Attention)
   - Clean, readable format

5. **Deliverable Performance List**
   - Performance Score badge (0-100) per deliverable
   - Trend indicator (up/down/stable)
   - "Needs Attention" flag if below benchmark
   - Compact, readable format

6. **CompactDateInput Component**
   - Inline format: [ DD ] [ MON ] [ YYYY ]
   - Day + Year freeform input
   - Month via small dropdown rendered in portal (flips upward if near bottom)
   - Full-field selection on focus
   - No scrolling or hidden popups
   - Keyboard friendly (Tab, Arrow keys, ESC)

7. **TrackScreen Refactor**
   - Removed metric overload (Awareness/Consideration/Distribution views)
   - Default view shows:
     - Campaign Performance Summary (Score + Benchmark label)
     - Chart (Checkpoints vs Performance Score)
     - Deliverable list with Performance Score badges
   - Pulls costs from Manage (talent + additional production costs)
   - All extras treated as "Additional Production Costs"

8. **Data Flow**
   - Cost efficiency calculation pulls from Manage talent costs
   - No per diem or receipts introduced
   - Total cost = sum of all talent costs + additional production costs

### Acceptance Criteria Met:
- ✅ Track is readable in <5 seconds
- ✅ One primary score per deliverable
- ✅ No redundant metrics
- ✅ All states (awaiting / live / underperforming / complete) are obvious
- ✅ Visual style matches current Track glass aesthetic

## A) MANAGE — Frictionless Date Entry (SmartDateInput)

### Files Changed:
- `src/components/ui/SmartDateInput.tsx` (new)
- `src/lib/dateFormat.ts` (new)
- `src/components/manage/WeeklyCalendarPanel.tsx` (updated)
- `src/components/campaigns/SnapshotCapture.tsx` (updated)

### Changes:
1. **SmartDateInput Component** (replaces SegmentedDateInput)
   - Single input field: DD/MM/YYYY format (e.g., 11/01/2026)
   - Normal text behavior: click, drag select, Cmd/Ctrl+A select-all, overwrite entire value
   - Flexible paste normalization:
     - Accepts: "12 jan 26", "12 JAN 2026", "12/01/26", "12/01/2026", "2026-01-12"
     - Normalizes to DD/MM/YYYY display, stores as ISO (YYYY-MM-DD)
   - Month entry frictionless:
     - Users can type "01" or "jan"
     - Optional month dropdown (JAN–DEC) via Portal (high z-index, flips upward)
     - Dropdown max-height ~220px, overflow-auto, never pushes layout
   - Zero placeholder overlap: standard input placeholder "DD/MM/YYYY"
   - Accessibility: Tab navigation, Arrow keys, ESC closes dropdown
   - Visible focus ring (purple glow) for active state

2. **dateFormat Helpers** (`src/lib/dateFormat.ts`)
   - `parseDateLoose()`: Flexible date parsing from various formats
   - `formatDDMMYYYY()`: Format date as DD/MM/YYYY
   - `toISODate()`: Convert DD/MM/YYYY to ISO (YYYY-MM-DD)
   - `fromISODate()`: Convert ISO to DD/MM/YYYY
   - `clampDate()`: Ensure valid date (handles month day limits)
   - `getMonthName()` / `getMonthNumber()`: Month name utilities

3. **WeeklyCalendarPanel Updates**
   - Replaced SegmentedDateInput with SmartDateInput
   - No calendar popover/modal - all date entry is inline
   - Date input never opens mini-calendar, no hidden popups

## B) MANAGE — Campaign Execution Logic + Accountability

### Files Changed:
- `src/lib/types/activity.ts` (new)
- `src/lib/payReadiness.ts` (enhanced)

### Changes:
1. **Activity Model** (`src/lib/types/activity.ts`)
   - Activity entries for all Manage mutations:
     - `createActivity()`: Creates activity entry with actor, action, entity info
     - Fields: id, campaignId, actorUserId, actorName, actionType, entityType, entityId, summary, createdAt
   - Task model for attention/accountability:
     - Fields: id, campaignId, title, relatedEntityType, relatedEntityId, assigneeUserId, status, priority, dueAt
     - `needsAttention()`: Simple rules for attention triggers (missing fields, due dates, urgent priority)

2. **Campaign Readiness Model** (enhanced `src/lib/payReadiness.ts`)
   - `computeCampaignReadiness()`: Returns actionable blockers with deep-links
   - Output: `{ canGoToPay: boolean, blockers: Array<{code, message, ctaLabel, deepLink}> }`
   - Blockers checked:
     - No deliverables defined
     - Missing go-live/delivery dates
     - Contract status not confirmed
     - Deposit/payment terms not set
   - Each blocker has "Fix" button that navigates to relevant UI section

3. **BottomDock Pay Gating** (updated)
   - Shows "Pay (blocked)" with warning icon when not ready
   - Tooltip shows "What's missing" list with actionable "Fix" buttons
   - Deep-links navigate to Manage with focus on relevant section

## C) TALENT CARDS — Financials with Expand Pattern

### Files Changed:
- `src/components/campaigns/types.ts` (enhanced)
- `src/components/manage/TalentCard.tsx` (updated)

### Changes:
1. **TalentCampaignCard Financial Fields**
   - Added: baseFee, usageRightsFee, whitelistingFee, travelCost, accommodationCost, perDiemRate, perDiemDays, miscExpenses
   - Added: agencyFeePct, platformFeePct, netRevenue, currency (default AED)
   - Computed: grossCost, fees, grossProfit, marginPct

2. **TalentCard UI**
   - Collapsed state: Shows Name, role, status, next date, and single "Cost" number (gross cost)
   - Expand/Details action: "View details" button with chevron
   - Expanded state: Full cost breakdown + computed margin
   - Glass styling maintained (subtle dividers, no harsh borders)

## D) TRACK — Snapshot-Based Chart Semantics

### Files Changed:
- `src/components/campaigns/TrackChart.tsx` (major update)
- `src/types/campaign.ts` (enhanced)

### Changes:
1. **Chart Data Generation**
   - `generateDataFromSnapshots()`: Uses actual snapshot data from deliverables
   - Removed mock data paths when deliverables exist
   - Cumulative aggregation across deliverables
   - Metric mode switching: Distribution / Retention / Intent / Conversions
   - `getSnapshotValue()`: Extracts metric based on selected mode

2. **Empty States**
   - 0 snapshots: "Add first snapshot to start tracking trend" with checkpoint info
   - 1 snapshot: "Awaiting next checkpoint" (not a fake line)
   - Deliverables view: Placeholder for bar chart (to be implemented)

3. **Forecast Bands**
   - `generateForecastBand()`: Creates min/max/expected based on planned metrics + benchmark profile
   - Forecast rendered as:
     - Min/Max lines (subtle dashed)
     - Expected line (main dashed, labeled "Forecast")
   - Only shown when planned data exists and no snapshots yet
   - Benchmark profiles: Conservative / Typical / Aggressive per platform

4. **Chart Rendering Logic**
   - Line chart only when >= 2 snapshots exist (truthful time-series)
   - Single snapshot shows empty state, not fabricated line
   - Y-axis label matches selected metric mode (not generic "Reach")
   - Deliverable lines from actual snapshots (replaces mock assets)

5. **TrackInsightsPanel**
   - "Forecast inputs" label (replaces "Planned vs Actual")
   - Helper text: "Forecast uses benchmarks until real snapshots are added."

## E) TRACK — Bug Fixes & Stability Improvements

### Files Changed:
- `src/components/campaigns/TrackChart.tsx` (bug fixes)

### Changes:
1. **Syntax Error Fixes**
   - Fixed duplicate `points.push(point)` statement in `generateDataFromSnapshots()`
   - Removed orphaned closing brace that caused compilation error
   - Fixed scope issue with `totalSnapshots` variable reference

2. **Runtime Error Fixes**
   - Fixed `totalSnapshots` reference error by calculating it locally within `generateDataFromSnapshots()`
   - Added safety checks for snapshot data (`snapshot?.capturedAt` validation)
   - Added data validation to ensure array is always passed to LineChart

3. **Recharts React 19 Compatibility**
   - Implemented delayed chart rendering to prevent Redux store update errors during unmount
   - Added `shouldRenderChart` state that delays chart render until component is fully mounted
   - Prevents recharts internal Redux store from dispatching during React's unmount phase
   - Added loading state while chart initializes
   - Stabilized chart key to prevent unnecessary remounts: `chart-${timeRange}-${metricMode}-${viewMode}-${totalSnapshots}`

4. **Data Generation Optimization**
   - Memoized data generation with `useMemo` to prevent unnecessary recalculations
   - Removed `visibleAssets` from dependency array (Set reference equality issues)
   - Added error handling in data generation with try-catch
   - Improved data stability to reduce recharts re-renders

5. **Code Quality**
   - All lint errors resolved
   - Type safety improvements
   - Better error handling and edge case coverage

## Styling Consistency:
- All components maintain Fey glass system (rgba backgrounds, soft shadows, no hard borders)
- Track color/design locked (red accent #F63148)
- Manage uses purple accent
- Focus rings use purple glow (rgba(168,85,247,0.20))
- No UI regressions: layout preserved, no overflow, no hard borders
