"use client";

/**
 * CHANGELOG:
 * - Removed "Timeline & Commitments" header text
 * - Kept arrow buttons + range label (right-aligned, minimal)
 * - Reduced header margin from mb-3 to mb-2
 * - Preserved compact week tiles + timeline lanes layout
 */

import { useMemo, useState, useEffect, useRef } from "react";
import type { TalentCampaignCard } from "@/components/campaigns/types";
import { feyTokens } from "@/lib/fey-design-tokens";
import { ChevronLeft, ChevronRight, Calendar, Video, FileText, CreditCard } from "lucide-react";

type DateField = "Production" | "Delivery" | "Go-live" | "Release";

interface WeeklyCalendarPanelProps {
  cards: TalentCampaignCard[];
  onSelectTalent: (cardId: string) => void;
}

function iso(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function WeeklyCalendarPanel({ cards, onSelectTalent }: WeeklyCalendarPanelProps) {
  const [anchor, setAnchor] = useState(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  });
  const [assignments, setAssignments] = useState<Record<string, { dateISO: string; field: DateField }>>({});
  const [dragging, setDragging] = useState<string | null>(null);
  const [selectedTalentId, setSelectedTalentId] = useState<string | null>(null);
  const [selectedCommitmentId, setSelectedCommitmentId] = useState<string | null>(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [datePickerValue, setDatePickerValue] = useState<string>("");
  const datePickerRef = useRef<HTMLDivElement>(null);

  // Close date picker on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(e.target as Node)) {
        setDatePickerOpen(false);
        setSelectedCommitmentId(null);
      }
    };
    if (datePickerOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [datePickerOpen]);

  const days = useMemo(() => {
    const start = new Date(anchor);
    const day = start.getDay(); // 0 Sun
    start.setDate(start.getDate() - day); // Sunday start
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [anchor]);

  const rangeLabel = useMemo(() => {
    const a = days[0];
    const b = days[6];
    const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return `${fmt(a)} – ${fmt(b)}`;
  }, [days]);

  const onDropToDay = (date: Date) => {
    if (!dragging) return;
    const field = assignments[`${dragging}-Go-live`]?.field || "Go-live";
    setAssignments((prev) => ({
      ...prev,
      [`${dragging}-${field}`]: { dateISO: iso(date), field },
    }));
    onSelectTalent(dragging);
    setDragging(null);
  };

  const selectedTalent = selectedTalentId ? cards.find((c) => c.id === selectedTalentId) : null;

  return (
    <div className="h-full min-h-0 flex flex-col">
      {/* Compact header (no large title) */}
      <div className="flex items-center justify-end mb-2" style={{ flex: "0 0 auto" }}>
        <div className="flex items-center gap-2">
          <button
            className="rounded-full p-2"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", color: feyTokens.colors.text.secondary }}
            onClick={() => {
              const d = new Date(anchor);
              d.setDate(d.getDate() - 7);
              setAnchor(d);
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="text-[12px]" style={{ color: feyTokens.colors.text.muted }}>
            {rangeLabel}
          </div>
          <button
            className="rounded-full p-2"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", color: feyTokens.colors.text.secondary }}
            onClick={() => {
              const d = new Date(anchor);
              d.setDate(d.getDate() + 7);
              setAnchor(d);
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Talent strip (draggable) - flex: 0, no scroll */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2" style={{ flex: "0 0 auto" }}>
        {cards.slice(0, 10).map((c) => (
          <div
            key={c.id}
            draggable
            onDragStart={() => setDragging(c.id)}
            onDragEnd={() => setDragging(null)}
            onClick={() => {
              setSelectedTalentId(c.id);
              onSelectTalent(c.id);
            }}
            className="flex items-center gap-2 rounded-none px-2.5 py-2 cursor-grab active:cursor-grabbing flex-shrink-0 transition-colors"
            style={{
              background: selectedTalentId === c.id ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.25)",
              border: `1px solid ${selectedTalentId === c.id ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.10)"}`,
              color: feyTokens.colors.text.secondary,
            }}
          >
            <div
              style={{
                width: "26px",
                height: "26px",
                borderRadius: "8px",
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.10)",
                background: "rgba(255,255,255,0.06)",
              }}
            >
              <img
                src={`https://i.pravatar.cc/120?img=${(((parseInt(c.talentId.replace(/\D/g, ""), 10) || 1) - 1) % 70) + 1}`}
                alt={c.talentName}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <div className="text-[11px] font-medium">{c.talentName.split(" ")[0]}</div>
          </div>
        ))}
      </div>

      {/* Main content area: Week Tiles + Timeline Lanes */}
      <div className="flex-1 min-h-0 flex flex-col" style={{ gap: "12px", overflow: "hidden" }}>
        {/* Week Tiles Row (fixed height, compact day chips) */}
        <div className="grid grid-cols-7 gap-2" style={{ flex: "0 0 auto", height: "92px" }}>
          {days.map((d) => {
            const dayKey = iso(d);
            const assigned = Object.entries(assignments).filter(([, v]) => v.dateISO === dayKey);

            return (
              <div
                key={dayKey}
                className="rounded-none p-2 flex flex-col cursor-pointer transition-colors"
                style={{
                  background: "rgba(0,0,0,0.25)",
                  border: "1px solid rgba(255,255,255,0.10)",
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onDropToDay(d)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(0,0,0,0.35)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(0,0,0,0.25)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="text-[9px] font-semibold uppercase" style={{ color: feyTokens.colors.text.muted }}>
                    {d.toLocaleDateString("en-US", { weekday: "short" })}
                  </div>
                  <div className="text-[11px] font-semibold" style={{ color: feyTokens.colors.text.secondary }}>
                    {d.getDate()}
                  </div>
                </div>

                {/* Event chips: avatar + name (replaces dots) */}
                <div className="flex flex-col gap-1 mt-auto" style={{ maxHeight: "40px", overflowY: "auto" }}>
                  {assigned.slice(0, 2).map(([talentId, assignment]) => {
                    const card = cards.find((c) => c.id === talentId);
                    if (!card) return null;
                    const firstName = card.talentName.split(" ")[0];
                    const avatarUrl = `https://i.pravatar.cc/120?img=${(((parseInt(card.talentId.replace(/\D/g, ""), 10) || 1) - 1) % 70) + 1}`;
                    const colorMap: Record<DateField, string> = {
                      "Go-live": "#10B981",
                      "Production": "#3B82F6",
                      "Delivery": "#A855F7",
                      "Release": "#F59E0B",
                    };
                    const color = colorMap[assignment.field] || "#10B981";
                    return (
                      <div
                        key={talentId}
                        className="flex items-center gap-1.5 rounded-none px-1.5 py-0.5"
                        style={{
                          background: `${color}20`,
                          border: `1px solid ${color}40`,
                          maxWidth: "100%",
                        }}
                      >
                        <img
                          src={avatarUrl}
                          alt={firstName}
                          className="rounded-none flex-shrink-0"
                          style={{
                            width: "14px",
                            height: "14px",
                            objectFit: "cover",
                            border: `1px solid ${color}60`,
                          }}
                        />
                        <span
                          className="text-[9px] font-medium truncate"
                          style={{
                            color: color,
                          }}
                        >
                          {firstName}
                        </span>
                      </div>
                    );
                  })}
                  {assigned.length > 2 && (
                    <div
                      className="text-[8px] px-1.5 py-0.5 rounded-none"
                      style={{
                        background: "rgba(255,255,255,0.08)",
                        color: "rgba(255,255,255,0.60)",
                        border: "1px solid rgba(255,255,255,0.10)",
                      }}
                    >
                      +{assigned.length - 2}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Timeline Lanes (fills remaining height) */}
        <div
          className="flex-1 min-h-0 rounded-none p-3 flex flex-col"
          style={{
            background: "rgba(0,0,0,0.25)",
            border: "1px solid rgba(255,255,255,0.10)",
            overflow: "hidden",
          }}
        >
          <div className="text-[12px] font-semibold mb-3" style={{ color: feyTokens.colors.text.primary }}>
            {selectedTalent ? `${selectedTalent.talentName.split(" ")[0]}'s Commitments` : "Select a talent"}
          </div>

          {selectedTalent ? (
            <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
              <div className="space-y-3">
                {[
                  { label: "Go-live", field: "Go-live" as DateField, icon: Calendar, color: "#10B981" },
                  { label: "Production", field: "Production" as DateField, icon: Video, color: "#3B82F6" },
                  { label: "Delivery", field: "Delivery" as DateField, icon: FileText, color: "#A855F7" },
                  { label: "Release", field: "Release" as DateField, icon: CreditCard, color: "#F59E0B" },
                ].map(({ label, field, icon: Icon, color }) => {
                  const assignmentKey = `${selectedTalent.id}-${field}`;
                  const assignment = assignments[assignmentKey];
                  const dateISO = assignment?.dateISO || null;
                  const date = dateISO ? new Date(dateISO) : null;

                  return (
                    <div
                      key={field}
                      className="flex items-center gap-3"
                      style={{
                        minHeight: "48px",
                      }}
                    >
                      {/* Left label column (fixed width) */}
                      <div className="flex items-center gap-2" style={{ width: "110px", flexShrink: 0 }}>
                        <div
                          style={{
                            width: "3px",
                            height: "20px",
                            background: color,
                            borderRadius: "2px",
                          }}
                        />
                        <Icon className="h-3.5 w-3.5" style={{ color: feyTokens.colors.text.muted }} />
                        <div className="text-[11px] font-medium" style={{ color: feyTokens.colors.text.secondary }}>
                          {label}
                        </div>
                      </div>

                      {/* Right lane track (flex-1) */}
                      <div className="flex-1 min-w-0">
                        {date ? (
                          <div
                            className="inline-flex items-center gap-2 rounded-none px-2.5 py-1.5"
                            style={{
                              background: `${color}20`,
                              border: `1px solid ${color}40`,
                              color: color,
                            }}
                          >
                            <div className="text-[10px] font-medium">
                              {date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setAssignments((prev) => {
                                  const next = { ...prev };
                                  const key = `${selectedTalent.id}-${field}`;
                                  delete next[key];
                                  return next;
                                });
                              }}
                              className="text-[9px] opacity-60 hover:opacity-100"
                              style={{ color: color }}
                            >
                              ×
                            </button>
                          </div>
                        ) : (
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCommitmentId(`${selectedTalent.id}-${field}`);
                                setDatePickerOpen(true);
                                // Default to Jan 10, 2026 for testing
                                setDatePickerValue("2026-01-10");
                              }}
                              className="rounded-none px-2.5 py-1.5 text-[10px] font-medium transition-colors"
                              style={{
                                background: "rgba(255,255,255,0.04)",
                                color: feyTokens.colors.text.muted,
                                border: "1px solid rgba(255,255,255,0.10)",
                              }}
                            >
                              Set date
                            </button>
                            {datePickerOpen && selectedCommitmentId === `${selectedTalent.id}-${field}` && (
                              <div
                                ref={datePickerRef}
                                className="absolute left-0 top-full mt-1 z-50 rounded-none"
                                style={{
                                  background: "rgba(12,12,18,0.98)",
                                  border: "1px solid rgba(255,255,255,0.12)",
                                  boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
                                  padding: "8px",
                                }}
                              >
                                <input
                                  type="date"
                                  value={datePickerValue}
                                  onChange={(e) => setDatePickerValue(e.target.value)}
                                  className="rounded-none px-2 py-1 text-[10px] outline-none"
                                  style={{
                                    background: "rgba(255,255,255,0.06)",
                                    border: "1px solid rgba(255,255,255,0.10)",
                                    color: feyTokens.colors.text.primary,
                                    width: "140px",
                                  }}
                                  autoFocus
                                />
                                <div className="flex items-center gap-2 mt-2">
                                  <button
                                    onClick={() => {
                                      if (datePickerValue) {
                                        const selectedDate = new Date(datePickerValue);
                                        setAssignments((prev) => ({
                                          ...prev,
                                          [`${selectedTalent.id}-${field}`]: { dateISO: iso(selectedDate), field },
                                        }));
                                      }
                                      setDatePickerOpen(false);
                                      setSelectedCommitmentId(null);
                                    }}
                                    className="rounded-none px-3 py-1 text-[10px] font-medium"
                                    style={{
                                      background: color,
                                      color: "#fff",
                                    }}
                                  >
                                    Confirm
                                  </button>
                                  <button
                                    onClick={() => {
                                      setDatePickerOpen(false);
                                      setSelectedCommitmentId(null);
                                    }}
                                    className="rounded-none px-3 py-1 text-[10px] font-medium"
                                    style={{
                                      background: "rgba(255,255,255,0.06)",
                                      color: feyTokens.colors.text.secondary,
                                      border: "1px solid rgba(255,255,255,0.10)",
                                    }}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-[11px] text-center" style={{ color: feyTokens.colors.text.muted }}>
                Click a talent chip above to view commitments
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
