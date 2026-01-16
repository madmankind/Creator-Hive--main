"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Sidebar from "@/components/agency/Sidebar";
import { ReactNode } from "react";

export function DashboardLayoutClient({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  
  // For Manage mode, render without sidebar (full-viewport canvas)
  const isManageMode = pathname === "/dashboard/campaigns" && mode === "manage";

  if (isManageMode) {
    // Full-viewport layout for Manage - no sidebar, no reserved space
    // Use fixed positioning + opaque base to prevent any bleed from other routes/layouts.
    // NO page scroll: overflow-hidden prevents document scroll; internal components manage their own scroll.
    return (
      <div 
        className="fixed inset-0 w-screen h-screen overflow-hidden"
        style={{
          background: "#07070A",
          zIndex: 1,
          overscrollBehavior: "none",
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

