"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { ADVISOR_CONTACT_METHODS, ADVISOR_TIMING } from "@/lib/discovery";

interface Props {
  open: boolean;
  onClose: () => void;
  source?: string;
}

export function AdvisorRequestModal({ open, onClose, source = "discovery" }: Props) {
  const [method, setMethod] = useState("whatsapp");
  const [timing, setTiming] = useState("this_week");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await fetch("/api/discovery/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactMethod: method, preferredTiming: timing, note, source }),
      });
      try {
        const w = window as unknown as { posthog?: { capture: (e: string, p?: Record<string, unknown>) => void } };
        w.posthog?.capture("advisor_request_submitted", { method, timing, source });
      } catch { /* silent */ }
      setDone(true);
    } catch { /* silent */ }
    setSubmitting(false);
  };

  const reset = () => { setDone(false); setNote(""); onClose(); };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={reset} />
          <motion.div className="fixed inset-0 z-[61] flex items-center justify-center px-4"
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.2 }}>
            <div className="relative w-full max-w-md rounded-2xl bg-[#0F141A]/95 ring-1 ring-white/10 shadow-2xl overflow-hidden">
              {!done ? (
                <div className="p-6 space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/20">Creator Hive</p>
                      <h3 className="text-[18px] font-medium text-white/90 mt-0.5">Talk to an advisor</h3>
                    </div>
                    <button onClick={reset} className="h-7 w-7 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:bg-white/10 transition">
                      <X size={14} />
                    </button>
                  </div>

                  <div>
                    <p className="text-[11px] text-white/25 mb-2">How should we reach you?</p>
                    <div className="flex gap-2">
                      {ADVISOR_CONTACT_METHODS.map((m) => (
                        <button key={m.id} type="button" onClick={() => setMethod(m.id)}
                          className={cn(
                            "flex-1 rounded-xl py-2.5 text-center text-[12px] transition-all",
                            method === m.id
                              ? "bg-white/[0.10] ring-1 ring-white/25 text-white/90"
                              : "bg-white/[0.03] ring-1 ring-white/[0.06] text-white/40 hover:bg-white/[0.06]",
                          )}>
                          <span className="block text-[14px] mb-0.5">{m.icon}</span>
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] text-white/25 mb-2">When works best?</p>
                    <div className="flex gap-2">
                      {ADVISOR_TIMING.map((t) => (
                        <button key={t.id} type="button" onClick={() => setTiming(t.id)}
                          className={cn(
                            "flex-1 rounded-xl py-2 text-center text-[12px] transition-all",
                            timing === t.id
                              ? "bg-white text-black font-medium"
                              : "bg-white/[0.03] ring-1 ring-white/[0.06] text-white/40 hover:bg-white/[0.06]",
                          )}>
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] text-white/25 mb-1.5">Note <span className="text-white/15">(optional)</span></p>
                    <textarea value={note} onChange={(e) => setNote(e.target.value.slice(0, 200))}
                      maxLength={200} rows={2} placeholder="Anything we should know before we call?"
                      className="w-full rounded-xl bg-white/[0.04] ring-1 ring-white/[0.08] px-3.5 py-2.5 text-[13px] text-white/85 placeholder:text-white/20 outline-none focus:ring-white/20 transition resize-none" />
                  </div>

                  <button onClick={handleSubmit} disabled={submitting}
                    className="w-full rounded-xl py-3 text-[14px] font-medium bg-white text-black hover:bg-white/90 transition flex items-center justify-center gap-2 disabled:opacity-60">
                    {submitting ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black" /> : null}
                    {submitting ? "Sending…" : "Request callback"}
                  </button>
                </div>
              ) : (
                <div className="p-6 text-center space-y-4">
                  <div className="mx-auto w-10 h-10 rounded-full bg-emerald-500/15 flex items-center justify-center">
                    <Check size={18} className="text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-[16px] font-medium text-white/90">We&apos;ll be in touch</h3>
                    <p className="text-[12px] text-white/40 mt-1">
                      A Creator Hive advisor will reach out via {method === "call" ? "phone" : method === "whatsapp" ? "WhatsApp" : "email"}{" "}
                      {timing === "today" ? "today" : timing === "tomorrow" ? "tomorrow" : "this week"}.
                    </p>
                  </div>
                  <button onClick={reset}
                    className="rounded-xl px-6 py-2.5 text-[13px] bg-white/[0.08] ring-1 ring-white/[0.10] text-white/70 hover:bg-white/[0.12] transition">
                    Close
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
