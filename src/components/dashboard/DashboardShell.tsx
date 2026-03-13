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
        overflow: "hidden",
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
              style={{ maxWidth: "1240px", paddingLeft: "32px", paddingRight: "32px" }}
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
        <main className="flex-1 overflow-y-auto" style={{ paddingBottom: "calc(88px + 24px)" }}>
          {fullBleed ? (
            children
          ) : (
            <div
              className="mx-auto"
              style={{
                maxWidth: "1240px",
                paddingLeft: "32px",
                paddingRight: "32px",
                paddingTop: "28px",
              }}
            >
              {children}
            </div>
          )}
        </main>
      </div>

      <BottomDock />
    </div>
  );
}
