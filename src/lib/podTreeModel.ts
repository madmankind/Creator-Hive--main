// Universal campaign tree model

import type { CampaignRole } from "@/types/pod";

export const CAMPAIGN_ROLES: CampaignRole[] = [
  {
    id: "campaign-lead",
    label: "Campaign Lead / Project Manager",
    level: 0,
    multiple: false,
  },
  {
    id: "strategy-account",
    label: "Strategy & Account",
    level: 1,
    multiple: false,
  },
  {
    id: "creators",
    label: "Creators",
    level: 2,
    multiple: true,
  },
  {
    id: "post-support",
    label: "Post / Support",
    level: 3,
    multiple: true,
  },
];

// Map talent role to campaign tree role
export const mapTalentToRole = (talentRole: string): string => {
  const roleLower = talentRole.toLowerCase();
  
  if (roleLower.includes("project manager") || roleLower.includes("campaign")) {
    return "campaign-lead";
  }
  if (roleLower.includes("account") || roleLower.includes("strategy") || roleLower.includes("creative")) {
    return "strategy-account";
  }
  if (roleLower.includes("editor") || roleLower.includes("post") || roleLower.includes("support")) {
    return "post-support";
  }
  // Default to creators
  return "creators";
};












<<<<<<< Current (Your changes)

=======
>>>>>>> Incoming (Background Agent changes)
