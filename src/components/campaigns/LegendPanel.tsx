"use client";

import { Eye, EyeOff } from "lucide-react";
import type { CampaignObjective, Asset } from "@/types/campaign";

interface LegendPanelProps {
  assets: Asset[];
  visibleAssets: Set<string>;
  onToggleAsset: (assetId: string) => void;
  onHoverAsset: (assetId: string | null) => void;
  objective: CampaignObjective;
  getPrimaryValue: (asset: Asset) => number;
  formatPrimaryValue: (value: number) => string;
  getPrimaryLabel: () => string;
}

export function LegendPanel({
  assets,
  visibleAssets,
  onToggleAsset,
  onHoverAsset,
  objective,
  getPrimaryValue,
  formatPrimaryValue,
  getPrimaryLabel,
}: LegendPanelProps) {
  // Color palette for lines
  const colors = [
    "#F63148", // Accent red
    "#E3A23A", // Amber
    "#8B5CF6", // Purple
    "#10B981", // Green
    "#3B82F6", // Blue
  ];

  return (
    <div
      className="flex flex-col h-full"
      style={{
        width: "280px",
        paddingRight: "24px",
      }}
    >
      <div
        className="mb-3 text-xs font-semibold"
        style={{ color: "rgba(255,255,255,0.70)" }}
      >
        Active assets
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-hide space-y-2">
        {assets.map((asset, index) => {
          const isVisible = visibleAssets.has(asset.id);
          const primaryValue = getPrimaryValue(asset);
          const color = colors[index % colors.length];

          return (
            <div
              key={asset.id}
              onClick={() => onToggleAsset(asset.id)}
              onMouseEnter={() => onHoverAsset(asset.id)}
              onMouseLeave={() => onHoverAsset(null)}
              className="flex items-center gap-3 rounded-[14px] border cursor-pointer transition-all"
              style={{
                height: "64px",
                padding: "12px",
                background: isVisible ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.04)",
                borderColor: isVisible ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.06)",
              }}
            >
              {/* Color dot */}
              <div
                className="flex-shrink-0 rounded-full"
                style={{
                  width: "10px",
                  height: "10px",
                  backgroundColor: color,
                }}
              />
              
              {/* Middle content */}
              <div className="flex-1 min-w-0">
                <div
                  className="text-[13px] font-semibold truncate"
                  style={{ color: "rgba(255,255,255,0.92)" }}
                >
                  {asset.postingAccount.name}
                </div>
                <div
                  className="text-xs truncate"
                  style={{ color: "rgba(255,255,255,0.55)" }}
                >
                  {asset.title}
                </div>
              </div>

              {/* Right: Value + Eye icon */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="text-right">
                  <div
                    className="text-xs font-semibold tabular-nums"
                    style={{ color: "rgba(255,255,255,0.92)" }}
                  >
                    {formatPrimaryValue(primaryValue)}
                  </div>
                  <div
                    className="text-[10px]"
                    style={{ color: "rgba(255,255,255,0.40)" }}
                  >
                    {getPrimaryLabel()}
                  </div>
                </div>
                {isVisible ? (
                  <Eye className="h-4 w-4" style={{ color: "rgba(255,255,255,0.60)" }} />
                ) : (
                  <EyeOff className="h-4 w-4" style={{ color: "rgba(255,255,255,0.40)" }} />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

