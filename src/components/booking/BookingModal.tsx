"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Talent } from "@/store/useCampaignPodStore";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [error, setError] = useState<string | null>(null);
  const [tradeLicenseFile, setTradeLicenseFile] = useState<File | null>(null);
  const [tradeLicenseFileName, setTradeLicenseFileName] = useState<string>("");

  // Reset form state when modal opens - ensures we always start at brief step
  useEffect(() => {
    if (open) {
      setSuccess(false);
      setSubmitting(false);
      setError(null);
      setBookingType("short");
      setStartDate("");
      setCampaignDescription("");
      setBudgetRange("");
      setEmail("");
      setTradeLicenseFile(null);
      setTradeLicenseFileName("");
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
                  className="pt-8 pb-4 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-semibold text-white/90 mb-3">
                    Booking request sent ✨
                  </h2>
                  <p className="mt-2 text-base text-white/70 max-w-md mx-auto">
                    We&apos;ve received your brief. An assigned campaign manager will review your brief, confirm talent, and get back to you within 48 hours.
                  </p>
                  <div className="mt-8 flex justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onViewPod?.();
                      }}
                      className="rounded-full px-5 py-2.5 text-sm text-white/70 hover:bg-white/5 transition"
                    >
                      Back to discovery
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        router.push('/dashboard/campaigns');
                      }}
                      className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-black hover:bg-white/90 transition"
                    >
                      Go to campaign management
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
