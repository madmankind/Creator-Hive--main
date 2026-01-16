// Pod setup types

export type EngagementType = "per-project" | "short-term" | "long-term";
export type AddOn = "usage-rights" | "whitelisting" | "exclusivity";
export type HireType = "PROJECT" | "MONTHLY" | "HOURLY";
export type UsageRightsTier = "NONE" | "STANDARD" | "FULL" | "BUYOUT";

export interface TalentPodConfig {
  talentId: string;
  baseDayRate: number;
  duration: number; // days
  engagementType: EngagementType;
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  addOns: AddOn[];
  hireType?: HireType;
  estimatedDays?: number | null;
  hours?: number | null;
  months?: number | null;
  dayRateSnapshot?: number | null;
  hourlyRateSnapshot?: number | null;
  monthlyRateSnapshot?: number | null;
  usageRightsTier?: UsageRightsTier;
  usageRightsFee?: number | null;
  lineTotal?: number | null;
}

export interface CampaignRole {
  id: string;
  label: string;
  level: number;
  multiple?: boolean; // Can have multiple talents
}

export interface PodSlot {
  roleId: string;
  talentId: string | null;
  position: number; // For multiple slots in same role
}

export interface PodTreeModel {
  roles: CampaignRole[];
  slots: PodSlot[];
}











<<<<<<< Current (Your changes)

=======
>>>>>>> Incoming (Background Agent changes)
