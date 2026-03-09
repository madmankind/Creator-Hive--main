"use client";

import { useState, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { feyTokens } from "@/lib/fey-design-tokens";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { RightDrawer } from "@/components/campaigns/primitives/RightDrawer";
import { BottomDock } from "@/components/nav/BottomDock";
import { TalentCard } from "@/components/talent/TalentCard";
import { QuickBookPanel } from "@/components/campaigns/QuickBookPanel";
import { Search, X, ArrowUpRight } from "lucide-react";
import { DEFAULT_ROLES } from "@/lib/roles";
import type { Talent } from "@/store/useCampaignPodStore";
import { curatedTalent } from "@/lib/curatedTalent";
import { useCampaign } from "@/contexts/CampaignContext";

interface DiscoverScreenProps {
  selectedCampaignIds: string[];
}

const fetcher = (u: string, init?: RequestInit) => fetch(u, init).then((r) => r.json());

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

function apiToTalent(it: {
  id: string; fullName?: string; username?: string;
  roles?: string[]; avatarUrl?: string; bio?: string;
}): Talent {
  return {
    id: it.id,
    name: it.fullName || it.username || "Unnamed",
    headline: it.roles?.slice(0, 2).join(" · "),
    avatarUrl: it.avatarUrl,
    roles: it.roles ?? [],
    platforms: [],
    bio: it.bio,
  };
}

// Map curatedTalent to Talent shape for fallback
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
  const { data: session } = useSession();
  const { activeCampaign } = useCampaign();
  const router = useRouter();
  const isAuthenticated = Boolean(session?.user);

  // Fullscreen talent overlay state
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedTalents, setSelectedTalents] = useState<Talent[]>([]);
  const [profileTalent, setProfileTalent] = useState<Talent | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  const selectedIds = useMemo(() => new Set(selectedTalents.map((t) => t.id)), [selectedTalents]);
  const toggleRole = useCallback((r: string) => {
    setSelectedRoles((prev) => prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]);
  }, []);

  const body = useMemo(() => ({
    page: 0, pageSize: 80, sort: { field: "name", direction: "asc" as const },
    filter: {
      keywords: searchQuery.trim() || undefined,
      roles: selectedRoles.length > 0 ? selectedRoles : undefined,
    },
  }), [searchQuery, selectedRoles]);

  const { data, isLoading, error } = useSWR(
    overlayOpen && isAuthenticated ? ["/api/discovery/search", JSON.stringify(body)] : null,
    ([u, b]) => fetcher(u, { method: "POST", body: b }),
    { revalidateOnFocus: false }
  );

  // Use API results when available, fall back to curated talent
  const apiItems: Talent[] = useMemo(() => (data?.data ?? data?.results ?? []).map(apiToTalent), [data]);
  const items: Talent[] = useMemo(() => {
    if (!isLoading && apiItems.length === 0) {
      // Filter curated by search/role when API is empty
      return CURATED_FALLBACK.filter((t) => {
        const matchesSearch = !searchQuery || t.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = selectedRoles.length === 0 || t.roles.some((r) => selectedRoles.includes(r));
        return matchesSearch && matchesRole;
      });
    }
    return apiItems;
  }, [apiItems, isLoading, searchQuery, selectedRoles]);

  const addTalent = useCallback((t: Talent) => {
    setSelectedTalents((prev) => prev.some((x) => x.id === t.id) ? prev : [...prev, t]);
  }, []);
  const removeTalent = useCallback((id: string) => {
    setSelectedTalents((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const headerLeft = (
    <div className="flex items-center gap-2">
      <span className="text-[13px] font-medium" style={{ color: feyTokens.colors.text.primary }}>
        Discover
      </span>
    </div>
  );

  return (
    <>
      <DashboardShell headerLeft={headerLeft}>
        {/* Quick Book section */}
        <div className="mb-10">
          <div className="flex items-end justify-between mb-6">
            <div>
              <p
                className="text-[10px] font-semibold uppercase tracking-[0.14em] mb-1"
                style={{ color: feyTokens.colors.text.label }}
              >
                Quick Book
              </p>
              <h2
                className="text-[20px] font-light tracking-[-0.02em]"
                style={{ color: feyTokens.colors.text.primary }}
              >
                Book a New Campaign
              </h2>
            </div>
          </div>
          <QuickBookPanel />
        </div>

        {/* Divider */}
        <div className="mb-8" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }} />

        {/* Browse Talent CTA — navigates to landing page to book additional talent */}
        <div
          className="flex items-center justify-between rounded-2xl p-6 cursor-pointer group transition-all"
          style={{
            background: "rgba(124,92,255,0.07)",
            border: "1px solid rgba(124,92,255,0.18)",
          }}
          onClick={() => {
            const params = new URLSearchParams();
            params.set("fromDashboard", "1");
            if (activeCampaign?.id) params.set("campaignId", activeCampaign.id);
            router.push(`/?${params.toString()}`);
          }}
        >
          <div>
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.14em] mb-1"
              style={{ color: "rgba(167,139,250,0.6)" }}
            >
              Browse Talent
            </p>
            <h3
              className="text-[18px] font-light tracking-[-0.02em]"
              style={{ color: feyTokens.colors.text.primary }}
            >
              Discover Creators
            </h3>
            <p className="text-[12px] mt-1" style={{ color: feyTokens.colors.text.muted }}>
              Search, filter, and add vetted creators to your next campaign
            </p>
          </div>
          <div
            className="flex items-center justify-center rounded-full transition-all group-hover:scale-105"
            style={{
              width: "48px", height: "48px",
              background: "rgba(124,92,255,0.15)",
              border: "1px solid rgba(124,92,255,0.3)",
              color: "rgba(167,139,250,0.9)",
            }}
          >
            <ArrowUpRight size={20} />
          </div>
        </div>
      </DashboardShell>

      {/* ── Fullscreen talent overlay ── */}
      {overlayOpen && (
        <div
          className="fixed inset-0 z-60 flex flex-col"
          style={{ background: "#07070B" }}
        >
          {/* Ambient glow (same shell background) */}
          <div
            className="fixed inset-0 pointer-events-none bg-hive-radial opacity-70"
            style={{
              maskImage: "radial-gradient(70% 70% at 50% 20%, black 0%, black 55%, transparent 85%)",
              WebkitMaskImage: "radial-gradient(70% 70% at 50% 20%, black 0%, black 55%, transparent 85%)",
            }}
          />
          <div
            className="fixed inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(1200px 800px at 55% 35%, rgba(124,92,255,0.18) 0%, rgba(0,0,0,0) 62%)",
              filter: "blur(10px)",
            }}
          />

          {/* Overlay header */}
          <div
            className="relative z-10 flex-shrink-0 flex items-center gap-4 px-8"
            style={{
              height: "64px",
              background: "transparent",
            }}
          >
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: feyTokens.colors.text.muted }}
              />
              <input
                autoFocus
                type="text"
                placeholder="Search creators, roles, handles…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg pl-9 pr-4 py-2 text-[13px] bg-transparent border focus:outline-none"
                style={{
                  borderColor: "rgba(255,255,255,0.10)",
                  color: feyTokens.colors.text.primary,
                }}
              />
            </div>

            {/* Role filter pills */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
              {DEFAULT_ROLES.slice(0, 8).map((r) => {
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

            {/* Close */}
            <button
              onClick={() => setOverlayOpen(false)}
              className="flex-shrink-0 flex items-center justify-center rounded-full transition-colors hover:bg-white/10"
              style={{
                width: "36px", height: "36px",
                border: "1px solid rgba(255,255,255,0.10)",
                color: feyTokens.colors.text.muted,
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Talent grid */}
          <div
            className="relative z-10 flex-1 overflow-y-auto px-8 py-6"
            style={{ paddingBottom: selectedTalents.length > 0 ? "120px" : "32px" }}
          >
            {isLoading && (
              <p className="text-[12px] py-8 text-center" style={{ color: feyTokens.colors.text.muted }}>
                Loading creators…
              </p>
            )}
            {!isLoading && items.length === 0 && (
              <p className="text-[12px] py-8 text-center" style={{ color: feyTokens.colors.text.muted }}>
                No creators found. Try a different search.
              </p>
            )}
            {!isLoading && items.length > 0 && (
              <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
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
              </div>
            )}
          </div>

          {/* Selection tray */}
          {selectedTalents.length > 0 && (
            <div
              className="relative z-20 flex-shrink-0 flex items-center gap-3 px-6 py-3"
              style={{
                background: "rgba(10,10,14,0.96)",
                backdropFilter: "blur(20px)",
                borderTop: "1px solid rgba(255,255,255,0.08)",
                bottom: 0,
              }}
            >
              <div className="flex flex-1 gap-2 overflow-x-auto scrollbar-hide items-center">
                {selectedTalents.map((t) => (
                  <div
                    key={t.id}
                    className="flex-shrink-0 flex items-center gap-2 rounded-xl px-3 py-2"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <div
                      className="h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-medium"
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
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                className="flex-shrink-0 rounded-lg px-5 py-2.5 text-[12px] font-semibold transition-all hover:opacity-90"
                style={{ background: "rgba(255,255,255,0.95)", color: "#07070B" }}
                onClick={() => {
                  setOverlayOpen(false);
                  // TODO: wire to campaign pod store
                }}
              >
                Add {selectedTalents.length} creator{selectedTalents.length !== 1 ? "s" : ""}
              </button>
            </div>
          )}
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

      <BottomDock />
    </>
  );
}
