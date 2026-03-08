# Creator Hive - Technical Architecture & Design System

**Complete technical and design reference**

---

## 🏛️ Technical Architecture

### High-Level System

```
[Vercel Edge Network] → [Next.js 16 App] → [Prisma ORM] → [PostgreSQL]
                              ↓
                         [Zustand State]
                         [NextAuth Auth]
                         [Stripe Payments]
```

### Technology Stack

**Frontend:**
- Next.js 16.1.4 (App Router, Turbopack)
- React 19.2.3
- TypeScript 5.x (strict mode)
- Tailwind CSS 4.x
- Framer Motion (animations)
- Radix UI (accessible primitives)
- Zustand (state management)

**Backend:**
- Next.js API Routes
- PostgreSQL 15+ (Supabase hosted)
- Prisma 6.x (ORM)
- NextAuth.js v5 (authentication)
- Stripe (payments)

**Infrastructure:**
- Vercel (hosting)
- Supabase (database + storage)
- GitHub (version control)

### Key Directories

```
src/
├── app/                    # Routes & pages
│   ├── page.tsx           # Homepage (CRITICAL)
│   ├── dashboard/         # Dashboard routes
│   └── api/               # API endpoints
├── components/            # React components
│   ├── booking/          # Booking flow
│   ├── marketing/        # Landing page
│   ├── prism/            # Personality system
│   └── ui/               # Primitives
├── lib/                   # Business logic
│   ├── schemas/          # Zod schemas (CRITICAL)
│   └── matching/         # Match scoring
└── store/                 # Zustand stores
```

### Core Data Models

**User System:**
```typescript
User {
  id: string
  email: string
  role: "AGENCY" | "TALENT" | "ADMIN"
}
```

**Booking Request:**
```typescript
BookingRequest {
  id: string
  clientUserId: string
  briefSnapshot: Json        // BriefLite object
  talentIds: string[]
  companyName: string
  email: string
  phone?: string
  note?: string
  status: RequestStatus      // 13 states
}
```

**Match Score:**
```typescript
MatchScore {
  requestId: string
  talentId: string
  score: number              // 0-10
  rationale: string          // ≤60 chars
}
```

### Request Status Lifecycle

```
DRAFT_BRIEF → MATCHING → POD_SELECTED → REQUEST_SUBMITTED 
→ IN_REVIEW → SCOPE_CONFIRMED → CONTRACT_PENDING → ACTIVE 
→ DELIVERED → APPROVED → PAID → CLOSED

(Any state → CANCELLED)
```

### API Endpoints

```
POST   /api/booking/brief      # Create brief
GET    /api/booking/brief      # Get brief
POST   /api/booking/pod        # Save pod
POST   /api/booking/request    # Submit request
GET    /api/booking/request    # List requests
GET    /api/booking/request/:id # Get request
```

### Match Scoring Algorithm

**Weights:**
- Role fit: 35%
- Platform fit: 20%
- Market/Language fit: 15%
- Objective fit: 20%
- Tier appropriateness: 10%

**Output:** Integer score 0-10 + rationale (≤60 chars)

**Implementation:** `src/lib/matching/match-score.ts`

---

## 🎨 Design System

### Design Philosophy

**Premium, minimal, human-first** inspired by:
- Apple HIG (clear hierarchy, generous spacing)
- Linear (dark UI, glassmorphism)
- Stripe (trust through simplicity)

**Core Principles:**
1. Quality over quantity
2. Glass over flat
3. Motion with purpose
4. Contrast for clarity
5. Desktop-first (mobile-aware)

### Color Palette

```css
/* Backgrounds */
--bg-primary: #0B0F14         /* Deep black-blue */
--bg-elevated: rgba(255,255,255,0.05)  /* Glass */
--bg-hover: rgba(255,255,255,0.10)
--bg-active: rgba(255,255,255,0.15)

/* Text */
--text-primary: rgba(255,255,255,0.90)
--text-secondary: rgba(255,255,255,0.60)
--text-tertiary: rgba(255,255,255,0.40)

/* Accents */
--purple-primary: #8B5CF6
--purple-deep: #7C3AED          /* Hive Signature */
--purple-light: #A78BFA         /* Hive Select */
--green-success: #10B981        /* Match scores */
--red-error: #EF4444
```

### Typography

**Font:** Inter (system fallback)

**Scale:**
- Hero: 32-40px, semibold, -0.02em tracking
- H1: 24-30px
- H2: 20-24px
- H3: 18px
- Body: 14-16px
- Small: 11-13px

**Rules:**
- Sentence case (not Title Case)
- US English
- No exclamation marks (unless exceptional)

### Spacing System

**Base unit:** 4px (Tailwind default)

**Common patterns:**
- Card padding: `p-5` or `p-6` (20-24px)
- Component gaps: `gap-4` (16px)
- Section margins: `mt-20 md:mt-28` (80-112px)

### Glassmorphism Pattern

**Standard glass card:**
```tsx
<div className="bg-white/5 backdrop-blur-sm rounded-2xl ring-1 ring-white/10 p-6">
  {/* Content */}
</div>
```

**Hover state:**
```tsx
<div className="bg-white/5 ring-1 ring-white/10 
                hover:bg-white/[0.07] hover:ring-white/20 
                transition cursor-pointer">
```

### Component Patterns

**Pill/Capsule Button:**
```tsx
// Unselected
<button className="rounded-full px-4 py-2 text-xs font-medium min-h-[36px]
                   bg-white/5 text-white/60 ring-1 ring-white/10 
                   hover:bg-white/10 hover:text-white/80 transition">

// Selected
<button className="rounded-full px-4 py-2 text-xs font-medium min-h-[36px]
                   bg-white/15 text-white ring-1 ring-white/30">
```

**Primary Button:**
```tsx
<button className="rounded-full bg-white px-5 py-2 text-xs font-semibold 
                   text-black hover:bg-white/90 transition">
```

### Talent Card Specifications

**Dimensions:** 420px × 285px (FIXED, non-negotiable)

**Structure:**
- Front: Profile image, name, role, tier tag, Prism badge, "Add" button
- Back: Stats, match score (green circle), bio, "Book now" button

**Frame system:**
```typescript
CARD_WIDTH_DESKTOP: "420px"
CARD_HEIGHT: "285px"
CARD_RADIUS: "rounded-2xl"
CARD_BG: "bg-white/5"
CARD_RING: "ring-1 ring-white/10"
CARD_SHADOW: "shadow-lg shadow-black/40"
```

**WHY 420×285px?**
- Golden ratio adjacent (~1.47:1)
- 3 cards fit perfectly in 1400px viewport
- Brief wizard uses same dimensions (visual continuity)

### Animation Guidelines

**Timing:**
- Micro interactions: 200ms
- Transitions: 300ms
- Entrances: 500ms

**Easing:**
- Entrances: `ease-out`
- Transitions: `ease-in-out`

**Example (Framer Motion):**
```tsx
<motion.div
  initial={{ opacity: 0, y: 8 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3, ease: "easeOut" }}
>
```

### Tier System

**Hive Select:**
- Label: "Hive Select"
- Description: "Vetted premium talent"
- Color: Light purple (`bg-purple-500/10 text-purple-300`)
- Criteria: < 50K followers

**Hive Signature:**
- Label: "Hive Signature"  
- Description: "Vetted premium talent with proven social influence"
- Color: Deep purple (`bg-purple-600/15 text-purple-200`)
- Criteria: ≥ 50K followers

**Implementation:**
```typescript
function getTalentTier(talent: CuratedTalent): "HIVE_SELECT" | "HIVE_SIGNATURE" {
  return (talent.followers || 0) >= 50000 ? "HIVE_SIGNATURE" : "HIVE_SELECT";
}
```

### Prism Personality System

**6 Archetypes:**
1. Storyteller - Narrative-driven, emotional
2. Strategist - Data-driven, analytical
3. Visionary - Bold, trend-setting
4. Connector - Community-building
5. Craftsperson - Detail-oriented, technical
6. Entertainer - High energy, engaging

**Display:**
- Icon: 32px, top-left of card
- Tooltip: Shows full description on hover
- Component: `<PrismBadge archetype="Storyteller" />`

### Responsive Breakpoints

```css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablets */
lg: 1024px  /* Laptops */
xl: 1280px  /* Desktops */
```

**Mobile Adaptations:**
- Cards: 420px → 100% width
- Hero text: 40px → 24px
- Spacing: mt-28 → mt-20

### Accessibility

**Current:**
- ✅ Semantic HTML
- ✅ ARIA labels
- ✅ Keyboard navigation
- ✅ Contrast ratios (WCAG AA)
- ✅ Radix UI primitives

**TODO:**
- [ ] Screen reader testing
- [ ] Focus trap in modals
- [ ] Skip links
- [ ] Full WCAG 2.1 AA audit

---

## 🔧 Development Patterns

### Component Structure

```typescript
// 1. Imports
import { useState } from "react";
import { cn } from "@/lib/utils";

// 2. Types
interface ComponentProps {
  prop1: string;
  prop2?: number;
}

// 3. Component
export function Component({ prop1, prop2 = 0 }: ComponentProps) {
  // 4. Hooks
  const [state, setState] = useState("");
  
  // 5. Handlers
  const handleClick = () => { /* ... */ };
  
  // 6. Render
  return <div>{/* ... */}</div>;
}
```

### Naming Conventions

```typescript
// PascalCase: Types, interfaces, components
type BookingRequest = { ... };
interface TalentCardProps { ... }
function TalentCard() { ... }

// camelCase: Variables, functions
const matchScore = 9;
function computeMatchScore() { ... }

// SCREAMING_SNAKE_CASE: Constants
const MAX_POD_SIZE = 10;
```

### Tailwind Class Order

1. Layout (flex, grid)
2. Sizing (w-, h-)
3. Spacing (p-, m-, gap-)
4. Typography (text-, font-)
5. Colors (bg-, text-, ring-)
6. Effects (shadow-, opacity-, transition)

**Good:**
```tsx
<div className="flex items-center gap-4 p-6 text-sm font-medium 
                bg-white/5 ring-1 ring-white/10 transition">
```

### Zod Validation Pattern

```typescript
// 1. Define schema in src/lib/schemas/booking.ts
export const BriefLiteSchema = z.object({
  objective: ObjectiveEnum,
  // ... more fields
});

// 2. Use in API route
const result = BriefLiteSchema.safeParse(body);
if (!result.success) {
  return NextResponse.json({ error: "Validation failed" }, { status: 400 });
}

// 3. Use in component
const [errors, setErrors] = useState<z.ZodError | null>(null);
const result = BriefLiteSchema.safeParse(formData);
```

### State Management

**Local (useState):** UI-only state (open/close, inputs)

**Global (Zustand):** Cross-component state (pod, config)

**Persistent (localStorage):** Landing page pod IDs

**Server (Prisma):** Database records

---

## 🐛 Common Pitfalls

### ❌ Don't
- Use `any` type (use TypeScript strictly)
- Create schemas outside `src/lib/schemas/booking.ts`
- Hardcode "Pro" or "Signature" (use `HIVE_SELECT`, `HIVE_SIGNATURE`)
- Make brief wizard different size than cards
- Use center modals (prefer embedded or side sheets)
- Re-ask for information (single source of truth)

### ✅ Do
- Import schemas from canonical file
- Use `cn()` for conditional classes
- Follow Tailwind class order
- Preserve 420×285px frame system
- Write self-documenting code (clear names > comments)
- Test on Chrome, Safari, Firefox

---

## 📚 Quick Reference

### File Shortcuts

```bash
# Schemas (single source of truth)
src/lib/schemas/booking.ts

# Match scoring
src/lib/matching/match-score.ts

# Homepage
src/app/page.tsx

# Talent cards
src/components/marketing/LandingTalentCard.tsx

# Brief wizard
src/components/booking/BriefLiteWizard.tsx

# Database
prisma/schema.prisma
```

### Environment Setup

```bash
# Install
pnpm install

# Database
npx prisma generate
npx prisma migrate dev

# Dev server
pnpm dev

# Type check
pnpm type-check

# Prisma Studio (GUI)
npx prisma studio
```

### Design Tokens (Quick Copy)

```tsx
// Glass card
className="bg-white/5 backdrop-blur-sm rounded-2xl ring-1 ring-white/10 p-6"

// Pill button (unselected)
className="rounded-full px-4 py-2 text-xs font-medium min-h-[36px] 
           bg-white/5 text-white/60 ring-1 ring-white/10"

// Pill button (selected)
className="rounded-full px-4 py-2 text-xs font-medium min-h-[36px] 
           bg-white/15 text-white ring-1 ring-white/30"

// Primary button
className="rounded-full bg-white px-5 py-2 text-xs font-semibold 
           text-black hover:bg-white/90"
```

---

**For more details:**
- Technical deep dive → See existing docs in repo
- Code examples → Explore `src/` directory
- Design specs → BOOKING_FLOW_SPECIFICATION.md
- API patterns → DEVELOPMENT_GUIDE.md

**This document consolidates the essentials. For exhaustive details, refer to the complete documentation package.**
