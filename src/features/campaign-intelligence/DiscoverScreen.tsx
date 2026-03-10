"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { QuickBookPanel } from "@/components/campaigns/QuickBookPanel";
import { useCampaign } from "@/contexts/CampaignContext";
import { feyTokens } from "@/lib/fey-design-tokens";
import { Plus, RotateCcw, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface DiscoverScreenProps {
  selectedCampaignIds: string[];
}

// Status → pill style
const STATUS_STYLE: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  active:    { label: "Active",    bg: "rgba(16,185,129,0.10)", text: "rgba(52,211,153,0.85)",  dot: "#34d399" },
  completed: { label: "Done",      bg: "rgba(255,255,255,0.05)", text: "rgba(255,255,255,0.35)", dot: "rgba(255,255,255,0.25)" },
  draft:     { label: "Draft",     bg: "rgba(99,102,241,0.09)", text: "rgba(165,180,252,0.75)", dot: "#818cf8" },
  pending:   { label: "Pending",   bg: "rgba(234,179,8,0.09)",  text: "rgba(253,224,71,0.75)",  dot: "#fde047" },
};
function getStatusStyle(status?: string) {
  return STATUS_STYLE[status?.toLowerCase() ?? ""] ?? STATUS_STYLE.draft;
}

function formatBudget(n: number) {
  if (n >= 1000) return `AED ${(n / 1000).toFixed(0)}k`;
  return `AED ${n}`;
}

export function DiscoverScreen({ selectedCampaignIds: _ }: DiscoverScreenProps) {
  const router = useRouter();
  const { campaigns, loading } = useCampaign();

  const recentCampaigns = useMemo(
    () => [...campaigns].slice(0, 3),
    [campaigns]
  );

  const headerLeft = (
    <span className="text-[14px] font-medium" style={{ color: feyTokens.colors.text.primary }}>
      Discover
    </span>
  );

  return (
    <DashboardShell headerLeft={headerLeft}>
      <div className="space-y-10">

        {/* ── NEW CAMPAIGN CTA ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <button
            type="button"
            onClick={() => { window.location.href = "/?skip=gallery"; }}
            className="group w-full text-left rounded-2xl px-6 py-5 transition-all duration-200"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.055)";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.12)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)";
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] mb-1"
                  style={{ color: feyTokens.colors.text.label }}>
                  New campaign
                </p>
                <h2 className="text-[22px] font-light tracking-[-0.02em]"
                  style={{ color: feyTokens.colors.text.primary }}>
                  Browse talent &amp; build a campaign
                </h2>
                <p className="text-[13px] mt-1" style={{ color: feyTokens.colors.text.muted }}>
                  Search, filter, and assemble a team from vetted creators
                </p>
              </div>
              <div
                className="shrink-0 ml-4 flex items-center justify-center rounded-full transition-transform duration-200 group-hover:scale-105"
                style={{
                  width: "48px", height: "48px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.10)",
                }}
              >
                <Plus size={20} style={{ color: feyTokens.colors.text.secondary }} />
              </div>
            </div>
          </button>
        </motion.div>

        {/* ── RECENT CAMPAIGNS — re-book shortcuts ─────────────────── */}
        {(loading || recentCampaigns.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] mb-0.5"
                  style={{ color: feyTokens.colors.text.label }}>
                  Recent campaigns
                </p>
                <p className="text-[13px] font-light" style={{ color: feyTokens.colors.text.muted }}>
                  Re-book a previous team in one tap
                </p>
              </div>
              <button
                type="button"
                onClick={() => router.push("/dashboard/campaigns?mode=track")}
                className="text-[11px] transition-colors"
                style={{ color: feyTokens.colors.text.label }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = feyTokens.colors.text.muted; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = feyTokens.colors.text.label; }}
              >
                View all →
              </button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-[96px] rounded-2xl animate-pulse"
                    style={{ background: "rgba(255,255,255,0.03)" }} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {recentCampaigns.map((c, i) => {
                  const ss = getStatusStyle(c.status);
                  return (
                    <motion.button
                      key={c.id}
                      type="button"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.06 }}
                      onClick={() => { window.location.href = `/?skip=gallery&rebook=${c.id}`; }}
                      className="group text-left rounded-2xl px-4 py-3.5 transition-all duration-200"
                      style={{
                        background: "rgba(255,255,255,0.025)",
                        border: "1px solid rgba(255,255,255,0.06)",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
                        (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.10)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.025)";
                        (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.06)";
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-[13px] font-medium leading-tight line-clamp-1"
                          style={{ color: feyTokens.colors.text.secondary }}>
                          {c.name || "Untitled campaign"}
                        </p>
                        <span
                          className="shrink-0 ml-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-medium"
                          style={{ background: ss.bg, color: ss.text }}
                        >
                          <span className="w-1 h-1 rounded-full shrink-0" style={{ background: ss.dot }} />
                          {ss.label}
                        </span>
                      </div>
                      <p className="text-[11px] mb-2.5" style={{ color: feyTokens.colors.text.label }}>
                        {formatBudget(c.budget)}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1" style={{ color: feyTokens.colors.text.label }}>
                          <Clock size={10} />
                          <span className="text-[10px]">
                            {c.startDate ? new Date(c.startDate).toLocaleDateString("en-AE", { month: "short", year: "numeric" }) : "—"}
                          </span>
                        </div>
                        <span
                          className="flex items-center gap-1 text-[10px] transition-colors group-hover:opacity-80"
                          style={{ color: feyTokens.colors.text.label }}
                        >
                          <RotateCcw size={9} />
                          Re-book
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* ── QUICK BOOK — package-based booking shortcuts ─────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.16, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <div className="mb-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] mb-0.5"
              style={{ color: feyTokens.colors.text.label }}>
              Campaign packages
            </p>
            <p className="text-[13px] font-light" style={{ color: feyTokens.colors.text.muted }}>
              Pre-configured teams — select a package to pre-fill your campaign
            </p>
          </div>
          <QuickBookPanel />
        </motion.div>

      </div>
    </DashboardShell>
  );
}
