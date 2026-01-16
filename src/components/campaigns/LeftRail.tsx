"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Gauge, FolderKanban, Wallet, Compass, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import type { DashboardMode } from "@/features/campaign-intelligence/CampaignIntelligenceDashboard";

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

interface LeftRailProps {
  selectedCampaignIds: string[];
  onCampaignChange: (ids: string[]) => void;
  onCampaignToggle?: (id: string) => void;
}

export function LeftRail({ selectedCampaignIds, onCampaignChange, onCampaignToggle }: LeftRailProps) {
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
        // Mock data
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

  const selectedCampaigns = campaigns.filter((c) => selectedCampaignIds.includes(c.id));
  const displayText =
    selectedCampaignIds.length === 0
      ? "All campaigns"
      : selectedCampaignIds.length === 1
        ? selectedCampaigns[0]?.name || "Campaign"
        : `${selectedCampaignIds.length} campaigns`;

  const toggleCampaign = (id: string) => {
    if (onCampaignToggle) {
      onCampaignToggle(id);
    } else {
      if (selectedCampaignIds.includes(id)) {
        onCampaignChange(selectedCampaignIds.filter((cid) => cid !== id));
      } else {
        onCampaignChange([...selectedCampaignIds, id]);
      }
    }
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-[280px] border-r border-white/5 bg-[#07070A] flex flex-col z-40">
      {/* Brand Block */}
      <div className="px-4 py-5 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#E5484D] to-[#C41E3A] text-[10px] font-bold text-white">
            CH
          </div>
          <span className="text-xs font-semibold tracking-tight text-white/90">Creator Hive</span>
        </div>
      </div>

      {/* Campaign Selector */}
      <div className="px-4 py-4 border-b border-white/5" ref={dropdownRef}>
        <div className="mb-2 text-[10px] font-medium uppercase tracking-[0.12em] text-white/40">
          Campaigns
        </div>
        <button
          onClick={() => setIsCampaignDropdownOpen(!isCampaignDropdownOpen)}
          className="flex w-full items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/90 hover:bg-white/10 transition-colors"
        >
          <span className="truncate">{displayText}</span>
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 text-white/50 transition-transform",
              isCampaignDropdownOpen && "rotate-180"
            )}
          />
        </button>

        {isCampaignDropdownOpen && (
          <div className="mt-2 rounded-lg border border-white/10 bg-[#0A0A0E] shadow-2xl">
            <div className="max-h-64 space-y-0.5 overflow-y-auto p-1.5">
              {campaigns.map((campaign) => {
                const isSelected = selectedCampaignIds.includes(campaign.id);
                return (
                  <button
                    key={campaign.id}
                    onClick={() => toggleCampaign(campaign.id)}
                    className="flex w-full items-center justify-between rounded-md px-2.5 py-2 text-xs text-white/80 hover:bg-white/5 transition-colors"
                  >
                    <span className="truncate">{campaign.name}</span>
                    {isSelected && (
                      <div className="h-1.5 w-1.5 rounded-full bg-[#E5484D] flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
            {selectedCampaignIds.length > 0 && (
              <button
                onClick={() => onCampaignChange([])}
                className="w-full border-t border-white/5 px-2.5 py-2 text-[10px] text-white/50 hover:text-white/80 hover:bg-white/5 transition-colors"
              >
                Clear selection
              </button>
            )}
          </div>
        )}
      </div>

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
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-all",
                isActive
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:bg-white/5 hover:text-white/80"
              )}
            >
              <Icon className="h-3.5 w-3.5 flex-shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Block */}
      <div className="border-t border-white/5 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-white/10 text-[10px] font-medium text-white/80">
            U
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-medium text-white/90 truncate">Agency</div>
            <div className="text-[9px] text-white/50 truncate">user@creator.hive</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
