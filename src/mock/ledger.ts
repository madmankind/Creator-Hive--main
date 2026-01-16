import type { Invoice, Payout, TalentContract, TalentEarning } from "@/components/campaigns/types";

export const mockInvoices: Invoice[] = [
  {
    id: "inv-1",
    campaignId: "winter-launch-uae",
    invoiceNumber: "INV-2024-001",
    campaign: "Winter Launch – UAE",
    amount: 27500,
    status: "Sent",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  },
  {
    id: "inv-2",
    campaignId: "ramadan-promo-ksa",
    invoiceNumber: "INV-2024-002",
    campaign: "Ramadan Promo – KSA",
    amount: 18500,
    status: "Paid",
    dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
];

export const mockPayouts: Payout[] = [
  {
    id: "payout-1",
    campaignId: "winter-launch-uae",
    creator: "Sarah Chen",
    amount: 2100,
    status: "Paid",
    scheduledDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    method: "Stripe",
  },
  {
    id: "payout-2",
    campaignId: "ramadan-promo-ksa",
    creator: "Alex Nguyen",
    amount: 1800,
    status: "Scheduled",
    scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    method: "Stripe",
  },
];

export const mockEarnings: TalentEarning[] = [
  {
    id: "earn-1",
    campaignId: "winter-launch-uae",
    campaign: "Winter Launch – UAE",
    amount: 2100,
    status: "Released",
    expectedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: "earn-2",
    campaignId: "ramadan-promo-ksa",
    campaign: "Ramadan Promo – KSA",
    amount: 1800,
    status: "Approved",
    expectedDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: "earn-3",
    campaignId: "winter-launch-uae",
    campaign: "Winter Launch – UAE",
    amount: 950,
    status: "Pending Approval",
    expectedDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
  },
];

export const mockContracts: TalentContract[] = [
  { id: "CT-9033", campaignId: "winter-launch-uae", campaign: "Winter Launch – UAE", status: "Signed" },
  { id: "CT-9036", campaignId: "ramadan-promo-ksa", campaign: "Ramadan Promo – KSA", status: "Pending" },
];
