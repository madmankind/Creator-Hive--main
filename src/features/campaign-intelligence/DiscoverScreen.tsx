"use client";

import { useState, useMemo, useCallback } from "react";
import { feyTokens } from "@/lib/fey-design-tokens";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { RightDrawer } from "@/components/campaigns/primitives/RightDrawer";
import { TalentCard } from "@/components/talent/TalentCard";
import { QuickBookPanel } from "@/components/campaigns/QuickBookPanel";
import { Search, X, Plus } from "lucide-react";
import { DEFAULT_ROLES } from "@/lib/roles";
import type { Talent } from "@/store/useCampaignPodStore";
import { curatedTalent } from "@/lib/curatedTalent";
import { useCampaign } from "@/contexts/CampaignContext";
import { useCampaignPodStore } from "@/store/useCampaignPodStore";

interface DiscoverScreenProps {
  selectedCampaignIds: string[];
}

const ROLE_ACCENT: Record<string, string> = {
  "UGC Creator": "rgba(168,85,247,0.5)",
  "Content Creator": "rgba(34,211,238,0.5)",
  Videographer: "rgba(34,197,94,0.5)",
  Photographer: "rgba(234,179,8,0.5)",
  Copywriter: "rgba(132,204,22,0.5)",
  Editor: "rgba(6,182,212,0.5)",
  Influencer: "rgba(249,115,22,0.5)",
};
const DEFAULT_ACCENT = "rgba(255,255,255,0.3)";
const accent = (r: string) => ROLE_ACCENT[r] ?? DEFAULT_ACCENT;

// Map curatedTalent to Talent shape
const CURATED_FALLBACK: Talent[] = curatedTalent.map((t) => ({
  id: t.id,
  name: t.name,
  headline: t.displayTitle,
  avatarUrl: t.profileImageUrl ?? t.avatarUrl,
  roles: t.roleTags as string[],
  platforms: t.platformTags,
  bio: t.shortBio,
}));

export function DiscoverScreen({ selectedCampaignIds }: DiscoverScreenProps) {
  const { activeCampaign } = useCampaign();
  const podStore = useCampaignPodStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedTalents, setSelectedTalents] = useState<Talent[]>([]);
  const [profileTalent, setProfileTalent] = useState<Talent | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [showQuickBook, setShowQuickBook] = useState(false);

  const selectedIds = useMemo(() => new Set(selectedTalents.map((t) => t.id)), [selectedTalents]);

  const toggleRole = useCallback((r: string) => {
    setSelectedRoles((prev) => prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]);
  }, []);

  // Filter curated talent by search + role
  const items: Talent[] = useMemo(() => {
    return CURATED_FALLBACK.filter((t) => {
      const matchesSearch =
        !searchQuery ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.headline ?? "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole =
        selectedRoles.length === 0 || t.roles.some((r) => selectedRoles.includes(r));
      return matchesSearch && matchesRole;
    });
  }, [searchQuery, selectedRoles]);

  const addTalent = useCallback((t: Talent) => {
    setSelectedTalents((prev) => prev.some((x) => x.id === t.id) ? prev : [...prev, t]);
  }, []);

  const removeTalent = useCallback((id: string) => {
    setSelectedTalents((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const handleAddToCampaign = () => {
    // Add to pod store so campaign sees them
    selectedTalents.forEach((t) => podStore.addToPod(t));
    setSelectedTalents([]);
  };

  // Header: search + role filter pills
  const headerLeft = (
    <div className="flex items-center gap-3 flex-1 min-w-0">
      <div className="relative" style={{ width: "240px" }}>
        <Search
          size={13}
          className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: feyTokens.colors.text.muted }}
        />
        <input
          type="text"
          placeholder="Search creators…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg pl-8 pr-3 py-1.5 text-[12px] bg-transparent border focus:outline-none"
          style={{
            borderColor: "rgba(255,255,255,0.08)",
            color: feyTokens.colors.text.primary,
            background: "rgba(255,255,255,0.04)",
          }}
        />
      </div>
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
        {DEFAULT_ROLES.slice(0, 7).map((r) => {
          const active = selectedRoles.includes(r);
          return (
            <button
              key={r}
              onClick={() => toggleRole(r)}
              className="flex-shrink-0 rounded-full px-3 py-1 text-[11px] transition-all"
              style={{
                background: active ? accent(r) : "rgba(255,255,255,0.05)",
                color: active ? "rgba(255,255,255,0.95)" : feyTokens.colors.text.muted,
                border: `1px solid ${active ? accent(r) : "rgba(255,255,255,0.07)"}`,
              }}
            >
              {r}
            </button>
          );
        })}
      </div>
    </div>
  );

  const headerRight = (
    <button
      onClick={() => setShowQuickBook((v) => !v)}
      className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] transition-all"
      style={{
        background: showQuickBook ? "rgba(124,92,255,0.15)" : "rgba(255,255,255,0.04)",
        border: `1px solid ${showQuickBook ? "rgba(124,92,255,0.35)" : "rgba(255,255,255,0.07)"}`,
        color: showQuickBook ? "rgba(167,139,250,0.9)" : feyTokens.colors.text.muted,
      }}
    >
      <Plus size={13} />
      New Campaign
    </button>
  );


  return (
    <>
      <DashboardShell headerLeft={headerLeft} headerRight={headerRight}>
        {/* Quick Book expandable section */}
        {showQuickBook && (
          <div className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em]"
                style={{ color: feyTokens.colors.text.label }}>
                New Campaign
              </p>
              <button
                onClick={() => setShowQuickBook(false)}
                className="flex items-center justify-center rounded-full w-6 h-6 transition-colors hover:bg-white/10"
                style={{ color: feyTokens.colors.text.muted }}
              >
                <X size={12} />
              </button>
            </div>
            <QuickBookPanel />
            <div className="mt-6" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }} />
          </div>
        )}

        {/* Talent count */}
        <div className="mb-5 flex items-center justify-between">
          <p className="text-[11px]" style={{ color: feyTokens.colors.text.muted }}>
            {items.length} creators
            {activeCampaign ? ` — adding to ${activeCampaign.name}` : ""}
          </p>
          {selectedRoles.length > 0 && (
            <button
              onClick={() => setSelectedRoles([])}
              className="text-[11px] transition-colors"
              style={{ color: "rgba(167,139,250,0.7)" }}
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Inline talent grid */}
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            paddingBottom: selectedTalents.length > 0 ? "100px" : "0",
          }}
        >
          {items.map((t) => (
            <TalentCard
              key={t.id}
              talent={t}
              variant="discover"
              isAdded={selectedIds.has(t.id)}
              onAdd={addTalent}
              onOpenProfile={(talent) => {
                setProfileTalent(talent);
                setProfileOpen(true);
              }}
            />
          ))}
          {items.length === 0 && (
            <div className="col-span-full text-center py-16">
              <p className="text-[13px]" style={{ color: feyTokens.colors.text.muted }}>
                No creators found. Try a different search.
              </p>
            </div>
          )}
        </div>
      </DashboardShell>

      {/* Selection tray — fixed above dock */}
      {selectedTalents.length > 0 && (
        <div
          className="fixed left-0 right-0 z-40 flex items-center gap-3 px-6 py-3"
          style={{
            bottom: "calc(88px + 8px)",
            background: "rgba(10,10,14,0.97)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div className="flex flex-1 gap-2 overflow-x-auto scrollbar-hide items-center">
            {selectedTalents.map((t) => (
              <div
                key={t.id}
                className="flex-shrink-0 flex items-center gap-2 rounded-xl px-3 py-1.5"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div
                  className="h-6 w-6 rounded-full flex items-center justify-center text-[9px] font-medium"
                  style={{ background: "rgba(255,255,255,0.1)" }}
                >
                  {t.name.charAt(0)}
                </div>
                <span className="text-[11px] max-w-[80px] truncate" style={{ color: feyTokens.colors.text.primary }}>
                  {t.name}
                </span>
                <button
                  onClick={() => removeTalent(t.id)}
                  className="p-0.5 rounded hover:bg-white/10 transition"
                  style={{ color: feyTokens.colors.text.muted }}
                >
                  <X size={11} />
                </button>
              </div>
            ))}
          </div>
          <button
            className="flex-shrink-0 rounded-lg px-5 py-2 text-[12px] font-semibold transition-all hover:opacity-90"
            style={{ background: "rgba(255,255,255,0.95)", color: "#07070B" }}
            onClick={handleAddToCampaign}
          >
            Add {selectedTalents.length} creator{selectedTalents.length !== 1 ? "s" : ""}
          </button>
        </div>
      )}

      {/* Creator profile drawer */}
      <RightDrawer
        isOpen={profileOpen}
        onClose={() => { setProfileOpen(false); setProfileTalent(null); }}
        title={profileTalent ? `${profileTalent.name} — Profile` : "Creator Profile"}
        width="480px"
      >
        {profileTalent && (
          <div className="p-6 space-y-5">
            {profileTalent.headline && (
              <p className="text-[13px]" style={{ color: feyTokens.colors.text.secondary }}>
                {profileTalent.headline}
              </p>
            )}
            {profileTalent.bio && (
              <p className="text-[13px]" style={{ color: feyTokens.colors.text.secondary }}>
                {profileTalent.bio}
              </p>
            )}
            <button
              onClick={() => {
                addTalent(profileTalent);
                setProfileOpen(false);
                setProfileTalent(null);
              }}
              className="w-full rounded-lg px-4 py-3 text-[12px] font-semibold transition-all hover:opacity-90"
              style={{
                background: "rgba(124,92,255,0.15)",
                border: "1px solid rgba(124,92,255,0.35)",
                color: "rgba(167,139,250,0.95)",
              }}
            >
              Add to selection
            </button>
          </div>
        )}
      </RightDrawer>
    </>
  );
}
