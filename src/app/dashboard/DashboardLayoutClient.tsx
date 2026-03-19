"use client";

import { ReactNode, Suspense } from "react";
import { BottomDock } from "@/components/nav/BottomDock";
import { DesktopSidebar } from "@/components/nav/DesktopSidebar";

function DashboardLayoutInner({ children }: { children: ReactNode }) {
  return (
    <div
      className="min-h-screen w-screen"
      style={{ background: "#07070B", color: "rgba(255,255,255,0.88)" }}
    >
      {/* Desktop sidebar — hidden below lg, shows at lg+ */}
      <DesktopSidebar />

      {/* Main content — offset left by sidebar width on desktop */}
      <main
        className="lg:pl-[72px]"
        style={{ minHeight: "100vh" }}
      >
        {children}
      </main>

      {/* Mobile bottom dock — hidden at lg+ via CSS inside BottomDock */}
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
