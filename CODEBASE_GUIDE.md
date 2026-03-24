# Creator Hive - Codebase Guide

**Navigate the code like a pro**

---

## 📂 Directory Structure (Annotated)

```
creator-hive-next/
│
├── prisma/
│   ├── schema.prisma              # 🔥 Database schema (628 lines)
│   └── migrations/                # Migration history
│       └── 20260215000000_add_booking_brief_draft/
│
├── public/
│   ├── favicon.ico
│   └── (future: images, illustrations)
│
├── src/
│   │
│   ├── app/                       # 🔥 Next.js App Router (routes & pages)
│   │   ├── layout.tsx             # Root layout (providers, fonts)
│   │   ├── page.tsx               # 🔥🔥🔥 HOMEPAGE - main booking flow
│   │   ├── globals.css            # Global styles
│   │   │
│   │   ├── api/                   # API routes
│   │   │   ├── auth/[...nextauth]/route.ts  # NextAuth config
│   │   │   └── booking/           # Booking endpoints
│   │   │       ├── brief/route.ts
│   │   │       ├── pod/route.ts
│   │   │       └── request/route.ts
│   │   │
│   │   ├── dashboard/             # Client dashboard
│   │   │   ├── page.tsx           # Dashboard home
│   │   │   ├── track/page.tsx     # Track projects
│   │   │   ├── manage/page.tsx    # Manage bookings
│   │   │   └── pay/page.tsx       # Payments
│   │   │
│   │   ├── discovery/             # (Legacy, may merge with homepage)
│   │   ├── onboarding/            # User onboarding flows
│   │   └── get-started/           # Initial setup wizards
│   │
│   ├── components/                # 🔥 React components
│   │   ├── booking/               # 🔥 Booking flow components
│   │   │   ├── BriefLiteWizard.tsx      # 3-step brief wizard
│   │   │   ├── SendRequestModal.tsx      # Final submission
│   │   │   └── BookingModal.tsx          # (Old, not used)
│   │   │
│   │   ├── marketing/             # Landing page components
│   │   │   ├── LandingTalentCard.tsx     # 🔥 Talent cards (420×285px)
│   │   │   └── TalentCarousel.tsx        # Talent grid + filters
│   │   │
│   │   ├── dashboard/             # Dashboard components
│   │   ├── prism/                 # Prism personality system
│   │   │   ├── PrismBadge.tsx
│   │   │   └── prism-icons/       # SVG illustrations
│   │   │
│   │   ├── ui/                    # Reusable UI primitives
│   │   │   ├── tooltip.tsx
│   │   │   ├── chip.tsx
│   │   │   └── ...
│   │   │
│   │   ├── auth/                  # Auth dialogs
│   │   │   ├── ClientAuthDialog.tsx
│   │   │   └── TalentOnboardingDialogFey.tsx
│   │   │
│   │   ├── HeroBar.tsx            # Search + discover bar
│   │   ├── Providers.tsx          # App providers wrapper
│   │   └── AppShell.tsx           # Layout shell
│   │
│   ├── lib/                       # 🔥 Business logic & utilities
│   │   ├── schemas/               # 🔥🔥 Canonical Zod schemas
│   │   │   └── booking.ts         # Single source of truth for booking
│   │   │
│   │   ├── matching/              # Match scoring algorithms
│   │   │   ├── match-score.ts     # 🔥 Main scoring function
│   │   │   └── fitScore.ts        # Helper scoring functions
│   │   │
│   │   ├── booking/               # Booking-related utilities
│   │   │   └── frame-tokens.ts    # UI frame constants
│   │   │
│   │   ├── curatedTalent.ts       # 🔥 Talent data (mock + real)
│   │   ├── utils.ts               # cn() helper, misc utilities
│   │   └── ...
│   │
│   ├── store/                     # Zustand state stores
│   │   ├── useCampaignPodStore.ts # Pod assembly state
│   │   └── usePodConfigStore.ts   # Pod overlay state
│   │
│   ├── features/                  # Feature modules
│   │   └── pod-setup/             # Pod setup overlay
│   │
│   └── server/                    # Server-only code
│       ├── db.ts                  # Prisma client singleton
│       └── ...
│
├── .env.local                     # 🔐 Environment variables (gitignored)
├── .env.example                   # Template for env vars
├── tailwind.config.ts             # Tailwind configuration
├── tsconfig.json                  # TypeScript configuration
├── next.config.ts                 # Next.js configuration
├── package.json                   # Dependencies
├── pnpm-lock.yaml                 # Lock file
│
└── DOCUMENTATION/                 # 📚 Handover docs
    ├── HANDOVER_README.md
    ├── PROJECT_OVERVIEW.md
    ├── TECHNICAL_ARCHITECTURE.md
    ├── DESIGN_SYSTEM.md
    ├── CODEBASE_GUIDE.md (you are here)
    ├── BOOKING_FLOW_SPECIFICATION.md
    ├── DEVELOPMENT_GUIDE.md
    ├── ROADMAP.md
    ├── CTO_BOOKING_FLOW_IMPLEMENTATION.md
    └── DEVELOPER_REVIEW.md
```

**🔥 = Critical files to understand first**

---

## 🗺️ Key File Deep Dives

### 1. `src/lib/schemas/booking.ts` (250 lines)

**Purpose:** Single source of truth for all booking-related data structures

**What's Inside:**
- Enums: `PricingTier`, `Timeline`, `Objective`, `RequestStatus`
- Schemas: `BriefLiteSchema`, `PodSchema`, `BookingRequestCreateSchema`, `MatchScoreSchema`
- Constants: `OUTPUTS`, `PLATFORMS`, `LANGUAGES`, `MARKETS`
- Labels: `OBJECTIVE_LABELS`, `TIMELINE_LABELS`, etc. (for UI display)
- Descriptions: `PRICING_TIER_DESCRIPTIONS` (for tooltips)

**Critical Rules:**
- Never create schemas elsewhere - use these
- Never hardcode enum values - import from this file
- Prisma models must align with these schemas
- Any changes here require Prisma migration

**Example Usage:**
```typescript
import { BriefLiteSchema, OBJECTIVE_LABELS } from "@/lib/schemas/booking";

// Validate
const result = BriefLiteSchema.safeParse(data);

// Display
<span>{OBJECTIVE_LABELS[objective]}</span>
```

---

### 2. `src/app/page.tsx` (420+ lines)

**Purpose:** Homepage - includes hero, talent discovery, pod builder, brief wizard

**Key State Variables:**
```typescript
// View state
mode: 'client' | 'talent'          // User mode toggle
showTalentGallery: boolean         // Show/hide talent grid
showBriefWizard: boolean           // Show/hide embedded brief section
showSendModal: boolean             // Show/hide final send sheet

// Search/filter state
searchQuery: string                // Search input
selectedRoles: string[]            // Role filters

// Pod state (landing page)
selectedPodIds: string[]           // Talent IDs in pod (localStorage)
bookingTalents: PodTalent[]        // Full talent objects for booking

// Brief state
brief: BriefLite | null            // Completed brief data

// Auth state
clientAuthOpen: boolean            // Client sign-in dialog
talentAuthOpen: boolean            // Talent onboarding dialog
pendingDiscover: boolean           // Flag to open booking after auth
```

**Key Functions:**
```typescript
addToPod(talentId)                 // Add talent to landing pod
removeFromPod(talentId)            // Remove from landing pod
clearPod()                         // Clear entire pod
handleSetUpPod()                   // Open brief wizard + scroll
handleBriefComplete(briefData)     // Save brief, open send modal
handleSendRequest(requestData)     // Submit booking request
```

**Layout Sections:**
1. Hero section (welcome, mode toggle, hero bar)
2. Talent gallery (TalentCarousel component)
3. Campaign pod panel (bottom-fixed tray)
4. Brief section (embedded, appears when triggered)
5. Send modal (overlay, final step)
6. Auth dialogs (overlay, sign-in/onboarding)

---

### 3. `src/components/marketing/LandingTalentCard.tsx` (800+ lines)

**Purpose:** Individual talent card with flip animation

**Props:**
```typescript
{
  curatedTalent: CuratedTalent;    // Full talent data
  isAdded: boolean;                // Is in pod?
  onAdd: (id: string) => void;     // Add to pod callback
  onBook: (talent) => void;        // Book now callback
  matchScore?: MatchScore;         // Optional match score (for back)
  onNavigateToProfile?: () => void;// Open profile page
}
```

**Structure:**
- Front: Profile image, name, role, tier tag, Prism badge, "Add to pod" button
- Back: Stats (followers, engagement), match score (green circle), bio, "Book now" button

**Key Logic:**
```typescript
// Tier classification
function getTalentTier(talent): "HIVE_SELECT" | "HIVE_SIGNATURE" {
  return talent.followers >= 50000 ? "HIVE_SIGNATURE" : "HIVE_SELECT";
}

// Flip interaction
const [isFlipped, setIsFlipped] = useState(false);
<div onMouseEnter={() => setIsFlipped(true)} 
     onMouseLeave={() => setIsFlipped(false)}>
```

**Visual Tokens:**
- Width: 420px
- Height: 285px
- Padding: 20px
- Radius: rounded-2xl
- Background: bg-white/5 + backdrop-blur-sm
- Ring: ring-1 ring-white/10

---

### 4. `src/components/booking/BriefLiteWizard.tsx` (430+ lines)

**Purpose:** 3-step wizard for collecting campaign brief

**Steps:**
1. **What & Where** - Objective, outputs, platforms
2. **Market & Message** - Markets (multi-select), languages (multi-select), key messaging
3. **When & Budget** - Timeline, pricing tier, reference URL

**Key Features:**
- Horizontal carousel (translateX transitions)
- Fixed frame (420×285px on desktop, responsive on mobile)
- Progress dots (bottom center)
- Navigation: Prev/Next buttons, disabled based on validation
- No data loss on back navigation

**State Management:**
```typescript
const [step, setStep] = useState(1);             // Current step (1-3)
const [direction, setDirection] = useState(1);   // Animation direction
const [objective, setObjective] = useState(...); // Form fields
// ... more form state
```

**Validation:**
```typescript
const canProceed = () => {
  if (step === 1) return objective && outputs.length > 0 && platforms.length > 0;
  if (step === 2) return markets.length > 0 && languages.length > 0;
  if (step === 3) return timeline && pricingTier;
  return false;
};
```

**Completion:**
```typescript
onComplete({
  objective, outputs, platforms, markets, languages,
  keyMessaging, timeline, pricingTier, referenceUrl
});
// Does NOT include id, createdAt, updatedAt (added by API)
```

---

### 5. `src/lib/matching/match-score.ts` (200+ lines)

**Purpose:** Compute talent-brief match score algorithmically

**Main Function:**
```typescript
export function computeMatchScore(
  brief: BriefLite,
  talent: CuratedTalent
): Omit<MatchScore, "requestId" | "computedAt"> {
  
  const weights = {
    role: 0.35,      // Role/output alignment
    platform: 0.20,  // Platform overlap
    market: 0.15,    // Market + language fit
    objective: 0.20, // Campaign objective alignment
    tier: 0.10,      // Pricing tier appropriateness
  };
  
  // Score each dimension (0-100)
  const roleScore = scoreRoleFit(brief.outputs, talent.roleTags);
  const platformScore = scorePlatformFit(brief.platforms, talent.platformTags);
  const marketScore = scoreMarketFit(brief.markets, talent.marketExpertise, brief.languages, talent.languages);
  const objectiveScore = scoreObjectiveFit(brief.objective, talent);
  const tierScore = scoreTierFit(brief.pricingTier, talent);
  
  // Weighted sum
  const rawScore = 
    roleScore * weights.role +
    platformScore * weights.platform +
    marketScore * weights.market +
    objectiveScore * weights.objective +
    tierScore * weights.tier;
  
  // Convert to 0-10 scale
  const score = Math.round(Math.min(10, Math.max(0, rawScore / 10)));
  
  // Generate rationale (one-liner, ≤60 chars)
  const rationale = generateRationale(scores);
  
  return { talentId: talent.id, score, rationale };
}
```

**Helper Functions:**
- `scoreRoleFit()` - Jaccard similarity on role tags
- `scorePlatformFit()` - Platform overlap percentage
- `scoreMarketFit()` - Market + language match
- `scoreObjectiveFit()` - Campaign objective alignment
- `scoreTierFit()` - Budget vs talent tier appropriateness
- `generateRationale()` - Top 2 factors → human-readable string

**Testing:**
```typescript
// Example inputs
const brief = {
  objective: "AWARENESS",
  outputs: ["UGC", "Edited video"],
  platforms: ["TikTok", "Instagram"],
  markets: ["UAE"],
  languages: ["EN", "AR"],
  pricingTier: "HIVE_SELECT",
};

const talent = {
  roleTags: ["UGC Creator", "Videographer"],
  platformTags: ["TikTok", "Instagram"],
  marketExpertise: ["UAE", "GCC"],
  languages: ["English", "Arabic"],
  followers: 25000, // → Hive Select
};

computeMatchScore(brief, talent);
// → { score: 9, rationale: "Perfect platform match, strong market fit" }
```

---

### 6. `src/lib/curatedTalent.ts` (1000+ lines)

**Purpose:** Curated talent data (currently mock, will become DB-backed)

**Structure:**
```typescript
export interface CuratedTalent {
  id: string;
  name: string;
  displayTitle: string;        // Role/headline
  shortBio: string;
  
  // Tags
  roleTags: string[];
  platformTags: string[];
  availability: string[];
  marketExpertise: string[];
  languages: string[];
  
  // Prism
  prismArchetype?: string;     // "Storyteller", "Strategist", etc.
  
  // Metrics
  followers?: number;
  engagementRate?: number;
  
  // Media
  avatarUrl?: string;
  profileImageUrl?: string;
  portfolioUrl?: string;
  
  // Location
  location?: string;
  timezone?: string;
}

export const curatedTalent: CuratedTalent[] = [
  {
    id: "sarah_ugc_001",
    name: "Sarah Al-Mansoori",
    displayTitle: "UGC Creator",
    // ... full profile
  },
  // ... 30+ talents
];
```

**Future Migration:**
- Replace with Prisma queries: `prisma.talentProfile.findMany()`
- Keep file for seed data and dev mocks

---

### 7. `src/store/useCampaignPodStore.ts`

**Purpose:** Zustand store for dashboard pod assembly

**State:**
```typescript
{
  selectedTalents: Talent[];       // Talents in current pod
  addTalent: (talent) => void;
  removeTalent: (id) => void;
  clearPod: () => void;
}
```

**Usage:**
```typescript
const { selectedTalents, addTalent } = useCampaignPodStore();

<button onClick={() => addTalent(talent)}>Add</button>
```

**Note:** Separate from landing page pod (which uses localStorage)

---

## 🛤️ Key User Flows (Code Paths)

### Flow 1: Browse → Add to Pod → Submit Brief

**Path:**
```
1. User lands on homepage (src/app/page.tsx)
2. Clicks "Discover" → setShowTalentGallery(true)
3. Scrolls to #talent-gallery section
4. Views TalentCarousel (src/components/marketing/TalentCarousel.tsx)
5. Clicks "Add to pod" on LandingTalentCard → addToPod(talentId)
6. Pod stored in localStorage: ch_landing_pod_ids = ["id1", "id2"]
7. Pod tray appears (CampaignPodPanel component)
8. Clicks "Set up pod" → handleSetUpPod()
9. Scrolls to #brief-section (embedded BriefLiteWizard)
10. Completes 3-step wizard → handleBriefComplete(briefData)
11. Opens SendRequestModal → asks for companyName + email
12. Submits → POST /api/booking/request
13. Redirects to /dashboard/track (future)
```

### Flow 2: Book Single Talent (Quick Book)

**Path:**
```
1. User lands on homepage
2. Clicks "Discover" → sees TalentCarousel
3. Hovers over talent card → flips to back
4. Clicks "Book now" → onBook(talent)
5. Talent added to pod automatically
6. Scrolls to #brief-section (BriefLiteWizard)
7. (Same as Flow 1, steps 10-13)
```

### Flow 3: Track Booking (Dashboard)

**Path:**
```
1. User navigates to /dashboard/track
2. Fetches bookings: GET /api/booking/request (filtered by user)
3. Displays list of BookingRequest records
4. Clicks request → /dashboard/requests/:id
5. Shows tabs: Track, Manage, Pay
6. Updates status → PATCH /api/booking/request/:id
7. (Future: Approve delivery, release payment)
```

---

## 🔧 Utility Functions

### `cn()` - Conditional Classes

**File:** `src/lib/utils.ts`

**Purpose:** Merge Tailwind classes conditionally

```typescript
import { cn } from "@/lib/utils";

<div className={cn(
  "base-class",
  isActive && "active-class",
  isPrimary ? "primary-class" : "secondary-class"
)}>
```

### `formatCurrency()`

```typescript
export function formatCurrency(amount: number, currency = "AED") {
  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}
```

### `formatRelativeTime()`

```typescript
export function formatRelativeTime(date: Date) {
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const diffInSeconds = (date.getTime() - Date.now()) / 1000;
  // ... return "2 days ago", "in 3 hours", etc.
}
```

---

## 🧪 Testing Patterns (When Implemented)

### Component Testing
```typescript
// BriefLiteWizard.test.tsx
describe("BriefLiteWizard", () => {
  it("advances to step 2 when step 1 is valid", () => {
    // Render, fill step 1, click Next, assert step === 2
  });
  
  it("validates markets are required", () => {
    // Render, skip markets, assert error message
  });
});
```

### API Testing
```typescript
// POST /api/booking/request
describe("POST /api/booking/request", () => {
  it("returns 400 if brief is invalid", async () => {
    const invalidBrief = { /* missing required fields */ };
    const response = await POST(invalidBrief);
    expect(response.status).toBe(400);
  });
});
```

### Integration Testing
```typescript
// Full booking flow
describe("Booking Flow E2E", () => {
  it("completes booking from discovery to submission", async () => {
    await page.goto("http://localhost:3000");
    await page.click("text=Discover");
    await page.click("button:has-text('Add')");
    await page.click("text=Set up pod");
    // ... complete wizard, assert redirect to /dashboard/track
  });
});
```

---

## 📦 Dependencies Explained

### Production Dependencies

**Core Framework:**
- `next@16.1.4` - React framework with App Router
- `react@19.2.3`, `react-dom@19.2.3` - React library

**UI & Styling:**
- `tailwindcss@4.x` - Utility-first CSS
- `framer-motion@11.x` - Animations
- `lucide-react@0.x` - Icon library
- `@radix-ui/*` - Accessible UI primitives (tooltip, dialog, etc.)

**State & Data:**
- `zustand@5.x` - State management
- `zod@3.x` - Runtime validation
- `@prisma/client@6.x` - Database ORM

**Auth:**
- `next-auth@5.x` - Authentication

**Payments:**
- `@stripe/stripe-js` - Stripe client SDK

**Analytics:**
- `@vercel/analytics` - Usage tracking

### Development Dependencies

- `typescript@5.x` - Type checking
- `eslint@9.x` - Linting
- `prettier@3.x` - Code formatting
- `husky@9.x` - Git hooks
- `@playwright/test@1.x` - E2E testing (installed but not used yet)

---

## 🔍 Code Search Patterns

### Finding Components
```bash
# Find component definition
rg "export.*function.*ComponentName"

# Find component usage
rg "<ComponentName" --type tsx

# Find props interface
rg "interface.*ComponentName.*Props"
```

### Finding API Routes
```bash
# List all API routes
find src/app/api -name "route.ts"

# Find endpoint handler
rg "export async function POST" src/app/api
```

### Finding Schema Definitions
```bash
# Zod schemas
rg "z\.object\(" src/lib/schemas

# Prisma models
rg "^model " prisma/schema.prisma
```

### Finding State Usage
```bash
# Zustand stores
rg "create\(" src/store

# useState hooks
rg "useState<.*>" src/app/page.tsx
```

---

## 🏗️ Adding New Features (Patterns)

### Pattern 1: Add New Field to Brief

**Steps:**
1. Update `BriefLiteSchema` in `src/lib/schemas/booking.ts`
2. Update `BriefLiteWizard` component to collect field
3. Update Prisma schema (`BookingRequest` model)
4. Create migration: `npx prisma migrate dev --name add_field_x`
5. Update API routes to handle new field
6. Update `SendRequestModal` to display field in summary

### Pattern 2: Add New Talent Archetype

**Steps:**
1. Add archetype to `PRISM_ARCHETYPE_DESCRIPTIONS` in `src/lib/curatedTalent.ts`
2. Create SVG icon in `src/components/prism/prism-icons/`
3. Update `PrismBadge.tsx` to handle new archetype
4. Add talents with new archetype to `curatedTalent` array
5. No schema changes needed

### Pattern 3: Add New Dashboard Tab

**Steps:**
1. Create route: `src/app/dashboard/new-tab/page.tsx`
2. Add tab button in dashboard layout
3. Implement tab content (list view, detail view, etc.)
4. Create API endpoint if needed: `src/app/api/dashboard/new-tab/route.ts`
5. Update navigation links

---

## 🎓 Learning Path (From Beginner to Expert)

### Week 1: Surface-Level Understanding
- [ ] Run app locally, click through all flows
- [ ] Read homepage code (page.tsx)
- [ ] Understand talent card component
- [ ] Trace one booking flow from click to API

### Week 2: Deep Dive
- [ ] Study match scoring algorithm
- [ ] Understand Prisma schema and relationships
- [ ] Review authentication flow
- [ ] Explore Zustand state stores

### Week 3: Make Changes
- [ ] Add new field to brief wizard
- [ ] Modify match scoring weights
- [ ] Style a new component
- [ ] Write your first API endpoint

### Week 4: Own a Feature
- [ ] Take ownership of dashboard completion
- [ ] Design and implement a new feature
- [ ] Review and refactor existing code
- [ ] Update documentation as you learn

---

## 💡 Pro Tips

### Debugging
- **Check terminal output:** Next.js shows compile errors clearly
- **Use React DevTools:** Inspect component state and props
- **Console log strategically:** Add `console.log("[DEBUG] Variable:", var)` 
- **Check Network tab:** Inspect API requests/responses
- **Prisma Studio:** Run `npx prisma studio` to browse database

### Code Quality
- **Use TypeScript strictly:** Don't use `any` unless absolutely necessary
- **Extract magic numbers:** Use constants or design tokens
- **Separate concerns:** UI components should not contain business logic
- **Write self-documenting code:** Good names > comments
- **Keep files focused:** 200-500 lines ideal, split if > 800 lines

### Git Workflow
- **Branch naming:** `feature/brief-wizard-v2`, `fix/match-score-bug`, `refactor/talent-card`
- **Commit messages:** Clear, present tense ("Add match score display", not "Added...")
- **PR descriptions:** Context, what changed, how to test
- **Review checklist:** Types pass, no console errors, responsive, accessible

---

**Next Document:** Read `BOOKING_FLOW_SPECIFICATION.md` for the core feature deep dive.
