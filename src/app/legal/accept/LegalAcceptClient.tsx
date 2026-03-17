"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

export function LegalAcceptClient() {
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/dashboard";
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accepted) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/legal-acceptance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error || "Could not record acceptance.");
      }
      window.location.href = returnTo;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: "#07070B" }}
    >
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{
              background: "rgba(124,92,255,0.12)",
              border: "1px solid rgba(124,92,255,0.25)",
            }}
          >
            <span className="text-2xl">◈</span>
          </div>
          <h1
            className="text-xl font-medium tracking-tight mb-2"
            style={{ color: "rgba(255,255,255,0.95)" }}
          >
            Accept our legal documents
          </h1>
          <p
            className="text-sm font-light"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            Before continuing, please accept our Privacy Policy and User Agreement.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="legal-accept"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-1 rounded border-white/20"
              style={{ accentColor: "rgba(155,127,255,0.8)" }}
            />
            <label
              htmlFor="legal-accept"
              className="text-[14px] font-light leading-snug cursor-pointer"
              style={{ color: "rgba(255,255,255,0.82)" }}
            >
              I accept the{" "}
              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:no-underline"
                style={{ color: "rgba(155,127,255,0.95)" }}
              >
                User Agreement
              </a>{" "}
              and{" "}
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:no-underline"
                style={{ color: "rgba(155,127,255,0.95)" }}
              >
                Privacy Policy
              </a>
              .
            </label>
          </div>

          {error && (
            <p className="text-[13px]" style={{ color: "rgba(251,113,133,0.95)" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!accepted || submitting}
            className="w-full py-3.5 rounded-full text-[14px] font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: accepted ? "rgba(255,255,255,0.93)" : "rgba(255,255,255,0.08)",
              color: accepted ? "#07070B" : "rgba(255,255,255,0.30)",
            }}
          >
            {submitting
              ? "Saving…"
              : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
