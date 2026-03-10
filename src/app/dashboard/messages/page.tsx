'use client';
import { useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { feyTokens } from '@/lib/fey-design-tokens';
import { Send, Pencil } from 'lucide-react';
import { Suspense } from 'react';

const MOCK_MESSAGES = [
  { id: '1', from: 'Sarah Chen', subject: 'Deliverables ready for review', preview: 'Hi! The first set of campaign photos are ready…', time: '2h ago', unread: true, body: "Hi! I've completed the first set of photos for the summer campaign. They're ready for review. Let me know if you need any adjustments or want to proceed to the next batch." },
  { id: '2', from: 'Marcus Johnson', subject: 'Question about video specs', preview: 'Quick question on resolution requirements…', time: '1d ago', unread: false, body: 'Quick question about the video resolution requirements. Should I deliver in 4K or is 1080p sufficient for the campaign deliverables?' },
  { id: '3', from: 'Emma Rodriguez', subject: 'Available for new campaigns', preview: 'Just wrapped my last project, open for work…', time: '3d ago', unread: false, body: 'Just finished my current project and am now available for new campaigns. Looking forward to collaborating on something new if you have any upcoming briefs!' },
];

function MessagesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const selectedId = searchParams.get('id') || MOCK_MESSAGES[0].id;
  const selected = MOCK_MESSAGES.find((m) => m.id === selectedId);

  const headerLeft = (
    <span className="text-[14px] font-medium tracking-[-0.01em]" style={{ color: feyTokens.colors.text.primary }}>
      Messages
    </span>
  );
  const headerRight = (
    <button
      className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-all"
      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)', color: feyTokens.colors.text.secondary }}
    >
      <Pencil size={12} />
      Compose
    </button>
  );

  return (
    <DashboardShell headerLeft={headerLeft} headerRight={headerRight}>
      <div className="flex gap-5 min-h-[60vh]">
        {/* Message list */}
        <div className="w-[280px] flex-shrink-0 space-y-1">
          {MOCK_MESSAGES.map((m) => {
            const active = m.id === selectedId;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => router.push(`${pathname}?id=${m.id}`)}
                className="w-full text-left rounded-2xl px-4 py-3.5 transition-all"
                style={{
                  background: active ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${active ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)'}`,
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[13px] font-medium" style={{ color: m.unread ? feyTokens.colors.text.primary : feyTokens.colors.text.secondary }}>
                    {m.from}
                  </span>
                  <span className="text-[10px]" style={{ color: feyTokens.colors.text.label }}>{m.time}</span>
                </div>
                <p className="text-[12px] mb-0.5 truncate" style={{ color: feyTokens.colors.text.secondary }}>{m.subject}</p>
                <p className="text-[11px] truncate" style={{ color: feyTokens.colors.text.label }}>{m.preview}</p>
                {m.unread && <div className="mt-1.5 w-1.5 h-1.5 rounded-full" style={{ background: 'rgba(124,92,255,0.8)' }} />}
              </button>
            );
          })}
        </div>

        {/* Message detail */}
        <div className="flex-1 min-w-0 rounded-2xl px-6 py-5"
          style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
          {selected ? (
            <>
              <div className="flex items-start justify-between mb-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div>
                  <h2 className="text-[16px] font-medium mb-1" style={{ color: feyTokens.colors.text.primary }}>{selected.subject}</h2>
                  <p className="text-[12px]" style={{ color: feyTokens.colors.text.muted }}>{selected.from} · {selected.time}</p>
                </div>
                <button
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] transition-all"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)', color: feyTokens.colors.text.secondary }}
                >
                  <Send size={11} />
                  Reply
                </button>
              </div>
              <p className="text-[14px] font-light leading-relaxed" style={{ color: feyTokens.colors.text.secondary }}>
                {selected.body}
              </p>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-[13px]" style={{ color: feyTokens.colors.text.label }}>Select a message</p>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}

export default function Messages() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#07070B' }} />}>
      <MessagesContent />
    </Suspense>
  );
}
