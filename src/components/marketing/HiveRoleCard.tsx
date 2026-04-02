"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, MapPin } from "lucide-react";
import type { HiveRole } from "@/lib/hiveRoles";
import { cn } from "@/lib/utils";

interface HiveRoleCardProps {
  role: HiveRole;
  onRequest?: (role: HiveRole) => void;
  isSelected?: boolean;
  onSelect?: (role: HiveRole) => void;
}

export function HiveRoleCard({ role, onRequest, isSelected, onSelect }: HiveRoleCardProps) {
  const [hovered, setHovered] = useState(false);
  const fmt = (n: number) => `AED ${(n / 1000).toFixed(0)}K`;

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
        background: isSelected
          ? `linear-gradient(145deg, ${role.accent}18 0%, rgba(255,255,255,0.04) 100%)`
          : "rgba(255,255,255,0.03)",
        border: `1px solid ${isSelected ? role.accent + "50" : "rgba(255,255,255,0.08)"}`,
        backdropFilter: "blur(12px)",
        overflow: "hidden",
        cursor: "pointer",
        position: "relative",
        transition: "border-color 0.2s, background 0.2s",
      }}
      onClick={() => onSelect?.(role)}
    >
      {/* Accent top bar */}
      <div style={{ height: "3px", background: `linear-gradient(90deg, ${role.accent}, ${role.accent}55)` }} />

      <div style={{ padding: "22px 22px 18px" }}>
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          {/* Icon badge */}
          <div
            className="flex items-center justify-center rounded-2xl text-2xl flex-shrink-0"
            style={{
              width: "52px", height: "52px",
              background: `${role.accent}18`,
              border: `1px solid ${role.accent}35`,
              color: role.accent,
              fontSize: "22px",
            }}
          >
            {role.icon}
          </div>

          <div className="flex-1 min-w-0">
            {/* Role label chip */}
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full"
                style={{ background: `${role.accent}18`, color: role.accent }}
              >
                Hive Role
              </span>
              {role.uaeAvailable && (
                <span className="flex items-center gap-1 text-[10px]" style={{ color: "rgba(255,255,255,0.30)" }}>
                  <MapPin size={9} />UAE
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
        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.55)", lineHeight: 1.6, marginBottom: "16px" }}>
          {role.description}
        </p>

        {/* Deliverables */}
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

        {/* Rate range */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p style={{ fontSize: "9px", color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "1px" }}>
              Starting from
            </p>
            <p style={{ fontSize: "14px", fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>
              {fmt(role.rateRange.min)}
              <span style={{ fontSize: "10px", fontWeight: 400, color: "rgba(255,255,255,0.35)", marginLeft: "2px" }}>
                /{role.rateRange.unit === "monthly" ? "mo" : "project"}
              </span>
            </p>
          </div>
          {/* Platform chips */}
          <div className="flex items-center gap-1.5">
            {role.platforms.slice(0, 3).map((p) => (
              <span key={p} className="text-[9px] px-1.5 py-0.5 rounded-md"
                style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.35)", border: "1px solid rgba(255,255,255,0.08)" }}>
                {p === "Instagram" ? "IG" : p === "TikTok" ? "TT" : p === "YouTube" ? "YT" : p === "LinkedIn" ? "LI" : p === "Snapchat" ? "SC" : "X"}
              </span>
            ))}
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={(e) => { e.stopPropagation(); onRequest?.(role); }}
          className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-[12px] font-semibold transition-all"
          style={{
            background: hovered ? `${role.accent}22` : "rgba(255,255,255,0.05)",
            border: `1px solid ${hovered ? role.accent + "50" : "rgba(255,255,255,0.09)"}`,
            color: hovered ? role.accent : "rgba(255,255,255,0.55)",
          }}
        >
          Request this role
          <ArrowRight size={13} />
        </button>
      </div>

      {/* Selected indicator */}
      {isSelected && (
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
