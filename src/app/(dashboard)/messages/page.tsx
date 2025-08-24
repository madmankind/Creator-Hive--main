"use client";
import { useState } from "react";

type Thread = { id: string; name: string; last: string };
const THREADS: Thread[] = Array.from({ length: 24 }).map((_, i) => ({ id: `t_${i}`, name: `Brand ${i + 1}`, last: "Let’s align on the deliverables." }));

export default function MessagesPage() {
  const [active, setActive] = useState(THREADS[0].id);
  return (
    <main className="grid grid-cols-12 min-h-[calc(100vh-64px)]">
      <aside className="col-span-4 border-r border-[color:var(--color-border)] overflow-y-auto">
        {THREADS.map((t) => (
          <button key={t.id} onClick={() => setActive(t.id)} className={`w-full text-left px-4 py-3 border-b border-[color:var(--color-border)] ${active === t.id ? "bg-[color:var(--muted)]" : ""}`}>
            <div className="font-medium">{t.name}</div>
            <div className="text-sm text-[color:var(--text-muted)] truncate">{t.last}</div>
          </button>
        ))}
      </aside>
      <section className="col-span-8 grid grid-rows-[1fr_auto]">
        <div className="p-4 space-y-3 overflow-y-auto">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className={`max-w-[70%] p-3 rounded-lg ${i % 2 ? "ml-auto bg-[color:var(--color-accent)]/20" : "bg-[color:var(--muted)]"}`}>
              <div className="text-sm">{i % 2 ? "Sure, sending over the draft now." : "Could you share the storyboard by EOD?"}</div>
            </div>
          ))}
        </div>
        <form className="p-3 flex gap-2 border-t border-[color:var(--color-border)]">
          <input placeholder="Type a message..." className="flex-1 h-10 rounded-md bg-[color:var(--muted)] border border-[color:var(--color-border)] px-3" />
          <button className="h-10 px-4 rounded-md bg-[color:var(--color-accent)] text-black font-medium">Send</button>
        </form>
      </section>
    </main>
  );
}

