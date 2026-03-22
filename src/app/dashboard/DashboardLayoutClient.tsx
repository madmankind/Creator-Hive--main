"use client";

import { ReactNode, Suspense } from "react";
import { usePathname } from "next/navigation";
import { BottomDock } from "@/components/nav/BottomDock";
import { HomeProfileMenu } from "@/components/nav/HomeProfileMenu";

function DashboardLayoutInner({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const showProfileMenu =
    pathname === "/dashboard/creator" || pathname === "/dashboard/settings";

  return (
    <div
      className="min-h-screen w-screen"
      style={{ background: "#07070B", color: "rgba(255,255,255,0.88)" }}
    >
      {/* Profile menu on talent home & unified settings (not Track / Manage / Pay) */}
      {showProfileMenu ? <HomeProfileMenu /> : null}
      <main style={{ minHeight: "100vh" }}>{children}</main>
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
