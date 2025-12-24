"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewCampaignPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [brief, setBrief] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/agency/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, brief, status: "DRAFT" }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(body?.error || "Failed to create campaign");
      }
      const id = body?.data?.id || body?.campaign?.id;
      router.push(id ? `/dashboard/campaigns/${id}` : "/dashboard/campaigns");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create campaign");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="mx-auto max-w-3xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white/90">New campaign</h1>
        <button
          onClick={() => router.push("/dashboard/campaigns")}
          className="text-sm text-white/60 hover:text-white transition"
        >
          ← Back
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm text-white/80 mb-2">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full rounded-xl bg-white/5 px-4 py-3 text-white ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-white/30"
            placeholder="e.g., Q2 Launch Campaign"
          />
        </div>

        <div>
          <label className="block text-sm text-white/80 mb-2">Brief</label>
          <textarea
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            required
            rows={6}
            className="w-full rounded-xl bg-white/5 px-4 py-3 text-white ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-white/30"
            placeholder="Describe goals, deliverables, timeline..."
          />
        </div>

        {error && <div className="text-sm text-red-400">{error}</div>}

        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-white px-6 py-2 text-black text-sm font-semibold hover:bg-white/90 disabled:opacity-60"
        >
          {saving ? "Creating..." : "Create campaign"}
        </button>
      </form>
    </main>
  );
}
