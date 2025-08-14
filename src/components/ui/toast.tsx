"use client";
import { useEffect, useState } from "react";

type ToastMessage = { id: number; title: string; description?: string };

let pushToastExternal: ((t: Omit<ToastMessage, "id">) => void) | null = null;
export function pushToast(t: Omit<ToastMessage, "id">) {
  pushToastExternal?.(t);
}

export function ToastViewport() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    pushToastExternal = (t) => setToasts((prev) => [...prev, { id: Date.now(), ...t }]);
    return () => { pushToastExternal = null; };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
      {toasts.map((t) => (
        <div key={t.id} className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--grey-900)] px-4 py-3 shadow">
          <div className="text-sm font-medium">{t.title}</div>
          {t.description && <div className="text-xs text-[color:var(--color-muted-foreground)]">{t.description}</div>}
        </div>
      ))}
    </div>
  );
}


