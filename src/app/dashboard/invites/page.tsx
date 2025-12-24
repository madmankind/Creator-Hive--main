"use client";

import useSWR from "swr";
import { useState } from "react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function InvitesPage() {
  const { data, isLoading, mutate } = useSWR("/api/creator/invites", fetcher);
  const invites = data?.data ?? [];
  const [submitting, setSubmitting] = useState<string | null>(null);
  const respond = async (id: string, action: "ACCEPT" | "DECLINE") => {
    setSubmitting(id);
    try {
      await fetch(`/api/creator/invites/${id}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      await mutate();
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <main className="mx-auto max-w-4xl px-6 py-8 space-y-4">
      <h1 className="text-2xl font-semibold text-white/90">Invites</h1>
      {isLoading ? (
        <div className="text-white/60">Loading invites…</div>
      ) : invites.length === 0 ? (
        <div className="text-white/60">No invites yet.</div>
      ) : (
        <div className="space-y-3">
          {invites.map((inv: any) => (
            <div key={inv.id} className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4 flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-sm text-white/90 font-semibold">{inv.campaignTitle}</div>
                <div className="text-xs text-white/60">
                  {inv.agencyName ? `Agency: ${inv.agencyName}` : ""} {inv.campaignDueDate ? `· Due: ${new Date(inv.campaignDueDate).toLocaleDateString()}` : ""}
                </div>
                {inv.note && <div className="text-xs text-white/70">Note: {inv.note}</div>}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] uppercase tracking-[0.18em] text-white/50">{inv.status}</span>
                <button
                  onClick={() => respond(inv.id, "ACCEPT")}
                  disabled={submitting === inv.id}
                  className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-black hover:bg-white/90 disabled:opacity-60"
                >
                  Accept
                </button>
                <button
                  onClick={() => respond(inv.id, "DECLINE")}
                  disabled={submitting === inv.id}
                  className="rounded-full bg-white/10 px-3 py-1 text-xs text-white hover:bg-white/15 disabled:opacity-60"
                >
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
