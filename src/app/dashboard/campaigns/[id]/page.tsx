"use client";

import useSWR from "swr";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

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
    if (campaign) {
      setTitle(campaign.title || "");
      setBrief(campaign.brief || "");
      setStatus(campaign.status || "DRAFT");
    }
  }, [campaign]);

  const handleSave = async () => {
    if (!params?.id) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/agency/campaigns/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, brief, status }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.error || "Failed to update campaign");
      await mutate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update campaign");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-6 text-white/70">Loading...</div>;
  }

  if (!campaign) {
    return <div className="p-6 text-red-400">Campaign not found</div>;
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white/90">Campaign details</h1>
          <p className="text-sm text-white/60">Manage your campaign basics</p>
        </div>
        <button
          onClick={() => router.push("/dashboard/campaigns")}
          className="text-sm text-white/60 hover:text-white transition"
        >
          ← Back
        </button>
      </div>

      <section className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-6 space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-xs uppercase tracking-[0.18em] text-white/50 mb-2">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl bg-white/5 px-4 py-3 text-white ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-white/30"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-[0.18em] text-white/50 mb-2">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-xl bg-white/5 px-4 py-3 text-white ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-white/30"
            >
              {["DRAFT", "ACTIVE", "IN_PROGRESS", "COMPLETED", "CANCELLED"].map((s) => (
                <option key={s} value={s} className="bg-[#0B0F14]">{s}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs uppercase tracking-[0.18em] text-white/50 mb-2">Brief</label>
          <textarea
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            rows={6}
            className="w-full rounded-xl bg-white/5 px-4 py-3 text-white ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-white/30"
          />
        </div>
        {error && <div className="text-sm text-red-400">{error}</div>}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-full bg-white px-6 py-2 text-black text-sm font-semibold hover:bg-white/90 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </section>

      <section className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white/90">Assigned talents</h2>
          <span className="text-xs text-white/50">Planned</span>
        </div>
        {campaign.talents?.length ? (
          <div className="space-y-2">
            {campaign.talents.map((t: any) => (
              <div key={t.talentId} className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/10 grid place-items-center text-xs text-white/80">
                    {(t.talent?.name || "U").charAt(0)}
                  </div>
                  <div className="text-sm text-white/90">{t.talent?.name || "Unknown"}</div>
                </div>
                <span className={cn(
                  "text-[10px] px-2 py-0.5 rounded-full font-semibold",
                  t.status === "IN_PROGRESS" ? "bg-blue-500/20 text-blue-300"
                    : t.status === "SUBMITTED" ? "bg-purple-500/20 text-purple-300"
                      : t.status === "APPROVED" ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-neutral-500/20 text-neutral-300"
                )}>
                  {t.status.toLowerCase().replace("_", " ")}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-white/60">No talents assigned yet.</div>
        )}
      </section>

      <section className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-6 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white/90">Pod & invites</h2>
          <button
            onClick={async () => {
              if (!params?.id || !podData?.pod?.talentIds?.length) return;
              await fetch(`/api/pods/${params.id}/invite`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ talentIds: podData.pod.talentIds }),
              });
              refreshPod();
            }}
            disabled={!podData?.pod?.talentIds?.length}
            className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-white/90 disabled:opacity-60"
          >
            Send invites
          </button>
        </div>
        <div className="text-xs text-white/60">
          Pod size: {podData?.pod?.talentIds?.length || 0}
        </div>
        <div className="space-y-2">
          {(podData?.invites ?? []).map((inv: any) => (
            <div key={inv.id} className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2">
              <div className="text-sm text-white/90">{inv.talent?.name || inv.talentId}</div>
              <span className={cn(
                "text-[10px] px-2 py-0.5 rounded-full font-semibold",
                inv.status === "ACCEPTED"
                  ? "bg-emerald-500/20 text-emerald-300"
                  : inv.status === "DECLINED"
                  ? "bg-red-500/20 text-red-300"
                  : "bg-amber-500/20 text-amber-300"
              )}>
                {inv.status.toLowerCase()}
              </span>
            </div>
          ))}
          {(!podData?.invites || podData.invites.length === 0) && (
            <div className="text-sm text-white/60">No invites sent yet.</div>
          )}
        </div>
      </section>

      <section className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-6 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white/90">Attachments</h2>
          <input
            type="file"
            multiple
            onChange={async (e) => {
              if (!params?.id || !e.target.files?.length) return;
              const formData = new FormData();
              Array.from(e.target.files).forEach((file) => formData.append("file", file));
              await fetch(`/api/campaigns/${params.id}/files/upload`, {
                method: "POST",
                body: formData,
              });
              e.target.value = "";
              refreshFiles();
            }}
            className="text-xs text-white/70"
          />
        </div>
        <div className="space-y-2">
          {(filesData?.data ?? []).map((file: any) => (
            <div key={file.id} className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-sm text-white/90">
              <div>
                <div>{file.originalName}</div>
                <div className="text-xs text-white/50">
                  {(file.sizeBytes / 1024).toFixed(1)} KB · {new Date(file.createdAt).toLocaleString()}
                </div>
              </div>
              <button
                className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-black hover:bg-white/90"
                onClick={async () => {
                  const res = await fetch(`/api/campaigns/${params.id}/files/${file.id}/download`);
                  const body = await res.json();
                  if (body?.url) {
                    window.open(body.url, "_blank");
                  }
                }}
              >
                Download
              </button>
            </div>
          ))}
          {(!filesData?.data || filesData.data.length === 0) && (
            <div className="text-sm text-white/60">No attachments yet.</div>
          )}
        </div>
      </section>
    </main>
  );
}
