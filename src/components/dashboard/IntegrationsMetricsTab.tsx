import { useState, useEffect } from "react";
import { RefreshCw, AlertTriangle, TrendingUp, Zap } from "lucide-react";

type IntegrationMetrics = {
  sentry: {
    connected: boolean;
    unresolvedIssues: number;
    resolvedLast24h: number;
    eventCount: number;
    projectName?: string;
    error?: string;
  };
  ga4: {
    connected: boolean;
    error?: string;
  };
  posthog: {
    connected: boolean;
    error?: string;
  };
};

type ApiResponse = {
  success: boolean;
  timestamp: string;
  integrations: IntegrationMetrics;
  summary?: string;
};

function MetricCard({ label, value, subtext, accent }: { label: string; value: string | number; subtext?: string; accent?: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
      <div className={"text-2xl font-semibold " + (accent ?? "text-white")}>{value}</div>
      <div className="mt-1 text-[11px] font-medium text-white/50 uppercase tracking-widest">{label}</div>
      {subtext && <div className="mt-0.5 text-[10px] text-white/25">{subtext}</div>}
    </div>
  );
}

function StatusIndicator({ connected, label }: { connected: boolean; label: string }) {
  return (
    <div className={`rounded-2xl border p-5 transition ${
      connected
        ? 'bg-emerald-500/10 border-emerald-500/20'
        : 'bg-amber-500/10 border-amber-500/20'
    }`}>
      <div className="flex items-center gap-3 mb-2">
        <div className={`h-3 w-3 rounded-full ${connected ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse`} />
        <h3 className="text-sm font-semibold text-white">{label}</h3>
      </div>
      <p className={`text-xs ${connected ? 'text-emerald-300/70' : 'text-amber-300/70'}`}>
        {connected ? '✓ Connected' : '⏳ Awaiting auth'}
      </p>
    </div>
  );
}

export default function IntegrationsMetricsTab() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/integrations-metrics");
      if (!res.ok) throw new Error("Failed to load integrations metrics");
      const json = await res.json();
      setData(json);
      setLastRefresh(new Date().toLocaleTimeString("en-GB"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading && !data) {
    return <div className="flex items-center justify-center h-64 text-white/30 text-sm">Loading integrations…</div>;
  }

  if (error && !data) {
    return <div className="text-center py-16 text-red-400/70 text-sm">Error: {error}</div>;
  }

  if (!data) return null;

  const { integrations } = data;

  return (
    <div className="space-y-8">
      {/* Header & Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white mb-1">Live Integration Metrics</h2>
          {lastRefresh && <p className="text-[11px] text-white/30">Last updated: {lastRefresh}</p>}
        </div>
        <button 
          onClick={load} 
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-white/10 text-white/70 hover:bg-white/20 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* Integration Status Grid */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-4">Integration Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatusIndicator connected={integrations.sentry.connected} label="Sentry" />
          <StatusIndicator connected={integrations.ga4.connected} label="Google Analytics 4" />
          <StatusIndicator connected={integrations.posthog.connected} label="PostHog" />
        </div>
      </div>

      {/* Sentry Metrics */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle size={14} className="text-red-400/50" />
          <h3 className="text-xs font-semibold uppercase tracking-widest text-white/30">Sentry Error Tracking</h3>
        </div>
        
        {integrations.sentry.connected ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <MetricCard 
              label="Unresolved Issues" 
              value={integrations.sentry.unresolvedIssues} 
              accent={integrations.sentry.unresolvedIssues > 0 ? "text-red-400" : "text-emerald-400"}
              subtext="Active errors to investigate"
            />
            <MetricCard 
              label="Resolved (24h)" 
              value={integrations.sentry.resolvedLast24h}
              accent="text-emerald-400"
              subtext="Issues fixed in last 24 hours"
            />
            <MetricCard 
              label="Total Events (24h)" 
              value={integrations.sentry.eventCount}
              accent="text-blue-400"
              subtext="Error events captured"
            />
          </div>
        ) : (
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-6">
            <p className="text-sm text-amber-300/70">
              Sentry integration pending. Check that <code className="text-amber-200/50 text-xs">SENTRY_AUTH_TOKEN</code> is configured in production environment.
            </p>
          </div>
        )}

        {integrations.sentry.error && (
          <div className="mt-3 rounded-xl border border-red-500/20 bg-red-500/[0.04] p-4">
            <p className="text-xs text-red-300/70">Error: {integrations.sentry.error}</p>
          </div>
        )}
      </div>

      {/* GA4 Metrics */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={14} className="text-blue-400/50" />
          <h3 className="text-xs font-semibold uppercase tracking-widest text-white/30">Google Analytics 4</h3>
        </div>
        
        {!integrations.ga4.connected ? (
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-6">
            <p className="text-sm text-amber-300/70">
              GA4 integration pending. Awaiting service account JSON key authentication. 
              <br className="mt-2" />
              <span className="text-xs text-amber-300/50">You can request an organization policy exception or set up Workload Identity Federation.</span>
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-6">
            <p className="text-sm text-emerald-300/70">✓ GA4 data fetching enabled</p>
          </div>
        )}
      </div>

      {/* PostHog Analytics */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Zap size={14} className="text-purple-400/50" />
          <h3 className="text-xs font-semibold uppercase tracking-widest text-white/30">PostHog Product Analytics</h3>
        </div>
        
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-6">
          <p className="text-sm text-emerald-300/70">
            ✓ PostHog integration active. Funnels, heatmaps, and session replay available at <a href="https://app.posthog.com" target="_blank" rel="noopener noreferrer" className="text-emerald-300 hover:text-emerald-200 underline">app.posthog.com</a>
          </p>
        </div>
      </div>

      {/* Help Section */}
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
        <h3 className="text-sm font-semibold text-white mb-3">Integration Setup</h3>
        <div className="space-y-2 text-xs text-white/60">
          <p><strong className="text-white/80">Sentry:</strong> Error tracking is live. Check <a href="https://sentry.io" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">sentry.io</a> for full issue details.</p>
          <p><strong className="text-white/80">GA4:</strong> Awaiting service account authentication. Once enabled, visitor analytics will appear here.</p>
          <p><strong className="text-white/80">PostHog:</strong> Product analytics active. View funnel conversion and user behavior at <a href="https://app.posthog.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">app.posthog.com</a>.</p>
        </div>
      </div>
    </div>
  );
}
