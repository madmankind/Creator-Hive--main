'use client'

import Link from "next/link";
import { useMemo, useState } from "react";
import useSWR from "swr";
import { cn } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type Campaign = {
  id: string;
  title: string;
  status?: string;
  startDate?: string;
  talents?: any[];
};

const tabs = [
  { key: "ACTIVE", label: "Active" },
  { key: "DRAFT", label: "Drafts" },
  { key: "FINISHED", label: "Finished" },
];

export default function TrackPage() {
  const { data, isLoading } = useSWR("/api/agency/campaigns", fetcher);
  const [tab, setTab] = useState<(typeof tabs)[number]["key"]>("ACTIVE");
  const campaigns: Campaign[] = data?.data ?? [];

  const filtered = useMemo(() => {
    if (!tab) return campaigns;
    return campaigns.filter((c) =>
      tab === "FINISHED" ? c.status === "FINISHED" : c.status === tab,
    );
  }, [campaigns, tab]);

  const kpis = [
    { label: "Total campaigns", value: campaigns.length },
    { label: "Active", value: campaigns.filter((c) => c.status === "ACTIVE").length },
    { label: "Talent assignments", value: campaigns.reduce((sum, c) => sum + (c.talents?.length || 0), 0) },
  ];

  return (
    <main className="min-h-screen bg-[#F6F7FB] px-7 py-6">
      <div className="mx-auto w-full max-w-[1280px] space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-[28px] font-semibold text-slate-900">Track</h1>
            <p className="text-sm text-slate-600 mt-1">Track campaign performance</p>
          </div>
          <Link
            href="/dashboard/campaigns"
            className="rounded-full bg-indigo-600 text-white px-5 py-2 text-sm font-semibold shadow-sm hover:bg-indigo-500 transition"
          >
            Create campaign
          </Link>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {kpis.map((kpi) => (
            <div
              key={kpi.label}
              className="rounded-2xl bg-white border border-[rgba(0,0,0,0.08)] p-4 shadow-sm"
            >
              <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500 mb-1">
                {kpi.label}
              </div>
              <div className="text-2xl font-semibold text-slate-900">{kpi.value}</div>
            </div>
          ))}
        </section>

        <section className="rounded-2xl bg-white border border-[rgba(0,0,0,0.08)]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[rgba(0,0,0,0.06)] px-4 py-3">
            <div>
              <div className="text-sm font-semibold text-slate-900">Campaigns</div>
              <p className="text-xs text-slate-500">Overview of campaigns by status</p>
            </div>
            <div className="inline-flex rounded-full bg-[#F6F7FB] p-1 border border-[rgba(0,0,0,0.06)]">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTab(t.key)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-semibold transition",
                    tab === t.key ? "bg-indigo-600 text-white shadow-sm" : "text-slate-700"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="py-10 text-center text-sm text-slate-600">Loading campaigns…</div>
          ) : filtered.length === 0 ? (
            <div className="py-10 text-center text-sm text-slate-600 space-y-3">
              <div className="font-semibold text-slate-900">No campaigns yet</div>
              <div className="text-slate-500">Create your first campaign to start tracking performance.</div>
              <Link
                href="/dashboard/campaigns"
                className="inline-flex items-center justify-center rounded-full bg-indigo-600 text-white px-5 py-2 text-sm font-semibold hover:bg-indigo-500 transition"
              >
                Create campaign
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[rgba(0,0,0,0.05)]">
              <div className="grid grid-cols-12 px-4 py-3 text-[12px] uppercase tracking-[0.14em] text-slate-500">
                <div className="col-span-4">Campaign</div>
                <div className="col-span-2">Start date</div>
                <div className="col-span-2">Talent</div>
                <div className="col-span-2">Views</div>
                <div className="col-span-1">Eng.</div>
                <div className="col-span-1 text-right">Status</div>
              </div>
              {filtered.map((c) => (
                <Link
                  key={c.id}
                  href={`/dashboard/campaigns?id=${c.id}`}
                  className="grid grid-cols-12 items-center px-4 py-3 hover:bg-[#F9FAFC] transition"
                >
                  <div className="col-span-4 min-w-0">
                    <div className="text-sm font-semibold text-slate-900 truncate">{c.title || "Untitled"}</div>
                    <div className="text-[11px] text-slate-500 truncate">Campaign brief</div>
                  </div>
                  <div className="col-span-2 text-sm text-slate-700">
                    {c.startDate ? new Date(c.startDate).toLocaleDateString() : "—"}
                  </div>
                  <div className="col-span-2 text-sm text-slate-700">
                    {c.talents?.length ?? 0} talent
                  </div>
                  <div className="col-span-2 text-sm text-slate-700">—</div>
                  <div className="col-span-1 text-sm text-slate-700">—</div>
                  <div className="col-span-1 text-right">
                    <span className={cn(
                      "rounded-full px-2 py-1 text-[11px] font-semibold uppercase",
                      c.status === "ACTIVE"
                        ? "bg-emerald-50 text-emerald-700"
                        : c.status === "DRAFT"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-slate-100 text-slate-700"
                    )}>
                      {c.status || "Draft"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
