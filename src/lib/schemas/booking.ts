// src/lib/schemas/booking.ts
// CANONICAL SCHEMAS - Single Source of Truth
import { z } from "zod";

// ========================
// ENUMS (Canonical)
// ========================

export const PricingTier = z.enum(["HIVE_SELECT", "HIVE_SIGNATURE"]);
export type PricingTier = z.infer<typeof PricingTier>;

export const Timeline = z.enum(["ASAP", "THIS_MONTH", "NEXT_MONTH", "FLEXIBLE"]);
export type Timeline = z.infer<typeof Timeline>;

export const Objective = z.enum(["AWARENESS", "GROWTH", "CONVERSIONS", "LAUNCH"]);
export type Objective = z.infer<typeof Objective>;

export const RequestStatus = z.enum([
  "DRAFT_BRIEF",
  "MATCHING",
  "POD_SELECTED",
  "REQUEST_SUBMITTED",
  "IN_REVIEW",
  "SCOPE_CONFIRMED",
  "CONTRACT_PENDING",
  "ACTIVE",
  "DELIVERED",
  "APPROVED",
  "PAID",
  "CLOSED",
  "CANCELLED",
]);
export type RequestStatus = z.infer<typeof RequestStatus>;

// ========================
// CONTROLLED LISTS
// ========================

export const OUTPUT_TYPES = [
  "UGC",
  "EDITED_VIDEO",
  "PHOTO_SHOOT",
  "SOCIAL_MANAGEMENT",
  "DESIGN",
  "PERFORMANCE",
  "WEB_BUILD",
] as const;

export const PLATFORMS = [
  "TIKTOK",
  "INSTAGRAM",
  "YOUTUBE",
  "SNAPCHAT",
  "LINKEDIN",
  "X",
] as const;

export const MARKETS = [
  "UAE",
  "KSA",
  "QAT",
  "BHR",
  "OMN",
  "KWT",
  "GCC",
  "GLOBAL",
] as const;

export const LANGUAGES = ["EN", "AR", "BOTH"] as const;

// ========================
// CORE SCHEMAS
// ========================

export const BriefLiteSchema = z.object({
  id: z.string().cuid().optional(),
  objective: Objective,
  outputs: z.array(z.string()).min(1, "Select at least one output type"),
  platforms: z.array(z.string()).min(1, "Select at least one platform"),
  markets: z.array(z.string()).min(1, "Select at least one market"),
  languages: z.array(z.enum(LANGUAGES)).min(1, "Select at least one language"),
  keyMessaging: z
    .string()
    .max(120, "Key messaging must be 120 characters or less")
    .optional(),
  timeline: Timeline,
  pricingTier: PricingTier,
  referenceUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type BriefLite = z.infer<typeof BriefLiteSchema>;

export const PodSchema = z.object({
  id: z.string().cuid().optional(),
  talentIds: z.array(z.string()).min(1, "Add at least one talent").max(10, "Maximum 10 talents per pod"),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type Pod = z.infer<typeof PodSchema>;

export const BookingRequestCreateSchema = z.object({
  brief: BriefLiteSchema,
  talentIds: z.array(z.string()).min(1, "Pod must have at least one talent"),
  companyName: z.string().min(2, "Company name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().optional(),
  note: z.string().max(500, "Note must be under 500 characters").optional(),
});

export type BookingRequestCreate = z.infer<typeof BookingRequestCreateSchema>;

export const BookingRequestSchema = z.object({
  id: z.string().cuid(),
  briefSnapshot: z.any(), // JSON snapshot of BriefLite
  talentIds: z.array(z.string()),
  companyName: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  note: z.string().optional(),
  status: RequestStatus,
  userId: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type BookingRequest = z.infer<typeof BookingRequestSchema>;

export const MatchScoreSchema = z.object({
  requestId: z.string().cuid(),
  talentId: z.string(),
  score: z.number().int().min(0).max(10),
  rationale: z.string().max(60, "Rationale must be 60 characters or less"),
  computedAt: z.date().optional(),
});

export type MatchScore = z.infer<typeof MatchScoreSchema>;

// ========================
// DISPLAY HELPERS
// ========================

export const PRICING_TIER_LABELS: Record<PricingTier, string> = {
  HIVE_SELECT: "Hive Select",
  HIVE_SIGNATURE: "Hive Signature",
};

export const PRICING_TIER_DESCRIPTIONS: Record<PricingTier, string> = {
  HIVE_SELECT: "Vetted premium talent",
  HIVE_SIGNATURE: "Vetted premium talent with proven social influence",
};

export const TIMELINE_LABELS: Record<Timeline, string> = {
  ASAP: "ASAP",
  THIS_MONTH: "This month",
  NEXT_MONTH: "Next month",
  FLEXIBLE: "Flexible",
};

export const OBJECTIVE_LABELS: Record<Objective, string> = {
  AWARENESS: "Brand awareness",
  GROWTH: "Audience growth",
  CONVERSIONS: "Drive conversions",
  LAUNCH: "Product launch",
};

export const OUTPUT_TYPE_LABELS: Record<(typeof OUTPUT_TYPES)[number], string> = {
  UGC: "UGC",
  EDITED_VIDEO: "Edited video",
  PHOTO_SHOOT: "Photo shoot",
  SOCIAL_MANAGEMENT: "Social management",
  DESIGN: "Design",
  PERFORMANCE: "Performance",
  WEB_BUILD: "Web build",
};

export const PLATFORM_LABELS: Record<(typeof PLATFORMS)[number], string> = {
  TIKTOK: "TikTok",
  INSTAGRAM: "Instagram",
  YOUTUBE: "YouTube",
  SNAPCHAT: "Snapchat",
  LINKEDIN: "LinkedIn",
  X: "X",
};

export const MARKET_LABELS: Record<(typeof MARKETS)[number], string> = {
  UAE: "UAE",
  KSA: "Saudi Arabia",
  QAT: "Qatar",
  BHR: "Bahrain",
  OMN: "Oman",
  KWT: "Kuwait",
  GCC: "GCC",
  GLOBAL: "Global",
};

export const LANGUAGE_LABELS: Record<(typeof LANGUAGES)[number], string> = {
  EN: "English",
  AR: "Arabic",
  BOTH: "Both (EN + AR)",
};

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  DRAFT_BRIEF: "Draft brief",
  MATCHING: "Matching talent",
  POD_SELECTED: "Pod selected",
  REQUEST_SUBMITTED: "Request submitted",
  IN_REVIEW: "In review",
  SCOPE_CONFIRMED: "Scope confirmed",
  CONTRACT_PENDING: "Contract pending",
  ACTIVE: "Active",
  DELIVERED: "Delivered",
  APPROVED: "Approved",
  PAID: "Paid",
  CLOSED: "Closed",
  CANCELLED: "Cancelled",
};
