"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Sidebar from "@/components/agency/Sidebar";
import { ReactNode, Suspense } from "react";

function DashboardLayoutInner({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  
  // For ALL campaign modes (track, manage, pay, discover), render without sidebar (full-viewport Fey unified dashboard)
  const isCampaignMode = pathname === "/dashboard/campaigns" && 
    (mode === "track" || mode === "manage" || mode === "pay" || mode === "discover" || !mode);

  // All campaign/dashboard routes use full-viewport Fey dark layout — no sidebar
  return (
    <div
      className="min-h-screen w-screen"
      style={{ background: "#07070B", color: "rgba(255,255,255,0.88)" }}
    >
      {children}
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

