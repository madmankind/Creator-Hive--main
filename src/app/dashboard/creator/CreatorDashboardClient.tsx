"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Briefcase, BarChart2, Share2,
  Clock, AlertCircle, Plus,
  ExternalLink, TrendingUp, Eye, DollarSign,
  ChevronRight, Edit2, CheckCircle2, X, Link2,
  Upload, Play, FileText,
} from "lucide-react";
import { signOut } from "next-auth/react";

type Tab = "overview" | "portfolio" | "opportunities" | "analytics" | "referral" | "settings";
type PortfolioItem = { id: string; title?: string | null; mediaUrl: string; mediaType: string; thumbnailUrl?: string | null };
type Invite = { id: string; status: string; createdAt: string; campaign: { id: string; title: string; status: string; budget?: number | null } };
type ContractMilestone = { id: string; title: string; amount: number; status: string };
type Contract = { id: string; title: string; status: string; totalAmount?: number | null; milestones: ContractMilestone[] };

type Profile = {
  id: string; name: string; avatarUrl?: string | null;
  instagram?: string | null; tiktok?: string | null;
  availabilityStatus: string; profileViews: number; totalEarned: number;
  isVerified: boolean; instagramVerified: boolean; tiktokVerified: boolean;
  referralCode?: string | null;
  portfolioItems: PortfolioItem[];
  invites: Invite[];
  contracts: Contract[];
} | null;

const GLASS: React.CSSProperties = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16 };
const AVAIL_CFG: Record<string, { label: string; color: string; bg: string }> = {
  AVAILABLE:   { label: "Available",   color: "#10B981", bg: "rgba(16,185,129,0.12)" },
  BUSY:        { label: "Busy",        color: "#F59E0B", bg: "rgba(245,158,11,0.12)" },
  UNAVAILABLE: { label: "Unavailable", color: "#EF4444", bg: "rgba(239,68,68,0.12)" },
};
function fmtAED(cents: number) { return `AED ${(cents / 100).toLocaleString()}`; }
function fmtDate(s: string) { return new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric" }); }

function AvailabilityToggle({ initial }: { initial: string }) {
  const [status, setStatus] = useState(initial);
  const [saving, setSaving] = useState(false);
  const statuses = ["AVAILABLE", "BUSY", "UNAVAILABLE"] as const;
  const cycle = async () => {
    const idx = statuses.indexOf(status as typeof statuses[number]);
    const next = statuses[(idx + 1) % 3];
    setSaving(true);
    await fetch("/api/creator/availability", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ availabilityStatus: next }) });
    setStatus(next); setSaving(false);
  };
  const cfg = AVAIL_CFG[status] ?? AVAIL_CFG.AVAILABLE;
  return (
    <button onClick={cycle} disabled={saving} className="flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-medium transition" style={{ background: cfg.bg, color: cfg.color, boxShadow: `0 0 0 1px ${cfg.color}40` }}>
      <span className="w-2 h-2 rounded-full" style={{ background: cfg.color }} />
      {saving ? "Saving…" : cfg.label}
    </button>
  );
}

function PortfolioManager({ items: initial }: { items: PortfolioItem[] }) {
  const [items, setItems] = useState(initial ?? []);
  const [urlInput, setUrlInput] = useState(""); const [titleInput, setTitleInput] = useState(""); const [showAdd, setShowAdd] = useState(false); const [uploading, setUploading] = useState(false);
  const addItem = async () => {
    if (!urlInput) return; setUploading(true);
    const res = await fetch("/api/creator/portfolio", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mediaUrl: urlInput, mediaType: "image", title: titleInput || undefined, position: items.length }) });
    if (res.ok) { const { item } = await res.json(); setItems(prev => [...prev, item]); setUrlInput(""); setTitleInput(""); setShowAdd(false); }
    setUploading(false);
  };
  const removeItem = async (id: string) => { await fetch(`/api/creator/portfolio/${id}`, { method: "DELETE" }); setItems(prev => prev.filter(i => i.id !== id)); };
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] font-semibold text-white/80">Portfolio ({items.length}/12)</h3>
        <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] transition" style={{ background: "rgba(124,92,255,0.15)", color: "rgba(167,139,250,0.90)", boxShadow: "0 0 0 1px rgba(124,92,255,0.35)" }}><Plus className="w-3.5 h-3.5" />Add work</button>
      </div>
      <AnimatePresence>{showAdd && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-4 rounded-xl p-4 space-y-3" style={{ background: "rgba(124,92,255,0.08)", border: "1px solid rgba(124,92,255,0.20)" }}>
        <input value={urlInput} onChange={e => setUrlInput(e.target.value)} placeholder="Image URL (https://…)" className="w-full rounded-lg px-3 py-2 text-[13px] outline-none" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.85)" }} />
        <input value={titleInput} onChange={e => setTitleInput(e.target.value)} placeholder="Title (optional)" className="w-full rounded-lg px-3 py-2 text-[13px] outline-none" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.85)" }} />
        <div className="flex gap-2"><button onClick={addItem} disabled={uploading || !urlInput} className="flex-1 rounded-full py-2 text-[12px] font-medium" style={{ background: uploading ? "rgba(255,255,255,0.06)" : "rgba(124,92,255,0.25)", color: "rgba(167,139,250,0.90)" }}>{uploading ? "Adding…" : "Add"}</button><button onClick={() => setShowAdd(false)} className="px-3 rounded-full text-[12px] text-white/40" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>Cancel</button></div>
      </motion.div>)}</AnimatePresence>
      {items.length === 0 ? (<div className="flex flex-col items-center justify-center py-12 text-white/25 gap-2 rounded-xl" style={{ border: "1px dashed rgba(255,255,255,0.10)" }}><Play className="w-8 h-8" /><p className="text-[13px]">Add your best work to attract brands</p></div>)
      : (<div className="grid grid-cols-3 gap-2">{items.map(item => (<div key={item.id} className="relative group rounded-xl overflow-hidden aspect-square" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
        {item.mediaType === "image" ? <img src={item.thumbnailUrl ?? item.mediaUrl} alt={item.title ?? ""} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} /> : <div className="w-full h-full flex items-center justify-center bg-black/30"><Play className="w-6 h-6 text-white/60" /></div>}
        <button onClick={() => removeItem(item.id)} className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition" style={{ border: "1px solid rgba(255,255,255,0.15)" }}><X className="w-3 h-3 text-white" /></button>
      </div>))}</div>)}
    </div>
  );
}

function OpportunitiesPanel() {
  const [opps, setOpps] = useState<any[]>([]); const [loading, setLoading] = useState(true);
  useEffect(() => { fetch("/api/opportunities").then(r => r.json()).then(d => { setOpps(d.opportunities ?? []); setLoading(false); }); }, []);
  if (loading) return <div className="py-12 text-center text-white/35 text-[13px]">Loading…</div>;
  if (opps.length === 0) return <div className="py-16 flex flex-col items-center gap-3 text-white/25"><Briefcase className="w-10 h-10" /><p className="text-[13px]">No open opportunities right now</p></div>;
  return (<div className="space-y-3">{opps.map(opp => (
    <div key={opp.id} className="rounded-xl p-4" style={GLASS}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div><p className="text-[14px] font-medium text-white/85">{opp.title}</p><p className="text-[12px] text-white/45 mt-0.5">{opp.agencyName}</p></div>
        {opp.budget && <span className="text-[12px] font-medium rounded-full px-3 py-1 shrink-0" style={{ background: "rgba(16,185,129,0.12)", color: "#10B981" }}>{fmtAED(opp.budget)}</span>}
      </div>
      {opp.brief && <p className="text-[12px] text-white/50 line-clamp-2 mb-3">{opp.brief}</p>}
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-white/35">{opp.talentCount} creators</span>
        <a href={`/dashboard/campaigns/${opp.id}`} className="flex items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-medium" style={{ background: "rgba(124,92,255,0.15)", color: "rgba(167,139,250,0.90)" }}>View brief<ChevronRight className="w-3.5 h-3.5" /></a>
      </div>
    </div>
  ))}</div>);
}

function AnalyticsPanel() {
  const [data, setData] = useState<any>(null);
  useEffect(() => { fetch("/api/creator/analytics").then(r => r.json()).then(setData); }, []);
  if (!data) return <div className="py-12 text-center text-white/35 text-[13px]">Loading analytics…</div>;
  const metrics = [
    { label: "Profile Views", value: data.profileViews?.toLocaleString() ?? "0", icon: Eye, color: "#60A5FA" },
    { label: "Total Earned", value: (data.totalEarned ?? 0) > 0 ? fmtAED(data.totalEarned) : "—", icon: DollarSign, color: "#10B981" },
    { label: "Booking Rate", value: data.bookingRate != null ? `${data.bookingRate}%` : "—", icon: TrendingUp, color: "#A78BFA" },
    { label: "Response Rate", value: data.responseRate != null ? `${data.responseRate}%` : "—", icon: CheckCircle2, color: "#F472B6" },
  ];
  return (<div className="space-y-5">
    <div className="grid grid-cols-2 gap-3">{metrics.map(m => { const Icon = m.icon; return (<div key={m.label} className="rounded-xl p-4" style={GLASS}><div className="flex items-center gap-2 mb-3"><div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${m.color}20` }}><Icon className="w-4 h-4" style={{ color: m.color }} /></div><span className="text-[11px] uppercase tracking-wider text-white/40">{m.label}</span></div><p className="text-[22px] font-semibold" style={{ color: m.color }}>{m.value}</p></div>); })}</div>
    {(data.earningsChart?.length ?? 0) > 0 && (<div className="rounded-xl p-5" style={GLASS}><p className="text-[12px] uppercase tracking-wider text-white/35 mb-4">Earnings (6 months)</p><div className="flex items-end gap-2 h-24">{data.earningsChart.map((pt: any) => { const max = Math.max(...data.earningsChart.map((p: any) => p.amount), 1); const pct = (pt.amount / max) * 100; return (<div key={pt.month} className="flex-1 flex flex-col items-center gap-1"><div className="w-full rounded-t-sm" style={{ height: `${Math.max(pct, 4)}%`, background: pt.amount > 0 ? "rgba(124,92,255,0.55)" : "rgba(255,255,255,0.06)" }} /><span className="text-[9px] text-white/30">{pt.month.slice(5)}</span></div>); })}</div></div>)}
  </div>);
}

function ReferralPanel() {
  const [data, setData] = useState<any>(null); const [email, setEmail] = useState(""); const [sending, setSending] = useState(false); const [copied, setCopied] = useState(false);
  useEffect(() => { fetch("/api/referral").then(r => r.json()).then(setData); }, []);
  const copy = () => { if (data?.shareUrl) { navigator.clipboard.writeText(data.shareUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); } };
  const invite = async () => { if (!email) return; setSending(true); await fetch("/api/referral", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) }); setSending(false); setEmail(""); fetch("/api/referral").then(r => r.json()).then(setData); };
  if (!data) return <div className="py-12 text-center text-white/35 text-[13px]">Loading…</div>;
  return (<div className="space-y-5">
    <div className="rounded-2xl p-6 text-center" style={{ background: "linear-gradient(135deg, rgba(124,92,255,0.15) 0%, rgba(76,29,149,0.12) 100%)", border: "1px solid rgba(124,92,255,0.25)" }}>
      <p className="text-[11px] uppercase tracking-widest text-white/45 mb-2">Your referral code</p>
      <p className="text-3xl font-bold text-white/90 mb-4 tracking-wider">{data.referralCode ?? "—"}</p>
      <button onClick={copy} className="flex items-center gap-2 mx-auto rounded-full px-5 py-2.5 text-[13px] font-medium transition" style={{ background: copied ? "rgba(16,185,129,0.20)" : "rgba(255,255,255,0.10)", color: copied ? "#10B981" : "rgba(255,255,255,0.80)", border: `1px solid ${copied ? "rgba(16,185,129,0.40)" : "rgba(255,255,255,0.15)"}` }}><Link2 className="w-4 h-4" />{copied ? "Copied!" : "Copy invite link"}</button>
    </div>
    <div className="flex gap-2"><input value={email} onChange={e => setEmail(e.target.value)} placeholder="Invite by email…" className="flex-1 rounded-full px-4 py-2.5 text-[13px] outline-none" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.85)" }} /><button onClick={invite} disabled={sending || !email} className="rounded-full px-5 py-2.5 text-[13px] font-medium" style={{ background: "rgba(124,92,255,0.25)", color: "rgba(167,139,250,0.90)", boxShadow: "0 0 0 1px rgba(124,92,255,0.40)" }}>{sending ? "…" : "Invite"}</button></div>
    {(data.referrals?.length ?? 0) > 0 && (<div><p className="text-[11px] uppercase tracking-wider text-white/35 mb-3">Invites sent</p><div className="space-y-2">{data.referrals.map((r: any) => (<div key={r.id} className="flex items-center justify-between rounded-xl px-4 py-3" style={GLASS}><span className="text-[13px] text-white/70">{r.referredEmail}</span><span className="rounded-full px-2.5 py-0.5 text-[10px] capitalize" style={{ background: r.status === "REWARDED" ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.06)", color: r.status === "REWARDED" ? "#10B981" : "rgba(255,255,255,0.50)" }}>{r.status.toLowerCase()}</span></div>))}</div></div>)}
  </div>);
}

function SettingsPanel({ profile }: { profile: Profile }) {
  const [ig, setIg] = useState(profile?.instagram ?? ""); const [tt, setTt] = useState(profile?.tiktok ?? "");
  const [saving, setSaving] = useState<string | null>(null); const [saved, setSaved] = useState<string | null>(null);
  const [openToShort, setOpenToShort] = useState(true); const [openToLong, setOpenToLong] = useState(true); const [prefSaving, setPrefSaving] = useState(false);
  useEffect(() => { fetch("/api/creator/preferences").then(r => r.json()).then(d => { if (d.preference) { setOpenToShort(d.preference.openToShortTerm); setOpenToLong(d.preference.openToLongTerm); } }); }, []);
  const verifySocial = async (platform: "instagram" | "tiktok") => {
    const handle = platform === "instagram" ? ig : tt; if (!handle) return;
    setSaving(platform); await fetch("/api/creator/social/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ platform, handle }) });
    setSaved(platform); setSaving(null); setTimeout(() => setSaved(null), 2000);
  };
  const savePrefs = async () => { setPrefSaving(true); await fetch("/api/creator/preferences", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ openToShortTerm: openToShort, openToLongTerm: openToLong }) }); setPrefSaving(false); };
  const importSocial = async () => { if (!ig) return; setSaving("import"); await fetch("/api/creator/social/import", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ platform: "instagram", handle: ig }) }).catch(() => {}); setSaved("import"); setSaving(null); setTimeout(() => setSaved(null), 2000); };
  return (<div className="space-y-5">
    <div className="rounded-xl p-5" style={GLASS}>
      <p className="text-[12px] uppercase tracking-wider text-white/40 mb-4">Social Handles</p>
      <div className="space-y-3">
        {([ { p: "instagram" as const, label: "Instagram", val: ig, set: setIg, ver: profile?.instagramVerified }, { p: "tiktok" as const, label: "TikTok", val: tt, set: setTt, ver: profile?.tiktokVerified } ] as const).map(({ p, label, val, set, ver }) => (
          <div key={p} className="flex gap-2">
            <div className="flex-1 flex items-center gap-2 rounded-xl px-3 py-2.5" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <span className="text-[12px] text-white/40">@</span>
              <input value={val} onChange={e => set(e.target.value)} placeholder={`${label} handle`} className="flex-1 bg-transparent outline-none text-[13px]" style={{ color: "rgba(255,255,255,0.85)" }} />
              {ver && <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />}
            </div>
            <button onClick={() => verifySocial(p)} disabled={saving === p || !val} className="rounded-xl px-3 py-2 text-[12px] font-medium transition shrink-0" style={{ background: saved === p ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.06)", color: saved === p ? "#10B981" : "rgba(255,255,255,0.65)", border: "1px solid rgba(255,255,255,0.10)" }}>{saving === p ? "…" : saved === p ? "✓" : "Verify"}</button>
          </div>
        ))}
      </div>
      <button onClick={importSocial} disabled={!ig || saving === "import"} className="mt-3 w-full rounded-xl py-2.5 text-[12px] font-medium flex items-center justify-center gap-2" style={{ background: "rgba(124,92,255,0.10)", border: "1px solid rgba(124,92,255,0.25)", color: "rgba(167,139,250,0.85)" }}><Upload className="w-3.5 h-3.5" />{saving === "import" ? "Importing…" : saved === "import" ? "Imported!" : "Auto-import from Instagram"}</button>
    </div>
    <div className="rounded-xl p-5" style={GLASS}>
      <p className="text-[12px] uppercase tracking-wider text-white/40 mb-4">Work Preferences</p>
      <div className="space-y-3">
        {[ { label: "Open to short-term projects", val: openToShort, set: setOpenToShort }, { label: "Open to long-term retainers", val: openToLong, set: setOpenToLong } ].map(({ label, val, set }) => (
          <div key={label} className="flex items-center justify-between"><span className="text-[13px] text-white/65">{label}</span><button onClick={() => set(!val)} className="w-10 h-5 rounded-full relative" style={{ background: val ? "rgba(124,92,255,0.55)" : "rgba(255,255,255,0.12)" }}><span className="absolute top-0.5 w-4 h-4 rounded-full transition-all" style={{ background: "white", left: val ? "calc(100% - 18px)" : "2px" }} /></button></div>
        ))}
      </div>
      <button onClick={savePrefs} disabled={prefSaving} className="mt-4 w-full rounded-xl py-2.5 text-[12px] font-medium" style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.70)", border: "1px solid rgba(255,255,255,0.10)" }}>{prefSaving ? "Saving…" : "Save preferences"}</button>
    </div>
    <button onClick={() => signOut({ callbackUrl: "/" })} className="w-full rounded-xl py-3 text-[13px] font-medium" style={{ background: "rgba(239,68,68,0.08)", color: "rgba(239,68,68,0.80)", border: "1px solid rgba(239,68,68,0.18)" }}>Sign out</button>
  </div>);
}

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: User },
  { id: "portfolio", label: "Portfolio", icon: BarChart2 },
  { id: "opportunities", label: "Opportunities", icon: Briefcase },
  { id: "analytics", label: "Analytics", icon: TrendingUp },
  { id: "referral", label: "Referral", icon: Share2 },
  { id: "settings", label: "Settings", icon: Edit2 },
];

export function CreatorDashboardClient({ profile }: { profile: Profile; userId: string }) {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>("overview");

  useEffect(() => {
    const t = searchParams.get("tab");
    const allowed: Tab[] = ["overview", "portfolio", "opportunities", "analytics", "referral", "settings"];
    if (t && allowed.includes(t as Tab)) setTab(t as Tab);
  }, [searchParams]);
  const pendingInvites = profile?.invites.filter(i => i.status === "PENDING") ?? [];
  const activeContracts = profile?.contracts.filter(c => c.status !== "COMPLETED" && c.status !== "CANCELLED") ?? [];
  const pendingMilestones = activeContracts.flatMap(c => c.milestones.filter(m => m.status === "SUBMITTED" || m.status === "FUNDED"));

  if (!profile) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: "#07070B", color: "rgba(255,255,255,0.88)" }}>
      <p className="text-white/60 text-[15px]">Complete your creator profile to get started.</p>
      <a href="/?continueTalentOnboarding=1" className="rounded-full px-6 py-3 text-[14px] font-medium" style={{ background: "rgba(124,92,255,0.25)", color: "rgba(167,139,250,0.95)", boxShadow: "0 0 0 1px rgba(124,92,255,0.45)" }}>Set up profile</a>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: "#07070B", color: "rgba(255,255,255,0.88)" }}>
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0, background: "radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.18) 0%, transparent 60%)", opacity: 0.08 }} />
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0, background: "radial-gradient(ellipse at 50% 30%, #7c3aed 0%, #4c1d95 55%, transparent 100%)", filter: "blur(180px)", opacity: 0.09 }} />
      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-12 pb-32">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            {profile.avatarUrl ? <img src={profile.avatarUrl} alt={profile.name} className="w-10 h-10 rounded-full object-cover ring-1 ring-white/10" /> : <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-sm font-medium">{profile.name.charAt(0)}</div>}
            <div><p className="text-[15px] font-semibold text-white/90">{profile.name}</p><p className="text-[12px] text-white/40">Creator Dashboard</p></div>
          </div>
          <AvailabilityToggle initial={profile.availabilityStatus} />
        </div>

        {(pendingInvites.length > 0 || pendingMilestones.length > 0) && (
          <div className="mb-6 space-y-2">
            {pendingInvites.length > 0 && (<div className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: "rgba(251,191,36,0.10)", border: "1px solid rgba(251,191,36,0.25)" }}><AlertCircle className="w-4 h-4 text-amber-400 shrink-0" /><span className="text-[13px] text-amber-300">{pendingInvites.length} pending invite{pendingInvites.length > 1 ? "s" : ""}</span><a href="/dashboard/invites" className="ml-auto text-[12px] text-amber-400">View →</a></div>)}
            {pendingMilestones.length > 0 && (<div className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: "rgba(124,92,255,0.10)", border: "1px solid rgba(124,92,255,0.25)" }}><Clock className="w-4 h-4 text-purple-400 shrink-0" /><span className="text-[13px] text-purple-300">{pendingMilestones.length} milestone{pendingMilestones.length > 1 ? "s" : ""} to action</span><a href="/dashboard/contracts" className="ml-auto text-[12px] text-purple-400">View →</a></div>)}
          </div>
        )}

        <div className="flex items-center gap-1 mb-6 overflow-x-auto scrollbar-hide pb-1">
          {TABS.map(t => { const Icon = t.icon; return (
            <button key={t.id} onClick={() => setTab(t.id)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-medium whitespace-nowrap transition shrink-0" style={{ background: tab === t.id ? "rgba(124,92,255,0.20)" : "rgba(255,255,255,0.04)", color: tab === t.id ? "rgba(167,139,250,0.95)" : "rgba(255,255,255,0.45)", boxShadow: tab === t.id ? "0 0 0 1px rgba(124,92,255,0.35)" : "0 0 0 1px rgba(255,255,255,0.06)" }}><Icon className="w-3.5 h-3.5" />{t.label}</button>
          ); })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
            {tab === "overview" && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {[ { label: "Views", value: profile.profileViews.toLocaleString(), icon: Eye, color: "#60A5FA" }, { label: "Earned", value: profile.totalEarned > 0 ? fmtAED(profile.totalEarned) : "—", icon: DollarSign, color: "#10B981" }, { label: "Invites", value: profile.invites.length.toString(), icon: Briefcase, color: "#A78BFA" } ].map(s => { const Icon = s.icon; return (<div key={s.label} className="rounded-xl p-3 text-center" style={GLASS}><Icon className="w-4 h-4 mx-auto mb-1.5" style={{ color: s.color }} /><p className="text-[17px] font-semibold text-white/90">{s.value}</p><p className="text-[10px] text-white/35 mt-0.5">{s.label}</p></div>); })}
                </div>
                {profile.invites.length > 0 && (<div className="rounded-xl p-4" style={GLASS}><p className="text-[12px] uppercase tracking-wider text-white/35 mb-3">Recent invites</p><div className="space-y-2">{profile.invites.slice(0, 3).map(inv => (<div key={inv.id} className="flex items-center justify-between"><div><p className="text-[13px] text-white/80">{inv.campaign.title}</p><p className="text-[11px] text-white/40">{fmtDate(inv.createdAt)}</p></div><span className="rounded-full px-2.5 py-0.5 text-[10px] capitalize" style={{ background: inv.status === "ACCEPTED" ? "rgba(16,185,129,0.12)" : "rgba(255,255,255,0.06)", color: inv.status === "ACCEPTED" ? "#10B981" : "rgba(255,255,255,0.55)" }}>{inv.status.toLowerCase()}</span></div>))}</div></div>)}
                {activeContracts.length > 0 && (<div className="rounded-xl p-4" style={GLASS}><div className="flex items-center justify-between mb-3"><p className="text-[12px] uppercase tracking-wider text-white/35">Active contracts</p><a href="/dashboard/contracts" className="text-[12px] text-purple-400">View all →</a></div><div className="space-y-2">{activeContracts.slice(0, 2).map(c => (<div key={c.id} className="flex items-center justify-between"><p className="text-[13px] text-white/75">{c.title}</p><span className="text-[11px] text-white/40 capitalize">{c.status.toLowerCase().replace("_", " ")}</span></div>))}</div></div>)}
                <a href={`/creators/${profile.id}`} className="flex items-center justify-between rounded-xl p-4 transition group" style={{ background: "rgba(124,92,255,0.08)", border: "1px solid rgba(124,92,255,0.20)" }}><div><p className="text-[13px] font-medium text-white/80">Your public profile</p><p className="text-[12px] text-white/40">creatorhive.app/creators/{profile.id.slice(0, 8)}…</p></div><ExternalLink className="w-4 h-4 text-purple-400 group-hover:text-purple-300 transition" /></a>
                <a href="/dashboard/documents" className="flex items-center justify-between rounded-xl p-4 transition group" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}><div className="flex items-center gap-2"><FileText className="w-4 h-4 text-white/50" /><div><p className="text-[13px] font-medium text-white/80">Documents</p><p className="text-[12px] text-white/40">User Agreement & legal docs</p></div></div><ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/50 transition" /></a>
              </div>
            )}
            {tab === "portfolio" && <PortfolioManager items={profile.portfolioItems} />}
            {tab === "opportunities" && <OpportunitiesPanel />}
            {tab === "analytics" && <AnalyticsPanel />}
            {tab === "referral" && <ReferralPanel />}
            {tab === "settings" && <SettingsPanel profile={profile} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
