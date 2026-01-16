// Campaign data types for Track screen
// SINGLE SOURCE OF TRUTH for campaign objectives and KPIs

export interface Asset {
  id: string;
  title: string;
  platform: "IG" | "TikTok" | "YouTube" | "Twitter";
  postingAccount: {
    id: string;
    name: string;
    role: string;
    avatar?: string;
  };
  contributors: Array<{
    id: string;
    name: string;
    role: string;
    avatar?: string;
  }>;
  metrics: {
    impressions?: number;
    reach?: number;
    views?: number;
    engagements?: number;
    clicks?: number;
    conversions?: number;
  };
  postedDate: string;
  thumbnail?: string;
  link?: string;
}

export interface CampaignDataPoint {
  date: string;
  day: number;
  planned?: number;
  campaignAggregate?: number;
  assets?: Record<string, number>; // assetId -> value
  [key: string]: string | number | Record<string, number> | undefined;
}

export type CampaignObjective = "awareness" | "engagement" | "traffic" | "conversions";

/**
 * SINGLE SOURCE OF TRUTH: Campaign Objective Configuration
 * Each objective has ONE primary KPI that controls:
 * - Y-axis label
 * - Main chart metric
 * - Summary KPI card
 */
export interface ObjectiveConfig {
  primaryKPI: string;
  yAxisLabel: string;
  formatValue: (value: number) => string;
  getValueFromAsset: (asset: Asset) => number;
  getValueFromPlanned: (planned: any) => number;
  getValueFromActual: (actual: any) => number;
}

export const OBJECTIVE_CONFIGS: Record<CampaignObjective, ObjectiveConfig> = {
  awareness: {
    primaryKPI: "Reach",
    yAxisLabel: "Reach",
    formatValue: (v) => (v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(1)}K` : v.toString()),
    getValueFromAsset: (asset) => asset.metrics.reach || 0,
    getValueFromPlanned: (planned) => planned?.estReach || 0,
    getValueFromActual: (actual) => actual?.estReach || 0,
  },
  engagement: {
    primaryKPI: "Engagements",
    yAxisLabel: "Engagements",
    formatValue: (v) => (v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(1)}K` : v.toString()),
    getValueFromAsset: (asset) => asset.metrics.engagements || 0,
    getValueFromPlanned: (planned) => planned?.estEngagements || 0,
    getValueFromActual: (actual) => actual?.estEngagements || 0,
  },
  traffic: {
    primaryKPI: "CTR",
    yAxisLabel: "CTR%",
    formatValue: (v) => `${v.toFixed(2)}%`,
    getValueFromAsset: (asset) => {
      const impressions = asset.metrics.impressions || 0;
      const clicks = asset.metrics.clicks || 0;
      return impressions > 0 ? (clicks / impressions) * 100 : 0;
    },
    getValueFromPlanned: (planned) => {
      const impressions = planned?.estImpressions || 0;
      const clicks = planned?.estClicks || 0;
      return impressions > 0 ? (clicks / impressions) * 100 : 0;
    },
    getValueFromActual: (actual) => {
      const impressions = actual?.estImpressions || 0;
      const clicks = actual?.estClicks || 0;
      return impressions > 0 ? (clicks / impressions) * 100 : 0;
    },
  },
  conversions: {
    primaryKPI: "Conversions",
    yAxisLabel: "Conversions",
    formatValue: (v) => v.toString(),
    getValueFromAsset: (asset) => asset.metrics.conversions || 0,
    getValueFromPlanned: (planned) => planned?.estConversions || 0,
    getValueFromActual: (actual) => actual?.estConversions || 0,
  },
};
