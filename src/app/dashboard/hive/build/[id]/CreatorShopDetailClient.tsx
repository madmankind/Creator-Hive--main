"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CreatorShopProjectMode, CreatorShopProjectStatus } from "@prisma/client";
import { feyTokens } from "@/lib/fey-design-tokens";
import { creatorShopStatusLabel, CREATOR_SHOP_STATUS_ORDER } from "@/lib/creator-shop/status";
import { recommendCreatorShopPod } from "@/lib/creator-shop/podRecommendation";
import { cn } from "@/lib/utils";

export type CreatorShopProjectDTO = {
  id: string;
  mode: CreatorShopProjectMode;
  productType: string;
  title: string;
  status: CreatorShopProjectStatus;
  briefPayload: unknown;
  budgetBand: string | null;
  desiredLaunchDate: string | null;
  currentPlatform: string | null;
  audienceContext: string | null;
  notes: string | null;
  statusHistory: unknown;
  commercialModelNotes: string | null;
  createdAt: string;
  updatedAt: string;
};

type Hist = { status?: string; at?: string; label?: string };

export function CreatorShopDetailClient({ project: initial }: { project: CreatorShopProjectDTO }) {
  const router = useRouter();
  const [notes, setNotes] = useState(initial.notes ?? "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const pod = useMemo(
    () => recommendCreatorShopPod(initial.productType, initial.mode),
    [initial.productType, initial.mode],
  );

  const history = useMemo(() => {
    const h = initial.statusHistory;
    if (Array.isArray(h)) return h as Hist[];
    return [];
  }, [initial.statusHistory]);

  const brief = initial.briefPayload as Record<string, unknown> | null;

  const saveNotes = async () => {
    setBusy(true);
    setErr(null);
    try {
      const r = await fetch(`/api/creator-shop/projects/${initial.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ notes }),
      });
      if (!r.ok) {
        setErr("Could not save notes.");
        return;
      }
      router.refresh();
    } catch {
      setErr("Could not save notes.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-[760px] pb-8 pt-2">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">Build · Project</p>
      <h1 className="mt-3 text-[24px] font-semibold tracking-[-0.03em] text-white/[0.94]">{initial.title}</h1>
      <p className="mt-2 text-[12px] text-white/45">
        {initial.productType} · {initial.mode === "LAUNCH" ? "Launch" : "Grow"} ·{" "}
        <span className="text-white/70">{creatorShopStatusLabel(initial.status)}</span>
      </p>

      <section className="mt-10 border-t border-white/[0.06] pt-8">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">Pipeline</h2>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {CREATOR_SHOP_STATUS_ORDER.map((s) => {
            const active = s === initial.status;
            return (
              <span
                key={s}
                className={cn(
                  "rounded-full px-2.5 py-1 text-[10px] font-medium",
                  active
                    ? "bg-teal-400/15 text-teal-100/90 ring-1 ring-teal-400/30"
                    : "bg-transparent text-white/30 ring-1 ring-white/[0.06]",
                )}
              >
                {creatorShopStatusLabel(s)}
              </span>
            );
          })}
        </div>
      </section>

      <section className="mt-10 border-t border-white/[0.06] pt-8">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">Brief summary</h2>
        <pre
          className="mt-4 max-h-[360px] overflow-auto rounded-2xl border border-white/[0.06] bg-black/20 p-4 text-[12px] leading-relaxed text-white/55"
          style={{ whiteSpace: "pre-wrap" }}
        >
          {JSON.stringify(brief, null, 2)}
        </pre>
      </section>

      <section className="mt-10 border-t border-white/[0.06] pt-8">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">Recommended team</h2>
        <div className="mt-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-4">
          <p className="text-[14px] font-medium text-white/[0.9]">{pod.podLabel}</p>
          <ul className="mt-3 space-y-1.5 text-[12px] text-white/55">
            {pod.roles.map((r) => (
              <li key={r}>— {r}</li>
            ))}
          </ul>
          <p className="mt-4 text-[11px] leading-relaxed text-white/38">{pod.footnote}</p>
          <p className="mt-3 text-[11px] text-white/30">Final team is assembled after Creator Hive review.</p>
        </div>
      </section>

      {initial.commercialModelNotes ? (
        <section className="mt-10 border-t border-white/[0.06] pt-8">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">Commercial model</h2>
          <p className="mt-3 text-[12px] leading-relaxed text-white/45">{initial.commercialModelNotes}</p>
        </section>
      ) : null}

      <section className="mt-10 border-t border-white/[0.06] pt-8">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">Timeline</h2>
        <ul className="mt-4 space-y-3">
          {history.length ? (
            history.map((h, i) => (
              <li key={`${h.at ?? i}-${h.status ?? ""}`} className="text-[12px] text-white/55">
                <span className="text-white/35">{h.at ? new Date(h.at).toLocaleString() : "—"}</span>
                <span className="mx-2 text-white/20">·</span>
                <span>{h.label ?? h.status ?? "Update"}</span>
              </li>
            ))
          ) : (
            <li className="text-[12px] text-white/35">No timeline entries yet.</li>
          )}
        </ul>
      </section>

      <section className="mt-10 border-t border-white/[0.06] pt-8">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">Team assignment</h2>
        <p className="mt-3 text-[13px] leading-relaxed" style={{ color: feyTokens.colors.text.muted }}>
          Assignments will appear here as the pod is confirmed. This MVP shows recommended roles only.
        </p>
        <div className="mt-4 rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.015] px-4 py-6 text-center text-[12px] text-white/35">
          Team roster placeholder
        </div>
      </section>

      <section className="mt-10 border-t border-white/[0.06] pt-8">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">Notes & updates</h2>
        <textarea
          className="mt-4 min-h-[120px] w-full rounded-xl border border-white/[0.1] bg-white/[0.04] px-3 py-2.5 text-[13px] text-white/[0.9] outline-none focus:border-teal-400/35"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add context for your team…"
        />
        {err ? <p className="mt-2 text-[12px] text-amber-200/90">{err}</p> : null}
        <button
          type="button"
          disabled={busy}
          onClick={() => void saveNotes()}
          className="mt-3 inline-flex h-10 items-center rounded-xl bg-white/[0.08] px-4 text-[12px] font-semibold text-white/90 ring-1 ring-white/[0.1] disabled:opacity-40"
        >
          {busy ? "Saving…" : "Save notes"}
        </button>
      </section>

      <p className="mt-10 text-[11px] text-white/30">
        <Link href="/dashboard/hive/build" className="text-white/45 underline decoration-white/15 underline-offset-4 hover:text-white/65">
          Back to Build
        </Link>
      </p>
    </div>
  );
}
