"use client";

import { useState, useEffect } from "react";
import { feyTokens } from "@/lib/fey-design-tokens";
import { FileText, Send, CheckCircle2, Clock, AlertCircle, RefreshCw, XCircle } from "lucide-react";

interface BookingOrder {
  id: string;
  orderRef: string;
  clientName: string;
  clientEmail: string;
  clientCompany?: string;
  packageLabel: string;
  budgetAed: number;
  vatAed: number;
  totalAed: number;
  paymentSchedule: string;
  status: string;
  confirmedTalentIds: string[];
  pdfPublicUrl?: string;
  sentAt?: string;
  talentConfirmedAt?: string;
  clientAction?: string;
  clientActionAt?: string;
  expiresAt?: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  DRAFT:                        { label: "Draft",                   color: "#9CA3AF", icon: <FileText size={12} /> },
  SENT:                         { label: "Order Sent",              color: "#78D2FF", icon: <Send size={12} /> },
  TALENT_PENDING:               { label: "Awaiting Talent Confirm", color: "#F59E0B", icon: <Clock size={12} /> },
  TALENT_CONFIRMED:             { label: "Talent Confirmed",        color: "#A78BFA", icon: <CheckCircle2 size={12} /> },
  CLIENT_APPROVED:              { label: "Client Approved ✓",       color: "#10B981", icon: <CheckCircle2 size={12} /> },
  CLIENT_REPLACEMENT_REQUESTED: { label: "Replacement Requested",   color: "#F59E0B", icon: <RefreshCw size={12} /> },
  CANCELLED:                    { label: "Cancelled",               color: "#F87171", icon: <XCircle size={12} /> },
};

interface BookingOrderPanelProps {
  campaignId?: string;
  bookingRequestId?: string;
  onOrderCreated?: (order: BookingOrder) => void;
}

export function BookingOrderPanel({ campaignId, bookingRequestId, onOrderCreated }: BookingOrderPanelProps) {
  const [order, setOrder] = useState<BookingOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [talentInput, setTalentInput] = useState("");
  const [replacementNote, setReplacementNote] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 4000); };

  // Fetch existing order for this campaign
  useEffect(() => {
    if (!campaignId) return;
    fetch("/api/booking-orders")
      .then((r) => r.json())
      .then((d) => {
        const match = (d.orders ?? []).find((o: BookingOrder & { campaignId?: string }) => o.campaignId === campaignId);
        if (match) setOrder(match);
      })
      .catch(() => null);
  }, [campaignId]);

  const handleConfirmTalent = async () => {
    if (!order) return;
    setConfirming(true);
    const ids = talentInput.split(",").map((s) => s.trim()).filter(Boolean);
    try {
      const res = await fetch(`/api/booking-orders/${order.orderRef}/confirm-talent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmedTalentIds: ids, replacementNote: replacementNote || undefined }),
      });
      if (res.ok) {
        const data = await res.json();
        setOrder((prev) => prev ? { ...prev, status: "TALENT_CONFIRMED", confirmedTalentIds: ids } : prev);
        showToast(`Talent confirmation sent — ${data.talentNames?.join(", ")}`);
        setTalentInput("");
        setReplacementNote("");
      } else {
        showToast("Failed to confirm talent. Try again.");
      }
    } catch { showToast("Network error."); }
    finally { setConfirming(false); }
  };

  const cfg = order ? (STATUS_CONFIG[order.status] ?? STATUS_CONFIG.DRAFT) : null;
  const fmt = (n: number) => `AED ${n.toLocaleString()}`;

  if (!order && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
        <AlertCircle size={20} style={{ color: "rgba(255,255,255,0.15)" }} />
        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)" }}>
          No booking order generated yet.
        </p>
        <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.20)" }}>
          A booking order is auto-created when a client submits a booking with a budget.
        </p>
      </div>
    );
  }

  if (loading) {
    return <div style={{ padding: "24px", textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: "13px" }}>Loading…</div>;
  }

  return (
    <div className="space-y-4">
      {toast && (
        <div className="px-4 py-2.5 rounded-xl text-[12px]"
          style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)", color: "#10B981" }}>
          {toast}
        </div>
      )}

      {/* Order header */}
      <div className="flex items-center justify-between">
        <div>
          <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", marginBottom: "2px" }}>Booking Order</p>
          <p style={{ fontSize: "16px", fontWeight: 700, color: "#fff", fontFamily: "monospace" }}>{order!.orderRef}</p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
          style={{ background: `${cfg!.color}15`, border: `1px solid ${cfg!.color}40`, color: cfg!.color, fontSize: "11px", fontWeight: 600 }}>
          {cfg!.icon}
          {cfg!.label}
        </div>
      </div>

      {/* Client block */}
      <div className="rounded-xl p-3 space-y-1"
        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>Client</p>
        <p style={{ fontSize: "13px", color: "#fff", fontWeight: 600 }}>{order!.clientName}</p>
        {order!.clientCompany && <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)" }}>{order!.clientCompany}</p>}
        <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>{order!.clientEmail}</p>
      </div>

      {/* Financials */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Subtotal", value: fmt(order!.budgetAed) },
          { label: "VAT 5%",   value: fmt(order!.vatAed) },
          { label: "Total",    value: fmt(order!.totalAed), bold: true },
        ].map(({ label, value, bold }) => (
          <div key={label} className="rounded-xl p-3"
            style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", marginBottom: "4px" }}>{label}</p>
            <p style={{ fontSize: bold ? "15px" : "13px", fontWeight: bold ? 700 : 500, color: bold ? "#fff" : "rgba(255,255,255,0.8)" }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Package */}
      <div className="rounded-xl px-3 py-2.5"
        style={{ background: "rgba(124,92,255,0.08)", border: "1px solid rgba(124,92,255,0.2)" }}>
        <p style={{ fontSize: "10px", color: "rgba(167,139,250,0.6)", marginBottom: "2px" }}>Package</p>
        <p style={{ fontSize: "12px", color: "rgba(167,139,250,0.9)" }}>{order!.packageLabel}</p>
      </div>

      {/* PDF download */}
      {order!.pdfPublicUrl && (
        <a href={order!.pdfPublicUrl} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl transition-colors"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", fontSize: "12px", textDecoration: "none" }}>
          <FileText size={13} />
          Download Booking Order PDF
        </a>
      )}

      {/* Admin: confirm talent section */}
      {["SENT", "TALENT_PENDING"].includes(order!.status) && (
        <div className="rounded-xl p-4 space-y-3"
          style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <p style={{ fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>
            Confirm talent for client (48h window)
          </p>
          <div>
            <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", marginBottom: "4px" }}>
              Talent IDs (comma-separated)
            </p>
            <input
              value={talentInput}
              onChange={(e) => setTalentInput(e.target.value)}
              placeholder="talent-abc123, talent-def456"
              className="w-full rounded-lg px-3 py-2 text-[12px] outline-none"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)", color: "#fff" }}
            />
          </div>
          <div>
            <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", marginBottom: "4px" }}>
              Replacement note (optional)
            </p>
            <input
              value={replacementNote}
              onChange={(e) => setReplacementNote(e.target.value)}
              placeholder="One original pick was unavailable — we've suggested…"
              className="w-full rounded-lg px-3 py-2 text-[12px] outline-none"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)", color: "#fff" }}
            />
          </div>
          <button
            onClick={handleConfirmTalent}
            disabled={confirming || !talentInput.trim()}
            className="w-full rounded-xl py-2.5 text-[12px] font-semibold transition-colors disabled:opacity-40"
            style={{ background: "rgba(167,139,250,0.15)", border: "1px solid rgba(167,139,250,0.35)", color: "rgba(167,139,250,0.9)" }}>
            {confirming ? "Sending…" : "Send talent confirmation email →"}
          </button>
        </div>
      )}

      {/* Confirmed talent list */}
      {order!.confirmedTalentIds.length > 0 && (
        <div className="rounded-xl p-3"
          style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.18)" }}>
          <p style={{ fontSize: "10px", color: "rgba(16,185,129,0.6)", marginBottom: "6px" }}>Confirmed Talent</p>
          <div className="flex flex-wrap gap-1.5">
            {order!.confirmedTalentIds.map((id) => (
              <span key={id} className="px-2 py-1 rounded-lg text-[10px]"
                style={{ background: "rgba(16,185,129,0.10)", color: "rgba(16,185,129,0.85)", fontFamily: "monospace" }}>
                {id}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Client action result */}
      {order!.clientAction && (
        <div className="rounded-xl px-3 py-2.5"
          style={{
            background: order!.clientAction === "approve" ? "rgba(16,185,129,0.08)" : order!.clientAction === "cancel" ? "rgba(248,113,113,0.08)" : "rgba(245,158,11,0.08)",
            border: `1px solid ${order!.clientAction === "approve" ? "rgba(16,185,129,0.25)" : order!.clientAction === "cancel" ? "rgba(248,113,113,0.25)" : "rgba(245,158,11,0.25)"}`,
          }}>
          <p style={{ fontSize: "12px", fontWeight: 600, color: order!.clientAction === "approve" ? "#10B981" : order!.clientAction === "cancel" ? "#F87171" : "#F59E0B" }}>
            Client {order!.clientAction === "approve" ? "approved talent ✓" : order!.clientAction === "replace" ? "requested replacement ↻" : "cancelled booking ✕"}
          </p>
          {order!.clientActionAt && (
            <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", marginTop: "2px" }}>
              {new Date(order!.clientActionAt).toLocaleDateString("en-AE", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
