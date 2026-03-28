"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronDown, Copy, Plus, Check, Minus } from "lucide-react";
import { useCampaign } from "@/contexts/CampaignContext";
import { useLocalCampaignStore } from "@/store/useLocalCampaignStore";
import { cn } from "@/lib/utils";

type DropdownView = "list" | "duplicate";

export function CampaignSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { activeCampaign, campaigns, setActiveCampaign, refreshCampaigns } = useCampaign();
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<DropdownView>("list");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
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

  const syncCampaignInUrl = (campaignId: string | null) => {
    if (!pathname.startsWith("/dashboard/campaigns")) return;
    const params = new URLSearchParams(searchParams.toString());
    if (campaignId) params.set("campaignId", campaignId);
    else params.delete("campaignId");
    const qs = params.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
  };

  // Switch campaign
  const handleSelect = (id: string) => {
    const c = campaigns.find((x) => x.id === id);
    if (c) setActiveCampaign(c);
    syncCampaignInUrl(id);
    close();
  };

  // New campaign — return to home welcome page so booking flow starts fresh
  const handleNew = () => {
    close();
    router.push("/");
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

  const handleDeleteCampaign = async (campaignId: string) => {
    setDeleteError(null);
    setDeletingId(campaignId);
    try {
      const res = await fetch(`/api/campaigns/${campaignId}`, { method: "DELETE" });
      const data = await res.json().catch(() => null) as { error?: string; reasons?: string[] } | null;
      if (!res.ok) {
        const reasonText = data?.reasons?.length ? ` (${data.reasons.join("; ")})` : "";
        setDeleteError(`${data?.error ?? "Unable to delete campaign"}${reasonText}`);
        return;
      }

      useLocalCampaignStore.getState().removeCampaign(campaignId);
      await refreshCampaigns();

      const remaining = campaigns.filter((c) => c.id !== campaignId);
      if (activeCampaign?.id === campaignId) {
        setActiveCampaign(remaining[0] ?? null);
        syncCampaignInUrl(remaining[0]?.id ?? null);
      }
    } catch {
      setDeleteError("Unable to delete campaign right now.");
    } finally {
      setDeletingId(null);
    }
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
                      <div
                        key={c.id}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-colors"
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                      >
                        <button
                          type="button"
                          onClick={() => handleSelect(c.id)}
                          className="flex min-w-0 flex-1 items-center gap-2.5"
                        >
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
                        <button
                          type="button"
                          aria-label={`Delete ${c.name}`}
                          title="Delete campaign"
                          disabled={deletingId === c.id}
                          onClick={() => void handleDeleteCampaign(c.id)}
                          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-colors disabled:opacity-40"
                          style={{ color: "rgba(255,255,255,0.35)" }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                        >
                          <Minus size={12} />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
              {deleteError && (
                <div className="px-3 pb-2 text-[11px]" style={{ color: "rgba(248,113,113,0.85)" }}>
                  {deleteError}
                </div>
              )}

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
