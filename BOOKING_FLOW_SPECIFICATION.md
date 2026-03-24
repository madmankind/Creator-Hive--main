# Creator Hive - Booking Flow Specification

**Complete specification of the core booking experience**

---

## 🎯 Overview

The booking flow is the **heart of Creator Hive** - it's how brands discover, match with, and book talent. This document provides a complete specification of how it works, why it's designed this way, and how to modify it.

---

## 📋 User Journey Map

```
┌─────────────────────────────────────────────────────────────────┐
│                     DISCOVERY PHASE                              │
│  User browses curated talent, filters by role/platform          │
│  Duration: 2-5 minutes                                           │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                    POD ASSEMBLY PHASE                            │
│  User adds 1-10 talents to pod (stored in localStorage)         │
│  Pod tray shows selected talents                                 │
│  Duration: 1-3 minutes                                           │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                     BRIEFING PHASE                               │
│  User clicks "Set up pod" → scrolls to embedded brief section   │
│  3-step wizard collects campaign details                         │
│  Duration: 2-4 minutes                                           │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                     MATCHING PHASE (Auto)                        │
│  System computes match scores for each talent in pod            │
│  Scores displayed on talent card backs                           │
│  Duration: < 1 second                                            │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                    REVIEW & SEND PHASE                           │
│  "Review & Send" sheet opens (currently modal, will be sheet)   │
│  Pre-filled with brief summary + pod                             │
│  Asks ONLY for: company name, email, phone (opt), note (opt)    │
│  Duration: 30 seconds                                            │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                      SUBMISSION                                  │
│  POST /api/booking/request → saves BookingRequest to DB         │
│  Status: REQUEST_SUBMITTED                                       │
│  Redirect to /dashboard/track/:id                                │
└─────────────────────────────────────────────────────────────────┘
```

**Total Time:** 5-15 minutes from discovery to submission

---

## 🎬 Phase-by-Phase Breakdown

### Phase 1: Discovery

**UI Location:** Homepage talent gallery section

**Components:**
- `TalentCarousel` - Grid of talent cards with filters
- `LandingTalentCard` - Individual 420×285px cards with flip

**Features:**
- **Search bar:** Free text search (name, bio, role)
- **Role filters:** Checkboxes for UGC, Videographer, Copywriter, etc.
- **Platform filters:** (Future - currently manual click)
- **Card flip:** Hover → flip to back showing stats + bio

**State:**
```typescript
searchQuery: string              // Search text
selectedRoles: string[]          // Active role filters
showTalentGallery: boolean       // Gallery visibility
```

**Data Flow:**
```
curatedTalent[] (src/lib/curatedTalent.ts)
  → filtered by search + roles
  → rendered as LandingTalentCard components
```

---

### Phase 2: Pod Assembly

**UI Location:** Bottom-fixed pod tray (CampaignPodPanel)

**Components:**
- `CampaignPodPanel` - Pod tray with talent chips
- `LandingTalentCard` - "Add to pod" button triggers addToPod()

**Features:**
- **Add to pod:** Click "Add" button on card front
- **Visual feedback:** Button changes to "+ Added" state (darker, disabled look)
- **Pod tray:** Shows mini talent chips with remove buttons
- **Clear pod:** One-click to remove all talents
- **Persistence:** Auto-saves to localStorage on every change

**State:**
```typescript
selectedPodIds: string[]         // Array of talent IDs
// Synced with localStorage: "ch_landing_pod_ids"
```

**Business Rules:**
- Minimum: 1 talent
- Maximum: 10 talents (prevent overwhelming projects)
- No duplicates (button becomes "+ Added" if already in pod)
- "Set up pod" button disabled if pod is empty

**LocalStorage Schema:**
```json
{
  "ch_landing_pod_ids": ["sarah_ugc_001", "ahmed_video_002"]
}
```

---

### Phase 3: Briefing

**UI Location:** Embedded section (`#brief-section`) on homepage

**Component:** `BriefLiteWizard` (3-pane horizontal carousel)

**Frame Dimensions:** 420px × 285px (matches talent cards)

#### Step 1: What & Where

**Fields:**
- **Objective** (required, single-select)
  - Options: Awareness, Growth, Conversions, Launch
  - Labels: Brand awareness, Audience growth, Drive conversions, Product/service launch
  
- **Outputs** (required, multi-select)
  - Options: UGC, Edited video, Photo shoot, Social management, Design, Performance, Web build
  - Min: 1, Max: unlimited
  
- **Platforms** (required, multi-select)
  - Options: TikTok, Instagram, YouTube, Snapchat, LinkedIn
  - Min: 1, Max: unlimited

**Validation:**
- Must select objective
- Must select at least 1 output
- Must select at least 1 platform
- Next button disabled until valid

#### Step 2: Market & Message

**Fields:**
- **Markets** (required, multi-select)
  - Options: UAE, KSA, Egypt, Qatar, Kuwait, Bahrain, Oman, Lebanon, Jordan
  - Min: 1, Max: unlimited
  - Labels: Use MARKET_LABELS from schema
  
- **Languages** (required, multi-select)
  - Options: EN (English), AR (Arabic)
  - Min: 1, Max: 2
  
- **Key Messaging** (optional, text input)
  - Max length: 120 characters
  - Placeholder: "What's the core message or primary goal?"
  - Counter: Shows X/120

**Validation:**
- Must select at least 1 market
- Must select at least 1 language

#### Step 3: When & Budget

**Fields:**
- **Timeline** (required, single-select)
  - Options: ASAP, This month, Next month, Flexible
  - Labels: As soon as possible, Within this month, Next month, Flexible timeline
  
- **Pricing Tier** (required, single-select)
  - Options: Hive Select, Hive Signature
  - Descriptions (tooltips):
    - Hive Select: "Vetted premium talent"
    - Hive Signature: "Vetted premium talent with proven social influence"
  
- **Reference URL** (optional, URL input)
  - Placeholder: "Link to inspiration, brand guidelines, etc."
  - Validation: Must be valid URL or empty

**Validation:**
- Must select timeline
- Must select pricing tier
- URL must be valid if provided

#### Navigation & Transitions

**Progress Indicators:**
- 3 dots at bottom (filled = completed/current, outline = upcoming)
- Current step highlighted

**Buttons:**
- Previous: Visible on steps 2-3, always enabled
- Next: Visible on steps 1-2, disabled if step invalid
- Complete: Visible on step 3, disabled if step invalid

**Animations:**
- Horizontal slide (translateX)
- 300ms duration, easeInOut curve
- Direction-aware (forward = left-to-right, back = right-to-left)

**Cancel Behavior:**
- X button in top-right
- Closes wizard, clears state
- Does NOT clear pod (pod persists)

---

### Phase 4: Matching (Automatic)

**Trigger:** When brief is completed

**Process:**
1. Loop through pod talents
2. For each talent, call `computeMatchScore(brief, talent)`
3. Store scores in memory (or optionally save to DB)
4. Update talent cards to show match score on back

**Algorithm:** See `src/lib/matching/match-score.ts`

**Output:**
```typescript
{
  talentId: "sarah_ugc_001",
  score: 9,  // 0-10 integer
  rationale: "Perfect platform match, strong market fit"  // ≤60 chars
}
```

**Display:**
- Green circle with score integer (e.g., "9")
- Rationale below in small text
- Located on card back, below stats row

---

### Phase 5: Review & Send

**UI Location:** Modal overlay (will become right-side sheet)

**Component:** `SendRequestModal`

**Purpose:** Final confirmation and essential info collection

**Pre-Filled (Read-Only):**
- Brief summary (objective, outputs, platforms, markets, etc.)
- Pod summary (talent names, roles)
- Match scores (if available)

**User Input (Required):**
- Company Name (text, min 2 chars)
- Email (email validation)

**User Input (Optional):**
- Phone (text, no validation yet)
- Note (textarea, max 500 chars, for special requests)

**Explicitly NOT Included:**
- ❌ Campaign description (already in brief.keyMessaging)
- ❌ Budget input (already in brief.pricingTier)
- ❌ Timeline (already in brief.timeline)
- ❌ Trade license upload (moved to dashboard, required later)

**Validation:**
```typescript
BookingRequestCreateSchema.parse({
  brief: briefData,           // BriefLite object
  talentIds: podTalentIds,    // string[]
  companyName: string,        // Required
  email: string,              // Required, must be valid email
  phone?: string,             // Optional
  note?: string,              // Optional, max 500 chars
});
```

**Submit Action:**
```typescript
POST /api/booking/request
Body: {
  brief: { objective, outputs, platforms, markets, ... },
  talentIds: ["id1", "id2"],
  companyName: "Acme Corp",
  email: "client@acme.com",
  phone: "+971501234567",
  note: "Urgent - need by end of month"
}

Response: {
  data: {
    id: "req_abc123",
    status: "REQUEST_SUBMITTED",
    createdAt: "2026-02-17T..."
  }
}

Then: Redirect to /dashboard/track/req_abc123
```

---

## 🗄️ Data Schema (Detailed)

### BriefLite Schema

```typescript
{
  id?: string;                // Auto-generated CUID
  objective: Objective;       // AWARENESS | GROWTH | CONVERSIONS | LAUNCH
  outputs: string[];          // ["UGC", "Edited video", ...]
  platforms: string[];        // ["TikTok", "Instagram", ...]
  markets: string[];          // ["UAE", "KSA", ...]
  languages: string[];        // ["EN", "AR"]
  keyMessaging?: string;      // Optional, max 120 chars
  timeline: Timeline;         // ASAP | THIS_MONTH | NEXT_MONTH | FLEXIBLE
  pricingTier: PricingTier;   // HIVE_SELECT | HIVE_SIGNATURE
  referenceUrl?: string;      // Optional, must be valid URL
  createdAt?: Date;           // Auto-set on save
  updatedAt?: Date;           // Auto-set on update
}
```

### BookingRequest Schema

```typescript
{
  id: string;                 // CUID
  clientUserId: string;       // FK → User
  briefSnapshot: Json;        // BriefLite as JSON
  talentIds: string[];        // Array of talent IDs
  companyName: string;
  email: string;
  phone?: string;
  note?: string;
  status: RequestStatus;      // 13-state lifecycle
  createdAt: Date;
  updatedAt: Date;
}
```

### MatchScore Schema

```typescript
{
  requestId: string;          // FK → BookingRequest
  talentId: string;           // FK → TalentProfile
  score: number;              // 0-10 integer
  rationale: string;          // ≤60 chars
  computedAt: Date;
}
```

---

## 🔄 Status Lifecycle

### 13 Request States

```
1. DRAFT_BRIEF         → User started brief but didn't complete
2. MATCHING            → System computing match scores (milliseconds)
3. POD_SELECTED        → User assembled pod, ready to send brief
4. REQUEST_SUBMITTED   → Brief sent to talents (awaiting response)
5. IN_REVIEW           → Talents reviewing brief (internal status)
6. SCOPE_CONFIRMED     → Talents accepted, scope/price agreed
7. CONTRACT_PENDING    → Generating contract (auto or manual)
8. ACTIVE              → Contract signed, work in progress
9. DELIVERED           → Talent submitted deliverables
10. APPROVED           → Client approved work
11. PAID               → Payment released to talent
12. CLOSED             → Project complete, can be archived
13. CANCELLED          → Cancelled at any stage (with reason)
```

### Transitions

**Valid Transitions:**
```
DRAFT_BRIEF → MATCHING (on brief complete)
MATCHING → POD_SELECTED (on pod finalized)
POD_SELECTED → REQUEST_SUBMITTED (on send button click)
REQUEST_SUBMITTED → IN_REVIEW (talents notified)
IN_REVIEW → SCOPE_CONFIRMED (talents accept)
IN_REVIEW → CANCELLED (talents decline)
SCOPE_CONFIRMED → CONTRACT_PENDING (system generates contract)
CONTRACT_PENDING → ACTIVE (both parties sign)
ACTIVE → DELIVERED (talent submits work)
DELIVERED → APPROVED (client approves)
APPROVED → PAID (payment released)
PAID → CLOSED (project archived)

Any state → CANCELLED (with reason)
```

**Status displayed to user:**
- DRAFT_BRIEF: "Draft"
- REQUEST_SUBMITTED: "Pending"
- IN_REVIEW: "Under Review"
- SCOPE_CONFIRMED: "Confirmed"
- ACTIVE: "In Progress"
- DELIVERED: "Ready to Review"
- APPROVED: "Approved"
- PAID: "Paid"
- CLOSED: "Complete"
- CANCELLED: "Cancelled"

---

## 🎨 UI Specifications (Pixel-Perfect)

### Talent Card (Front)

**Dimensions:** 420px W × 285px H

**Layout:**
```
┌──────────────────────────────────────────┐ 420px
│  [Prism Badge]      [Hive Select Tag]    │
│  (32px, top-left)   (top-right)          │
│                                           │
│         [Profile Image Circle]            │
│              (80px diameter)              │
│                                           │
│         Sarah Al-Mansoori                 │
│          (16px, semibold)                 │
│                                           │
│            UGC Creator                    │
│          (13px, white/60)                 │
│                                           │
│     [TikTok] [Instagram] [YouTube]        │
│          (platform tags, 11px)            │
│                                           │
│      ┌────────────────────┐               │
│      │   + Add to pod     │               │
│      └────────────────────┘               │
│         (primary button)                  │
└──────────────────────────────────────────┘
285px
```

**Key Measurements:**
- Padding: 20px all sides
- Profile image: 80px diameter, centered
- Name: 16px font, 4px margin below image
- Role: 13px font, 8px margin below name
- Platform tags: 11px font, 12px gap between tags, 16px margin below role
- Button: 140px width, centered, 16px margin from bottom

### Talent Card (Back)

```
┌──────────────────────────────────────────┐
│  [Prism Badge]      [Hive Select Tag]    │
│                                           │
│  Followers: 125K    Engagement: 4.2%      │
│  (stats row, 12px font)                   │
│                                           │
│  ┌───┐ 9                                  │
│  │   │ Perfect platform match, strong     │
│  └───┘ market fit                         │
│  (green circle, score + rationale)        │
│                                           │
│  Specializes in luxury fashion, beauty,   │
│  and lifestyle brands. Works with...      │
│  (bio, 12px, white/60)                    │
│                                           │
│  📍 Dubai, UAE   🕐 GST   🗣️ EN, AR       │
│  (metadata row, 11px)                     │
│                                           │
│      ┌────────────────────┐               │
│      │    Book now        │               │
│      └────────────────────┘               │
└──────────────────────────────────────────┘
```

**Match Score Circle:**
- Size: 48px diameter
- Background: green-500/20
- Ring: ring-1 ring-green-400/40
- Text: 24px semibold, white
- Position: 20px from top, 20px from left

---

### Brief Wizard Panes

**Dimensions:** 420px W × 285px H (same as cards!)

**Layout (All Panes):**
```
┌──────────────────────────────────────────┐
│  ← [Step Title]                    ×     │  Header (40px)
│  (chevron back, title, close button)     │
├──────────────────────────────────────────┤
│                                           │
│                                           │
│         [Step Content]                    │  Body (180px, scrollable)
│                                           │
│                                           │
├──────────────────────────────────────────┤
│  ⚪ ⚫ ⚪  [Previous] [Next/Complete]     │  Footer (65px)
│  (progress)  (navigation)                 │
└──────────────────────────────────────────┘
```

**Step Content:**
- Padding: 20px horizontal, 16px vertical
- Scrollable: overflow-y-auto if content exceeds 180px
- Pills: min-h-[36px] for touch targets

---

### Send Request Sheet (Future Spec)

**Type:** OS-style right-side sheet (not center modal)

**Dimensions:**
- Width: 480px (mobile: full width)
- Height: 100vh
- Slide-in from right: 300ms ease-out

**Layout:**
```
┌─────────────────────────────────────┐ 480px
│  Review & Send                   ×  │
│  (title, 24px semibold)             │
├─────────────────────────────────────┤
│                                     │
│  Brief Summary (collapsed)          │ Scrollable
│  ▼ Campaign Details                 │ main area
│     Objective: Brand awareness      │
│     Platforms: TikTok, Instagram    │
│     ...                             │
│                                     │
│  Pod (2 talents)                    │
│  • Sarah Al-Mansoori (UGC)          │
│  • Ahmed Hassan (Video) [Score: 9]  │
│                                     │
│  ─────────────────────────────      │
│                                     │
│  Company Name*                      │
│  [________________]                 │
│                                     │
│  Email*                             │
│  [________________]                 │
│                                     │
│  Phone (optional)                   │
│  [________________]                 │
│                                     │
│  Note (optional)                    │
│  [________________]                 │
│  [________________]                 │
│                                     │
├─────────────────────────────────────┤
│  [Cancel]         [Send Request →]  │ Footer (fixed)
└─────────────────────────────────────┘
```

**Key Changes from Current Modal:**
- ✅ Right-side slide (not center popup)
- ✅ No background blur (feels OS-native)
- ✅ Escape key closes
- ✅ Brief summary is collapsible
- ✅ Only asks for company + email (no duplicate fields)

---

## 🧩 Component Props & APIs

### LandingTalentCard

```typescript
type LandingTalentCardProps = {
  curatedTalent: CuratedTalent;      // Full talent data
  isAdded: boolean;                  // Is in pod?
  onAdd: (talentId: string) => void; // Add to pod
  onBook: (talent: SimpleTalent) => void; // Quick book
  matchScore?: MatchScore;           // Optional match score
  onNavigateToProfile?: (id: string) => void; // Future: profile page
};
```

### BriefLiteWizard

```typescript
type BriefLiteWizardProps = {
  initialRoles?: string[];           // Pre-fill from search (optional)
  onComplete: (brief: Omit<BriefLite, "id" | "createdAt" | "updatedAt">) => void;
  onCancel: () => void;
};
```

**Completion Callback:**
```typescript
onComplete({
  objective: "AWARENESS",
  outputs: ["UGC", "Edited video"],
  platforms: ["TikTok", "Instagram"],
  markets: ["UAE"],
  languages: ["EN", "AR"],
  keyMessaging: "Launch summer collection",
  timeline: "THIS_MONTH",
  pricingTier: "HIVE_SELECT",
  referenceUrl: "https://brand.com/guidelines"
});
```

### SendRequestModal

```typescript
type SendRequestModalProps = {
  open: boolean;
  onClose: () => void;
  brief: BriefLite;                  // Pre-filled brief
  pod: Talent[];                     // Pre-filled pod
  onSubmit: (data: BookingRequestCreate) => Promise<void>;
};
```

**Submit Data:**
```typescript
{
  brief: BriefLite,
  talentIds: string[],
  companyName: string,
  email: string,
  phone?: string,
  note?: string,
}
```

---

## 🔐 Business Rules & Validation

### Pod Assembly Rules
- Minimum talents: 1
- Maximum talents: 10
- No duplicates
- All talents must have valid IDs
- Pod can be modified until request is sent

### Brief Validation Rules
- All required fields must be filled
- At least 1 output, 1 platform, 1 market, 1 language
- Key messaging max 120 characters
- Reference URL must be valid URL or empty
- No SQL injection, XSS, or malicious content

### Match Score Rules
- Score range: 0-10 (integer only)
- Rationale max 60 characters
- Scores are deterministic (same inputs = same output)
- Scores can be recomputed if brief changes

### Submission Rules
- User must be authenticated
- User role must be "AGENCY"
- Pod must have at least 1 talent
- Brief must be valid (Zod validation)
- Company name and email required
- One request per brief+pod combination (no duplicates)

---

## 🐛 Common Issues & Solutions

### Issue: Brief Wizard Not Showing
**Cause:** `showBriefWizard` state is false  
**Debug:** Check state in React DevTools, verify click handlers trigger `setShowBriefWizard(true)`  
**Fix:** Ensure all "Set up pod" and "Book now" buttons call correct function

### Issue: Match Scores Not Appearing
**Cause:** `matchScore` prop not passed to LandingTalentCard  
**Debug:** Check if `computeMatchScore()` is called, verify prop passing  
**Fix:** After brief complete, compute scores and pass as prop

### Issue: Pod Not Persisting
**Cause:** LocalStorage not saving or loading correctly  
**Debug:** Check browser console for localStorage errors, verify key name  
**Fix:** Ensure `useEffect` hooks for localStorage are not blocked

### Issue: Tier Tags Wrong Color
**Cause:** `getTalentTier()` logic incorrect or styles not applied  
**Debug:** Check follower count, verify `TIER_STYLES` object  
**Fix:** Ensure followers >= 50K → Hive Signature, else Hive Select

---

## 🧪 Testing Scenarios

### Manual Test: Full Booking Flow

**Setup:**
1. Clear localStorage
2. Start on homepage
3. Not authenticated

**Steps:**
1. Click "Discover" → should show auth dialog (if not signed in)
2. Sign in (or skip if already signed in)
3. Search for "UGC" → filters talents
4. Click "Add to pod" on 2 talents → pod tray appears
5. Click "Set up pod" → scrolls to brief section
6. Fill Step 1: Objective, outputs, platforms
7. Click "Next" → advances to Step 2
8. Fill Step 2: Markets, languages, key messaging
9. Click "Next" → advances to Step 3
10. Fill Step 3: Timeline, pricing tier
11. Click "Complete" → opens send modal
12. Fill company name + email
13. Click "Send Request" → should POST to API
14. Verify: Request in database with status "REQUEST_SUBMITTED"
15. Verify: Redirect to /dashboard/track/:id

**Expected Duration:** 3-5 minutes

**Pass Criteria:**
- ✅ No console errors
- ✅ All animations smooth
- ✅ No data loss on navigation
- ✅ Request saved to database
- ✅ Email and phone stored correctly

---

## 🔮 Future Enhancements

### Near-Term
- [ ] Save draft briefs (auto-save every 30s)
- [ ] Multi-currency support (AED, USD, SAR)
- [ ] Talent availability calendar integration
- [ ] Estimated project cost preview
- [ ] Reference file upload (not just URL)

### Mid-Term
- [ ] AI-powered brief suggestions
- [ ] Bulk booking (book 5 similar campaigns at once)
- [ ] Pod templates (save and reuse talent combinations)
- [ ] Collaborative briefing (invite team members)
- [ ] Version history (track brief changes)

### Long-Term
- [ ] Smart matching (auto-suggest talents based on brief)
- [ ] Predictive analytics (estimated success rate)
- [ ] A/B test different briefs
- [ ] Integration with brand asset libraries
- [ ] API for agency tools

---

**Next Document:** Read `DEVELOPMENT_GUIDE.md` for setup and workflows.
