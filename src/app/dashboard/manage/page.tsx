'use client'
import useSWR from "swr";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";
import DashboardDiscovery from "../discover/DashboardDiscoveryClient";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function ManagePage() {
  const { data, isLoading } = useSWR("/api/agency/campaigns", fetcher);
  const campaigns = data?.data ?? [];
  const talents =
    campaigns.flatMap((c: any) =>
      (c.talents || []).map((t: any) => ({
        ...t.talent,
        campaignTitle: c.title,
      })),
    ) || [];

  const [tab, setTab] = useState<"hired" | "discover">("hired");

  return (
    <main className="min-h-screen bg-[#F6F7FB] px-7 py-6">
      <div className="mx-auto max-w-[1280px] space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-[28px] font-semibold text-slate-900">Manage</h1>
            <p className="text-sm text-slate-600 mt-1">Hired talent and discovery</p>
          </div>
          <Link
            href="/dashboard/discover"
            className="rounded-full bg-indigo-600 text-white px-5 py-2 text-sm font-semibold shadow-sm hover:bg-indigo-500 transition"
          >
            Discover talent
          </Link>
        </header>

        <div className="inline-flex rounded-full bg-white border border-[rgba(0,0,0,0.08)] p-1">
          {[
            { key: "hired", label: "Hired talent" },
            { key: "discover", label: "Discover talent" },
          ].map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key as typeof tab)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-semibold transition",
                tab === t.key ? "bg-indigo-600 text-white shadow-sm" : "text-slate-700"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "hired" && (
          <>
            {isLoading ? (
              <div className="rounded-2xl bg-white border border-[#E7E9F2] p-8 text-center text-slate-500">
                Loading talent…
              </div>
            ) : talents.length === 0 ? (
              <div className="rounded-2xl bg-white border border-[#E7E9F2] p-8 text-center space-y-2">
                <div className="text-sm font-semibold text-slate-900">No hired talent yet</div>
                <p className="text-sm text-slate-500">Start by discovering and adding talent to a campaign.</p>
                <Link
                  href="/dashboard/discover"
                  className="inline-flex items-center justify-center rounded-full bg-indigo-600 text-white px-5 py-2 text-sm font-semibold hover:bg-indigo-500 transition"
                >
                  Discover talent
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {talents.map((t: any, idx: number) => (
                  <div
                    key={`${t?.id || idx}-${idx}`}
                    className="rounded-2xl bg-white border border-[#E7E9F2] p-4 shadow-sm"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-semibold grid place-items-center">
                        {(t?.name || "T").slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-900 truncate">{t?.name || "Unnamed"}</div>
                        <div className="text-[12px] text-slate-500 truncate">{t?.campaignTitle}</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 text-[11px] text-slate-600">
                      {(t?.roles || []).slice(0, 3).map((r: string) => (
                        <span key={r} className="rounded-full bg-[#F6F7FB] px-2 py-1 border border-[#E7E9F2]">
                          {r}
                        </span>
                      ))}
                      {(t?.platforms || []).slice(0, 2).map((p: string) => (
                        <span key={p} className="rounded-full bg-[#EEF2FF] text-indigo-700 px-2 py-1 border border-[#E7E9F2]">
                          {p}
                        </span>
                      ))}
                    </div>
                    <div className="mt-3 inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 px-2 py-1 text-[11px] font-semibold">
                      Assigned
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === "discover" && (
          <div className="rounded-2xl bg-white border border-[#E7E9F2] p-4">
            <DashboardDiscovery />
          </div>
        )}
      </div>
    </main>
  );
}
