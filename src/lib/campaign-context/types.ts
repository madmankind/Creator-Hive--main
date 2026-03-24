/**
 * Compat layer types for campaign context derivation
 * These types match what Track/Manage/Pay views already use
 */

export interface CampaignContextData {
  // Basic campaign info
  campaign?: {
    id: string;
    name: string;
    clientName?: string;
    startDate?: Date | string;
    dueDate?: Date | string;
    budget?: number;
    status?: string;
  };

  // Payment/funding summary (from Pay view KPIs)
  payments?: {
    totalSpend?: number | string; // Can be "AED 96.5K" format
    outstanding?: number | string;
    paidToDate?: number | string;
    upcomingPayouts?: number | string;
  };

  // Creator/deliverable rows (from Track breakdown table)
  creators?: Array<{
    id: string;
    name: string;
    deliverables?: string;
    status?: "On Track" | "Needs Review" | "At Risk" | "Off Track";
    reach?: number;
    impressions?: number;
    spend?: number;
  }>;

  // Event timeline (from Track EventTimeline component)
  events?: Array<{
    type: "started" | "talentAdded" | "deliverableApproved" | "campaignLive" | "invoiceSent" | "paymentCompleted" | "scopeUpdated";
    date: Date | string;
    label?: string;
  }>;

  // Manage board status columns (from PodBoard)
  boardColumns?: Record<string, Array<{
    id: string;
    status: string;
    [key: string]: unknown;
  }>>;

  // Invoices (from Pay view)
  invoices?: Array<{
    id: string;
    status: "Draft" | "Sent" | "Paid" | "Overdue";
    amount: number;
    dueDate?: Date | string;
  }>;

  // Payouts (from Pay view)
  payouts?: Array<{
    id: string;
    status: "Scheduled" | "Processing" | "Paid";
    amount: number;
    scheduledDate?: Date | string;
  }>;
}

export type CampaignStage = "Briefing" | "Contracting" | "Funded" | "In Production" | "Submitted" | "Approved" | "Live" | "Completed";

export type FundingStatus = "Deposit pending" | "Partially funded" | "Funded" | "Milestone available";

export type DataStatus = "Manual" | "Connected" | "Pending";

export interface PrimaryAction {
  label: string;
  disabled: boolean;
  tooltip?: string;
}

export interface QuickLink {
  id: string;
  label: string;
  available: boolean;
  href?: string;
}






