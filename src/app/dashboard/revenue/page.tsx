'use client';
import { useState } from 'react';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { feyTokens } from '@/lib/fey-design-tokens';
import { TrendingUp, Clock, CheckCircle2 } from 'lucide-react';

type RevenueItem = { id: string; talent: string; campaign: string; revenue: number; commission: number; net: number; date: string; status: string };
const REVENUE_ITEMS: RevenueItem[] = [];

export default function Revenue() {
  const [selected, setSelected] = useState<string | null>(REVENUE_ITEMS[0]?.id ?? null);
  const item = REVENUE_ITEMS.find((m) => m.id === selected);
  const total = REVENUE_ITEMS.reduce((s, m) => s + m.revenue, 0);
  const net = REVENUE_ITEMS.reduce((s, m) => s + m.net, 0);
  const completed = REVENUE_ITEMS.filter((m) => m.status === 'COMPLETED').reduce((s, m) => s + m.revenue, 0);
  const pending = REVENUE_ITEMS.filter((m) => m.status === 'PENDING').reduce((s, m) => s + m.revenue, 0);

  const headerLeft = (
    <span className="text-[14px] font-medium tracking-[-0.01em]" style={{ color: feyTokens.colors.text.primary }}>Revenue</span>
  );

  return (
    <DashboardShell headerLeft={headerLeft}>
      <div className="space-y-5">
        {/* Summary tiles */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total Revenue', value: `AED ${total.toLocaleString()}`, icon: TrendingUp, accent: 'rgba(124,92,255,0.7)' },
            { label: 'Net Revenue', value: `AED ${net.toLocaleString()}`, icon: TrendingUp, accent: 'rgba(52,211,153,0.7)' },
            { label: 'Completed', value: `AED ${completed.toLocaleString()}`, icon: CheckCircle2, accent: 'rgba(16,185,129,0.6)' },
            { label: 'Pending', value: `AED ${pending.toLocaleString()}`, icon: Clock, accent: 'rgba(234,179,8,0.6)' },
          ].map((t) => (
            <div key={t.label} className="rounded-2xl px-5 py-4 relative overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.025)', border: `1px solid ${t.accent}22` }}>
              <div className="absolute inset-x-0 bottom-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${t.accent}, transparent)` }} />
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] mb-1.5" style={{ color: feyTokens.colors.text.label }}>{t.label}</p>
              <p className="text-[22px] font-light tracking-tight" style={{ color: feyTokens.colors.text.primary }}>{t.value}</p>
            </div>
          ))}
        </div>

        {/* Two-column: list + detail */}
        <div className="flex gap-5 min-h-[420px]">
          {/* Left: list */}
          <div className="w-[280px] flex-shrink-0 space-y-1.5">
            {REVENUE_ITEMS.map((m) => {
              const active = m.id === selected;
              return (
                <button key={m.id} type="button" onClick={() => setSelected(m.id)}
                  className="w-full text-left rounded-2xl px-4 py-3.5 transition-all"
                  style={{
                    background: active ? 'rgba(255,255,255,0.055)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${active ? 'rgba(255,255,255,0.11)' : 'rgba(255,255,255,0.05)'}`,
                  }}>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-[13px] font-medium truncate" style={{ color: feyTokens.colors.text.primary }}>{m.campaign}</p>
                    <p className="text-[13px] font-medium tabular-nums flex-shrink-0" style={{ color: feyTokens.colors.text.primary }}>AED {m.revenue.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[11px]" style={{ color: feyTokens.colors.text.label }}>{m.talent}</p>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold"
                      style={{
                        background: m.status === 'COMPLETED' ? 'rgba(16,185,129,0.10)' : 'rgba(234,179,8,0.10)',
                        color: m.status === 'COMPLETED' ? '#34d399' : '#fde047',
                      }}>{m.status.toLowerCase()}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right: detail */}
          {item ? (
            <div className="flex-1 rounded-2xl px-6 py-5"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="mb-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <h2 className="text-[16px] font-medium mb-0.5" style={{ color: feyTokens.colors.text.primary }}>{item.campaign}</h2>
                <p className="text-[12px]" style={{ color: feyTokens.colors.text.muted }}>{item.talent} · {new Date(item.date).toLocaleDateString('en-AE', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
              </div>
              <div className="space-y-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: feyTokens.colors.text.label }}>Revenue Breakdown</p>
                {[
                  { label: 'Gross revenue', val: `AED ${item.revenue.toLocaleString()}` },
                  { label: 'Platform commission (20%)', val: `−AED ${item.commission.toLocaleString()}`, dim: true },
                ].map((r) => (
                  <div key={r.label} className="flex justify-between items-baseline">
                    <span className="text-[13px]" style={{ color: r.dim ? feyTokens.colors.text.label : feyTokens.colors.text.secondary }}>{r.label}</span>
                    <span className="text-[13px] tabular-nums" style={{ color: r.dim ? feyTokens.colors.text.label : feyTokens.colors.text.secondary }}>{r.val}</span>
                  </div>
                ))}
                <div className="flex justify-between items-baseline pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                  <span className="text-[14px] font-medium" style={{ color: feyTokens.colors.text.primary }}>Net revenue</span>
                  <span className="text-[14px] font-medium tabular-nums" style={{ color: '#34d399' }}>AED {item.net.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ) : REVENUE_ITEMS.length === 0 ? (
            <div className="flex-1 rounded-2xl px-6 py-5 flex flex-col items-center justify-center gap-4 text-center min-h-[300px]"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(124,92,255,0.08)', border: '1px solid rgba(124,92,255,0.2)' }}>
                <TrendingUp size={24} style={{ color: 'rgba(155,127,255,0.7)' }} />
              </div>
              <div>
                <p className="text-[15px] font-medium" style={{ color: feyTokens.colors.text.primary }}>No revenue yet</p>
                <p className="text-[13px] mt-1 font-light max-w-[280px]" style={{ color: feyTokens.colors.text.muted }}>
                  Revenue from completed campaigns will appear here once you start earning.
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </DashboardShell>
  );
}
