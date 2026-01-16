"use client";

import { useEffect } from "react";

interface ModalProps {
  title: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  width?: number;
}

export function Modal({ title, open, onClose, children, width = 520 }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      <div
        className="absolute inset-0"
        style={{ background: "rgba(0,0,0,0.55)" }}
        onMouseDown={onClose}
      />
      <div className="absolute inset-0 flex items-center justify-center p-6">
        <div
          className="relative rounded-[18px] overflow-hidden"
          style={{
            width,
            background: "rgba(12,12,18,0.92)",
            border: "1px solid rgba(255,255,255,0.10)",
            boxShadow: "0 18px 70px rgba(0,0,0,0.70)",
            backdropFilter: "blur(18px)",
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div
            className="px-5 py-4 flex items-center justify-between"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="text-[13px] font-semibold" style={{ color: "rgba(255,255,255,0.90)" }}>
              {title}
            </div>
            <button
              onClick={onClose}
              className="rounded-full px-2 py-1 text-[11px] font-medium"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.72)",
              }}
            >
              Close
            </button>
          </div>
          <div className="p-5">{children}</div>
        </div>
      </div>
    </div>
  );
}




