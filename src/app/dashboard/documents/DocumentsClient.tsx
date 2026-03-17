"use client";

import { useState, useEffect } from "react";
import { FileText, Download, RefreshCw, Loader2 } from "lucide-react";

type Agreement = {
  id: string;
  agreementRef: string;
  status: string;
  storageUrl: string | null;
  createdAt: string;
} | null;

export default function DocumentsClient() {
  const [agreement, setAgreement] = useState<Agreement | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/user-agreement");
      const data = await res.json();
      setAgreement(data.agreement ?? null);
    } catch {
      setError("Failed to load agreement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const generate = async () => {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/user-agreement/generate", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Generation failed");
        return;
      }
      setAgreement({
        id: "",
        agreementRef: data.agreementRef,
        status: "GENERATED",
        storageUrl: data.storageUrl,
        createdAt: new Date().toISOString(),
      });
    } catch {
      setError("Failed to generate agreement");
    } finally {
      setGenerating(false);
    }
  };

  const GLASS = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 16,
  };

  return (
    <div
      className="min-h-screen"
      style={{ background: "#07070B", color: "rgba(255,255,255,0.88)" }}
    >
      <div className="max-w-2xl mx-auto px-4 pt-12 pb-32">
        <div className="mb-8">
          <a
            href="/dashboard"
            className="text-[13px] text-white/40 hover:text-white/70 transition-colors"
          >
            ← Back to dashboard
          </a>
          <h1 className="text-[22px] font-semibold text-white/90 mt-2">
            Documents
          </h1>
          <p className="text-[13px] text-white/45 mt-1">
            Your User Agreement and other legal documents
          </p>
        </div>

        {error && (
          <div
            className="mb-6 rounded-xl px-4 py-3"
            style={{
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.25)",
            }}
          >
            <p className="text-[13px] text-red-400">{error}</p>
          </div>
        )}

        <div className="rounded-2xl p-6" style={GLASS}>
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(124,92,255,0.15)" }}
            >
              <FileText className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-white/85">
                User Agreement
              </h2>
              <p className="text-[12px] text-white/40">
                Generated when you complete onboarding
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 py-8 text-white/40 text-[13px]">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading…
            </div>
          ) : agreement ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl px-4 py-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div>
                  <p className="text-[13px] font-medium text-white/80">
                    Ref: {agreement.agreementRef}
                  </p>
                  <p className="text-[11px] text-white/40 mt-0.5 capitalize">
                    {agreement.status.toLowerCase()} · {new Date(agreement.createdAt).toLocaleDateString("en-GB")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {agreement.storageUrl && (
                    <a
                      href={agreement.storageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-medium transition"
                      style={{ background: "rgba(124,92,255,0.20)", color: "rgba(167,139,250,0.95)", boxShadow: "0 0 0 1px rgba(124,92,255,0.35)" }}
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </a>
                  )}
                  <button
                    onClick={generate}
                    disabled={generating}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-medium transition"
                    style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.65)", border: "1px solid rgba(255,255,255,0.10)" }}
                  >
                    {generating ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="w-3.5 h-3.5" />
                    )}
                    Regenerate
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-[13px] text-white/45 mb-4">
                No agreement generated yet. Complete onboarding or generate below.
              </p>
              <button
                onClick={generate}
                disabled={generating}
                className="flex items-center gap-2 mx-auto px-5 py-2.5 rounded-xl text-[13px] font-medium transition"
                style={{ background: "rgba(124,92,255,0.25)", color: "rgba(167,139,250,0.95)", boxShadow: "0 0 0 1px rgba(124,92,255,0.45)" }}
              >
                {generating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                Generate agreement
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
