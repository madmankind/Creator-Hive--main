"use client";

import { ReactNode } from "react";
import { feyTokens } from "@/lib/fey-design-tokens";

interface CommandCenterShellProps {
  children: ReactNode;
  leftRail: ReactNode;
}

export function CommandCenterShell({ children, leftRail }: CommandCenterShellProps) {
  return (
    <div className="flex min-h-screen" style={{ background: feyTokens.colors.base.black }}>
      {/* Left Rail */}
      {leftRail}

      {/* Main Content Area with Fey-style background */}
      <div className="flex-1 ml-[280px] relative min-h-screen">
        {/* Background with vignette gradient + noise texture */}
        <div
          className="fixed inset-0 pointer-events-none z-0"
          style={{
            marginLeft: "280px",
            background: feyTokens.gradients.page,
          }}
        >
          {/* Subtle noise texture overlay */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: feyTokens.overlays.noise,
            }}
          />
          {/* Subtle dotted texture */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: feyTokens.overlays.dots,
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10">{children}</div>
      </div>
    </div>
  );
}

