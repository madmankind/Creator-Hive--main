"use client";

import { ReactNode, Suspense } from "react";
import { BottomDock } from "@/components/nav/BottomDock";

function DashboardLayoutInner({ children }: { children: ReactNode }) {
  return (
    <div
      className="min-h-screen w-screen"
      style={{ background: "#07070B", color: "rgba(255,255,255,0.88)" }}
    >
      {/* Main content — full width, bottom dock navigation only */}
      <main style={{ minHeight: "100vh" }}>
        {children}
      </main>

      {/* Bottom dock — always visible on all screen sizes */}
      <BottomDock />
    </div>
  );
}

export function DashboardLayoutClient({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen w-screen" style={{ background: "#07070B" }} />}>
      <DashboardLayoutInner>{children}</DashboardLayoutInner>
    </Suspense>
  );
}
