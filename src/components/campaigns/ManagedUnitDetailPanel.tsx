"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { feyTokens } from "@/lib/fey-design-tokens";
import { FeySurface } from "@/components/campaigns/primitives/FeySurface";
import { PillSegment } from "@/components/campaigns/primitives/PillSegment";
import { EventTimeline } from "@/components/campaigns/EventTimeline";
import { ContractDrawer } from "@/components/contracts/ContractDrawer";
import type { TalentCampaignCard } from "@/components/campaigns/types";
import { FileText, ExternalLink } from "lucide-react";

interface ManagedUnitDetailPanelProps {
  card: TalentCampaignCard | null;
  campaignId: string | null;
  onRequestReplacement?: () => void;
  onFindOnDiscover?: () => void;
}

export function ManagedUnitDetailPanel({
  card,
  campaignId,
  onRequestReplacement,
  onFindOnDiscover,
}: ManagedUnitDetailPanelProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "deliverables" | "contract" | "timeline" | "payments">("overview");
  const [isContractDrawerOpen, setIsContractDrawerOpen] = useState(false);
  const [expandedDeliverableId, setExpandedDeliverableId] = useState<string | null>(null);

  if (!card) {
    return (
      <FeySurface variant="panel" padding="lg" className="min-h-[360px]">
        <div
          className="text-center text-sm"
          style={{ color: feyTokens.colors.text.muted }}
        >
          Select a unit to view details
        </div>
      </FeySurface>
    );
  }

  const tabs = [
    { value: "overview", label: "Overview" },
    { value: "deliverables", label: "Deliverables" },
    { value: "contract", label: "Contract" },
    { value: "timeline", label: "Timeline" },
    { value: "payments", label: "Payments" },
  ];

  const isUnavailable = card.status === "UNAVAILABLE";
  const needsAction = card.bookingState === "PENDING" || card.deliverables.some((d) => d.status === "NeedsRevision");

  return (
    <>
      <div
        className="min-h-[360px]"
        style={{
          boxShadow: "0 20px 70px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.04)",
          backdropFilter: "blur(24px)",
        }}
      >
        <FeySurface 
          variant="panel" 
          padding="md" 
          className="h-full"
        >
        {/* Panel Header with embedded tabs */}
        <div className="flex items-center justify-between mb-6 pb-4">
          <div>
            <div
              className="text-base font-semibold mb-1"
              style={{ color: feyTokens.colors.text.primary }}
            >
              {card.talentName}
            </div>
            <div className="flex items-center gap-2">
              <span
                className="text-xs rounded-full px-2 py-0.5"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  color: feyTokens.colors.text.secondary,
                }}
              >
                Talent
              </span>
              <span
                className="text-xs"
                style={{ color: feyTokens.colors.text.muted }}
              >
                {card.talentRole}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isUnavailable && (
              <>
                {onRequestReplacement && (
                  <button
                    onClick={onRequestReplacement}
                    className="flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-white/10"
                    style={{
                      borderColor: feyTokens.borders.default,
                      background: "rgba(255,255,255,0.06)",
                      color: feyTokens.colors.text.secondary,
                      height: "32px",
                    }}
                  >
                    Request replacement
                  </button>
                )}
                {onFindOnDiscover && (
                  <button
                    onClick={onFindOnDiscover}
                    className="flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-white/10"
                    style={{
                      borderColor: feyTokens.borders.default,
                      background: "rgba(255,255,255,0.06)",
                      color: feyTokens.colors.text.secondary,
                      height: "32px",
                    }}
                  >
                    Find on Discover
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Embedded Tabs */}
        <div className="mb-4">
          <PillSegment
            options={tabs}
            value={activeTab}
            onChange={(v) => setActiveTab(v as typeof activeTab)}
            size="sm"
          />
        </div>

        {/* Summary Row */}
        <div className="mb-4 pb-3 flex items-center gap-6 text-xs" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
          <div className="flex items-center gap-2">
            <span style={{ color: feyTokens.colors.text.muted }}>Deliverables:</span>
            <span style={{ color: feyTokens.colors.text.secondary }}>
              {card.deliverables.filter((d) => d.status === "Approved").length}/{card.deliverables.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span style={{ color: feyTokens.colors.text.muted }}>Due date:</span>
            <span style={{ color: feyTokens.colors.text.secondary }}>
              {card.deliverables.length > 0 && card.deliverables[0].submittedAt
                ? new Date(card.deliverables[0].submittedAt).toLocaleDateString()
                : "—"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span style={{ color: feyTokens.colors.text.muted }}>Rate:</span>
            <span style={{ color: feyTokens.colors.text.secondary }}>
              {card.currency} {card.agreedRate.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-4">
          {activeTab === "overview" && (
            <div className="flex gap-4">
              {/* Left: Next Actions - Prominent callout */}
              <div className="flex-1 rounded-lg p-4" style={{ background: "rgba(255,255,255,0.03)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)" }}>
                <div
                  className="text-[10px] font-medium uppercase tracking-wider mb-3"
                  style={{ color: feyTokens.colors.text.label }}
                >
                  Next Actions
                </div>
                <div className="space-y-2">
                  {needsAction && (
                    <div className="text-sm font-medium" style={{ color: feyTokens.colors.text.primary }}>
                      {card.bookingState === "PENDING" && "Confirm talent within 48h"}
                      {card.deliverables.some((d) => d.status === "NeedsRevision") && "Review deliverable"}
                    </div>
                  )}
                  {!needsAction && (
                    <div className="text-xs" style={{ color: feyTokens.colors.text.muted }}>
                      No actions required
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Status + Compliance stack */}
              <div className="flex flex-col gap-3" style={{ width: "200px" }}>
                {/* Status */}
                <div className="rounded-lg p-3" style={{ background: "rgba(255,255,255,0.02)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)" }}>
                  <div
                    className="text-[10px] font-medium uppercase tracking-wider mb-2"
                    style={{ color: feyTokens.colors.text.label }}
                  >
                    Status
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-medium" style={{ color: feyTokens.colors.text.primary }}>
                      {card.status}
                    </div>
                    <div className="text-[11px]" style={{ color: feyTokens.colors.text.muted }}>
                      {card.bookingState}
                    </div>
                    {card.talentManagerId && (
                      <div className="text-[11px] mt-2 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.04)", color: feyTokens.colors.text.muted }}>
                        Managed by Agency
                      </div>
                    )}
                  </div>
                </div>

                {/* Compliance */}
                <div className="rounded-lg p-3" style={{ background: "rgba(255,255,255,0.02)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)" }}>
                  <div
                    className="text-[10px] font-medium uppercase tracking-wider mb-2"
                    style={{ color: feyTokens.colors.text.label }}
                  >
                    Compliance
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <div className="h-1 w-1 rounded-full" style={{ background: card.contractId ? "#22C55E" : feyTokens.colors.text.muted }} />
                      <span style={{ color: feyTokens.colors.text.secondary }}>
                        Contract: {card.contractId ? "Generated" : "Pending"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="h-1 w-1 rounded-full" style={{ background: feyTokens.colors.text.muted }} />
                      <span style={{ color: feyTokens.colors.text.secondary }}>
                        Brief: Complete
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "deliverables" && (
            <div className="space-y-2">
              {card.deliverables.map((deliverable) => (
                <div
                  key={deliverable.id}
                  className="rounded-lg border p-3 cursor-pointer transition-colors hover:bg-white/5"
                  style={{ borderColor: feyTokens.borders.default }}
                  onClick={() => setExpandedDeliverableId(expandedDeliverableId === deliverable.id ? null : deliverable.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{
                          background:
                            deliverable.status === "Approved"
                              ? "#22C55E"
                              : deliverable.status === "NeedsRevision"
                                ? "#F59E0B"
                                : feyTokens.colors.text.muted,
                        }}
                      />
                      <span className="text-xs font-medium" style={{ color: feyTokens.colors.text.primary }}>
                        {deliverable.type}
                      </span>
                    </div>
                    <span className="text-[11px]" style={{ color: feyTokens.colors.text.muted }}>
                      {deliverable.status}
                    </span>
                  </div>
                  {expandedDeliverableId === deliverable.id && (
                    <div className="mt-3 space-y-2 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                      <div className="text-[11px]" style={{ color: feyTokens.colors.text.secondary }}>
                        Revisions: {deliverable.revisionCount}/2
                      </div>
                      {deliverable.requestedComment && (
                        <div className="text-[11px]" style={{ color: feyTokens.colors.text.muted }}>
                          {deliverable.requestedComment}
                        </div>
                      )}
                      {deliverable.files.length > 0 && (
                        <a
                          href={deliverable.files[0]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[11px] transition-colors hover:opacity-80"
                          style={{ color: feyTokens.colors.text.secondary }}
                        >
                          <ExternalLink className="h-3 w-3" />
                          View file
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {card.deliverables.length === 0 && (
                <div className="text-xs text-center py-4" style={{ color: feyTokens.colors.text.muted }}>
                  No deliverables yet
                </div>
              )}
            </div>
          )}

          {activeTab === "contract" && (
            <div className="space-y-4">
              <div className="text-sm" style={{ color: feyTokens.colors.text.secondary }}>
                {card.contractId ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-xs">
                      <span style={{ color: feyTokens.colors.text.muted }}>Status:</span>
                      <span style={{ color: feyTokens.colors.text.secondary }}>Generated</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setIsContractDrawerOpen(true)}
                        className="flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-colors"
                        style={{
                          background: "rgba(255,255,255,0.06)",
                          color: feyTokens.colors.text.secondary,
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.10)"; e.currentTarget.style.color = feyTokens.colors.text.primary; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = feyTokens.colors.text.secondary; }}
                      >
                        <FileText className="h-3.5 w-3.5" />
                        View & Review
                      </button>
                      <button
                        className="flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-colors"
                        style={{
                          background: "rgba(255,255,255,0.06)",
                          color: feyTokens.colors.text.secondary,
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.10)"; e.currentTarget.style.color = feyTokens.colors.text.primary; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = feyTokens.colors.text.secondary; }}
                      >
                        Download PDF
                      </button>
                      <button
                        className="flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-colors"
                        style={{
                          background: "rgba(255,255,255,0.06)",
                          color: feyTokens.colors.text.secondary,
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.10)"; e.currentTarget.style.color = feyTokens.colors.text.primary; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = feyTokens.colors.text.secondary; }}
                      >
                        Send for Signature
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="text-xs" style={{ color: feyTokens.colors.text.muted }}>
                      Contract will be auto-generated from campaign briefing and onboarding inputs.
                    </div>
                    <div className="text-xs" style={{ color: feyTokens.colors.text.secondary }}>
                      Available after booking confirmation or when booking request is accepted.
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "timeline" && (
            <div className="space-y-3" style={{ maxHeight: "220px", overflowY: "auto" }}>
              {campaignId && (
                <EventTimeline campaignIds={[campaignId]} />
              )}
            </div>
          )}

          {activeTab === "payments" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div
                    className="text-[10px] font-medium uppercase tracking-wider mb-2"
                    style={{ color: feyTokens.colors.text.label }}
                  >
                    Deposit
                  </div>
                  <div className="text-xs" style={{ color: feyTokens.colors.text.secondary }}>
                    {card.paymentStatus === "UNFUNDED" ? "Missing" : "Secured"}
                  </div>
                </div>
                <div>
                  <div
                    className="text-[10px] font-medium uppercase tracking-wider mb-2"
                    style={{ color: feyTokens.colors.text.label }}
                  >
                    Final
                  </div>
                  <div className="text-xs" style={{ color: feyTokens.colors.text.secondary }}>
                    {card.paymentStatus === "RELEASED" ? "Released" : "Pending"}
                  </div>
                </div>
              </div>
              <div className="text-[11px]" style={{ color: feyTokens.colors.text.muted }}>
                Rate: {card.currency} {card.agreedRate.toLocaleString()}
              </div>
            </div>
          )}
        </div>
        </FeySurface>
      </div>

      {/* Contract Drawer */}
      {card.contractId && (
        <ContractDrawer
          isOpen={isContractDrawerOpen}
          onClose={() => setIsContractDrawerOpen(false)}
          campaignId={campaignId || undefined}
          contractId={card.contractId}
        />
      )}
    </>
  );
}

