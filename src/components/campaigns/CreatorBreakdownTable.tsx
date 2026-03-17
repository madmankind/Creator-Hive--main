"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { feyTokens } from "@/lib/fey-design-tokens";
import { FeySurface } from "@/components/campaigns/primitives/FeySurface";

interface CreatorBreakdownTableProps {
  campaignIds: string[];
}

interface CreatorData {
  id: string;
  name: string;
  role: string;
  deliverables: string;
  reach: number;
  impressions: number;
  er: number;
  spend: number;
  status: "On Track" | "Needs Review" | "At Risk" | "Off Track";
}

const ACCENT_RED = "#F63148";


export function CreatorBreakdownTable({ campaignIds }: CreatorBreakdownTableProps) {
  /**
   * DATA SOURCE DOCUMENTATION:
   * 
   * Current source: Mock data generated client-side in useEffect (lines 61-100)
   * - Hardcoded array of 3 creator records with static metrics
   * - Generated on component mount to avoid hydration mismatch
   * 
   * Recommended MVP source: 
   * - API route: GET /api/campaigns/[campaignId]/creators
   * - Or: Fetch from campaign pods data structure (if pods contain creator assignments)
   * - Fallback: Keep mock data if API not available
   * 
   * Future source (post-MVP):
   * - Real-time metrics from social platform APIs (Instagram, TikTok, etc.)
   * - Aggregated from individual asset/deliverable performance data
   */
  const router = useRouter();
  const [creators, setCreators] = useState<CreatorData[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCreators, setEditedCreators] = useState<CreatorData[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  // Load from API (real campaign talent) → fallback to localStorage → fallback to mock
  useEffect(() => {
    const storageKey = `campaign_creators_${campaignIds.join("_")}`;
    const activeCampaignId = campaignIds[0];

    const applyData = (data: CreatorData[]) => {
      setCreators(data);
      setEditedCreators(data);
    };

    const fetchFromApi = async () => {
      if (!activeCampaignId) return false;
      try {
        const res = await fetch(`/api/campaigns/${activeCampaignId}/talents`);
        if (!res.ok) return false;
        const json = await res.json();
        const cards: Array<{ id: string; talentName: string; talentRole: string; deliverables: Array<{type: string}>; agreedRate: number; status: string }> = json.cards ?? [];
        if (cards.length === 0) return false;

        const mapped: CreatorData[] = cards.map((c) => ({
          id: c.id,
          name: c.talentName,
          role: c.talentRole,
          deliverables: c.deliverables.length > 0
            ? c.deliverables.map((d) => d.type).join(", ")
            : "TBD",
          reach: 0,
          impressions: 0,
          er: 0,
          spend: c.agreedRate,
          status: (c.status === "IN_PRODUCTION" || c.status === "APPROVED" || c.status === "PAID")
            ? "On Track"
            : c.status === "SUBMITTED"
            ? "Needs Review"
            : c.status === "UNAVAILABLE"
            ? "At Risk"
            : "On Track",
        }));

        // Merge with any locally-saved metric overrides
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          try {
            const savedMap = new Map((JSON.parse(saved) as CreatorData[]).map(c => [c.id, c]));
            const merged = mapped.map(c => savedMap.has(c.id) ? { ...c, ...savedMap.get(c.id) } : c);
            applyData(merged);
            return true;
          } catch { /* ignore */ }
        }
        applyData(mapped);
        return true;
      } catch {
        return false;
      }
    };

    fetchFromApi().then((fetched) => {
      if (fetched) return;

      // Fallback: localStorage saved data
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          applyData(JSON.parse(saved));
          return;
        } catch (e) {
          console.warn("Failed to parse saved creators data", e);
        }
      }

      // Final fallback: real Creator Hive roster (only shown when no real campaign)
      const mockData: CreatorData[] = [
        { id: "talent-dan",      name: "Dan",      role: "Content Creator",  deliverables: "2 Reels, 1 Story",  reach: 580000, impressions: 1400000, er: 2.9, spend: 8500,  status: "On Track" },
        { id: "talent-nadine",   name: "Nadine",   role: "Content Creator",  deliverables: "2 Reels, 2 Stories",reach: 220000, impressions: 640000,  er: 4.8, spend: 5500,  status: "On Track" },
        { id: "talent-amro",     name: "Amro",     role: "Videographer",     deliverables: "1 Hero Film",       reach: 960000, impressions: 2200000, er: 3.2, spend: 14000, status: "On Track" },
        { id: "talent-altamash", name: "Altamash", role: "Photographer",     deliverables: "8 Stills, 1 Reel",  reach: 230000, impressions: 580000,  er: 3.5, spend: 6000,  status: "Needs Review" },
        { id: "talent-cheb",     name: "Cheb",     role: "Art Director",     deliverables: "Campaign Direction", reach: 0,     impressions: 0,       er: 0,   spend: 9500,  status: "On Track" },
      ];
      applyData(mockData);
    });
  }, [campaignIds]);

  const formatNumber = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedCreators([...creators]);
    setHasChanges(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedCreators([...creators]);
    setHasChanges(false);
  };

  const handleSave = () => {
    setCreators([...editedCreators]);
    const storageKey = `campaign_creators_${campaignIds.join("_")}`;
    localStorage.setItem(storageKey, JSON.stringify(editedCreators));
    setIsEditing(false);
    setHasChanges(false);
    // Show subtle "Saved" feedback
    const saveBtn = document.getElementById("save-creators-btn");
    if (saveBtn) {
      const originalText = saveBtn.textContent;
      saveBtn.textContent = "Saved";
      setTimeout(() => {
        if (saveBtn) saveBtn.textContent = originalText;
      }, 1500);
    }
  };

  const updateCreatorField = (id: string, field: keyof CreatorData, value: string | number) => {
    setEditedCreators(prev =>
      prev.map(c => c.id === id ? { ...c, [field]: value } : c)
    );
    setHasChanges(true);
  };

  const displayCreators = isEditing ? editedCreators : creators;

  return (
    <FeySurface variant="card" overlay={true} padding="none">
      <div
        className="border-b px-5 py-3.5 flex items-center justify-between"
        style={{ borderColor: feyTokens.borders.default }}
      >
        <h3
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: feyTokens.colors.text.label }}
        >
          Creators & Deliverables — Performance Breakdown
        </h3>
        {!isEditing ? (
          <button
            onClick={handleEdit}
            className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
            style={{
              background: "rgba(255,255,255,0.06)",
              color: "rgba(255,255,255,0.85)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.09)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.06)";
            }}
          >
            Edit
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
              style={{
                background: "rgba(255,255,255,0.06)",
                color: "rgba(255,255,255,0.70)",
              }}
            >
              Cancel
            </button>
            <button
              id="save-creators-btn"
              onClick={handleSave}
              disabled={!hasChanges}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
              style={{
                background: hasChanges ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.06)",
                color: hasChanges ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.40)",
                cursor: hasChanges ? "pointer" : "not-allowed",
              }}
            >
              Save changes
            </button>
          </div>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr
              className="border-b"
              style={{ borderColor: "rgba(255,255,255,0.04)" }}
            >
              <th className="px-5 py-3.5 text-left">
                <span
                  className="text-[9px] font-medium uppercase tracking-wider"
                  style={{ color: feyTokens.colors.text.label }}
                >
                  Creator
                </span>
              </th>
              <th className="px-5 py-3.5 text-left">
                <span
                  className="text-[9px] font-medium uppercase tracking-wider"
                  style={{ color: feyTokens.colors.text.label }}
                >
                  Role
                </span>
              </th>
              <th className="px-5 py-3.5 text-left">
                <span
                  className="text-[9px] font-medium uppercase tracking-wider"
                  style={{ color: feyTokens.colors.text.label }}
                >
                  Deliverables
                </span>
              </th>
              <th className="px-5 py-3.5 text-right">
                <span
                  className="text-[9px] font-medium uppercase tracking-wider"
                  style={{ color: feyTokens.colors.text.label }}
                >
                  Reach
                </span>
              </th>
              <th className="px-5 py-3.5 text-right">
                <span
                  className="text-[9px] font-medium uppercase tracking-wider"
                  style={{ color: feyTokens.colors.text.label }}
                >
                  Impressions
                </span>
              </th>
              <th className="px-5 py-3.5 text-right">
                <span
                  className="text-[9px] font-medium uppercase tracking-wider"
                  style={{ color: feyTokens.colors.text.label }}
                >
                  ER%
                </span>
              </th>
              <th className="px-5 py-3.5 text-right">
                <span
                  className="text-[9px] font-medium uppercase tracking-wider"
                  style={{ color: feyTokens.colors.text.label }}
                >
                  Spend
                </span>
              </th>
              <th className="px-5 py-3.5 text-center">
                <span
                  className="text-[9px] font-medium uppercase tracking-wider"
                  style={{ color: feyTokens.colors.text.label }}
                >
                  Status
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {displayCreators.map((creator, index) => (
              <motion.tr
                key={creator.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="border-b transition-all hover:bg-white/5 hover:border-white/10"
                style={{ borderColor: "rgba(255,255,255,0.04)" }}
              >
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-medium"
                      style={{
                        background: feyTokens.glass.panel.background,
                        border: `1px solid ${feyTokens.glass.panel.border}`,
                        color: feyTokens.colors.text.secondary,
                      }}
                    >
                      {creator.name.charAt(0)}
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() => router.push(`/creators/${creator.id}`)}
                        className="text-xs font-medium transition-opacity hover:opacity-70 text-left"
                        style={{ color: feyTokens.colors.text.primary }}
                      >
                        {creator.name}
                      </button>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <span
                    className="text-xs"
                    style={{ color: feyTokens.colors.text.secondary }}
                  >
                    {creator.role}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  {isEditing ? (
                    <input
                      type="text"
                      value={creator.deliverables}
                      onChange={(e) => updateCreatorField(creator.id, "deliverables", e.target.value)}
                      className="w-full rounded-md bg-[rgba(255,255,255,0.06)] px-2 py-1 text-xs outline-none transition-colors focus:bg-[rgba(255,255,255,0.08)]"
                      style={{
                        color: feyTokens.colors.text.primary,
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                    />
                  ) : (
                    <span
                      className="text-xs"
                      style={{ color: feyTokens.colors.text.secondary }}
                    >
                      {creator.deliverables}
                    </span>
                  )}
                </td>
                <td className="px-5 py-3.5 text-right">
                  {isEditing ? (
                    <input
                      type="number"
                      value={creator.reach}
                      onChange={(e) => updateCreatorField(creator.id, "reach", parseInt(e.target.value) || 0)}
                      className="w-full rounded-md bg-[rgba(255,255,255,0.06)] px-2 py-1 text-xs text-right outline-none transition-colors focus:bg-[rgba(255,255,255,0.08)]"
                      style={{
                        color: feyTokens.colors.text.primary,
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                    />
                  ) : (
                    <span
                      className="text-xs font-medium"
                      style={{ color: feyTokens.colors.text.primary }}
                    >
                      {formatNumber(creator.reach)}
                    </span>
                  )}
                </td>
                <td className="px-5 py-3.5 text-right">
                  {isEditing ? (
                    <input
                      type="number"
                      value={creator.impressions}
                      onChange={(e) => updateCreatorField(creator.id, "impressions", parseInt(e.target.value) || 0)}
                      className="w-full rounded-md bg-[rgba(255,255,255,0.06)] px-2 py-1 text-xs text-right outline-none transition-colors focus:bg-[rgba(255,255,255,0.08)]"
                      style={{
                        color: feyTokens.colors.text.primary,
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                    />
                  ) : (
                    <span
                      className="text-xs font-medium"
                      style={{ color: feyTokens.colors.text.primary }}
                    >
                      {formatNumber(creator.impressions)}
                    </span>
                  )}
                </td>
                <td className="px-5 py-3.5 text-right">
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.1"
                      value={creator.er}
                      onChange={(e) => updateCreatorField(creator.id, "er", parseFloat(e.target.value) || 0)}
                      className="w-full rounded-md bg-[rgba(255,255,255,0.06)] px-2 py-1 text-xs text-right outline-none transition-colors focus:bg-[rgba(255,255,255,0.08)]"
                      style={{
                        color: feyTokens.colors.text.primary,
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                    />
                  ) : (
                    <span
                      className="text-xs font-medium tabular-nums"
                      style={{ color: feyTokens.colors.text.primary }}
                    >
                      {creator.er.toFixed(1)}%
                    </span>
                  )}
                </td>
                <td className="px-5 py-3.5 text-right">
                  {isEditing ? (
                    <input
                      type="number"
                      value={creator.spend}
                      onChange={(e) => updateCreatorField(creator.id, "spend", parseInt(e.target.value) || 0)}
                      className="w-full rounded-md bg-[rgba(255,255,255,0.06)] px-2 py-1 text-xs text-right outline-none transition-colors focus:bg-[rgba(255,255,255,0.08)]"
                      style={{
                        color: feyTokens.colors.text.primary,
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                    />
                  ) : (
                    <span
                      className="text-xs font-medium tabular-nums"
                      style={{ color: feyTokens.colors.text.primary }}
                    >
                      AED {creator.spend.toLocaleString()}
                    </span>
                  )}
                </td>
                <td className="px-5 py-3.5 text-center">
                  {isEditing ? (
                    <select
                      value={creator.status}
                      onChange={(e) => updateCreatorField(creator.id, "status", e.target.value as CreatorData["status"])}
                      className="rounded-full px-2 py-0.5 text-[9px] font-medium outline-none transition-colors"
                      style={{
                        background: creator.status === "On Track"
                          ? `${feyTokens.colors.status.success}20`
                          : creator.status === "At Risk"
                          ? `${feyTokens.colors.status.error}20`
                          : creator.status === "Off Track"
                          ? `${feyTokens.colors.status.error}40`
                          : `${feyTokens.colors.status.warning}20`,
                        color: creator.status === "On Track"
                          ? feyTokens.colors.status.success
                          : creator.status === "At Risk"
                          ? feyTokens.colors.status.error
                          : creator.status === "Off Track"
                          ? feyTokens.colors.status.error
                          : feyTokens.colors.status.warning,
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      <option value="On Track">On Track</option>
                      <option value="Needs Review">Needs Review</option>
                      <option value="At Risk">At Risk</option>
                      <option value="Off Track">Off Track</option>
                    </select>
                  ) : (
                    <span
                      className="rounded-full px-2 py-0.5 text-[9px] font-medium"
                      style={{
                        background:
                          creator.status === "On Track"
                            ? `${feyTokens.colors.status.success}20`
                            : creator.status === "At Risk"
                            ? `${feyTokens.colors.status.error}20`
                            : creator.status === "Off Track"
                            ? `${feyTokens.colors.status.error}40`
                            : `${feyTokens.colors.status.warning}20`,
                        color:
                          creator.status === "On Track"
                            ? feyTokens.colors.status.success
                            : creator.status === "At Risk"
                            ? feyTokens.colors.status.error
                            : creator.status === "Off Track"
                            ? feyTokens.colors.status.error
                            : feyTokens.colors.status.warning,
                      }}
                    >
                      {creator.status}
                    </span>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </FeySurface>
  );
}

