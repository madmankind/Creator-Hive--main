# Visual Flow Guide: Pod to Integrated Briefing Interface

## Before vs. After

### BEFORE: Disconnected Experience ❌

```
┌────────────────────────────────────────────┐
│         Talent Gallery (Scrollable)        │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  │
│  │Card 1│  │Card 2│  │Card 3│  │Card 4│  │
│  └──────┘  └──────┘  └──────┘  └──────┘  │
└────────────────────────────────────────────┘
                    ↓ Click "Set up pod"
         [Scroll down to new section]
                    ↓
┌────────────────────────────────────────────┐
│         Brief Wizard Section               │
│  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓   │
│  ┃   Brief Wizard Modal Popup       ┃   │
│  ┃   (Center of screen with blur)   ┃   │
│  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛   │
└────────────────────────────────────────────┘
                    ↓ Complete brief
         [Modal closes, new sheet opens]
                    ↓
┌────────────────────────────────────────────┐
│         Send Request Sheet                 │
│                    ┏━━━━━━━━━━━━━━━━━━━━┓ │
│                    ┃ Right-side sheet  ┃ │
│                    ┃ (Slides from side)┃ │
│                    ┗━━━━━━━━━━━━━━━━━━━━┛ │
└────────────────────────────────────────────┘

Issues:
• Context switching between sections
• Scrolling breaks immersion
• Separate modal and sheet feel disconnected
• User loses sight of pod during briefing
```

### AFTER: Integrated OS-Like Experience ✅

```
STATE 1: Collapsed Pod Tray
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┌────────────────────────────────────────────┐
│         Talent Gallery                     │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  │
│  │Card 1│  │Card 2│  │Card 3│  │Card 4│  │
│  └──────┘  └──────┘  └──────┘  └──────┘  │
│                                            │
└────────────────────────────────────────────┘
  ┌──────────────────────────────────────┐
  │ 🎯 Set up your campaign pod         │
  │ You've added 3 talents              │
  │ [Avatar] [Avatar] [Avatar]  [Setup ▼]│
  └──────────────────────────────────────┘
           ↑ Fixed at bottom


STATE 2: Expanded Pod (Brief Wizard)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┌────────────────────────────────────────────┐
│         Talent Gallery (Visible Above)     │
└────────────────────────────────────────────┘
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ ┌────────────────────────────────────┐  ┃
┃ │ 🎯 3 talents selected [Clear all]  │  ┃ ← Compact header
┃ └────────────────────────────────────┘  ┃
┃ ────────────────────────────────────────┃
┃                                          ┃
┃  Share your brief                        ┃
┃                                          ┃
┃  ┌──────────────────────────────────┐  ┃
┃  │ Brief Wizard (Pane 1/3)          │  ┃
┃  │                                  │  ┃
┃  │ • Campaign objective             │  ┃
┃  │ • Content outputs                │  ┃
┃  │                                  │  ┃
┃  │          [Next Step →]           │  ┃
┃  └──────────────────────────────────┘  ┃
┃                                          ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
     ↑ Same container, just expanded!


STATE 3: Expanded Pod (Review & Send)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ ┌────────────────────────────────────┐  ┃
┃ │ 🎯 3 talents selected [Clear all]  │  ┃
┃ └────────────────────────────────────┘  ┃
┃ ────────────────────────────────────────┃
┃                                          ┃
┃  Review & send                           ┃
┃                                          ┃
┃  ▼ Campaign Brief (collapsible)          ┃
┃                                          ┃
┃  Selected Talent (3)                     ┃
┃  [Avatar] Name - Role                    ┃
┃  [Avatar] Name - Role                    ┃
┃  [Avatar] Name - Role                    ┃
┃                                          ┃
┃  Company Name *                          ┃
┃  [________________]                      ┃
┃                                          ┃
┃  Email *                                 ┃
┃  [________________]                      ┃
┃                                          ┃
┃  [Back]  [Send Request →]                ┃
┃                                          ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
     ↑ Final step in same container!

Benefits:
✓ Everything happens in one place
✓ Smooth vertical expansion animation
✓ Pod context always visible in header
✓ No scrolling or modal switching
✓ Feels like native OS interface
```

## Animation Sequence

### Expansion (400ms)

```
Frame 0ms:   Pod Tray (120px height)
             ┌──────────────────┐
             │ Pod Tray         │
             └──────────────────┘

Frame 100ms: Beginning expansion
             ┌──────────────────┐
             │ Pod Header       │
             │                  │
             │ (expanding...)   │
             └──────────────────┘

Frame 200ms: Mid-expansion
             ┌──────────────────┐
             │ Compact Header   │
             │                  │
             │ Content fading   │
             │ in...            │
             │                  │
             └──────────────────┘

Frame 400ms: Fully expanded
             ┌──────────────────┐
             │ Compact Header   │
             ├──────────────────┤
             │                  │
             │ Brief Wizard     │
             │ Content          │
             │                  │
             │                  │
             └──────────────────┘
```

## Interaction States

### 1. Empty State (No Pod)
```
[No pod tray visible]
User browses talent gallery normally
```

### 2. Pod Building (1+ talents selected)
```
┌──────────────────────────────────────┐
│ 🎯 Set up your campaign pod         │
│ You've added 2 talents              │
│ [Avatar] [Avatar]    [Setup Pod ▼] │
└──────────────────────────────────────┘
                ↑
    Slides up from bottom with animation
```

### 3. Expanded - Brief Wizard
```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ Header shows pod summary            ┃
┃ ────────────────────────────────────┃
┃ Brief Wizard:                       ┃
┃   Pane 1 → Pane 2 → Pane 3         ┃
┃   (Horizontal carousel)             ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

### 4. Expanded - Review & Send
```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ Header shows pod summary            ┃
┃ ────────────────────────────────────┃
┃ Review & Send Form:                 ┃
┃   • Brief summary (collapsible)     ┃
┃   • Talent list                     ┃
┃   • Contact form                    ┃
┃   • [Back] [Send Request]           ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

## Responsive Behavior

### Desktop (>1024px)
- Pod width: `calc(100vw - 48px)` (24px margin each side)
- Max height: `min(800px, calc(100vh - 120px))`
- Comfortable padding: `p-6 md:p-8`

### Tablet (768px - 1024px)
- Pod width: `calc(100vw - 48px)`
- Height: `calc(100vh - 120px)`
- Padding: `p-6`

### Mobile (<768px)
- Pod width: `calc(100vw - 48px)`
- Height: `calc(100vh - 80px)` (less top margin)
- Padding: `p-4`
- Compact header with smaller avatars

## Z-Index Stack

```
Layer 5 (z-50): [Not used]
Layer 4 (z-40): [Not used]
Layer 3 (z-30): Pod Panel (collapsed & expanded)
Layer 2 (z-20): Talent cards
Layer 1 (z-10): Background elements
Layer 0 (z-0):  Page content
```

## Key Design Decisions

### Why Vertical Expansion?
- Natural metaphor: Container "grows" to show more content
- Maintains spatial relationship with bottom of screen
- Feels more stable than horizontal slide-in
- Works better on mobile (portrait orientation)

### Why No Background Blur?
- Keeps page content visible and contextual
- Faster rendering (no backdrop-filter)
- More native/OS-like feel
- Reduces visual "weight" of the interface

### Why Compact Pod Header?
- User needs to see their selection while filling brief
- Avatar stack is space-efficient and visually clear
- Quick access to "Clear all" for pod management
- Maintains sense of place in the flow

### Why Embedded Final Step?
- Eliminates jarring transition to separate sheet
- Completes the "single interface" narrative
- Faster perceived performance (no new component load)
- Smoother success/error handling (same container)

## Accessibility Considerations

### Keyboard Navigation
- Tab order flows naturally top to bottom
- Escape key collapses pod (when not submitting)
- Arrow keys work in carousel (if implemented)
- Focus trapped in expanded pod until closed

### Screen Readers
- Announces pod expansion state change
- Labels clearly indicate required fields
- Error messages linked to form fields
- Success/loading states announced

### Motion
- Respects `prefers-reduced-motion`
- Animations can be disabled without breaking UX
- Instant expand/collapse option available

## Performance Notes

### Optimizations
- AnimatePresence only mounts content when expanded
- Lazy loading of brief wizard panes
- Form validation debounced to reduce re-renders
- Avatar images use srcset for responsive loading

### Bundle Size Impact
- No new dependencies added
- Framer Motion already used elsewhere
- Shared components reduce duplication
- Tree-shakeable imports throughout

## Testing Scenarios

1. **Empty Pod State**
   - No pod visible initially
   - Pod appears when first talent added

2. **Building Pod**
   - Add talents one by one
   - Pod updates count dynamically
   - Remove talent from pod tray

3. **Expansion Trigger**
   - Click "Set up pod" button
   - Smooth animation observed
   - Header transforms to compact mode

4. **Brief Wizard Navigation**
   - Navigate through 3 panes
   - Back button returns to previous pane
   - Cancel collapses pod entirely

5. **Review & Send**
   - Brief summary displays correctly
   - Talents listed with avatars
   - Form validation works
   - Submit succeeds and collapses pod

6. **Edge Cases**
   - Clear pod mid-brief (should ask confirmation)
   - Add talent while in brief (should update header)
   - Network error on submit (shows inline error)
   - Navigate away and back (state preserved)
