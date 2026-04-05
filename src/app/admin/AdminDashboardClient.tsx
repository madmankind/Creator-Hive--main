"use client";

import { useState, useEffect, useCallback } from "react";
import {
  LayoutDashboard, BookOpen, Megaphone, Users, UserCheck,
  CheckCircle2, XCircle, ArrowRight, RefreshCw,
  ChevronDown, ChevronUp, ExternalLink, Zap,
  AlertTriangle, Activity, FileText, Download, TrendingUp, Plug,
} from "lucide-react";
import IntegrationsMetricsTab from "@/components/dashboard/IntegrationsMetricsTab";

type Stats = {
  totalCreators: number;
  pendingTalent: number;
  activeCampaigns: number;
  totalBookings: number;
  pendingBookings: number;
  totalAgencies: number;
  pendingInvites: number;
};

type Booking = {
  id: string;
  status: string;
  bookingType: string;
  description: string;
  contactEmail: string;
  budgetRange: string | null;
  startDate: string | null;
  talentIds: string[];
  createdAt: string;
  user: { id: string; name: string | null; email: string | null } | null;
  agency: { id: string; name: string } | null;
};

type Campaign = {
  id: string;
  title: string;
  status: string;
  budget: number | null;
  startDate: string | null;
  dueDate: string | null;
  createdAt: string;
  agency: {
    id: string; name: string;
    user: { id: string; name: string | null; email: string | null } | null;
  };
  talents: { id: string; talentId: string; status: string; rate: number | null; talent: { name: string; displayName: string | null } }[];
  invites: { id: string; status: string; creatorProfileId: string }[];
};

type Creator = {
  id: string; name: string; displayName: string | null; instagram: string | null;
  location: string | null; skills: string[]; qualityScore: number | null;
  talentStatus: string; source: string | null; isVerified: boolean;
  isActive: boolean; avatarUrl: string | null; bio: string | null; createdAt: Date | string;
};

type AppUser = {
  id: string; name: string | null; email: string | null; role: string; createdAt: string;
  isBlocked: boolean; isSuspended: boolean; blockedReason: string | null;
  agencyAccount: { id: string; name: string } | null;
  creatorProfile: { id: string; talentStatus: string; isActive: boolean; qualityScore: number | null } | null;
  userAgreements: { id: string; agreementRef: string; status: string; storageUrl: string | null; createdAt: string }[];
};

const CAMPAIGN_STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-white/10 text-white/50",
  ACTIVE: "bg-emerald-500/20 text-emerald-300",
  PROVISIONAL: "bg-blue-500/20 text-blue-300",
  CONFIRMED_BRIEF_PENDING: "bg-sky-500/20 text-sky-300",
  BRIEF_SENT: "bg-indigo-500/20 text-indigo-300",
  IN_PROGRESS: "bg-amber-500/20 text-amber-300",
  COMPLETED: "bg-purple-500/20 text-purple-300",
  CANCELLED: "bg-white/10 text-white/30",
};

const BOOKING_STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-500/20 text-amber-300",
  REVIEWING: "bg-blue-500/20 text-blue-300",
  CONFIRMED: "bg-emerald-500/20 text-emerald-300",
};

const TALENT_STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-500/20 text-amber-300",
  active: "bg-emerald-500/20 text-emerald-300",
  paused: "bg-blue-500/20 text-blue-300",
  rejected: "bg-red-500/20 text-red-300",
};

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-purple-500/20 text-purple-300",
  AGENCY: "bg-blue-500/20 text-blue-300",
  CREATOR: "bg-emerald-500/20 text-emerald-300",
};

const CAMPAIGN_STATUSES = ["DRAFT", "ACTIVE", "PROVISIONAL", "CONFIRMED_BRIEF_PENDING", "BRIEF_SENT", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

function StatusBadge({ status, map }: { status: string; map: Record<string, string> }) {
  const cls = map[status] ?? "bg-white/10 text-white/40";
  return (
    <span className={"inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide " + cls}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

function StatCard({ label, value, sub, accent }: { label: string; value: number; sub?: string; accent?: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
      <div className={"text-3xl font-semibold " + (accent ?? "text-white")}>{value.toLocaleString()}</div>
      <div className="mt-1 text-[11px] font-medium text-white/50 uppercase tracking-widest">{label}</div>
      {sub && <div className="mt-0.5 text-[10px] text-white/25">{sub}</div>}
    </div>
  );
}

function OverviewTab({ stats, loading }: { stats: Stats | null; loading: boolean }) {
  if (loading) return <div className="flex items-center justify-center h-64 text-white/30 text-sm">Loading stats...</div>;
  if (!stats) return null;
  const pending = stats.pendingBookings + stats.pendingTalent + stats.pendingInvites;
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-4">Platform snapshot</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Total creators" value={stats.totalCreators} />
          <StatCard label="Pending approval" value={stats.pendingTalent} accent="text-amber-300" sub="Talent awaiting review" />
          <StatCard label="Active campaigns" value={stats.activeCampaigns} accent="text-emerald-300" />
          <StatCard label="Total agencies" value={stats.totalAgencies} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
          <StatCard label="Total bookings" value={stats.totalBookings} />
          <StatCard label="Pending bookings" value={stats.pendingBookings} accent="text-amber-300" sub="Need your action" />
          <StatCard label="Pending invites" value={stats.pendingInvites} />
        </div>
      </div>
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-4">Action queue</h2>
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] divide-y divide-white/[0.04]">
          {stats.pendingBookings > 0 && (
            <div className="flex items-center justify-between px-5 py-3.5">
              <div className="flex items-center gap-3">
                <BookOpen size={14} className="text-amber-300" />
                <span className="text-[13px] text-white/70">{stats.pendingBookings} booking {stats.pendingBookings === 1 ? "request" : "requests"} awaiting review</span>
              </div>
              <span className="text-[11px] font-medium text-amber-300 flex items-center gap-1">Review bookings <ArrowRight size={11} /></span>
            </div>
          )}
          {stats.pendingTalent > 0 && (
            <div className="flex items-center justify-between px-5 py-3.5">
              <div className="flex items-center gap-3">
                <UserCheck size={14} className="text-purple-300" />
                <span className="text-[13px] text-white/70">{stats.pendingTalent} creator {stats.pendingTalent === 1 ? "application" : "applications"} pending approval</span>
              </div>
              <span className="text-[11px] font-medium text-purple-300 flex items-center gap-1">Review talent <ArrowRight size={11} /></span>
            </div>
          )}
          {stats.pendingInvites > 0 && (
            <div className="flex items-center justify-between px-5 py-3.5">
              <div className="flex items-center gap-3">
                <Zap size={14} className="text-blue-300" />
                <span className="text-[13px] text-white/70">{stats.pendingInvites} campaign {stats.pendingInvites === 1 ? "invite" : "invites"} awaiting creator response</span>
              </div>
              <span className="text-[11px] font-medium text-blue-300 flex items-center gap-1">View campaigns <ArrowRight size={11} /></span>
            </div>
          )}
          {pending === 0 && (
            <div className="px-5 py-6 text-center text-sm text-white/30">
              <CheckCircle2 size={18} className="mx-auto mb-2 text-emerald-400" />
              All clear — no pending actions
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BookingsTab() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [acting, setActing] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const url = statusFilter === "all" ? "/api/admin/bookings" : `/api/admin/bookings?status=${statusFilter}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load bookings");
      const data = await res.json();
      setBookings(data.bookings ?? []);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  async function updateStatus(id: string, status: string) {
    setActing(id);
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update booking status");
      setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status } : b));
    } catch {
      // eslint-disable-next-line no-alert
      window.alert("Could not update booking status.");
    } finally {
      setActing(null);
    }
  }

  async function convertToCampaign(id: string) {
    setActing(id);
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "convert" }),
      });
      if (res.ok) {
        setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status: "CONFIRMED" } : b));
        // eslint-disable-next-line no-alert
        window.alert("Campaign created. Check the Campaigns tab.");
      } else {
        // eslint-disable-next-line no-alert
        window.alert("Could not convert booking. Please try again.");
      }
    } finally {
      setActing(null);
    }
  }

  const filtered = statusFilter === "all" ? bookings : bookings.filter((b) => b.status === statusFilter);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {["all", "PENDING", "REVIEWING", "CONFIRMED"].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={"px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize " + (statusFilter === s ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70")}>
              {s === "all" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <button onClick={load} className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70">
          <RefreshCw size={11} /> Refresh
        </button>
      </div>
      {loading ? (
        <div className="text-center py-16 text-white/30 text-sm">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-white/30 text-sm">No bookings found.</div>
      ) : (
        <div className="rounded-2xl border border-white/[0.07] overflow-hidden divide-y divide-white/[0.04]">
          {filtered.map((b) => (
            <div key={b.id} className="bg-white/[0.02] hover:bg-white/[0.03] transition-colors">
              <button className="w-full flex items-center justify-between px-5 py-4 text-left"
                onClick={() => setExpanded(expanded === b.id ? null : b.id)}>
                <div className="flex items-center gap-4 min-w-0">
                  <StatusBadge status={b.status} map={BOOKING_STATUS_COLORS} />
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-white/80 truncate">
                      {b.user?.name ?? b.user?.email ?? b.agency?.name ?? b.contactEmail}
                    </div>
                    <div className="text-xs text-white/35 mt-0.5">
                      {b.bookingType} · {b.talentIds.length} talent{b.talentIds.length !== 1 ? "s" : ""} · {new Date(b.createdAt).toLocaleDateString("en-GB")}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                  {b.budgetRange && <span className="text-xs text-white/40">{b.budgetRange}</span>}
                  {expanded === b.id ? <ChevronUp size={14} className="text-white/30" /> : <ChevronDown size={14} className="text-white/30" />}
                </div>
              </button>
              {expanded === b.id && (
                <div className="px-5 pb-5 space-y-4 border-t border-white/[0.05]">
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Contact</div>
                      <div className="text-sm text-white/70">{b.contactEmail}</div>
                    </div>
                    {b.budgetRange && (
                      <div>
                        <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Budget</div>
                        <div className="text-sm text-white/70">{b.budgetRange}</div>
                      </div>
                    )}
                    {b.startDate && (
                      <div>
                        <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Start date</div>
                        <div className="text-sm text-white/70">{b.startDate}</div>
                      </div>
                    )}
                    <div>
                      <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Type</div>
                      <div className="text-sm text-white/70 capitalize">{b.bookingType.toLowerCase()}</div>
                    </div>
                  </div>
                  {b.description && (
                    <div>
                      <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Brief</div>
                      <div className="text-sm text-white/60 leading-relaxed bg-white/[0.02] rounded-xl p-3 border border-white/[0.05]">{b.description}</div>
                    </div>
                  )}
                  {b.talentIds.length > 0 && (
                    <div>
                      <div className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Requested talent IDs</div>
                      <div className="flex flex-wrap gap-1.5">
                        {b.talentIds.map((tid) => (
                          <a key={tid} href={`/creators/${tid}`} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/[0.05] border border-white/[0.07] text-xs text-white/60 hover:text-white/90 transition-colors">
                            {tid.slice(0, 10)}... <ExternalLink size={9} />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2 pt-2 flex-wrap">
                    {b.status === "PENDING" && (
                      <>
                        <button onClick={() => updateStatus(b.id, "REVIEWING")} disabled={acting === b.id}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition-colors disabled:opacity-50">
                          <CheckCircle2 size={12} /> Mark Reviewing
                        </button>
                        <button onClick={() => convertToCampaign(b.id)} disabled={acting === b.id}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition-colors disabled:opacity-50">
                          <Zap size={12} /> Confirm and Create Campaign
                        </button>
                      </>
                    )}
                    {(b.status === "REVIEWING" || b.status === "CONFIRMED") && (
                      <button onClick={() => convertToCampaign(b.id)} disabled={acting === b.id}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition-colors disabled:opacity-50">
                        <Zap size={12} /> Convert to Campaign
                      </button>
                    )}
                    {b.status === "REVIEWING" && (
                      <button onClick={() => updateStatus(b.id, "PENDING")} disabled={acting === b.id}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white/10 text-white/50 hover:bg-white/15 transition-colors disabled:opacity-50">
                        Restore to pending
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CampaignsTab() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [acting, setActing] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const url = statusFilter === "all" ? "/api/admin/campaigns" : `/api/admin/campaigns?status=${statusFilter}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load campaigns");
      const data = await res.json();
      setCampaigns(data.campaigns ?? []);
    } catch {
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  async function updateCampaignStatus(id: string, status: string) {
    setActing(id);
    try {
      const res = await fetch(`/api/admin/campaigns/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update campaign");
      setCampaigns((prev) => prev.map((c) => c.id === id ? { ...c, status } : c));
    } catch {
      // eslint-disable-next-line no-alert
      window.alert("Could not update campaign status.");
    } finally {
      setActing(null);
    }
  }

  const filtered = statusFilter === "all" ? campaigns : campaigns.filter((c) => c.status === statusFilter);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {["all", ...CAMPAIGN_STATUSES].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={"px-3 py-1.5 rounded-lg text-xs font-medium transition-colors " + (statusFilter === s ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70")}>
              {s === "all" ? "All" : s.replace(/_/g, " ").charAt(0).toUpperCase() + s.replace(/_/g, " ").slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <button onClick={load} className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70">
          <RefreshCw size={11} /> Refresh
        </button>
      </div>
      {loading ? (
        <div className="text-center py-16 text-white/30 text-sm">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-white/30 text-sm">No campaigns found.</div>
      ) : (
        <div className="rounded-2xl border border-white/[0.07] overflow-hidden divide-y divide-white/[0.04]">
          {filtered.map((c) => (
            <div key={c.id} className="bg-white/[0.02] hover:bg-white/[0.03] transition-colors">
              <button className="w-full flex items-center justify-between px-5 py-4 text-left"
                onClick={() => setExpanded(expanded === c.id ? null : c.id)}>
                <div className="flex items-center gap-4 min-w-0">
                  <StatusBadge status={c.status} map={CAMPAIGN_STATUS_COLORS} />
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-white/80 truncate">{c.title}</div>
                    <div className="text-xs text-white/35 mt-0.5">
                      {c.agency.name} · {c.talents.length} talent{c.talents.length !== 1 ? "s" : ""} · {new Date(c.createdAt).toLocaleDateString("en-GB")}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                  {c.budget && <span className="text-xs text-white/40">AED {c.budget.toLocaleString()}</span>}
                  {expanded === c.id ? <ChevronUp size={14} className="text-white/30" /> : <ChevronDown size={14} className="text-white/30" />}
                </div>
              </button>
              {expanded === c.id && (
                <div className="px-5 pb-5 space-y-4 border-t border-white/[0.05]">
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Client</div>
                      <div className="text-sm text-white/70">{c.agency.name}</div>
                      <div className="text-xs text-white/35">{c.agency.user?.email ?? "—"}</div>
                    </div>
                    {c.startDate && (
                      <div>
                        <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Start</div>
                        <div className="text-sm text-white/70">{new Date(c.startDate).toLocaleDateString("en-GB")}</div>
                      </div>
                    )}
                    {c.dueDate && (
                      <div>
                        <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Deadline</div>
                        <div className="text-sm text-white/70">{new Date(c.dueDate).toLocaleDateString("en-GB")}</div>
                      </div>
                    )}
                  </div>
                  {c.talents.length > 0 && (
                    <div>
                      <div className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Talent roster</div>
                      <div className="space-y-1.5">
                        {c.talents.map((t) => (
                          <div key={t.id} className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                            <div>
                              <span className="text-sm text-white/75">{t.talent.displayName ?? t.talent.name}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              {t.rate && <span className="text-xs text-white/40">AED {t.rate.toLocaleString()}</span>}
                              <StatusBadge status={t.status} map={CAMPAIGN_STATUS_COLORS} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {c.invites.length > 0 && (
                    <div>
                      <div className="text-[10px] text-white/30 uppercase tracking-wider mb-2">
                        Invites ({c.invites.filter((i) => i.status === "PENDING").length} pending)
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {c.invites.map((inv) => (
                          <span key={inv.id} className={"px-2 py-0.5 rounded-full text-[10px] font-medium " + (inv.status === "PENDING" ? "bg-amber-500/20 text-amber-300" : inv.status === "ACCEPTED" ? "bg-emerald-500/20 text-emerald-300" : "bg-white/10 text-white/30")}>
                            {inv.status.toLowerCase()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2 pt-2 flex-wrap">
                    <div className="text-[10px] text-white/30 uppercase tracking-wider mr-1">Move to:</div>
                    {CAMPAIGN_STATUSES.filter((s) => s !== c.status).map((s) => (
                      <button key={s} onClick={() => updateCampaignStatus(c.id, s)} disabled={acting === c.id}
                        className={"px-3 py-1.5 rounded-xl text-xs font-medium transition-colors disabled:opacity-50 " + (CAMPAIGN_STATUS_COLORS[s] ?? "bg-white/10 text-white/50")}>
                        {s.replace(/_/g, " ").charAt(0).toUpperCase() + s.replace(/_/g, " ").slice(1).toLowerCase()}
                      </button>
                    ))}
                    <a href={`/dashboard/campaigns/${c.id}`} target="_blank" rel="noopener noreferrer"
                      className="ml-auto flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs text-white/40 hover:text-white/70 border border-white/[0.07] transition-colors">
                      Open campaign <ExternalLink size={10} />
                    </a>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TalentTab({ initialCreators }: { initialCreators: Creator[] }) {
  const [items, setItems] = useState(initialCreators);
  const [filter, setFilter] = useState<string>("all");
  const [updating, setUpdating] = useState<string | null>(null);
  const filtered = filter === "all" ? items : items.filter((c) => c.talentStatus === filter);

  async function updateStatus(id: string, status: string) {
    setUpdating(id);
    try {
      const res = await fetch(`/api/admin/talent/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ talentStatus: status, isActive: status === "active" }),
      });
      if (res.ok) setItems((prev) => prev.map((c) => c.id === id ? { ...c, talentStatus: status, isActive: status === "active" } : c));
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {["all", "pending", "active", "paused", "rejected"].map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={"px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize " + (filter === s ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70")}>
              {s}
            </button>
          ))}
        </div>
        <span className="text-xs text-white/30">{filtered.length} creators</span>
      </div>
      <div className="rounded-2xl border border-white/[0.07] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.07]">
              {["Creator", "Instagram", "Location", "Score", "Source", "Status", "Actions"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-wider text-white/30">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3">
                  <div className="text-sm font-medium text-white/80">{c.displayName || c.name}</div>
                  {c.bio && <div className="text-xs text-white/25 mt-0.5 max-w-[200px] truncate">{c.bio}</div>}
                </td>
                <td className="px-4 py-3 text-sm text-white/40">
                  {c.instagram ? (
                    <a href={`https://instagram.com/${c.instagram}`} target="_blank" rel="noopener noreferrer" className="hover:text-white/70 transition-colors">@{c.instagram}</a>
                  ) : "—"}
                </td>
                <td className="px-4 py-3 text-sm text-white/40">{c.location || "—"}</td>
                <td className="px-4 py-3">
                  <span className={"inline-block px-2 py-0.5 rounded-full text-xs font-medium " + ((c.qualityScore ?? 0) >= 10 ? "bg-emerald-500/20 text-emerald-300" : (c.qualityScore ?? 0) >= 6 ? "bg-amber-500/20 text-amber-300" : "bg-white/10 text-white/40")}>
                    {c.qualityScore ?? "—"}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-white/30 capitalize">{c.source || "manual"}</td>
                <td className="px-4 py-3">
                  <span className={"inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize " + (TALENT_STATUS_COLORS[c.talentStatus] || "bg-white/10 text-white/40")}>
                    {c.talentStatus}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 flex-wrap">
                    <a href={`/creators/${c.id}`} target="_blank" rel="noopener noreferrer" className="px-2 py-1 rounded-md text-xs bg-white/[0.05] text-white/40 hover:bg-white/10 transition-colors">View</a>
                    {c.talentStatus !== "active" && (
                      <button onClick={() => updateStatus(c.id, "active")} disabled={updating === c.id}
                        className="px-2 py-1 rounded-md text-xs bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-colors disabled:opacity-50">Approve</button>
                    )}
                    {c.talentStatus === "active" && (
                      <button onClick={() => updateStatus(c.id, "paused")} disabled={updating === c.id}
                        className="px-2 py-1 rounded-md text-xs bg-white/10 text-white/40 hover:bg-white/15 transition-colors disabled:opacity-50">Pause</button>
                    )}
                    {c.talentStatus !== "rejected" && (
                      <button onClick={() => updateStatus(c.id, "rejected")} disabled={updating === c.id}
                        className="px-2 py-1 rounded-md text-xs bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-colors disabled:opacity-50">Reject</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-white/25">No creators in this filter.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UsersTab() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("all");
  const [regenUserId, setRegenUserId] = useState<string | null>(null);
  const [actionUserId, setActionUserId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [blockReason, setBlockReason] = useState("");

  const load = () => {
    setLoading(true);
    fetch("/api/admin/users")
      .then((r) => (r.ok ? r.json() : { users: [] }))
      .then((d) => setUsers(d.users ?? []))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const regenerate = async (userId: string) => {
    setRegenUserId(userId);
    try {
      const res = await fetch(`/api/admin/user-agreement/${userId}?force=true`, { method: "POST" });
      if (res.ok) load();
    } finally { setRegenUserId(null); }
  };

  const action = async (userId: string, act: string, reason?: string) => {
    setActionUserId(userId);
    try {
      await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: act, reason }),
      });
      load();
    } finally { setActionUserId(null); setBlockReason(""); }
  };

  const deleteUser = async (userId: string) => {
    setConfirmDelete(null);
    setActionUserId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      if (res.ok) load();
      else { const d = await res.json(); alert(d.error ?? "Delete failed"); }
    } finally { setActionUserId(null); }
  };

  const filtered = roleFilter === "all" ? users : users.filter((u) => u.role === roleFilter);

  return (
    <div className="space-y-4">
      {/* Delete confirm dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="rounded-2xl border border-white/10 bg-[#0F1118] p-6 max-w-sm w-full mx-4 space-y-4">
            <h3 className="text-[15px] font-semibold text-white">Delete account permanently?</h3>
            <p className="text-[12px] text-white/45">This removes the user, all their campaigns, bookings, and data. Cannot be undone.</p>
            <div className="flex gap-2 pt-1">
              <button onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2 rounded-xl text-[12px] bg-white/[0.06] text-white/50 hover:bg-white/10 transition-colors">Cancel</button>
              <button onClick={() => deleteUser(confirmDelete)}
                className="flex-1 py-2 rounded-xl text-[12px] bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30 transition-colors">Delete permanently</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {["all", "AGENCY", "CREATOR", "ADMIN"].map((r) => (
            <button key={r} onClick={() => setRoleFilter(r)}
              className={"px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize " + (roleFilter === r ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70")}>
              {r === "all" ? "All" : r.charAt(0) + r.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <span className="text-xs text-white/30">{filtered.length} users</span>
      </div>

      {loading ? (
        <div className="text-center py-16 text-white/30 text-sm">Loading...</div>
      ) : (
        <div className="rounded-2xl border border-white/[0.07] overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-white/[0.07]">
                {["User", "Email", "Role", "Status", "Account", "Joined", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-wider text-white/30">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const busy = actionUserId === u.id;
                return (
                  <tr key={u.id} className={"border-b border-white/[0.04] transition-colors " + (u.isBlocked ? "bg-red-500/[0.04]" : u.isSuspended ? "bg-amber-500/[0.04]" : "hover:bg-white/[0.02]")}>
                    <td className="px-4 py-3 text-sm font-medium text-white/80">{u.name ?? "—"}</td>
                    <td className="px-4 py-3 text-xs text-white/40">{u.email ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={"inline-block px-2 py-0.5 rounded-full text-xs font-medium " + (ROLE_COLORS[u.role] ?? "bg-white/10 text-white/40")}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {u.isBlocked ? (
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/20 text-red-300">Blocked</span>
                      ) : u.isSuspended ? (
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300">Suspended</span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300">Active</span>
                      )}
                      {u.blockedReason && <p className="text-[9px] text-red-300/50 mt-0.5 max-w-[120px] truncate">{u.blockedReason}</p>}
                    </td>
                    <td className="px-4 py-3 text-xs text-white/40">
                      {u.agencyAccount ? (
                        <span className="text-blue-300/70">{u.agencyAccount.name}</span>
                      ) : u.creatorProfile ? (
                        <span className="text-emerald-300/70 capitalize">{u.creatorProfile.talentStatus}</span>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-white/30">{new Date(u.createdAt).toLocaleDateString("en-GB")}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {/* Agreement regen */}
                        <button onClick={() => regenerate(u.id)} disabled={busy || regenUserId === u.id}
                          className="px-2 py-1 rounded-md text-xs bg-purple-500/15 text-purple-300 hover:bg-purple-500/25 transition-colors disabled:opacity-40">
                          {regenUserId === u.id ? "…" : "Agreement"}
                        </button>
                        {/* Profile link */}
                        {u.creatorProfile && (
                          <a href={`/creators/${u.creatorProfile.id}`} target="_blank" rel="noopener noreferrer"
                            className="px-2 py-1 rounded-md text-xs bg-white/[0.05] text-white/40 hover:bg-white/10 transition-colors">Profile</a>
                        )}
                        {/* Suspend / Unsuspend */}
                        {!u.isBlocked && (
                          <button onClick={() => action(u.id, u.isSuspended ? "unsuspend" : "suspend")} disabled={busy}
                            className={"px-2 py-1 rounded-md text-xs transition-colors disabled:opacity-40 " + (u.isSuspended ? "bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25" : "bg-amber-500/15 text-amber-300 hover:bg-amber-500/25")}>
                            {busy ? "…" : u.isSuspended ? "Unsuspend" : "Suspend"}
                          </button>
                        )}
                        {/* Block / Unblock */}
                        {u.isBlocked ? (
                          <button onClick={() => action(u.id, "unblock")} disabled={busy}
                            className="px-2 py-1 rounded-md text-xs bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 transition-colors disabled:opacity-40">
                            {busy ? "…" : "Unblock"}
                          </button>
                        ) : (
                          <button onClick={() => {
                            const reason = window.prompt("Block reason (optional):");
                            if (reason !== null) action(u.id, "block", reason);
                          }} disabled={busy}
                            className="px-2 py-1 rounded-md text-xs bg-red-500/15 text-red-300 hover:bg-red-500/25 transition-colors disabled:opacity-40">
                            {busy ? "…" : "Block"}
                          </button>
                        )}
                        {/* Delete */}
                        <button onClick={() => setConfirmDelete(u.id)} disabled={busy}
                          className="px-2 py-1 rounded-md text-xs bg-red-500/20 text-red-400 hover:bg-red-500/35 border border-red-500/20 transition-colors disabled:opacity-40">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-white/25">No users found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

type AnalyticsData = {
  totals: { users: number; agencies: number; creators: number; newLast7d: number; newLast30d: number };
  funnel: {
    clientsSignedUp: number; clientsWithCampaigns: number;
    campaignsActive: number; totalCampaigns: number;
    bookingsTotal: number; bookingsPending: number; bookingsConfirmed: number;
    discoveryBriefs: number; discoveryComplete: number;
    creatorsTotal: number; creatorsPending: number; creatorsActive: number;
    creatorsRejected: number; creatorsUnverified: number;
  };
  partialSignups: { noProfile: number; talentPendingReview: number };
  dailySignups: Record<string, { clients: number; creators: number }>;
};

function FunnelBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="w-32 shrink-0 text-[11px] text-white/50 text-right">{label}</div>
      <div className="flex-1 h-5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
      </div>
      <div className="w-20 shrink-0 flex items-center gap-1.5">
        <span className="text-[13px] font-semibold text-white/80 tabular-nums">{value.toLocaleString()}</span>
        <span className="text-[10px] text-white/25">{pct}%</span>
      </div>
    </div>
  );
}

function SparkLine({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return <span className="text-white/20 text-xs">—</span>;
  const max = Math.max(...data, 1);
  const w = 80; const h = 28;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h}`).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

// ── Finance Tab ───────────────────────────────────────────────────────────────
type FinanceSummary = {
  totalInvoiced: number; paid: number; pending: number; overdue: number;
  grossIn: number; grossOut: number; netRevenue: number;
};
type MonthlyRow = { label: string; gross: number; paid: number; invoiceCount: number };
type FinanceInvoice = {
  id: string; invoiceNumber: string; amount: number; currency: string; status: string;
  createdAt: string; dueDate: string | null; paidAt: string | null;
  campaign: { name: string } | null;
  talent: { name: string };
};

function fmtAED(n: number) {
  if (n >= 1000000) return `AED ${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `AED ${(n / 1000).toFixed(0)}K`;
  return `AED ${n.toLocaleString()}`;
}

function FinanceStat({ label, value, accent, sub }: { label: string; value: string; accent?: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] px-5 py-4">
      <p className="text-[10px] font-medium uppercase tracking-widest text-white/30 mb-1.5">{label}</p>
      <p className="text-[22px] font-light tabular-nums" style={{ color: accent ?? "rgba(255,255,255,0.85)" }}>{value}</p>
      {sub && <p className="text-[10px] text-white/25 mt-1">{sub}</p>}
    </div>
  );
}

const INV_STATUS_COLORS: Record<string, string> = {
  PAID: "bg-emerald-500/20 text-emerald-300",
  PENDING: "bg-amber-500/20 text-amber-300",
  OVERDUE: "bg-red-500/20 text-red-300",
  CANCELLED: "bg-white/10 text-white/30",
};

function FinanceTab() {
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [monthly, setMonthly] = useState<MonthlyRow[]>([]);
  const [invoices, setInvoices] = useState<FinanceInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetch("/api/admin/finance")
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d) return;
        setSummary(d.summary);
        setMonthly(d.monthly ?? []);
        setInvoices(d.invoices ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredInvoices = statusFilter === "all" ? invoices : invoices.filter(i => i.status === statusFilter);

  if (loading) return <div className="text-center py-16 text-white/30 text-sm">Loading finance data…</div>;

  return (
    <div className="space-y-8">
      {/* Top summary cards */}
      {summary && (
        <>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-white/25 mb-3">Revenue</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <FinanceStat label="Gross Revenue" value={fmtAED(summary.grossIn)} accent="rgba(167,139,250,0.9)" sub="All completed credits" />
              <FinanceStat label="Gross Expenses" value={fmtAED(summary.grossOut)} accent="rgba(251,191,36,0.8)" sub="All completed debits" />
              <FinanceStat label="Net Revenue" value={fmtAED(summary.netRevenue)} accent={summary.netRevenue >= 0 ? "rgba(52,211,153,0.9)" : "rgba(239,68,68,0.9)"} sub="Gross in − gross out" />
              <FinanceStat label="Total Invoiced" value={fmtAED(summary.totalInvoiced)} sub="All invoices, all statuses" />
            </div>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-white/25 mb-3">Invoice Status</p>
            <div className="grid grid-cols-3 gap-3">
              <FinanceStat label="Paid" value={fmtAED(summary.paid)} accent="rgba(52,211,153,0.9)" />
              <FinanceStat label="Pending" value={fmtAED(summary.pending)} accent="rgba(251,191,36,0.8)" />
              <FinanceStat label="Overdue" value={fmtAED(summary.overdue)} accent="rgba(239,68,68,0.9)" />
            </div>
          </div>
        </>
      )}

      {/* Monthly breakdown */}
      {monthly.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-widest text-white/25 mb-3">Monthly breakdown (last 6 months)</p>
          <div className="rounded-2xl border border-white/[0.07] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.07]">
                  {["Month", "Invoices", "Gross Billed", "Collected"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-wider text-white/30">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {monthly.map(m => (
                  <tr key={m.label} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-sm text-white/70 font-medium">{m.label}</td>
                    <td className="px-4 py-3 text-sm text-white/40">{m.invoiceCount}</td>
                    <td className="px-4 py-3 text-sm text-white/70 tabular-nums">{fmtAED(m.gross)}</td>
                    <td className="px-4 py-3 text-sm tabular-nums" style={{ color: m.paid > 0 ? "rgba(52,211,153,0.85)" : "rgba(255,255,255,0.25)" }}>{fmtAED(m.paid)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invoice ledger */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] uppercase tracking-widest text-white/25">Invoice ledger</p>
          <div className="flex gap-1">
            {["all", "PAID", "PENDING", "OVERDUE"].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={"px-3 py-1 rounded-lg text-[10px] font-medium transition-colors " + (statusFilter === s ? "bg-white/10 text-white" : "text-white/35 hover:text-white/60")}>
                {s === "all" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-white/[0.07] overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-white/[0.07]">
                {["Invoice #", "Creator", "Campaign", "Amount", "Status", "Due", "Paid", "Created"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-wider text-white/30">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-sm text-white/25">No invoices found.</td></tr>
              ) : filteredInvoices.map(inv => (
                <tr key={inv.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-xs font-mono text-white/50">{inv.invoiceNumber}</td>
                  <td className="px-4 py-3 text-xs text-white/70">{inv.talent.name}</td>
                  <td className="px-4 py-3 text-xs text-white/40">{inv.campaign?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-xs tabular-nums text-white/80 font-medium">AED {inv.amount.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={"inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold " + (INV_STATUS_COLORS[inv.status] ?? "bg-white/10 text-white/40")}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-white/30">{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString("en-GB") : "—"}</td>
                  <td className="px-4 py-3 text-xs text-white/30">{inv.paidAt ? new Date(inv.paidAt).toLocaleDateString("en-GB") : "—"}</td>
                  <td className="px-4 py-3 text-xs text-white/25">{new Date(inv.createdAt).toLocaleDateString("en-GB")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Health Monitor Tab ─────────────────────────────────────────────────────
function HealthTab() {
  const [data, setData] = useState<Record<string,unknown>|null>(null);
  const [loading, setLoading] = useState(true);
  const load = () => { setLoading(true); fetch("/api/admin/health").then(r=>r.json()).then(setData).finally(()=>setLoading(false)); };
  useEffect(() => { load(); }, []);
  const pill = (ok: boolean, yes: string, no: string) => (
    <span className={"inline-block px-2 py-0.5 rounded-full text-xs font-semibold " + (ok ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300")}>{ok ? yes : no}</span>
  );
  if (loading) return <div className="text-center py-16 text-white/30 text-sm">Checking platform health…</div>;
  const s = data?.stats as Record<string,number> ?? {};
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] px-5 py-4">
          <p className="text-[10px] uppercase tracking-widest text-white/30 mb-2">Database</p>
          {pill(data?.db === "healthy", "Healthy", "Error")}
        </div>
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] px-5 py-4">
          <p className="text-[10px] uppercase tracking-widest text-white/30 mb-2">Email (Resend)</p>
          {pill(data?.email === "verified", "Verified", "Unverified")}
        </div>
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] px-5 py-4">
          <p className="text-[10px] uppercase tracking-widest text-white/30 mb-2">AI Searches Today</p>
          <p className="text-[22px] font-light text-white/80">{s.aiSearchesToday ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] px-5 py-4">
          <p className="text-[10px] uppercase tracking-widest text-white/30 mb-2">Pending Reviews</p>
          <p className="text-[22px] font-light text-amber-300">{(s.pendingTalent ?? 0) + (s.pendingBookings ?? 0)}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {([["Users", s.userCount],["Bookings", s.bookingCount],["Campaigns", s.campaignCount],["Invoices", s.invoiceCount]] as [string, number][]).map(([l,v])=>(
          <div key={String(l)} className="rounded-2xl border border-white/[0.07] bg-white/[0.025] px-5 py-4">
            <p className="text-[10px] uppercase tracking-widest text-white/30 mb-1">{l}</p>
            <p className="text-[22px] font-light text-white/70">{v ?? 0}</p>
          </div>
        ))}
      </div>
      <div className="flex justify-end">
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.06] text-xs text-white/50 hover:bg-white/10 transition-colors">
          <RefreshCw size={11} /> Refresh
        </button>
      </div>
      <p className="text-[10px] text-white/20">Last checked: {data?.timestamp ? new Date(data.timestamp as string).toLocaleTimeString() : "—"}</p>
    </div>
  );
}

// ── AI Usage Monitor Tab ───────────────────────────────────────────────────
function AiUsageTab() {
  const [data, setData] = useState<Record<string,unknown>|null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);
  const load = (d=days) => { setLoading(true); fetch(`/api/admin/ai-usage?days=${d}`).then(r=>r.json()).then(setData).finally(()=>setLoading(false)); };
  useEffect(() => { load(); }, []);
  if (loading) return <div className="text-center py-16 text-white/30 text-sm">Loading AI usage…</div>;
  const byDay = data?.byDay as Record<string,number> ?? {};
  const topUsers = data?.topUsers as {id:string;name:string;email:string;total:number}[] ?? [];
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="grid grid-cols-3 gap-3 flex-1">
          {([["Total Searches", data?.totalSearches],["Authenticated",Number(data?.totalSearches??0)-Number(data?.anonSearches??0)],["Anonymous", data?.anonSearches]] as [string, number][]).map(([l,v])=>(
            <div key={l} className="rounded-2xl border border-white/[0.07] bg-white/[0.025] px-5 py-4">
              <p className="text-[10px] uppercase tracking-widest text-white/30 mb-1">{l}</p>
              <p className="text-[22px] font-light text-white/80">{v ?? 0}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-1 ml-4">
          {[7,14,30].map(d=>(
            <button key={d} onClick={()=>{setDays(d);load(d);}} className={"px-3 py-1.5 rounded-lg text-xs font-medium transition-colors "+(days===d?"bg-white/10 text-white":"text-white/40 hover:text-white/70")}>{d}d</button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-widest text-white/25 mb-3">Daily breakdown</p>
        <div className="rounded-2xl border border-white/[0.07] overflow-hidden">
          <table className="w-full">
            <thead><tr className="border-b border-white/[0.07]">{["Date","Searches"].map(h=><th key={h} className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-wider text-white/30">{h}</th>)}</tr></thead>
            <tbody>
              {Object.entries(byDay).sort(([a],[b])=>b.localeCompare(a)).map(([day,count])=>(
                <tr key={day} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-xs text-white/60">{day}</td>
                  <td className="px-4 py-3 text-xs text-white/80 tabular-nums font-medium">{count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {topUsers.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-widest text-white/25 mb-3">Top users by search volume</p>
          <div className="rounded-2xl border border-white/[0.07] overflow-hidden">
            <table className="w-full">
              <thead><tr className="border-b border-white/[0.07]">{["User","Email","Searches"].map(h=><th key={h} className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-wider text-white/30">{h}</th>)}</tr></thead>
              <tbody>
                {topUsers.map(u=>(
                  <tr key={u.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-xs text-white/70">{u.name}</td>
                    <td className="px-4 py-3 text-xs text-white/40">{u.email}</td>
                    <td className="px-4 py-3 text-xs font-semibold tabular-nums" style={{color:"rgba(167,139,250,0.9)"}}>{u.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Broadcast Tab ─────────────────────────────────────────────────────────
const SEGMENTS = [
  {id:"all",label:"All users"},
  {id:"clients",label:"Clients only"},
  {id:"talent",label:"Talent only"},
  {id:"pending_talent",label:"Pending talent"},
  {id:"no_booking",label:"Clients without bookings"},
];
function BroadcastTab() {
  const [segment, setSegment] = useState("clients");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{sent:number;total:number}|null>(null);
  const send = async () => {
    if (!subject.trim() || !message.trim()) return alert("Subject and message required");
    if (!confirm(`Send to "${SEGMENTS.find(s=>s.id===segment)?.label}"? This cannot be undone.`)) return;
    setSending(true); setResult(null);
    const res = await fetch("/api/admin/broadcast",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({segment,subject,message})});
    const d = await res.json();
    setResult(d); setSending(false);
    if (d.ok) { setSubject(""); setMessage(""); }
  };
  return (
    <div className="max-w-2xl space-y-5">
      <p className="text-[12px] text-white/40">Send a direct email to a segment of users. Sent via Resend from hello@creatorhive.ae.</p>
      {result && (
        <div className={"rounded-xl px-4 py-3 text-sm "+(result.sent>0?"bg-emerald-500/15 text-emerald-300 border border-emerald-500/25":"bg-red-500/15 text-red-300 border border-red-500/25")}>
          {result.sent > 0 ? `✓ Sent to ${result.sent} of ${result.total} recipients` : "No recipients found in this segment"}
        </div>
      )}
      <div>
        <p className="text-[10px] uppercase tracking-widest text-white/30 mb-2">Segment</p>
        <div className="flex flex-wrap gap-2">
          {SEGMENTS.map(s=>(
            <button key={s.id} onClick={()=>setSegment(s.id)} className={"px-3 py-1.5 rounded-lg text-xs font-medium transition-colors "+(segment===s.id?"bg-purple-500/20 text-purple-300 ring-1 ring-purple-500/40":"bg-white/[0.05] text-white/40 hover:text-white/70")}>{s.label}</button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-widest text-white/30 mb-2">Subject</p>
        <input value={subject} onChange={e=>setSubject(e.target.value)} placeholder="Email subject line…"
          className="w-full rounded-xl px-4 py-2.5 text-sm bg-white/[0.04] border border-white/[0.08] text-white/80 outline-none placeholder:text-white/20"/>
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-widest text-white/30 mb-2">Message</p>
        <textarea value={message} onChange={e=>setMessage(e.target.value)} rows={8} placeholder="Write your message…"
          className="w-full rounded-xl px-4 py-2.5 text-sm bg-white/[0.04] border border-white/[0.08] text-white/80 outline-none placeholder:text-white/20 resize-none"/>
      </div>
      <button onClick={send} disabled={sending||!subject.trim()||!message.trim()}
        className="px-6 py-2.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 text-sm font-medium hover:bg-purple-500/30 transition-colors disabled:opacity-40">
        {sending ? "Sending…" : "Send broadcast"}
      </button>
    </div>
  );
}

// ── Talent Approval Tab ───────────────────────────────────────────────────
function TalentApprovalTab() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string|null>(null);
  const load = () => { setLoading(true); fetch("/api/admin/talent").then(r=>r.ok?r.json():{creators:[]}).then(d=>setCreators(d.creators??[])).finally(()=>setLoading(false)); };
  useEffect(()=>{load();},[]);
  const approve = async (id:string) => {
    setBusy(id);
    await fetch(`/api/admin/talent/${id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({talentStatus:"active",isActive:true})});
    setBusy(null); load();
  };
  const reject = async (id:string) => {
    const reason = window.prompt("Rejection reason (sent to talent):");
    if (reason === null) return;
    setBusy(id);
    await fetch(`/api/admin/talent/${id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({talentStatus:"rejected",isActive:false})});
    setBusy(null); load();
  };
  const pending = creators.filter(c=>c.talentStatus==="pending");
  if (loading) return <div className="text-center py-16 text-white/30 text-sm">Loading…</div>;
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[12px] text-white/40">{pending.length} creator{pending.length!==1?"s":""} awaiting approval</p>
        <button onClick={load} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] text-xs text-white/40 hover:bg-white/10 transition-colors"><RefreshCw size={11}/>Refresh</button>
      </div>
      {pending.length === 0 ? <div className="text-center py-16 text-white/25 text-sm">All caught up — no pending talent.</div> : (
        <div className="rounded-2xl border border-white/[0.07] overflow-hidden">
          <table className="w-full">
            <thead><tr className="border-b border-white/[0.07]">{["Creator","Instagram","Location","Skills","Score","Actions"].map(h=><th key={h} className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-wider text-white/30">{h}</th>)}</tr></thead>
            <tbody>
              {pending.map(c=>(
                <tr key={c.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                  <td className="px-4 py-3"><p className="text-sm font-medium text-white/80">{c.name}</p><p className="text-[10px] text-white/30 mt-0.5">{c.createdAt ? new Date(c.createdAt).toLocaleDateString("en-GB") : "—"}</p></td>
                  <td className="px-4 py-3 text-xs text-white/40">{c.instagram ? `@${c.instagram}` : "—"}</td>
                  <td className="px-4 py-3 text-xs text-white/40">{c.location ?? "—"}</td>
                  <td className="px-4 py-3 text-xs text-white/40">{(c.skills??[]).slice(0,3).join(", ") || "—"}</td>
                  <td className="px-4 py-3 text-xs text-white/40">{c.qualityScore ?? "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      {c.instagram && <a href={`https://instagram.com/${c.instagram}`} target="_blank" rel="noopener noreferrer" className="px-2 py-1 rounded-md text-xs bg-white/[0.05] text-white/40 hover:bg-white/10 transition-colors">View IG</a>}
                      <button onClick={()=>approve(c.id)} disabled={busy===c.id} className="px-2 py-1 rounded-md text-xs bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 transition-colors disabled:opacity-40">{busy===c.id?"…":"Approve"}</button>
                      <button onClick={()=>reject(c.id)} disabled={busy===c.id} className="px-2 py-1 rounded-md text-xs bg-red-500/15 text-red-300 hover:bg-red-500/25 transition-colors disabled:opacity-40">{busy===c.id?"…":"Reject"}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Payouts Tab ────────────────────────────────────────────────────────────
function PayoutsTab() {
  const [payouts, setPayouts] = useState<Record<string,unknown>[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string|null>(null);
  const load = () => { setLoading(true); fetch("/api/admin/payouts").then(r=>r.json()).then(d=>{setPayouts(d.payouts??[]);setTotal(d.totalPending??0);}).finally(()=>setLoading(false)); };
  useEffect(()=>{load();},[]);
  const act = async (id:string, action:string) => {
    setBusy(id);
    await fetch("/api/admin/payouts",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,action})});
    setBusy(null); load();
  };
  if (loading) return <div className="text-center py-16 text-white/30 text-sm">Loading payouts…</div>;
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] px-5 py-3 inline-block">
          <p className="text-[10px] uppercase tracking-widest text-white/30 mb-1">Total pending payouts</p>
          <p className="text-[20px] font-light text-amber-300">AED {total.toLocaleString()}</p>
        </div>
        <button onClick={load} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] text-xs text-white/40 hover:bg-white/10 transition-colors"><RefreshCw size={11}/>Refresh</button>
      </div>
      {payouts.length === 0 ? <div className="text-center py-16 text-white/25 text-sm">No pending payouts.</div> : (
        <div className="rounded-2xl border border-white/[0.07] overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead><tr className="border-b border-white/[0.07]">{["Creator","User","Amount","Type","Date","Actions"].map(h=><th key={h} className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-wider text-white/30">{h}</th>)}</tr></thead>
            <tbody>
              {payouts.map((p)=>{
                const creator = p.creator as Record<string,string>|null;
                const user = p.user as Record<string,string>|null;
                return (
                  <tr key={p.id as string} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-xs text-white/70">{creator?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-xs text-white/40">{user?.email ?? "—"}</td>
                    <td className="px-4 py-3 text-xs font-semibold tabular-nums text-white/80">AED {(p.amount as number).toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs text-white/40">{p.type as string}</td>
                    <td className="px-4 py-3 text-xs text-white/30">{new Date(p.createdAt as string).toLocaleDateString("en-GB")}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <button onClick={()=>act(p.id as string,"approve")} disabled={busy===p.id} className="px-2 py-1 rounded-md text-xs bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 disabled:opacity-40 transition-colors">{busy===p.id?"…":"Approve"}</button>
                        <button onClick={()=>act(p.id as string,"reject")} disabled={busy===p.id} className="px-2 py-1 rounded-md text-xs bg-red-500/15 text-red-300 hover:bg-red-500/25 disabled:opacity-40 transition-colors">{busy===p.id?"…":"Reject"}</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Booking Orders Tab ─────────────────────────────────────────────────────
function BookingOrdersTab() {
  const [orders, setOrders] = useState<Record<string,unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const ORD_STATUS: Record<string,string> = {DRAFT:"bg-white/10 text-white/40",SENT:"bg-blue-500/20 text-blue-300",CONFIRMED:"bg-emerald-500/20 text-emerald-300",CANCELLED:"bg-red-500/20 text-red-300"};
  useEffect(()=>{ fetch("/api/admin/booking-orders").then(r=>r.json()).then(d=>setOrders(d.orders??[])).finally(()=>setLoading(false)); },[]);
  if (loading) return <div className="text-center py-16 text-white/30 text-sm">Loading booking orders…</div>;
  return (
    <div className="space-y-4">
      <p className="text-[12px] text-white/40">{orders.length} booking order{orders.length!==1?"s":""}</p>
      {orders.length === 0 ? <div className="text-center py-16 text-white/25 text-sm">No booking orders yet.</div> : (
        <div className="rounded-2xl border border-white/[0.07] overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead><tr className="border-b border-white/[0.07]">{["Order Ref","Client","Company","Budget","Status","PDF","Created"].map(h=><th key={h} className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-wider text-white/30">{h}</th>)}</tr></thead>
            <tbody>
              {orders.map(o=>(
                <tr key={o.id as string} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-xs font-mono text-purple-300/70">{o.orderRef as string}</td>
                  <td className="px-4 py-3 text-xs text-white/70">{o.clientName as string}<br/><span className="text-white/35">{o.clientEmail as string}</span></td>
                  <td className="px-4 py-3 text-xs text-white/40">{o.clientCompany as string ?? "—"}</td>
                  <td className="px-4 py-3 text-xs tabular-nums text-white/70">AED {(o.totalAed as number).toLocaleString()}</td>
                  <td className="px-4 py-3"><span className={"inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold "+(ORD_STATUS[o.status as string]??"bg-white/10 text-white/40")}>{o.status as string}</span></td>
                  <td className="px-4 py-3">{o.pdfPublicUrl ? <a href={o.pdfPublicUrl as string} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-300/70 hover:text-blue-300 transition-colors"><FileText size={11}/>Download</a> : <span className="text-xs text-white/25">—</span>}</td>
                  <td className="px-4 py-3 text-xs text-white/30">{new Date(o.createdAt as string).toLocaleDateString("en-GB")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Waitlist Tab ───────────────────────────────────────────────────────────
function WaitlistTab() {
  const [users, setUsers] = useState<Record<string,unknown>[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  useEffect(()=>{ fetch("/api/admin/waitlist").then(r=>r.json()).then(d=>{setUsers(d.waitlist??[]);setCount(d.count??0);}).finally(()=>setLoading(false)); },[]);
  if (loading) return <div className="text-center py-16 text-white/30 text-sm">Loading waitlist…</div>;
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[22px] font-light text-white/80">{count} <span className="text-[14px] font-normal text-white/40">clients haven{"'"}t booked yet</span></p>
          <p className="text-[11px] text-white/25 mt-0.5">Use Broadcast tab to re-engage this segment</p>
        </div>
      </div>
      {users.length === 0 ? <div className="text-center py-16 text-white/25 text-sm">Everyone has booked! 🎉</div> : (
        <div className="rounded-2xl border border-white/[0.07] overflow-hidden">
          <table className="w-full">
            <thead><tr className="border-b border-white/[0.07]">{["Name","Email","Company","Brief","Signed Up"].map(h=><th key={h} className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-wider text-white/30">{h}</th>)}</tr></thead>
            <tbody>
              {users.map(u=>{
                const brief = u.discoveryBrief as Record<string,unknown>|null;
                const agency = u.agencyAccount as Record<string,string>|null;
                return (
                  <tr key={u.id as string} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-xs text-white/70">{u.name as string ?? "—"}</td>
                    <td className="px-4 py-3 text-xs text-white/40">{u.email as string}</td>
                    <td className="px-4 py-3 text-xs text-white/40">{agency?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-xs">
                      {brief ? (
                        <div>
                          <span className={"inline-block px-1.5 py-0.5 rounded text-[9px] font-medium "+(brief.status==="COMPLETE"?"bg-emerald-500/20 text-emerald-300":"bg-amber-500/20 text-amber-300")}>{String(brief.status ?? "")}</span>
                          {!!brief.primaryObjective && <p className="text-white/30 mt-0.5 text-[10px]">{String(brief.primaryObjective).slice(0,40)}</p>}
                        </div>
                      ) : <span className="text-white/20">No brief</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-white/30">{new Date(u.createdAt as string).toLocaleDateString("en-GB")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function AnalyticsTab() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64 text-white/30 text-sm">Loading analytics…</div>;
  if (!data) return <div className="text-center py-16 text-white/30 text-sm">Analytics unavailable.</div>;

  const { totals, funnel, partialSignups, dailySignups } = data;

  // Build 14-day sparkline arrays
  const days14 = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(Date.now() - (13 - i) * 86400000).toISOString().slice(0, 10);
    return dailySignups[d] ?? { clients: 0, creators: 0 };
  });
  const clientSpark = days14.map((d) => d.clients);
  const creatorSpark = days14.map((d) => d.creators);

  return (
    <div className="space-y-8">

      {/* Top stat row */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-4">Growth</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "Total users",    value: totals.users,      spark: null,         color: "" },
            { label: "Clients",        value: totals.agencies,   spark: clientSpark,  color: "rgba(96,165,250,0.8)" },
            { label: "Creators",       value: totals.creators,   spark: creatorSpark, color: "rgba(52,211,153,0.8)" },
            { label: "New (7d)",       value: totals.newLast7d,  spark: null,         color: "" },
            { label: "New (30d)",      value: totals.newLast30d, spark: null,         color: "" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4">
              <div className="flex items-end justify-between">
                <div className="text-2xl font-semibold text-white">{s.value.toLocaleString()}</div>
                {s.spark && <SparkLine data={s.spark} color={s.color} />}
              </div>
              <div className="mt-1 text-[11px] text-white/40 uppercase tracking-widest">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Client funnel */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-4">Client funnel</h2>
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 space-y-3.5">
          <FunnelBar label="Signed up"         value={funnel.clientsSignedUp}      total={funnel.clientsSignedUp}      color="rgba(96,165,250,0.7)" />
          <FunnelBar label="Discovery done"    value={funnel.discoveryComplete}     total={funnel.clientsSignedUp}      color="rgba(96,165,250,0.6)" />
          <FunnelBar label="Has campaign"      value={funnel.clientsWithCampaigns}  total={funnel.clientsSignedUp}      color="rgba(124,92,255,0.7)" />
          <FunnelBar label="Booking submitted" value={funnel.bookingsTotal}         total={funnel.clientsSignedUp}      color="rgba(167,139,250,0.7)" />
          <FunnelBar label="Booking confirmed" value={funnel.bookingsConfirmed}     total={funnel.clientsSignedUp}      color="rgba(52,211,153,0.7)" />
          <div className="pt-2 border-t border-white/[0.05]">
            <div className="flex gap-6 text-[11px] text-white/35">
              <span>Discovery completion: <strong className="text-white/60">{funnel.clientsSignedUp > 0 ? Math.round((funnel.discoveryComplete / funnel.clientsSignedUp) * 100) : 0}%</strong></span>
              <span>Campaign conversion: <strong className="text-white/60">{funnel.clientsSignedUp > 0 ? Math.round((funnel.clientsWithCampaigns / funnel.clientsSignedUp) * 100) : 0}%</strong></span>
              <span>Booking rate: <strong className="text-white/60">{funnel.clientsSignedUp > 0 ? Math.round((funnel.bookingsTotal / funnel.clientsSignedUp) * 100) : 0}%</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Talent funnel */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-4">Talent pipeline</h2>
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 space-y-3.5">
          <FunnelBar label="Applied"     value={funnel.creatorsTotal}    total={funnel.creatorsTotal} color="rgba(52,211,153,0.7)" />
          <FunnelBar label="Pending"     value={funnel.creatorsPending}  total={funnel.creatorsTotal} color="rgba(251,146,60,0.7)" />
          <FunnelBar label="Active"      value={funnel.creatorsActive}   total={funnel.creatorsTotal} color="rgba(52,211,153,0.85)" />
          <FunnelBar label="Rejected"    value={funnel.creatorsRejected} total={funnel.creatorsTotal} color="rgba(248,113,113,0.6)" />
        </div>
      </div>

      {/* Partial signups */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-4">Incomplete signups</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-5">
            <div className="text-2xl font-semibold text-amber-300">{partialSignups.noProfile.toLocaleString()}</div>
            <div className="mt-1 text-[11px] text-white/40 uppercase tracking-widest">No profile created</div>
            <div className="mt-1 text-[10px] text-white/25">Signed up but never completed client or talent profile</div>
          </div>
          <div className="rounded-2xl border border-purple-500/20 bg-purple-500/[0.04] p-5">
            <div className="text-2xl font-semibold text-purple-300">{partialSignups.talentPendingReview.toLocaleString()}</div>
            <div className="mt-1 text-[11px] text-white/40 uppercase tracking-widest">Talent awaiting review</div>
            <div className="mt-1 text-[10px] text-white/25">Completed signup but not yet approved</div>
          </div>
        </div>
      </div>

      {/* Daily signups table */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-4">Daily signups (last 14 days)</h2>
        <div className="rounded-2xl border border-white/[0.07] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.07]">
                {["Date", "Clients", "Creators", "Total"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-wider text-white/30">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {days14.map((d, i) => {
                const date = new Date(Date.now() - (13 - i) * 86400000).toISOString().slice(0, 10);
                const total = d.clients + d.creators;
                return (
                  <tr key={date} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-2.5 text-sm text-white/50">{date}</td>
                    <td className="px-4 py-2.5 text-sm text-blue-300/80 tabular-nums">{d.clients > 0 ? `+${d.clients}` : "—"}</td>
                    <td className="px-4 py-2.5 text-sm text-emerald-300/80 tabular-nums">{d.creators > 0 ? `+${d.creators}` : "—"}</td>
                    <td className="px-4 py-2.5 text-sm font-medium tabular-nums" style={{ color: total > 0 ? "rgba(255,255,255,0.70)" : "rgba(255,255,255,0.20)" }}>{total > 0 ? `+${total}` : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[10px] text-white/20">
          PostHog captures all named events (search, booking, signup steps) — view funnels at app.posthog.com. DB data shown above is source of truth for registrations.
        </p>
      </div>
    </div>
  );
}

function IntegrationsTab() {
  const integrations = [
    {
      name: 'Sentry',
      status: 'pending',
      description: 'Error tracking & performance monitoring',
      envVars: ['NEXT_PUBLIC_SENTRY_DSN', 'SENTRY_DSN'],
      dashboardUrl: 'https://sentry.io',
      setupUrl: 'https://sentry.io/onboarding/',
    },
    {
      name: 'Google Analytics 4',
      status: 'pending',
      description: 'Visitor tracking and conversion measurement',
      envVars: ['NEXT_PUBLIC_GA_MEASUREMENT_ID'],
      dashboardUrl: 'https://analytics.google.com',
      setupUrl: 'https://analytics.google.com',
    },
    {
      name: 'PostHog',
      status: 'connected',
      description: 'Product analytics and session recording',
      envVars: ['NEXT_PUBLIC_POSTHOG_KEY'],
      dashboardUrl: 'https://app.posthog.com',
      setupUrl: 'https://posthog.com/signup',
    },
    {
      name: 'Hotjar',
      status: 'connected',
      description: 'Heatmaps, scrollmaps and session replay',
      envVars: ['NEXT_PUBLIC_HOTJAR_ID'],
      dashboardUrl: 'https://dashboard.hotjar.com',
      setupUrl: 'https://www.hotjar.com/sign-up',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-white mb-4">Integration Status</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {integrations.map((int) => (
            <div
              key={int.name}
              className={`border rounded-lg p-5 transition ${
                int.status === 'connected'
                  ? 'bg-emerald-900/20 border-emerald-700'
                  : 'bg-amber-900/20 border-amber-700'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-white">{int.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      int.status === 'connected'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {int.status === 'connected' ? '✓ Connected' : '⏳ Pending'}
                    </span>
                  </div>
                  <p className="text-xs text-white/70">{int.description}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <a
                  href={int.dashboardUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-xs py-2 px-3 rounded bg-white/10 hover:bg-white/20 transition text-center font-medium"
                >
                  Dashboard
                </a>
                <a
                  href={int.setupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-xs py-2 px-3 rounded bg-white/10 hover:bg-white/20 transition text-center font-medium"
                >
                  Setup
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white/[0.03] border border-white/[0.07] rounded-lg p-5">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <AlertTriangle size={14} className="text-amber-400" />
          Setup Checklist
        </h3>
        <ol className="space-y-2 text-xs text-white/70">
          <li><strong className="text-white">✓ PostHog & Hotjar:</strong> Already installed and capturing events</li>
          <li><strong className="text-white">◻ Sentry:</strong> Get DSN from sentry.io, add NEXT_PUBLIC_SENTRY_DSN to .env.local</li>
          <li><strong className="text-white">◻ Google Analytics 4:</strong> Get Measurement ID, add NEXT_PUBLIC_GA_MEASUREMENT_ID to .env.local</li>
          <li><strong className="text-white">◻ Restart dev server:</strong> npm run dev to load new environment variables</li>
          <li><strong className="text-white">◻ Verify:</strong> Check each dashboard for incoming data</li>
        </ol>
      </div>
    </div>
  );
}

type Tab = "overview" | "bookings" | "campaigns" | "talent" | "talent-approval" | "users" | "analytics" | "finance" | "payouts" | "booking-orders" | "broadcast" | "waitlist" | "ai-usage" | "health" | "integrations" | "integrations-metrics";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "overview",        label: "Overview",        icon: <LayoutDashboard size={14} /> },
  { id: "health",          label: "Health",          icon: <Activity size={14} /> },
  { id: "analytics",       label: "Analytics",       icon: <TrendingUp size={14} /> },
  { id: "finance",         label: "Finance",         icon: <TrendingUp size={14} /> },
  { id: "payouts",         label: "Payouts",         icon: <TrendingUp size={14} /> },
  { id: "bookings",        label: "Bookings",        icon: <BookOpen size={14} /> },
  { id: "booking-orders",  label: "Orders",          icon: <FileText size={14} /> },
  { id: "campaigns",       label: "Campaigns",       icon: <Megaphone size={14} /> },
  { id: "talent-approval", label: "Approve Talent",  icon: <UserCheck size={14} /> },
  { id: "talent",          label: "All Talent",      icon: <UserCheck size={14} /> },
  { id: "users",           label: "Users",           icon: <Users size={14} /> },
  { id: "waitlist",        label: "Waitlist",        icon: <Users size={14} /> },
  { id: "broadcast",       label: "Broadcast",       icon: <Megaphone size={14} /> },
  { id: "ai-usage",        label: "AI Usage",        icon: <Zap size={14} /> },
  { id: "integrations",    label: "Integrations",    icon: <Plug size={14} /> },
  { id: "integrations-metrics", label: "Metrics",   icon: <TrendingUp size={14} /> },
];

export default function AdminDashboardClient({ creators }: { creators: Creator[] }) {
  const [tab, setTab] = useState<Tab>("overview");
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => setStats(d))
      .finally(() => setStatsLoading(false));
  }, []);

  const pendingCount = (stats?.pendingBookings ?? 0) + (stats?.pendingTalent ?? 0);

  return (
    <div className="min-h-screen bg-[#07070A] text-white">
      <div className="border-b border-white/[0.06] bg-[#07070A]/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500/40 to-amber-500/20 flex items-center justify-center">
              <Activity size={14} className="text-purple-300" />
            </div>
            <div>
              <span className="text-[15px] font-semibold text-white/90">Admin Console</span>
              <span className="text-[11px] text-white/25 ml-2">Creator Hive</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {pendingCount > 0 && (
              <div className="flex items-center gap-1.5 mr-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                <AlertTriangle size={10} className="text-amber-400" />
                <span className="text-[11px] text-amber-300 font-medium">{pendingCount} pending actions</span>
              </div>
            )}
            <a href="/" className="px-3 py-1.5 rounded-lg text-xs text-white/40 hover:text-white/70 border border-white/[0.07] transition-colors">
              Back to app
            </a>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 flex gap-1">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={"flex items-center gap-1.5 px-4 py-2.5 text-[12px] font-medium border-b-2 transition-colors " + (tab === t.id ? "border-purple-400 text-white" : "border-transparent text-white/40 hover:text-white/70")}>
              {t.icon}
              {t.label}
              {t.id === "talent-approval" && (stats?.pendingTalent ?? 0) > 0 && (
                <span className="ml-0.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-purple-500/30 text-purple-300 text-[9px] font-bold">
                  {stats!.pendingTalent}
                </span>
              )}
              {t.id === "bookings" && (stats?.pendingBookings ?? 0) > 0 && (
                <span className="ml-0.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-amber-500/30 text-amber-300 text-[9px] font-bold">
                  {stats!.pendingBookings}
                </span>
              )}
              {t.id === "talent" && (stats?.pendingTalent ?? 0) > 0 && (
                <span className="ml-0.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-purple-500/30 text-purple-300 text-[9px] font-bold">
                  {stats!.pendingTalent}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {tab === "overview"          && <OverviewTab stats={stats} loading={statsLoading} />}
        {tab === "health"            && <HealthTab />}
        {tab === "analytics"         && <AnalyticsTab />}
        {tab === "finance"           && <FinanceTab />}
        {tab === "payouts"           && <PayoutsTab />}
        {tab === "bookings"          && <BookingsTab />}
        {tab === "booking-orders"    && <BookingOrdersTab />}
        {tab === "campaigns"         && <CampaignsTab />}
        {tab === "talent-approval"   && <TalentApprovalTab />}
        {tab === "talent"            && <TalentTab initialCreators={creators} />}
        {tab === "users"             && <UsersTab />}
        {tab === "waitlist"          && <WaitlistTab />}
        {tab === "broadcast"         && <BroadcastTab />}
        {tab === "ai-usage"          && <AiUsageTab />}
        {tab === "integrations"      && <IntegrationsTab />}
        {tab === "integrations-metrics" && <IntegrationsMetricsTab />}
      </div>
    </div>
  );
}
