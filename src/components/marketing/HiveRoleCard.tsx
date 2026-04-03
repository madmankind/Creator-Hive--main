"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, Plus, Check } from "lucide-react";
import type { HiveRole, InfluencerTier } from "@/lib/hiveRoles";
import { INFLUENCER_TIERS } from "@/lib/hiveRoles";
import { cn } from "@/lib/utils";
import type { Currency } from "@/store/useCurrencyStore";
import { formatPricePerUnit } from "@/store/useCurrencyStore";

interface HiveRoleCardProps {
  role: HiveRole;
  currency?: Currency;
  onBook?: (role: HiveRole, tier?: InfluencerTier) => void;
  onAddToPod?: (role: HiveRole, tier?: InfluencerTier) => void;
  isAdded?: boolean;
}

export function HiveRoleCard({ role, currency = "AED", onBook, onAddToPod, isAdded }: HiveRoleCardProps) {
  const [hovered, setHovered] = useState(false);
  const [selectedTier, setSelectedTier] = useState<InfluencerTier | null>(null);

  const tierKeys = Object.keys(INFLUENCER_TIERS) as InfluencerTier[];

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

      <div style={{ padding: "22px 22px 18px" }}>
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div
            className="flex items-center justify-center rounded-2xl flex-shrink-0"
            style={{
              width: "52px", height: "52px",
              background: `${role.accent}18`,
              border: `1px solid ${role.accent}35`,
              color: role.accent, fontSize: "22px",
            }}
          >
            {role.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full"
                style={{ background: `${role.accent}18`, color: role.accent }}>
                Hive Role
              </span>
              {role.uaeAvailable && (
                <span className="flex items-center gap-1 text-[10px]" style={{ color: "rgba(255,255,255,0.30)" }}>
                  <MapPin size={9} />UAE
                </span>
              )}
              {role.multiAdd && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full"
                  style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.30)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  Multi-add
                </span>
              )}
            </div>
            <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#fff", lineHeight: 1.2, margin: 0 }}>
              {role.title}
            </h3>
            <p style={{ fontSize: "12px", color: role.accent, marginTop: "2px", opacity: 0.85 }}>
              {role.tagline}
            </p>
          </div>
        </div>

        {/* Description */}
        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.55)", lineHeight: 1.6, marginBottom: "14px" }}>
          {role.description}
        </p>

        {/* Influencer tier selector */}
        {role.isInfluencer && (
          <div className="mb-4 space-y-2">
            <p style={{ fontSize: "9px", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
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
              <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)", lineHeight: 1.5, paddingTop: "2px" }}>
                {INFLUENCER_TIERS[selectedTier].description}
              </p>
            )}
          </div>
        )}

        {/* Deliverables */}
        {!role.isInfluencer && (
          <div className="space-y-1 mb-4">
            {role.deliverables.slice(0, 3).map((d) => (
              <div key={d} className="flex items-center gap-2">
                <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: role.accent, flexShrink: 0, opacity: 0.7 }} />
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)" }}>{d}</span>
              </div>
            ))}
            {role.deliverables.length > 3 && (
              <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)", paddingLeft: "10px" }}>
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
                <p style={{ fontSize: "9px", color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "1px" }}>
                  Pricing
                </p>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "rgba(255,255,255,0.6)", fontStyle: "italic" }}>
                  Custom quote
                </p>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: "9px", color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "1px" }}>
                  Starting from
                </p>
                <p style={{ fontSize: "14px", fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>
                  {formatPricePerUnit(role.rateRange.min, role.rateRange.unit, currency).split('/')[0]}
                  <span style={{ fontSize: "10px", fontWeight: 400, color: "rgba(255,255,255,0.35)", marginLeft: "2px" }}>
                    /{role.rateRange.unit === "monthly" ? "mo" : "project"}
                  </span>
                </p>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {role.platforms.slice(0, 3).map((p) => (
              <span key={p} className="text-[9px] px-1.5 py-0.5 rounded-md"
                style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.35)", border: "1px solid rgba(255,255,255,0.08)" }}>
                {p === "Instagram" ? "IG" : p === "TikTok" ? "TT" : p === "YouTube" ? "YT" : p === "LinkedIn" ? "LI" : p === "Snapchat" ? "SC" : "X"}
              </span>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          {/* Add to pod */}
          <button
            onClick={() => onAddToPod?.(role, selectedTier ?? undefined)}
            className="flex items-center justify-center gap-1.5 rounded-xl py-2.5 px-3 text-[11px] font-medium transition-all flex-shrink-0"
            style={{
              background: isAdded ? `${role.accent}22` : "rgba(255,255,255,0.04)",
              border: `1px solid ${isAdded ? role.accent + "45" : "rgba(255,255,255,0.08)"}`,
              color: isAdded ? role.accent : "rgba(255,255,255,0.40)",
            }}
            title="Add to pod"
          >
            {isAdded ? <Check size={12} /> : <Plus size={12} />}
            {isAdded ? "Added" : "Add"}
          </button>

          {/* Book now */}
          <button
            onClick={() => onBook?.(role, selectedTier ?? undefined)}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-[12px] font-semibold transition-all"
            style={{
              background: hovered ? `${role.accent}28` : "rgba(255,255,255,0.06)",
              border: `1px solid ${hovered ? role.accent + "60" : "rgba(255,255,255,0.10)"}`,
              color: hovered ? role.accent : "rgba(255,255,255,0.65)",
            }}
          >
            Book now
            <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* Added badge */}
      {isAdded && (
        <div style={{
          position: "absolute", top: "14px", right: "14px",
          width: "20px", height: "20px", borderRadius: "50%",
          background: role.accent, display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "10px", color: "#07070B", fontWeight: 800,
        }}>✓</div>
      )}
    </motion.div>
  );
}
