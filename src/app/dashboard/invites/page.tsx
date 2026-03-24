'use client';
import useSWR from 'swr';
import { useState } from 'react';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { feyTokens } from '@/lib/fey-design-tokens';
import { Check, X, Clock } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function InvitesPage() {
  const { data, isLoading, mutate } = useSWR('/api/creator/invites', fetcher);
  const invites = data?.data ?? [];
  const [submitting, setSubmitting] = useState<string | null>(null);

  const respond = async (id: string, action: 'ACCEPT' | 'DECLINE') => {
    setSubmitting(id);
    try {
      await fetch(`/api/creator/invites/${id}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      await mutate();
    } finally {
      setSubmitting(null);
    }
  };

  const headerLeft = (
    <span className="text-[14px] font-medium tracking-[-0.01em]" style={{ color: feyTokens.colors.text.primary }}>
      Campaign Invites
    </span>
  );

  return (
    <DashboardShell headerLeft={headerLeft}>
      <div className="space-y-3 max-w-2xl">
        {isLoading ? (
          <div className="space-y-3">
            {[0,1,2].map((i) => (
              <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.03)' }} />
            ))}
          </div>
        ) : invites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <Clock size={28} style={{ color: feyTokens.colors.text.label, opacity: 0.5 }} />
            <p className="text-[13px]" style={{ color: feyTokens.colors.text.muted }}>No invites yet</p>
            <p className="text-[12px]" style={{ color: feyTokens.colors.text.label }}>When a brand books you, invites appear here</p>
          </div>
        ) : (
          invites.map((inv: any) => {
            const isPending = inv.status === 'PENDING';
            return (
              <div key={inv.id} className="rounded-2xl px-5 py-4"
                style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[14px] font-medium mb-0.5 truncate" style={{ color: feyTokens.colors.text.primary }}>{inv.campaignTitle}</p>
                    <div className="flex items-center gap-3 text-[12px]" style={{ color: feyTokens.colors.text.muted }}>
                      {inv.agencyName && <span>{inv.agencyName}</span>}
                      {inv.campaignDueDate && <span>Due {new Date(inv.campaignDueDate).toLocaleDateString('en-AE', { month: 'short', day: 'numeric' })}</span>}
                    </div>
                    {inv.note && <p className="text-[12px] mt-1.5 font-light" style={{ color: feyTokens.colors.text.muted }}>"{inv.note}"</p>}
                  </div>
                  {isPending ? (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => respond(inv.id, 'ACCEPT')}
                        disabled={submitting === inv.id}
                        className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-[12px] font-medium transition-all disabled:opacity-40"
                        style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.30)', color: '#34d399' }}
                      >
                        <Check size={12} /> Accept
                      </button>
                      <button
                        onClick={() => respond(inv.id, 'DECLINE')}
                        disabled={submitting === inv.id}
                        className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-[12px] font-medium transition-all disabled:opacity-40"
                        style={{ background: 'rgba(229,72,77,0.08)', border: '1px solid rgba(229,72,77,0.22)', color: 'rgba(229,72,77,0.7)' }}
                      >
                        <X size={12} /> Decline
                      </button>
                    </div>
                  ) : (
                    <span className="flex-shrink-0 px-2.5 py-1 rounded-full text-[10px] font-semibold"
                      style={{
                        background: inv.status === 'ACCEPTED' ? 'rgba(16,185,129,0.10)' : 'rgba(229,72,77,0.08)',
                        color: inv.status === 'ACCEPTED' ? '#34d399' : 'rgba(229,72,77,0.7)',
                        border: `1px solid ${inv.status === 'ACCEPTED' ? 'rgba(16,185,129,0.25)' : 'rgba(229,72,77,0.22)'}`,
                      }}>
                      {inv.status.toLowerCase()}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </DashboardShell>
  );
}
