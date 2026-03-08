"use client";

import { useState, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { feyTokens } from "@/lib/fey-design-tokens";
import { FeySurface } from "@/components/campaigns/primitives/FeySurface";
import { RightDrawer } from "@/components/campaigns/primitives/RightDrawer";
import { BottomDock } from "@/components/nav/BottomDock";
import { TalentCard } from "@/components/talent/TalentCard";
import { Search, X } from "lucide-react";
import { DEFAULT_ROLES } from "@/lib/roles";
import type { Talent } from "@/store/useCampaignPodStore";
import { QuickBookPanel } from "@/components/campaigns/QuickBookPanel";

interface DiscoverScreenProps {
  selectedCampaignIds: string[];
}

const fetcher = (u: string, init?: RequestInit) => fetch(u, init).then((r) => r.json());

/** Muted, Fey-compatible accent per role. Subdued, not neon. */
const ROLE_ACCENT_MAP: Record<string, string> = {
  "UGC Creator": "rgba(168,85,247,0.45)",
  "Content Creator": "rgba(34,211,238,0.45)",
  Videographer: "rgba(34,197,94,0.45)",
  Photographer: "rgba(234,179,8,0.45)",
  "Content Strategist": "rgba(236,72,153,0.4)",
  Influencer: "rgba(249,115,22,0.45)",
  Celebrity: "rgba(239,68,68,0.4)",
  Developer: "rgba(59,130,246,0.45)",
  "Brand Designer": "rgba(139,92,246,0.4)",
  "Product Designer": "rgba(20,184,166,0.45)",
  "Motion Designer": "rgba(244,63,94,0.4)",
  "Art Director": "rgba(251,146,60,0.45)",
  Copywriter: "rgba(132,204,22,0.45)",
  Producer: "rgba(99,102,241,0.4)",
  "Social Media Manager": "rgba(168,85,247,0.4)",
  Editor: "rgba(6,182,212,0.45)",
  Animator: "rgba(251,113,133,0.4)",
};
const DEFAULT_ACCENT = "rgba(255,255,255,0.25)";

function getRoleAccent(role: string): string {
  return ROLE_ACCENT_MAP[role] ?? DEFAULT_ACCENT;
}

function apiItemToTalent(it: {
  id: string;
  fullName?: string;
  username?: string;
  roles?: string[];
  avatarUrl?: string;
  bio?: string;
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

export function DiscoverScreen({ selectedCampaignIds }: DiscoverScreenProps) {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const isAuthenticated = Boolean(session?.user);

  // selectedRoles: from URL on init, then local state. Role chips in Filters toggle.
  const [selectedRoles, setSelectedRoles] = useState<string[]>(() => {
    const r = searchParams.get("roles");
    if (!r) return [];
    return r
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTalent, setSelectedTalent] = useState<Talent | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedTalents, setSelectedTalents] = useState<Talent[]>([]);

  const selectedTalentIds = useMemo(() => new Set(selectedTalents.map((t) => t.id)), [selectedTalents]);

  const toggleRole = useCallback((role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  }, []);

  const body = useMemo(
    () => ({
      page: 0,
      pageSize: 80,
      sort: { field: "name", direction: "asc" as const },
      filter: {
        keywords: searchQuery.trim() || undefined,
        roles: selectedRoles.length > 0 ? selectedRoles : undefined,
      },
    }),
    [searchQuery, selectedRoles]
  );

  const { data, isLoading, error } = useSWR(
    isAuthenticated ? ["/api/discovery/search", JSON.stringify(body)] : null,
    ([u, b]) => fetcher(u, { method: "POST", body: b }),
    { revalidateOnFocus: false }
  );

  const items: Talent[] = useMemo(() => {
    const raw = data?.data ?? data?.results ?? [];
    return raw.map(apiItemToTalent);
  }, [data]);

  // Lanes: if no roles selected, one "All" lane; else one lane per selected role.
  const lanes = useMemo(() => {
    if (selectedRoles.length === 0) {
      return [{ role: "All", talents: items }];
    }
    return selectedRoles.map((role) => ({
      role,
      talents: items.filter((t) => t.roles.some((r) => r === role)),
    }));
  }, [selectedRoles, items]);

  const addToSelection = useCallback((t: Talent) => {
    setSelectedTalents((prev) => (prev.some((x) => x.id === t.id) ? prev : [...prev, t]));
  }, []);

  const removeFromSelection = useCallback((id: string) => {
    setSelectedTalents((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const handleViewCreator = (talent: Talent) => {
    setSelectedTalent(talent);
    setIsDrawerOpen(true);
  };

  const trayHeight = 72;
  const bottomDockHeight = 88;
  const mainPaddingBottom = selectedTalents.length > 0
    ? `calc(${bottomDockHeight}px + 16px + ${trayHeight}px)`
    : `calc(${bottomDockHeight}px + 16px)`;

  return (
    <div className="min-h-screen" style={{ color: feyTokens.colors.text.primary }}>
      {/* Header */}
      <div
        className="sticky top-0 z-30 border-b px-6 py-4"
        style={{
          background: `${feyTokens.colors.base.dark}EE`,
          backdropFilter: "blur(20px)",
          borderColor: feyTokens.borders.default,
        }}
      >
        <div className="flex items-center justify-between">
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
        </div>
      </div>

      {/* Main: Quick Book + Filters + Lanes */}
      <div
        className="px-6 py-6 overflow-y-auto"
        style={{ maxHeight: "calc(100vh - 80px)", paddingBottom: mainPaddingBottom }}
      >
        {/* ── Quick Book New Campaign ── */}
        <div className="mb-10">
          <div className="flex items-baseline justify-between mb-5">
            <div>
              <p className="text-[10px] font-medium tracking-[0.12em] uppercase text-white/25 mb-1">Quick Book</p>
              <h2 className="text-[18px] font-light text-white/80 tracking-[-0.02em]">Book a New Campaign</h2>
            </div>
          </div>
          <QuickBookPanel />
        </div>

        {/* ── Divider ── */}
        <div className="border-t border-white/[0.06] mb-8" />

        {/* ── Discover Talent ── */}
        <div className="mb-5">
          <p className="text-[10px] font-medium tracking-[0.12em] uppercase text-white/25 mb-1">Browse Talent</p>
          <h2 className="text-[18px] font-light text-white/80 tracking-[-0.02em]">Discover Creators</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Filters: role chips */}
          <div className="lg:col-span-1">
            <FeySurface variant="panel" overlay={true} padding="md">
              <div
                className="mb-3 text-xs font-semibold uppercase tracking-wider"
                style={{ color: feyTokens.colors.text.label }}
              >
                Roles
              </div>
              <div className="flex flex-wrap gap-2">
                {DEFAULT_ROLES.slice(0, 12).map((r) => {
                  const active = selectedRoles.includes(r);
                  const accent = getRoleAccent(r);
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => toggleRole(r)}
                      className="rounded-full px-3 py-1.5 text-[11px] transition"
                      style={{
                        background: active ? `${accent}` : "rgba(255,255,255,0.06)",
                        color: active ? "rgba(255,255,255,0.95)" : feyTokens.colors.text.muted,
                        border: `1px solid ${active ? accent : "rgba(255,255,255,0.08)"}`,
                      }}
                    >
                      {r}
                    </button>
                  );
                })}
              </div>
              <div className="mt-2 text-[10px]" style={{ color: feyTokens.colors.text.muted }}>
                Select 1–5 roles for lanes. None = All.
              </div>
            </FeySurface>
          </div>

          {/* Lanes */}
          <div className="lg:col-span-2 space-y-6">
            {isLoading && (
              <div className="text-xs" style={{ color: feyTokens.colors.text.muted }}>
                Loading…
              </div>
            )}
            {error && (
              <div className="text-xs" style={{ color: feyTokens.colors.status.error }}>
                Error loading results.
              </div>
            )}
            {!isLoading && !error && lanes.map(({ role, talents }) => (
              <section key={role}>
                <div
                  className="mb-2 text-[11px] font-semibold uppercase tracking-wider"
                  style={{ color: getRoleAccent(role) }}
                >
                  {role}
                </div>
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                  {talents.length === 0 ? (
                    <div className="text-[11px] py-4" style={{ color: feyTokens.colors.text.muted }}>
                      No talent for this role.
                    </div>
                  ) : (
                    talents.map((t) => (
                      <TalentCard
                        key={t.id}
                        talent={t}
                        variant="discover"
                        isAdded={selectedTalentIds.has(t.id)}
                        onAdd={addToSelection}
                        onOpenProfile={handleViewCreator}
                        laneAccent={role !== "All" ? getRoleAccent(role) : undefined}
                      />
                    ))
                  )}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Selection Tray */}
      {selectedTalents.length > 0 && (
        <div
          className="fixed left-0 right-0 z-40 flex items-center gap-3 px-4 py-3 border-t"
          style={{
            bottom: bottomDockHeight,
            height: trayHeight,
            background: "rgba(10,10,14,0.96)",
            backdropFilter: "blur(16px)",
            borderColor: feyTokens.borders.default,
          }}
        >
          <div className="flex flex-1 gap-2 overflow-x-auto items-center scrollbar-hide">
            {selectedTalents.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-2 flex-shrink-0 rounded-xl px-3 py-2"
                style={{
                  background: feyTokens.glass.panel.background,
                  border: `1px solid ${feyTokens.borders.default}`,
                }}
              >
                <div
                  className="h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-medium"
                  style={{ background: "rgba(255,255,255,0.1)", color: feyTokens.colors.text.primary }}
                >
                  {t.name.charAt(0) || "?"}
                </div>
                <span className="text-xs max-w-[100px] truncate" style={{ color: feyTokens.colors.text.primary }}>
                  {t.name}
                </span>
                <button
                  type="button"
                  onClick={() => removeFromSelection(t.id)}
                  className="p-1 rounded hover:bg-white/10 transition"
                  style={{ color: feyTokens.colors.text.muted }}
                  aria-label="Remove"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="flex-shrink-0 rounded-lg px-5 py-2.5 text-xs font-semibold transition"
            style={{
              background: feyTokens.colors.red.glow,
              color: "white",
            }}
          >
            Continue
          </button>
        </div>
      )}

      {/* Creator Profile Drawer */}
      <RightDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedTalent(null);
        }}
        title={selectedTalent ? `${selectedTalent.name} — Profile` : "Creator Profile"}
        width="520px"
      >
        {selectedTalent && (
          <div className="p-6 space-y-6">
            <div>
              <div
                className="mb-2 text-[10px] font-medium uppercase tracking-wider"
                style={{ color: feyTokens.colors.text.label }}
              >
                Overview
              </div>
              <div style={{ color: feyTokens.colors.text.secondary }}>
                {selectedTalent.headline || selectedTalent.roles?.slice(0, 2).join(" · ")}
              </div>
            </div>
            {selectedTalent.bio && (
              <p className="text-sm" style={{ color: feyTokens.colors.text.secondary }}>
                {selectedTalent.bio}
              </p>
            )}
            <button
              type="button"
              onClick={() => {
                addToSelection(selectedTalent);
                setIsDrawerOpen(false);
                setSelectedTalent(null);
              }}
              className="w-full rounded-lg border px-4 py-3 text-xs font-medium transition-colors hover:bg-white/10"
              style={{
                borderColor: feyTokens.colors.red.glow,
                background: `${feyTokens.colors.red.glow}20`,
                color: feyTokens.colors.red.glow,
              }}
            >
              Add to selection
            </button>
          </div>
        )}
      </RightDrawer>

      <BottomDock />
    </div>
  );
}
