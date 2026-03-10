"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { feyTokens } from "@/lib/fey-design-tokens";
import { ArrowRight, TrendingUp, Zap, Globe, Users } from "lucide-react";

// ─── Static editorial data (swap for API later) ──────────────────────────────

const MOMENT = {
  label: "Seasonal moment",
  headline: "Ramadan 2026 is 3 weeks away",
  sub: "Campaign slots are filling fast. Build your team now — brands that brief early get first pick of vetted talent.",
  cta: "Browse talent →",
  accent: "rgba(234,179,8,0.75)",
};

const INSIGHTS = [
  {
    icon: TrendingUp,
    label: "Trending format",
    title: "Talking-head UGC",
    body: "Conversion rate 2.4× higher than static in Q1 GCC campaigns. Demand up 38% since January.",
    accent: "rgba(52,211,153,0.65)",
  },
  {
    icon: Globe,
    label: "Platform signal",
    title: "TikTok outpacing Instagram in UAE",
    body: "Reel ER has dropped to 3.2% avg. TikTok creators hitting 7–12% on branded content this quarter.",
    accent: "rgba(99,102,241,0.65)",
  },
  {
    icon: Zap,
    label: "Role in demand",
    title: "Arabic-speaking copywriters",
    body: "Bilingual brief-to-caption writers are the most requested role on Creator Hive in March 2026.",
    accent: "rgba(124,92,255,0.65)",
  },
  {
    icon: Users,
    label: "Creator spotlight",
    title: "Micro beats macro for DTC",
    body: "Creators with 10–50k engaged followers delivering 3× ROAS over macro influencers across AE fashion campaigns.",
    accent: "rgba(229,72,77,0.60)",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

interface DiscoverScreenProps {
  selectedCampaignIds?: string[];
}

export function DiscoverScreen(_: DiscoverScreenProps) {
  const router = useRouter();

  const headerLeft = (
    <span className="text-[14px] font-medium tracking-[-0.01em]" style={{ color: feyTokens.colors.text.primary }}>
      Pulse
    </span>
  );

  return (
    <DashboardShell headerLeft={headerLeft}>
      <div className="space-y-8 max-w-4xl">

        {/* ── Seasonal moment hero ── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.30 }}>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="group w-full text-left rounded-2xl px-7 py-6 relative overflow-hidden transition-all duration-200"
            style={{
              background: "rgba(255,255,255,0.025)",
              border: `1px solid ${MOMENT.accent}35`,
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.045)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.025)"; }}
          >
            {/* Accent glow bar */}
            <div className="absolute inset-x-0 top-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${MOMENT.accent}, transparent)` }} />

            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] mb-2" style={{ color: MOMENT.accent }}>
              {MOMENT.label}
            </p>
            <h2 className="text-[22px] font-light tracking-[-0.02em] mb-2" style={{ color: feyTokens.colors.text.primary }}>
              {MOMENT.headline}
            </h2>
            <p className="text-[13px] font-light max-w-[520px] mb-4" style={{ color: feyTokens.colors.text.muted }}>
              {MOMENT.sub}
            </p>
            <span className="inline-flex items-center gap-1.5 text-[13px] font-medium transition-all group-hover:gap-2.5"
              style={{ color: feyTokens.colors.text.secondary }}>
              {MOMENT.cta}
              <ArrowRight size={13} />
            </span>
          </button>
        </motion.div>

        {/* ── Market insights grid ── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.30, delay: 0.08 }}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] mb-4" style={{ color: feyTokens.colors.text.label }}>
            Market pulse — March 2026
          </p>
          <div className="grid grid-cols-2 gap-3">
            {INSIGHTS.map((ins, i) => {
              const Icon = ins.icon;
              return (
                <motion.div
                  key={ins.title}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: 0.10 + i * 0.05 }}
                  className="rounded-2xl px-5 py-4 relative overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${ins.accent}20` }}
                >
                  <div className="absolute inset-x-0 bottom-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${ins.accent}, transparent)` }} />
                  <div className="flex items-center gap-2 mb-2.5">
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${ins.accent}15` }}>
                      <Icon size={12} style={{ color: ins.accent }} />
                    </div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: ins.accent }}>
                      {ins.label}
                    </p>
                  </div>
                  <p className="text-[14px] font-medium mb-1.5 leading-snug" style={{ color: feyTokens.colors.text.primary }}>
                    {ins.title}
                  </p>
                  <p className="text-[12px] font-light leading-relaxed" style={{ color: feyTokens.colors.text.label }}>
                    {ins.body}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* ── Browse CTA strip ── */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.30, delay: 0.30 }}>
          <div className="flex items-center justify-between rounded-2xl px-5 py-4"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-[13px]" style={{ color: feyTokens.colors.text.muted }}>
              Ready to build a campaign team?
            </p>
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-medium transition-all hover:opacity-80"
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.10)", color: feyTokens.colors.text.primary }}>
              Browse creators
              <ArrowRight size={13} />
            </button>
          </div>
        </motion.div>

      </div>
    </DashboardShell>
  );
}
