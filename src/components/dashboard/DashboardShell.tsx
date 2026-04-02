"use client";

import { ReactNode } from "react";
import { feyTokens } from "@/lib/fey-design-tokens";
import { BottomDock } from "@/components/nav/BottomDock";

interface DashboardShellProps {
  headerLeft?: ReactNode;
  headerRight?: ReactNode;
  /** When true, header renders a single full-width slot */
  headerFullWidth?: boolean;
  /** When true, children bypass the max-width container */
  fullBleed?: boolean;
  children: ReactNode;
}

export function DashboardShell({
  headerLeft,
  headerRight,
  headerFullWidth = false,
  fullBleed = false,
  children,
}: DashboardShellProps) {
  return (
    <div
      className="relative"
      style={{
        minHeight: "100dvh",
        overflowX: "hidden",
        overflowY: "auto",
        color: feyTokens.colors.text.primary,
        background: "#07070B",
        isolation: "isolate",
      }}
    >
      {/* ── Background layers (matches landing page) ── */}
      <div className="fixed inset-0 pointer-events-none" style={{ background: "#07070B", zIndex: 0 }} />
      {/* White top spotlight — matches landing page density */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          background: "radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0.04) 55%, transparent 80%)",
          filter: "blur(130px)",
          opacity: 0.07,
        }}
      />
      {/* Amethyst center glow — matches landing page density */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          background: "radial-gradient(ellipse at 50% 35%, #7c3aed 0%, #4c1d95 55%, transparent 100%)",
          filter: "blur(200px)",
          opacity: 0.08,
        }}
      />

      {/* ── Content ── */}
      <div className="relative z-10 flex flex-col" style={{ minHeight: "100dvh" }}>
        {/* Mobile desktop nudge — hidden on lg+ */}
        <div
          className="lg:hidden flex items-center justify-center gap-2 px-4 py-2.5 flex-shrink-0"
          style={{
            background: "rgba(124,92,255,0.10)",
            borderBottom: "1px solid rgba(124,92,255,0.18)",
          }}
        >
          <span style={{ fontSize: "11px", color: "rgba(167,139,250,0.75)", textAlign: "center", lineHeight: 1.4 }}>
            Creator Hive is best experienced on desktop — some views may appear limited on mobile.
          </span>
        </div>
        {/* Header */}
        {(headerLeft || headerRight) && (
          <header
            className="sticky top-0 z-30 flex-shrink-0"
            style={{
              height: "56px",
            }}
          >
            <div
              className="h-full mx-auto flex items-center"
              style={{ maxWidth: "1240px", paddingLeft: "clamp(16px, 4vw, 32px)", paddingRight: "clamp(16px, 4vw, 32px)" }}
            >
              {/* Brand wordmark */}
              <span
                className="flex-shrink-0 text-[13px] font-medium opacity-30 mr-0 select-none"
              >
                Creator Hive
              </span>
              {/* Divider */}
              <div className="flex-shrink-0 w-px h-4 mx-4" style={{ background: "rgba(255,255,255,0.10)" }} />
              {headerFullWidth ? (
                <div className="flex-1 min-w-0">{headerLeft}</div>
              ) : (
                <>
                  <div className="flex-1 min-w-0 flex items-center gap-4">{headerLeft}</div>
                  {headerRight && (
                    <div className="flex-shrink-0 flex items-center gap-2">{headerRight}</div>
                  )}
                </>
              )}
            </div>
          </header>
        )}

        {/* Main scrollable area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden" style={{ paddingBottom: "calc(88px + 24px + env(safe-area-inset-bottom, 0px))" }}>
          {fullBleed ? (
            children
          ) : (
            <div
              className="mx-auto"
              style={{
                maxWidth: "1240px",
                paddingLeft: "clamp(16px, 4vw, 32px)",
                paddingRight: "clamp(16px, 4vw, 32px)",
                paddingTop: "20px",
              }}
            >
              {children}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
