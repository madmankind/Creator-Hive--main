"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, CheckCircle2, Clock, AlertCircle, ChevronDown, ChevronUp, DollarSign } from "lucide-react";

type Milestone = { id: string; title: string; amount: number; currency: string; status: string; dueDate?: string | null; submissionNote?: string | null };
type Contract = { id: string; title: string; status: string; totalAmount?: number | null; currency: string; agencySignedAt?: string | null; creatorSignedAt?: string | null; agencySignature?: string | null; creatorSignature?: string | null; createdAt: string; milestones: Milestone[]; creator?: { name: string; avatarUrl?: string | null } };

const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  DRAFT:        { label: "Draft",        color: "rgba(255,255,255,0.55)", bg: "rgba(255,255,255,0.06)" },
  SENT:         { label: "Sent",         color: "#60A5FA",                bg: "rgba(96,165,250,0.12)" },
  AGENCY_SIGNED:{ label: "Agency signed",color: "#F59E0B",                bg: "rgba(245,158,11,0.12)" },
  FULLY_SIGNED: { label: "Fully signed", color: "#10B981",                bg: "rgba(16,185,129,0.12)" },
  COMPLETED:    { label: "Completed",    color: "#A78BFA",                bg: "rgba(167,139,250,0.12)" },
  CANCELLED:    { label: "Cancelled",    color: "#EF4444",                bg: "rgba(239,68,68,0.10)" },
};
const M_STATUS_CFG: Record<string, { icon: React.ElementType; color: string }> = {
  PENDING:     { icon: Clock,         color: "rgba(255,255,255,0.40)" },
  FUNDED:      { icon: DollarSign,    color: "#60A5FA" },
  IN_PROGRESS: { icon: Clock,         color: "#F59E0B" },
  SUBMITTED:   { icon: AlertCircle,   color: "#F472B6" },
  APPROVED:    { icon: CheckCircle2,  color: "#10B981" },
  RELEASED:    { icon: CheckCircle2,  color: "#A78BFA" },
  DISPUTED:    { icon: AlertCircle,   color: "#EF4444" },
};

const GLASS: React.CSSProperties = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16 };
function fmtAED(cents: number, currency = "AED") { return `${currency} ${(cents / 100).toLocaleString()}`; }
function fmtDate(s: string) { return new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); }

function ContractCard({ contract, role }: { contract: Contract; role: string }) {
  const [expanded, setExpanded] = useState(false);
  const [signing, setSigning] = useState(false);
  const [signedLocal, setSignedLocal] = useState(false);
  const [releasingId, setReleasingId] = useState<string | null>(null);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [milestones, setMilestones] = useState(contract.milestones);

  const cfg = STATUS_CFG[contract.status] ?? STATUS_CFG.DRAFT;
  const needsCreatorSig = contract.status === "SENT" && role === "CREATOR" && !contract.creatorSignedAt;
  const needsAgencySig = contract.status === "DRAFT" && role === "AGENCY" && !contract.agencySignedAt;

  const sign = async () => {
    setSigning(true);
    const res = await fetch(`/api/contracts/${contract.id}/sign`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ signature: "Signed electronically" }) });
    if (res.ok) setSignedLocal(true);
    setSigning(false);
  };

  const releaseMilestone = async (id: string) => {
    setReleasingId(id);
    const res = await fetch(`/api/milestones/${id}/release`, { method: "POST" });
    if (res.ok) { const { milestone } = await res.json(); setMilestones(prev => prev.map(m => m.id === id ? { ...m, status: milestone.status } : m)); }
    setReleasingId(null);
  };

  const submitMilestone = async (id: string) => {
    setSubmittingId(id);
    const res = await fetch(`/api/milestones/${id}/submit`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ submissionNote: "Work submitted" }) });
    if (res.ok) { const { milestone } = await res.json(); setMilestones(prev => prev.map(m => m.id === id ? { ...m, status: milestone.status } : m)); }
    setSubmittingId(null);
  };

  return (
    <div className="rounded-2xl overflow-hidden" style={GLASS}>
      <div className="p-5 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <FileText className="w-4 h-4 text-white/40 shrink-0" />
              <p className="text-[15px] font-medium text-white/90 truncate">{contract.title}</p>
            </div>
            {contract.creator && <p className="text-[12px] text-white/40 mb-2">With {contract.creator.name}</p>}
            <div className="flex items-center gap-3">
              <span className="rounded-full px-2.5 py-0.5 text-[11px] font-medium" style={{ background: cfg.bg, color: cfg.color }}>{signedLocal ? "Fully signed" : cfg.label}</span>
              {contract.totalAmount && <span className="text-[12px] text-white/55">{fmtAED(contract.totalAmount, contract.currency)}</span>}
              <span className="text-[11px] text-white/30">{fmtDate(contract.createdAt)}</span>
            </div>
          </div>
          <div className="shrink-0 text-white/30">{expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</div>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
            <div className="px-5 pb-5 border-t space-y-4" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              {/* Signature status */}
              <div className="pt-4">
                <p className="text-[11px] uppercase tracking-wider text-white/35 mb-3">Signatures</p>
                <div className="grid grid-cols-2 gap-3">
                  {[ { label: "Agency", signed: !!contract.agencySignedAt, sig: contract.agencySignature }, { label: "Creator", signed: !!contract.creatorSignedAt || signedLocal, sig: contract.creatorSignature } ].map(s => (
                    <div key={s.label} className="rounded-xl px-4 py-3" style={{ background: s.signed ? "rgba(16,185,129,0.08)" : "rgba(255,255,255,0.04)", border: `1px solid ${s.signed ? "rgba(16,185,129,0.25)" : "rgba(255,255,255,0.08)"}` }}>
                      <div className="flex items-center gap-2 mb-1"><CheckCircle2 className="w-3.5 h-3.5" style={{ color: s.signed ? "#10B981" : "rgba(255,255,255,0.25)" }} /><span className="text-[12px] text-white/65">{s.label}</span></div>
                      <p className="text-[11px]" style={{ color: s.signed ? "#10B981" : "rgba(255,255,255,0.35)" }}>{s.signed ? (s.sig ?? "Signed") : "Pending"}</p>
                    </div>
                  ))}
                </div>
                {(needsCreatorSig || needsAgencySig) && !signedLocal && (
                  <button onClick={sign} disabled={signing} className="mt-3 w-full rounded-full py-2.5 text-[13px] font-medium transition" style={{ background: "rgba(124,92,255,0.25)", color: "rgba(167,139,250,0.95)", boxShadow: "0 0 0 1px rgba(124,92,255,0.40)" }}>{signing ? "Signing…" : "Sign contract"}</button>
                )}
              </div>

              {/* Milestones */}
              {milestones.length > 0 && (
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-white/35 mb-3">Milestones</p>
                  <div className="space-y-2">
                    {milestones.map(m => {
                      const mcfg = M_STATUS_CFG[m.status] ?? M_STATUS_CFG.PENDING;
                      const MIcon = mcfg.icon;
                      return (
                        <div key={m.id} className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                          <MIcon className="w-4 h-4 shrink-0" style={{ color: mcfg.color }} />
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] text-white/80 truncate">{m.title}</p>
                            <p className="text-[11px] text-white/40">{fmtAED(m.amount, m.currency)}{m.dueDate ? ` · Due ${fmtDate(m.dueDate)}` : ""}</p>
                          </div>
                          {m.status === "FUNDED" && role === "CREATOR" && (
                            <button onClick={() => submitMilestone(m.id)} disabled={submittingId === m.id} className="text-[11px] rounded-full px-3 py-1.5 font-medium transition" style={{ background: "rgba(167,139,250,0.15)", color: "rgba(167,139,250,0.90)", boxShadow: "0 0 0 1px rgba(124,92,255,0.30)" }}>{submittingId === m.id ? "…" : "Submit"}</button>
                          )}
                          {m.status === "SUBMITTED" && role === "AGENCY" && (
                            <button onClick={() => releaseMilestone(m.id)} disabled={releasingId === m.id} className="text-[11px] rounded-full px-3 py-1.5 font-medium transition" style={{ background: "rgba(16,185,129,0.15)", color: "#10B981", boxShadow: "0 0 0 1px rgba(16,185,129,0.30)" }}>{releasingId === m.id ? "…" : "Release"}</button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ContractsDashboard({ contracts, role }: { contracts: Contract[]; role: string }) {
  return (
    <div className="min-h-screen" style={{ background: "#07070B", color: "rgba(255,255,255,0.88)" }}>
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0, background: "radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.18) 0%, transparent 60%)", opacity: 0.08 }} />
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0, background: "radial-gradient(ellipse at 50% 30%, #7c3aed 0%, #4c1d95 55%, transparent 100%)", filter: "blur(180px)", opacity: 0.09 }} />
      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-12 pb-24">
        <div className="flex items-center gap-3 mb-8">
          <FileText className="w-5 h-5 text-purple-400" />
          <div>
            <h1 className="text-[20px] font-semibold text-white/90">Contracts</h1>
            <p className="text-[13px] text-white/40">Review, sign and manage your agreements</p>
          </div>
        </div>
        {contracts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-white/25 gap-3">
            <FileText className="w-10 h-10" />
            <p className="text-[14px]">No contracts yet</p>
            <p className="text-[12px]">Contracts will appear here when campaigns are confirmed</p>
          </div>
        ) : (
          <div className="space-y-3">
            {contracts.map(c => <ContractCard key={c.id} contract={c} role={role} />)}
          </div>
        )}
      </div>
    </div>
  );
}
