"use client";

import { useState } from "react";

type Creator = {
  id: string;
  name: string;
  displayName: string | null;
  instagram: string | null;
  location: string | null;
  skills: string[];
  qualityScore: number | null;
  talentStatus: string;
  source: string | null;
  isVerified: boolean;
  isActive: boolean;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: Date;
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-500/20 text-amber-300",
  active: "bg-emerald-500/20 text-emerald-300",
  paused: "bg-blue-500/20 text-blue-300",
  rejected: "bg-red-500/20 text-red-300",
};

export default function AdminTalentClient({ creators }: { creators: Creator[] }) {
  const [items, setItems] = useState(creators);
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
      if (res.ok) {
        setItems((prev) => prev.map((c) => c.id === id ? { ...c, talentStatus: status, isActive: status === "active" } : c));
      }
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#07070A] text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white/90">Talent Registry</h1>
            <p className="text-sm text-white/35 mt-1">{items.length} creators · {items.filter(c => c.talentStatus === "pending").length} pending review</p>
          </div>
          <div className="flex gap-2">
            {["all", "pending", "active", "paused", "rejected"].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                  filter === s ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
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
                      <a href={`https://instagram.com/${c.instagram}`} target="_blank" rel="noopener noreferrer" className="hover:text-white/70 transition-colors">
                        @{c.instagram}
                      </a>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-white/40">{c.location || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                      (c.qualityScore ?? 0) >= 10 ? "bg-emerald-500/20 text-emerald-300" :
                      (c.qualityScore ?? 0) >= 6 ? "bg-amber-500/20 text-amber-300" :
                      "bg-white/10 text-white/40"
                    }`}>
                      {c.qualityScore ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-white/30 capitalize">{c.source || "manual"}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[c.talentStatus] || "bg-white/10 text-white/40"}`}>
                      {c.talentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {c.talentStatus !== "active" && (
                        <button
                          onClick={() => updateStatus(c.id, "active")}
                          disabled={updating === c.id}
                          className="px-2 py-1 rounded-md text-xs bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-colors disabled:opacity-50"
                        >
                          Approve
                        </button>
                      )}
                      {c.talentStatus === "active" && (
                        <button
                          onClick={() => updateStatus(c.id, "paused")}
                          disabled={updating === c.id}
                          className="px-2 py-1 rounded-md text-xs bg-white/10 text-white/40 hover:bg-white/15 transition-colors disabled:opacity-50"
                        >
                          Pause
                        </button>
                      )}
                      {c.talentStatus !== "rejected" && (
                        <button
                          onClick={() => updateStatus(c.id, "rejected")}
                          disabled={updating === c.id}
                          className="px-2 py-1 rounded-md text-xs bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-colors disabled:opacity-50"
                        >
                          Reject
                        </button>
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
    </div>
  );
}
