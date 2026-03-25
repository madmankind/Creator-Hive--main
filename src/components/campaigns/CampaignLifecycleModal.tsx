"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { useCampaign } from "@/contexts/CampaignContext";

type LifecycleAction = "PAUSED" | "COMPLETED" | "CANCELLED";

const ACTION_CONFIG: Record<LifecycleAction, {
  title: string;
  description: string;
  confirmLabel: string;
  confirmColor: string;
  confirmBg: string;
  hasReason?: boolean;
  hasEndDate?: boolean;
}> = {
  PAUSED: {
    title: "Pause campaign",
    description: "Delivery and billing will be put on hold. You can resume at any time.",
    confirmLabel: "Pause campaign",
    confirmColor: "rgba(251,146,60,0.9)",
    confirmBg: "rgba(251,146,60,0.15)",
  },
  COMPLETED: {
    title: "End campaign",
    description: "Mark this campaign as complete. This captures the final state for reporting.",
    confirmLabel: "End campaign",
    confirmColor: "rgba(52,211,153,0.9)",
    confirmBg: "rgba(52,211,153,0.12)",
    hasEndDate: true,
  },
  CANCELLED: {
    title: "Cancel campaign",
    description: "This will permanently cancel the campaign. Any unfunded commitments will be released.",
    confirmLabel: "Cancel campaign",
    confirmColor: "rgba(248,113,113,0.9)",
    confirmBg: "rgba(248,113,113,0.12)",
    hasReason: true,
  },
};

interface CampaignLifecycleModalProps {
  action: LifecycleAction;
  campaignId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CampaignLifecycleModal({ action, campaignId, onClose, onSuccess }: CampaignLifecycleModalProps) {
  const { refreshCampaigns } = useCampaign();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const cfg = ACTION_CONFIG[action];

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    try {
      const body: Record<string, string> = { status: action };
      if (action === "COMPLETED") body.dueDate = new Date().toISOString();

      const res = await fetch(`/api/agency/campaigns/${campaignId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || `Request failed (${res.status})`);
      }
      refreshCampaigns();
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(6px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: "rgba(14,14,20,0.96)",
          border: "1px solid rgba(255,255,255,0.09)",
          borderRadius: "18px",
          padding: "28px 28px 24px",
          width: "100%",
          maxWidth: "400px",
          boxShadow: "0 24px 64px rgba(0,0,0,0.7)",
        }}
      >
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-[15px] font-semibold text-white/90">{cfg.title}</h3>
          <button onClick={onClose} className="text-white/30 hover:text-white/60 transition ml-4 mt-0.5">
            <X size={16} />
          </button>
        </div>

        <p className="text-[13px] text-white/50 leading-relaxed mb-5">{cfg.description}</p>

        {cfg.hasReason && (
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for cancellation (optional)"
            rows={3}
            className="w-full resize-none outline-none text-[12px] rounded-xl px-3 py-2.5 mb-4"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.70)",
            }}
          />
        )}

        {error && (
          <p className="text-[12px] text-red-400/80 mb-3">{error}</p>
        )}

        <div className="flex items-center gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={loading}
            className="text-[13px] px-4 py-2 rounded-lg transition-colors"
            style={{ color: "rgba(255,255,255,0.40)", background: "rgba(255,255,255,0.05)" }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex items-center gap-2 text-[13px] font-medium px-4 py-2 rounded-lg transition-colors"
            style={{ color: cfg.confirmColor, background: cfg.confirmBg, border: `1px solid ${cfg.confirmColor.replace("0.9", "0.25")}` }}
          >
            {loading && <Loader2 size={13} className="animate-spin" />}
            {cfg.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
