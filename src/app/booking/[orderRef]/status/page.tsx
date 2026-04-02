import { db } from "@/server/db";
import Link from "next/link";

const COLORS = {
  approve: { bg: "rgba(16,185,129,0.10)", border: "rgba(16,185,129,0.30)", text: "#10B981", label: "Booking Approved" },
  replace: { bg: "rgba(245,158,11,0.10)", border: "rgba(245,158,11,0.30)", text: "#F59E0B", label: "Replacement Requested" },
  cancel:  { bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.25)", text: "#F87171", label: "Booking Cancelled" },
};
const MESSAGES: Record<string, string> = {
  approve: "Your talent is confirmed. We'll send your contract and advance invoice shortly.",
  replace: "We've received your replacement request. Our team will propose alternatives within 24 hours.",
  cancel:  "Your booking has been cancelled. No charges have been made.",
};

export default async function BookingStatusPage({
  params, searchParams,
}: {
  params: Promise<{ orderRef: string }>;
  searchParams: Promise<{ action?: string }>;
}) {
  const { orderRef } = await params;
  const { action } = await searchParams;
  const order = await (db as any).bookingOrder.findUnique({ where: { orderRef } }).catch(() => null);
  const effectiveAction = (order?.clientAction ?? action ?? "approve") as keyof typeof COLORS;
  const c = COLORS[effectiveAction] ?? COLORS.approve;

  return (
    <div style={{ minHeight: "100dvh", background: "#07070B", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      {/* Logo */}
      <div style={{ marginBottom: "40px", fontSize: "18px", fontWeight: 700, color: "rgba(255,255,255,0.85)", letterSpacing: "-0.02em" }}>
        Creator Hive
      </div>

      <div style={{ width: "100%", maxWidth: "480px", background: "rgba(255,255,255,0.03)", border: `1px solid ${c.border}`, borderRadius: "20px", padding: "36px 32px", textAlign: "center" }}>
        <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: c.bg, border: `1px solid ${c.border}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: "24px" }}>
          {effectiveAction === "approve" ? "✓" : effectiveAction === "replace" ? "↻" : "✕"}
        </div>
        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#fff", margin: "0 0 12px" }}>{c.label}</h1>
        <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.55)", lineHeight: 1.6, margin: "0 0 8px" }}>
          {MESSAGES[effectiveAction]}
        </p>
        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.25)", margin: "0 0 32px", fontFamily: "monospace" }}>
          Ref: {orderRef}
        </p>
        <Link href="https://creatorhive.ae"
          style={{ display: "inline-block", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)", fontSize: "13px", fontWeight: 600, padding: "12px 28px", borderRadius: "10px", textDecoration: "none" }}>
          Back to Creator Hive
        </Link>
      </div>

      <p style={{ marginTop: "32px", fontSize: "12px", color: "rgba(255,255,255,0.2)" }}>
        Questions? <a href="mailto:hello@creatorhive.ae" style={{ color: "rgba(255,255,255,0.35)" }}>hello@creatorhive.ae</a>
      </p>
    </div>
  );
}
