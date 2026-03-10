"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { BarChart3, Users, CreditCard, Search, Home } from "lucide-react";
import { feyTokens } from "@/lib/fey-design-tokens";

interface DockItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  route: string;
  isExternal?: boolean;
}

const dockItems: DockItem[] = [
  { id: "home",    label: "Home",     icon: Home,       route: "/",                                    isExternal: true },
  { id: "track",   label: "Track",    icon: BarChart3,  route: "/dashboard/campaigns?mode=track" },
  { id: "manage",  label: "Manage",   icon: Users,      route: "/dashboard/campaigns?mode=manage" },
  { id: "pay",     label: "Pay",      icon: CreditCard, route: "/dashboard/campaigns?mode=pay" },
  { id: "discover",label: "Discover", icon: Search,     route: "/dashboard/campaigns?mode=discover" },
];

export function BottomDock() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentMode = searchParams.get("mode") || "track";

  const isActive = (item: DockItem) => {
    if (item.id === "home") return pathname === "/";
    if (["track", "manage", "pay", "discover"].includes(item.id)) {
      return pathname === "/dashboard/campaigns" && currentMode === item.id;
    }
    return pathname === item.route;
  };

  return (
    <div className="fixed left-0 right-0 bottom-0 z-50" style={{ height: "88px", pointerEvents: "none" }}>
      <div
        className="absolute left-1/2 -translate-x-1/2 bottom-6 flex items-center gap-1 rounded-full px-2 py-2"
        style={{
          pointerEvents: "auto",
          background: "rgba(12,12,18,0.85)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        {dockItems.map((item) => {
          const active = isActive(item);
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
                if (!active) {
                  e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                  e.currentTarget.style.color = feyTokens.colors.text.secondary;
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = feyTokens.colors.text.muted;
                }
              }}
            >
              <Icon size={20} />
              <span
                className="text-[10px] font-medium mt-0.5"
                style={{
                  color: active ? feyTokens.colors.text.primary : feyTokens.colors.text.muted,
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
