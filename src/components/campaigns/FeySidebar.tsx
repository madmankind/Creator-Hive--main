"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Gauge, FolderKanban, Wallet, Compass, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { feyTokens } from "@/lib/fey-design-tokens";
import type { DashboardMode } from "@/features/campaign-intelligence/CampaignIntelligenceDashboard";
import { useCampaign } from "@/contexts/CampaignContext";
// Wrapper component to safely use campaign context in sidebar
function SidebarCampaignSwitcher() {
  // Use dynamic import to avoid hook errors if context not available
  const [campaignName, setCampaignName] = useState<string>("Select campaign");
  
  useEffect(() => {
    try {
      const { useCampaign } = require("@/contexts/CampaignContext");
      // Can't use hooks conditionally, so we'll render a simple display
      // The actual switcher is in the gap area
    } catch {
      // Context not available
    }
  }, []);
  
  return (
    <div className="flex flex-col items-start gap-0.5">
      <div className="text-xs font-medium" style={{ color: "#8B8B8B" }}>
        Campaign
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-medium" style={{ color: "#EDEDED" }}>
          {campaignName}
        </span>
        <ChevronDown className="h-3.5 w-3.5" style={{ color: "#8B8B8B" }} />
      </div>
    </div>
  );
}

const navItems: Array<{
  mode: DashboardMode | "discover";
  label: string;
  icon: typeof Gauge;
}> = [
  { mode: "track", label: "Track", icon: Gauge },
  { mode: "manage", label: "Manage", icon: FolderKanban },
  { mode: "pay", label: "Pay", icon: Wallet },
  { mode: "discover", label: "Discover", icon: Compass },
];

interface FeySidebarProps {
  selectedCampaignIds: string[];
  onCampaignChange: (ids: string[]) => void;
}

export function FeySidebar({ selectedCampaignIds, onCampaignChange }: FeySidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentMode = (searchParams.get("mode") || "track") as DashboardMode;
  const [campaigns, setCampaigns] = useState<Array<{ id: string; name: string }>>([]);
  const [isCampaignDropdownOpen, setIsCampaignDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  

  useEffect(() => {
    fetch("/api/campaigns")
      .then((res) => res.json())
      .then((data) => {
        if (data.campaigns) {
          setCampaigns(data.campaigns);
        }
      })
      .catch(() => {
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
        setIsCampaignDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleCampaign = (id: string) => {
    if (selectedCampaignIds.includes(id)) {
      onCampaignChange(selectedCampaignIds.filter((cid) => cid !== id));
    } else {
      onCampaignChange([...selectedCampaignIds, id]);
    }
  };

  const displayText =
    selectedCampaignIds.length === 0
      ? "All campaigns"
      : selectedCampaignIds.length === 1
        ? campaigns.find((c) => c.id === selectedCampaignIds[0])?.name || "Campaign"
        : `${selectedCampaignIds.length} campaigns`;

  return (
    <aside
      className="fixed left-0 top-0 z-40 h-screen w-[280px] flex flex-col"
      style={{
        background: feyTokens.colors.base.dark,
      }}
    >
      {/* Brand Block */}
      <div className="px-4 py-5">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[10px] font-bold text-white"
            style={{
              background: "linear-gradient(135deg, rgba(91,63,214,0.90) 0%, rgba(42,30,92,0.95) 100%)",
            }}
          >
            CH
          </div>
          <span
            className="text-xs font-semibold tracking-tight"
            style={{ color: feyTokens.colors.text.primary }}
          >
            Creator Hive
          </span>
        </div>
      </div>

      {/* Campaign Selector - Hidden in Track mode (selector is in Track card) */}
      {currentMode !== "track" && (
        <div
          className="px-4 py-4"
          ref={dropdownRef}
        >
          <div
            className="mb-2 text-[10px] font-medium uppercase tracking-wider"
            style={{ color: feyTokens.colors.text.label }}
          >
            Campaigns
          </div>
          <button
            onClick={() => setIsCampaignDropdownOpen(!isCampaignDropdownOpen)}
            className="flex w-full items-center justify-between rounded-lg border px-3 py-2 text-xs transition-all hover:border-white/10"
            style={{
              borderColor: "rgba(255,255,255,0.06)",
              color: feyTokens.colors.text.secondary,
              background: "rgba(255,255,255,0.02)",
              backdropFilter: "blur(10px)",
            }}
          >
            <span className="truncate">{displayText}</span>
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 transition-transform flex-shrink-0",
                isCampaignDropdownOpen && "rotate-180"
              )}
              style={{ color: feyTokens.colors.text.muted }}
            />
          </button>

          {isCampaignDropdownOpen && (
            <div
              className="mt-2 rounded-lg border shadow-2xl"
              style={{
                borderColor: feyTokens.glass.panel.border,
                background: feyTokens.colors.base.darker,
                boxShadow: feyTokens.shadows.surface,
              }}
            >
              <div className="max-h-64 space-y-0.5 overflow-y-auto p-1.5">
                {campaigns.map((campaign) => {
                  const isSelected = selectedCampaignIds.includes(campaign.id);
                  return (
                    <button
                      key={campaign.id}
                      onClick={() => toggleCampaign(campaign.id)}
                      className="flex w-full items-center justify-between rounded-md px-2.5 py-2 text-xs transition-colors hover:bg-white/5"
                      style={{ color: feyTokens.colors.text.secondary }}
                    >
                      <span className="truncate">{campaign.name}</span>
                      {isSelected && (
                        <div
                          className="h-1.5 w-1.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: "#5B3FD6" }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
              {selectedCampaignIds.length > 0 && (
                <button
                  onClick={() => onCampaignChange([])}
                  className="w-full border-t px-2.5 py-2 text-[10px] transition-colors hover:bg-white/5"
                  style={{
                    borderColor: feyTokens.glass.panel.border,
                    color: feyTokens.colors.text.muted,
                  }}
                >
                  Clear selection
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Main Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-0.5">
        {navItems.map((item) => {
          const isActive =
            item.mode === "discover"
              ? pathname === "/dashboard/discover" || pathname.startsWith("/dashboard/discover")
              : currentMode === item.mode;
          const Icon = item.icon;
          const href =
            item.mode === "discover"
              ? "/dashboard/discover"
              : `/dashboard/campaigns?mode=${item.mode}`;

          return (
            <Link
              key={item.mode}
              href={href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all relative",
                isActive ? "" : "hover:bg-white/5"
              )}
              style={{
                color: isActive ? feyTokens.colors.text.primary : feyTokens.colors.text.secondary,
              }}
            >
              {isActive && (
                <>
                  <div
                    className="absolute inset-0 rounded-lg"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  />
                  <div
                    className="absolute left-0 top-0 bottom-0 w-[2px] rounded-r"
                    style={{ backgroundColor: "rgba(255,255,255,0.20)" }}
                  />
                </>
              )}
              <Icon className="h-3 w-3 flex-shrink-0 relative z-10" />
              <span className="relative z-10">{item.label}</span>
            </Link>
          );
        })}
      </nav>


      {/* Secondary Nav */}
      <div className="px-2 pb-2 space-y-0.5">
        {[
          { href: "/dashboard/contracts", label: "Contracts" },
          { href: "/dashboard/messages",  label: "Messages" },
          { href: "/dashboard/wallet",    label: "Wallet" },
          { href: "/dashboard/invites",   label: "Invites" },
        ].map(({ href, label }) => (
          <Link key={href} href={href}
            className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-[10px] transition-colors hover:bg-white/5"
            style={{ color: "rgba(255,255,255,0.45)" }}>
            {label}
          </Link>
        ))}
      </div>

      {/* User Block */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-6 w-6 items-center justify-center rounded-md text-[10px] font-medium"
            style={{
              background: feyTokens.glass.panel.background,
              border: `1px solid ${feyTokens.glass.panel.border}`,
              color: feyTokens.colors.text.secondary,
            }}
          >
            U
          </div>
          <div className="min-w-0 flex-1">
            <div
              className="text-[10px] font-medium truncate"
              style={{ color: feyTokens.colors.text.primary }}
            >
              Agency
            </div>
            <div
              className="text-[9px] truncate"
              style={{ color: feyTokens.colors.text.muted }}
            >
              user@creator.hive
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

