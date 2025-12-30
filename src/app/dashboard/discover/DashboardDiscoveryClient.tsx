'use client';
import { useMemo, useState } from "react";
import useSWR from "swr";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useSession } from "next-auth/react";

const fetcher = (u: string, init?: RequestInit) => fetch(u, init).then((r) => r.json());
type Availability = "hourly" | "monthly" | "";

export default function DashboardDiscovery() {
  const { data: session } = useSession();
  const isAuthenticated = Boolean(session?.user);
  const [page, setPage] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [rolesInput, setRolesInput] = useState("");
  const [location, setLocation] = useState("");
  const [availability, setAvailability] = useState<Availability>("");
  const [platforms, setPlatforms] = useState<string[]>([]);

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

  const items = data?.data || data?.results || [];
  const hasNext = Boolean(data?.meta?.hasMore);
  const total = data?.meta?.total ?? 0;

  if (!isAuthenticated) {
    return (
      <div className="text-center space-y-3 py-10">
        <h3 className="text-lg font-semibold text-slate-900">Members-only discovery</h3>
        <p className="text-sm text-slate-600">Sign in to view curated talent.</p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-full bg-indigo-600 text-white px-4 py-2 text-sm font-semibold hover:bg-indigo-500 transition"
        >
          Go to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-4 text-slate-900">
      <aside className="col-span-12 md:col-span-4 lg:col-span-3 space-y-4">
        <FilterInput label="Keyword" placeholder="@creator or email" value={keyword} onChange={(v) => { setPage(0); setKeyword(v); }} />
        <FilterInput
          label="Roles / skills (comma separated, max 4)"
          placeholder="UGC, Photography, Lifestyle"
          value={rolesInput}
          onChange={(v) => { setPage(0); setRolesInput(v); }}
        />
        <FilterInput label="Location" placeholder="City, Country" value={location} onChange={(v) => { setPage(0); setLocation(v); }} />

        <div className="space-y-2">
          <label className="text-xs text-slate-600">Platforms</label>
          <div className="flex flex-wrap gap-2">
            {["instagram", "tiktok", "youtube"].map((p) => {
              const active = platforms.includes(p);
              return (
                <button
                  key={p}
                  type="button"
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm capitalize transition",
                    active
                      ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                      : "border-[rgba(0,0,0,0.08)] bg-white text-slate-700 hover:bg-slate-50"
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
          <label className="text-xs text-slate-600">Availability</label>
          <select
            className="w-full rounded-lg border border-[rgba(0,0,0,0.08)] bg-white px-3 py-2 text-sm outline-none"
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

      <section className="col-span-12 md:col-span-8 lg:col-span-9 space-y-3">
        <div className="text-sm text-slate-600">
          {new Intl.NumberFormat().format(total)} profiles
        </div>

        {isLoading ? (
          <div className="text-sm text-slate-600">Loading…</div>
        ) : error ? (
          <div className="text-sm text-red-500">Error loading results.</div>
        ) : (
          <div className="grid gap-3">
            {items.map((it: any) => (
              <div
                key={it.id || it.userId || it.username}
                className="rounded-xl border border-[rgba(0,0,0,0.08)] bg-white p-4 shadow-sm flex items-center justify-between"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-full bg-indigo-50 text-indigo-700 grid place-items-center text-xs font-semibold">
                    {(it.username || "?").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-900 truncate">
                      {it.fullName || it.username || "Unnamed"}
                    </div>
                    <div className="text-[12px] text-slate-500 truncate">{it.location || "Location unknown"}</div>
                    <div className="text-[12px] text-slate-500">
                      {it.roles?.slice(0, 3)?.join(" • ") || "No roles listed"}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="rounded-full bg-indigo-600 text-white px-4 py-2 text-sm font-semibold hover:bg-indigo-500 transition"
                >
                  View
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-4">
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="rounded-full px-4 py-2 bg-white border border-[rgba(0,0,0,0.08)] text-sm hover:bg-slate-50 disabled:opacity-50"
          >
            Prev
          </button>
          <button
            disabled={!hasNext}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-full px-4 py-2 bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </section>
    </div>
  );
}

function FilterInput({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs text-slate-600">{label}</label>
      <input
        className="w-full rounded-lg border border-[rgba(0,0,0,0.08)] bg-white px-3 py-2 text-sm outline-none"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
