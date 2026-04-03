"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, Plus, Check } from "lucide-react";
import type { HiveRole, InfluencerTier } from "@/lib/hiveRoles";
import { INFLUENCER_TIERS, ARCHETYPE_COLORS, PRISM_ARCHETYPE_DESCRIPTIONS } from "@/lib/hiveRoles";
import { cn } from "@/lib/utils";
import type { Currency } from "@/store/useCurrencyStore";
import { formatPricePerUnit } from "@/store/useCurrencyStore";
import type { PrismArchetypeName } from "@/lib/curatedTalent";

interface HiveRoleCardProps {
  role: HiveRole;
  currency?: Currency;
  sessionArchetype?: PrismArchetypeName | null;
  onBook?: (role: HiveRole, tier?: InfluencerTier) => void;
  onAddToPod?: (role: HiveRole, tier?: InfluencerTier) => void;
  isAdded?: boolean;
}

export function HiveRoleCard({ role, currency = "AED", sessionArchetype, onBook, onAddToPod, isAdded }: HiveRoleCardProps) {
  const [hovered, setHovered] = useState(false);
  const [selectedTier, setSelectedTier] = useState<InfluencerTier | null>(null);
  const tierKeys = Object.keys(INFLUENCER_TIERS) as InfluencerTier[];
  const archetypeColor = sessionArchetype ? ARCHETYPE_COLORS[sessionArchetype] : null;
  const archetypeDesc = sessionArchetype ? PRISM_ARCHETYPE_DESCRIPTIONS[sessionArchetype] : null;

  return (
    <motion.div
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      style={{
        width: "380px",
        minWidth: "380px",
        borderRadius: "20px",
        background: isAdded
          ? `linear-gradient(145deg, ${role.accent}18 0%, rgba(255,255,255,0.04) 100%)`
          : "rgba(255,255,255,0.03)",
        border: `1px solid ${isAdded ? role.accent + "50" : "rgba(255,255,255,0.08)"}`,
        backdropFilter: "blur(12px)",
        overflow: "hidden",
        position: "relative",
        transition: "border-color 0.2s, background 0.2s",
      }}
    >
      {/* Accent top bar */}
      <div style={{ height: "3px", background: `linear-gradient(90deg, ${role.accent}, ${role.accent}55)` }} />

      <div style={{ padding: "20px 20px 16px" }}>
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div
            className="flex items-center justify-center rounded-2xl flex-shrink-0"
            style={{
              width: "48px", height: "48px",
              background: `${role.accent}18`,
              border: `1px solid ${role.accent}35`,
              color: role.accent, fontSize: "20px",
            }}
          >
            {role.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              {role.uaeAvailable && (
                <span className="flex items-center gap-1 text-[9px]" style={{ color: "rgba(255,255,255,0.28)" }}>
                  <MapPin size={8} />UAE
                </span>
              )}
              {role.multiAdd && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full"
                  style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.28)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  Multi-add
                </span>
              )}
            </div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#fff", lineHeight: 1.2, margin: 0 }}>
              {role.title}
            </h3>
            <p style={{ fontSize: "11px", color: role.accent, marginTop: "2px", opacity: 0.85 }}>
              {role.tagline}
            </p>
          </div>
        </div>

        {/* Archetype badge — appears when brief persona has been determined */}
        {sessionArchetype && (
          <div className="mb-3 flex items-start gap-2 rounded-xl px-3 py-2"
            style={{ background: `${ARCHETYPE_COLORS[sessionArchetype]}12`, border: `1px solid ${ARCHETYPE_COLORS[sessionArchetype]}28` }}>
            <div className="flex-shrink-0 mt-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[8px]"
              style={{ background: ARCHETYPE_COLORS[sessionArchetype], color: "#07070B", fontWeight: 800 }}>◈</div>
            <div className="min-w-0">
              <span className="text-[10px] font-semibold" style={{ color: ARCHETYPE_COLORS[sessionArchetype] }}>
                {sessionArchetype}
              </span>
              <p className="text-[10px] leading-relaxed mt-0.5" style={{ color: "rgba(255,255,255,0.38)" }}>
                {PRISM_ARCHETYPE_DESCRIPTIONS[sessionArchetype]}
              </p>
            </div>
          </div>
        )}

        {/* Description */}
        <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.48)", lineHeight: 1.6, marginBottom: "12px" }}>
          {role.description}
        </p>

        {/* Influencer tier selector */}
        {role.isInfluencer && (
          <div className="mb-4 space-y-2">
            <p style={{ fontSize: "9px", color: "rgba(255,255,255,0.28)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Select influencer tier
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {tierKeys.map((tier) => {
                const t = INFLUENCER_TIERS[tier];
                const active = selectedTier === tier;
                return (
                  <button key={tier} onClick={() => setSelectedTier(active ? null : tier)}
                    className="text-left rounded-xl px-3 py-2.5 transition-all"
                    style={{
                      background: active ? `${role.accent}22` : "rgba(255,255,255,0.04)",
                      border: `1px solid ${active ? role.accent + "55" : "rgba(255,255,255,0.08)"}`,
                    }}>
                    <div className="flex items-center justify-between mb-0.5">
                      <span style={{ fontSize: "11px", fontWeight: 700, color: active ? role.accent : "rgba(255,255,255,0.75)" }}>
                        {t.label}
                      </span>
                      {active && <Check size={10} style={{ color: role.accent }} />}
                    </div>
                    <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.35)" }}>{t.followerRange}</span>
                    <div style={{ fontSize: "8px", color: "rgba(255,255,255,0.25)", marginTop: "1px" }}>Min. {t.minEr}% ER</div>
                  </button>
                );
              })}
            </div>
            {selectedTier && (
              <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.33)", lineHeight: 1.5 }}>
                {INFLUENCER_TIERS[selectedTier].description}
              </p>
            )}
          </div>
        )}

        {/* Deliverables */}
        {!role.isInfluencer && (
          <div className="space-y-1 mb-3">
            {role.deliverables.slice(0, 3).map((d) => (
              <div key={d} className="flex items-center gap-2">
                <div style={{ width: "3px", height: "3px", borderRadius: "50%", background: role.accent, flexShrink: 0, opacity: 0.6 }} />
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.40)" }}>{d}</span>
              </div>
            ))}
            {role.deliverables.length > 3 && (
              <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.22)", paddingLeft: "9px" }}>
                +{role.deliverables.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Rate / platform row */}
        <div className="flex items-center justify-between mb-3">
          <div>
            {role.isInfluencer ? (
              <div>
                <p style={{ fontSize: "9px", color: "rgba(255,255,255,0.22)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "1px" }}>Pricing</p>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "rgba(255,255,255,0.55)", fontStyle: "italic" }}>Custom quote</p>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: "9px", color: "rgba(255,255,255,0.22)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "1px" }}>Starting from</p>
                <p style={{ fontSize: "14px", fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>
                  {formatPricePerUnit(role.rateRange.min, role.rateRange.unit, currency).split('/')[0]}
                  <span style={{ fontSize: "10px", fontWeight: 400, color: "rgba(255,255,255,0.32)", marginLeft: "2px" }}>
                    /{role.rateRange.unit === "monthly" ? "mo" : "project"}
                  </span>
                </p>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1">
            {role.platforms.slice(0, 3).map((p) => (
              <span key={p} className="text-[9px] px-1.5 py-0.5 rounded-md"
                style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.30)", border: "1px solid rgba(255,255,255,0.07)" }}>
                {p === "Instagram" ? "IG" : p === "TikTok" ? "TT" : p === "YouTube" ? "YT" : p === "LinkedIn" ? "LI" : p === "Snapchat" ? "SC" : "X"}
              </span>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => onAddToPod?.(role, selectedTier ?? undefined)}
            className="flex items-center justify-center gap-1.5 rounded-xl py-2.5 px-3 text-[11px] font-medium transition-all flex-shrink-0"
            style={{
              background: isAdded ? `${role.accent}22` : "rgba(255,255,255,0.04)",
              border: `1px solid ${isAdded ? role.accent + "45" : "rgba(255,255,255,0.08)"}`,
              color: isAdded ? role.accent : "rgba(255,255,255,0.38)",
            }}
          >
            {isAdded ? <Check size={12} /> : <Plus size={12} />}
            {isAdded ? "Added" : "Add"}
          </button>
          <button
            onClick={() => onBook?.(role, selectedTier ?? undefined)}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-[12px] font-semibold transition-all"
            style={{
              background: hovered ? `${role.accent}28` : "rgba(255,255,255,0.06)",
              border: `1px solid ${hovered ? role.accent + "60" : "rgba(255,255,255,0.10)"}`,
              color: hovered ? role.accent : "rgba(255,255,255,0.65)",
            }}
          >
            Book now <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {isAdded && (
        <div style={{
          position: "absolute", top: "14px", right: "14px",
          width: "18px", height: "18px", borderRadius: "50%",
          background: role.accent, display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "9px", color: "#07070B", fontWeight: 800,
        }}>✓</div>
      )}
    </motion.div>
  );
}
