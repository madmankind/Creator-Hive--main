"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { useCampaign } from "@/contexts/CampaignContext";

export function CampaignSwitcher() {
  const { activeCampaign, campaigns, setActiveCampaign } = useCampaign();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex flex-col items-start gap-0.5 transition-opacity hover:opacity-80"
        style={{
          cursor: "pointer",
          color: activeCampaign ? "#EDEDED" : "#8B8B8B",
        }}
      >
        <div className="text-xs font-medium" style={{ color: "#8B8B8B" }}>
          Campaign
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium" style={{ color: activeCampaign ? "#EDEDED" : "#8B8B8B" }}>
            {activeCampaign?.name || "Select campaign"}
          </span>
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`}
            style={{ color: "#8B8B8B" }}
          />
        </div>
      </button>

      {isOpen && (
        <div
          className="absolute left-0 mt-2 w-[280px] rounded-2xl shadow-2xl z-50"
          style={{
            background: "rgba(10,10,12,0.96)",
            backdropFilter: "blur(24px)",
            boxShadow: "0 30px 60px rgba(0,0,0,0.60), inset 0 1px 0 rgba(255,255,255,0.04)",
          }}
        >
          <div className="max-h-80 overflow-y-auto p-2">
            {campaigns.map((campaign) => (
              <button
                key={campaign.id}
                type="button"
                onClick={() => {
                  setActiveCampaign(campaign);
                  setIsOpen(false);
                }}
                className="w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors hover:bg-white/5"
                style={{
                  color: activeCampaign?.id === campaign.id ? "#EDEDED" : "rgba(255,255,255,0.70)",
                  fontWeight: activeCampaign?.id === campaign.id ? 500 : 400,
                }}
              >
                <div className="font-medium">{campaign.name}</div>
                {campaign.clientName && (
                  <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.50)" }}>
                    {campaign.clientName}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

