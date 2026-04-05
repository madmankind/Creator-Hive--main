# 📱 Mobile Landing Page Testing Guide

**Objective:** Debug why 1,944 clicks → 0 sign-ups  
**Most Likely Issue:** Mobile form UX is broken

---

## Step 1: Open on iPhone/Mobile Device

1. **Go to:** `https://creatorhive.ae/`
2. **Click:** "Start booking talent" button
3. **On mobile, you should see:** Modal dialog with two options:
   - "I'm a brand/agency looking to book"
   - "I'm a creator"

---

## Step 2: Try Signing Up (Talent Path)

1. Click **"I'm a creator"**
2. You should see:
   - Email input field
   - "Continue with Google" button
   - "Continue with OTP" button
3. **Enter test email:** `test@example.com`
4. Click **"Continue with Credentials"** (or OTP path)

**Check for problems:**
- [ ] Form inputs are readable (not tiny text)
- [ ] Buttons are clickable (not too close together)
- [ ] No overflow/horizontal scroll needed
- [ ] Modal doesn't get cut off at bottom
- [ ] Keyboard doesn't hide the form

---

## Step 3: Verify Form Submission Works

1. After email entry, click "Next"
2. You should see **OTP verification** screen
3. Check:
   - [ ] OTP input fields are visible
   - [ ] Submit button works
   - [ ] No errors in console (F12 → Console tab)

---

## Step 4: Check Browser Console for Errors

1. Open **Developer Tools** (F12 on desktop, or Safari inspector on iPhone)
2. Go to **Console** tab
3. Look for red error messages
4. **Common issues:**
   - `Failed to fetch /api/auth/...` — API not reachable
   - `Cannot read property of undefined` — JavaScript error
   - `gtag is not defined` — Tracking code failed to load

---

## Step 5: Test Google Ads Click Simulation

1. From Google Ads, copy your **landing page URL**
2. Add this to the URL: `?utm_source=google&utm_medium=cpc&gclid=test`
3. Open on mobile
4. Try sign-up flow
5. **Check:** Does form work with ad parameters in URL?

---

## Step 6: Monitor Network Requests

In **Developer Tools → Network tab:**
1. Try to sign up
2. Watch for requests:
   - `POST /api/auth/send-otp` → Should return 200
   - `POST /api/auth/verify-otp` → Should return 200
   - `GET /api/auth/session` → Should return user data
3. **Red requests = API failures**

---

## Common Mobile Issues (Check List)

- [ ] **Form too large** → Can't see all fields on screen
- [ ] **Button too small** → Hard to tap
- [ ] **Keyboard covers input** → Can't see what you're typing
- [ ] **No spacing** → Elements too cramped
- [ ] **Text too small** → Hard to read
- [ ] **API timeouts** → Network calls fail
- [ ] **JavaScript errors** → Form breaks silently
- [ ] **Missing safe area** → Content behind notch/home indicator (iOS)

---

## What to Test

| User Action | Expected Result | ❌ If Fails |
|---|---|---|
| Click "Start booking talent" | Modal opens, centered, readable | Form inaccessible |
| Select "I'm a creator" | Auth dialog shown | Page jumps/crashes |
| Enter email | Input accepts text | Keyboard blocks form |
| Click "Continue" | OTP screen appears | Button doesn't respond |
| Enter OTP | Session created, redirect | Sign-up fails silently |
| Check console | No red errors | JavaScript broke |

---

## If You Find Issues

### **Issue: Form is tiny/unreadable on mobile**
→ Check: `HiveAuthModal.tsx` → Check `width`, `max-width`, `font-size` properties

### **Issue: Button doesn't work**
→ Check: Console for JS errors; test on desktop to isolate

### **Issue: Keyboard hides input**
→ Check: `useIsMobile()` hook; may need `scroll-into-view` behavior

### **Issue: API returns 500 error**
→ Check: Vercel deployment logs for backend errors

---

## Quick Validation Checklist

- [ ] Can see form on iPhone without scrolling (mostly)
- [ ] Can type in email field
- [ ] Button is big enough to tap
- [ ] No red errors in console
- [ ] OTP screen appears after email entry
- [ ] Can enter OTP digits
- [ ] Sign-up completes (redirects to onboarding)
- [ ] No white/blank screens

**If ALL checks pass:** Form works; problem is ad traffic quality or landing page message.  
**If ANY check fails:** You found the bug! Fix it and retest.

---

## After Testing

1. **If form works:** Problem is likely landing page copy/value prop. Users click but don't see value → bounce.
2. **If form breaks:** Fix the bug and redeploy.
3. **After fix:** Monitor GA4 for new sign-ups (should appear within 24h).

---

**Test Device:** iPhone 14+ (or latest Safari on Mac)  
**Viewport:** Mobile (375px width minimum)  
**Network:** 4G or WiFi (both)
