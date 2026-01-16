"use client";

interface FUTTooltipHoverProps {
  creator?: {
    id: string;
    name: string;
    role: string;
    avatar?: string;
  };
  asset?: {
    id: string;
    title: string;
    platform: "IG" | "TikTok" | "YouTube";
    thumbnail?: string;
  };
  postedDate: string;
  views?: number;
  reach?: number;
  er?: number;
  contributors?: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
}

export function FUTTooltipHover({
  creator,
  asset,
  postedDate,
  views,
  reach,
  er,
  contributors,
}: FUTTooltipHoverProps) {
  const formatValue = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  };

  return (
    <div
      className="rounded-[18px] border p-[14px]"
      style={{
        width: "240px",
        background: "rgba(0,0,0,0.55)",
        borderColor: "rgba(255,255,255,0.10)",
        backdropFilter: "blur(16px)",
        boxShadow: "0 24px 80px rgba(0,0,0,0.55)",
      }}
    >
      {creator && (
        <div className="mb-3 flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold flex-shrink-0"
            style={{
              background: `linear-gradient(135deg, #F63148 0%, #C41E3A 100%)`,
              color: "white",
            }}
          >
            {creator.avatar ? (
              <img src={creator.avatar} alt={creator.name} className="h-full w-full rounded-full object-cover" />
            ) : (
              creator.name.charAt(0)
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div
              className="text-xs font-semibold truncate"
              style={{ color: "rgba(255,255,255,0.92)" }}
            >
              {creator.name}
            </div>
            <div
              className="text-[10px] truncate"
              style={{ color: "rgba(255,255,255,0.60)" }}
            >
              {creator.role}
            </div>
          </div>
        </div>
      )}

      {asset && (
        <div className="mb-3">
          <div
            className="mb-1 text-xs font-semibold"
            style={{ color: "rgba(255,255,255,0.92)" }}
          >
            {asset.title}
          </div>
          <div className="flex items-center gap-2">
            <span
              className="rounded-full px-2 py-0.5 text-[9px] font-medium"
              style={{
                background: "rgba(255,255,255,0.15)",
                color: "rgba(255,255,255,0.85)",
              }}
            >
              {asset.platform}
            </span>
            <div
              className="text-[10px]"
              style={{ color: "rgba(255,255,255,0.60)" }}
            >
              {postedDate}
            </div>
          </div>
        </div>
      )}

      {/* Mini KPI row */}
      {(views !== undefined || reach !== undefined || er !== undefined) && (
        <div className="grid grid-cols-3 gap-2 border-t pt-3" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          {views !== undefined && (
            <div>
              <div
                className="text-[9px] font-medium uppercase mb-0.5"
                style={{
                  color: "rgba(255,255,255,0.40)",
                  letterSpacing: "0.12em",
                }}
              >
                VIEWS
              </div>
              <div
                className="text-xs font-semibold tabular-nums"
                style={{ color: "rgba(255,255,255,0.92)" }}
              >
                {formatValue(views)}
              </div>
            </div>
          )}
          {reach !== undefined && (
            <div>
              <div
                className="text-[9px] font-medium uppercase mb-0.5"
                style={{
                  color: "rgba(255,255,255,0.40)",
                  letterSpacing: "0.12em",
                }}
              >
                REACH
              </div>
              <div
                className="text-xs font-semibold tabular-nums"
                style={{ color: "rgba(255,255,255,0.92)" }}
              >
                {formatValue(reach)}
              </div>
            </div>
          )}
          {er !== undefined && (
            <div>
              <div
                className="text-[9px] font-medium uppercase mb-0.5"
                style={{
                  color: "rgba(255,255,255,0.40)",
                  letterSpacing: "0.12em",
                }}
              >
                ER
              </div>
              <div
                className="text-xs font-semibold tabular-nums"
                style={{ color: "rgba(255,255,255,0.92)" }}
              >
                {er % 1 === 0 ? `${er}%` : `${er.toFixed(1)}%`}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
