'use client';
import { useState } from 'react';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { feyTokens } from '@/lib/fey-design-tokens';
import { TrendingUp, Clock, CheckCircle2 } from 'lucide-react';

const MOCK = [
  { id: 'REV-001', talent: 'Sarah Chen', campaign: 'Summer Product Launch', revenue: 8500, commission: 1700, net: 6800, date: '2024-03-10', status: 'COMPLETED' },
  { id: 'REV-002', talent: 'Marcus Johnson', campaign: 'Brand Awareness', revenue: 6200, commission: 1240, net: 4960, date: '2024-03-12', status: 'PENDING' },
  { id: 'REV-003', talent: 'Sarah Chen', campaign: 'Holiday Video Series', revenue: 4800, commission: 960, net: 3840, date: '2024-02-28', status: 'COMPLETED' },
  { id: 'REV-004', talent: 'Emma Rodriguez', campaign: 'Product Unboxing Series', revenue: 3200, commission: 640, net: 2560, date: '2024-03-05', status: 'COMPLETED' },
];

export default function Revenue() {
  const [selected, setSelected] = useState<string | null>(MOCK[0].id);
  const item = MOCK.find((m) => m.id === selected);
  const total = MOCK.reduce((s, m) => s + m.revenue, 0);
  const net = MOCK.reduce((s, m) => s + m.net, 0);
  const completed = MOCK.filter((m) => m.status === 'COMPLETED').reduce((s, m) => s + m.revenue, 0);
  const pending = MOCK.filter((m) => m.status === 'PENDING').reduce((s, m) => s + m.revenue, 0);

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
            {MOCK.map((m) => {
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
          {item && (
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
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
