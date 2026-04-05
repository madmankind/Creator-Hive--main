# Creator Hive Integrations — Action Checklist

**Session Date:** April 5, 2026  
**Status:** Admin dashboard live, analytics stack partially integrated  
**Last Updated:** Git commit `60a87d9`

---

## ✅ COMPLETED THIS SESSION

### Admin Dashboard
- [x] Added Integrations tab to admin navigation
- [x] Created IntegrationsTab component with integration status cards
- [x] Deployed to production (Vercel)
- [x] Git commits: 2 (admin dashboard + session summary)

### Google Ads Campaign
- [x] Diagnosed zero-conversion problem
- [x] Fixed conversion pixel (sign-up was not being tracked)
- [x] Added gtag event in HiveAuthModal.tsx
- [x] Git commit: `f530fef`

### Analytics Infrastructure
- [x] Verified PostHog is installed and running
- [x] Verified Hotjar is installed (script in layout.tsx)
- [x] Created comprehensive setup guide (482 lines)
- [x] Created setup scripts (bash)
- [x] Git commits: 2 (Hotjar + PostHog)

---

## 🔴 URGENT (Complete within 24h)

### [ ] Remove Google Ads Campaign End Date
**Why:** Campaign set to expire today (April 5 at 11:59 PM GST). Performance Max needs 7–14 days to learn.  
**Steps:**
1. Go to https://ads.google.com → Account: 736-144-4849
2. Find "Creator Hive" campaign
3. Click Settings
4. Delete the "End date" field
5. Save and publish

**Impact:** Campaign will continue running and collecting conversion data

---

### [ ] Test Sign-Up Flow on Mobile
**Why:** 1,944 clicks → 0 conversions indicates mobile UX friction  
**Steps:**
1. Open https://creatorhive.ae on iPhone and Android
2. Navigate to "/join" or click "Start booking"
3. Fill out signup form
4. Watch for errors or friction points
5. Check Hotjar recordings for session patterns

**Tools to Use:**
- Hotjar: https://dashboard.hotjar.com → view session recordings
- Browser DevTools: Check console for JavaScript errors
- Network tab: Look for failed API calls

**Report Issues:**
- Screenshot + URL of friction point
- Note: mobile device type and OS version
- Add to GitHub issue for prioritization

---

## 🟠 HIGH PRIORITY (48–72h)

### [ ] Complete Sentry Setup
**Why:** Error tracking is critical for production debugging  
**Steps:**
1. Go to https://sentry.io → Project Settings
2. Find Client Keys (DSN)
3. Copy NEXT_PUBLIC_SENTRY_DSN and SENTRY_DSN values
4. Open `.env.local` and add:
   ```
   NEXT_PUBLIC_SENTRY_DSN=https://abc@def.ingest.sentry.io/123456
   SENTRY_DSN=https://abc_private@def.ingest.sentry.io/123456
   ```
5. Run: `npm install @sentry/nextjs`
6. Restart: `npm run dev`
7. Verify in Sentry dashboard: should see "First event received"

**Account Details:**
- Organization: `creator-hive-fze`
- Project: `nextjs`
- Trial: 14 days (expires ~April 19)

---

### [ ] Setup Google Analytics 4
**Why:** Track visitor behavior and conversion funnels  
**Steps:**
1. Go to https://analytics.google.com
2. Property: Creator Hive
3. Find Measurement ID (starts with "G-")
4. Add to `.env.local`: `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX`
5. Restart: `npm run dev`
6. Verify in GA4 dashboard: should see real-time traffic

**Check List:**
- [ ] Real-time users showing in dashboard
- [ ] Pages appearing in Pages report
- [ ] Events captured (if custom event code added)

---

### [ ] Restart Dev Server
**Why:** Environment variables are loaded at startup  
**Steps:**
```bash
cd /Users/ajil/creator-hive-next
npm run dev
```
**Verify:** http://localhost:3000 loads without errors

---

### [ ] Verify All Integrations
**Steps by tool:**

**PostHog:**
- [ ] Go to https://app.posthog.com
- [ ] Select project "Creator Hive"
- [ ] Click Recent events
- [ ] Should see events like: `$pageview`, `signup_started`, etc.

**Hotjar:**
- [ ] Go to https://dashboard.hotjar.com
- [ ] Select "Creator Hive"
- [ ] Click "Recordings"
- [ ] Should show recent session recordings
- [ ] Check heatmaps for scroll depth and clicks

**Sentry:**
- [ ] Go to https://sentry.io
- [ ] Select organization: creator-hive-fze
- [ ] Click project: nextjs
- [ ] Should show "First event received" (or recent events if errors occurred)

**Google Analytics 4:**
- [ ] Go to https://analytics.google.com
- [ ] Select property: Creator Hive
- [ ] Click "Realtime"
- [ ] Should show current active users
- [ ] Go to "Pages" report
- [ ] Should show visited pages

---

## 🟡 MEDIUM PRIORITY (Week 1–2)

### [ ] Integrate Custom Event Tracking
**Why:** Custom events enable funnel analysis and behavior tracking  
**Files to Update:**
1. Import `analytics` in components:
   ```typescript
   import { analytics } from '@/lib/analytics';
   ```

2. Add events to auth flow:
   ```typescript
   analytics.auth.started('email_otp');
   analytics.auth.completed('email_otp');
   ```

3. Add events to signup form:
   ```typescript
   analytics.form.started('signup_form');
   analytics.form.field_filled('signup_form', 'email');
   analytics.form.submitted('signup_form');
   ```

4. Add events to booking flow:
   ```typescript
   analytics.cta.clicked('book_talent');
   analytics.talent.viewed(talentId);
   analytics.booking.created(bookingId);
   ```

**Reference:** `/src/lib/analytics.ts` — 153 lines with full event categories

---

### [ ] Create PostHog Funnels
**Steps:**
1. https://app.posthog.com → Insights
2. Click "Funnels"
3. Create funnel: `auth_started` → `form_field_filled` → `auth_completed`
4. Create funnel: `campaign_brief_viewed` → `talent_selected` → `booking_confirmed`
5. Save and add to dashboard

**Expected Metrics:**
- Signup funnel: Should drop off at mobile (if UX issue)
- Booking funnel: Should show completion rate

---

### [ ] Review Hotjar Sessions
**Steps:**
1. https://dashboard.hotjar.com → Recordings
2. Filter: last 7 days, device type = Mobile
3. Watch 10–20 sessions
4. Take notes on:
   - Form field friction (autocomplete issues, validation delays)
   - Button click targets (too small/hard to tap)
   - Scroll behavior (is form above the fold?)
   - Exit points (where do users abandon?)

**Output:** Create GitHub issue with UX recommendations

---

### [ ] Monitor Google Ads Campaign
**Steps:**
1. https://ads.google.com → Creator Hive campaign
2. Watch metrics daily for 7–14 days:
   - Impressions (should stabilize)
   - Clicks (should stabilize)
   - Conversions (should start appearing once signup fix is live)
   - Cost per conversion (once conversions appear)

3. If conversions still zero after 72h with mobile fix:
   - Check Google Ads conversion tag is firing (use Tag Assistant)
   - Verify landing page is correct
   - Consider A/B test different landing pages

---

## 📊 Metrics to Track

### Week 1 Goals
- [ ] Sentry: 0 critical errors in 48h (baseline)
- [ ] PostHog: ≥10 sign-up events
- [ ] Hotjar: ≥5 mobile session recordings
- [ ] GA4: ≥100 real-time active users
- [ ] Google Ads: ≥1 conversion (after mobile fix)

### Week 2 Goals
- [ ] Conversion funnel: ≥5% sign-up rate (clicks → signups)
- [ ] Booking funnel: ≥30% completion rate (brief → booking)
- [ ] Sentry: <5 errors per day
- [ ] Mobile UX improvements identified in Hotjar

---

## 📞 Resources

| Tool | URL | Purpose |
|------|-----|---------|
| Sentry | https://sentry.io | Error tracking |
| PostHog | https://app.posthog.com | Analytics |
| Hotjar | https://dashboard.hotjar.com | Heatmaps & replays |
| GA4 | https://analytics.google.com | Traffic & conversions |
| Google Ads | https://ads.google.com | Campaign management |
| Admin Dashboard | https://creatorhive.ae/admin | Integrations status |
| GitHub | https://github.com/madmankind/Creator-Hive--main | Code commits |
| Vercel | https://vercel.com | Deployments |

---

## 🔧 Quick Commands

```bash
# Navigate to project
cd /Users/ajil/creator-hive-next

# Restart dev server (after .env.local changes)
npm run dev

# Build for production
npm run build

# Push commits to GitHub
git push origin main

# View logs (Vercel)
npx vercel logs

# Check TypeScript
npx tsc --noEmit 2>&1 | grep "error TS"
```

---

## 📝 Notes

- **Google Ads Learning Phase:** Performance Max requires 7–14 days to optimize. Don't pause the campaign; let it run.
- **Mobile Priority:** The zero-conversion issue is likely mobile-related. Hotjar will be critical for diagnosis.
- **Sentry Trial:** Expires ~April 19. Consider upgrading to paid plan if errors exceed free tier limits.
- **Custom Events:** Tracking should be added incrementally—don't try to instrument everything at once.
- **Data Privacy:** PostHog and Hotjar already have `maskAllInputs: true` configured. Password fields are protected.

---

## ✉️ Next Session Handoff

Key points for next team member:
1. **Google Ads campaign may still be expired** — check before debugging zero conversions
2. **Mobile UX testing is critical** — use Hotjar recordings to identify friction
3. **Sentry setup incomplete** — manual DSN entry required
4. **Custom event tracking partially done** — analytics.ts created but not integrated everywhere
5. **PostHog & Hotjar already live** — no setup needed, just review data

**Files to Reference:**
- `SESSION_SUMMARY_2026_04_05.md` — comprehensive overview
- `ANALYTICS_SETUP_GUIDE.md` — detailed setup instructions (482 lines)
- `.env.local` — add Sentry & GA4 keys here
