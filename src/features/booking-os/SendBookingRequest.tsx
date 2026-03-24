"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Talent } from "@/store/useCampaignPodStore";
import type { BriefDraft } from "./types";
import { cn } from "@/lib/utils";

function buildCampaignSummary(briefDraft: BriefDraft | null, talents: Talent[]): string {
  const parts: string[] = [];
  if (briefDraft?.objective) parts.push(`Objective: ${briefDraft.objective}`);
  if (briefDraft?.outputs?.length) parts.push(`Outputs: ${briefDraft.outputs.join(", ")}`);
  if (briefDraft?.timeline) parts.push(`Timeline: ${briefDraft.timeline}`);
  if (briefDraft?.budgetRange) parts.push(`Budget: ${briefDraft.budgetRange}`);
  if (briefDraft?.keyMessage) parts.push(`Key message: ${briefDraft.keyMessage}`);
  if (talents.length) parts.push(`Talent: ${talents.map((t) => t.name).join(", ")}`);
  return parts.join(" | ") || "Campaign booking";
}

type SendBookingRequestProps = {
  talents: Talent[];
  briefDraft: BriefDraft | null;
  onScrollToResults: () => void;
  onScrollToBrief?: () => void;
  onAuthRequired?: () => void;
};

export function SendBookingRequest({
  talents,
  briefDraft,
  onScrollToResults,
  onScrollToBrief,
  onAuthRequired,
}: SendBookingRequestProps) {
  const router = useRouter();
  const campaignSummary = useMemo(() => buildCampaignSummary(briefDraft, talents), [briefDraft, talents]);
  const [email, setEmail] = useState("");
  const [optionalNote, setOptionalNote] = useState("");
  const [optionalRefLink, setOptionalRefLink] = useState((briefDraft?.references as string[])?.[0] ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tradeLicenseFile, setTradeLicenseFile] = useState<File | null>(null);
  const [tradeLicenseFileName, setTradeLicenseFileName] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingType: "short",
          startDate: briefDraft?.timeline ?? undefined,
          budgetRange: briefDraft?.budgetRange ?? undefined,
          campaignDescription: [campaignSummary, optionalNote.trim(), optionalRefLink.trim() ? `Reference: ${optionalRefLink.trim()}` : ""].filter(Boolean).join("\n\n") || campaignSummary,
          email,
          talentIds: talents.map((t) => t.id),
          tradeLicenseFileName: tradeLicenseFileName || undefined,
          briefDraft: briefDraft ?? undefined,
        }),
      });
      if (res.status === 401) {
        onAuthRequired?.();
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || "Failed to submit booking");
      }
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit booking");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="relative w-full max-w-[560px] mx-auto rounded-[28px] bg-[#0F141A]/85 p-8 md:p-10 ring-1 ring-white/10 shadow-2xl">
        <div className="pt-4 pb-6 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-white/90 mb-3">Booking request sent</h2>
          <p className="text-sm text-white/70 max-w-md mx-auto">
            We&apos;ve received your brief. An assigned campaign manager will review and get back to you within 48 hours.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <button
              type="button"
              onClick={onScrollToResults}
              className="rounded-full px-5 py-2.5 text-sm text-white/70 hover:bg-white/5 ring-1 ring-white/10 transition"
            >
              Back to matches
            </button>
            <button
              type="button"
              onClick={() => router.push("/dashboard/campaigns")}
              className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-black hover:bg-white/90 transition"
            >
              Go to dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Single send section: pod + brief summary + required fields
  return (
    <div className="relative w-full max-w-[560px] mx-auto rounded-[28px] bg-[#0F141A]/85 p-8 md:p-10 ring-1 ring-white/10 shadow-2xl">
      <header className="mb-6">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/50">Send request</p>
        <h2 className="mt-1 text-xl font-semibold text-white/90">
          {talents.length === 0
            ? "Complete your booking"
            : talents.length === 1
            ? `Book ${talents[0].name}`
            : `${talents.length} talents selected`}
        </h2>
        <p className="mt-2 text-[11px] text-white/55">
          We&apos;ll confirm within 48 hours with scope, timeline, and deliverables.
        </p>
      </header>

      {talents.length > 0 && (
        <div className="mb-5">
          <p className="text-[11px] font-medium text-white/50 uppercase tracking-wider mb-2">Your pod</p>
          <div className="flex flex-wrap gap-2">
            {talents.map((t) => (
              <span
                key={t.id}
                className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 text-xs text-white/80 ring-1 ring-white/10"
              >
                {t.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {briefDraft && (
        <div className="mb-5 space-y-2 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-medium text-white/50 uppercase tracking-wider">Brief summary</p>
            {onScrollToBrief && (
              <button
                type="button"
                onClick={onScrollToBrief}
                className="text-[11px] text-white/60 hover:text-white/80 transition"
              >
                Edit brief
              </button>
            )}
          </div>
          <dl className="space-y-1.5 text-sm">
            {briefDraft.timeline && (
              <div>
                <dt className="text-white/50 text-[11px]">Timeline</dt>
                <dd className="text-white/90">{briefDraft.timeline}</dd>
              </div>
            )}
            {briefDraft.budgetRange && (
              <div>
                <dt className="text-white/50 text-[11px]">Budget</dt>
                <dd className="text-white/90">{briefDraft.budgetRange}</dd>
              </div>
            )}
            {briefDraft.objective && (
              <div>
                <dt className="text-white/50 text-[11px]">Objective</dt>
                <dd className="text-white/90">{briefDraft.objective}</dd>
              </div>
            )}
            {briefDraft.outputs?.length > 0 && (
              <div>
                <dt className="text-white/50 text-[11px]">Outputs</dt>
                <dd className="text-white/90">{briefDraft.outputs.join(", ")}</dd>
              </div>
            )}
          </dl>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-1 block text-xs font-medium text-white/75">
            Contact email <span className="text-red-400">*</span>
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl bg-white/5 px-4 py-2.5 text-sm text-white/90 placeholder:text-white/40 ring-1 ring-white/10 outline-none focus:ring-white/20"
            placeholder="you@company.com"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-white/75">
            Optional note
          </label>
          <textarea
            rows={2}
            value={optionalNote}
            onChange={(e) => setOptionalNote(e.target.value)}
            className="w-full rounded-2xl bg-white/5 px-4 py-2.5 text-sm text-white/90 placeholder:text-white/40 ring-1 ring-white/10 outline-none focus:ring-white/20 transition"
            placeholder="Any extra details…"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-white/75">
            Reference link <span className="text-[11px] text-white/50 font-normal">(optional)</span>
          </label>
          <input
            type="url"
            value={optionalRefLink}
            onChange={(e) => setOptionalRefLink(e.target.value)}
            placeholder="https://..."
            className="w-full rounded-2xl bg-white/5 px-4 py-2.5 text-sm text-white/90 placeholder:text-white/40 ring-1 ring-white/10 outline-none focus:ring-white/20"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-white/75">
            Trade license <span className="text-[11px] text-white/50 font-normal">(optional — you can add later)</span>
          </label>
          {!tradeLicenseFile ? (
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/20 bg-white/5 px-4 py-6 text-center transition hover:border-white/30 hover:bg-white/8">
              <svg className="mb-2 h-8 w-8 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span className="text-xs text-white/70">Click to upload PDF, JPG, or PNG</span>
              <span className="mt-1 text-[10px] text-white/50">Max 10MB</span>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.size > 10 * 1024 * 1024) {
                      setError("File must be under 10MB");
                      return;
                    }
                    setTradeLicenseFile(file);
                    setTradeLicenseFileName(file.name);
                    setError(null);
                  }
                }}
              />
            </label>
          ) : (
            <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3 ring-1 ring-white/10">
              <span className="text-xs text-white/90">{tradeLicenseFileName}</span>
              <button
                type="button"
                onClick={() => { setTradeLicenseFile(null); setTradeLicenseFileName(""); }}
                className="text-xs text-white/60 hover:text-white/80"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <footer className="pt-4">
          <button
            type="submit"
            disabled={submitting}
            className={cn(
              "w-full rounded-full py-3 text-sm font-semibold transition",
              !submitting
                ? "bg-white text-black hover:bg-white/90"
                : "bg-white/10 text-white/50 cursor-not-allowed"
            )}
          >
            {submitting ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Sending…
              </span>
            ) : (
              "Confirm & send"
            )}
          </button>
        </footer>
      </form>
    </div>
  );
}
