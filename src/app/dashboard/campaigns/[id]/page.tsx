"use client";
import useSWR from "swr";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { CampaignSwitcher } from "@/components/campaigns/CampaignSwitcher";
import { feyTokens } from "@/lib/fey-design-tokens";
import { FileText, Upload, Download, ArrowLeft } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());
const inputCls = "w-full rounded-xl px-4 py-3 text-[13px] outline-none transition-colors bg-white/[0.04] ring-1 ring-white/[0.08] placeholder:text-white/20 focus:ring-white/20";

const STATUS_OPTIONS = ["DRAFT","ACTIVE","IN_PROGRESS","COMPLETED","CANCELLED"];
const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  DRAFT:       { bg: 'rgba(99,102,241,0.09)', text: 'rgba(165,180,252,0.75)' },
  ACTIVE:      { bg: 'rgba(16,185,129,0.10)', text: 'rgba(52,211,153,0.85)' },
  IN_PROGRESS: { bg: 'rgba(99,102,241,0.09)', text: 'rgba(165,180,252,0.75)' },
  COMPLETED:   { bg: 'rgba(255,255,255,0.05)', text: 'rgba(255,255,255,0.35)' },
  CANCELLED:   { bg: 'rgba(229,72,77,0.08)',   text: 'rgba(229,72,77,0.65)' },
};

export default function CampaignDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading, mutate } = useSWR(() => params?.id ? `/api/agency/campaigns/${params.id}` : null, fetcher);
  const { data: podData, mutate: refreshPod } = useSWR(() => params?.id ? `/api/pods/${params.id}` : null, fetcher);
  const { data: filesData, mutate: refreshFiles } = useSWR(() => params?.id ? `/api/campaigns/${params.id}/files` : null, fetcher);
  const campaign = data?.campaign;

  const [title, setTitle] = useState("");
  const [brief, setBrief] = useState("");
  const [status, setStatus] = useState("DRAFT");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (campaign) { setTitle(campaign.title || ""); setBrief(campaign.brief || ""); setStatus(campaign.status || "DRAFT"); }
  }, [campaign]);

  const handleSave = async () => {
    if (!params?.id) return;
    setSaving(true); setError(null);
    try {
      const res = await fetch(`/api/agency/campaigns/${params.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, brief, status }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => null))?.error || "Failed to update");
      await mutate();
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to update"); }
    finally { setSaving(false); }
  };

  const headerLeft = (
    <div className="flex items-center gap-3">
      <button onClick={() => router.push('/dashboard/campaigns?mode=manage')}
        className="flex items-center gap-1.5 text-[12px] transition-opacity hover:opacity-60"
        style={{ color: feyTokens.colors.text.label }}>
        <ArrowLeft size={13} /> Back
      </button>
      <div className="w-px h-4" style={{ background: 'rgba(255,255,255,0.08)' }} />
      <CampaignSwitcher />
    </div>
  );
  const headerRight = (
    <button onClick={handleSave} disabled={saving}
      className="rounded-lg px-4 py-2 text-[12px] font-medium transition-all disabled:opacity-40"
      style={{ background: 'rgba(255,255,255,0.95)', color: '#07070B' }}>
      {saving ? 'Saving…' : 'Save changes'}
    </button>
  );

  if (isLoading) return <DashboardShell headerLeft={<span style={{ color: feyTokens.colors.text.muted }}>Loading…</span>}><div /></DashboardShell>;
  if (!campaign) return <DashboardShell headerLeft={<span style={{ color: '#f87171' }}>Campaign not found</span>}><div /></DashboardShell>;

  const sc = STATUS_COLORS[status] ?? STATUS_COLORS.DRAFT;

  return (
    <DashboardShell headerLeft={headerLeft} headerRight={headerRight}>
      <div className="grid gap-5 max-w-4xl" style={{ gridTemplateColumns: '1fr 320px' }}>

        {/* Left: main fields */}
        <div className="space-y-4">
          <div className="rounded-2xl px-5 py-5 space-y-4"
            style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] mb-2" style={{ color: feyTokens.colors.text.label }}>Campaign name</label>
              <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)}
                style={{ color: 'rgba(255,255,255,0.88)' }} />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] mb-2" style={{ color: feyTokens.colors.text.label }}>Status</label>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((s) => (
                  <button key={s} onClick={() => setStatus(s)}
                    className="px-3 py-1 rounded-full text-[11px] font-medium transition-all"
                    style={{
                      background: status === s ? STATUS_COLORS[s].bg : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${status === s ? STATUS_COLORS[s].text + '40' : 'rgba(255,255,255,0.07)'}`,
                      color: status === s ? STATUS_COLORS[s].text : feyTokens.colors.text.label,
                    }}>{s.replace('_',' ')}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] mb-2" style={{ color: feyTokens.colors.text.label }}>Brief</label>
              <textarea className={inputCls + " h-32 resize-none"} value={brief} onChange={(e) => setBrief(e.target.value)}
                style={{ color: 'rgba(255,255,255,0.88)' }} placeholder="Campaign goals, deliverables, timeline…" />
            </div>
            {error && <p className="text-[12px]" style={{ color: '#f87171' }}>{error}</p>}
          </div>

          {/* Attachments */}
          <div className="rounded-2xl px-5 py-4"
            style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em]" style={{ color: feyTokens.colors.text.label }}>Attachments</p>
              <label className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] cursor-pointer transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: feyTokens.colors.text.secondary }}>
                <Upload size={11} /> Upload
                <input type="file" multiple className="sr-only"
                  onChange={async (e) => {
                    if (!params?.id || !e.target.files?.length) return;
                    const fd = new FormData();
                    Array.from(e.target.files).forEach((f) => fd.append("file", f));
                    await fetch(`/api/campaigns/${params.id}/files/upload`, { method: "POST", body: fd });
                    e.target.value = ""; refreshFiles();
                  }} />
              </label>
            </div>
            {(filesData?.data ?? []).length === 0 ? (
              <p className="text-[12px]" style={{ color: feyTokens.colors.text.label }}>No files attached</p>
            ) : (
              <div className="space-y-2">
                {(filesData.data ?? []).map((f: any) => (
                  <div key={f.id} className="flex items-center justify-between rounded-xl px-3 py-2"
                    style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <div>
                      <p className="text-[12px]" style={{ color: feyTokens.colors.text.secondary }}>{f.originalName}</p>
                      <p className="text-[10px]" style={{ color: feyTokens.colors.text.label }}>{(f.sizeBytes/1024).toFixed(1)} KB</p>
                    </div>
                    <button onClick={async () => {
                      const res = await fetch(`/api/campaigns/${params.id}/files/${f.id}/download`);
                      const body = await res.json();
                      if (body?.url) window.open(body.url, "_blank");
                    }}
                      className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] transition-all"
                      style={{ background: 'rgba(255,255,255,0.04)', color: feyTokens.colors.text.muted }}>
                      <Download size={10} /> Download
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: talent + pod */}
        <div className="space-y-4">
          <div className="rounded-2xl px-4 py-4"
            style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em]" style={{ color: feyTokens.colors.text.label }}>Talent</p>
              <span className="text-[11px]" style={{ color: feyTokens.colors.text.label }}>
                {campaign.talents?.length ?? 0} assigned
              </span>
            </div>
            {(campaign.talents?.length ?? 0) === 0 ? (
              <p className="text-[12px]" style={{ color: feyTokens.colors.text.label }}>No talent assigned yet</p>
            ) : campaign.talents.map((t: any) => (
              <div key={t.talentId} className="flex items-center gap-2.5 py-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-medium flex-shrink-0"
                  style={{ background: 'rgba(124,92,255,0.12)', border: '1px solid rgba(124,92,255,0.25)', color: 'rgba(167,139,250,0.85)' }}>
                  {(t.talent?.name || "U").charAt(0)}
                </div>
                <p className="text-[13px] flex-1 truncate" style={{ color: feyTokens.colors.text.secondary }}>{t.talent?.name || "Unknown"}</p>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.04)', color: feyTokens.colors.text.label }}>
                  {t.status.toLowerCase().replace("_"," ")}
                </span>
              </div>
            ))}
          </div>

          <div className="rounded-2xl px-4 py-4"
            style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em]" style={{ color: feyTokens.colors.text.label }}>Invites</p>
              <button
                onClick={async () => {
                  if (!params?.id || !podData?.pod?.talentIds?.length) return;
                  await fetch(`/api/pods/${params.id}/invite`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ talentIds: podData.pod.talentIds }) });
                  refreshPod();
                }}
                disabled={!podData?.pod?.talentIds?.length}
                className="rounded-lg px-3 py-1 text-[11px] font-medium transition-all disabled:opacity-40"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)', color: feyTokens.colors.text.secondary }}>
                Send invites
              </button>
            </div>
            <p className="text-[11px] mb-2" style={{ color: feyTokens.colors.text.label }}>Pod: {podData?.pod?.talentIds?.length ?? 0} selected</p>
            {(podData?.invites ?? []).length === 0 ? (
              <p className="text-[12px]" style={{ color: feyTokens.colors.text.label }}>No invites sent yet</p>
            ) : (podData.invites ?? []).map((inv: any) => (
              <div key={inv.id} className="flex items-center justify-between py-1.5">
                <p className="text-[12px]" style={{ color: feyTokens.colors.text.secondary }}>{inv.talent?.name || inv.talentId}</p>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full"
                  style={{ background: inv.status === 'ACCEPTED' ? 'rgba(16,185,129,0.10)' : 'rgba(255,255,255,0.04)', color: inv.status === 'ACCEPTED' ? '#34d399' : feyTokens.colors.text.label }}>
                  {inv.status.toLowerCase()}
                </span>
              </div>
            ))}
          </div>

          {/* Contract & Milestones Section (#8 #18) */}
          <div className="rounded-2xl px-4 py-4"
            style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em]" style={{ color: feyTokens.colors.text.label }}>Contracts & Milestones</p>
              <a href="/dashboard/contracts"
                className="rounded-lg px-3 py-1 text-[11px] font-medium transition-all"
                style={{ background: "rgba(124,92,255,0.12)", border: "1px solid rgba(124,92,255,0.30)", color: "rgba(167,139,250,0.90)" }}>
                View all
              </a>
            </div>
            <p className="text-[12px]" style={{ color: feyTokens.colors.text.muted }}>
              Create contracts with milestone-based escrow payments for talent in this campaign.
              Once accepted, each milestone unlocks on approval.
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              {[
                { label: "Draft contract", step: "1" },
                { label: "Talent signs", step: "2" },
                { label: "Release escrow", step: "3" },
              ].map(s => (
                <div key={s.step} className="rounded-xl py-2.5 px-2"
                  style={{ background: "rgba(124,92,255,0.06)", border: "1px solid rgba(124,92,255,0.14)" }}>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center mx-auto mb-1.5 text-[10px] font-bold"
                    style={{ background: "rgba(124,92,255,0.25)", color: "rgba(167,139,250,0.90)" }}>{s.step}</div>
                  <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.50)" }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </DashboardShell>
  );
}
