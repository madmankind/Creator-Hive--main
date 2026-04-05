import { NextRequest, NextResponse } from "next/server";

/**
 * Admin Integrations Metrics API
 * GET /api/admin/integrations-metrics
 * 
 * Fetches live metrics from:
 * - Sentry: Error tracking (unresolved issues, resolved count, etc.)
 * - Google Analytics 4: Traffic & conversion metrics (when GA4 service account is available)
 * - PostHog: Product analytics (when endpoint available)
 * 
 * Returns aggregated metrics for the admin Integrations dashboard.
 */

// Sentry API client
async function fetchSentryMetrics() {
  const sentryAuthToken = process.env.SENTRY_AUTH_TOKEN;
  const sentryOrg = "creator-hive-fze";
  const sentryProject = "javascript-nextjs";

  if (!sentryAuthToken) {
    return {
      connected: false,
      error: "SENTRY_AUTH_TOKEN not configured",
      unresolved_issues: 0,
      resolved_last_24h: 0,
      total_events_24h: 0,
    };
  }

  try {
    // Fetch unresolved issues
    const unresolved = await fetch(
      `https://sentry.io/api/0/projects/${sentryOrg}/${sentryProject}/issues/?is=unresolved&limit=100`,
      {
        headers: {
          Authorization: `Bearer ${sentryAuthToken}`,
          "Content-Type": "application/json",
        },
      }
    ).then((r) => r.json());

    // Fetch resolved issues in last 24 hours
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

    const resolved = await fetch(
      `https://sentry.io/api/0/projects/${sentryOrg}/${sentryProject}/issues/?is=resolved&resolvedAfter=${last24h}&limit=100`,
      {
        headers: {
          Authorization: `Bearer ${sentryAuthToken}`,
          "Content-Type": "application/json",
        },
      }
    ).then((r) => r.json());

    // Fetch events stats for last 24h
    const stats = await fetch(
      `https://sentry.io/api/0/projects/${sentryOrg}/${sentryProject}/stats/`,
      {
        headers: {
          Authorization: `Bearer ${sentryAuthToken}`,
          "Content-Type": "application/json",
        },
      }
    ).then((r) => r.json());

    const unresolvedCount = Array.isArray(unresolved) ? unresolved.length : 0;
    const resolvedCount = Array.isArray(resolved) ? resolved.length : 0;
    
    // Sum total events from stats (each stat entry is [timestamp, [[count, id]]])
    let totalEvents = 0;
    if (Array.isArray(stats)) {
      totalEvents = stats.reduce((sum, entry) => {
        if (Array.isArray(entry) && Array.isArray(entry[1])) {
          return sum + (entry[1][0]?.[0] || 0);
        }
        return sum;
      }, 0);
    }

    return {
      connected: true,
      unresolved_issues: unresolvedCount,
      resolved_last_24h: resolvedCount,
      total_events_24h: totalEvents,
      dashboard_url: `https://sentry.io/organizations/${sentryOrg}/issues/?project=${sentryProject}`,
    };
  } catch (error) {
    console.error("[Sentry API Error]", error);
    return {
      connected: false,
      error: error instanceof Error ? error.message : "Failed to fetch Sentry metrics",
      unresolved_issues: 0,
      resolved_last_24h: 0,
      total_events_24h: 0,
    };
  }
}

// Google Analytics 4 placeholder
async function fetchGA4Metrics() {
  const ga4Token = process.env.GA4_ACCESS_TOKEN;
  const ga4PropertyId = process.env.GA4_PROPERTY_ID;

  if (!ga4Token || !ga4PropertyId) {
    return {
      connected: false,
      error: "GA4_ACCESS_TOKEN or GA4_PROPERTY_ID not configured",
      active_users_realtime: 0,
      sessions_7d: 0,
      conversions_7d: 0,
    };
  }

  // TODO: Implement GA4 OAuth2 flow and Data API calls
  // For now, return placeholder
  return {
    connected: false,
    error: "GA4 integration coming soon (requires OAuth2 service account)",
    active_users_realtime: 0,
    sessions_7d: 0,
    conversions_7d: 0,
  };
}

// PostHog placeholder
async function fetchPostHogMetrics() {
  const postHogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;

  if (!postHogKey) {
    return {
      connected: false,
      error: "PostHog not configured",
      daily_active_users: 0,
      total_events_24h: 0,
      top_event: null,
    };
  }

  // TODO: Implement PostHog API calls when endpoint available
  return {
    connected: false,
    error: "PostHog metrics coming soon",
    daily_active_users: 0,
    total_events_24h: 0,
    top_event: null,
  };
}

export async function GET(req: NextRequest) {
  try {
    // Require authentication (optional: add session check if needed)
    // const session = await getServerSession();
    // if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Fetch metrics from all integrations concurrently
    const [sentry, ga4, posthog] = await Promise.all([
      fetchSentryMetrics(),
      fetchGA4Metrics(),
      fetchPostHogMetrics(),
    ]);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      integrations: {
        sentry,
        ga4,
        posthog,
      },
      // Summary stats
      summary: {
        total_connected: [sentry.connected, ga4.connected, posthog.connected].filter(Boolean).length,
        sentry_healthy: sentry.connected,
        ga4_healthy: ga4.connected,
        posthog_healthy: posthog.connected,
      },
    });
  } catch (error) {
    console.error("[Integrations API Error]", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
