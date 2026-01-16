"use client";

import { feyTokens } from "@/lib/fey-design-tokens";
import { FeySurface } from "./primitives/FeySurface";

interface FUTTooltipProps {
  creator?: {
    id: string;
    name: string;
    role: string;
    avatar?: string;
  };
  deliverable?: {
    id: string;
    title: string;
    type: string;
    thumbnail?: string;
  };
  value: number;
  date: string;
  contributors?: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
}

export function FUTTooltip({
  creator,
  deliverable,
  value,
  date,
  contributors,
}: FUTTooltipProps) {
  return (
    <FeySurface variant="card" padding="sm" className="min-w-[200px]">
      {creator && (
        <div className="mb-3 flex items-center gap-2.5">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg text-xs font-semibold"
            style={{
              background: `linear-gradient(135deg, ${feyTokens.colors.red.glow} 0%, ${feyTokens.colors.red.deep} 100%)`,
              color: "white",
            }}
          >
            {creator.avatar ? (
              <img src={creator.avatar} alt={creator.name} className="h-full w-full rounded-lg object-cover" />
            ) : (
              creator.name.charAt(0)
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div
              className="text-xs font-semibold truncate"
              style={{ color: feyTokens.colors.text.primary }}
            >
              {creator.name}
            </div>
            <div
              className="text-[10px] truncate"
              style={{ color: feyTokens.colors.text.muted }}
            >
              {creator.role}
            </div>
          </div>
        </div>
      )}

      {deliverable && (
        <div
          className="mb-2 text-[10px]"
          style={{ color: feyTokens.colors.text.secondary }}
        >
          {deliverable.title} • {deliverable.type}
        </div>
      )}

      <div className="mb-2 flex items-center justify-between">
        <span
          className="text-[9px] font-medium uppercase tracking-wider"
          style={{ color: feyTokens.colors.text.label }}
        >
          {date}
        </span>
        <span
          className="text-xs font-semibold"
          style={{ color: feyTokens.colors.text.primary }}
        >
          {value.toLocaleString()}
        </span>
      </div>

      {contributors && contributors.length > 0 && (
        <div className="mt-3 border-t pt-2" style={{ borderColor: feyTokens.borders.default }}>
          <div
            className="mb-1.5 text-[9px] font-medium uppercase tracking-wider"
            style={{ color: feyTokens.colors.text.label }}
          >
            Top Contributors
          </div>
          {contributors.slice(0, 3).map((contributor) => (
            <div key={contributor.id} className="mb-1 flex items-center gap-2">
              <div
                className="flex h-5 w-5 items-center justify-center rounded text-[8px] font-medium"
                style={{
                  background: feyTokens.glass.panel.background,
                  color: feyTokens.colors.text.secondary,
                }}
              >
                {contributor.avatar ? (
                  <img src={contributor.avatar} alt={contributor.name} className="h-full w-full rounded object-cover" />
                ) : (
                  contributor.name.charAt(0)
                )}
              </div>
              <span
                className="text-[10px] truncate"
                style={{ color: feyTokens.colors.text.secondary }}
              >
                {contributor.name}
              </span>
            </div>
          ))}
        </div>
      )}
    </FeySurface>
  );
}







