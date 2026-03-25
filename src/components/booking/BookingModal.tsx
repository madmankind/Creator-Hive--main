"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Talent } from "@/store/useCampaignPodStore";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDiscoveryStore } from "@/store/useDiscoveryStore";
import { mapTimingToStartDate, mapBudgetToDisplay, getObjectiveLabel } from "@/lib/discovery";

type BookingModalProps = {
  open: boolean;
  onClose: () => void;
  talents: Talent[];
  onViewPod?: () => void;
};

const startDateOptions = ["ASAP", "Within 2 weeks", "Next month", "Flexible"];

export function BookingModal({ open, onClose, talents, onViewPod }: BookingModalProps) {
  const router = useRouter();
  const [bookingType, setBookingType] = useState<"short" | "long">("short");
  const [startDate, setStartDate] = useState("");
  const [campaignDescription, setCampaignDescription] = useState("");
  const [budgetRange, setBudgetRange] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [bookingOrder, setBookingOrder] = useState<{
    orderRef: string; description: string; budgetRange?: string;
    startDate?: string; bookingType?: string; talentCount: number; submittedAt: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tradeLicenseFile, setTradeLicenseFile] = useState<File | null>(null);
  const [tradeLicenseFileName, setTradeLicenseFileName] = useState<string>("");

  // Reset form state when modal opens - prefill from discovery if available
  useEffect(() => {
    if (open) {
      setSuccess(false);
      setBookingOrder(null);
      setSubmitting(false);
      setError(null);
      setTradeLicenseFile(null);
      setTradeLicenseFileName("");

      // Prefill from discovery brief
      const ds = useDiscoveryStore.getState();
      if (ds.completed) {
        setBookingType(ds.startTiming === "exploring" || ds.startTiming === "next_month" ? "long" : "short");
        setStartDate(mapTimingToStartDate(ds.startTiming));
        setBudgetRange(mapBudgetToDisplay(ds.budgetRange));
        const parts: string[] = [];
        if (ds.primaryObjective) parts.push(`Objective: ${getObjectiveLabel(ds.primaryObjective)}`);
        if (ds.requestedRoles.length > 0) parts.push(`Roles: ${ds.requestedRoles.join(", ")}`);
        if (ds.notes) parts.push(ds.notes);
        setCampaignDescription(parts.join("\n"));
        setEmail(""); // email comes from session, not discovery
      } else {
        setBookingType("short");
        setStartDate("");
        setCampaignDescription("");
        setBudgetRange("");
        setEmail("");
      }
    }
  }, [open]);

  const title =
    talents.length === 0
      ? "Help me pick the right talent"
      : talents.length === 1
      ? `Book ${talents[0].name}`
      : `Book your campaign pod`;

  const subtitle =
    talents.length === 0
      ? "Let Creator Hive curate the perfect team for your campaign"
      : talents.length === 1
      ? talents[0].headline
      : `${talents.length} talents selected`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingType,
          startDate,
          campaignDescription,
          budgetRange,
          email,
          talentIds: talents.map((talent) => talent.id),
          tradeLicenseFileName: tradeLicenseFileName,
          // In production, upload file to storage and send URL
          // For now, just send filename as placeholder
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || "Failed to submit booking");
      }
      const data = await res.json();
      setBookingOrder(data?.data?.bookingOrder ?? null);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit booking");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Radial glow */}
          <motion.div
            aria-hidden
            className="pointer-events-none fixed inset-0 z-40 mx-auto max-w-xl bg-[radial-gradient(60%_55%_at_50%_0%,rgba(255,255,255,0.12),transparent_70%)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div className="relative w-full max-w-xl rounded-3xl bg-[#0F141A]/95 p-8 ring-1 ring-white/10 shadow-2xl">
              {!success && (
                <button
                  type="button"
                  onClick={onClose}
                  className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/60 hover:bg-white/10"
                >
                  <X className="h-4 w-4" />
                </button>
              )}

              {!success ? (
                <form onSubmit={handleSubmit}>
                  <header className="mb-6">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/50">
                  Booking request
                </p>
                <h2 className="mt-1 text-xl font-semibold text-white/90">
                  {title}
                </h2>
                {subtitle && (
                  <p className="mt-1 text-xs text-white/60">{subtitle}</p>
                )}
                <p className="mt-2 text-[11px] text-white/55">
                  We&apos;ll confirm your booking within 48 hours with a clear scope,
                  timeline, and deliverables.
                </p>
              </header>

              {/* Booking type */}
              <fieldset className="mb-5">
                <legend className="mb-2 text-xs font-medium text-white/75">
                  Select booking type
                </legend>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setBookingType("short")}
                    className={cn(
                      "flex flex-col items-start rounded-2xl px-4 py-3 text-left text-xs ring-1 transition",
                      bookingType === "short"
                        ? "bg-white text-black ring-white"
                        : "bg-white/5 text-white/70 ring-white/15 hover:bg-white/8",
                    )}
                  >
                    <span className="font-semibold">Short term</span>
                    <span className="mt-0.5 text-[11px] opacity-80">
                      Per campaign or project
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBookingType("long")}
                    className={cn(
                      "flex flex-col items-start rounded-2xl px-4 py-3 text-left text-xs ring-1 transition",
                      bookingType === "long"
                        ? "bg-white text-black ring-white"
                        : "bg-white/5 text-white/70 ring-white/15 hover:bg-white/8",
                    )}
                  >
                    <span className="font-semibold">Long term</span>
                    <span className="mt-0.5 text-[11px] opacity-80">
                      Monthly retainer (6–12 months)
                    </span>
                  </button>
                </div>
              </fieldset>

              {/* Fields */}
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-white/75">
                    Describe your campaign or role <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={campaignDescription}
                    onChange={(e) => setCampaignDescription(e.target.value)}
                    className={cn(
                      "w-full rounded-2xl bg-white/5 px-4 py-3 text-sm text-white/90",
                      "placeholder:text-white/40",
                      "ring-1 ring-white/10 outline-none transition",
                      "focus:ring-2 focus:ring-cyan-400/60",
                    )}
                    placeholder="Tell us about your project, deliverables, timeline, and any specific requirements…"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-white/75">
                    Budget range
                  </label>
                  <input
                    type="text"
                    value={budgetRange}
                    onChange={(e) => setBudgetRange(e.target.value)}
                    className={cn(
                      "w-full rounded-2xl bg-white/5 px-4 py-2.5 text-sm text-white/90",
                      "placeholder:text-white/40",
                      "ring-1 ring-white/10 outline-none transition",
                      "focus:ring-2 focus:ring-cyan-400/60",
                    )}
                    placeholder="e.g., $5,000 – $10,000"
                  />
                </div>
                {error && (
                  <p className="text-xs text-red-400">{error}</p>
                )}

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-white/75">
                      Preferred start date
                    </label>
                    <div
                      className={cn(
                        "relative flex items-center rounded-2xl bg-white/5 px-4 ring-1 ring-white/10",
                        "focus-within:ring-2 focus-within:ring-cyan-400/60",
                      )}
                    >
                      <select
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full appearance-none bg-transparent py-2.5 text-sm text-white/90 outline-none"
                      >
                        <option value="">Select…</option>
                        {startDateOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                      <span className="pointer-events-none text-[10px] text-white/50">
                        ▼
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-white/75">
                      Email <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={cn(
                        "w-full rounded-2xl bg-white/5 px-4 py-2.5 text-sm text-white/90",
                        "placeholder:text-white/40",
                        "ring-1 ring-white/10 outline-none transition",
                        "focus:ring-2 focus:ring-cyan-400/60",
                      )}
                      placeholder="you@company.com"
                    />
                  </div>
                </div>

                {/* Trade License Upload */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-white/75">
                    Trade License <span className="text-red-400">*</span>
                    <span className="text-[11px] text-white/50 font-normal ml-1">(Required to send booking request)</span>
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
                              setError("File size must be less than 10MB");
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
                      <div className="flex items-center gap-3">
                        <svg className="h-5 w-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div>
                          <div className="text-xs font-medium text-white/90">{tradeLicenseFileName}</div>
                          <div className="text-[10px] text-white/50">
                            {(tradeLicenseFile.size / 1024).toFixed(1)} KB
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setTradeLicenseFile(null);
                          setTradeLicenseFileName("");
                        }}
                        className="text-xs text-white/60 hover:text-white/80 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                  {!tradeLicenseFile && (
                    <p className="mt-1.5 text-[11px] text-white/50">
                      Upload your trade license to proceed with booking request
                    </p>
                  )}
                </div>
              </div>

              <footer className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full px-4 py-2 text-xs text-white/65 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !tradeLicenseFile}
                  className={cn(
                    "flex items-center gap-2 rounded-full bg-white px-5 py-2 text-xs font-semibold text-black",
                    "hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-70",
                    !tradeLicenseFile && "opacity-50",
                  )}
                  title={!tradeLicenseFile ? "Please upload trade license to continue" : ""}
                >
                  {submitting && (
                    <span className="h-3 w-3 animate-spin rounded-full border border-black/20 border-t-black" />
                  )}
                  Submit request
                </button>
              </footer>
                </form>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="py-2"
                >
                  {/* Status badge */}
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[11px] font-semibold tracking-widest uppercase text-emerald-400">Booking order received</span>
                  </div>

                  {/* Order card */}
                  <div className="rounded-2xl overflow-hidden mb-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.09)" }}>
                    {/* Card header */}
                    <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
                      <div>
                        <p className="text-[10px] font-semibold tracking-widest uppercase text-white/30">Creator Hive FZE</p>
                        <p className="text-[13px] font-semibold text-white/85 mt-0.5">Booking Order</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-white/30 uppercase tracking-widest">Ref</p>
                        <p className="text-[12px] font-mono text-white/70 mt-0.5">{bookingOrder?.orderRef ?? "—"}</p>
                      </div>
                    </div>

                    {/* Talent summary */}
                    {talents.length > 0 && (
                      <div className="px-5 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                        <p className="text-[10px] text-white/30 uppercase tracking-widest mb-2">Selected Talent</p>
                        <div className="flex flex-wrap gap-2">
                          {talents.map((t) => (
                            <div key={t.id} className="flex items-center gap-1.5 px-2 py-1 rounded-lg" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}>
                              {t.avatarUrl && <img src={t.avatarUrl} alt={t.name} className="w-4 h-4 rounded-full object-cover" />}
                              <span className="text-[11px] text-white/70">{t.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Order details */}
                    <div className="px-5 py-3 space-y-2.5">
                      {([
                        ["Type", bookingOrder?.bookingType === "long" ? "Monthly Retainer" : "Per Campaign"],
                        bookingOrder?.startDate ? ["Start", bookingOrder.startDate] : null,
                        bookingOrder?.budgetRange ? ["Budget", bookingOrder.budgetRange] : null,
                        ["Status", "Pending review"],
                        ["Date", bookingOrder?.submittedAt ? new Date(bookingOrder.submittedAt).toLocaleDateString("en-AE", { day: "numeric", month: "short", year: "numeric" }) : new Date().toLocaleDateString("en-AE", { day: "numeric", month: "short", year: "numeric" })],
                      ] as (string[] | null)[]).filter((r): r is string[] => r !== null).map(([label, value]) => (
                        <div key={label} className="flex items-center justify-between">
                          <span className="text-[11px] text-white/30">{label}</span>
                          <span className="text-[12px] text-white/70">{value}</span>
                        </div>
                      ))}
                    </div>

                    {/* Brief */}
                    {campaignDescription && (
                      <div className="px-5 pb-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                        <p className="text-[10px] text-white/30 uppercase tracking-widest mt-3 mb-1">Brief</p>
                        <p className="text-[12px] text-white/55 leading-relaxed line-clamp-3">{campaignDescription}</p>
                      </div>
                    )}

                    {/* Next step */}
                    <div className="px-5 py-3 mx-0" style={{ background: "rgba(16,185,129,0.06)", borderTop: "1px solid rgba(16,185,129,0.15)" }}>
                      <p className="text-[11px] text-emerald-400/80">A booking confirmation and invoice will be sent to <strong className="text-emerald-300/90">{email}</strong> within 48 hours.</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => { onClose(); onViewPod?.(); }}
                      className="flex-1 rounded-xl px-4 py-2.5 text-[12px] text-white/50 hover:bg-white/5 transition text-center"
                    >
                      Keep browsing
                    </button>
                    <button
                      type="button"
                      onClick={() => { onClose(); router.push("/dashboard/bookings"); }}
                      className="flex-1 rounded-xl px-4 py-2.5 text-[13px] font-semibold text-black transition text-center"
                      style={{ background: "rgba(255,255,255,0.92)" }}
                    >
                      View booking →
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
