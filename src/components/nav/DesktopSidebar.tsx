"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { BarChart3, Users, CreditCard, Home, Hexagon } from "lucide-react";
import { Suspense, useMemo } from "react";
import { feyTokens } from "@/lib/fey-design-tokens";
import { useSession } from "next-auth/react";

function DesktopSidebarInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentMode = searchParams.get("mode") || "track";
  const { data: session } = useSession();
  const role = (session?.user as { role?: string | null } | undefined)?.role ?? null;

  const navItems = useMemo(() => {
    const homeRoute = role === "CREATOR" ? "/dashboard/creator" : "/";
    return [
      { id: "home", label: "Home", icon: Home, route: homeRoute },
      { id: "track", label: "Track", icon: BarChart3, route: "/dashboard/campaigns?mode=track" },
      { id: "manage", label: "Manage", icon: Users, route: "/dashboard/campaigns?mode=manage" },
      { id: "pay", label: "Pay", icon: CreditCard, route: "/dashboard/campaigns?mode=pay" },
      { id: "discover", label: "Hive", icon: Hexagon, route: "/dashboard/campaigns?mode=discover" },
    ] as const;
  }, [role]);

  const isActive = (id: string) => {
    if (id === "home") {
      if (role === "CREATOR") return pathname === "/dashboard/creator";
      return pathname === "/";
    }
    if (id === "discover") return pathname === "/dashboard/campaigns" && currentMode === "discover";
    return pathname === "/dashboard/campaigns" && currentMode === id;
  };

  return (
    <aside
      className="hidden lg:flex flex-col"
      style={{
        width: "72px",
        minHeight: "100vh",
        background: "rgba(7,7,11,0.95)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 40,
        paddingTop: "20px",
        paddingBottom: "24px",
        alignItems: "center",
        gap: "4px",
      }}
    >
      {/* Logo mark */}
      <div
        style={{
          width: "36px",
          height: "36px",
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "50%",
          background: "rgba(255,255,255,0.07)",
          border: "1px solid rgba(255,255,255,0.10)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-mark.png"
          width={20}
          height={20}
          alt="Creator Hive"
          style={{ opacity: 0.85, objectFit: "contain" }}
        />
      </div>

      {/* Nav items */}
      <nav className="flex flex-col items-center gap-1 flex-1">
        {navItems.map((item) => {
          const active = isActive(item.id);
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => router.push(item.route)}
              title={item.label}
              className="flex flex-col items-center justify-center rounded-xl transition-all duration-150 group relative"
              style={{
                width: "52px",
                height: "52px",
                background: active ? "rgba(255,255,255,0.10)" : "transparent",
                color: active ? feyTokens.colors.text.primary : feyTokens.colors.text.muted,
                border: active ? "1px solid rgba(255,255,255,0.10)" : "1px solid transparent",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
                  (e.currentTarget as HTMLElement).style.color = feyTokens.colors.text.secondary;
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.color = feyTokens.colors.text.muted;
                }
              }}
            >
              <Icon strokeWidth={active ? 1.8 : 1.5} style={{ width: "18px", height: "18px" }} />
              <span
                style={{
                  fontSize: "9px",
                  marginTop: "3px",
                  fontWeight: active ? 500 : 400,
                  letterSpacing: "0.03em",
                  opacity: active ? 0.9 : 0.55,
                }}
              >
                {item.label}
              </span>

              {/* Tooltip on hover */}
              <span
                className="absolute left-full ml-3 px-2 py-1 rounded-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                style={{
                  background: "rgba(15,18,24,0.95)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  fontSize: "12px",
                  color: "rgba(255,255,255,0.85)",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

export function DesktopSidebar() {
  return (
    <Suspense fallback={null}>
      <DesktopSidebarInner />
    </Suspense>
  );
}
