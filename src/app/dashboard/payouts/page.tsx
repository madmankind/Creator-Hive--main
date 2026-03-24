'use client';
import useSWR from 'swr';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { feyTokens } from '@/lib/fey-design-tokens';
import { CheckCircle, ArrowRight, RefreshCw } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function PayoutsPage() {
  const { data: statusData, mutate } = useSWR('/api/creator/stripe/connect/status', fetcher);
  const status = statusData?.status || 'NOT_STARTED';
  const accountId = statusData?.accountId;
  const isComplete = status === 'COMPLETE';

  const startOnboarding = async () => {
    const res = await fetch('/api/creator/stripe/connect/start', { method: 'POST' });
    const body = await res.json().catch(() => null);
    if (body?.url) window.location.href = body.url;
  };

  const headerLeft = (
    <span className="text-[14px] font-medium tracking-[-0.01em]" style={{ color: feyTokens.colors.text.primary }}>Payouts</span>
  );

  return (
    <DashboardShell headerLeft={headerLeft}>
      <div className="max-w-xl space-y-4">
        {/* Status card */}
        <div className="rounded-2xl px-6 py-5"
          style={{ background: 'rgba(255,255,255,0.025)', border: `1px solid ${isComplete ? 'rgba(52,211,153,0.25)' : 'rgba(255,255,255,0.07)'}` }}>
          <div className="flex items-center gap-3 mb-4">
            {isComplete ? (
              <CheckCircle size={20} style={{ color: '#34d399', flexShrink: 0 }} />
            ) : (
              <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center"
                style={{ background: 'rgba(234,179,8,0.12)', border: '1px solid rgba(234,179,8,0.30)' }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#fde047' }} />
              </div>
            )}
            <div>
              <p className="text-[14px] font-medium" style={{ color: feyTokens.colors.text.primary }}>
                {isComplete ? 'Payout account connected' : 'Connect your payout account'}
              </p>
              <p className="text-[12px]" style={{ color: feyTokens.colors.text.muted }}>
                {isComplete ? 'You\'ll receive payments directly to your bank' : 'Required to receive payments from brand campaigns'}
              </p>
            </div>
          </div>

          {accountId && (
            <p className="text-[11px] px-3 py-2 rounded-lg mb-4 font-mono"
              style={{ background: 'rgba(255,255,255,0.03)', color: feyTokens.colors.text.label }}>
              Account: {accountId}
            </p>
          )}

          <div className="flex items-center gap-3">
            {!isComplete && (
              <button onClick={startOnboarding}
                className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-[13px] font-medium transition-all"
                style={{ background: 'rgba(255,255,255,0.95)', color: '#07070B' }}>
                {status === 'NOT_STARTED' ? 'Start onboarding' : 'Continue onboarding'}
                <ArrowRight size={13} />
              </button>
            )}
            <button onClick={() => mutate()}
              className="flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-[12px] transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: feyTokens.colors.text.muted }}>
              <RefreshCw size={12} /> Refresh
            </button>
          </div>
        </div>

        {/* Info tiles */}
        {!isComplete && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { n: '1', title: 'Connect account', body: 'Link your UAE bank account or card via Stripe' },
              { n: '2', title: 'Verify identity', body: 'KYC verification required by UAE regulations' },
              { n: '3', title: 'Start receiving', body: 'Milestone payments release automatically on approval' },
            ].map((s) => (
              <div key={s.n} className="rounded-xl px-4 py-3"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <p className="text-[10px] font-semibold mb-1" style={{ color: feyTokens.colors.text.label }}>{s.n}</p>
                <p className="text-[12px] font-medium mb-1" style={{ color: feyTokens.colors.text.secondary }}>{s.title}</p>
                <p className="text-[11px] font-light" style={{ color: feyTokens.colors.text.label }}>{s.body}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
