/**
 * SEND REQUEST SHEET - OS-STYLE RIGHT-SIDE PANEL
 * Slides in from right (not center modal)
 * NO background blur (feels native, not modal)
 * ONLY asks for: companyName + email (required), phone + note (optional)
 * Brief summary is collapsible
 * NO duplicate fields (campaign details already in brief)
 */

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BriefLite, BookingRequestCreate } from "@/lib/schemas/booking";
import { BookingRequestCreateSchema } from "@/lib/schemas/booking";
import { 
  OBJECTIVE_LABELS, 
  MARKET_LABELS, 
  LANGUAGE_LABELS, 
  TIMELINE_LABELS, 
  PRICING_TIER_LABELS 
} from "@/lib/schemas/booking";
import type { Talent } from "@/store/useCampaignPodStore";

type SendRequestSheetProps = {
  open: boolean;
  onClose: () => void;
  brief: BriefLite;
  pod: Talent[];
  onSubmit: (data: Omit<BookingRequestCreate, "brief" | "talentIds">) => Promise<void>;
  embedded?: boolean; // When true, renders as inline content (no backdrop/slide animation)
};

export function SendRequestSheet({ 
  open, 
  onClose, 
  brief, 
  pod, 
  onSubmit,
  embedded = false
}: SendRequestSheetProps) {
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [briefExpanded, setBriefExpanded] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate
    const result = BookingRequestCreateSchema.omit({ brief: true, talentIds: true }).safeParse({
      companyName: companyName.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      note: note.trim() || undefined,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const fieldName = issue.path[0] as string;
        fieldErrors[fieldName] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(result.data);
      // Reset form
      setCompanyName("");
      setEmail("");
      setPhone("");
      setNote("");
      onClose();
    } catch (err) {
      setErrors({ 
        submit: err instanceof Error ? err.message : "Failed to submit request" 
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Escape key handler
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape" && open) {
      onClose();
    }
  };

  // Add escape listener
  if (typeof window !== "undefined") {
    window.addEventListener("keydown", handleKeyDown);
    if (!open) {
      window.removeEventListener("keydown", handleKeyDown);
    }
  }

  // Embedded mode: render as inline content
  if (embedded && open) {
    return (
      <div className="max-w-3xl mx-auto">
        {/* Brief Summary - Collapsible */}
        <div className="mb-6">
          <button
            onClick={() => setBriefExpanded(!briefExpanded)}
            className="flex items-center justify-between w-full text-left group p-3 rounded-lg bg-white/5 ring-1 ring-white/10 hover:bg-white/8 transition"
          >
            <h3 className="text-sm font-medium text-white/90">Campaign Brief</h3>
            {briefExpanded ? (
              <ChevronUp className="w-4 h-4 text-white/60 group-hover:text-white transition" />
            ) : (
              <ChevronDown className="w-4 h-4 text-white/60 group-hover:text-white transition" />
            )}
          </button>

          <AnimatePresence>
            {briefExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-3 space-y-2 text-xs p-3 rounded-lg bg-white/5 ring-1 ring-white/10">
                  <div>
                    <span className="text-white/50">Objective:</span>{" "}
                    <span className="text-white/80">{OBJECTIVE_LABELS[brief.objective]}</span>
                  </div>
                  <div>
                    <span className="text-white/50">Outputs:</span>{" "}
                    <span className="text-white/80">{brief.outputs.join(", ")}</span>
                  </div>
                  <div>
                    <span className="text-white/50">Platforms:</span>{" "}
                    <span className="text-white/80">{brief.platforms.join(", ")}</span>
                  </div>
                  <div>
                    <span className="text-white/50">Markets:</span>{" "}
                    <span className="text-white/80">
                      {brief.markets.map(m => MARKET_LABELS[m as keyof typeof MARKET_LABELS] || m).join(", ")}
                    </span>
                  </div>
                  <div>
                    <span className="text-white/50">Languages:</span>{" "}
                    <span className="text-white/80">
                      {brief.languages.map(l => LANGUAGE_LABELS[l as keyof typeof LANGUAGE_LABELS] || l).join(", ")}
                    </span>
                  </div>
                  {brief.keyMessaging && (
                    <div>
                      <span className="text-white/50">Key messaging:</span>{" "}
                      <span className="text-white/80">{brief.keyMessaging}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-white/50">Timeline:</span>{" "}
                    <span className="text-white/80">{TIMELINE_LABELS[brief.timeline]}</span>
                  </div>
                  <div>
                    <span className="text-white/50">Tier:</span>{" "}
                    <span className="text-white/80">{PRICING_TIER_LABELS[brief.pricingTier]}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Pod Summary */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-white/90 mb-3">
            Selected Talent ({pod.length})
          </h3>
          <div className="space-y-2">
            {pod.map((talent) => (
              <div
                key={talent.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-white/5 ring-1 ring-white/10"
              >
                {talent.avatarUrl ? (
                  <img 
                    src={talent.avatarUrl} 
                    alt={talent.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-medium">
                    {talent.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">
                    {talent.name}
                  </div>
                  <div className="text-xs text-white/60 truncate">
                    {talent.headline}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="h-px bg-white/10 my-6" />

        {/* Form - ONLY Essential Info */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Company Name - Required */}
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              Company Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Your company name"
              className={cn(
                "w-full rounded-lg bg-white/5 ring-1 px-3 py-2.5 text-sm text-white",
                "placeholder:text-white/40",
                "focus:outline-none focus:ring-white/30 transition",
                errors.companyName ? "ring-red-500/50" : "ring-white/10"
              )}
            />
            {errors.companyName && (
              <p className="text-xs text-red-400 mt-1">{errors.companyName}</p>
            )}
          </div>

          {/* Email - Required */}
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              Email <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@company.com"
              className={cn(
                "w-full rounded-lg bg-white/5 ring-1 px-3 py-2.5 text-sm text-white",
                "placeholder:text-white/40",
                "focus:outline-none focus:ring-white/30 transition",
                errors.contactEmail ? "ring-red-500/50" : "ring-white/10"
              )}
            />
            {errors.contactEmail && (
              <p className="text-xs text-red-400 mt-1">{errors.contactEmail}</p>
            )}
          </div>

          {/* Phone - Optional */}
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              Phone <span className="text-white/40 text-xs">(optional)</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+971 50 123 4567"
              className="w-full rounded-lg bg-white/5 ring-1 ring-white/10 px-3 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-white/30 transition"
            />
          </div>

          {/* Note - Optional */}
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              Additional Notes <span className="text-white/40 text-xs">(optional)</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Any special requirements, deadlines, or preferences..."
              rows={3}
              maxLength={500}
              className="w-full rounded-lg bg-white/5 ring-1 ring-white/10 px-3 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-white/30 transition resize-none"
            />
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-white/40">
                {note.length}/500
              </span>
            </div>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="p-3 rounded-lg bg-red-500/10 ring-1 ring-red-500/30">
              <p className="text-sm text-red-400">{errors.submit}</p>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 rounded-full px-5 py-2.5 text-sm font-medium text-white/80 bg-white/10 ring-1 ring-white/20 hover:bg-white/15 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={submitting || !companyName.trim() || !email.trim()}
              className="flex-1 rounded-full px-5 py-2.5 text-sm font-semibold text-black bg-white hover:bg-white/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Request
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Sheet mode: render as right-side sliding panel
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop - Subtle, NO blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40"
          />

          {/* Sheet - Slides from right */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-[480px] bg-[#0B0F14] shadow-2xl"
          >
            {/* Header */}
            <div className="border-b border-white/10 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-white">Review & Send</h2>
                <button
                  onClick={onClose}
                  className="rounded-full p-2 text-white/60 hover:bg-white/10 hover:text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-white/60 mt-2">
                Confirm your details and submit your request
              </p>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto h-[calc(100vh-180px)] p-6">
              {/* Brief Summary - Collapsible */}
              <div className="mb-6">
                <button
                  onClick={() => setBriefExpanded(!briefExpanded)}
                  className="flex items-center justify-between w-full text-left group"
                >
                  <h3 className="text-sm font-medium text-white/90">Campaign Brief</h3>
                  {briefExpanded ? (
                    <ChevronUp className="w-4 h-4 text-white/60 group-hover:text-white transition" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-white/60 group-hover:text-white transition" />
                  )}
                </button>

                <AnimatePresence>
                  {briefExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 space-y-2 text-xs">
                        <div>
                          <span className="text-white/50">Objective:</span>{" "}
                          <span className="text-white/80">{OBJECTIVE_LABELS[brief.objective]}</span>
                        </div>
                        <div>
                          <span className="text-white/50">Outputs:</span>{" "}
                          <span className="text-white/80">{brief.outputs.join(", ")}</span>
                        </div>
                        <div>
                          <span className="text-white/50">Platforms:</span>{" "}
                          <span className="text-white/80">{brief.platforms.join(", ")}</span>
                        </div>
                        <div>
                          <span className="text-white/50">Markets:</span>{" "}
                          <span className="text-white/80">
                            {brief.markets.map(m => MARKET_LABELS[m as keyof typeof MARKET_LABELS] || m).join(", ")}
                          </span>
                        </div>
                        <div>
                          <span className="text-white/50">Languages:</span>{" "}
                          <span className="text-white/80">
                            {brief.languages.map(l => LANGUAGE_LABELS[l as keyof typeof LANGUAGE_LABELS] || l).join(", ")}
                          </span>
                        </div>
                        {brief.keyMessaging && (
                          <div>
                            <span className="text-white/50">Key messaging:</span>{" "}
                            <span className="text-white/80">{brief.keyMessaging}</span>
                          </div>
                        )}
                        <div>
                          <span className="text-white/50">Timeline:</span>{" "}
                          <span className="text-white/80">{TIMELINE_LABELS[brief.timeline]}</span>
                        </div>
                        <div>
                          <span className="text-white/50">Tier:</span>{" "}
                          <span className="text-white/80">{PRICING_TIER_LABELS[brief.pricingTier]}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Pod Summary */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-white/90 mb-3">
                  Selected Talent ({pod.length})
                </h3>
                <div className="space-y-2">
                  {pod.map((talent) => (
                    <div
                      key={talent.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-white/5 ring-1 ring-white/10"
                    >
                      {talent.avatarUrl ? (
                        <img 
                          src={talent.avatarUrl} 
                          alt={talent.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-medium">
                          {talent.name.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">
                          {talent.name}
                        </div>
                        <div className="text-xs text-white/60 truncate">
                          {talent.headline}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="h-px bg-white/10 my-6" />

              {/* Form - ONLY Essential Info */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Company Name - Required */}
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">
                    Company Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Your company name"
                    className={cn(
                      "w-full rounded-lg bg-white/5 ring-1 px-3 py-2.5 text-sm text-white",
                      "placeholder:text-white/40",
                      "focus:outline-none focus:ring-white/30 transition",
                      errors.companyName ? "ring-red-500/50" : "ring-white/10"
                    )}
                  />
                  {errors.companyName && (
                    <p className="text-xs text-red-400 mt-1">{errors.companyName}</p>
                  )}
                </div>

                {/* Email - Required */}
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">
                    Email <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@company.com"
                    className={cn(
                      "w-full rounded-lg bg-white/5 ring-1 px-3 py-2.5 text-sm text-white",
                      "placeholder:text-white/40",
                      "focus:outline-none focus:ring-white/30 transition",
                      errors.contactEmail ? "ring-red-500/50" : "ring-white/10"
                    )}
                  />
                  {errors.contactEmail && (
                    <p className="text-xs text-red-400 mt-1">{errors.contactEmail}</p>
                  )}
                </div>

                {/* Phone - Optional */}
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">
                    Phone <span className="text-white/40 text-xs">(optional)</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+971 50 123 4567"
                    className="w-full rounded-lg bg-white/5 ring-1 ring-white/10 px-3 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-white/30 transition"
                  />
                </div>

                {/* Note - Optional */}
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">
                    Additional Notes <span className="text-white/40 text-xs">(optional)</span>
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Any special requirements, deadlines, or preferences..."
                    rows={3}
                    maxLength={500}
                    className="w-full rounded-lg bg-white/5 ring-1 ring-white/10 px-3 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-white/30 transition resize-none"
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-white/40">
                      {note.length}/500
                    </span>
                  </div>
                </div>

                {/* Submit Error */}
                {errors.submit && (
                  <div className="p-3 rounded-lg bg-red-500/10 ring-1 ring-red-500/30">
                    <p className="text-sm text-red-400">{errors.submit}</p>
                  </div>
                )}
              </form>
            </div>

            {/* Footer - Fixed */}
            <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 p-6 bg-[#0B0F14]">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="flex-1 rounded-full px-5 py-2.5 text-sm font-medium text-white/80 bg-white/10 ring-1 ring-white/20 hover:bg-white/15 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={submitting || !companyName.trim() || !email.trim()}
                  className="flex-1 rounded-full px-5 py-2.5 text-sm font-semibold text-black bg-white hover:bg-white/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Request
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
