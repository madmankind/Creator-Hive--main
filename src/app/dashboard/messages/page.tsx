'use client';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { feyTokens } from '@/lib/fey-design-tokens';
import { Send, Pencil, X, ArrowRight } from 'lucide-react';
import { Suspense } from 'react';

const MESSAGES: Array<{ id: string; from: string; subject: string; preview: string; time: string; unread: boolean; body: string }> = [];

function MessagesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const selectedId = searchParams.get('id') ?? MESSAGES[0]?.id ?? '';
  const toParam = searchParams.get('to');   // ?to=[creatorId] from "Message" action
  const selected = MESSAGES.find((m) => m.id === selectedId);

  // When ?to=[creatorId] is present, show compose panel for that creator
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeTo, setComposeTo]     = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [composeSent, setComposeSent] = useState(false);

  useEffect(() => {
    if (toParam) {
      // Resolve a display name: in production this would fetch from DB
      setComposeTo(toParam);
      setComposeOpen(true);
    }
  }, [toParam]);

  const handleComposeSend = () => {
    if (!composeBody.trim()) return;
    setComposeSent(true);
    setTimeout(() => {
      setComposeOpen(false);
      setComposeSent(false);
      setComposeBody('');
      // Remove ?to from URL
      router.replace(pathname);
    }, 1400);
  };

  const headerLeft = (
    <span className="text-[14px] font-medium tracking-[-0.01em]" style={{ color: feyTokens.colors.text.primary }}>
      Messages
    </span>
  );
  const headerRight = (
    <button
      onClick={() => setComposeOpen(true)}
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
          {MESSAGES.map((m) => {
            const active = m.id === selectedId && !composeOpen;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => { setComposeOpen(false); router.push(`${pathname}?id=${m.id}`); }}
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

        {/* Message detail / Compose panel */}
        <div className="flex-1 min-w-0 rounded-2xl px-6 py-5"
          style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>

          {/* COMPOSE VIEW */}
          {composeOpen ? (
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <h2 className="text-[15px] font-medium" style={{ color: feyTokens.colors.text.primary }}>
                  {composeSent ? 'Message sent!' : 'New message'}
                </h2>
                <button onClick={() => { setComposeOpen(false); router.replace(pathname); }}
                  className="p-1.5 rounded-lg transition-colors"
                  style={{ background: 'rgba(255,255,255,0.05)', color: feyTokens.colors.text.muted }}>
                  <X size={13} />
                </button>
              </div>

              {!composeSent ? (
                <>
                  {/* To field */}
                  <div className="mb-3">
                    <label className="text-[10px] uppercase tracking-[0.12em] block mb-1.5 font-semibold" style={{ color: 'rgba(255,255,255,0.28)' }}>To</label>
                    <input
                      value={composeTo}
                      onChange={e => setComposeTo(e.target.value)}
                      placeholder="Creator name or ID"
                      className="w-full rounded-xl px-4 py-2.5 text-[13px] font-light outline-none transition-all"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', color: feyTokens.colors.text.primary }}
                    />
                  </div>

                  {/* Message body */}
                  <div className="flex-1 mb-4">
                    <label className="text-[10px] uppercase tracking-[0.12em] block mb-1.5 font-semibold" style={{ color: 'rgba(255,255,255,0.28)' }}>Message</label>
                    <textarea
                      value={composeBody}
                      onChange={e => setComposeBody(e.target.value)}
                      placeholder="Write your message…"
                      rows={6}
                      className="w-full rounded-xl px-4 py-3 text-[13px] font-light outline-none resize-none transition-all"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', color: feyTokens.colors.text.primary }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <a href="/dashboard/contracts"
                        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-medium transition-all"
                        style={{ background: 'rgba(124,92,255,0.12)', border: '1px solid rgba(124,92,255,0.25)', color: 'rgba(167,139,250,0.85)' }}>
                        Send contract
                      </a>
                      <a href="/dashboard/pay"
                        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-medium transition-all"
                        style={{ background: 'rgba(16,185,129,0.10)', border: '1px solid rgba(16,185,129,0.25)', color: '#10B981' }}>
                        Request payment
                      </a>
                    </div>
                    <button
                      onClick={handleComposeSend}
                      disabled={!composeBody.trim() || !composeTo.trim()}
                      className="flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-medium transition-all"
                      style={{
                        background: composeBody.trim() && composeTo.trim() ? 'rgba(255,255,255,0.93)' : 'rgba(255,255,255,0.08)',
                        color: composeBody.trim() && composeTo.trim() ? '#07070B' : 'rgba(255,255,255,0.30)',
                      }}
                    >
                      Send <ArrowRight size={13} />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.28)' }}>
                    <Send size={18} style={{ color: 'rgba(52,211,153,0.9)' }} />
                  </div>
                  <p className="text-[14px]" style={{ color: feyTokens.colors.text.primary }}>Message sent to {composeTo}</p>
                  <p className="text-[12px]" style={{ color: feyTokens.colors.text.muted }}>They'll receive it in their inbox shortly.</p>
                </div>
              )}
            </div>
          ) : selected ? (
            /* THREAD VIEW */
            <>
              <div className="flex items-start justify-between mb-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div>
                  <h2 className="text-[16px] font-medium mb-1" style={{ color: feyTokens.colors.text.primary }}>{selected.subject}</h2>
                  <p className="text-[12px]" style={{ color: feyTokens.colors.text.muted }}>{selected.from} · {selected.time}</p>
                </div>
                <div className="flex items-center gap-2">
                  {[
                    { label: "Send contract", href: "/dashboard/contracts", bg: "rgba(124,92,255,0.12)", color: "rgba(167,139,250,0.85)", border: "rgba(124,92,255,0.25)" },
                    { label: "Request payment", href: "/dashboard/pay", bg: "rgba(16,185,129,0.10)", color: "#10B981", border: "rgba(16,185,129,0.25)" },
                  ].map(btn => (
                    <a key={btn.label} href={btn.href}
                      className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] transition-all font-medium"
                      style={{ background: btn.bg, border: `1px solid ${btn.border}`, color: btn.color }}>
                      {btn.label}
                    </a>
                  ))}
                  <button
                    onClick={() => { setComposeTo(selected.from); setComposeOpen(true); }}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] transition-all"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.09)", color: feyTokens.colors.text.secondary }}
                  >
                    <Send size={11} />
                    Reply
                  </button>
                </div>
              </div>
              <p className="text-[14px] font-light leading-relaxed" style={{ color: feyTokens.colors.text.secondary }}>
                {selected.body}
              </p>
            </>
          ) : MESSAGES.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-4 text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "rgba(124,92,255,0.08)", border: "1px solid rgba(124,92,255,0.2)" }}>
                <Send size={24} style={{ color: "rgba(155,127,255,0.7)" }} />
              </div>
              <div>
                <p className="text-[15px] font-medium" style={{ color: feyTokens.colors.text.primary }}>No conversations yet</p>
                <p className="text-[13px] mt-1 font-light max-w-[280px]" style={{ color: feyTokens.colors.text.muted }}>
                  Messaging with talent and agencies will appear here once you start collaborating on campaigns.
                </p>
              </div>
              <button
                onClick={() => setComposeOpen(true)}
                className="flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-medium transition-all"
                style={{ background: "rgba(124,92,255,0.15)", border: "1px solid rgba(124,92,255,0.35)", color: "rgba(167,139,250,0.95)" }}
              >
                <Pencil size={14} />
                Compose message
              </button>
            </div>
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
