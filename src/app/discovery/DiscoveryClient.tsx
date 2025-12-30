'use client';
import { useMemo, useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

const fetcher = (u: string, init?: RequestInit) => fetch(u, init).then((r) => r.json());

type Availability = "hourly" | "monthly" | "";

export default function DiscoveryClient() {
  const { data: session } = useSession();
  const isAuthenticated = Boolean(session?.user);
  const [page, setPage] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [rolesInput, setRolesInput] = useState("");
  const [location, setLocation] = useState("");
  const [availability, setAvailability] = useState<Availability>("");
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [campaignId, setCampaignId] = useState<string | null>(null);

  const body = useMemo(
    () => ({
      page,
      sort: { field: "name", direction: "asc" },
      filter: {
        keywords: keyword,
        roles: rolesInput
          .split(",")
          .map((r) => r.trim())
          .filter(Boolean)
          .slice(0, 4),
        location: location || undefined,
        availability: availability || undefined,
        platforms,
      },
    }),
    [page, keyword, rolesInput, location, availability, platforms],
  );

  const { data, isLoading, error } = useSWR(
    isAuthenticated ? ["/api/discovery/search", JSON.stringify(body)] : null,
    ([u, b]) => fetcher(u, { method: "POST", body: b }),
    { keepPreviousData: true },
  );
  const { data: campaigns } = useSWR(isAuthenticated ? "/api/agency/campaigns" : null, fetcher);
  const { data: podData, mutate: refreshPod } = useSWR(
    campaignId ? `/api/pods/${campaignId}` : null,
    fetcher,
  );

  const items = data?.data || data?.results || [];
  const hasNext = Boolean(data?.meta?.hasMore);
  const total = data?.meta?.total ?? 0;
  const selectedIds: string[] = podData?.pod?.talentIds ?? [];

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#0B0F14] text-slate-200 flex items-center justify-center px-6">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-semibold text-white/90">Members-only Discovery</h1>
          <p className="text-white/60 text-sm">
            The Creator Hive discovery directory is available to approved members. Please sign in from the home page
            to access vetted talent insights.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-white text-black px-5 py-2 text-sm font-medium hover:bg-white/90 transition"
          >
            Go to homepage
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0B0F14] text-slate-200">
      <div className="grid grid-cols-12 gap-0">
        {/* Left rail (filters) */}
        <aside className="col-span-12 md:col-span-3 xl:col-span-3 border-r border-white/10 p-4 space-y-4">
          <div className="space-y-2">
            <label className="text-xs text-white/60">@creator or email</label>
            <input
              className="w-full rounded-lg bg-white/5 ring-1 ring-white/10 px-3 py-2 text-sm outline-none"
              placeholder="Search"
              value={keyword}
              onChange={(e) => {
                setPage(0);
                setKeyword(e.target.value);
              }}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs text-white/60">Roles / skills (comma separated, max 4)</label>
            <input
              className="w-full rounded-lg bg-white/5 ring-1 ring-white/10 px-3 py-2 text-sm outline-none"
              placeholder="UGC, Photography, Lifestyle"
              value={rolesInput}
              onChange={(e) => {
                setPage(0);
                setRolesInput(e.target.value);
              }}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs text-white/60">Location</label>
            <input
              className="w-full rounded-lg bg-white/5 ring-1 ring-white/10 px-3 py-2 text-sm outline-none"
              placeholder="City, Country"
              value={location}
              onChange={(e) => {
                setPage(0);
                setLocation(e.target.value);
              }}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs text-white/60">Platforms</label>
            <div className="flex rounded-full bg-white/5 ring-1 ring-white/10 p-1 w-fit">
              {["instagram", "tiktok", "youtube"].map((p) => {
                const active = platforms.includes(p);
                return (
                  <button
                    key={p}
                    type="button"
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm capitalize",
                      active ? "bg-white/10 text-white" : "text-white/60"
                    )}
                    onClick={() => {
                      setPage(0);
                      setPlatforms((prev) =>
                        prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
                      );
                    }}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-white/60">Availability</label>
            <select
              className="w-full rounded-lg bg-white/5 ring-1 ring-white/10 px-3 py-2 text-sm outline-none"
              value={availability}
              onChange={(e) => {
                setPage(0);
                setAvailability(e.target.value as Availability);
              }}
            >
              <option value="">Any</option>
              <option value="hourly">Hourly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </aside>

        {/* Results list */}
        <section className="col-span-12 md:col-span-9 xl:col-span-9 p-4">
          <div className="text-sm text-white/50 mb-3">
            {new Intl.NumberFormat().format(total)} profiles
          </div>
          {campaigns?.data?.length > 0 && (
            <div className="mb-4 flex items-center gap-3">
              <label className="text-sm text-white/70">Active campaign:</label>
              <select
                value={campaignId ?? ""}
                onChange={(e) => {
                  setCampaignId(e.target.value || null);
                  refreshPod();
                }}
                className="rounded-full bg-white/5 px-3 py-2 text-sm text-white ring-1 ring-white/10 outline-none"
              >
                <option value="">Select campaign</option>
                {campaigns.data.map((c: any) => (
                  <option key={c.id} value={c.id} className="bg-[#0B0F14]">
                    {c.title}
                  </option>
                ))}
              </select>
              {campaignId && (
                <span className="text-xs text-white/50">
                  Pod size: {selectedIds.length}
                </span>
              )}
            </div>
          )}

          {isLoading ? (
            <div className="text-white/60">Loading…</div>
          ) : error ? (
            <div className="text-red-400">Error loading</div>
          ) : (
            <div className="space-y-3">
              {items.map((it: any) => (
                <Row
                  key={it.id || it.userId || it.username}
                  item={it}
                  campaignId={campaignId}
                  selected={selectedIds.includes(it.id)}
                  onToggle={async (talentId) => {
                    if (!campaignId) return;
                    const nextIds = selectedIds.includes(talentId)
                      ? selectedIds.filter((id) => id !== talentId)
                      : [...selectedIds, talentId];
                    await fetch(`/api/pods/${campaignId}/select`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ talentIds: nextIds }),
                    });
                    refreshPod();
                  }}
                />
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mt-4">
            <button 
              disabled={page === 0} 
              onClick={() => setPage(p => Math.max(0, p - 1))} 
              className="rounded-full px-4 py-2 bg-white/10 disabled:opacity-50 hover:bg-white/15 transition"
            >
              Prev
            </button>
            <button 
              disabled={!hasNext} 
              onClick={() => setPage(p => p + 1)} 
              className="rounded-full px-4 py-2 bg-white/10 disabled:opacity-50 hover:bg-white/15 transition"
            >
              Next
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

function Row({
  item,
  campaignId,
  selected,
  onToggle,
}: {
  item: any;
  campaignId: string | null;
  selected: boolean;
  onToggle: (talentId: string) => void;
}) {
  const er = typeof item.engagementRate === 'number' ? (item.engagementRate * 100) : undefined;

  return (
    <div className="rounded-xl bg-white/5 ring-1 ring-white/10 p-4 flex items-center justify-between">
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-10 w-10 rounded-full bg-white/10 grid place-items-center text-xs">{(item.username||"?").slice(0,2).toUpperCase()}</div>
        <div className="min-w-0">
          <div className="text-white/90 font-medium">{item.fullName || item.username || "Unnamed"}</div>
          <div className="text-xs text-white/60 truncate">{item.location || "Location unknown"}</div>
          <div className="text-xs text-white/60">
            {item.roles?.slice(0,3)?.join(" • ") || "No roles listed"}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="text-xs text-white/60">ER</div>
          <div className="text-sm text-white/80">{er != null ? `${er.toFixed(1)}%` : "—"}</div>
        </div>
        <button
          disabled={!campaignId}
          onClick={() => onToggle(item.id)}
          className={cn(
            "rounded-full px-4 py-2 text-sm transition border",
            selected
              ? "bg-green-500/20 border-green-500/40 text-green-100"
              : "bg-white/5 border-white/15 text-white/80 hover:bg-white/10"
          )}
        >
          {selected ? "Added" : "Add to pod"}
        </button>
      </div>
    </div>
  );
}
