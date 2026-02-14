"use client";

import { getPrismConfigByName } from "@/lib/prism/prism.config";
import type { PrismArchetypeName } from "@/lib/curatedTalent";
import { Tooltip, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type PrismBadgeProps = {
  archetypeName: PrismArchetypeName;
  size?: number;
  dim?: boolean;
  tooltip?: boolean;
};

export function PrismBadge({ archetypeName, size = 42, dim = true, tooltip = true }: PrismBadgeProps) {
  const config = getPrismConfigByName(archetypeName);
  const Icon = config.icon;

  const badgeContent = (
    <div
      className={cn(
        "rounded-xl flex items-center justify-center transition-all duration-300",
        dim ? "opacity-50" : "opacity-100"
      )}
      style={{
        width: size,
        height: size,
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(8px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
      }}
      onMouseEnter={(e) => {
        if (dim) {
          e.currentTarget.style.opacity = "1";
          e.currentTarget.style.boxShadow = `0 0 20px ${config.colorSolid}40, 0 0 40px ${config.colorSolid}20`;
        }
      }}
      onMouseLeave={(e) => {
        if (dim) {
          e.currentTarget.style.opacity = "0.5";
          e.currentTarget.style.boxShadow = "none";
        }
      }}
    >
      <Icon
        className="w-5 h-5"
        style={{ color: config.colorSolid }}
      />
    </div>
  );

  if (!tooltip) {
    return badgeContent;
  }

  const tooltipContent = `${config.name} — ${config.tooltipSubtitle}`;

  return (
    <TooltipProvider>
      <Tooltip content={tooltipContent}>
        {badgeContent}
      </Tooltip>
    </TooltipProvider>
  );
}
