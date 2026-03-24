# Creator Hive Design System (Fey-Inspired)

## Overview

This design system provides a unified, Fey-inspired aesthetic for the Campaign Command Center. All components should use these tokens to maintain visual consistency.

## Design Tokens

### Location
`src/lib/fey-design-tokens.ts`

### Usage
```typescript
import { feyTokens } from "@/lib/fey-design-tokens";

// Colors
feyTokens.colors.text.primary
feyTokens.colors.red.glow
feyTokens.colors.status.success

// Borders
feyTokens.borders.default  // rgba(255,255,255,0.04)
feyTokens.borders.hover    // rgba(255,255,255,0.08)
feyTokens.borders.active   // rgba(229,72,77,0.3)

// Shadows
feyTokens.shadows.card
feyTokens.shadows.modal
feyTokens.shadows.glow

// Typography
feyTokens.typography.size.label  // 10px
feyTokens.typography.tracking.wide  // 0.08em
```

## Mesh Layer (Dotted Texture)

### Component
`FeySurface` with `mesh={true}` prop

### Variants
- `chart` - For chart containers (stronger in center, fade at edges)
- `panel` - For panels (uniform with slight edge fade)
- `background` - For page backgrounds (very subtle, uniform)

### Usage
```tsx
<FeySurface variant="hero" mesh={true} meshVariant="chart">
  {/* Content */}
</FeySurface>
```

### Manual Application
```tsx
import { FeyMeshLayer } from "@/components/campaigns/primitives/FeyMeshLayer";

<FeyMeshLayer intensity="medium" variant="chart">
  <div>Your content</div>
</FeyMeshLayer>
```

## Surface Components

### FeySurface
Base glass panel with optional mesh overlay.

**Props:**
- `variant`: "panel" | "card" | "modal" | "hero"
- `mesh`: boolean (enables mesh overlay)
- `meshVariant`: "chart" | "panel" | "background"
- `overlay`: boolean (legacy overlay, use `mesh` instead)
- `padding`: "none" | "sm" | "md" | "lg"
- `interactive`: boolean (adds hover states)

### GlassCard
Legacy component - use `FeySurface` instead.

### PillSegment
Fey-style segmented control with pressed-in effect.

**Props:**
- `options`: Array<{ value: string; label: string }>
- `value`: string
- `onChange`: (value: string) => void
- `size`: "sm" | "md"

## Typography Hierarchy

### Labels
- Size: `text-[9px]` or `feyTokens.typography.size.tiny`
- Weight: `font-medium`
- Tracking: `tracking-wider` or `feyTokens.typography.tracking.wider`
- Color: `feyTokens.colors.text.label`

### Body Text
- Size: `text-xs` or `text-sm`
- Weight: `font-regular` or `font-medium`
- Color: `feyTokens.colors.text.secondary`

### Values/Numbers
- Size: `text-xl` or `text-2xl`
- Weight: `font-semibold`
- Color: `feyTokens.colors.text.primary`
- Use `tabular-nums` for alignment

## Borders & Shadows

### Borders
- Default: `rgba(255,255,255,0.04)` - Very subtle
- Hover: `rgba(255,255,255,0.08)` - Slightly brighter
- Active: `rgba(229,72,77,0.3)` - Red glow for selected states

### Shadows
- Card: Soft, layered shadow
- Modal: Deeper shadow for overlays
- Glow: Red accent glow for active states

## Do's and Don'ts

### ✅ Do
- Use `FeySurface` for all panels/cards
- Apply `mesh={true}` to chart containers and hero panels
- Use `feyTokens` for all colors, borders, shadows
- Right-align numeric values with `tabular-nums`
- Use uppercase micro-labels with tracking
- Keep borders very subtle (0.04 opacity default)

### ❌ Don't
- Don't use bright white borders (use 0.04-0.08 opacity)
- Don't skip the mesh layer on chart containers
- Don't use arbitrary colors (use `feyTokens.colors`)
- Don't use heavy shadows (keep them soft and layered)
- Don't mix design systems (stick to Fey tokens)

## Examples

### Chart Container
```tsx
<FeySurface variant="hero" mesh={true} meshVariant="chart" padding="lg">
  <ResponsiveContainer>
    {/* Chart */}
  </ResponsiveContainer>
</FeySurface>
```

### KPI Card
```tsx
<FeySurface variant="card" mesh={false} padding="lg">
  <div style={{ color: feyTokens.colors.text.label }} className="text-[9px]">
    Label
  </div>
  <div style={{ color: feyTokens.colors.text.primary }} className="text-2xl">
    Value
  </div>
</FeySurface>
```

### Table Row
```tsx
<tr
  className="border-b hover:bg-white/5 hover:border-white/10"
  style={{ borderColor: feyTokens.borders.default }}
>
  {/* Cells */}
</tr>
```






