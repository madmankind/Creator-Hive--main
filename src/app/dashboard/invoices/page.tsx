'use client';
import useSWR from 'swr';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { feyTokens } from '@/lib/fey-design-tokens';
import { Download, FileText } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string }> = {
    PAID:    { bg: 'rgba(16,185,129,0.10)', text: '#34d399' },
    PENDING: { bg: 'rgba(234,179,8,0.09)',  text: 'rgba(253,224,71,0.80)' },
    OVERDUE: { bg: 'rgba(229,72,77,0.09)',  text: 'rgba(229,72,77,0.75)' },
  };
  const s = map[status] ?? map.PENDING;
  return (
    <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold"
      style={{ background: s.bg, color: s.text }}>{status.toLowerCase()}</span>
  );
}

export default function Invoices() {
  const { data } = useSWR('/api/invoices', fetcher);
  const invoices = data?.data ?? [];
  const totalInvoiced = invoices.reduce((s: number, i: any) => s + i.amount, 0);
  const pending = invoices.filter((i: any) => i.status === 'PENDING').reduce((s: number, i: any) => s + i.amount, 0);
  const overdue = invoices.filter((i: any) => i.status === 'OVERDUE').reduce((s: number, i: any) => s + i.amount, 0);

  const headerLeft = (
    <span className="text-[14px] font-medium tracking-[-0.01em]" style={{ color: feyTokens.colors.text.primary }}>Invoices</span>
  );
  const headerRight = (
    <button className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] transition-all"
      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: feyTokens.colors.text.secondary }}>
      <Download size={12} /> Export
    </button>
  );

  return (
    <DashboardShell headerLeft={headerLeft} headerRight={headerRight}>
      <div className="space-y-5">
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Invoiced', value: `AED ${totalInvoiced.toLocaleString()}` },
            { label: 'Pending', value: `AED ${pending.toLocaleString()}`, accent: 'rgba(234,179,8,0.7)' },
            { label: 'Overdue', value: `AED ${overdue.toLocaleString()}`, accent: 'rgba(229,72,77,0.7)' },
          ].map((t) => (
            <div key={t.label} className="rounded-2xl px-5 py-4 relative overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.025)', border: `1px solid ${t.accent ? t.accent + '25' : 'rgba(255,255,255,0.07)'}` }}>
              {t.accent && <div className="absolute inset-x-0 bottom-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${t.accent}, transparent)` }} />}
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] mb-1.5" style={{ color: feyTokens.colors.text.label }}>{t.label}</p>
              <p className="text-[22px] font-light tracking-tight" style={{ color: feyTokens.colors.text.primary }}>{t.value}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="grid px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.12em]"
            style={{ gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr 60px', borderBottom: '1px solid rgba(255,255,255,0.05)', color: feyTokens.colors.text.label }}>
            {['Invoice #', 'Campaign', 'Amount', 'Status', 'Due Date', ''].map((h) => <span key={h}>{h}</span>)}
          </div>
          {invoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 gap-2">
              <FileText size={24} style={{ color: feyTokens.colors.text.label, opacity: 0.4 }} />
              <p className="text-[13px]" style={{ color: feyTokens.colors.text.muted }}>No invoices yet</p>
              <p className="text-[11px]" style={{ color: feyTokens.colors.text.label }}>Invoices appear when a campaign is active</p>
            </div>
          ) : invoices.map((inv: any) => (
            <div key={inv.id}
              className="grid px-5 py-3.5 hover:bg-white/[0.02] transition"
              style={{ gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr 60px', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span className="text-[13px] font-medium" style={{ color: feyTokens.colors.text.primary }}>{inv.id.slice(0,8).toUpperCase()}</span>
              <span className="text-[13px] truncate pr-2" style={{ color: feyTokens.colors.text.secondary }}>{inv.campaign?.title || 'Campaign'}</span>
              <span className="text-[13px] font-medium tabular-nums" style={{ color: feyTokens.colors.text.primary }}>AED {inv.amount.toLocaleString()}</span>
              <StatusBadge status={inv.status} />
              <span className="text-[12px]" style={{ color: feyTokens.colors.text.muted }}>
                {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('en-AE', { month: 'short', day: 'numeric' }) : '—'}
              </span>
              <button className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:bg-white/10"
                style={{ color: feyTokens.colors.text.label }}>
                <Download size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
