"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { feyTokens } from "@/lib/fey-design-tokens";
import { ArrowLeft, Clock, CheckCircle, AlertCircle } from "lucide-react";

interface Booking {
  id: string;
  bookingType: string;
  description: string;
  contactEmail: string;
  budgetRange?: string;
  startDate?: string;
  talentIds: string[];
  status: string;
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; Icon: typeof Clock }> = {
  PENDING:    { label: "Pending",   color: "rgba(234,179,8,0.8)",   Icon: Clock },
  REVIEWING:  { label: "Reviewing", color: "rgba(96,165,250,0.8)",   Icon: Clock },
  CONFIRMED:  { label: "Confirmed", color: "rgba(16,185,129,0.8)",   Icon: CheckCircle },
};

export default function BookingsClient() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/bookings")
      .then((r) => r.json())
      .then((d) => { setBookings(d.bookings || []); setLoading(false); })
      .catch(() => { setError("Failed to load bookings."); setLoading(false); });
  }, []);

  const headerLeft = (
    <div className="flex items-center gap-3">
      <button onClick={() => router.back()} className="text-white/35 hover:text-white/70 transition">
        <ArrowLeft size={16} />
      </button>
      <div className="h-4 w-px" style={{ background: "rgba(255,255,255,0.08)" }} />
      <span className="text-[13px] text-white/60">Booking History</span>
    </div>
  );

  return (
    <DashboardShell headerLeft={headerLeft}>
      {loading && (
        <div className="flex items-center justify-center py-24">
          <div className="w-6 h-6 rounded-full border-2 border-white/10 border-t-white/50 animate-spin" />
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 py-8 text-[13px]" style={{ color: "rgba(248,113,113,0.8)" }}>
          <AlertCircle size={14} /> {error}
        </div>
      )}
      {!loading && !error && bookings.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <p className="text-[14px] text-white/35">No bookings yet</p>
          <button onClick={() => router.push("/")}
            className="text-[12px] text-white/25 hover:text-white/55 transition">
            Browse talent to start a campaign →
          </button>
        </div>
      )}
      {!loading && bookings.length > 0 && (
        <div className="space-y-3 pb-8">
          <p className="text-[11px] font-semibold uppercase tracking-widest mb-5"
            style={{ color: feyTokens.colors.text.label }}>
            {bookings.length} booking{bookings.length !== 1 ? "s" : ""}
          </p>
          {bookings.map((b) => {
            const cfg = STATUS_CONFIG[b.status] ?? STATUS_CONFIG.PENDING;
            const Icon = cfg.Icon;
            const date = new Date(b.createdAt);
            return (
              <div key={b.id} className="rounded-2xl p-5"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-white/85 line-clamp-1">{b.description}</p>
                    <p className="text-[11px] text-white/30 mt-0.5 font-mono">{b.id.substring(0, 20)}…</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 px-2.5 py-1 rounded-full"
                    style={{ background: cfg.color + "14", border: `1px solid ${cfg.color}30` }}>
                    <Icon size={10} style={{ color: cfg.color }} />
                    <span className="text-[10px] font-medium" style={{ color: cfg.color }}>{cfg.label}</span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
                  {b.budgetRange && (
                    <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.45)" }}>
                      <span style={{ color: "rgba(255,255,255,0.25)" }}>Budget </span>{b.budgetRange}
                    </span>
                  )}
                  {b.talentIds?.length > 0 && (
                    <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.45)" }}>
                      <span style={{ color: "rgba(255,255,255,0.25)" }}>Talent </span>{b.talentIds.length} selected
                    </span>
                  )}
                  <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.25)" }}>
                    {date.toLocaleDateString("en-AE", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
