// Pod pricing calculations

import type { TalentPodConfig, EngagementType, AddOn, HireType, UsageRightsTier } from "@/types/pod";

// Base day rates by role (USD)
export const getBaseDayRate = (role: string): number => {
  const roleLower = role.toLowerCase();
  
  if (roleLower.includes("project manager") || roleLower.includes("campaign lead")) {
    return 800;
  }
  if (roleLower.includes("account manager")) {
    return 600;
  }
  if (roleLower.includes("strategy") || roleLower.includes("creative lead")) {
    return 1000;
  }
  if (roleLower.includes("production lead")) {
    return 900;
  }
  if (roleLower.includes("videographer") || roleLower.includes("photographer")) {
    return 1200;
  }
  if (roleLower.includes("ugc") || roleLower.includes("influencer")) {
    return 800;
  }
  if (roleLower.includes("editor") || roleLower.includes("post-production")) {
    return 700;
  }
  if (roleLower.includes("paid") || roleLower.includes("performance") || roleLower.includes("media buyer")) {
    return 900;
  }
  
  return 750;
};

// Engagement type multipliers
export const getEngagementMultiplier = (type: EngagementType): number => {
  switch (type) {
    case "per-project":
      return 1.0;
    case "short-term":
      return 0.9;
    case "long-term":
      return 0.75;
    default:
      return 1.0;
  }
};

// Add-on costs
export const getAddOnCost = (addOn: AddOn, baseRate: number, duration: number): number => {
  switch (addOn) {
    case "usage-rights":
      return baseRate * duration * 0.15;
    case "whitelisting":
      return baseRate * duration * 0.25;
    case "exclusivity":
      return baseRate * duration * 0.5;
    default:
      return 0;
  }
};

// Calculate total rate for a talent
export const calculateTalentRate = (config: TalentPodConfig): number => {
  const { baseDayRate, duration, engagementType, addOns } = config;
  
  const baseTotal = baseDayRate * duration * getEngagementMultiplier(engagementType);
  
  const addOnTotal = addOns.reduce((sum, addOn) => {
    return sum + getAddOnCost(addOn, baseDayRate, duration);
  }, 0);
  
  return baseTotal + addOnTotal;
};

// Format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const computeLineTotal = (config: {
  hireType?: HireType;
  estimatedDays?: number | null;
  hours?: number | null;
  months?: number | null;
  dayRate?: number | null;
  hourlyRate?: number | null;
  monthlyRate?: number | null;
  usageRightsFee?: number | null;
}): number => {
  const hireType = config.hireType ?? "PROJECT";
  const usageFee = config.usageRightsFee ?? 0;
  if (hireType === "PROJECT") {
    const days = config.estimatedDays ?? 1;
    const rate = config.dayRate ?? 0;
    return Math.max(0, rate * days + usageFee);
  }
  if (hireType === "HOURLY") {
    const hours = config.hours ?? 0;
    const rate = config.hourlyRate ?? 0;
    return Math.max(0, rate * hours + usageFee);
  }
  // MONTHLY
  const months = config.months ?? 1;
  const rate = config.monthlyRate ?? 0;
  return Math.max(0, rate * months + usageFee);
};











