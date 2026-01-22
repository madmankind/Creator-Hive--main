"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { feyTokens } from "@/lib/fey-design-tokens";
import { PillSegment } from "@/components/campaigns/primitives/PillSegment";
import { FeySurface } from "@/components/campaigns/primitives/FeySurface";
import { RightDrawer } from "@/components/campaigns/primitives/RightDrawer";
import { BottomDock } from "@/components/nav/BottomDock";
import { Search, Bookmark, Eye, Plus } from "lucide-react";

interface DiscoverScreenProps {
  selectedCampaignIds: string[];
}

interface Creator {
  id: string;
  name: string;
  handle: string;
  role: string;
  platform: string;
  followers: number;
  avgViews: number;
  er: number;
  rateRange: string;
  avatar?: string;
}

export function DiscoverScreen({ selectedCampaignIds }: DiscoverScreenProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [savedCreators, setSavedCreators] = useState<string[]>([]);

  const modes = [
    { value: "track", label: "Track" },
    { value: "manage", label: "Manage" },
    { value: "pay", label: "Pay" },
    { value: "discover", label: "Discover" },
  ];

  // Mock creators
  const creators: Creator[] = [
    {
      id: "1",
      name: "Sarah Chen",
      handle: "@sarahchen",
      role: "UGC Creator",
      platform: "Instagram",
      followers: 456700,
      avgViews: 125000,
      er: 4.2,
      rateRange: "AED 1.5K - 2.5K",
    },
    {
      id: "2",
      name: "Alex Nguyen",
      handle: "@alexnguyen",
      role: "Content Creator",
      platform: "TikTok",
      followers: 891200,
      avgViews: 450000,
      er: 3.5,
      rateRange: "AED 1.2K - 2.0K",
    },
    {
      id: "3",
      name: "Emily Smith",
      handle: "@emilysmith",
      role: "Videographer",
      platform: "YouTube",
      followers: 234500,
      avgViews: 89000,
      er: 3.4,
      rateRange: "AED 1.8K - 2.8K",
    },
  ];

  const handleViewCreator = (creator: Creator) => {
    setSelectedCreator(creator);
    setIsDrawerOpen(true);
  };

  const handleSaveCreator = (creatorId: string) => {
    if (savedCreators.includes(creatorId)) {
      setSavedCreators(savedCreators.filter((id) => id !== creatorId));
    } else {
      setSavedCreators([...savedCreators, creatorId]);
    }
  };

  const formatNumber = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  };

  return (
    <div className="min-h-screen" style={{ color: feyTokens.colors.text.primary }}>
      {/* Header Row */}
      <div
        className="sticky top-0 z-30 border-b px-6 py-4"
        style={{
          background: `${feyTokens.colors.base.dark}EE`,
          backdropFilter: "blur(20px)",
          borderColor: feyTokens.borders.default,
        }}
      >
        <div className="flex items-center justify-between">
          {/* Left: Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
                style={{ color: feyTokens.colors.text.muted }}
              />
              <input
                type="text"
                placeholder="Search creators, handles, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border pl-10 pr-4 py-2 text-xs bg-transparent transition-colors focus:outline-none focus:border-white/20"
                style={{
                  borderColor: feyTokens.borders.default,
                  color: feyTokens.colors.text.primary,
                }}
              />
            </div>
          </div>

          {/* Right: Mode Tabs */}
          <PillSegment
            options={modes}
            value="discover"
            onChange={(v) => router.push(`/dashboard/campaigns?mode=${v}`)}
            size="sm"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Left: Filters (placeholder) */}
          <div className="lg:col-span-1">
            <FeySurface variant="panel" overlay={true} padding="md">
              <div
                className="mb-3 text-xs font-semibold uppercase tracking-wider"
                style={{ color: feyTokens.colors.text.label }}
              >
                Filters
              </div>
              <div
                className="text-xs"
                style={{ color: feyTokens.colors.text.muted }}
              >
                Platform, location, follower range, ER%, category filters coming soon...
              </div>
            </FeySurface>
          </div>

          {/* Right: Results */}
          <div className="lg:col-span-2">
            <FeySurface variant="card" overlay={true} padding="none">
              <div
                className="border-b px-5 py-3.5"
                style={{ borderColor: feyTokens.borders.default }}
              >
                <div
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: feyTokens.colors.text.label }}
                >
                  Creators ({creators.length})
                </div>
              </div>
              <div className="divide-y" style={{ borderColor: feyTokens.borders.default }}>
                {creators.map((creator) => (
                  <div
                    key={creator.id}
                    className="flex items-center gap-4 px-5 py-4 transition-all hover:bg-white/5"
                  >
                    {/* Avatar */}
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-lg text-xs font-semibold flex-shrink-0"
                      style={{
                        background: `linear-gradient(135deg, ${feyTokens.colors.red.glow} 0%, ${feyTokens.colors.red.deep} 100%)`,
                        color: "white",
                      }}
                    >
                      {creator.name.charAt(0)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div
                        className="mb-1 text-xs font-semibold"
                        style={{ color: feyTokens.colors.text.primary }}
                      >
                        {creator.name}
                      </div>
                      <div
                        className="mb-1 text-[10px]"
                        style={{ color: feyTokens.colors.text.muted }}
                      >
                        {creator.handle} · {creator.role} · {creator.platform}
                      </div>
                      <div className="flex items-center gap-4 text-[10px]" style={{ color: feyTokens.colors.text.secondary }}>
                        <span>Followers: {formatNumber(creator.followers)}</span>
                        <span>Avg Views: {formatNumber(creator.avgViews)}</span>
                        <span>ER: {creator.er.toFixed(1)}%</span>
                        <span>{creator.rateRange}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSaveCreator(creator.id)}
                        className="rounded-lg border p-2 transition-colors hover:bg-white/10"
                        style={{
                          borderColor: savedCreators.includes(creator.id)
                            ? feyTokens.colors.red.glow
                            : feyTokens.borders.default,
                          color: savedCreators.includes(creator.id)
                            ? feyTokens.colors.red.glow
                            : feyTokens.colors.text.secondary,
                        }}
                      >
                        <Bookmark className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleViewCreator(creator)}
                        className="rounded-lg border px-3 py-2 text-xs font-medium transition-colors hover:bg-white/10"
                        style={{
                          borderColor: feyTokens.borders.default,
                          color: feyTokens.colors.text.secondary,
                        }}
                      >
                        <Eye className="h-3.5 w-3.5 inline mr-1" />
                        View
                      </button>
                      <button
                        className="rounded-lg border px-3 py-2 text-xs font-medium transition-colors hover:bg-white/10"
                        style={{
                          borderColor: feyTokens.colors.red.glow,
                          background: `${feyTokens.colors.red.glow}20`,
                          color: feyTokens.colors.red.glow,
                        }}
                      >
                        <Plus className="h-3.5 w-3.5 inline mr-1" />
                        Add to Campaign
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </FeySurface>
          </div>
        </div>
      </div>

      {/* Creator Profile Drawer */}
      <RightDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedCreator(null);
        }}
        title={selectedCreator ? `${selectedCreator.name} - Profile` : "Creator Profile"}
        width="520px"
      >
        {selectedCreator && (
          <div className="p-6 space-y-6">
            <div>
              <div
                className="mb-2 text-[10px] font-medium uppercase tracking-wider"
                style={{ color: feyTokens.colors.text.label }}
              >
                Overview
              </div>
              <div style={{ color: feyTokens.colors.text.secondary }}>
                {selectedCreator.handle} · {selectedCreator.role} · {selectedCreator.platform}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div
                  className="mb-1 text-[10px] font-medium uppercase tracking-wider"
                  style={{ color: feyTokens.colors.text.label }}
                >
                  Followers
                </div>
                <div
                  className="text-lg font-semibold"
                  style={{ color: feyTokens.colors.text.primary }}
                >
                  {formatNumber(selectedCreator.followers)}
                </div>
              </div>
              <div>
                <div
                  className="mb-1 text-[10px] font-medium uppercase tracking-wider"
                  style={{ color: feyTokens.colors.text.label }}
                >
                  Avg Views
                </div>
                <div
                  className="text-lg font-semibold"
                  style={{ color: feyTokens.colors.text.primary }}
                >
                  {formatNumber(selectedCreator.avgViews)}
                </div>
              </div>
              <div>
                <div
                  className="mb-1 text-[10px] font-medium uppercase tracking-wider"
                  style={{ color: feyTokens.colors.text.label }}
                >
                  ER%
                </div>
                <div
                  className="text-lg font-semibold"
                  style={{ color: feyTokens.colors.text.primary }}
                >
                  {selectedCreator.er.toFixed(1)}%
                </div>
              </div>
              <div>
                <div
                  className="mb-1 text-[10px] font-medium uppercase tracking-wider"
                  style={{ color: feyTokens.colors.text.label }}
                >
                  Rate Range
                </div>
                <div
                  className="text-lg font-semibold"
                  style={{ color: feyTokens.colors.text.primary }}
                >
                  {selectedCreator.rateRange}
                </div>
              </div>
            </div>
            <button
              className="w-full rounded-lg border px-4 py-3 text-xs font-medium transition-colors hover:bg-white/10"
              style={{
                borderColor: feyTokens.colors.red.glow,
                background: `${feyTokens.colors.red.glow}20`,
                color: feyTokens.colors.red.glow,
              }}
            >
              Add to Campaign Pod
            </button>
          </div>
        )}
      </RightDrawer>
      
      {/* Bottom Dock Navigation */}
      <BottomDock />
    </div>
  );
}







