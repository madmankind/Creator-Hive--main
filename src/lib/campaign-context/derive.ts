/**
 * Pure derivation functions for Campaign Context Bar
 * These functions compute UI state from existing Track/Manage/Pay data
 */

import type {
  CampaignContextData,
  CampaignStage,
  FundingStatus,
  DataStatus,
  PrimaryAction,
  QuickLink,
} from "./types";

/**
 * Helper: Parse numeric value from string like "AED 96.5K" or number
 */
function parseNumericValue(value: number | string | undefined): number {
  if (typeof value === "number") return value;
  if (!value) return 0;
  const str = String(value).replace(/[^\d.]/g, "");
  const num = parseFloat(str);
  if (isNaN(num)) return 0;
  // Handle K/M suffixes (rough approximation)
  if (String(value).toUpperCase().includes("K")) return num * 1000;
  if (String(value).toUpperCase().includes("M")) return num * 1000000;
  return num;
}

/**
 * Derive campaign stage from available signals
 * Priority: Manage board > Event timeline > Creator status > Campaign status
 */
export function deriveCampaignStage(data: CampaignContextData): CampaignStage {
  // Priority 1: Manage board columns (highest fidelity)
  if (data.boardColumns) {
    const columns = data.boardColumns;
    
    // Check in reverse order (most advanced first)
    if (columns.paid && columns.paid.length > 0) {
      // All deliverables paid
      return "Completed";
    }
    if (columns.approved && columns.approved.length > 0) {
      return "Approved";
    }
    if (columns.submitted && columns.submitted.length > 0) {
      return "Submitted";
    }
    if (columns.production && columns.production.length > 0) {
      return "In Production";
    }
    if (columns.contracted && columns.contracted.length > 0) {
      return "Contracting";
    }
    if (columns.shortlisted && columns.shortlisted.length > 0) {
      return "Briefing";
    }
  }

  // Priority 2: Event timeline
  if (data.events && data.events.length > 0) {
    // Sort by date (most recent first)
    const sortedEvents = [...data.events].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA;
    });

    const latestEvent = sortedEvents[0];
    switch (latestEvent.type) {
      case "paymentCompleted":
        return "Completed";
      case "campaignLive":
        return "Live";
      case "deliverableApproved":
        return "Approved";
      case "invoiceSent":
        return "Submitted";
      case "talentAdded":
        return "Contracting";
      case "started":
        return "Briefing";
    }
  }

  // Priority 3: Creator status from breakdown table
  if (data.creators && data.creators.length > 0) {
    const hasNeedsReview = data.creators.some((c) => c.status === "Needs Review" || c.status === "At Risk");
    const hasOffTrack = data.creators.some((c) => c.status === "Off Track");
    const allOnTrack = data.creators.every((c) => c.status === "On Track");
    
    if (hasOffTrack) return "In Production"; // At risk but still in production
    if (hasNeedsReview) return "Submitted"; // Needs review = submitted for approval
    if (allOnTrack && data.creators.some((c) => c.deliverables)) {
      return "In Production"; // All on track with deliverables = in production
    }
  }

  // Priority 4: Campaign status field
  if (data.campaign?.status) {
    const statusLower = data.campaign.status.toLowerCase();
    if (statusLower.includes("brief") || statusLower.includes("draft")) return "Briefing";
    if (statusLower.includes("contract") || statusLower.includes("signed")) return "Contracting";
    if (statusLower.includes("funded") || statusLower.includes("paid")) return "Funded";
    if (statusLower.includes("production") || statusLower.includes("active")) return "In Production";
    if (statusLower.includes("submit") || statusLower.includes("review")) return "Submitted";
    if (statusLower.includes("approve") || statusLower.includes("approved")) return "Approved";
    if (statusLower.includes("live") || statusLower.includes("published")) return "Live";
    if (statusLower.includes("complete") || statusLower.includes("done")) return "Completed";
  }

  // Default fallback
  return "Briefing";
}

/**
 * Derive funding status from payment data
 * Priority: Pay view KPIs > Invoices/Payouts > Campaign budget
 */
export function deriveFundingStatus(data: CampaignContextData): FundingStatus {
  const payments = data.payments || {};
  
  // Parse numeric values
  const outstanding = parseNumericValue(payments.outstanding);
  const paidToDate = parseNumericValue(payments.paidToDate);
  const budget = data.campaign?.budget ? parseNumericValue(data.campaign.budget) : undefined;

  // If we have invoice/payout data, use it for more accuracy
  if (data.invoices || data.payouts) {
    const unpaidInvoices = data.invoices?.filter((inv) => inv.status !== "Paid") || [];
    const unpaidInvoicesTotal = unpaidInvoices.reduce((sum, inv) => sum + inv.amount, 0);
    
    const paidInvoices = data.invoices?.filter((inv) => inv.status === "Paid") || [];
    const paidInvoicesTotal = paidInvoices.reduce((sum, inv) => sum + inv.amount, 0);

    if (unpaidInvoicesTotal > 0 && paidInvoicesTotal === 0) {
      return "Deposit pending";
    }
    if (unpaidInvoicesTotal > 0 && paidInvoicesTotal > 0) {
      return "Partially funded";
    }
    if (unpaidInvoicesTotal === 0 && paidInvoicesTotal > 0) {
      // Check if there are scheduled payouts (milestones)
      const scheduledPayouts = data.payouts?.filter((p) => p.status === "Scheduled") || [];
      if (scheduledPayouts.length > 0) {
        return "Milestone available";
      }
      return "Funded";
    }
  }

  // Fallback to KPI values
  if (outstanding > 0 && paidToDate === 0) {
    return "Deposit pending";
  }
  if (outstanding > 0 && paidToDate > 0) {
    return "Partially funded";
  }
  if (outstanding === 0 && paidToDate > 0) {
    // Check if there's a milestone available (if budget exists and paid < budget)
    if (budget && paidToDate < budget) {
      return "Milestone available";
    }
    return "Funded";
  }

  return "Deposit pending";
}

/**
 * Derive data status from creator deliverables and event timeline
 * Priority: Event timeline (campaignLive) > Creator deliverables > Default
 */
export function deriveDataStatus(data: CampaignContextData): DataStatus {
  // Check if campaign is live (has campaignLive event)
  if (data.events) {
    const hasLiveEvent = data.events.some((e) => e.type === "campaignLive");
    if (hasLiveEvent) {
      // If live, check if we have publish links (deliverables with links)
      // For now, if we have deliverables, assume manual entry
      if (data.creators && data.creators.some((c) => c.deliverables)) {
        return "Manual"; // Has deliverables but no integration flag
      }
    }
  }

  // Check if creators have deliverables (implies manual entry)
  if (data.creators && data.creators.some((c) => c.deliverables)) {
    return "Manual";
  }

  // Default: no data connected
  return "Pending";
}

/**
 * Derive primary action based on stage, funding, and data status
 */
export function derivePrimaryAction(
  stage: CampaignStage,
  fundingStatus: FundingStatus,
  dataStatus: DataStatus,
  data: CampaignContextData
): PrimaryAction {
  // Check for items needing review
  const hasNeedsReview = data.creators?.some(
    (c) => c.status === "Needs Review" || c.status === "At Risk"
  ) || false;

  // Priority 1: Funding actions
  if (fundingStatus === "Deposit pending") {
    return {
      label: "Collect deposit",
      disabled: false,
      tooltip: "Collect initial deposit payment",
    };
  }

  // Priority 2: Data/publish links
  if (dataStatus === "Pending" && stage !== "Briefing") {
    return {
      label: "Add publish links",
      disabled: false,
      tooltip: "Add publish links for deliverables",
    };
  }

  // Priority 3: Review/approval
  if (hasNeedsReview) {
    return {
      label: "Review & approve",
      disabled: false,
      tooltip: "Review items that need attention",
    };
  }

  // Priority 4: Stage-based actions
  switch (stage) {
    case "Live":
    case "Completed":
      return {
        label: "View report",
        disabled: false,
        tooltip: "View campaign performance report",
      };
    case "Approved":
      return {
        label: "Go live",
        disabled: false,
        tooltip: "Publish approved deliverables",
      };
    case "Submitted":
      return {
        label: "Review submissions",
        disabled: false,
        tooltip: "Review submitted deliverables",
      };
    case "In Production":
      return {
        label: "Track progress",
        disabled: false,
        tooltip: "View production progress",
      };
    default:
      return {
        label: "View details",
        disabled: false,
        tooltip: "View campaign details",
      };
  }
}

/**
 * Derive quick links availability
 */
export function deriveQuickLinks(data: CampaignContextData): QuickLink[] {
  const hasCampaign = !!data.campaign;
  const hasCreators = !!(data.creators && data.creators.length > 0);
  const hasInvoices = !!(data.invoices && data.invoices.length > 0);

  return [
    {
      id: "brief",
      label: "Brief",
      available: hasCampaign,
      // href: hasCampaign ? `/dashboard/campaigns/${data.campaign?.id}/brief` : undefined,
    },
    {
      id: "deliverables",
      label: "Deliverables",
      available: hasCreators,
      // href: hasCreators ? `/dashboard/campaigns/${data.campaign?.id}/deliverables` : undefined,
    },
    {
      id: "milestones",
      label: "Milestones / Funding",
      available: hasInvoices || !!data.payments,
      // href: hasInvoices ? `/dashboard/campaigns/${data.campaign?.id}/milestones` : undefined,
    },
  ];
}






