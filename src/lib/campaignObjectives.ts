export const CAMPAIGN_OBJECTIVES = {
  awareness: {
    primary: "reach",
    yAxisLabel: "Reach",
    allowedMetrics: ["reach", "impressions", "cpm"] as string[],
  },
  engagement: {
    primary: "engagements",
    yAxisLabel: "Engagements",
    allowedMetrics: ["engagements", "er"] as string[],
  },
  traffic: {
    primary: "ctr",
    yAxisLabel: "CTR (%)",
    allowedMetrics: ["ctr", "clicks", "cpc"] as string[],
  },
  conversions: {
    primary: "conversions",
    yAxisLabel: "Conversions",
    allowedMetrics: ["conversions", "cpa", "cvr"] as string[],
  },
} as const;

export type CampaignObjective = keyof typeof CAMPAIGN_OBJECTIVES;

// Helper functions to extract values based on primary metric
export function getValueFromAsset(asset: any, primary: string): number {
  if (primary === "reach") return asset.metrics?.reach || 0;
  if (primary === "engagements") return asset.metrics?.engagements || 0;
  if (primary === "ctr") {
    const impressions = asset.metrics?.impressions || 0;
    const clicks = asset.metrics?.clicks || 0;
    return impressions > 0 ? (clicks / impressions) * 100 : 0;
  }
  if (primary === "conversions") return asset.metrics?.conversions || 0;
  return 0;
}

export function getValueFromPlanned(planned: any, primary: string): number {
  if (primary === "reach") return planned?.estReach || 0;
  if (primary === "engagements") return planned?.estEngagements || 0;
  if (primary === "ctr") {
    const impressions = planned?.estImpressions || 0;
    const clicks = planned?.estClicks || 0;
    return impressions > 0 ? (clicks / impressions) * 100 : 0;
  }
  if (primary === "conversions") return planned?.estConversions || 0;
  return 0;
}

export function getValueFromActual(actual: any, primary: string): number {
  if (primary === "reach") return actual?.estReach || 0;
  if (primary === "engagements") return actual?.estEngagements || 0;
  if (primary === "ctr") {
    const impressions = actual?.estImpressions || 0;
    const clicks = actual?.estClicks || 0;
    return impressions > 0 ? (clicks / impressions) * 100 : 0;
  }
  if (primary === "conversions") return actual?.estConversions || 0;
  return 0;
}

export function formatValue(value: number, primary: string): string {
  if (primary === "ctr") {
    return `${value.toFixed(2)}%`;
  }
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
}
