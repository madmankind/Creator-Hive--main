"use client";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";

interface TooltipProps {
  label: string;
  children: React.ReactNode;
}

export function Tooltip({ label, children }: TooltipProps) {
  return (
    <TooltipPrimitive.Provider delayDuration={150}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side="right"
            align="center"
            sideOffset={8}
            className="rounded-none bg-[rgba(12,12,18,0.95)] px-2 py-1.5 text-[11px] border border-[rgba(255,255,255,0.12)] text-white/90 whitespace-nowrap z-[100]"
            style={{
              boxShadow: "0 4px 12px rgba(0,0,0,0.6)",
            }}
          >
            {label}
            <TooltipPrimitive.Arrow className="fill-[rgba(12,12,18,0.95)]" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}



