# CampaignBriefForm API Wiring Summary

**Date:** 2026-01-16  
**Status:** ✅ Complete

---

## 🎯 OBJECTIVE

Wire `CampaignBriefForm.tsx` to the CampaignBrief API endpoints with proper data fetching, state management, and user feedback.

---

## ✅ IMPLEMENTED FEATURES

### 1. Data Fetching ✅

**Implementation:**
- Added SWR (`useSWR`) for automatic data fetching on mount
- Fetches from `/api/campaigns/[id]/brief` endpoint
- Supports both prop-based and fetch-based brief data
- Auto-updates form fields when brief data is loaded

**Code:**
```typescript
const { data: briefResponse, mutate: refreshBrief } = useSWR<BriefResponse>(
  `/api/campaigns/${campaignId}/brief`,
  fetcher,
  {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
  }
);
```

**Behavior:**
- If `brief` prop is provided, uses that (for parent-controlled data)
- Otherwise, fetches from API automatically
- Form fields update when fetched data arrives

---

### 2. Action Wiring ✅

#### Save Draft
**Endpoint:** `POST /api/campaigns/[id]/brief`

**Implementation:**
- Validates required fields (Primary Objective, Key Message)
- Sends form data to API
- Refreshes brief data after save
- Shows success toast notification
- Calls `onSave` and `onBriefUpdated` callbacks

**User Feedback:**
- Toast: "Saved - Brief draft saved successfully"
- Button shows "Saving..." during operation

#### Lock Brief
**Endpoint:** `POST /api/campaigns/[id]/brief/lock`

**Implementation:**
- Validates required fields before locking
- Calls lock API endpoint
- Refreshes brief data to get updated `isLocked` state
- Disables all form inputs after lock
- Shows success toast notification

**User Feedback:**
- Toast: "Brief Locked - Brief has been locked and cannot be edited"
- Button shows "Locking..." during operation
- Form becomes read-only after lock

#### Send to Talent
**Endpoint:** `POST /api/campaigns/[id]/brief/send`

**Implementation:**
- Validates brief is locked before sending
- Calls send API endpoint
- Refreshes brief data to get updated `sentAt` and `status`
- Shows success toast notification
- Closes modal after 1 second delay (to show toast)

**User Feedback:**
- Toast: "Brief Sent - Brief has been sent to talent successfully"
- Button shows "Sending..." during operation
- Modal closes automatically after success

---

### 3. Status Indicators ✅

**Visual Status Banners:**

1. **Approved State** (Green)
   - Shows when `status === "APPROVED"`
   - Displays: "Brief Approved (v{version}) · Sent {date}"
   - Icon: CheckCircle2

2. **Sent State** (Purple)
   - Shows when `status === "SENT"` but not approved
   - Displays: "Brief Sent (v{version}) · {date} · Awaiting approval"
   - Icon: Send

3. **Locked State** (Amber)
   - Shows when `isLocked === true` but not sent
   - Displays: "Brief Locked (v{version}) · Locked {date} · Last edited by {name}"
   - Icon: Lock

**Location:** Top of form, above Campaign Snapshot section

---

### 4. Campaign ID Validation ✅

**Strict Check:**
```typescript
if (!campaignId || typeof campaignId !== "string") {
  // Shows error UI instead of crashing
  return <ErrorComponent />;
}
```

**Behavior:**
- Validates `campaignId` is provided and is a string
- Shows error UI if invalid (prevents API calls with bad ID)
- Logs error to console for debugging

---

## 🔒 LOCKING LOGIC EXPLANATION

### How Locking Works in the UI

1. **Initial State:**
   - Form is editable (`canEdit = true`)
   - All inputs are enabled
   - "Lock Brief" button is visible

2. **User Locks Brief:**
   - User clicks "Lock Brief" button
   - `handleLock()` is called
   - API request to `/api/campaigns/[id]/brief/lock`
   - On success:
     - Brief data is refreshed via `refreshBrief()`
     - `isLocked` becomes `true` in fetched data
     - `canEdit` becomes `false`
     - All inputs are disabled
     - "Lock Brief" button disappears
     - "Send Brief to Talent" button appears
     - Locked status banner appears

3. **Locked State:**
   - All form inputs have `disabled={!canEdit}` (disabled)
   - All toggle buttons check `canEdit` before allowing changes
   - Form becomes read-only
   - User can only view the brief or send it

4. **After Send:**
   - Brief status becomes "SENT"
   - `isSent` becomes `true`
   - Form remains read-only
   - Status banner changes to "Sent" (purple)
   - Modal closes automatically

### State Flow Diagram

```
DRAFT (Editable)
  ↓ [User clicks "Lock Brief"]
LOCKED (Read-only, can send)
  ↓ [User clicks "Send Brief to Talent"]
SENT (Read-only, awaiting approval)
  ↓ [Talent approves]
APPROVED (Read-only, final state)
```

### Key State Variables

```typescript
const isLocked = brief?.isLocked || false;
const isSent = brief?.status === "SENT" || !!brief?.sentAt;
const isApproved = brief?.status === "APPROVED";
const canEdit = !isLocked && !isSent;
```

**Logic:**
- `canEdit` is `true` only when brief is NOT locked AND NOT sent
- Once locked, form becomes read-only
- Once sent, form remains read-only (even if unlocked somehow)

---

## 📝 CODE CHANGES SUMMARY

### New Imports
```typescript
import useSWR from "swr";
import { pushToast } from "@/components/ui/toast";
import { AlertCircle } from "lucide-react";
```

### New Props
```typescript
onBriefUpdated?: () => void; // Callback for parent refresh
```

### New State Management
- SWR hook for data fetching
- Separate loading states: `isSaving`, `isLocking`, `isSending`
- Status flags: `isLocked`, `isSent`, `isApproved`, `canEdit`

### Updated Handlers
- `handleSave()` - Now uses toast, refreshes data, validates campaignId
- `handleLock()` - Now uses toast, refreshes data, validates campaignId
- `handleSend()` - Now uses toast, refreshes data, validates campaignId, auto-closes modal

### New UI Elements
- Status indicator banners (Approved/Sent/Locked)
- Error UI for invalid campaignId
- Toast notifications for all actions

---

## 🧪 TESTING CHECKLIST

- [ ] Form loads and fetches brief data on mount
- [ ] Form fields are pre-filled when brief exists
- [ ] Save Draft works and shows toast
- [ ] Lock Brief disables all inputs
- [ ] Locked status banner appears after lock
- [ ] Send Brief works when locked
- [ ] Sent status banner appears after send
- [ ] Modal closes after successful send
- [ ] Campaign ID validation shows error if invalid
- [ ] All API errors show in toast notifications

---

## 📚 USAGE EXAMPLE

```tsx
<CampaignBriefForm
  campaignId={campaign.id} // Required - validated strictly
  campaignTitle={campaign.title}
  clientName={campaign.clientName}
  talentNames={talentNames}
  deliverables={deliverables}
  onBriefUpdated={() => {
    // Refresh parent component data
    refreshCampaignData();
  }}
  onClose={() => setIsModalOpen(false)}
/>
```

---

## 🔍 KEY IMPLEMENTATION DETAILS

### Data Fetching Strategy
- **Primary:** SWR auto-fetches on mount
- **Fallback:** Uses `brief` prop if provided (for parent-controlled data)
- **Refresh:** `refreshBrief()` called after all mutations

### Error Handling
- All API errors caught and shown in toast
- Campaign ID validated before any API calls
- Form validation before lock/send actions

### State Synchronization
- After lock: Refreshes brief data to get `isLocked: true`
- After send: Refreshes brief data to get `status: "SENT"`
- Form state updates automatically via `useEffect` when brief data changes

---

**Implementation Complete:** ✅  
**Ready for Testing:** ✅  
**Next Steps:** Manual testing and integration with ManageScreen
