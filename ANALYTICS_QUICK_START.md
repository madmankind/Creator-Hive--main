# 🎯 QUICK START: Website Tracking & Heatmaps

**TL;DR:** You have 3 things to set up to fully understand what's happening on your site.

---

## 🚀 PRIORITY 1: Google Analytics 4 (Visitor Tracking)

**What it does:** Counts visitors, tracks where they come from, sees if they sign up

**Time:** 10 minutes

**Steps:**

1. Go to https://analytics.google.com
2. Create property "Creator Hive" if doesn't exist
3. Add website data stream for `creatorhive.ae`
4. Copy **Measurement ID** (looks like `G-1234567890`)
5. Add to `.env.local`:
   ```
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-1234567890
   ```
6. Verify tracking is live:
   - Open your site
   - Go to GA4 → Real-time → Should see "1 active user"

**What you'll see:**
- How many people visited today
- Where they came from (Google Ads, organic, etc.)
- How long they stayed
- Did they sign up? (yes/no)

---

## 🔥 PRIORITY 2: Hotjar (Heatmaps & Session Recording)

**What it does:** Shows you exactly WHERE users click, HOW FAR they scroll, what they struggle with

**Time:** 15 minutes

**Steps:**

1. Go to https://www.hotjar.com → Sign up (free plan)
2. Add your site domain: `creatorhive.ae`
3. Copy **Hotjar ID** (8-digit number)
4. Add to `.env.local`:
   ```
   NEXT_PUBLIC_HOTJAR_ID=12345678
   ```
5. Add this to `src/app/layout.tsx` (in `<head>`):
   ```tsx
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
6. Restart dev server

**What you'll see:**
- **Click heatmap:** Red = nobody clicks here, Green = everyone clicks here
- **Scroll heatmap:** Shows how far down the page people scroll
- **Session recordings:** Watch actual users (anonymized) trying to sign up
- **Rage clicks:** Users clicking same button 3+ times = it's broken

---

## 🛡️ PRIORITY 3: Sentry (Error Tracking)

**What it does:** Automatically catches JavaScript errors before they crash your site

**Time:** 20 minutes

**Steps:**

1. Go to https://sentry.io → Sign up (free plan)
2. Create project for Next.js
3. Copy **Client DSN** and **Auth Token** from project settings
4. Add to `.env.local`:
   ```
   NEXT_PUBLIC_SENTRY_DSN=https://abc@def.ingest.sentry.io/123456
   SENTRY_DSN=https://abc_private@def.ingest.sentry.io/123456
   ```
5. Run:
   ```bash
   npm install @sentry/nextjs
   ```
6. Files are already created:
   - `sentry.client.config.ts` ✅
   - `sentry.server.config.ts` ✅
7. Restart dev server

**What you'll see:**
- Every JavaScript error on your site
- Stack trace showing exactly what line broke
- How many users hit the error
- Browser/device info

---

## 📊 How to Read Heatmaps (Hotjar)

**Click Heatmap:**
```
🔴 RED = Dead zone (users clicking but nothing happens)
   → Problem: Button looks clickable but isn't, or CTA is unclear

🟢 GREEN = Hot zone (everyone clicks here)
   → Good: CTA button is obvious, links are working

⚪ WHITE = Cold zone (users avoid this area)
   → Problem: Area is hidden below fold, or copy doesn't attract clicks
```

**Scroll Heatmap:**
```
🔴 RED = Users scroll here (heavy traffic through this section)

🔵 BLUE = Users drop off here (fewer make it this far)

⚪ GRAY = Very few see this section

Problem: If sign-up form is in GRAY area → Move it higher!
```

**Session Replay:**
- Watch 10–20 random user sessions (anonymized)
- Notice where they pause/get confused
- See form errors in real-time
- Watch rage clicks (user clicking same button repeatedly = bug)

---

## 🎯 What to Look For (First Week)

### **In Google Analytics (Real-time)**
```
Visitor arrives → Fills form → Submits → Gets redirected

If visitor DISAPPEARS after form submit → Something broke!
Check Sentry for errors.
```

### **In Hotjar Heatmap**
```
Issue: Users clicking "Start booking" but nothing happens
   → Button CSS is broken (display:none or pointer-events:none)
   → Form modal isn't opening
   → Check Sentry for JS errors

Issue: Nobody scrolls past first section
   → Page copy doesn't hook them
   → Mobile text is too small
   → Page is slow to load
```

### **In Sentry Dashboard**
```
Error: "Cannot read property 'gtag' of undefined"
   → Sign-up conversion tracking failed
   → Google Ads won't see conversions

Error: "Failed to fetch /api/auth/send-otp"
   → API is down or unreachable
   → Users can't sign up
```

---

## 🚨 Red Flags to Watch

| Signal | Means | Action |
|--------|-------|--------|
| Lots of users click form "Submit" button, but GA4 shows 0 sign-ups | Form submits but doesn't create account | Check Sentry for API errors |
| Hotjar shows 90% scroll depth, but sign-up rate is 0.1% | Landing page convinces users, but sign-up form is broken | Test sign-up on mobile |
| Hotjar shows red dead-click zone on "Start booking" button | Button looks clickable but isn't working | Check button CSS or onClick handler |
| Sentry shows "gtag is not defined" error | Google Ads conversion tracking failed | Verify GA4 script loaded |
| GA4 Real-time shows visitors but 0 in "Sessions" report | Tracking is broken or filtered | Check GA4 filters and view settings |

---

## 📈 Metrics to Track Weekly

Every Monday morning, check these 5 things:

1. **GA4 → Acquisition → Traffic Source**
   - How many visitors from Google Ads? (target: growing)
   - How many from organic? (target: growing over time)

2. **GA4 → Conversion** 
   - How many sign-ups? (target: >0.5% of clicks)
   - Cost per sign-up = Ad spend ÷ sign-ups

3. **Hotjar → Recent Heatmaps**
   - Any new dead-click zones?
   - Are users scrolling to CTA?
   - Any rage clicks indicating bugs?

4. **Hotjar → Top Session Recordings**
   - Watch 5 random sessions
   - Note where they get stuck

5. **Sentry → Issues**
   - Any new errors?
   - Are they increasing or decreasing?

---

## 🔗 Links You'll Need

- **Google Analytics:** https://analytics.google.com
- **Hotjar:** https://www.hotjar.com/sites
- **Sentry:** https://sentry.io/issues

---

## ✅ Checklist Before You're Done

- [ ] GA4 Measurement ID added to `.env.local`
- [ ] GA4 script installed in `layout.tsx`
- [ ] Verified: GA4 Real-time shows "1 active user" when you visit
- [ ] Hotjar ID added to `.env.local`
- [ ] Hotjar script installed in `layout.tsx`
- [ ] Verified: Hotjar dashboard shows your visit
- [ ] Sentry DSNs added to `.env.local`
- [ ] `npm install @sentry/nextjs` completed
- [ ] Dev server restarted
- [ ] Test: Visit your site → Check GA4 Real-time (should see you)
- [ ] Test: Fill form → Check GA4 (should record "sign_up" event)
- [ ] Test: Intentionally break something → Check Sentry (should catch error)

---

**You're done!** Now you have full visibility into who visits your site, where they get stuck, and when things break.

**Next:** Monitor daily. Adjust. Repeat.
