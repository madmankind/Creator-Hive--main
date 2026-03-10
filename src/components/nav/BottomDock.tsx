"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { BarChart3, Users, CreditCard, Home } from "lucide-react";
import { feyTokens } from "@/lib/fey-design-tokens";
import { Suspense } from "react";

const MAIN_ITEMS = [
  { id: "home",   label: "Home",   icon: Home,       route: "/",                               isExternal: true },
  { id: "track",  label: "Track",  icon: BarChart3,  route: "/dashboard/campaigns?mode=track" },
  { id: "manage", label: "Manage", icon: Users,      route: "/dashboard/campaigns?mode=manage" },
  { id: "pay",    label: "Pay",    icon: CreditCard, route: "/dashboard/campaigns?mode=pay" },
];

function BottomDockInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentMode = searchParams.get("mode") || "track";

  const isActive = (id: string) => {
    if (id === "home") return pathname === "/";
    return pathname === "/dashboard/campaigns" && currentMode === id;
  };

  const isHiveActive = pathname === "/dashboard/campaigns" && currentMode === "discover";

  return (
    <div className="fixed left-0 right-0 bottom-0 z-50" style={{ height: "88px", pointerEvents: "none" }}>
      <div className="absolute left-1/2 -translate-x-1/2 bottom-6 flex items-center gap-3" style={{ pointerEvents: "auto" }}>

        {/* ── Main pill: Home / Track / Manage / Pay ── */}
        <div
          className="flex items-center gap-1 rounded-full px-2 py-2"
          style={{
            background: "rgba(12,12,18,0.88)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
        >
          {MAIN_ITEMS.map((item) => {
            const active = isActive(item.id);
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => router.push(item.route)}
                className="flex flex-col items-center justify-center rounded-full transition-all duration-200"
                style={{
                  width: "64px",
                  height: "56px",
                  background: active ? "rgba(255,255,255,0.12)" : "transparent",
                  color: active ? feyTokens.colors.text.primary : feyTokens.colors.text.muted,
                }}
                onMouseEnter={(e) => {
                  if (!active) { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = feyTokens.colors.text.secondary; }
                }}
                onMouseLeave={(e) => {
                  if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = feyTokens.colors.text.muted; }
                }}
              >
                <Icon size={20} />
                <span className="text-[10px] font-medium mt-0.5"
                  style={{ color: active ? feyTokens.colors.text.primary : feyTokens.colors.text.muted }}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Hive circle button ── */}
        <button
          onClick={() => router.push("/dashboard/campaigns?mode=discover")}
          className="flex flex-col items-center justify-center rounded-full transition-all duration-200 relative flex-shrink-0"
          style={{
            width: "64px",
            height: "64px",
            background: isHiveActive
              ? "rgba(251,176,36,0.18)"
              : "rgba(12,12,18,0.88)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: isHiveActive
              ? "1px solid rgba(251,176,36,0.45)"
              : "1px solid rgba(255,255,255,0.10)",
            boxShadow: isHiveActive
              ? "0 0 24px rgba(251,176,36,0.25), 0 8px 32px rgba(0,0,0,0.5)"
              : "0 8px 32px rgba(0,0,0,0.5)",
            color: isHiveActive ? "rgba(251,176,36,0.95)" : feyTokens.colors.text.muted,
          }}
          onMouseEnter={(e) => {
            if (!isHiveActive) {
              e.currentTarget.style.background = "rgba(251,176,36,0.08)";
              e.currentTarget.style.borderColor = "rgba(251,176,36,0.30)";
              e.currentTarget.style.color = "rgba(251,176,36,0.75)";
            }
          }}
          onMouseLeave={(e) => {
            if (!isHiveActive) {
              e.currentTarget.style.background = "rgba(12,12,18,0.88)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)";
              e.currentTarget.style.color = feyTokens.colors.text.muted;
            }
          }}
        >
          {/* Honeycomb SVG icon */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L19.5 6.5V15.5L12 20L4.5 15.5V6.5L12 2Z"/>
            <path d="M12 8L16 10.5V15.5L12 18L8 15.5V10.5L12 8Z" strokeWidth="1"/>
          </svg>
          <span className="text-[10px] font-medium mt-0.5">Hive</span>
        </button>

      </div>
    </div>
  );
}

export function BottomDock() {
  return (
    <Suspense fallback={null}>
      <BottomDockInner />
    </Suspense>
  );
}
