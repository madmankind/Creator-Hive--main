# 📊 Creator Hive Analytics Stack — Final Setup

**Status:** You have a SOLID foundation. Here's what's already working + what to add.

---

## ✅ What You Already Have (PostHog)

**Installed & Active:**
- ✅ **PostHog session recording** — Watches user sessions with masked passwords
- ✅ **PostHog event capture** — Tracks page views, custom events
- ✅ **PostHog user identification** — Links events to user ID/email/role
- ✅ **Page leave tracking** — Knows when users abandon page

**PostHog Dashboard:** https://app.posthog.com

---

## 🎯 Three-Layer Complete Stack (You're 70% Done)

### **Layer 1: Product Analytics (PostHog) — ACTIVE ✅**
- **What it does:** Tracks user behavior, funnels, cohorts, retention
- **Already installed:** Yes
- **Session recording:** Yes (passwords masked)
- **User identification:** Yes (email, name, role)
- **Status:** Fully functional

**Next step:** Wire up custom events for key user actions

---

### **Layer 2: Heatmaps & Click Tracking (Hotjar) — JUST ADDED ✅**
- **What it does:** Click heatmaps, scroll depth, session replay
- **Already installed:** Yes (committed 5 mins ago)
- **Status:** Deploying to Vercel now

**Next step:** Verify it's working (check Hotjar dashboard in 5 minutes)

---

### **Layer 3: Conversion Tracking (Google Analytics 4) — NEEDS VERIFICATION**
- **What it does:** Visitor count, traffic source, conversion funnel
- **Status:** Partially installed; needs GA4 Measurement ID
- **Next step:** Get GA4 ID + add to `.env.local`

---

## 🚀 Quick Setup: Next 30 Minutes

### **Step 1: Get Your PostHog API Key** (Already have? Skip to Step 2)

1. Go to https://app.posthog.com
2. **Project Settings** → Copy **Project API Key** (starts with `phc_`)
3. Already in `.env.local`? Verify:
   ```bash
   grep POSTHOG /Users/ajil/creator-hive-next/.env.local
   ```

### **Step 2: Wire Up Custom Event Tracking**

PostHog is listening, but it's only catching page views by default. Add these custom events to track user actions:

**Create `src/lib/analytics.ts`:**

```typescript
import posthog from 'posthog-js';

export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (typeof window !== 'undefined' && posthog) {
    posthog.capture(eventName, properties || {});
  }
}

// Key events to track
export const analytics = {
  // Auth events
  authStarted: (method: string) => trackEvent('auth_started', { method }),
  authCompleted: (role: string) => trackEvent('auth_completed', { role }),
  authFailed: (reason: string) => trackEvent('auth_failed', { reason }),
  
  // Form events
  formStarted: (formName: string) => trackEvent('form_started', { form: formName }),
  formFieldFilled: (formName: string, field: string) => 
    trackEvent('form_field_filled', { form: formName, field }),
  formSubmitted: (formName: string) => trackEvent('form_submitted', { form: formName }),
  formAbandoned: (formName: string, lastField: string) => 
    trackEvent('form_abandoned', { form: formName, last_field: lastField }),
  
  // CTA events
  ctaClicked: (ctaName: string) => trackEvent('cta_clicked', { cta: ctaName }),
  
  // Page events
  scrollDepth: (percentage: number) => trackEvent('scroll_depth', { depth: percentage }),
};
```

**Usage in HiveAuthModal.tsx:**

```typescript
import { analytics } from '@/lib/analytics';

// When auth starts
const handleAuthStart = () => {
  analytics.authStarted('email_otp');
  // ... rest of logic
};

// When auth completes
const handleAuthSuccess = (userId: string) => {
  analytics.authCompleted('creator');
  // ... rest of logic
};

// When form is abandoned
const handleFormAbandon = () => {
  analytics.formAbandoned('signup', 'email_field');
};
```

### **Step 3: Verify PostHog is Capturing Events**

1. Go to https://app.posthog.com
2. **Insights** → **Recent events**
3. Should see your custom events appearing in real-time as you use the site

### **Step 4: Set Up Google Analytics 4** (If not done yet)

1. Go to https://analytics.google.com
2. Create property "Creator Hive" (if doesn't exist)
3. Copy **Measurement ID** (G-XXXXXXXXXX)
4. Add to `.env.local`:
   ```
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```
5. Add script to `src/app/layout.tsx`:
   ```tsx
   <Script
     src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
     strategy="afterInteractive"
   />
   <Script id="ga4-config" strategy="afterInteractive">{`
     window.dataLayer = window.dataLayer || [];
     function gtag(){dataLayer.push(arguments);}
     gtag('js', new Date());
     gtag('config', 'G-XXXXXXXXXX');
   `}</Script>
   ```

---

## 📊 What to Monitor (PostHog Dashboard)

### **1. Real-Time Events**
**Where:** Insights → Recent events

Watch for:
- `auth_started` → `auth_completed` (funnel)
- `form_abandoned` (where users drop off)
- Custom events you defined

### **2. Funnel: Sign-Up Flow**
**Where:** Insights → Funnels

Create funnel:
```
Step 1: auth_started
Step 2: form_field_filled (email)
Step 3: auth_completed
```

This shows exactly where users drop off.

### **3. Session Recording**
**Where:** Session Recordings → Live

Watch actual user sessions:
- See form errors they encounter
- Watch them struggle with UI
- Replay their journey

### **4. User Cohorts**
**Where:** Cohorts

Example cohorts:
- "Abandoned sign-up" (auth_started but never auth_completed)
- "Completed sign-up" (auth_completed = true)
- "From Google Ads" (utm_source = google)

---

## 🔥 Combined Power: PostHog + Hotjar + GA4

| Question | Tool | How |
|----------|------|-----|
| **Who visited today?** | GA4 | Real-time → Users |
| **Did they sign up?** | PostHog | Funnels → auth_completed |
| **Where did they click?** | Hotjar | Heatmap → Click density |
| **Why did they leave?** | Hotjar | Session replay → Watch them |
| **Cost per sign-up?** | GA4 + Google Ads | Conversions ÷ Ad spend |
| **Which form field breaks?** | PostHog + Hotjar | Events + Rage clicks |

---

## ✅ Complete Checklist

### **Today (Now)**
- [ ] Verify PostHog is running (`https://app.posthog.com` → Recent events should show page views)
- [ ] Verify Hotjar deployed (visit site → Hotjar dashboard shows your visit)
- [ ] Add custom event tracking to HiveAuthModal (copy `analytics.ts` above)

### **This Week**
- [ ] Watch one PostHog session recording
- [ ] Create PostHog funnel for sign-up flow
- [ ] Check Hotjar heatmap (which buttons are red/green?)
- [ ] Set up GA4 if not done yet

### **Next Week**
- [ ] Identify first funnel drop-off step (via PostHog)
- [ ] Watch session replays from users who abandoned (via Hotjar)
- [ ] Fix the biggest friction point

---

## 🎯 Expected Data In Real-Time

**PostHog (in 1 minute):**
```
User visits → Page view event
User clicks "Start booking" → auth_started event
User enters email → form_field_filled event
User completes OTP → auth_completed event ✅ CONVERSION
```

**Hotjar (in 1 minute):**
```
User clicks "Start booking" button → appears GREEN (clicked)
User scrolls to email field → shows on heatmap
User rage-clicks Submit button 3× → appears RED (broken?)
```

**GA4 (in 24 hours):**
```
1 visitor from Google Ads
1 conversion (sign-up)
Conversion rate: 100% (if only 1 visitor, this is noise)
```

---

## 🚨 Red Flags to Watch

| Signal | Means | Fix |
|--------|-------|-----|
| PostHog shows `auth_started` but not `auth_completed` | Form is breaking | Check console for errors; watch Hotjar replay |
| Hotjar shows RED clicks on Submit button | Button is broken | Check button CSS/onClick handler |
| GA4 shows 1,944 clicks but 0 conversions | Sign-ups not being tracked in GA4 | Verify GA4 conversion tag; may need server-side event |
| PostHog shows 0 events after page load | PostHog isn't initializing | Check `.env.local` for API key; check browser console |

---

## 💡 Why This Stack (3 Tools)?

**PostHog alone:**
- ✅ Captures events, user behavior, funnels
- ✅ Session recording (why users leave)
- ❌ NO heatmaps (WHERE they click)
- ❌ NO cost tracking (cost per sign-up)

**Hotjar alone:**
- ✅ Click heatmaps
- ✅ Scroll heatmaps
- ✅ Session replay
- ❌ NO funnel analysis
- ❌ NO cost tracking

**GA4 alone:**
- ✅ Visitor count
- ✅ Conversion tracking
- ✅ Cost per sign-up (linked to Google Ads)
- ❌ NO session replays
- ❌ NO heatmaps

**All three together:** Complete picture.

---

## 🔗 Dashboard Links

- **PostHog:** https://app.posthog.com
- **Hotjar:** https://dashboard.hotjar.com
- **Google Analytics 4:** https://analytics.google.com

---

## 📈 Weekly Monitoring (Every Monday)

1. **PostHog Funnel:** How many started vs completed sign-up?
2. **Hotjar Heatmap:** Any new dead-click zones?
3. **GA4:** Cost per sign-up = (ad spend) ÷ (sign-ups)
4. **PostHog Session:** Watch 1 user session; note friction points
5. **Action:** Fix the biggest bottleneck before next week

---

**You're now 90% done.** Add custom event tracking (30 mins), verify everything works (5 mins), and you have complete visibility into your user funnel.

Next: Stop guessing. Let the data tell you what's broken.
