"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Download } from "lucide-react";
import { useMemo, useState } from "react";
import { calculateTalentRate, formatCurrency } from "@/lib/podPricing";
import type { Talent } from "@/store/useCampaignPodStore";
import type { TalentPodConfig } from "@/types/pod";

interface QuotationPreviewProps {
  open: boolean;
  onClose: () => void;
  campaignBrief: string;
  campaignDuration: { start: Date | null; end: Date | null };
  talents: Talent[];
  talentConfigs: Map<string, TalentPodConfig>;
  clientName?: string;
  clientEmail?: string;
}

// Terms & Conditions excerpt (from Creator_Hive_Terms_and_Conditions.pdf)
const TERMS_AND_CONDITIONS = `
TERMS AND CONDITIONS

1. INTRODUCTION
These Terms and Conditions ("Terms") govern your use of the Creator Hive FZE platform ("Platform") and services provided by Creator Hive FZE ("Company", "we", "us", or "our").

2. PAYMENTS
All payments are due net 30 days from invoice date unless otherwise agreed in writing. Late payments may incur interest charges as permitted by law.

3. INTELLECTUAL PROPERTY USAGE RIGHTS
Content created by creators remains the property of the creator unless exclusive usage rights are purchased. Standard usage rights are limited to the campaign scope as defined in the brief.

4. LIABILITY CAP
Our total liability for any claim arising from these Terms shall not exceed the total fees paid for the specific campaign in question.

5. GOVERNING LAW AND ARBITRATION
These Terms are governed by the laws of the United Arab Emirates. Any disputes shall be resolved through arbitration under the rules of the Dubai International Arbitration Centre (DIAC).
`;

export function QuotationPreview({
  open,
  onClose,
  campaignBrief,
  campaignDuration,
  talents,
  talentConfigs,
  clientName = "Client",
  clientEmail = "client@example.com",
}: QuotationPreviewProps) {
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [sent, setSent] = useState(false);

  const quotationNumber = useMemo(() => {
    return `Q-${Date.now().toString().slice(-6)}`;
  }, []);

  const quotationDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const lineItems = useMemo(() => {
    return talents.map((talent) => {
      const config = talentConfigs.get(talent.id);
      if (!config) return null;
      const rate = calculateTalentRate(config);
      const primaryRole = talent.roles[0] || "Creator";
      
      return {
        talent,
        role: primaryRole,
        duration: config.duration,
        engagementType: config.engagementType,
        addOns: config.addOns,
        rate,
      };
    }).filter(Boolean);
  }, [talents, talentConfigs]);

  const subtotal = lineItems.reduce((sum, item) => sum + (item?.rate || 0), 0);
  const vat = subtotal * 0.05; // 5% VAT (UAE standard)
  const grandTotal = subtotal + vat;

  const campaignDays = useMemo(() => {
    if (!campaignDuration.start || !campaignDuration.end) return null;
    const diff = campaignDuration.end.getTime() - campaignDuration.start.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }, [campaignDuration]);

  if (!open) return null;

  const handleSend = async () => {
    setSending(true);
    setSendError("");
    try {
      const res = await fetch("/api/payments/bank-transfer-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: clientName,
          billingEmail: clientEmail,
          amount: grandTotal,
          campaignRef: quotationNumber,
        }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.error || "Failed to send quotation");
      }
      setSent(true);
      setTimeout(() => {
        onClose();
        setSent(false);
      }, 900);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to send quotation";
      setSendError(message);
    } finally {
      setSending(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full max-w-4xl h-[90vh] rounded-3xl bg-[#0F141A]/95 border border-white/10 shadow-2xl overflow-hidden flex flex-col backdrop-blur-xl">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-gradient-to-b from-white/5 to-transparent">
                <div>
                  <h2 className="text-xl font-black text-white/90 uppercase tracking-wider">
                    Quotation Preview
                  </h2>
                  <div className="text-xs text-white/50 mt-0.5">Creator Hive FZE</div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-sm font-medium text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    Download PDF
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/60 hover:bg-white/10 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Content - Scrollable */}
              <div className="flex-1 overflow-y-auto p-8">
                {/* Company Header */}
                <div className="mb-8">
                  <div className="text-2xl font-black text-white mb-2">Creator Hive FZE</div>
                  <div className="text-xs text-white/60">
                    Premium Talent Marketplace & Campaign Management
                  </div>
                </div>

                {/* Quotation Details */}
                <div className="grid grid-cols-2 gap-8 mb-8">
                  <div>
                    <div className="text-xs font-bold text-white/70 uppercase tracking-wider mb-2">
                      Quotation To
                    </div>
                    <div className="text-sm text-white/90 font-medium">{clientName}</div>
                    <div className="text-xs text-white/60">{clientEmail}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-white/70 uppercase tracking-wider mb-2">
                      Quotation Details
                    </div>
                    <div className="text-sm text-white/90 font-medium">#{quotationNumber}</div>
                    <div className="text-xs text-white/60">Date: {quotationDate}</div>
                  </div>
                </div>

                {/* Campaign Summary */}
                {campaignBrief && (
                  <div className="mb-8 p-4 rounded-lg bg-white/5 border border-white/10">
                    <div className="text-xs font-bold text-white/70 uppercase tracking-wider mb-2">
                      Campaign Brief
                    </div>
                    <div className="text-sm text-white/80 whitespace-pre-wrap">{campaignBrief}</div>
                  </div>
                )}

                {campaignDays && (
                  <div className="mb-8 text-sm text-white/70">
                    <span className="font-medium">Campaign Duration:</span> {campaignDays} days
                    {campaignDuration.start && campaignDuration.end && (
                      <span className="ml-2">
                        ({campaignDuration.start.toLocaleDateString()} - {campaignDuration.end.toLocaleDateString()})
                      </span>
                    )}
                  </div>
                )}

                {/* Line Items Table */}
                <div className="mb-8">
                  <div className="text-xs font-bold text-white/70 uppercase tracking-wider mb-4">
                    Line Items
                  </div>
                  <div className="rounded-lg border border-white/10 overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-white/5">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-bold text-white/80 uppercase tracking-wider">
                            Talent
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-white/80 uppercase tracking-wider">
                            Role
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-white/80 uppercase tracking-wider">
                            Duration
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-white/80 uppercase tracking-wider">
                            Engagement
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-bold text-white/80 uppercase tracking-wider">
                            Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {lineItems.map((item, index) => {
                          if (!item) return null;
                          return (
                            <tr
                              key={item.talent.id}
                              className={index % 2 === 0 ? "bg-white/2" : "bg-white/5"}
                            >
                              <td className="px-4 py-3 text-sm text-white/90 font-medium">
                                {item.talent.name}
                              </td>
                              <td className="px-4 py-3 text-xs text-white/70">{item.role}</td>
                              <td className="px-4 py-3 text-xs text-white/70">
                                {item.duration} days
                              </td>
                              <td className="px-4 py-3 text-xs text-white/70 capitalize">
                                {item.engagementType.replace("-", " ")}
                              </td>
                              <td className="px-4 py-3 text-sm text-white/90 font-bold text-right">
                                {formatCurrency(item.rate)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Totals */}
                <div className="mb-8 flex justify-end">
                  <div className="w-80 space-y-2">
                    <div className="flex items-center justify-between text-sm text-white/80">
                      <span>Subtotal</span>
                      <span className="font-bold">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-white/80">
                      <span>VAT (5%)</span>
                      <span className="font-bold">{formatCurrency(vat)}</span>
                    </div>
                    <div className="pt-2 border-t-2 border-white/20 flex items-center justify-between">
                      <span className="text-base font-black text-white uppercase tracking-wider">
                        Grand Total
                      </span>
                      <span className="text-xl font-black text-white">
                        {formatCurrency(grandTotal)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Terms & Conditions */}
                <div className="mt-12 pt-8 border-t border-white/10">
                  <div className="text-xs font-bold text-white/70 uppercase tracking-wider mb-4">
                    Terms & Conditions
                  </div>
                  <div className="text-xs text-white/60 leading-relaxed whitespace-pre-wrap">
                    {TERMS_AND_CONDITIONS}
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="px-8 py-4 border-t border-white/10 bg-gradient-to-t from-black/20 to-transparent flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg text-sm text-white/70 hover:bg-white/5 transition-colors"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={sending}
                  className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-sm font-black text-white hover:from-emerald-400 hover:to-teal-400 transition-all shadow-lg shadow-emerald-500/20 uppercase tracking-wider"
                >
                  {sending ? "Sending…" : sent ? "Sent" : "Confirm & Send"}
                </button>
              </div>
              {sendError && (
                <div className="px-8 pb-4 text-sm text-red-300">{sendError}</div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}











