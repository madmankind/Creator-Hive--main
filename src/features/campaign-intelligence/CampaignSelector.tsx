"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, X } from "lucide-react";
import { campaignTheme } from "@/lib/campaign-theme";

interface Campaign {
  id: string;
  name: string;
}

interface CampaignSelectorProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export function CampaignSelector({ selectedIds, onChange }: CampaignSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch campaigns
    fetch("/api/campaigns")
      .then((res) => res.json())
      .then((data) => {
        if (data.campaigns) {
          setCampaigns(data.campaigns);
        }
      })
      .catch(() => {
        // Mock data for now
        setCampaigns([
          { id: "1", name: "Brand Launch Campaign" },
          { id: "2", name: "Holiday Promo Series" },
          { id: "3", name: "New Product Initiative" },
        ]);
      });
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedCampaigns = campaigns.filter((c) => selectedIds.includes(c.id));
  const displayText =
    selectedCampaigns.length === 0
      ? "All campaigns"
      : selectedCampaigns.length === 1
        ? selectedCampaigns[0].name
        : `${selectedCampaigns.length} campaigns`;

  const toggleCampaign = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((cid) => cid !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm text-[#EDEDED] hover:bg-white/10 transition-colors"
      >
        <span>{displayText}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 rounded-xl border border-white/20 bg-[#0B0B0E] shadow-2xl z-50">
          <div className="p-2">
            <div className="mb-2 px-3 py-1.5 text-xs font-medium text-[#9B9B9B] uppercase tracking-wider">
              Select Campaigns
            </div>
            <div className="space-y-1">
              {campaigns.map((campaign) => {
                const isSelected = selectedIds.includes(campaign.id);
                return (
                  <button
                    key={campaign.id}
                    onClick={() => toggleCampaign(campaign.id)}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-[#EDEDED] hover:bg-white/10 transition-colors"
                  >
                    <span>{campaign.name}</span>
                    {isSelected && (
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: campaignTheme.colors.primary }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
            {selectedIds.length > 0 && (
              <button
                onClick={() => onChange([])}
                className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-[#9B9B9B] hover:bg-white/10 transition-colors"
              >
                <X className="h-3 w-3" />
                Clear selection
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}








