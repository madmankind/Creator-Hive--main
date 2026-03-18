"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { BottomDock } from "@/components/nav/BottomDock";
import { ReactNode, Suspense } from "react";

function DashboardLayoutInner({ children }: { children: ReactNode }) {
  return (
    <div
      className="min-h-screen w-screen"
      style={{ background: "#07070B", color: "rgba(255,255,255,0.88)" }}
    >
      {children}
      <BottomDock />
    </div>
  );
}

export function DashboardLayoutClient({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen w-screen" style={{ background: "#07070A" }} />}>
      <DashboardLayoutInner>{children}</DashboardLayoutInner>
    </Suspense>
  );
}

