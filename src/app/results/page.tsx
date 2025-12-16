/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function ResultsPage() {
  const sp = useSearchParams();
  const q = sp.get("q") || "";
  const roles = useMemo(() => (sp.get("roles")?.split(",") || []).filter(Boolean), [sp]);
  const rolesKey = useMemo(() => roles.join(","), [roles]);

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/ai-search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: q, roles }),
        });
        const json = await res.json();
        setData(json);
      } finally {
        setLoading(false);
      }
    })();
  }, [q, rolesKey, roles]);

  return (
    <main className="min-h-screen bg-[#0B0F14] text-slate-200 px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-[24px] font-semibold mb-2">Search Results</h1>
          <div className="flex flex-wrap items-center gap-2 text-sm text-white/60">
            <span>Query: {q || "—"}</span>
            {roles.length > 0 && (
              <>
                <span>·</span>
                <span>Roles: {roles.join(", ")}</span>
              </>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-white/60">Searching for talent...</div>
          </div>
        ) : !data?.results?.length ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="text-white/60 mb-2">No results found</div>
              <div className="text-sm text-white/40">Try adjusting your search terms or roles</div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-sm text-white/50">
              Found {data.results.length} talent{data.results.length !== 1 ? 's' : ''}
            </div>
            
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {data.results.map((r: any) => (
                <div key={r.creator.id} className="rounded-xl bg-white/5 ring-1 ring-white/10 p-5 hover:bg-white/[0.06] transition-colors">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-white/90">{r.creator.name}</div>
                        <div className="text-sm text-white/70 mt-1">
                          {r.creator.roles?.join(", ") || "Creator"}
                        </div>
                      </div>
                      <div className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/70 ml-3">
                        {((r.score || 0) * 100).toFixed(0)}% match
                      </div>
                    </div>
                    
                    {r.creator.niches && r.creator.niches.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {r.creator.niches.slice(0, 3).map((niche: string, idx: number) => (
                          <span
                            key={idx}
                            className="text-xs px-2 py-1 rounded-full bg-white/5 text-white/60"
                          >
                            {niche}
                          </span>
                        ))}
                        {r.creator.niches.length > 3 && (
                          <span className="text-xs px-2 py-1 text-white/50">
                            +{r.creator.niches.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    <div className="pt-2 border-t border-white/10">
                      <button className="w-full rounded-full bg-white/10 border border-white/10 px-4 py-2 text-sm text-slate-200 hover:bg-white/15 transition">
                        View Profile
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}





