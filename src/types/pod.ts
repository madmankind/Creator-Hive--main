// Pod setup types

export type EngagementType = "per-project" | "short-term" | "long-term";
export type AddOn = "usage-rights" | "whitelisting" | "exclusivity";

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


