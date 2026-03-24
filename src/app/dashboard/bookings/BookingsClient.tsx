"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { feyTokens } from "@/lib/fey-design-tokens";
import { ArrowLeft, Clock, CheckCircle, AlertCircle, CreditCard } from "lucide-react";
import { curatedTalent } from "@/lib/curatedTalent";

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

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  PENDING:   { label: "Pending review", color: "rgba(234,179,8,0.9)",   bg: "rgba(234,179,8,0.08)",  border: "rgba(234,179,8,0.20)" },
  REVIEWING: { label: "In review",      color: "rgba(96,165,250,0.9)",  bg: "rgba(96,165,250,0.08)", border: "rgba(96,165,250,0.20)" },
  CONFIRMED: { label: "Confirmed",      color: "rgba(16,185,129,0.9)",  bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.20)" },
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
        <div className="space-y-4 pb-8">
          <p className="text-[11px] font-semibold uppercase tracking-widest mb-6"
            style={{ color: feyTokens.colors.text.label }}>
            {bookings.length} booking{bookings.length !== 1 ? "s" : ""}
          </p>
          {bookings.map((b) => {
            const cfg = STATUS_CONFIG[b.status] ?? STATUS_CONFIG.PENDING;
            const date = new Date(b.createdAt);
            const isConfirmed = b.status === "CONFIRMED";

            // Resolve talent from local roster
            const talentProfiles = (b.talentIds ?? [])
              .map(id => curatedTalent.find(t => t.id === id))
              .filter(Boolean);

            return (
              <div key={b.id} className="rounded-2xl overflow-hidden"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>

                {/* Order header */}
                <div className="flex items-center justify-between px-5 py-3"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
                  <div>
                    <p className="text-[10px] text-white/25 uppercase tracking-widest">Booking Order</p>
                    <p className="text-[12px] font-mono text-white/50 mt-0.5">{b.id.substring(0, 14).toUpperCase()}</p>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                    style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                    {isConfirmed
                      ? <CheckCircle size={10} style={{ color: cfg.color }} />
                      : <Clock size={10} style={{ color: cfg.color }} />}
                    <span className="text-[10px] font-medium" style={{ color: cfg.color }}>{cfg.label}</span>
                  </div>
                </div>

                {/* Talent row */}
                {talentProfiles.length > 0 && (
                  <div className="px-5 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <p className="text-[10px] text-white/25 uppercase tracking-widest mb-2">Talent</p>
                    <div className="flex flex-wrap gap-2">
                      {talentProfiles.map((t) => t && (
                        <div key={t.id} className="flex items-center gap-1.5 px-2 py-1 rounded-lg"
                          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                          <img src={t.avatarUrl} alt={t.name}
                            className="w-5 h-5 rounded-full object-cover"
                            style={{ border: "1px solid rgba(255,255,255,0.10)" }} />
                          <span className="text-[11px] text-white/65">{t.name}</span>
                          <span className="text-[10px] text-white/30">· {t.primaryRole}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Details */}
                <div className="px-5 py-3">
                  <p className="text-[13px] text-white/70 line-clamp-2 mb-3">{b.description}</p>
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
                    {b.budgetRange && (
                      <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.40)" }}>
                        <span style={{ color: "rgba(255,255,255,0.22)" }}>Budget </span>{b.budgetRange}
                      </span>
                    )}
                    <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.40)" }}>
                      <span style={{ color: "rgba(255,255,255,0.22)" }}>Type </span>
                      {b.bookingType === "LONG" ? "Monthly Retainer" : "Per Campaign"}
                    </span>
                    <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.25)" }}>
                      {date.toLocaleDateString("en-AE", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                </div>

                {/* Pay CTA for confirmed bookings */}
                {isConfirmed && (
                  <div className="px-5 py-3 flex items-center justify-between"
                    style={{ borderTop: "1px solid rgba(16,185,129,0.15)", background: "rgba(16,185,129,0.05)" }}>
                    <p className="text-[11px] text-emerald-400/80">Booking confirmed — payment ready</p>
                    <button
                      onClick={() => router.push("/dashboard/campaigns?mode=pay")}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition"
                      style={{ background: "rgba(16,185,129,0.15)", color: "rgba(16,185,129,0.9)", border: "1px solid rgba(16,185,129,0.25)" }}>
                      <CreditCard size={11} />
                      Pay now
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
