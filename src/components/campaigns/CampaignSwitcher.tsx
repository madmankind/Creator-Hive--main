"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Copy, Plus, Check } from "lucide-react";
import { useCampaign } from "@/contexts/CampaignContext";
import { useLocalCampaignStore } from "@/store/useLocalCampaignStore";
import { cn } from "@/lib/utils";

type DropdownView = "list" | "duplicate";

export function CampaignSwitcher() {
  const router = useRouter();
  const { activeCampaign, campaigns, setActiveCampaign } = useCampaign();
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<DropdownView>("list");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setView("list");
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const close = () => { setIsOpen(false); setView("list"); };

  // Switch campaign
  const handleSelect = (id: string) => {
    const c = campaigns.find((x) => x.id === id);
    if (c) setActiveCampaign(c);
    close();
  };

  // New campaign — routes to booking flow (campaign creation IS the booking flow)
  const handleNew = () => {
    close();
    router.push("/?skip=gallery");
  };

  // Duplicate current team into another campaign
  const handleDuplicateTo = (targetId: string) => {
    const target = campaigns.find((c) => c.id === targetId);
    if (!target || !activeCampaign) return;
    const cloned = { ...activeCampaign, id: targetId, name: target.name };
    useLocalCampaignStore.getState().removeCampaign(targetId);
    useLocalCampaignStore.getState().addCampaign(cloned);
    setActiveCampaign(cloned);
    close();
  };

  const otherCampaigns = campaigns.filter((c) => c.id !== activeCampaign?.id);
  const label = activeCampaign?.name ?? "Select campaign";

  return (
    <div className="relative flex-shrink-0" ref={dropdownRef}>

      {/* ── Trigger — single row, perfectly center-aligned ── */}
      <button
        type="button"
        onClick={() => { setIsOpen((v) => !v); setView("list"); }}
        className="flex items-center gap-1.5 transition-opacity hover:opacity-70"
      >
        <span
          className="text-[13px] font-medium max-w-[200px] truncate"
          style={{ color: activeCampaign ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.35)" }}
        >
          {label}
        </span>
        <ChevronDown
          size={13}
          className={cn("flex-shrink-0 transition-transform duration-200", isOpen && "rotate-180")}
          style={{ color: "rgba(255,255,255,0.35)" }}
        />
      </button>

      {/* ── Dropdown panel ── */}
      {isOpen && (
        <div
          className="absolute left-0 z-50 mt-2 overflow-hidden rounded-2xl"
          style={{
            width: "264px",
            background: "rgba(10,10,16,0.97)",
            border: "1px solid rgba(255,255,255,0.09)",
            backdropFilter: "blur(28px)",
            WebkitBackdropFilter: "blur(28px)",
            boxShadow: "0 24px 56px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.04)",
          }}
        >
          {view === "list" && (
            <>
              {/* Campaign list */}
              <div className="max-h-[220px] overflow-y-auto p-1.5">
                {campaigns.length === 0 ? (
                  <p className="px-3 py-3 text-[12px]" style={{ color: "rgba(255,255,255,0.30)" }}>
                    No campaigns yet — start a new one below
                  </p>
                ) : (
                  campaigns.map((c) => {
                    const isActive = c.id === activeCampaign?.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleSelect(c.id)}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-colors"
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                      >
                        {/* Active dot / inactive placeholder */}
                        <span
                          className="flex-shrink-0 w-1.5 h-1.5 rounded-full"
                          style={{ background: isActive ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.12)" }}
                        />
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-[13px] truncate"
                            style={{
                              color: isActive ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.55)",
                              fontWeight: isActive ? 500 : 400,
                            }}
                          >
                            {c.name}
                          </p>
                          {c.clientName && (
                            <p className="text-[11px] truncate mt-0.5" style={{ color: "rgba(255,255,255,0.28)" }}>
                              {c.clientName}
                            </p>
                          )}
                        </div>
                        {isActive && <Check size={12} style={{ color: "rgba(255,255,255,0.45)", flexShrink: 0 }} />}
                      </button>
                    );
                  })
                )}
              </div>

              {/* Divider + actions */}
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }} className="p-1.5 space-y-0.5">
                <button
                  type="button"
                  onClick={handleNew}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] text-left transition-colors"
                  style={{ color: "rgba(255,255,255,0.55)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.80)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.55)"; }}
                >
                  <Plus size={13} style={{ flexShrink: 0 }} />
                  New campaign
                </button>
                {activeCampaign && (
                  <button
                    type="button"
                    onClick={() => setView("duplicate")}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] text-left transition-colors"
                    style={{ color: "rgba(255,255,255,0.38)" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.65)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.38)"; }}
                  >
                    <Copy size={12} style={{ flexShrink: 0 }} />
                    Duplicate team to…
                  </button>
                )}
              </div>
            </>
          )}

          {view === "duplicate" && (
            <>
              <div className="px-3 pt-3 pb-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: "rgba(255,255,255,0.25)" }}>
                  Duplicate team to
                </p>
              </div>
              <div className="p-1.5 max-h-[200px] overflow-y-auto">
                {otherCampaigns.length === 0 ? (
                  <p className="px-3 py-2 text-[12px]" style={{ color: "rgba(255,255,255,0.30)" }}>
                    No other campaigns
                  </p>
                ) : (
                  otherCampaigns.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleDuplicateTo(c.id)}
                      className="w-full text-left px-3 py-2.5 rounded-xl text-[13px] transition-colors"
                      style={{ color: "rgba(255,255,255,0.65)" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                    >
                      {c.name}
                    </button>
                  ))
                )}
              </div>
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }} className="p-1.5">
                <button
                  type="button"
                  onClick={() => setView("list")}
                  className="w-full text-left px-3 py-2 rounded-xl text-[11px] transition-colors"
                  style={{ color: "rgba(255,255,255,0.28)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  ← Back
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
