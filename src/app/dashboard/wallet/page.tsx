'use client';
import useSWR from 'swr';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { feyTokens } from '@/lib/fey-design-tokens';
import { ArrowUpRight, ArrowDownLeft, Plus } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function BalanceTile({ label, value, accent, note }: { label: string; value: string; accent?: string; note?: string }) {
  return (
    <div className="rounded-2xl px-5 py-4 relative overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${accent ? accent + '25' : 'rgba(255,255,255,0.07)'}` }}>
      {accent && <div className="absolute inset-x-0 bottom-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />}
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] mb-2" style={{ color: feyTokens.colors.text.label }}>{label}</p>
      <p className="text-[26px] font-light tracking-tight" style={{ color: feyTokens.colors.text.primary, lineHeight: 1 }}>{value}</p>
      {note && <p className="text-[10px] mt-1.5" style={{ color: feyTokens.colors.text.label }}>{note}</p>}
    </div>
  );
}

export default function Wallet() {
  const { data } = useSWR('/api/wallet/transactions', fetcher);
  const txns = data?.data ?? [];
  const totalPaid = txns.filter((t: any) => t.status === 'COMPLETED').reduce((s: number, t: any) => s + t.amount, 0);
  const totalPending = txns.filter((t: any) => t.status === 'PENDING').reduce((s: number, t: any) => s + t.amount, 0);

  const headerLeft = (
    <span className="text-[14px] font-medium tracking-[-0.01em]" style={{ color: feyTokens.colors.text.primary }}>Wallet</span>
  );
  const headerRight = (
    <button className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-[12px] font-medium transition-all"
      style={{ background: 'rgba(255,255,255,0.95)', color: '#07070B' }}>
      <Plus size={13} /> Add Funds
    </button>
  );

  return (
    <DashboardShell headerLeft={headerLeft} headerRight={headerRight}>
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <BalanceTile label="Available Balance" value="AED 5,420" accent="rgba(52,211,153,0.8)" note="Ready to withdraw" />
          <BalanceTile label="Paid Out" value={`AED ${totalPaid.toLocaleString()}`} accent="rgba(124,92,255,0.7)" note="To creators" />
          <BalanceTile label="Pending" value={`AED ${totalPending.toLocaleString()}`} accent="rgba(234,179,8,0.7)" note="Awaiting approval" />
        </div>

        <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="px-5 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: feyTokens.colors.text.label }}>Recent Transactions</p>
          </div>
          {txns.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 gap-2">
              <p className="text-[13px]" style={{ color: feyTokens.colors.text.muted }}>No transactions yet</p>
              <p className="text-[11px]" style={{ color: feyTokens.colors.text.label }}>Fund a campaign to see transactions here</p>
            </div>
          ) : (
            txns.map((t: any) => (
              <div key={t.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.02] transition"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: t.type === 'PAYOUT' ? 'rgba(229,72,77,0.10)' : 'rgba(52,211,153,0.10)' }}>
                    {t.type === 'PAYOUT' ? <ArrowUpRight size={14} style={{ color: '#E5484D' }} /> : <ArrowDownLeft size={14} style={{ color: '#10B981' }} />}
                  </div>
                  <div>
                    <p className="text-[13px] font-medium" style={{ color: feyTokens.colors.text.secondary }}>{t.description || t.invoice?.invoiceNumber || t.id}</p>
                    <p className="text-[11px]" style={{ color: feyTokens.colors.text.label }}>{t.createdAt ? new Date(t.createdAt).toLocaleDateString('en-AE', { month: 'short', day: 'numeric' }) : '—'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[14px] font-medium tabular-nums" style={{ color: t.type === 'PAYOUT' ? '#E5484D' : '#10B981' }}>
                    {t.type === 'PAYOUT' ? '-' : '+'}AED {t.amount.toLocaleString()}
                  </p>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full"
                    style={{ background: t.status === 'COMPLETED' ? 'rgba(16,185,129,0.10)' : 'rgba(234,179,8,0.10)', color: t.status === 'COMPLETED' ? '#10B981' : '#E3A23A' }}>
                    {t.status.toLowerCase()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
