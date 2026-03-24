'use client';
import useSWR from 'swr';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { feyTokens } from '@/lib/fey-design-tokens';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function PaymentsPage() {
  const { data, isLoading } = useSWR('/api/wallet/transactions', fetcher);
  const rows = data?.data ?? [];

  const headerLeft = (
    <span className="text-[14px] font-medium tracking-[-0.01em]" style={{ color: feyTokens.colors.text.primary }}>Payments Ledger</span>
  );

  return (
    <DashboardShell headerLeft={headerLeft}>
      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="grid px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.12em]"
          style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr', borderBottom: '1px solid rgba(255,255,255,0.05)', color: feyTokens.colors.text.label }}>
          {['Description', 'Type', 'Amount', 'Status'].map((h) => <span key={h}>{h}</span>)}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-14">
            <p className="text-[13px]" style={{ color: feyTokens.colors.text.muted }}>Loading…</p>
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <p className="text-[13px]" style={{ color: feyTokens.colors.text.muted }}>No transactions yet</p>
            <p className="text-[11px]" style={{ color: feyTokens.colors.text.label }}>Payments appear when a campaign is funded</p>
          </div>
        ) : rows.map((r: any) => {
          const isPayout = r.type === 'PAYOUT';
          return (
            <div key={r.id} className="grid px-5 py-3.5 hover:bg-white/[0.02] transition items-center"
              style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: isPayout ? 'rgba(229,72,77,0.08)' : 'rgba(52,211,153,0.08)' }}>
                  {isPayout ? <ArrowUpRight size={13} style={{ color: '#E5484D' }} /> : <ArrowDownLeft size={13} style={{ color: '#10B981' }} />}
                </div>
                <div>
                  <p className="text-[13px]" style={{ color: feyTokens.colors.text.secondary }}>{r.description || r.stripeObjectId || r.id}</p>
                  <p className="text-[10px]" style={{ color: feyTokens.colors.text.label }}>{r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-AE', { month: 'short', day: 'numeric' }) : '—'}</p>
                </div>
              </div>
              <span className="text-[11px] capitalize" style={{ color: feyTokens.colors.text.muted }}>{r.type?.toLowerCase()}</span>
              <span className="text-[13px] font-medium tabular-nums" style={{ color: isPayout ? '#E5484D' : '#10B981' }}>
                {isPayout ? '−' : '+'}AED {(r.amount / 100).toLocaleString()}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full w-fit"
                style={{ background: r.status === 'COMPLETED' ? 'rgba(16,185,129,0.08)' : 'rgba(234,179,8,0.08)', color: r.status === 'COMPLETED' ? '#34d399' : '#fde047' }}>
                {r.status?.toLowerCase()}
              </span>
            </div>
          );
        })}
      </div>
    </DashboardShell>
  );
}
