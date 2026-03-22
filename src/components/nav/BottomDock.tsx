"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { BarChart3, Users, CreditCard, Home } from "lucide-react";
import { feyTokens } from "@/lib/fey-design-tokens";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";

function BottomDockInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentMode = searchParams.get("mode") || "track";
  const { data: session } = useSession();
  const role = (session?.user as { role?: string | null } | undefined)?.role ?? null;
  const isSettings = pathname === "/dashboard/settings";

  const mainItems = useMemo(() => {
    const homeRoute = role === "CREATOR" ? "/dashboard/creator" : "/";
    return [
      { id: "home", label: "Home", icon: Home, route: homeRoute },
      { id: "track", label: "Track", icon: BarChart3, route: "/dashboard/campaigns?mode=track" },
      { id: "manage", label: "Manage", icon: Users, route: "/dashboard/campaigns?mode=manage" },
      { id: "pay", label: "Pay", icon: CreditCard, route: "/dashboard/campaigns?mode=pay" },
    ] as const;
  }, [role]);

  const [opacity, setOpacity] = useState(1);
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hovered = useRef(false);
  const [dockHover, setDockHover] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      if (hovered.current || isSettings) return;
      setOpacity(0.18);
      if (scrollTimer.current) clearTimeout(scrollTimer.current);
      scrollTimer.current = setTimeout(() => setOpacity(1), 600);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (scrollTimer.current) clearTimeout(scrollTimer.current);
    };
  }, [isSettings]);

  const isActive = (id: string) => {
    if (id === "home") {
      if (role === "CREATOR") return pathname === "/dashboard/creator";
      return pathname === "/";
    }
    return pathname === "/dashboard/campaigns" && currentMode === id;
  };
  const isHiveSurface = pathname.startsWith("/dashboard/hive");
  const isHiveActive =
    isHiveSurface || (pathname === "/dashboard/campaigns" && currentMode === "discover");

  /** Softer chrome on editorial Hive routes so heroes read cleaner */
  const PILL_STYLE = useMemo(
    () => ({
      background: isHiveSurface ? "rgba(8,8,12,0.48)" : "rgba(12,12,18,0.88)",
      backdropFilter: "blur(22px)",
      WebkitBackdropFilter: "blur(22px)",
      border: isHiveSurface ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(255,255,255,0.08)",
      boxShadow: isHiveSurface
        ? "0 10px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)"
        : "0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)",
    }),
    [isHiveSurface],
  );

  const effectiveOpacity = isSettings
    ? dockHover
      ? 0.92
      : 0.11
    : isHiveSurface && !dockHover && opacity > 0.45
      ? opacity * 0.88
      : opacity;

  return (
    <div
      className="fixed left-0 right-0 bottom-0 z-50"
      style={{ height: "88px", pointerEvents: "none", opacity: effectiveOpacity, transition: "opacity 0.4s ease" }}
      onMouseEnter={() => {
        hovered.current = true;
        if (!isSettings) setOpacity(1);
        if (scrollTimer.current) clearTimeout(scrollTimer.current);
      }}
      onMouseLeave={() => {
        hovered.current = false;
      }}
    >
      <div
        className="absolute left-1/2 bottom-6 flex -translate-x-1/2 items-center gap-3"
        style={{ pointerEvents: "auto" }}
        onMouseEnter={() => setDockHover(true)}
        onMouseLeave={() => setDockHover(false)}
      >
        <div className="flex items-center gap-1 rounded-full px-2 py-2" style={PILL_STYLE}>
          {mainItems.map((item) => {
            const active = isActive(item.id);
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
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
                  className="mt-0.5 text-[10px] font-medium"
                  style={{ color: active ? feyTokens.colors.text.primary : feyTokens.colors.text.muted }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => router.push("/dashboard/hive")}
          className="flex h-16 w-16 flex-shrink-0 flex-col items-center justify-center rounded-full transition-all duration-200"
          style={{
            background: isHiveActive ? "rgba(251,176,36,0.16)" : isHiveSurface ? "rgba(8,8,12,0.48)" : "rgba(12,12,18,0.88)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: isHiveActive ? "1px solid rgba(251,176,36,0.45)" : "1px solid rgba(255,255,255,0.08)",
            boxShadow: isHiveActive
              ? "0 0 20px rgba(251,176,36,0.22), 0 8px 32px rgba(0,0,0,0.5)"
              : isHiveSurface
                ? "0 10px 36px rgba(0,0,0,0.35)"
                : "0 8px 32px rgba(0,0,0,0.5)",
            color: isHiveActive ? "rgba(251,176,36,0.95)" : feyTokens.colors.text.muted,
          }}
          onMouseEnter={(e) => {
            if (!isHiveActive) {
              e.currentTarget.style.background = "rgba(251,176,36,0.07)";
              e.currentTarget.style.borderColor = "rgba(251,176,36,0.28)";
              e.currentTarget.style.color = "rgba(251,176,36,0.70)";
            }
          }}
          onMouseLeave={(e) => {
            if (!isHiveActive) {
              e.currentTarget.style.background = isHiveSurface ? "rgba(8,8,12,0.48)" : "rgba(12,12,18,0.88)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
              e.currentTarget.style.color = feyTokens.colors.text.muted;
            }
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L19.5 6.5V15.5L12 20L4.5 15.5V6.5L12 2Z" />
            <path d="M12 8L16 10.5V15.5L12 18L8 15.5V10.5L12 8Z" strokeWidth="1" />
          </svg>
          <span className="mt-0.5 text-[10px] font-medium">Hive</span>
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
