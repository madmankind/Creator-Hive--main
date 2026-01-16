"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { feyTokens } from "@/lib/fey-design-tokens";
import { FeySurface } from "./primitives/FeySurface";
import { FileText, Package, CreditCard, ChevronDown, X } from "lucide-react";
import {
  deriveCampaignStage,
  deriveFundingStatus,
  deriveDataStatus,
  derivePrimaryAction,
  deriveQuickLinks,
} from "@/lib/campaign-context/derive";
import type { CampaignContextData } from "@/lib/campaign-context/types";

interface CampaignContextBarProps {
  selectedCampaignIds: string[];
  onCampaignChange?: (ids: string[]) => void;
}

export function CampaignContextBar({ selectedCampaignIds, onCampaignChange }: CampaignContextBarProps) {
  const [campaigns, setCampaigns] = useState<Array<{
    id: string;
    name: string;
    status?: string;
    startDate?: string | Date;
    dueDate?: string | Date;
    budget?: number;
    clientName?: string;
  }>>([]);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [selectorSearch, setSelectorSearch] = useState("");
  const [contextData, setContextData] = useState<CampaignContextData>({});
  const contextDataRef = useRef<CampaignContextData>({});
  const [loading, setLoading] = useState(true);

  // Collect data from all views (Track, Manage, Pay)
  useEffect(() => {
    setLoading(true);
    
    // Fetch campaign basic info
    Promise.all([
      fetch("/api/campaigns").then((res) => res.json()).catch(() => ({ campaigns: [] })),
      // Fetch payments data (if endpoint exists)
      fetch("/api/campaigns/payments").then((res) => res.json()).catch(() => null),
    ]).then(([campaignsData, paymentsData]) => {
      const campaignsList = campaignsData.campaigns || [];
      setCampaigns(campaignsList);

      // Get selected campaign
      const selectedCampaign = selectedCampaignIds.length === 1
        ? campaignsList.find((c: any) => c.id === selectedCampaignIds[0])
        : null;

      if (!selectedCampaign && selectedCampaignIds.length > 0) {
        // Fallback to mock
        const mockCampaign = {
          id: selectedCampaignIds[0],
          name: "Brand Launch Campaign",
          status: "In Production",
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          budget: 50000,
          clientName: "TechCorp",
        };
        setCampaigns([mockCampaign]);
        buildContextData(mockCampaign, paymentsData);
      } else if (selectedCampaign) {
        buildContextData(selectedCampaign, paymentsData);
      } else {
        // All campaigns or no selection
        setContextData({});
      }
    }).catch(() => {
      // Complete mock fallback
      const mockCampaign = {
        id: "1",
        name: "Brand Launch Campaign",
        status: "In Production",
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        budget: 50000,
        clientName: "TechCorp",
      };
        setCampaigns([mockCampaign]);
        buildContextData(mockCampaign, null);
      }).finally(() => setLoading(false));
  }, [selectedCampaignIds]);

  // Update ref whenever contextData changes
  useEffect(() => {
    contextDataRef.current = contextData;
  }, [contextData]);

  // Close selector on outside click / escape
  const selectorRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!selectorRef.current?.contains(e.target as Node)) {
        setSelectorOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setSelectorOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  // Build context data from available sources
  function buildContextData(campaign: any, paymentsData: any) {
    // Parse KPI values from Track view (mock for now, but structure matches real data)
    const outstanding = paymentsData?.outstanding || "AED 27.3K";
    const paidToDate = paymentsData?.paidToDate || "AED 69.2K";
    const totalSpend = paymentsData?.totalSpend || "AED 96.5K";

    // Mock creators data (matches CreatorBreakdownTable structure)
    const creators = [
      {
        id: "1",
        name: "Sarah Chen",
        deliverables: "1 Reel, 2 Stories",
        status: "On Track" as const,
        reach: 486400,
        impressions: 1200000,
        spend: 2100,
      },
      {
        id: "2",
        name: "Alex Nguyen",
        deliverables: "3 Posts",
        status: "On Track" as const,
        reach: 441700,
        impressions: 1100000,
        spend: 1800,
      },
      {
        id: "3",
        name: "Emily Smith",
        deliverables: "2 Reels",
        status: "Needs Review" as const,
        reach: 426800,
        impressions: 950000,
        spend: 1900,
      },
    ];

    // Mock events (matches EventTimeline structure)
    const events = [
      {
        type: "started" as const,
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        label: "Campaign started",
      },
      {
        type: "talentAdded" as const,
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        label: "Talent added",
      },
      {
        type: "deliverableApproved" as const,
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        label: "Deliverable approved",
      },
      {
        type: "campaignLive" as const,
        date: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000),
        label: "Campaign live",
      },
      {
        type: "invoiceSent" as const,
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        label: "Invoice sent",
      },
      {
        type: "paymentCompleted" as const,
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        label: "Payment completed",
      },
    ];

    // Mock board columns (matches PodBoard structure)
    const boardColumns = {
      shortlisted: [
        { id: "1", status: "Shortlisted" },
      ],
      contracted: [
        { id: "2", status: "Contracted" },
      ],
      production: [
        { id: "3", status: "In Production" },
      ],
      submitted: [],
      approved: [],
      paid: [],
    };

    // Mock invoices (matches PayScreen structure)
    const invoices = [
      {
        id: "1",
        status: "Sent" as const,
        amount: 27500,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      {
        id: "2",
        status: "Paid" as const,
        amount: 18500,
        dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
    ];

    // Mock payouts (matches PayScreen structure)
    const payouts = [
      {
        id: "1",
        status: "Paid" as const,
        amount: 2100,
        scheduledDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        id: "2",
        status: "Scheduled" as const,
        amount: 1800,
        scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      },
    ];

    const newContextData: CampaignContextData = {
      campaign: {
        id: campaign.id,
        name: campaign.name,
        clientName: campaign.clientName,
        startDate: campaign.startDate,
        dueDate: campaign.dueDate,
        budget: campaign.budget,
        status: campaign.status,
      },
      payments: {
        totalSpend,
        outstanding,
        paidToDate,
      },
      creators,
      events,
      boardColumns,
      invoices,
      payouts,
    };
    setContextData(newContextData);
    contextDataRef.current = newContextData;
  }

  // Get selected campaign
  const selectedCampaign = useMemo(() => {
    if (selectedCampaignIds.length === 0) return null;
    if (selectedCampaignIds.length === 1) {
      return campaigns.find((c) => c.id === selectedCampaignIds[0]);
    }
    return {
      id: "multiple",
      name: `${selectedCampaignIds.length} campaigns`,
    };
  }, [selectedCampaignIds, campaigns]);

  // Derive values using pure functions
  // Extract stable primitive dependencies in a single useMemo to satisfy React's dependency tracking
  const contextDataPrimitives = useMemo(() => {
    const campaignId = contextData.campaign?.id ?? "";
    const campaignStatus = contextData.campaign?.status ?? "";
    const creatorsCount = contextData.creators?.length ?? 0;
    const eventsCount = contextData.events?.length ?? 0;
    const invoicesCount = contextData.invoices?.length ?? 0;
    const payoutsCount = contextData.payouts?.length ?? 0;
    const outstandingValue = contextData.payments?.outstanding ?? "";
    const paidToDateValue = contextData.payments?.paidToDate ?? "";
    const boardColumnsKeys = contextData.boardColumns ? Object.keys(contextData.boardColumns).join(",") : "";
    const campaignStartDate = contextData.campaign?.startDate;
    const campaignDueDate = contextData.campaign?.dueDate;
    
    return {
      campaignId,
      campaignStatus,
      creatorsCount,
      eventsCount,
      invoicesCount,
      payoutsCount,
      outstandingValue,
      paidToDateValue,
      boardColumnsKeys,
      campaignStartDate,
      campaignDueDate,
    };
  }, [contextData]);

  // Create stable string key for contextData changes
  const contextDataKey = useMemo(() => {
    return `${contextDataPrimitives.campaignId}-${contextDataPrimitives.campaignStatus}-${contextDataPrimitives.creatorsCount}-${contextDataPrimitives.eventsCount}-${contextDataPrimitives.invoicesCount}-${contextDataPrimitives.payoutsCount}-${contextDataPrimitives.outstandingValue}-${contextDataPrimitives.paidToDateValue}-${contextDataPrimitives.boardColumnsKeys}`;
  }, [contextDataPrimitives]);

  const stage = useMemo(() => {
    const data = contextDataRef.current;
    if (!data.campaign) return "Briefing";
    return deriveCampaignStage(data);
  }, [contextDataKey]);

  const fundingStatus = useMemo(() => {
    const data = contextDataRef.current;
    if (!data.campaign) return "Deposit pending";
    return deriveFundingStatus(data);
  }, [contextDataKey]);

  const dataStatus = useMemo(() => {
    const data = contextDataRef.current;
    if (!data.campaign) return "Pending";
    return deriveDataStatus(data);
  }, [contextDataKey]);

  const primaryCTA = useMemo(() => {
    const data = contextDataRef.current;
    if (!data.campaign) {
      return { label: "Select a campaign", disabled: true };
    }
    return derivePrimaryAction(stage, fundingStatus, dataStatus, data);
  }, [stage, fundingStatus, dataStatus, contextDataKey]);

  const quickLinks = useMemo(() => {
    const data = contextDataRef.current;
    return deriveQuickLinks(data);
  }, [contextDataKey]);

  // Format date range
  const dateRange = useMemo(() => {
    const data = contextDataRef.current;
    if (!data.campaign?.startDate || !data.campaign?.dueDate) return null;
    const start = new Date(data.campaign.startDate);
    const end = new Date(data.campaign.dueDate);
    return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} – ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
  }, [contextDataPrimitives.campaignStartDate, contextDataPrimitives.campaignDueDate]);

  // Format last updated (from most recent event)
  const lastUpdatedText = useMemo(() => {
    const data = contextDataRef.current;
    if (!data.events || data.events.length === 0) return null;
    const sortedEvents = [...data.events].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA;
    });
    const latestEvent = sortedEvents[0];
    const diff = Date.now() - new Date(latestEvent.date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return new Date(latestEvent.date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }, [contextDataPrimitives.eventsCount, contextDataKey]);

  const isAllCampaigns = selectedCampaignIds.length === 0;
  const canSelectCampaign = campaigns.length > 0;
  const filteredCampaigns = useMemo(() => {
    if (!selectorSearch.trim()) return campaigns;
    const term = selectorSearch.toLowerCase();
    return campaigns.filter((c) => c.name.toLowerCase().includes(term) || c.clientName?.toLowerCase().includes(term));
  }, [campaigns, selectorSearch]);

  const handleSelectCampaign = (id?: string) => {
    if (!onCampaignChange) return;
    if (!id) {
      onCampaignChange([]);
      setSelectorOpen(false);
      return;
    }
    onCampaignChange([id]);
    setSelectorOpen(false);
  };

  if (loading) {
    return (
      <div className="px-6 py-3">
        <div className="h-12 rounded-[20px] bg-[rgba(255,255,255,0.02)] animate-pulse" />
      </div>
    );
  }

  return (
    <div className="px-6 py-3">
      <FeySurface variant="panel" overlay={false} padding="md">
        <div className="flex flex-wrap items-center gap-3 lg:gap-4">
          {/* LEFT GROUP: Campaign Identity */}
          <div className="flex flex-wrap items-center gap-3 flex-1 min-w-0">
            <div className="min-w-0">
              <h2
                className="text-sm font-semibold truncate"
                style={{ color: feyTokens.colors.text.primary }}
              >
                {isAllCampaigns ? "All campaigns" : contextData.campaign?.name || selectedCampaign?.name || "Campaign"}
              </h2>
              {!isAllCampaigns && contextData.campaign && (
                <div className="flex flex-wrap items-center gap-2 mt-0.5">
                  {contextData.campaign.clientName && (
                    <span
                      className="text-xs"
                      style={{ color: feyTokens.colors.text.muted }}
                    >
                      {contextData.campaign.clientName}
                    </span>
                  )}
                  {dateRange && (
                    <>
                      <span style={{ color: feyTokens.colors.text.label }}>•</span>
                      <span
                        className="text-xs"
                        style={{ color: feyTokens.colors.text.muted }}
                      >
                        {dateRange}
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* MIDDLE GROUP: State Chips */}
          {!isAllCampaigns && contextData.campaign && (
            <div className="flex flex-wrap items-center gap-2">
              {/* Stage Chip */}
              <div className="relative group">
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    color: feyTokens.colors.text.secondary,
                    border: `1px solid ${feyTokens.borders.default}`,
                  }}
                >
                  {stage}
                </span>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded text-[10px] bg-black/90 text-white opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                  Current campaign state
                </div>
              </div>

              {/* Funding Chip */}
              <div className="relative group">
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium"
                  style={{
                    background:
                      fundingStatus === "Funded"
                        ? `${feyTokens.colors.status.success}20`
                        : fundingStatus === "Partially funded"
                        ? `${feyTokens.colors.status.warning}20`
                        : "rgba(255,255,255,0.06)",
                    color:
                      fundingStatus === "Funded"
                        ? feyTokens.colors.status.success
                        : fundingStatus === "Partially funded"
                        ? feyTokens.colors.status.warning
                        : feyTokens.colors.text.secondary,
                    border: `1px solid ${feyTokens.borders.default}`,
                  }}
                >
                  {fundingStatus}
                </span>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded text-[10px] bg-black/90 text-white opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                  Payment status based on invoices/milestones
                </div>
              </div>

              {/* Data Chip */}
              <div className="relative group">
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium"
                  style={{
                    background:
                      dataStatus === "Connected"
                        ? `${feyTokens.colors.status.success}20`
                        : dataStatus === "Manual"
                        ? `${feyTokens.colors.status.warning}20`
                        : "rgba(255,255,255,0.06)",
                    color:
                      dataStatus === "Connected"
                        ? feyTokens.colors.status.success
                        : dataStatus === "Manual"
                        ? feyTokens.colors.status.warning
                        : feyTokens.colors.text.secondary,
                    border: `1px solid ${feyTokens.borders.default}`,
                  }}
                >
                  {dataStatus}
                  {lastUpdatedText && (
                    <span className="ml-1" style={{ color: feyTokens.colors.text.label }}>
                      • {lastUpdatedText}
                    </span>
                  )}
                </span>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded text-[10px] bg-black/90 text-white opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                  {dataStatus === "Connected"
                    ? "Metrics sourced from platform APIs"
                    : dataStatus === "Manual"
                    ? "Metrics entered manually"
                    : "Data not connected"}
                </div>
              </div>
            </div>
          )}

          {/* RIGHT GROUP: Context Selector + Quick Links */}
          <div className="flex items-center gap-2">
            <div className="relative" ref={selectorRef}>
              <button
                type="button"
                disabled={!canSelectCampaign}
                onClick={() => canSelectCampaign && setSelectorOpen((v) => !v)}
                className="group flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition"
                style={{
                  cursor: canSelectCampaign ? "pointer" : "default",
                  background: "rgba(255,255,255,0.06)",
                  color: feyTokens.colors.text.secondary,
                  border: `1px solid ${feyTokens.borders.default}`,
                  backdropFilter: "blur(12px)",
                  opacity: canSelectCampaign ? 1 : 0.55,
                }}
                title={canSelectCampaign ? "Change campaign context" : "No campaigns yet"}
              >
                <div className="text-left min-w-[150px]">
                  <div className="text-[12px] font-semibold text-white">
                    {isAllCampaigns ? "All campaigns" : contextData.campaign?.name || selectedCampaign?.name || "Campaign"}
                  </div>
                  {!isAllCampaigns && contextData.campaign?.clientName && (
                    <div className="text-[11px] text-white/60 truncate">
                      {contextData.campaign.clientName}
                    </div>
                  )}
                </div>
                {!isAllCampaigns && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectCampaign();
                    }}
                    className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20"
                    title="Clear selection"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
                <ChevronDown
                  className={`h-3.5 w-3.5 transition ${selectorOpen ? "rotate-180" : ""}`}
                  style={{ color: feyTokens.colors.text.secondary }}
                />
              </button>

              {selectorOpen && (
                <div
                  className="absolute right-0 mt-2 w-[360px] rounded-2xl border border-white/10 bg-[rgba(11,14,19,0.94)] shadow-[0_30px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl z-50"
                >
                  <div className="p-3 border-b border-white/10">
                    <input
                      value={selectorSearch}
                      onChange={(e) => setSelectorSearch(e.target.value)}
                      placeholder="Search campaigns…"
                      className="w-full rounded-lg bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none border border-white/10 focus:border-white/30"
                      autoFocus
                    />
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    <button
                      type="button"
                      onClick={() => handleSelectCampaign()}
                      className="w-full text-left px-3 py-2.5 text-sm text-white/90 hover:bg-white/5 transition flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold">All campaigns</div>
                        <div className="text-[11px] text-white/50">Aggregate view</div>
                      </div>
                      {isAllCampaigns && <span className="text-[11px] text-white/60">✓</span>}
                    </button>
                    {filteredCampaigns.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleSelectCampaign(c.id)}
                        className="w-full text-left px-3 py-2.5 text-sm text-white/90 hover:bg-white/5 transition flex items-center justify-between"
                      >
                        <div className="min-w-0">
                          <div className="font-semibold truncate">{c.name}</div>
                          {(c.clientName || c.startDate) && (
                            <div className="text-[11px] text-white/50 truncate">
                              {c.clientName || ""}
                              {c.clientName && c.startDate ? " • " : ""}
                              {c.startDate
                                ? new Date(c.startDate).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                  })
                                : ""}
                            </div>
                          )}
                        </div>
                        {selectedCampaign?.id === c.id && <span className="text-[11px] text-white/60">✓</span>}
                      </button>
                    ))}
                    {filteredCampaigns.length === 0 && (
                      <div className="px-3 py-3 text-[12px] text-white/60">
                        No campaigns match that search.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Links */}
            {!isAllCampaigns && quickLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  const toast = document.createElement("div");
                  toast.textContent = `${link.label} (Coming soon)`;
                  toast.style.cssText =
                    "position: fixed; bottom: 20px; right: 20px; background: rgba(0,0,0,0.9); color: white; padding: 12px 20px; border-radius: 8px; z-index: 9999; font-size: 14px;";
                  document.body.appendChild(toast);
                  setTimeout(() => toast.remove(), 3000);
                }}
                disabled={!link.available}
                className="p-1.5 rounded-lg transition-colors hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  color: feyTokens.colors.text.secondary,
                }}
                title={link.label}
              >
                {link.id === "brief" && <FileText className="h-4 w-4" />}
                {link.id === "deliverables" && <Package className="h-4 w-4" />}
                {link.id === "milestones" && <CreditCard className="h-4 w-4" />}
              </button>
            ))}
          </div>
        </div>
      </FeySurface>
    </div>
  );
}
