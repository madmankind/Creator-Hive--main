# Creator Hive — Design System Guide

**Purpose:** Complete design system instructions with dos and don'ts for maintaining visual consistency and premium aesthetic.

**Last Updated:** 2026-01-12  
**Design Philosophy:** Fey-inspired dark, glass-morphic, premium agency-grade aesthetic

---

## 🎨 DESIGN PHILOSOPHY

### Core Principles
1. **Dark & Premium:** Deep black backgrounds with subtle glass-morphic surfaces
2. **Restraint & Clarity:** Minimal UI, maximum information density
3. **Subtle Accents:** Red (Track), Purple (Manage), Green (Pay) - never overwhelming
4. **Glass Morphism:** Translucent surfaces with backdrop blur
5. **Typography Hierarchy:** Clear text hierarchy with micro-labels and large values
6. **No Boxy Borders:** Very subtle borders (0.04-0.08 opacity), never stark white
7. **Layered Shadows:** Soft, layered shadows for depth
8. **Mesh Texture:** Subtle dot matrix overlay for premium feel

### Design Inspiration
- **Aesthetic:** Fey-style (dark, glass-morphic, premium)
- **Reference:** Top agencies (ITP Live, Hypebeast)
- **Goal:** Agency-grade campaign workflow tool

---

## 🎨 COLOR SYSTEM

### Primary Palette

#### Background Colors
```typescript
// ✅ DO: Use feyTokens for all colors
feyTokens.colors.base.black      // #07070A - Deepest black
feyTokens.colors.base.dark        // #0A0A0E - Primary dark
feyTokens.colors.base.darker       // #050507 - Darker variant
```

**✅ DO:**
- Use `feyTokens.colors.base.dark` for main backgrounds
- Use `feyTokens.colors.base.black` for deepest contrast
- Apply glass-morphic backgrounds: `rgba(255,255,255,0.02-0.03)`

**❌ DON'T:**
- Use pure black `#000000` (too harsh)
- Use bright white backgrounds
- Use arbitrary hex colors without tokens

---

#### Text Colors
```typescript
feyTokens.colors.text.primary    // rgba(255,255,255,0.95) - Main text
feyTokens.colors.text.secondary   // rgba(255,255,255,0.80) - Secondary
feyTokens.colors.text.muted       // rgba(255,255,255,0.50) - Muted
feyTokens.colors.text.label       // rgba(255,255,255,0.40) - Labels
```

**✅ DO:**
- Use `text.primary` for main content
- Use `text.secondary` for supporting text
- Use `text.label` for micro-labels (9-10px)
- Maintain clear hierarchy

**❌ DON'T:**
- Use pure white `#FFFFFF` (too bright)
- Use low contrast text (< 0.40 opacity)
- Mix opacity levels inconsistently

---

#### Accent Colors (Screen-Specific)
```typescript
// Track Screen (Red)
feyTokens.colors.red.glow         // #E5484D - Primary red
feyTokens.colors.red.pill          // #E5484D - Selected states
feyTokens.colors.red.pillGlow      // rgba(229,72,77,0.3) - Glow

// Manage Screen (Purple)
feyTokens.colors.status.info       // #8B5CF6 - Purple accent

// Pay Screen (Green)
feyTokens.colors.status.success    // #10B981 - Green accent
```

**✅ DO:**
- Use red accents for Track screen
- Use purple accents for Manage screen
- Use green accents for Pay screen
- Keep accents subtle (glow effects, not solid fills)

**❌ DON'T:**
- Mix accent colors across screens
- Use bright, saturated colors
- Overuse accent colors (restraint is key)

---

#### Status Colors
```typescript
feyTokens.colors.status.success   // #10B981 - Success/Approved
feyTokens.colors.status.warning    // #E3A23A - Warning/Pending
feyTokens.colors.status.error      // #E5484D - Error/Rejected
feyTokens.colors.status.info       // #8B5CF6 - Info/Neutral
```

**✅ DO:**
- Use status colors for badges, pills, indicators
- Keep status colors subtle (not neon bright)
- Use consistent status colors across the app

**❌ DON'T:**
- Use arbitrary colors for status
- Make status colors too bright
- Mix status colors with accent colors

---

### Chart Colors (Limited Palette)
```typescript
feyTokens.colors.chart.primary     // #E5484D - Red
feyTokens.colors.chart.secondary   // #E3A23A - Amber
feyTokens.colors.chart.tertiary    // #8B5CF6 - Purple
feyTokens.colors.chart.quaternary  // #10B981 - Green
```

**✅ DO:**
- Use only these 4 colors for charts
- Maintain consistency across all charts
- Use primary color for main metric

**❌ DON'T:**
- Add more colors to charts
- Use arbitrary colors
- Create rainbow charts

---

## 🖼️ SURFACES & GLASS MORPHISM

### FeySurface Component

**✅ DO: Use FeySurface for all panels/cards**
```tsx
import { FeySurface } from "@/components/campaigns/primitives/FeySurface";

<FeySurface variant="card" mesh={false} padding="lg">
  {/* Content */}
</FeySurface>
```

**Variants:**
- `panel` - Standard panel (subtle background)
- `card` - Card surface (slightly brighter)
- `modal` - Modal/drawer (darker, more opaque)
- `hero` - Hero sections (for charts, large areas)

**✅ DO:**
- Use `variant="card"` for most cards
- Use `variant="panel"` for sidebars, rails
- Use `variant="modal"` for dialogs, drawers
- Use `variant="hero"` for chart containers
- Add `mesh={true}` for chart containers and hero panels
- Use `padding="lg"` for content cards

**❌ DON'T:**
- Create custom glass surfaces (use FeySurface)
- Skip the mesh layer on chart containers
- Use bright white backgrounds
- Mix different surface styles

---

### Glass Properties

**Background:**
```typescript
// ✅ DO: Use these opacity levels
rgba(255,255,255,0.02)  // Panel background
rgba(255,255,255,0.03)  // Card background
rgba(255,255,255,0.95)  // Modal background (more opaque)
```

**Backdrop Blur:**
```typescript
backdrop-blur-xl  // Panels
backdrop-blur-lg  // Cards
```

**✅ DO:**
- Use backdrop blur for glass effect
- Keep backgrounds very subtle (0.02-0.03 opacity)
- Apply blur consistently

**❌ DON'T:**
- Use opaque backgrounds
- Skip backdrop blur
- Mix blur levels inconsistently

---

## 🔲 BORDERS & SHADOWS

### Border System

```typescript
feyTokens.borders.default  // rgba(255,255,255,0.04) - Default
feyTokens.borders.hover     // rgba(255,255,255,0.08) - Hover state
feyTokens.borders.active    // rgba(229,72,77,0.3) - Active/Selected
feyTokens.borders.subtle    // rgba(255,255,255,0.02) - Very subtle
```

**✅ DO:**
- Use `borders.default` for all default borders
- Use `borders.hover` for hover states
- Use `borders.active` for selected/active states (red glow)
- Keep borders very subtle (0.04 opacity default)

**❌ DON'T:**
- Use bright white borders (`rgba(255,255,255,1.0)`)
- Use borders with opacity > 0.10 (too visible)
- Skip borders on interactive elements
- Use arbitrary border colors

**Example:**
```tsx
// ✅ DO
<div
  style={{
    borderColor: feyTokens.borders.default,
  }}
  className="border hover:border-white/10"
/>

// ❌ DON'T
<div className="border border-white" />  // Too bright!
```

---

### Shadow System

```typescript
feyTokens.shadows.surface  // 0 4px 16px rgba(0,0,0,0.3)
feyTokens.shadows.card     // 0 8px 32px rgba(0,0,0,0.4)
feyTokens.shadows.hover    // 0 12px 48px rgba(0,0,0,0.5)
feyTokens.shadows.modal    // 0 16px 64px rgba(0,0,0,0.6)
feyTokens.shadows.glow     // 0 0 20px rgba(229,72,77,0.3) - Red glow
feyTokens.shadows.inner     // inset 0 1px 0 rgba(255,255,255,0.05)
```

**✅ DO:**
- Use `shadows.card` for cards
- Use `shadows.modal` for modals/drawers
- Use `shadows.glow` for active/selected states (red)
- Use `shadows.inner` for inset highlights (top edge)
- Keep shadows soft and layered

**❌ DON'T:**
- Use hard, sharp shadows
- Use shadows with high opacity
- Skip shadows on elevated surfaces
- Mix shadow styles inconsistently

---

## 📝 TYPOGRAPHY

### Font Family

**✅ DO:**
- Use Inter font everywhere (`font-sans`)
- Maintain consistent font family
- Use system font stack as fallback

**❌ DON'T:**
- Mix different font families
- Use decorative fonts
- Override font family without reason

---

### Typography Hierarchy

#### Page Title
```tsx
// ✅ DO
<h1 className="text-[24px] font-semibold" style={{ color: feyTokens.colors.text.primary }}>
  Page Title
</h1>
```

#### Section Title
```tsx
// ✅ DO
<h2 className="text-[16px] font-medium" style={{ color: feyTokens.colors.text.secondary }}>
  Section Title
</h2>
```

#### Card Title
```tsx
// ✅ DO
<h3 className="text-[14px] font-medium" style={{ color: feyTokens.colors.text.primary }}>
  Card Title
</h3>
```

#### Body Text
```tsx
// ✅ DO
<p className="text-[13px]" style={{ color: feyTokens.colors.text.secondary }}>
  Body text content
</p>
```

#### Micro Labels
```tsx
// ✅ DO
<label
  className="text-[9px] font-medium tracking-wider uppercase"
  style={{ color: feyTokens.colors.text.label }}
>
  LABEL
</label>
```

#### Values/Numbers
```tsx
// ✅ DO
<div
  className="text-2xl font-semibold tabular-nums"
  style={{ color: feyTokens.colors.text.primary }}
>
  1,234
</div>
```

**✅ DO:**
- Use `text-[9px]` or `text-[10px]` for micro-labels
- Use `tracking-wider` or `tracking-widest` for labels
- Use `uppercase` for micro-labels
- Use `tabular-nums` for numeric values (alignment)
- Right-align numeric values
- Maintain clear hierarchy

**❌ DON'T:**
- Use arbitrary font sizes
- Skip letter spacing on labels
- Mix font weights inconsistently
- Use low contrast text
- Left-align numeric values

---

### Typography Tokens

```typescript
feyTokens.typography.size.pageTitle    // 24px
feyTokens.typography.size.sectionTitle // 16px
feyTokens.typography.size.cardTitle    // 14px
feyTokens.typography.size.body         // 13px
feyTokens.typography.size.small         // 12px
feyTokens.typography.size.micro         // 11px
feyTokens.typography.size.label         // 10px
feyTokens.typography.size.tiny          // 9px

feyTokens.typography.weight.semibold    // 600
feyTokens.typography.weight.medium      // 500
feyTokens.typography.weight.regular      // 400

feyTokens.typography.tracking.tight      // -0.02em
feyTokens.typography.tracking.normal    // 0
feyTokens.typography.tracking.wide      // 0.08em
feyTokens.typography.tracking.wider     // 0.12em
```

---

## 📐 SPACING & LAYOUT

### Spacing System (8px Grid)

```typescript
feyTokens.spacing.xs   // 4px
feyTokens.spacing.sm   // 8px
feyTokens.spacing.md   // 16px
feyTokens.spacing.lg   // 24px
feyTokens.spacing.xl   // 32px
feyTokens.spacing["2xl"] // 48px
```

**✅ DO:**
- Use 8px grid for all spacing
- Use Tailwind spacing classes: `p-4`, `gap-4`, `mb-6`
- Maintain consistent spacing
- Use `feyTokens.spacing` when inline styles needed

**❌ DON'T:**
- Use arbitrary spacing values
- Mix spacing systems
- Use odd spacing values (5px, 7px, etc.)

---

### Border Radius

```typescript
feyTokens.radius.panel   // 18px - Panels, cards
feyTokens.radius.card     // 18px - Cards
feyTokens.radius.pill     // 9999px - Pills, badges
feyTokens.radius.button   // 12px - Buttons
```

**✅ DO:**
- Use `rounded-[18px]` for panels/cards
- Use `rounded-full` for pills/badges
- Use `rounded-xl` (12px) for buttons
- Maintain consistent radius

**❌ DON'T:**
- Use sharp corners (0px radius)
- Mix radius sizes inconsistently
- Use arbitrary radius values

---

## 🎭 MESH TEXTURE & OVERLAYS

### Mesh Layer (Dot Matrix)

**✅ DO: Apply mesh to chart containers and hero panels**
```tsx
<FeySurface variant="hero" mesh={true} meshVariant="chart" padding="lg">
  {/* Chart content */}
</FeySurface>
```

**Mesh Variants:**
- `chart` - Stronger in center, fade at edges (for charts)
- `panel` - Uniform with slight edge fade (for panels)
- `background` - Very subtle, uniform (for backgrounds)

**✅ DO:**
- Use `mesh={true}` on chart containers
- Use `mesh={true}` on hero panels
- Choose appropriate `meshVariant`
- Keep mesh subtle (not overwhelming)

**❌ DON'T:**
- Skip mesh on chart containers
- Overuse mesh (not on every card)
- Make mesh too visible
- Mix mesh variants inconsistently

---

## 🎯 COMPONENT PATTERNS

### Buttons

**✅ DO: Use Button component with variants**
```tsx
import { Button } from "@/components/ui/Button";

<Button variant="gradient">Primary Action</Button>
<Button variant="outline">Secondary Action</Button>
<Button variant="ghost">Tertiary Action</Button>
```

**Variants:**
- `gradient` - Primary actions (brand gradient)
- `outline` - Secondary actions (border only)
- `ghost` - Tertiary actions (hover only)
- `pod` - Purple glow (for pod-specific actions)

**✅ DO:**
- Use `variant="gradient"` for primary CTAs
- Use `variant="outline"` for secondary actions
- Use `variant="ghost"` for subtle actions
- Maintain consistent button hierarchy

**❌ DON'T:**
- Create custom button styles
- Mix button variants inconsistently
- Use too many button styles
- Skip hover states

---

### Cards

**✅ DO: Use FeySurface for cards**
```tsx
<FeySurface variant="card" padding="lg">
  <div className="space-y-4">
    <div className="text-[9px] font-medium tracking-wider uppercase" style={{ color: feyTokens.colors.text.label }}>
      LABEL
    </div>
    <div className="text-2xl font-semibold" style={{ color: feyTokens.colors.text.primary }}>
      Value
    </div>
  </div>
</FeySurface>
```

**✅ DO:**
- Use `FeySurface` for all cards
- Add proper padding (`padding="lg"`)
- Maintain consistent card structure
- Use proper typography hierarchy

**❌ DON'T:**
- Create custom card components
- Use bright backgrounds
- Skip borders/shadows
- Mix card styles

---

### Tables

**✅ DO: Use subtle borders and hover states**
```tsx
<tr
  className="border-b hover:bg-white/5 transition-colors"
  style={{ borderColor: feyTokens.borders.default }}
>
  <td style={{ color: feyTokens.colors.text.primary }}>Content</td>
</tr>
```

**✅ DO:**
- Use `borders.default` for table borders
- Add `hover:bg-white/5` for hover states
- Use proper text colors
- Right-align numeric columns

**❌ DON'T:**
- Use bright borders
- Skip hover states
- Use low contrast text
- Mix table styles

---

### Inputs

**✅ DO: Use glass-morphic inputs**
```tsx
<input
  className="bg-white/5 border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-white/20"
  style={{
    borderColor: feyTokens.borders.default,
    color: feyTokens.colors.text.primary,
  }}
/>
```

**✅ DO:**
- Use `bg-white/5` for input backgrounds
- Use `borders.default` for borders
- Add focus states with subtle ring
- Maintain consistent input styling

**❌ DON'T:**
- Use bright white backgrounds
- Skip focus states
- Use arbitrary colors
- Mix input styles

---

## 🎨 SCREEN-SPECIFIC ACCENTS

### Track Screen (Red)
```tsx
// ✅ DO: Use red accents
<div data-accent="track">
  {/* Red accent applied via CSS variable */}
</div>
```

**Accent Color:** `#E5484D` (red)

**✅ DO:**
- Use red for Track screen accents
- Apply via `data-accent="track"` attribute
- Keep accents subtle (glows, not fills)

**❌ DON'T:**
- Use other colors on Track screen
- Overuse red accents
- Make accents too bright

---

### Manage Screen (Purple)
```tsx
// ✅ DO: Use purple accents
<div data-accent="manage">
  {/* Purple accent applied via CSS variable */}
</div>
```

**Accent Color:** `#8B5CF6` (purple)

**✅ DO:**
- Use purple for Manage screen accents
- Apply via `data-accent="manage"` attribute
- Keep accents subtle

**❌ DON'T:**
- Use other colors on Manage screen
- Overuse purple accents

---

### Pay Screen (Green)
```tsx
// ✅ DO: Use green accents
<div data-accent="pay">
  {/* Green accent applied via CSS variable */}
</div>
```

**Accent Color:** `#10B981` (green)

**✅ DO:**
- Use green for Pay screen accents
- Apply via `data-accent="pay"` attribute
- Keep accents subtle

**❌ DON'T:**
- Use other colors on Pay screen
- Overuse green accents

---

## 🚫 CRITICAL DON'TS

### ❌ NEVER DO THESE

1. **Don't use bright white borders**
   ```tsx
   // ❌ DON'T
   <div className="border border-white" />
   
   // ✅ DO
   <div style={{ borderColor: feyTokens.borders.default }} />
   ```

2. **Don't use pure black or pure white**
   ```tsx
   // ❌ DON'T
   <div className="bg-black text-white" />
   
   // ✅ DO
   <div style={{ 
     background: feyTokens.colors.base.dark,
     color: feyTokens.colors.text.primary 
   }} />
   ```

3. **Don't skip the mesh layer on charts**
   ```tsx
   // ❌ DON'T
   <FeySurface variant="hero" mesh={false}>
     <Chart />
   </FeySurface>
   
   // ✅ DO
   <FeySurface variant="hero" mesh={true} meshVariant="chart">
     <Chart />
   </FeySurface>
   ```

4. **Don't use arbitrary colors**
   ```tsx
   // ❌ DON'T
   <div style={{ color: "#FF5733" }} />
   
   // ✅ DO
   <div style={{ color: feyTokens.colors.red.glow }} />
   ```

5. **Don't create custom glass surfaces**
   ```tsx
   // ❌ DON'T
   <div className="bg-white/10 backdrop-blur" />
   
   // ✅ DO
   <FeySurface variant="card" />
   ```

6. **Don't mix design systems**
   ```tsx
   // ❌ DON'T
   <div className="bg-blue-500 text-white" />  // Tailwind arbitrary colors
   
   // ✅ DO
   <div style={{ 
     background: feyTokens.colors.base.dark,
     color: feyTokens.colors.text.primary 
   }} />
   ```

7. **Don't use heavy shadows**
   ```tsx
   // ❌ DON'T
   <div className="shadow-2xl" />
   
   // ✅ DO
   <div style={{ boxShadow: feyTokens.shadows.card }} />
   ```

8. **Don't skip typography hierarchy**
   ```tsx
   // ❌ DON'T
   <div className="text-lg">Label</div>
   
   // ✅ DO
   <div className="text-[9px] font-medium tracking-wider uppercase" 
        style={{ color: feyTokens.colors.text.label }}>
     LABEL
   </div>
   ```

9. **Don't use low contrast text**
   ```tsx
   // ❌ DON'T
   <div style={{ color: "rgba(255,255,255,0.2)" }} />
   
   // ✅ DO
   <div style={{ color: feyTokens.colors.text.label }} />  // 0.40 opacity minimum
   ```

10. **Don't mix accent colors across screens**
    ```tsx
    // ❌ DON'T (on Track screen)
    <div style={{ color: feyTokens.colors.status.info }} />  // Purple on Track
    
    // ✅ DO (on Track screen)
    <div style={{ color: feyTokens.colors.red.glow }} />  // Red on Track
    ```

---

## ✅ BEST PRACTICES

### Component Structure

**✅ DO: Follow this pattern**
```tsx
"use client";

import { feyTokens } from "@/lib/fey-design-tokens";
import { FeySurface } from "@/components/campaigns/primitives/FeySurface";

export function MyComponent() {
  return (
    <FeySurface variant="card" padding="lg">
      {/* Label */}
      <div
        className="text-[9px] font-medium tracking-wider uppercase mb-2"
        style={{ color: feyTokens.colors.text.label }}
      >
        LABEL
      </div>
      
      {/* Content */}
      <div style={{ color: feyTokens.colors.text.primary }}>
        Content
      </div>
    </FeySurface>
  );
}
```

---

### Import Pattern

**✅ DO: Import tokens at the top**
```tsx
import { feyTokens } from "@/lib/fey-design-tokens";
import { FeySurface } from "@/components/campaigns/primitives/FeySurface";
import { cn } from "@/lib/utils";
```

---

### Styling Pattern

**✅ DO: Use inline styles for tokens, Tailwind for layout**
```tsx
<div
  className="flex items-center gap-4 p-6 rounded-[18px]"
  style={{
    background: feyTokens.glass.card.background,
    borderColor: feyTokens.borders.default,
    color: feyTokens.colors.text.primary,
  }}
>
```

**❌ DON'T: Mix arbitrary Tailwind colors with tokens**
```tsx
// ❌ DON'T
<div className="bg-white/10 text-white border-white/20" />
```

---

## 📚 QUICK REFERENCE

### Color Quick Reference
```typescript
// Backgrounds
feyTokens.colors.base.dark        // Main background
feyTokens.glass.card.background   // Card background

// Text
feyTokens.colors.text.primary     // Main text
feyTokens.colors.text.secondary   // Secondary text
feyTokens.colors.text.label       // Labels

// Accents
feyTokens.colors.red.glow         // Track (red)
feyTokens.colors.status.info      // Manage (purple)
feyTokens.colors.status.success   // Pay (green)

// Borders
feyTokens.borders.default         // Default border
feyTokens.borders.hover           // Hover border
feyTokens.borders.active          // Active border (red glow)
```

### Component Quick Reference
```tsx
// Surface
<FeySurface variant="card" mesh={false} padding="lg" />

// Button
<Button variant="gradient">Action</Button>

// Typography
<div className="text-[9px] font-medium tracking-wider uppercase" 
     style={{ color: feyTokens.colors.text.label }}>
  LABEL
</div>
```

---

## 🧪 TESTING DESIGN CONSISTENCY

### Visual Checklist

Before submitting code, verify:

- [ ] All colors use `feyTokens` (no arbitrary colors)
- [ ] All surfaces use `FeySurface` (no custom glass)
- [ ] Borders are subtle (0.04-0.08 opacity)
- [ ] Typography hierarchy is clear
- [ ] Mesh layer applied to charts
- [ ] Shadows are soft and layered
- [ ] Accent colors match screen context
- [ ] Spacing follows 8px grid
- [ ] Border radius is consistent (18px for cards)
- [ ] No bright white or pure black

---

## 📖 EXAMPLES

### Complete Card Example
```tsx
import { FeySurface } from "@/components/campaigns/primitives/FeySurface";
import { feyTokens } from "@/lib/fey-design-tokens";

export function KPICard({ label, value }: { label: string; value: string }) {
  return (
    <FeySurface variant="card" padding="lg">
      <div className="space-y-2">
        {/* Label */}
        <div
          className="text-[9px] font-medium tracking-wider uppercase"
          style={{ color: feyTokens.colors.text.label }}
        >
          {label}
        </div>
        
        {/* Value */}
        <div
          className="text-2xl font-semibold tabular-nums"
          style={{ color: feyTokens.colors.text.primary }}
        >
          {value}
        </div>
      </div>
    </FeySurface>
  );
}
```

### Table Row Example
```tsx
<tr
  className="border-b hover:bg-white/5 transition-colors"
  style={{ borderColor: feyTokens.borders.default }}
>
  <td style={{ color: feyTokens.colors.text.primary }}>Name</td>
  <td className="text-right tabular-nums" style={{ color: feyTokens.colors.text.secondary }}>
    1,234
  </td>
</tr>
```

### Input Example
```tsx
<input
  type="text"
  className="w-full px-4 py-2 rounded-xl focus:outline-none focus:ring-2 transition-colors"
  style={{
    background: feyTokens.glass.card.background,
    borderColor: feyTokens.borders.default,
    color: feyTokens.colors.text.primary,
  }}
  onFocus={(e) => {
    e.target.style.borderColor = feyTokens.borders.hover;
  }}
  onBlur={(e) => {
    e.target.style.borderColor = feyTokens.borders.default;
  }}
/>
```

---

## 🎯 SUMMARY

### Core Rules
1. **Always use `feyTokens`** - Never arbitrary colors
2. **Always use `FeySurface`** - Never custom glass surfaces
3. **Keep borders subtle** - 0.04-0.08 opacity maximum
4. **Maintain typography hierarchy** - Clear labels, large values
5. **Apply mesh to charts** - Premium feel
6. **Use screen-specific accents** - Red/Purple/Green
7. **Follow 8px grid** - Consistent spacing
8. **Soft shadows** - Layered, never harsh
9. **Restraint** - Less is more
10. **Consistency** - Same patterns everywhere

---

**Remember:** The goal is a premium, agency-grade aesthetic. Restraint, clarity, and consistency are key. When in doubt, look at existing components and follow their patterns.

---

**Last Updated:** 2026-01-12  
**Maintained By:** Design System Team  
**Questions?** Check existing components or refer to `docs/design-system.md`
