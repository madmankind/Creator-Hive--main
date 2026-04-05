# 📊 Complete Analytics Stack Setup for Creator Hive

**Objective:** Track website visitors, identify conversion friction, visualize user behavior with heatmaps, and monitor real-time performance.

---

## 🎯 Analytics Tier (Recommended Stack)

### **Tier 1: Essential (Free/Freemium)**
- **Google Analytics 4** — Visitor tracking, events, conversions (already partly installed)
- **PostHog** — Product analytics, feature flags, session recording (already integrated)
- **Sentry** — Error tracking & performance monitoring

### **Tier 2: Heatmaps & Behavior (Freemium)**
- **Hotjar** — Click heatmaps, scroll heatmaps, session recordings
- **Smartlook** — Video session replay, heatmaps, crash reports (alternative to Hotjar)

### **Tier 3: Advanced Analytics (Paid, Optional)**
- **Segment** — Centralized event tracking, send to multiple tools
- **Amplitude** — Cohort analysis, retention funnels
- **LogRocket** — Session replay + frontend error tracking

---

## ✅ What You Already Have

**Status of Creator Hive analytics:**
- ✅ Google Ads tracking: AW-18060432585 (installed in layout.tsx)
- ✅ PostHog: Integrated (components/PostHogProvider.tsx)
- ❌ Heatmaps: NOT INSTALLED
- ❌ Session recording: NOT INSTALLED
- ❌ Comprehensive event tracking: PARTIAL (PostHog captures some)
- ⚠️ Google Analytics 4: NEEDS VERIFICATION

---

## 🔧 Implementation Plan (Priority Order)

### **PRIORITY 1: Fix & Verify Google Analytics 4** (1 hour)

Your GA4 is already referenced in the document ("Sign-up" as primary goal), but let's verify it's wired correctly.

**Step 1: Check if GA4 is installed**

Go to your site → DevTools → Network tab → Search for "google-analytics"

Expected: You should see requests to `https://www.google-analytics.com/` with a `g=` parameter (GA4 script).

**Step 2: Install/Verify GA4 tag**

If missing, add to `src/app/layout.tsx` (already done per your code):

```typescript
import Script from 'next/script'

export default function RootLayout() {
  return (
    <html>
      <head>
        {/* GA4 Script */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
          strategy="afterInteractive"
        />
        <Script id="ga4-config" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XXXXXXXXXX', {
              page_path: window.location.pathname,
              send_page_view: true,
            });
          `}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  )
}
```

**Get your GA4 ID:** https://analytics.google.com → Select Creator Hive property → Admin → Data Streams → Web → Measurement ID (looks like `G-XXXXXXXXXX`)

**Step 3: Track sign-up conversion in GA4** (ALREADY DONE but verify)

You added this to `HiveAuthModal.tsx`. GA4 also needs a server-side event. Add to your API route:

```typescript
// src/app/api/auth/verify-otp/route.ts
import { db } from "@/server/db";

export async function POST(req: Request) {
  // ... OTP verification logic ...
  
  // Log sign-up to server-side GA4
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (measurementId && user) {
    await fetch("https://www.google-analytics.com/mp/collect", {
      method: "POST",
      body: JSON.stringify({
        measurement_id: measurementId,
        api_secret: process.env.GA4_API_SECRET,
        events: [{
          name: "sign_up",
          params: {
            method: "email_otp",
            user_id: user.id,
            user_role: user.role,
          }
        }]
      })
    }).catch(console.error);
  }
}
```

Add to `.env.local`:
```
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
GA4_API_SECRET=xxxxx_from_google_analytics
```

---

### **PRIORITY 2: Install Heatmap Tool (Hotjar)** (30 mins)

Hotjar shows you exactly where users click, how far they scroll, and where they get stuck.

**Step 1: Sign up**
- Go to https://www.hotjar.com/pricing
- Choose **Free Plan** (up to 5,000 sessions/month)
- Create account, add Creator Hive domain

**Step 2: Get your Hotjar ID**
- Dashboard → Site settings → Copy "Hotjar Tracking Code ID" (8 digits)

**Step 3: Install Hotjar script**

Add to `src/app/layout.tsx`:

```typescript
<Script
  id="hotjar"
  strategy="afterInteractive"
  dangerouslySetInnerHTML={{
    __html: `
      (function(h,o,t,j,a,r){
        h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
        h._hjSettings={hjid:${process.env.NEXT_PUBLIC_HOTJAR_ID},hjsv:6};
        a=o.getElementsByTagName('head')[0];
        r=o.createElement('script');r.async=1;
        r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
        a.appendChild(r);
      })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
    `
  }}
/>
```

Add to `.env.local`:
```
NEXT_PUBLIC_HOTJAR_ID=1234567
```

**Step 4: Tag your pages**

Tell Hotjar to record on specific pages:

```typescript
// In src/components/Providers.tsx or HiveAuthModal.tsx
import { useEffect } from 'react';

export function HotjarTracking() {
  useEffect(() => {
    // Tag the current page
    if (window.hj) {
      window.hj('identify', {
        user_id: user?.id,
        user_role: user?.role,
        page_section: 'auth',
      });
    }
  }, []);
}
```

---

### **PRIORITY 3: Set Up Custom Event Tracking** (1 hour)

Track specific user actions beyond pageviews. Already partly done via PostHog, but add GA4 events for full coverage.

**Add to your form/button handlers:**

```typescript
// In HiveAuthModal.tsx or any form
function trackEvent(eventName: string, eventData: Record<string, any>) {
  // GA4
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, eventData);
  }
  
  // PostHog
  if (typeof window !== 'undefined' && (window as any).posthog) {
    (window as any).posthog.capture(eventName, eventData);
  }
}

// Usage example:
const handleAuthStart = () => {
  trackEvent('auth_started', {
    auth_method: 'email_otp',
    user_type: mode, // 'client' or 'talent'
  });
};

const handleAuthSuccess = (userId: string) => {
  trackEvent('auth_completed', {
    user_id: userId,
    time_to_signup: calculateTime(),
  });
};

const handleFormAbandon = (formName: string, fieldName: string) => {
  trackEvent('form_abandoned', {
    form: formName,
    last_field: fieldName,
  });
};
```

**Key events to track:**
- `form_start` — User clicked into first field
- `form_field_error` — Validation error on field
- `form_abandoned` — User left form without submitting
- `form_submitted` — Form successfully submitted
- `cta_clicked` — User clicked main CTA button
- `video_played` — If you have videos
- `scroll_depth` — User scrolled to bottom

---

### **PRIORITY 4: Set Up Conversion Funnels** (30 mins)

**In Google Analytics:**

1. Go to https://analytics.google.com
2. **Reports** → **Engagement** → **Funnels** (or create custom funnel)
3. Create funnel:
   - Step 1: Visited `/join` or `/`
   - Step 2: Clicked "Start booking" or "Apply"
   - Step 3: Entered email
   - Step 4: Completed OTP
   - Step 5: Account created (conversion goal)

This will show you exactly where users drop off.

---

### **PRIORITY 5: Set Up Error Tracking (Sentry)** (20 mins)

Catch bugs automatically so you know when your site breaks.

**Step 1: Sign up**
- Go to https://sentry.io/pricing
- Choose **Free Plan** (5k errors/month)
- Create account

**Step 2: Get your DSN**
- Project settings → Copy "DSN" (looks like `https://abc@def.ingest.sentry.io/123456`)

**Step 3: Install Sentry**

```bash
npm install @sentry/nextjs
```

**Create `sentry.client.config.ts`:**

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  integrations: [
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  environment: process.env.NODE_ENV,
});
```

**Create `sentry.server.config.ts`:**

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
});
```

**Update `src/app/layout.tsx`:**

```typescript
import * as Sentry from "@sentry/nextjs";

const RootLayout = Sentry.withProfiler(({ children }) => (
  <html>
    <head></head>
    <body>{children}</body>
  </html>
));

export default RootLayout;
```

Add to `.env.local`:
```
NEXT_PUBLIC_SENTRY_DSN=https://abc@def.ingest.sentry.io/123456
SENTRY_DSN=https://abc_private@def.ingest.sentry.io/123456
```

---

## 📊 Dashboards to Create

### **Dashboard 1: Real-Time Visitor Monitor**
**Tool:** Google Analytics Real-time

What to watch:
- Active users right now
- Traffic source (Google Ads, organic, direct)
- Pages being viewed
- Conversion events happening now

**How to access:** GA4 → Real-time

### **Dashboard 2: Sign-Up Funnel**
**Tool:** Google Analytics → Funnel Report

What to track:
- Step 1: Visited `/join` (landing page)
- Step 2: Viewed auth modal
- Step 3: Started auth (entered email)
- Step 4: OTP verified
- Step 5: Account created (CONVERSION)

**Expected:** With fix deployed, you should see progression (instead of 0 completing)

### **Dashboard 3: Heatmap Analysis**
**Tool:** Hotjar

What to look for:
- Red zones = dead clicks (users clicking on non-interactive areas)
- Green zones = popular clicks (buttons, links)
- Scroll heatmap = what % reach bottom of page
- Rage clicks = users clicking same spot 3+ times (form error)

### **Dashboard 4: Error Monitoring**
**Tool:** Sentry

What to track:
- JavaScript errors (red)
- API errors (orange)
- Console warnings (yellow)
- Performance issues (slow pages)

### **Dashboard 5: Ad Performance ROI**
**Tool:** Google Ads → Linked to GA4

What to measure:
- Cost per click (AED 0.09, your current rate)
- Cost per sign-up (calculate from GA4 conversions)
- Conversion rate (sign-ups / clicks %)
- ROAS if applicable (revenue / ad spend)

---

## 🚨 Critical Alerts to Set Up

**In Google Analytics:**

1. **Alert: Zero conversions for 24 hours**
   - Goal: Sign-up
   - Trigger: 0 completions in 24-hour period
   - Action: Email you

2. **Alert: Drop in traffic**
   - Trigger: 50% decrease from daily average
   - Action: Email you (site might be down)

3. **Alert: High bounce rate**
   - Trigger: >70% bounce rate
   - Action: Email (landing page issue?)

**In Sentry:**

1. **Alert: New error type**
   - Trigger: First occurrence of any error
   - Action: Slack notification

2. **Alert: Error spike**
   - Trigger: 10+ errors in 5 minutes
   - Action: Slack + email

---

## 📈 Weekly Reporting Checklist

Every Monday, check these:

- [ ] **Traffic:** How many unique visitors arrived? (target: growing)
- [ ] **Conversions:** How many sign-ups? (target: >0.5%)
- [ ] **Funnel:** Where do users drop off? (fix drop-off step)
- [ ] **Heatmap:** Which buttons are NOT being clicked? (redesign)
- [ ] **Errors:** Any new JavaScript errors? (fix before they compound)
- [ ] **Ad cost:** Cost per sign-up increasing or decreasing? (adjust targeting)

---

## 💡 What Each Tool Does

| Tool | Cost | Tracks | Best for |
|------|------|--------|----------|
| **GA4** | Free | Sessions, events, goals, funnels | Big picture, conversion tracking |
| **Hotjar** | Free/$ | Clicks, scrolls, replays, feedback | Finding UX friction, lost users |
| **PostHog** | Free/$ | Custom events, feature flags, cohorts | Product analytics, A/B testing |
| **Sentry** | Free/$ | Errors, performance, crashes | Bug detection, reliability |
| **Segment** | $$ | Centralized events → many tools | Scaling, multi-tool setup |
| **Smartlook** | Free/$ | Replays, heatmaps, crashes | Session replays + heatmaps |

---

## 🎯 Expected Outcomes (After Setup)

**In 48 hours:**
- See real visitor count (confirm traffic is real)
- Identify first heatmap dead zones
- Catch any JavaScript errors
- See first sign-up funnel progression

**In 1 week:**
- Identify biggest drop-off step in sign-up
- Know cost per sign-up (AED X per conversion)
- See which pages get most scroll (engagement)
- Know bounce rate by traffic source

**In 1 month:**
- Understand which pages convert best
- See seasonal trends (if any)
- Know if mobile experience is broken
- Know your true cost per acquisition (CPA)

---

## 🔗 Implementation Checklist

- [ ] Verify GA4 installed and tracking events
- [ ] Add GA4 server-side sign-up event
- [ ] Install Hotjar script
- [ ] Tag key pages in Hotjar
- [ ] Add custom event tracking function
- [ ] Create GA4 sign-up funnel
- [ ] Install Sentry for error tracking
- [ ] Set up alerts in GA4 (zero conversions, traffic drop, high bounce)
- [ ] Create weekly reporting dashboard
- [ ] Train yourself on reading heatmaps
- [ ] Set calendar reminder to review analytics weekly

---

**Start with GA4 + Hotjar.** That gives you 80% of what you need. Add Sentry for error safety. Everything else is optional refinement.
