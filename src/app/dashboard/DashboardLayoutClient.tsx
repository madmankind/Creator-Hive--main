"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Sidebar from "@/components/agency/Sidebar";
import { ReactNode } from "react";

export function DashboardLayoutClient({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  
  // For ALL campaign modes (track, manage, pay, discover), render without sidebar (full-viewport Fey unified dashboard)
  const isCampaignMode = pathname === "/dashboard/campaigns" && 
    (mode === "track" || mode === "manage" || mode === "pay" || mode === "discover" || !mode);

  if (isCampaignMode) {
    // Full-viewport layout for Fey unified dashboard - no sidebar, scrollable
    return (
      <div 
        className="min-h-screen w-screen"
        style={{
          background: "#07070A",
          zIndex: 1,
        }}
      >
        {children}
      </div>
    );
  }

  // For other dashboard routes, use sidebar layout
  return (
    <div className="flex min-h-screen bg-[#F6F7FB] text-slate-900">
      <Sidebar />
      <main className="flex-1 min-w-0">
        {children}
      </main>
    </div>
  );
}

