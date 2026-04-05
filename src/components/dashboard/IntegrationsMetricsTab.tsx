"use client";

import { useState, useEffect } from "react";
import {
  Activity,
  AlertTriangle,
  TrendingUp,
  Users,
  Zap,
  Eye,
  Target,
  ExternalLink,
  RefreshCw,
} from "lucide-react";

type IntegrationMetric = {
  label: string;
  value: string | number;
  trend?: string;
  color: string;
  icon: React.ReactNode;
};

type IntegrationsMetrics = {
  sentry?: {
    unresolvedIssues?: number;
    resolvedLast24h?: number;
  };
  ga4?: {
    activeUsers?: number;
    sessions?: number;
    conversions?: number;
  };
  posthog?: {
    dailyActive?: number;
    eventCount?: number;
    topEvent?: string;
  };
};

function MetricCard({
  label,
  value,
  icon,
  color,
  trend,
  action,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend?: string;
  action?: { label: string; url: string };
}) {
  return (
    <div className={`rounded-xl border p-4 ${color}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-xs uppercase tracking-wider text-white/70">{label}</span>
        </div>
        {trend && <span className="text-xs text-white/40">{trend}</span>}
      </div>
      <div className="flex items-end justify-between">
        <div className="text-2xl font-semibold text-white">{value}</div>
        {action && (
          <a
            href={action.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-white/40 hover:text-white/70 flex items-center gap-1 transition-colors"
          >
            View <ExternalLink size={10} />
          </a>
        )}
      </div>
    </div>
  );
}

function IntegrationsMetricsTab() {
  const [metrics, setMetrics] = useState<IntegrationsMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      // For now, show placeholder data and instructions
      // Real API calls would go here once backend is configured

      // This is a placeholder showing what the component WILL display
      setMetrics({
        sentry: {
          unresolvedIssues: 0,
          resolvedLast24h: 0,
        },
        ga4: {
          activeUsers: 0,
          sessions: 0,
          conversions: 0,
        },
        posthog: {
          dailyActive: 0,
          eventCount: 0,
          topEvent: "N/A",
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    // Refresh every 5 minutes
    const interval = setInterval(fetchMetrics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-center">
        <AlertTriangle size={24} className="mx-auto mb-2 text-red-300" />
        <p className="text-sm text-red-200">{error}</p>
        <button
          onClick={fetchMetrics}
          className="mt-3 px-4 py-2 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 text-xs font-medium transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-white/30 text-sm">
        <RefreshCw size={16} className="mr-2 animate-spin" />
        Loading integration metrics...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Sentry Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <AlertTriangle size={16} className="text-red-400" />
            Sentry - Error Tracking
          </h3>
          <a
            href="https://sentry.io"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-white/40 hover:text-white/70 flex items-center gap-1"
          >
            Open dashboard <ExternalLink size={12} />
          </a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <MetricCard
            label="Unresolved issues"
            value={metrics?.sentry?.unresolvedIssues ?? 0}
            icon={<AlertTriangle size={16} className="text-red-400" />}
            color="border-red-500/20 bg-red-500/[0.04]"
            trend="Last 24h"
            action={{ label: "View in Sentry", url: "https://sentry.io" }}
          />
          <MetricCard
            label="Resolved last 24h"
            value={metrics?.sentry?.resolvedLast24h ?? 0}
            icon={<Activity size={16} className="text-emerald-400" />}
            color="border-emerald-500/20 bg-emerald-500/[0.04]"
            action={{ label: "View in Sentry", url: "https://sentry.io" }}
          />
        </div>
        <div className="mt-3 text-xs text-white/30 bg-white/[0.02] border border-white/[0.05] rounded-lg p-3">
          Sentry monitors all JavaScript errors, performance issues, and exceptions in real-time. Configure alert rules in Sentry to notify your team of critical issues.
        </div>
      </div>

      {/* GA4 Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Eye size={16} className="text-blue-400" />
            Google Analytics 4 - Traffic & Conversions
          </h3>
          <a
            href="https://analytics.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-white/40 hover:text-white/70 flex items-center gap-1"
          >
            Open dashboard <ExternalLink size={12} />
          </a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <MetricCard
            label="Active users (realtime)"
            value={metrics?.ga4?.activeUsers ?? 0}
            icon={<Users size={16} className="text-blue-400" />}
            color="border-blue-500/20 bg-blue-500/[0.04]"
            action={{ label: "View in GA4", url: "https://analytics.google.com" }}
          />
          <MetricCard
            label="Sessions (7d)"
            value={metrics?.ga4?.sessions ?? 0}
            icon={<TrendingUp size={16} className="text-cyan-400" />}
            color="border-cyan-500/20 bg-cyan-500/[0.04]"
          />
          <MetricCard
            label="Conversions (7d)"
            value={metrics?.ga4?.conversions ?? 0}
            icon={<Target size={16} className="text-emerald-400" />}
            color="border-emerald-500/20 bg-emerald-500/[0.04]"
          />
        </div>
        <div className="mt-3 text-xs text-white/30 bg-white/[0.02] border border-white/[0.05] rounded-lg p-3">
          GA4 tracks all user interactions: pageviews, sign-ups, campaign clicks, and conversions. Check Real-time view to see live visitor activity.
        </div>
      </div>

      {/* PostHog Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Zap size={16} className="text-purple-400" />
            PostHog - Product Analytics
          </h3>
          <a
            href="https://app.posthog.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-white/40 hover:text-white/70 flex items-center gap-1"
          >
            Open dashboard <ExternalLink size={12} />
          </a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <MetricCard
            label="Daily active users"
            value={metrics?.posthog?.dailyActive ?? 0}
            icon={<Users size={16} className="text-purple-400" />}
            color="border-purple-500/20 bg-purple-500/[0.04]"
            action={{ label: "View in PostHog", url: "https://app.posthog.com" }}
          />
          <MetricCard
            label="Events tracked"
            value={metrics?.posthog?.eventCount ?? 0}
            icon={<Activity size={16} className="text-indigo-400" />}
            color="border-indigo-500/20 bg-indigo-500/[0.04]"
          />
          <MetricCard
            label="Top event"
            value={metrics?.posthog?.topEvent ?? "—"}
            icon={<TrendingUp size={16} className="text-pink-400" />}
            color="border-pink-500/20 bg-pink-500/[0.04]"
          />
        </div>
        <div className="mt-3 text-xs text-white/30 bg-white/[0.02] border border-white/[0.05] rounded-lg p-3">
          PostHog captures custom events: auth_started, form_field_filled, booking_created, etc. Use funnels and insights to identify conversion bottlenecks.
        </div>
      </div>

      {/* Setup Instructions */}
      <div className="border border-amber-500/20 bg-amber-500/[0.04] rounded-lg p-5">
        <h4 className="text-sm font-semibold text-amber-300 mb-3">📋 Setup Instructions</h4>
        <div className="space-y-2 text-xs text-white/60">
          <div>
            <strong className="text-amber-200">Sentry API Token:</strong> Add SENTRY_AUTH_TOKEN to env vars
          </div>
          <div>
            <strong className="text-amber-200">GA4 Access Token:</strong> Use Google OAuth and add GA4_ACCESS_TOKEN
          </div>
          <div>
            <strong className="text-amber-200">PostHog API Key:</strong> Add POSTHOG_PERSONAL_API_KEY for API access
          </div>
          <div className="pt-2 border-t border-amber-500/20 mt-2">
            Once configured, this dashboard will auto-refresh metrics every 5 minutes and show live data from all three platforms.
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-3">Quick Links</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <a
            href="https://creator-hive-fze.sentry.io"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 rounded-lg border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.05] transition-colors"
          >
            <div className="text-sm font-medium text-white">Sentry Dashboard</div>
            <ExternalLink size={14} className="text-white/40" />
          </a>
          <a
            href="https://analytics.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 rounded-lg border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.05] transition-colors"
          >
            <div className="text-sm font-medium text-white">GA4 Dashboard</div>
            <ExternalLink size={14} className="text-white/40" />
          </a>
          <a
            href="https://app.posthog.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 rounded-lg border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.05] transition-colors"
          >
            <div className="text-sm font-medium text-white">PostHog Dashboard</div>
            <ExternalLink size={14} className="text-white/40" />
          </a>
        </div>
      </div>
    </div>
  );
}

export default IntegrationsMetricsTab;
