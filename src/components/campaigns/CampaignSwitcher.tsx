"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Copy } from "lucide-react";
import { useCampaign } from "@/contexts/CampaignContext";
import { useLocalCampaignStore } from "@/store/useLocalCampaignStore";

export function CampaignSwitcher() {
  const { activeCampaign, campaigns, setActiveCampaign } = useCampaign();
  const [isOpen, setIsOpen] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setDuplicating(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDuplicateTo = (targetId: string) => {
    const target = campaigns.find((c) => c.id === targetId);
    if (!target || !activeCampaign) return;
    // Clone the active campaign's identity under the target campaign name
    const cloned = {
      ...activeCampaign,
      id: targetId,
      name: target.name,
    };
    useLocalCampaignStore.getState().removeCampaign(targetId);
    useLocalCampaignStore.getState().addCampaign(cloned);
    setActiveCampaign(cloned);
    setIsOpen(false);
    setDuplicating(false);
  };

  const otherCampaigns = campaigns.filter((c) => c.id !== activeCampaign?.id);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => { setIsOpen(!isOpen); setDuplicating(false); }}
        className="flex flex-col items-start gap-0.5 transition-opacity hover:opacity-80"
        style={{ cursor: "pointer" }}
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
          className="absolute left-0 mt-2 w-[280px] rounded-2xl shadow-2xl z-50 overflow-hidden"
          style={{
            background: "rgba(10,10,14,0.97)",
            border: "1px solid rgba(255,255,255,0.10)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            boxShadow: "0 30px 60px rgba(0,0,0,0.70), inset 0 1px 0 rgba(255,255,255,0.04)",
          }}
        >
          {/* Campaign list */}
          {!duplicating && (
            <div className="max-h-64 overflow-y-auto p-1.5">
              {campaigns.length === 0 && (
                <p className="px-3 py-3 text-[12px]" style={{ color: "rgba(255,255,255,0.35)" }}>
                  No campaigns yet
                </p>
              )}
              {campaigns.map((campaign) => (
                <button
                  key={campaign.id}
                  type="button"
                  onClick={() => {
                    setActiveCampaign(campaign);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-sm transition-colors hover:bg-white/5"
                  style={{
                    color: activeCampaign?.id === campaign.id ? "#EDEDED" : "rgba(255,255,255,0.65)",
                    fontWeight: activeCampaign?.id === campaign.id ? 500 : 400,
                  }}
                >
                  <div className="font-medium">{campaign.name}</div>
                  {campaign.clientName && (
                    <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.40)" }}>
                      {campaign.clientName}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Duplicate team sub-view */}
          {duplicating && (
            <div className="p-1.5">
              <p
                className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em]"
                style={{ color: "rgba(255,255,255,0.30)" }}
              >
                Duplicate team to…
              </p>
              {otherCampaigns.length === 0 && (
                <p className="px-3 pb-3 text-[12px]" style={{ color: "rgba(255,255,255,0.35)" }}>
                  No other campaigns
                </p>
              )}
              {otherCampaigns.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleDuplicateTo(c.id)}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-sm transition-colors hover:bg-white/5"
                  style={{ color: "rgba(255,255,255,0.70)" }}
                >
                  {c.name}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setDuplicating(false)}
                className="w-full text-left px-3 py-2 rounded-xl text-[11px] transition-colors hover:bg-white/5 mt-1"
                style={{ color: "rgba(255,255,255,0.30)" }}
              >
                ← Back
              </button>
            </div>
          )}

          {/* Divider + actions */}
          {!duplicating && activeCampaign && (
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }} className="p-1.5">
              <button
                type="button"
                onClick={() => setDuplicating(true)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] transition-colors hover:bg-white/5"
                style={{ color: "rgba(255,255,255,0.45)" }}
              >
                <Copy size={12} />
                Duplicate team to another campaign
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
