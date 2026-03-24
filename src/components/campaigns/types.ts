export type TalentCampaignStatus = "SHORTLISTED" | "BOOKED" | "IN_PRODUCTION" | "SUBMITTED" | "APPROVED" | "PAID" | "UNAVAILABLE";

export type BookingState = "PENDING" | "ACCEPTED" | "CONFIRMED" | "DECLINED" | "EXPIRED";

export type PaymentState = "UNFUNDED" | "PARTIALLY_FUNDED" | "FUNDED" | "RELEASED" | "REFUNDED";

export interface Deliverable {
  id: string;
  type: "Reel" | "Story" | "Post" | "Video";
  files: string[];
  submittedAt?: string;
  status: "Pending" | "NeedsRevision" | "Approved";
  revisionCount: number;
  requestedComment?: string;
}

export interface TalentCampaignCard {
  id: string;
  campaignId: string;
  talentId: string;
  talentName: string;
  talentRole: string;
  talentManagerId?: string;
  deliverables: Deliverable[];
  agreedRate: number;
  currency: string;
  engagementRate?: number;
  contractId?: string;
  status: TalentCampaignStatus;
  paymentStatus: PaymentState;
  bookingState: BookingState;
  createdAt: string;
  unavailableReason?: "DECLINED" | "EXPIRED";
}

export type InvoiceStatus = "Draft" | "Sent" | "Paid" | "Overdue";
export type PayoutStatus = "Scheduled" | "Processing" | "Paid";
export type EarningStatus = "Pending Approval" | "Approved" | "Released";
export type ContractStatus = "Pending" | "Signed" | "Completed";

export interface Invoice {
  id: string;
  campaignId: string;
  invoiceNumber: string;
  campaign: string;
  amount: number;
  status: InvoiceStatus;
  dueDate: Date;
}

export interface Payout {
  id: string;
  campaignId: string;
  creator: string;
  amount: number;
  status: PayoutStatus;
  scheduledDate: Date;
  method: string;
}

export interface TalentEarning {
  id: string;
  campaignId: string;
  campaign: string;
  amount: number;
  status: EarningStatus;
  expectedDate: Date;
}

export interface TalentContract {
  id: string;
  campaignId: string;
  campaign: string;
  status: ContractStatus;
}
