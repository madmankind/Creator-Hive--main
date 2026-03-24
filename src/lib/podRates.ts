// Rate calculation utilities for pod setup

export type EngagementType = "per-project" | "short-term" | "long-term";
export type AddOn = "usage-rights" | "whitelisting" | "exclusivity";

export interface TalentPodConfig {
  talentId: string;
  baseDayRate: number; // in USD
  duration: number; // days
  engagementType: EngagementType;
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  addOns: AddOn[];
}

// Mock day rates based on role (in USD)
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
  
  // Default rate
  return 750;
};

// Calculate rate multiplier based on engagement type
export const getEngagementMultiplier = (type: EngagementType): number => {
  switch (type) {
    case "per-project":
      return 1.0;
    case "short-term":
      return 0.9; // 10% discount for short-term
    case "long-term":
      return 0.75; // 25% discount for long-term
    default:
      return 1.0;
  }
};

// Calculate add-on costs
export const getAddOnCost = (addOn: AddOn, baseRate: number, duration: number): number => {
  switch (addOn) {
    case "usage-rights":
      return baseRate * duration * 0.15; // 15% of total
    case "whitelisting":
      return baseRate * duration * 0.25; // 25% of total
    case "exclusivity":
      return baseRate * duration * 0.5; // 50% of total
    default:
      return 0;
  }
};

// Calculate total rate for a talent
export const calculateTalentRate = (config: TalentPodConfig): number => {
  const { baseDayRate, duration, engagementType, addOns } = config;
  
  // Base rate with engagement multiplier
  const baseTotal = baseDayRate * duration * getEngagementMultiplier(engagementType);
  
  // Add add-on costs
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

