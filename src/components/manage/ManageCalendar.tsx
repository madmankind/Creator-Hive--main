"use client";

import { useMemo, useState } from "react";
import type { TalentCampaignCard } from "@/components/campaigns/types";
import { feyTokens } from "@/lib/fey-design-tokens";
import { Calendar, ChevronDown, ChevronUp } from "lucide-react";

interface ManageCalendarProps {
  cards: TalentCampaignCard[];
  isExpanded: boolean;
  onExpandedChange: (v: boolean) => void;
  onTalentSelect: (cardId: string) => void;
}

export function ManageCalendar({ cards, isExpanded, onExpandedChange, onTalentSelect }: ManageCalendarProps) {
  const itemsByDate = useMemo(() => {
    const map = new Map<string, Array<{ talentId: string; talentName: string }>>();
    for (const card of cards) {
      const base = new Date(card.createdAt);
      card.deliverables.forEach((d, idx) => {
        const due = new Date(base);
        due.setDate(due.getDate() + (idx + 1) * 7);
        const key = due.toISOString().slice(0, 10);
        const arr = map.get(key) ?? [];
        arr.push({ talentId: card.id, talentName: card.talentName });
        map.set(key, arr);
      });
    }
    return map;
  }, [cards]);

  const nextDays = useMemo(() => {
    const out: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      out.push(d);
    }
    return out;
  }, []);

  const monthDates = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const dates: Date[] = [];
    const startDay = first.getDay();
    for (let i = startDay - 1; i >= 0; i--) dates.push(new Date(year, month, -i));
    for (let day = 1; day <= last.getDate(); day++) dates.push(new Date(year, month, day));
    const endDay = last.getDay();
    for (let day = 1; day <= 6 - endDay; day++) dates.push(new Date(year, month + 1, day));
    return dates;
  }, []);

  const getFor = (d: Date) => itemsByDate.get(d.toISOString().slice(0, 10)) ?? [];

  return (
    <div className="flex flex-col" style={{ height: "100%", minHeight: 0 }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div style={{ color: feyTokens.colors.text.secondary }}>
            <Calendar className="h-4 w-4" />
          </div>
          <div className="text-[13px] font-semibold" style={{ color: feyTokens.colors.text.primary }}>
            Calendar
          </div>
        </div>
        <button
          onClick={() => onExpandedChange(!isExpanded)}
          className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors"
          style={{
            background: "rgba(255,255,255,0.08)",
            color: feyTokens.colors.text.secondary,
          }}
        >
          <span>{isExpanded ? "Collapse" : "Expand"}</span>
          {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>
      </div>

      {!isExpanded ? (
        <div className="mt-3 flex items-center gap-3 overflow-x-auto scrollbar-hide" style={{ height: "56px", whiteSpace: "nowrap" }}>
          {nextDays.map((d) => {
            const list = getFor(d);
            const isToday = d.toDateString() === new Date().toDateString();
            return (
              <div key={d.toISOString()} className="flex items-center gap-2 flex-shrink-0">
                <div
                  className="flex items-center justify-center rounded-full text-[11px] font-semibold"
                  style={{
                    width: "34px",
                    height: "34px",
                    background: isToday ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: feyTokens.colors.text.secondary,
                  }}
                >
                  {d.getDate()}
                </div>
                <div className="flex items-center gap-1">
                  {list.slice(0, 2).map((it) => (
                    <button
                      key={`${it.talentId}-${d.toISOString()}`}
                      onClick={() => onTalentSelect(it.talentId)}
                      className="rounded-full px-2 py-1 text-[10px] font-medium truncate max-w-[92px] transition-colors"
                      style={{
                        background: "rgba(255,255,255,0.08)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        color: feyTokens.colors.text.secondary,
                      }}
                    >
                      {it.talentName.split(" ")[0]}
                    </button>
                  ))}
                  {list.length > 2 && (
                    <div className="text-[10px]" style={{ color: feyTokens.colors.text.muted }}>
                      +{list.length - 2}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-4 flex-1 min-h-0 overflow-auto scrollbar-hide" style={{ paddingBottom: "104px" }}>
          <div className="grid grid-cols-7 gap-1.5 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center text-[9px] font-medium" style={{ color: feyTokens.colors.text.muted }}>
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {monthDates.map((d) => {
              const list = getFor(d);
              const isToday = d.toDateString() === new Date().toDateString();
              const isCurrentMonth = d.getMonth() === new Date().getMonth();
              return (
                <div
                  key={d.toISOString()}
                  className="rounded-[12px] p-1.5 min-h-[72px]"
                  style={{
                    background: isToday ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    opacity: isCurrentMonth ? 1 : 0.5,
                  }}
                >
                  <div className="text-[10px] font-semibold" style={{ color: feyTokens.colors.text.secondary }}>
                    {d.getDate()}
                  </div>
                  <div className="mt-1 flex flex-col gap-1">
                    {list.slice(0, 2).map((it) => (
                      <button
                        key={`${it.talentId}-${d.toISOString()}`}
                        onClick={() => onTalentSelect(it.talentId)}
                        className="rounded-full px-2 py-0.5 text-[8px] font-medium truncate transition-colors"
                        style={{
                          background: "rgba(255,255,255,0.08)",
                          border: "1px solid rgba(255,255,255,0.06)",
                          color: feyTokens.colors.text.secondary,
                        }}
                      >
                        {it.talentName.split(" ")[0]}
                      </button>
                    ))}
                    {list.length > 2 && (
                      <div className="text-[8px]" style={{ color: feyTokens.colors.text.muted }}>
                        +{list.length - 2}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

