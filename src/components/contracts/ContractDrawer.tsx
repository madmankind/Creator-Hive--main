"use client";

import { useState, useEffect, type CSSProperties } from "react";
import { FileText, CheckCircle2, Clock, DollarSign, ChevronDown, ChevronUp } from "lucide-react";
import { RightDrawer } from "@/components/campaigns/primitives/RightDrawer";
import { feyTokens } from "@/lib/fey-design-tokens";

interface Milestone {
  id: string; title: string; description?: string | null;
  amount: number; currency: string; status: string; dueDate?: string | null;
}
interface Contract {
  id: string; title: string; content: string; status: string;
  totalAmount?: number | null; currency: string;
  agencySignedAt?: string | null; creatorSignedAt?: string | null;
  agencySignature?: string | null; creatorSignature?: string | null;
  createdAt: string; milestones: Milestone[];
  creator?: { name: string; avatarUrl?: string | null };
}
interface ContractDrawerProps {
  isOpen: boolean; onClose: () => void;
  campaignId?: string; campaignName?: string; contractId?: string;
}

const GLASS: CSSProperties = { background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:14 };
const S: Record<string,{label:string;color:string;bg:string}> = {
  DRAFT:         {label:"Draft",         color:"rgba(255,255,255,0.55)", bg:"rgba(255,255,255,0.06)"},
  SENT:          {label:"Sent",          color:"#60A5FA",                bg:"rgba(96,165,250,0.12)"},
  AGENCY_SIGNED: {label:"Agency signed", color:"#F59E0B",                bg:"rgba(245,158,11,0.12)"},
  FULLY_SIGNED:  {label:"Active",        color:"#10B981",                bg:"rgba(16,185,129,0.12)"},
  COMPLETED:     {label:"Completed",     color:"#A78BFA",                bg:"rgba(167,139,250,0.12)"},
  CANCELLED:     {label:"Cancelled",     color:"#EF4444",                bg:"rgba(239,68,68,0.10)"},
};
const MI: Record<string,React.ElementType> = { PENDING:Clock, FUNDED:DollarSign, IN_PROGRESS:Clock, SUBMITTED:FileText, APPROVED:CheckCircle2, RELEASED:CheckCircle2 };
const MC: Record<string,string> = { PENDING:"rgba(255,255,255,0.35)", FUNDED:"#60A5FA", IN_PROGRESS:"#F59E0B", SUBMITTED:"#F472B6", APPROVED:"#10B981", RELEASED:"#A78BFA" };

function fmtAED(cents:number, cur="AED") { return `${cur} ${(cents/100).toLocaleString("en-AE",{minimumFractionDigits:0})}`; }
function fmtDate(s:string) { return new Date(s).toLocaleDateString("en-AE",{month:"short",day:"numeric",year:"numeric"}); }

function ContractCard({contract}:{contract:Contract}) {
  const [open,setOpen]=useState(false);
  const [signing,setSigning]=useState(false);
  const [signed,setSigned]=useState(false);
  const cfg = S[contract.status] ?? S.DRAFT;
  const released = contract.milestones.filter(m=>["RELEASED","APPROVED"].includes(m.status)).length;

  const sign = async () => {
    setSigning(true);
    try { await fetch(`/api/contracts/${contract.id}/sign`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({signature:"Signed electronically"})}); setSigned(true); }
    finally { setSigning(false); }
  };

  return (
    <div className="rounded-2xl overflow-hidden" style={GLASS}>
      <div className="p-4 cursor-pointer select-none" onClick={()=>setOpen(v=>!v)}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-3.5 h-3.5 shrink-0" style={{color:"rgba(255,255,255,0.35)"}} />
              <p className="text-[13px] font-medium text-white/85 truncate">{contract.title}</p>
            </div>
            {contract.creator && <p className="text-[11px] text-white/38 mb-1.5">With {contract.creator.name}</p>}
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="rounded-full px-2 py-0.5 text-[10px] font-medium" style={{background:cfg.bg,color:cfg.color}}>{signed?"Active":cfg.label}</span>
              {contract.totalAmount && <span className="text-[11px] text-white/45">{fmtAED(contract.totalAmount,contract.currency)}</span>}
              {contract.milestones.length>0 && <span className="text-[11px] text-white/35">{released}/{contract.milestones.length} milestones</span>}
              <span className="text-[10px] text-white/25">{fmtDate(contract.createdAt)}</span>
            </div>
          </div>
          <div className="text-white/25 shrink-0">{open?<ChevronUp className="w-4 h-4"/>:<ChevronDown className="w-4 h-4"/>}</div>
        </div>
      </div>
      {open && (
        <div className="px-4 pb-4 border-t space-y-4" style={{borderColor:"rgba(255,255,255,0.06)"}}>
          {/* SOW */}
          <div className="pt-3">
            <p className="text-[10px] uppercase tracking-wider text-white/28 mb-2">Statement of Work</p>
            <pre className="text-[11px] text-white/55 whitespace-pre-wrap leading-relaxed font-mono" style={{maxHeight:160,overflow:"auto"}}>{contract.content}</pre>
          </div>
          {/* Signatures */}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-white/28 mb-2">Signatures</p>
            <div className="grid grid-cols-2 gap-2">
              {[{label:"Agency",signed:!!contract.agencySignedAt,sig:contract.agencySignature},{label:"Creator",signed:!!contract.creatorSignedAt||signed,sig:contract.creatorSignature}].map(s=>(
                <div key={s.label} className="rounded-xl px-3 py-2.5"
                  style={{background:s.signed?"rgba(16,185,129,0.07)":"rgba(255,255,255,0.03)",border:`1px solid ${s.signed?"rgba(16,185,129,0.22)":"rgba(255,255,255,0.07)"}`}}>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <CheckCircle2 className="w-3 h-3" style={{color:s.signed?"#10B981":"rgba(255,255,255,0.20)"}} />
                    <span className="text-[11px] text-white/60">{s.label}</span>
                  </div>
                  <p className="text-[10px]" style={{color:s.signed?"#10B981":"rgba(255,255,255,0.28)"}}>{s.signed?(s.sig??"Signed"):"Pending"}</p>
                </div>
              ))}
            </div>
            {(contract.status==="SENT"||contract.status==="DRAFT")&&!signed&&(
              <button onClick={sign} disabled={signing} className="mt-2.5 w-full rounded-full py-2 text-[12px] font-medium transition"
                style={{background:"rgba(124,92,255,0.18)",color:"rgba(167,139,250,0.92)",boxShadow:"0 0 0 1px rgba(124,92,255,0.35)"}}>
                {signing?"Signing…":"Sign contract"}
              </button>
            )}
          </div>
          {/* Milestones */}
          {contract.milestones.length>0 && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-white/28 mb-2">Milestones</p>
              <div className="space-y-1.5">
                {contract.milestones.map(m=>{
                  const Icon=MI[m.status]??Clock;
                  return (
                    <div key={m.id} className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                      style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)"}}>
                      <Icon className="w-3.5 h-3.5 shrink-0" style={{color:MC[m.status]??"rgba(255,255,255,0.30)"}} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] text-white/75 truncate">{m.title}</p>
                        <p className="text-[10px] text-white/35">{fmtAED(m.amount,m.currency)}{m.dueDate?` · Due ${fmtDate(m.dueDate)}`:""}</p>
                      </div>
                      <span className="text-[10px] text-white/30 shrink-0 capitalize">{m.status.toLowerCase()}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ContractDrawer({isOpen,onClose,campaignId,campaignName}:ContractDrawerProps) {
  const [contracts,setContracts]=useState<Contract[]>([]);
  const [loading,setLoading]=useState(false);

  useEffect(()=>{
    if(!isOpen) return;
    setLoading(true);
    fetch("/api/contracts")
      .then(r=>r.ok?r.json():null)
      .then(data=>{ setContracts(data?.contracts??[]); })
      .catch(()=>setContracts([]))
      .finally(()=>setLoading(false));
  },[isOpen,campaignId]);

  return (
    <RightDrawer isOpen={isOpen} onClose={onClose} title="Contracts" width="520px">
      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] font-medium text-white/80">{campaignName??"All campaigns"}</p>
            <p className="text-[11px] text-white/35 mt-0.5">{loading?"Loading…":`${contracts.length} contract${contracts.length!==1?"s":""}`}</p>
          </div>
          <a href="/dashboard/contracts" className="text-[11px] text-purple-400/70 hover:text-purple-400 transition-colors">View all →</a>
        </div>
        {loading ? (
          <div className="py-8 text-center"><div className="w-5 h-5 rounded-full border-2 border-white/15 border-t-white/60 animate-spin mx-auto" /></div>
        ) : contracts.length===0 ? (
          <div className="py-10 text-center space-y-2">
            <FileText className="w-8 h-8 text-white/15 mx-auto" />
            <p className="text-[13px] text-white/30">No contracts yet</p>
            <p className="text-[11px] text-white/20">Contracts are auto-generated when a campaign is confirmed.</p>
          </div>
        ) : (
          <div className="space-y-3">{contracts.map(c=><ContractCard key={c.id} contract={c}/>)}</div>
        )}
        <p className="text-[10px] text-white/20 pt-2 leading-relaxed">
          Each creator receives an individual contract with milestones pre-configured from your selected payment schedule.
        </p>
      </div>
    </RightDrawer>
  );
}
