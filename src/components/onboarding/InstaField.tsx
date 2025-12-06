// src/components/onboarding/InstaField.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

function normalize(value: string) {
  const v = value.trim().replace(/^@+/, "");
  return v.toLowerCase();
}

export default function InstaField() {
  const [raw, setRaw] = useState("");
  const username = useMemo(() => normalize(raw), [raw]);
  const url = username ? `https://instagram.com/${username}` : "";

  const [preview, setPreview] = useState<{
    title?: string;
    image?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!username) {
        setPreview(null);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/social/instagram?username=${encodeURIComponent(username)}`);
        const data = await res.json();
        if (!cancelled) {
          setPreview({
            title: data?.title || `@${username}`,
            image: data?.image || undefined,
          });
        }
      } catch {
        if (!cancelled) setPreview({ title: `@${username}` });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => { cancelled = true; };
  }, [username]);

  return (
    <div className="space-y-3">
      <div className="rounded-full bg-white/5 ring-1 ring-white/10 px-4 py-2.5 focus-within:ring-white/20 transition">
        <div className="flex items-center gap-2">
          <span className="text-white/50">@</span>
          <input
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder="yourhandle"
            className="flex-1 bg-transparent outline-none text-slate-200 placeholder:text-slate-400/40"
          />
          {url && (
            <Link href={url} target="_blank" className="text-xs text-white/70 hover:text-white/90 underline underline-offset-4">
              View
            </Link>
          )}
        </div>
      </div>

      {/* Live preview card */}
      {username && (
        <div className="flex items-center gap-3 rounded-2xl bg-white/5 ring-1 ring-white/10 p-3">
          <div className="relative h-10 w-10 overflow-hidden rounded-full bg-white/10">
            {preview?.image ? (
              <Image src={preview.image} alt={preview?.title || username} fill sizes="40px" className="object-cover" />
            ) : (
              <div className="grid h-full w-full place-items-center text-xs text-white/50">
                IG
              </div>
            )}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm text-white/90">
              {preview?.title || `@${username}`}
            </div>
            <div className="text-xs text-white/45 truncate">{url}</div>
          </div>
          {loading && (
            <div className="ml-auto text-xs text-white/45">Loading…</div>
          )}
        </div>
      )}
    </div>
  );
}







