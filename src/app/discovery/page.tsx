/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import useSWR from "swr";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

const fetcher = (u: string, init?: RequestInit) => fetch(u, init).then((r) => r.json());

export default function DiscoveryPage() {
  const { data: session } = useSession();
  const isAuthenticated = Boolean(session?.user);
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState<any>({}); // server filter body
  const [keyword, setKeyword] = useState("");
  const [campaignId, setCampaignId] = useState<string | null>(null);

  // Dictionary selections
  const [selectedLocations, setSelectedLocations] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedInterests, setSelectedInterests] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedBrands, setSelectedBrands] = useState<Array<{ id: string; name: string }>>([]);

  // Map selections into filter body whenever they change
  useEffect(() => {
    setFilter((f: any) => ({
      ...f,
      locations: selectedLocations.map(x => x.id),
      languages: selectedLanguages.map(x => x.id),
      interests: selectedInterests.map(x => x.id),
      brands: selectedBrands.map(x => x.id),
    }));
  }, [selectedLocations, selectedLanguages, selectedInterests, selectedBrands]);
  const body = useMemo(
    () => ({
      page,
      sort: { field: "name", direction: "asc" },
      filter: { ...filter, keywords: keyword },
    }),
    [page, filter, keyword],
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
          <div>
            <div className="flex rounded-full bg-white/5 ring-1 ring-white/10 p-1 w-fit">
              <button className="px-3 py-1.5 rounded-full bg-white/10 text-sm">Instagram</button>
              <button className="px-3 py-1.5 rounded-full text-sm text-white/60">YouTube</button>
              <button className="px-3 py-1.5 rounded-full text-sm text-white/60">TikTok</button>
            </div>
          </div>

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

          <div className="space-y-4">
            <div>
              <div className="text-xs text-white/60 mb-1">Location</div>
              <DictionaryInput kind="locations" placeholder="Any country or city" onSelect={(opt)=> setSelectedLocations((arr)=> arr.find(a=>a.id===opt.id)?arr:[...arr,opt])} />
              <Chips items={selectedLocations} onRemove={(id)=> setSelectedLocations((arr)=> arr.filter(a=>a.id!==id))} />
            </div>
            <div>
              <div className="text-xs text-white/60 mb-1">Language</div>
              <DictionaryInput kind="languages" placeholder="Any language" onSelect={(opt)=> setSelectedLanguages((arr)=> arr.find(a=>a.id===opt.id)?arr:[...arr,opt])} />
              <Chips items={selectedLanguages} onRemove={(id)=> setSelectedLanguages((arr)=> arr.filter(a=>a.id!==id))} />
            </div>
            <div>
              <div className="text-xs text-white/60 mb-1">Audience interests</div>
              <DictionaryInput kind="interests" placeholder="Add interests" onSelect={(opt)=> setSelectedInterests((arr)=> arr.find(a=>a.id===opt.id)?arr:[...arr,opt])} />
              <Chips items={selectedInterests} onRemove={(id)=> setSelectedInterests((arr)=> arr.filter(a=>a.id!==id))} />
            </div>
            <div>
              <div className="text-xs text-white/60 mb-1">Brands</div>
              <DictionaryInput kind="brands" placeholder="Add brands" onSelect={(opt)=> setSelectedBrands((arr)=> arr.find(a=>a.id===opt.id)?arr:[...arr,opt])} />
              <Chips items={selectedBrands} onRemove={(id)=> setSelectedBrands((arr)=> arr.filter(a=>a.id!==id))} />
            </div>
            <div>
              <div className="text-xs text-white/60 mb-1">Followers</div>
              <div className="flex gap-2">
                <NumberField placeholder="From" onCommit={(v)=> setFilter((f:any)=> ({...f, followers: { ...(f?.followers||{}), min: v||undefined }}))} />
                <NumberField placeholder="To" onCommit={(v)=> setFilter((f:any)=> ({...f, followers: { ...(f?.followers||{}), max: v||undefined }}))} />
              </div>
            </div>
            <div>
              <div className="text-xs text-white/60 mb-1">Engagement rate</div>
              <NumberField placeholder="Min %" onCommit={(v)=> setFilter((f:any)=> ({...f, engagementRate: { ...(f?.engagementRate||{}), min: v!=null? v/100 : undefined }}))} />
            </div>
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
  const [open, setOpen] = useState(false);
  const er = typeof item.engagementRate === 'number' ? (item.engagementRate * 100) : undefined;

  return (
    <div className="rounded-xl bg-white/5 ring-1 ring-white/10 p-4 flex items-center justify-between">
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-10 w-10 rounded-full bg-white/10 grid place-items-center text-xs">{(item.username||"?").slice(0,2).toUpperCase()}</div>
        <div className="min-w-0">
          <div className="font-medium truncate">{item.fullName || item.name}</div>
          <div className="text-sm text-white/70 truncate">@{item.username}</div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-8 text-right text-sm">
        <div>
          <div className="text-white/50">Followers</div>
          <div className="font-medium">{new Intl.NumberFormat().format(item.followers ?? 0)}</div>
        </div>
        <div>
          <div className="text-white/50">ER%</div>
          <div className="font-medium">{er != null ? er.toFixed(2) + '%' : '—'}</div>
        </div>
        <div>
          <div className="text-white/50">Engagement</div>
          <div className="font-medium">{item.engagement != null ? new Intl.NumberFormat().format(item.engagement) : '—'}</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="rounded-full bg-white/10 px-3 py-1.5 text-sm hover:bg-white/15" onClick={() => setOpen(true)}>View</button>
        {campaignId && (
          <button
            className={cn(
              "rounded-full px-3 py-1.5 text-sm",
              selected ? "bg-emerald-500 text-black" : "bg-white/5 hover:bg-white/10 text-white"
            )}
            onClick={() => onToggle(item.id)}
          >
            {selected ? "In pod" : "Add to pod"}
          </button>
        )}
        <button className="rounded-full bg-white/5 px-3 py-1.5 text-sm">Save</button>
      </div>

      {open && (
        <ReportModal userId={item.username || item.name} onClose={() => setOpen(false)} />
      )}
    </div>
  );
}

// Small helpers
function Chips({ items, onRemove }:{ items: Array<{id:string; name:string}>, onRemove:(id:string)=>void }){
  if (!items?.length) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-1">
      {items.map(it=> (
        <span key={it.id} className="inline-flex items-center gap-1 rounded-full bg-white/10 border border-white/10 px-2 py-0.5 text-xs">
          {it.name}
          <button className="text-white/60 hover:text-white" onClick={()=> onRemove(it.id)}>×</button>
        </span>
      ))}
    </div>
  );
}

function NumberField({ placeholder, onCommit }:{ placeholder:string; onCommit:(v:number|undefined)=>void }){
  const ref = useRef<HTMLInputElement|null>(null);
  return (
    <input
      ref={ref}
      className="flex-1 rounded-lg bg-white/5 ring-1 ring-white/10 px-3 py-2 text-sm outline-none"
      placeholder={placeholder}
      inputMode="numeric"
      onBlur={()=> {
        const raw = ref.current?.value?.trim();
        const num = raw ? Number(raw) : undefined;
        if (Number.isNaN(num as number)) onCommit(undefined); else onCommit(num);
      }}
    />
  );
}

function DictionaryInput({ kind, placeholder, onSelect }:{ kind:'interests'|'locations'|'brands'|'languages'; placeholder:string; onSelect:(opt:{id:string; name:string})=>void }){
  const [query, setQuery] = useState('');
  const { data } = useSWR(query ? `/api/discovery/dictionaries/${kind}?query=${encodeURIComponent(query)}&limit=8` : null, (u: string)=> fetch(u).then(r=>r.json()), { revalidateOnFocus:false });
  const results = data?.data || data?.results || [];

  return (
    <div className="relative">
      <input
        className="w-full rounded-lg bg-white/5 ring-1 ring-white/10 px-3 py-2 text-sm outline-none"
        placeholder={placeholder}
        onChange={(e)=> setQuery(e.target.value)}
      />
      {query && results?.length > 0 && (
        <div className="absolute z-10 mt-1 w-full rounded-lg bg-[#0D1117] ring-1 ring-white/10 p-1 max-h-56 overflow-auto">
          {results.map((r:any)=> (
            <button key={r.id || r.code || r.slug}
              onClick={()=> { onSelect({ id: String(r.id || r.code || r.slug), name: r.name || r.title || r.label }); setQuery(''); }}
              className="w-full text-left px-2 py-1 rounded hover:bg-white/5 text-sm">
              {r.name || r.title || r.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ReportModal({ userId, onClose }: { userId: string; onClose: () => void }) {
  const { data, isLoading, error } = useSWR(
    userId ? `/api/discovery/report/${encodeURIComponent(userId)}` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 px-4">
      <div className="w-[800px] max-w-full max-h-[90vh] rounded-2xl bg-[#0D1117] ring-1 ring-white/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-lg font-medium">@{userId} Report</div>
          <button onClick={onClose} className="text-white/60 hover:text-white text-xl">✕</button>
        </div>
        
        <div className="overflow-auto max-h-[calc(90vh-100px)]">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-white/60">Loading detailed report...</div>
            </div>
          )}
          
          {error && (
            <div className="rounded-xl bg-red-500/10 ring-1 ring-red-500/20 p-4">
              <div className="text-red-400">Error loading report: {String(error.message || error)}</div>
            </div>
          )}
          
          {data && (
            <div className="space-y-4">
              {/* Basic stats */}
              {data.profile && (
                <div className="rounded-xl bg-white/5 ring-1 ring-white/10 p-4">
                  <h3 className="text-sm font-medium mb-3">Profile Overview</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-white/50">Followers</div>
                      <div className="font-medium">{data.profile.followers?.toLocaleString() || "—"}</div>
                    </div>
                    <div>
                      <div className="text-white/50">Following</div>
                      <div className="font-medium">{data.profile.following?.toLocaleString() || "—"}</div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Raw data for debugging */}
              <details className="rounded-xl bg-white/5 ring-1 ring-white/10 p-4">
                <summary className="cursor-pointer text-sm font-medium">Raw Data (Debug)</summary>
                <pre className="text-xs text-white/70 overflow-auto mt-3 max-h-[300px]">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
