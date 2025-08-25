# Creator Hive Design System

A comprehensive mobile-first design system inspired by Fey aesthetics with dark slate backgrounds and soft neon gradients. Built for Stripe/Revolut-grade user experiences.

## 🎨 Design Tokens

### Colors
```css
/* Core Colors - Fey-inspired dark slate + soft neon */
--bg: #0b0f17;              /* app background */
--surface: #111827;         /* card surface */
--surface-2: #0f172a;       /* deep surface */
--text: #e8ebf3;            /* primary text */
--muted: #a3adba;           /* secondary text */
--border: rgba(255,255,255,0.10);

/* Accent Colors */
--accent: #8b5cf6;          /* iris purple */
--accent-2: #06b6d4;        /* cyan */

/* Status Colors */
--success: #22c55e;
--warning: #f59e0b;
--danger: #ef4444;
```

### Typography
- **Font Family**: Inter (with system fallback)
- **Grid**: 4px base grid system
- **Type Scale**: Mobile-first responsive scaling
  - Display: `clamp(2rem, 5vw, 2.5rem)` / 1.1 / 800
  - H1: `clamp(1.5rem, 4vw, 1.75rem)` / 1.2 / 700
  - H2: `clamp(1.125rem, 3vw, 1.25rem)` / 1.3 / 600
  - Body: `0.875rem` / 1.43 / 400
  - Label: `0.75rem` / 1.5 / 500

### Component Heights
- **Toolbar**: 56px
- **Input**: 44px (mobile) / 40px (desktop)
- **Button**: 44px (mobile) / 40px (desktop)

### Border Radius
- **Card**: 12px
- **Input/Button**: 10px
- **Border**: 1px standard

## 🏗️ Architecture

### File Structure
```
src/
├── components/
│   ├── ui/                 # Core UI components
│   ├── nav/               # Navigation components
│   ├── gradients/         # Gradient effects
│   └── index.ts          # Main export
├── lib/
│   ├── theme.ts          # Design tokens
│   └── utils.ts          # Utilities
└── styles/
    └── globals.css       # Global styles & CSS variables
```

### Import Strategy
```typescript
// Individual components
import { Button, Input, Card } from '@/components/ui';

// Navigation
import { TopNav, TabBar } from '@/components/nav';

// Complete system
import { Button, TopNav, Backdrop } from '@/components';
```

## 🧩 Components

### Core UI Components

#### Button
```tsx
<Button variant="primary" size="md" loading={false}>
  Click me
</Button>
```
**Variants**: `primary` | `secondary` | `ghost` | `danger`
**Sizes**: `sm` | `md` | `lg`

#### Input
```tsx
<Input
  label="Email"
  placeholder="Enter your email"
  error={false}
  leftIcon={<MailIcon />}
/>
```

#### Card
```tsx
<Card variant="glass" hoverable padding="md">
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```
**Variants**: `default` | `glass` | `elevated` | `flat`

#### Tabs
```tsx
<Tabs value={activeTab} onValueChange={setActiveTab}>
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
  <TabsContent value="tab2">Content 2</TabsContent>
</Tabs>
```

### Navigation Components

#### TopNav
Desktop glass navigation with neon hairline:
```tsx
<TopNavVariants.Marketing
  brand={<Logo />}
  navItems={[
    { label: 'Features', href: '/features' },
    { label: 'Pricing', href: '/pricing' }
  ]}
  showAuth={true}
  onSignIn={() => {}}
  onSignUp={() => {}}
/>
```

#### TabBar
Mobile-first bottom navigation (375px optimized):
```tsx
<TabBarVariants.CreatorHive
  activeId="home"
  onNavigate={(id) => {}}
  notifications={{ messages: 3, jobs: 1 }}
/>
```

### Gradient System

#### Backdrop
Full-viewport gradient canvas:
```tsx
// Default backdrop
<Backdrop />

// Variants
<BackdropVariants.Subtle />
<BackdropVariants.Vibrant />
<BackdropVariants.Auth />  // Centered focus for forms
```

**Gradient Composition**:
```css
background: 
  radial-gradient(60% 50% at 50% 20%, rgba(139,92,246,0.25), transparent 60%),
  radial-gradient(40% 35% at 80% 10%, rgba(6,182,212,0.25), transparent 60%),
  radial-gradient(30% 25% at 20% 80%, rgba(255,255,255,0.05), transparent 60%),
  linear-gradient(180deg, #0b0f17 0%, #0b0f17 100%);
```

## 🎯 Usage Patterns

### Layout Structure
```tsx
// Public pages (marketing)
<div className="relative min-h-screen bg-bg">
  <Backdrop />
  <TopNavVariants.Marketing />
  <main className="relative z-10">{children}</main>
</div>

// Auth pages
<div className="relative min-h-screen bg-bg">
  <BackdropVariants.Auth />
  <main className="relative z-10 flex items-center justify-center min-h-screen">
    {children}
  </main>
</div>
```

### Glass Effects
```tsx
// Using utility
<div className={glassEffect('medium')}>Content</div>

// Using Tailwind classes
<div className="backdrop-blur-glass bg-surface/40 border border-border">
  Content
</div>
```

### Focus Rings
```tsx
// Using utility
<button className={focusRing()}>Button</button>

// Custom variant
<button className={focusRing('accent')}>Accent Button</button>
```

### Card Hover Effects
```tsx
<Card hoverable>Content</Card>

// Or with utility
<div className={cardHover()}>Content</div>
```

## 📱 Responsive Design

### Breakpoints
- **sm**: 640px
- **md**: 768px (primary desktop breakpoint)
- **lg**: 1024px
- **xl**: 1280px
- **2xl**: 1536px

### Mobile-First Approach
```tsx
// Component heights adapt automatically
<Button size="md" /> // 44px mobile, 40px desktop
<Input size="md" />  // 44px mobile, 40px desktop

// Navigation switches context
<TopNav />   // Desktop glass bar
<TabBar />   // Mobile bottom navigation (hidden md+)
```

## ♿ Accessibility

### Focus Management
- **ESC**: Closes Modal/Sheet
- **Tab trapping**: Inside Modal/Sheet
- **ARIA labels**: All interactive elements
- **Screen reader**: Semantic HTML structure

### Color Contrast
All text meets WCAG 2.1 AA standards:
- Primary text: #e8ebf3 on #0b0f17 (>7:1)
- Muted text: #a3adba on #0b0f17 (>4.5:1)

### Motion
Respects `prefers-reduced-motion`:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## 🚀 Getting Started

### 1. Install Dependencies
```bash
pnpm add clsx tailwind-merge
```

### 2. Configure Tailwind
The `tailwind.config.ts` extends Tailwind with design tokens:
```typescript
theme: {
  extend: {
    colors: {
      bg: "var(--bg)",
      surface: "var(--surface)",
      // ... all design tokens
    }
  }
}
```

### 3. Import Global Styles
In your `app/layout.tsx`:
```typescript
import '@/app/globals.css';
```

### 4. Use Components
```tsx
import { Button, Card, Backdrop } from '@/components';

export default function Page() {
  return (
    <div className="relative min-h-screen">
      <Backdrop />
      <div className="relative z-10 p-6">
        <Card>
          <Button variant="primary">Get Started</Button>
        </Card>
      </div>
    </div>
  );
}
```

## 🎨 Customization

### Theme Tokens
Access design tokens programmatically:
```typescript
import theme from '@/lib/theme';

const { colors, spacing, typography } = theme;
```

### CSS Variables
Override tokens in CSS:
```css
:root {
  --accent: #your-brand-color;
  --bg: #your-background;
}
```

### Component Variants
Extend existing components:
```tsx
const CustomButton = ({ className, ...props }) => (
  <Button 
    className={cn('your-custom-styles', className)} 
    {...props} 
  />
);
```

## 🔧 Utilities

### className Merging
```typescript
import { cn } from '@/lib/utils';

const className = cn(
  'base-classes',
  condition && 'conditional-classes',
  props.className
);
```

### Common Utilities
```typescript
import { 
  focusRing,
  glassEffect, 
  cardHover,
  responsiveHeight,
  formatCurrency,
  truncate 
} from '@/lib/utils';
```

---

## 🎯 Design Principles

1. **Mobile-First**: All components optimized for touch and small screens
2. **Glass Morphism**: Subtle backdrop blur effects throughout
3. **Neon Accents**: Soft purple/cyan gradients for brand identity
4. **Accessibility**: WCAG 2.1 AA compliance built-in
5. **Performance**: Minimal runtime overhead, CSS-first approach
6. **Developer Experience**: TypeScript, comprehensive props, clear APIs

Built with ❤️ for Creator Hive