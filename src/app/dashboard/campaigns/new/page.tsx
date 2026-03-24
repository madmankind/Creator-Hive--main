"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { feyTokens } from "@/lib/fey-design-tokens";
import { ArrowLeft } from "lucide-react";

const inputCls = "w-full rounded-xl px-4 py-3 text-[14px] outline-none transition-colors bg-white/[0.04] ring-1 ring-white/[0.08] placeholder:text-white/20 focus:ring-white/20 focus:bg-white/[0.06]";

export default function NewCampaignPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [brief, setBrief] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/agency/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, brief, status: "DRAFT" }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.error || "Failed to create campaign");
      const id = body?.data?.id || body?.campaign?.id;
      router.push(id ? `/dashboard/campaigns/${id}` : "/dashboard/campaigns?mode=manage");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create campaign");
    } finally {
      setSaving(false);
    }
  };

  const headerLeft = (
    <div className="flex items-center gap-3">
      <button onClick={() => router.back()}
        className="flex items-center gap-1.5 text-[12px] transition-opacity hover:opacity-60"
        style={{ color: feyTokens.colors.text.label }}>
        <ArrowLeft size={13} /> Back
      </button>
      <div className="w-px h-4" style={{ background: 'rgba(255,255,255,0.08)' }} />
      <span className="text-[13px] font-medium" style={{ color: feyTokens.colors.text.primary }}>New Campaign</span>
    </div>
  );

  return (
    <DashboardShell headerLeft={headerLeft}>
      <div className="max-w-xl space-y-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] mb-6"
            style={{ color: feyTokens.colors.text.label }}>Campaign details</p>
          <div className="space-y-4">
            <div>
              <label className="block text-[12px] mb-2" style={{ color: feyTokens.colors.text.label }}>Campaign name *</label>
              <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Q2 Summer Launch" style={{ color: 'rgba(255,255,255,0.88)' }} />
            </div>
            <div>
              <label className="block text-[12px] mb-2" style={{ color: feyTokens.colors.text.label }}>Brief</label>
              <textarea className={inputCls + " h-28 resize-none"} value={brief} onChange={(e) => setBrief(e.target.value)}
                placeholder="Goals, deliverables, timeline, tone of voice…" style={{ color: 'rgba(255,255,255,0.88)' }} />
            </div>
          </div>
        </div>

        {error && <p className="text-[13px]" style={{ color: '#f87171' }}>{error}</p>}

        <div className="flex items-center gap-3 pt-2">
          <button onClick={handleSubmit} disabled={!title.trim() || saving}
            className="rounded-xl px-6 py-3 text-[14px] font-medium transition-all"
            style={{
              background: title.trim() ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.10)',
              color: title.trim() ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.25)',
              cursor: title.trim() && !saving ? 'pointer' : 'not-allowed',
            }}>
            {saving ? 'Creating…' : 'Create campaign →'}
          </button>
          <button onClick={() => router.push('/?skip=gallery')}
            className="text-[12px] transition-opacity hover:opacity-70"
            style={{ color: feyTokens.colors.text.label }}>
            Or browse talent first →
          </button>
        </div>
      </div>
    </DashboardShell>
  );
}
