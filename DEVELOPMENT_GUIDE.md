# Creator Hive - Development Guide

**Setup, workflows, and best practices**

---

## 🚀 Initial Setup

### Prerequisites

**Required Software:**
- Node.js 20+ (LTS recommended)
- pnpm 9+ (package manager)
- Git 2.30+
- PostgreSQL 15+ (via Supabase or local)
- VS Code or WebStorm (recommended IDEs)

**Recommended VS Code Extensions:**
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Prisma
- TypeScript Error Translator
- GitLens

### Step-by-Step Installation

```bash
# 1. Clone repository
git clone <repository-url>
cd creator-hive-next

# 2. Install dependencies
pnpm install

# 3. Set up environment variables
cp .env.example .env.local

# Edit .env.local with your credentials:
# DATABASE_URL="postgresql://..."
# DIRECT_URL="postgresql://..."
# NEXTAUTH_SECRET="..." (generate with: openssl rand -base64 32)
# NEXTAUTH_URL="http://localhost:3000"
# GOOGLE_CLIENT_ID="..."
# GOOGLE_CLIENT_SECRET="..."

# 4. Set up database
npx prisma generate
npx prisma migrate dev

# 5. (Optional) Seed database
npx prisma db seed

# 6. Start development server
pnpm dev

# Visit: http://localhost:3000
```

---

## 🔧 Environment Variables

### Required Variables

```bash
# Database (Supabase or local PostgreSQL)
DATABASE_URL="postgresql://user:password@host:5432/dbname"
DIRECT_URL="postgresql://user:password@host:5432/dbname"

# NextAuth (Authentication)
NEXTAUTH_SECRET="your-secret-key-here"  # Generate: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"    # Change in production

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Stripe (Payments)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."  # From Stripe dashboard

# Supabase (Optional, for storage)
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1..."  # Server-side only
```

### Optional Variables

```bash
# Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID="xxx"

# Email (Future)
SENDGRID_API_KEY="SG.xxx"
RESEND_API_KEY="re_xxx"

# Monitoring (Future)
SENTRY_DSN="https://xxx@sentry.io/xxx"
```

### Getting OAuth Credentials

**Google OAuth:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 Client ID
5. Add authorized redirect: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Client Secret

**Stripe:**
1. Sign up at [Stripe](https://stripe.com/)
2. Get test API keys from dashboard
3. Install Stripe CLI: `brew install stripe/stripe-cli/stripe`
4. Run `stripe login` and follow prompts
5. Forward webhooks: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

---

## 📝 Development Workflows

### Daily Development

```bash
# Start dev server (with Turbopack for faster builds)
pnpm dev

# Alternative ports
pnpm dev -p 3001

# Type checking
pnpm type-check

# Linting
pnpm lint

# Format code
pnpm format
```

### Database Workflows

```bash
# Generate Prisma Client (after schema changes)
npx prisma generate

# Create migration
npx prisma migrate dev --name add_feature_x

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Open Prisma Studio (GUI for database)
npx prisma studio  # Visit: http://localhost:5555

# Seed database
npx prisma db seed

# Push schema without migration (dev only)
npx prisma db push
```

### Git Workflows

**Branch Naming:**
```
feature/brief-wizard-v2
fix/match-score-calculation
refactor/talent-card-component
docs/update-readme
chore/upgrade-dependencies
```

**Commit Messages:**
```bash
# Format: <type>: <description>

# Examples:
git commit -m "feat: add match score display to talent cards"
git commit -m "fix: resolve pod persistence issue in Safari"
git commit -m "refactor: extract talent filtering logic"
git commit -m "docs: update TECHNICAL_ARCHITECTURE.md"
git commit -m "chore: upgrade Next.js to 16.1.5"
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code restructuring (no behavior change)
- `docs`: Documentation only
- `style`: Formatting, whitespace, CSS
- `test`: Adding tests
- `chore`: Maintenance, dependencies

**Pull Request Workflow:**
```bash
# 1. Create feature branch
git checkout -b feature/my-feature

# 2. Make changes and commit
git add .
git commit -m "feat: add my feature"

# 3. Push to remote
git push origin feature/my-feature

# 4. Create PR on GitHub/GitLab
# 5. Request review
# 6. Address feedback
# 7. Merge when approved
```

---

## 🧪 Testing (When Implemented)

### Unit Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run specific test file
pnpm test src/lib/matching/match-score.test.ts
```

### E2E Tests (Playwright)

```bash
# Install browsers (first time only)
npx playwright install

# Run E2E tests
pnpm test:e2e

# Run E2E tests in UI mode
pnpm test:e2e --ui

# Run specific test
pnpm test:e2e tests/booking-flow.spec.ts
```

### Manual Testing Checklist

**Before Each PR:**
- [ ] Run on localhost:3000 and test all changes
- [ ] Check responsive design (375px, 768px, 1440px)
- [ ] Test keyboard navigation
- [ ] Check browser console for errors
- [ ] Verify no TypeScript errors (`pnpm type-check`)
- [ ] Test in Chrome, Safari, Firefox

**Before Production Deploy:**
- [ ] All tests pass
- [ ] Lighthouse score > 90 (performance, accessibility)
- [ ] No console errors or warnings
- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] Smoke test on staging environment

---

## 🎨 Code Style Guide

### TypeScript Conventions

**Naming:**
```typescript
// PascalCase for types, interfaces, components
type BookingRequest = { ... };
interface TalentCardProps { ... }
function TalentCard() { ... }

// camelCase for variables, functions
const matchScore = 9;
function computeMatchScore() { ... }

// SCREAMING_SNAKE_CASE for constants
const MAX_POD_SIZE = 10;
const API_BASE_URL = "https://api.creatorhive.io";
```

**Prefer Explicit Types:**
```typescript
// Good
function addToPod(talentId: string): void { ... }

// Avoid
function addToPod(talentId: any) { ... }
```

**Use Type Inference When Obvious:**
```typescript
// Good (type inferred)
const talents = curatedTalent.filter(t => t.followers > 50000);

// Unnecessary
const talents: CuratedTalent[] = curatedTalent.filter(t => t.followers > 50000);
```

### React Conventions

**Component Structure:**
```typescript
// 1. Imports
import { useState } from "react";
import { Button } from "@/components/ui/button";

// 2. Types
interface ComponentNameProps {
  prop1: string;
  prop2?: number;
}

// 3. Component
export function ComponentName({ prop1, prop2 = 0 }: ComponentNameProps) {
  // 4. Hooks
  const [state, setState] = useState<string>("");
  
  // 5. Handlers
  function handleClick() { ... }
  
  // 6. Effects
  useEffect(() => { ... }, []);
  
  // 7. Render
  return <div>...</div>;
}
```

**Prefer Named Exports:**
```typescript
// Good
export function TalentCard() { ... }

// Avoid
export default function TalentCard() { ... }
```

**Extract Complex Logic:**
```typescript
// Good
function useMatchScore(brief: BriefLite, talent: CuratedTalent) {
  return useMemo(() => computeMatchScore(brief, talent), [brief, talent]);
}

// Avoid (logic in JSX)
<span>{computeMatchScore(brief, talent).score}</span>
```

### CSS/Tailwind Conventions

**Order Classes:**
1. Layout (flex, grid, block)
2. Sizing (w-, h-, max-w-)
3. Spacing (p-, m-, gap-)
4. Typography (text-, font-, leading-)
5. Colors (bg-, text-, ring-)
6. Effects (shadow-, opacity-, transition)

```typescript
// Good
<div className="flex items-center gap-4 p-6 text-sm font-medium bg-white/5 ring-1 ring-white/10 transition">

// Avoid (random order)
<div className="bg-white/5 flex p-6 text-sm transition ring-1 gap-4 items-center font-medium ring-white/10">
```

**Use `cn()` for Conditional Classes:**
```typescript
import { cn } from "@/lib/utils";

<button className={cn(
  "base-classes",
  isActive && "active-classes",
  variant === "primary" ? "primary-classes" : "secondary-classes"
)}>
```

---

## 🏗️ Adding New Features

### Checklist

1. **Define Schema (if data-related)**
   - Update `src/lib/schemas/booking.ts` (Zod)
   - Update `prisma/schema.prisma` (Prisma)
   - Create migration: `npx prisma migrate dev`

2. **Create Components**
   - Create component file in appropriate directory
   - Define props interface
   - Implement UI with Tailwind
   - Add interactions (hover, click, etc.)

3. **Add Business Logic**
   - Extract complex logic to `src/lib/`
   - Write helper functions
   - Add validation

4. **Create API Endpoints (if needed)**
   - Create route in `src/app/api/`
   - Validate input with Zod
   - Implement CRUD operations
   - Return typed responses

5. **Update Routes/Pages**
   - Add new page in `src/app/`
   - Update navigation links
   - Add auth guards if needed

6. **Test**
   - Manual testing on localhost
   - Write unit tests (if complex logic)
   - Write E2E tests (if critical flow)

7. **Document**
   - Update relevant documentation files
   - Add JSDoc comments to functions
   - Update ROADMAP.md

### Example: Add New Brief Field

**Scenario:** Add "Preferred Talent Gender" field to brief

**1. Update Schema:**
```typescript
// src/lib/schemas/booking.ts
export const TalentGenderEnum = z.enum(["MALE", "FEMALE", "ANY"]);
export type TalentGender = z.infer<typeof TalentGenderEnum>;

export const BriefLiteSchema = z.object({
  // ... existing fields
  preferredGender: TalentGenderEnum.default("ANY"),
});
```

**2. Update Prisma:**
```prisma
// prisma/schema.prisma
enum TalentGender {
  MALE
  FEMALE
  ANY
}

model BookingRequest {
  // ... existing fields
  // briefSnapshot is JSON, so no change needed
}
```

**3. Update Wizard:**
```typescript
// src/components/booking/BriefLiteWizard.tsx
const [preferredGender, setPreferredGender] = useState<TalentGender>("ANY");

// Add to Step 2 or 3:
<div>
  <label>Preferred Talent Gender</label>
  <div className="flex gap-2">
    {["ANY", "MALE", "FEMALE"].map(gender => (
      <button 
        onClick={() => setPreferredGender(gender as TalentGender)}
        className={cn(
          "pill-base",
          preferredGender === gender && "pill-selected"
        )}
      >
        {gender}
      </button>
    ))}
  </div>
</div>

// Add to onComplete:
onComplete({ ...briefData, preferredGender });
```

**4. Update Match Scoring:**
```typescript
// src/lib/matching/match-score.ts
function scoreGenderFit(
  preferredGender: TalentGender,
  talentGender: string
): number {
  if (preferredGender === "ANY") return 100;
  if (preferredGender.toLowerCase() === talentGender.toLowerCase()) return 100;
  return 0;
}

// Add to weights and calculation
```

**5. Test:**
- Fill brief with all gender options
- Verify saved to database
- Check match scores reflect gender preference

---

## 🔒 Security Best Practices

### Authentication

**Always Check Auth:**
```typescript
// src/app/api/booking/request/route.ts
import { getServerSession } from "next-auth";

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  
  if (!session || session.user.role !== "AGENCY") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  // ... proceed
}
```

### Input Validation

**Never Trust User Input:**
```typescript
// src/app/api/booking/request/route.ts
const body = await req.json();
const result = BookingRequestCreateSchema.safeParse(body);

if (!result.success) {
  return NextResponse.json(
    { error: "Validation failed", details: result.error.issues },
    { status: 400 }
  );
}

const validated = result.data;  // Use this, not raw body
```

### SQL Injection Prevention

**Use Prisma (Never Raw SQL):**
```typescript
// Good (Prisma ORM)
const request = await prisma.bookingRequest.findUnique({
  where: { id: requestId },
});

// Avoid (Raw SQL vulnerable to injection)
const request = await prisma.$queryRaw`SELECT * FROM BookingRequest WHERE id = ${requestId}`;
```

### XSS Prevention

**React Auto-Escapes:**
```tsx
// Safe (React escapes automatically)
<div>{userInput}</div>

// Dangerous (only if absolutely necessary)
<div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
```

### Environment Variables

**Never Commit `.env.local`:**
```bash
# .gitignore (already included)
.env.local
.env.*.local
```

**Use `NEXT_PUBLIC_` for Client-Side:**
```bash
# Server-side only (safe)
STRIPE_SECRET_KEY="sk_test_..."

# Client-side (exposed in bundle)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

---

## 🚀 Deployment

### Vercel Deployment

**Initial Setup:**
1. Install Vercel CLI: `pnpm install -g vercel`
2. Login: `vercel login`
3. Link project: `vercel link`
4. Set environment variables: `vercel env add`

**Deploy to Production:**
```bash
# Deploy to production
vercel --prod

# Or push to main branch (auto-deploys)
git push origin main
```

**Environment Variables:**
- Set all variables in Vercel dashboard
- Production > Settings > Environment Variables
- Remember to click "Save" and redeploy

### Database Migrations

**Production Migration:**
```bash
# 1. Apply migrations to production database
DATABASE_URL="postgresql://prod-url" npx prisma migrate deploy

# 2. Generate client (happens automatically on Vercel)
npx prisma generate
```

**Rollback Plan:**
- Keep migration files in version control
- Test migrations on staging first
- Have database backups before migrating

---

## 📊 Monitoring & Debugging

### Logging

**Use Structured Logging:**
```typescript
// Good
console.log("[API] Booking request received:", { requestId, userId });

// Avoid
console.log("Got request");
```

**Log Levels:**
```typescript
console.log("[INFO] Normal operation");
console.warn("[WARN] Something unusual but handled");
console.error("[ERROR] Failure:", error);
```

### Error Handling

**Graceful Degradation:**
```typescript
try {
  const score = computeMatchScore(brief, talent);
  return score;
} catch (error) {
  console.error("[ERROR] Match scoring failed:", error);
  return { score: 5, rationale: "Unable to compute score" };  // Fallback
}
```

**User-Friendly Messages:**
```typescript
// Good
toast.error("Unable to save booking. Please try again.");

// Avoid
toast.error("Error: Network request failed with status 500");
```

### Performance Monitoring

**Vercel Analytics:**
- Automatically enabled for Vercel deployments
- View in Vercel dashboard > Analytics tab
- Track Core Web Vitals (LCP, FID, CLS)

**Future: Custom Metrics:**
```typescript
// Track booking completion time
const start = Date.now();
await submitBooking();
const duration = Date.now() - start;
analytics.track("booking_completed", { duration });
```

---

## 🆘 Troubleshooting

### Common Issues

**Issue: "Module not found" errors**
**Solution:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

**Issue: TypeScript errors after Prisma changes**
**Solution:**
```bash
npx prisma generate
# Restart TypeScript server in VS Code: Cmd+Shift+P > "Restart TS Server"
```

**Issue: Stale Next.js cache**
**Solution:**
```bash
rm -rf .next
pnpm dev
```

**Issue: Port 3000 already in use**
**Solution:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
# Or use different port
pnpm dev -p 3001
```

**Issue: Prisma Client not generated**
**Solution:**
```bash
npx prisma generate
# Ensure DATABASE_URL is set in .env.local
```

---

## 📚 Additional Resources

### Internal Docs
- See all `*.md` files in root directory
- Refer to code comments for implementation details

### External Resources
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Docs](https://react.dev/)

### Community
- Internal Slack/Discord (if exists)
- GitHub Issues for bug reports
- Weekly team syncs (if exists)

---

**Next Document:** Read `ROADMAP.md` to understand current state and next steps.
