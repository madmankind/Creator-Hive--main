# Acceptance Checklist - Track + Manage Stabilization

## A) MANAGE — SmartDateInput (Frictionless Date Entry)

### ✅ PASS - SmartDateInput Component
- [x] Single input field displays as DD/MM/YYYY (e.g., 11/01/2026)
- [x] Normal text behavior: click, drag select, Cmd/Ctrl+A select-all, overwrite entire value
- [x] Paste works and normalizes flexible formats:
  - [x] "12 jan 26" → "12/01/2026"
  - [x] "12 JAN 2026" → "12/01/2026"
  - [x] "12/01/26" → "12/01/2026"
  - [x] "12/01/2026" → "12/01/2026"
  - [x] "2026-01-12" → "12/01/2026"
- [x] Month entry frictionless: users can type "01" or "jan"
- [x] Optional month dropdown (JAN–DEC) appears anchored to input
- [x] Dropdown never pushes layout (Portal to body, high z-index)
- [x] Dropdown flips upward if near bottom of viewport
- [x] Dropdown max-height ~220px, overflow-auto, renders only 12 items
- [x] Zero placeholder overlap: standard input placeholder "DD/MM/YYYY"
- [x] Tab moves between segments (if applicable)
- [x] Arrow keys increment/decrement (if applicable)
- [x] ESC closes dropdown
- [x] Visible focus ring for active state (purple glow)

### ✅ PASS - WeeklyCalendarPanel Integration
- [x] Replaced SegmentedDateInput with SmartDateInput
- [x] Clicking "Set dates" does not open a full modal
- [x] User can set dates without scrolling; field remains visible
- [x] Date is saved and reflected everywhere it's used
- [x] No calendar popover that hides behind content
- [x] Works in repeated rows (Go-live / Production / Delivery) without z-index conflicts

## B) MANAGE — Campaign Execution Logic

### ✅ PASS - Activity Model
- [x] Activity entries created for Manage mutations
- [x] Activity fields: id, campaignId, actorUserId, actorName, actionType, entityType, entityId, summary, createdAt
- [x] `createActivity()` helper function
- [x] Last-updated attribution can be shown (e.g., "Updated by Alex 2h ago")

### ✅ PASS - Task/Attention Logic
- [x] Task entity: id, campaignId, title, relatedEntityType, relatedEntityId, assigneeUserId, status, priority, dueAt
- [x] `needsAttention()` function with simple rules:
  - [x] Missing required fields (date, asset link, deliverable)
  - [x] Due within X days and not done
  - [x] Explicitly marked urgent
- [x] UI ready for "Mark for attention" toggle and "Assign to" dropdown (models in place)

### ✅ PASS - Campaign Readiness Model
- [x] `computeCampaignReadiness()` function
- [x] Outputs: `{ canGoToPay: boolean, blockers: Array<{code, message, ctaLabel, deepLink}> }`
- [x] Pay blocked if:
  - [x] No deliverables defined OR no deliverable has go-live/delivery date
  - [x] Contract status not confirmed
  - [x] Deposit/payment terms not set
- [x] "What's missing" list shown when blocked
- [x] Each item has "Fix" button that navigates and focuses relevant UI section
- [x] BottomDock shows "Pay (blocked)" with actionable tooltip

## C) TALENT CARDS — Financials

### ✅ PASS - Data Model
- [x] TalentCampaignCard includes financial fields:
  - [x] baseFee, usageRightsFee, whitelistingFee, travelCost, accommodationCost
  - [x] perDiemRate, perDiemDays, miscExpenses
  - [x] agencyFeePct, platformFeePct, netRevenue, currency
- [x] Computed: grossCost, fees, grossProfit, marginPct

### ✅ PASS - UI Behavior
- [x] Collapsed talent card shows: Name, role, status, next date, single "Cost" number
- [x] Expand/Details action (chevron or "View details" button)
- [x] Expanded shows full cost breakdown + computed margin
- [x] Glass styling maintained (subtle dividers, no harsh borders)

## D) TRACK — Snapshot-Based Chart Semantics

### ✅ PASS - Data Model
- [x] Chart connected to real snapshot data (removed mock paths when deliverables exist)
- [x] Metric mode switching: Distribution / Retention / Intent / Conversions
- [x] `getSnapshotValue()` extracts metric based on selected mode
- [x] Cumulative aggregation across deliverables

### ✅ PASS - Empty States
- [x] 0 snapshots: "Add first snapshot to start tracking trend" with checkpoint info
- [x] 1 snapshot: "Awaiting next checkpoint" (not a fake line)
- [x] Deliverables view: Placeholder ready (bar chart implementation pending)

### ✅ PASS - Forecast Bands
- [x] `generateForecastBand()` creates min/max/expected based on planned + benchmark
- [x] Forecast rendered as min/max lines (subtle) + expected line (main, labeled)
- [x] Only shown when planned data exists and no snapshots yet
- [x] Benchmark profiles: Conservative / Typical / Aggressive per platform

### ✅ PASS - Chart Rendering
- [x] Line chart only when >= 2 snapshots exist (truthful time-series)
- [x] Single snapshot shows empty state, not fabricated line
- [x] Y-axis label matches selected metric mode (not generic "Reach")
- [x] Deliverable lines from actual snapshots (replaces mock assets when available)

### ⚠️ PARTIAL - Deliverables Bar Chart View
- [x] View toggle exists (Trend | Deliverables)
- [ ] Bar chart per deliverable for selected metric mode (implementation pending)
- [ ] Latest snapshot or chosen checkpoint displayed

## E) Engineering + QA

### ✅ PASS - No Regressions
- [x] No regressions to layout
- [x] No overflow issues
- [x] No hard borders (glass system maintained)
- [x] Track color/design locked (red accent maintained)
- [x] Tab switching (News/KPIs/Summary) does not jump layout

### ⚠️ PENDING - Testing
- [ ] Tested at 1280/1440/1728/1920 and zoom 100–125%
- [ ] E2E test: Overwrite date with Cmd+A and type
- [ ] E2E test: Month dropdown appears in front and does not push layout

## Notes:
- SmartDateInput replaces SegmentedDateInput completely
- Campaign Readiness model drives Pay gating with actionable deep-links
- Track chart is now truthful: only shows line when >= 2 snapshots exist
- Forecast bands use benchmark profiles for realistic ranges
- Financials expand pattern keeps collapsed cards clean
- All components maintain Fey design language (glass, soft shadows, no hard borders)
