"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface Campaign {
  id: string;
  name: string;
  objective: "awareness" | "engagement" | "traffic" | "conversions";
  budget: number;
  spend: number;
  clientName?: string;
  startDate?: string | Date;
  endDate?: string | Date;
}

interface CampaignContextType {
  activeCampaign: Campaign | null;
  campaigns: Campaign[];
  setActiveCampaign: (campaign: Campaign | null) => void;
}

const CampaignContext = createContext<CampaignContextType | undefined>(undefined);

const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: "winter-launch-uae",
    name: "Winter Launch – UAE",
    objective: "awareness",
    budget: 120000,
    spend: 96500,
  },
  {
    id: "ramadan-promo-ksa",
    name: "Ramadan Promo – KSA",
    objective: "traffic",
    budget: 80000,
    spend: 41200,
  },
];

export function CampaignProvider({ children }: { children: ReactNode }) {
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(
    MOCK_CAMPAIGNS[0] || null
  );

  return (
    <CampaignContext.Provider
      value={{
        activeCampaign,
        campaigns: MOCK_CAMPAIGNS,
        setActiveCampaign,
      }}
    >
      {children}
    </CampaignContext.Provider>
  );
}

export function useCampaign() {
  const context = useContext(CampaignContext);
  if (context === undefined) {
    throw new Error("useCampaign must be used within a CampaignProvider");
  }
  return context;
}





