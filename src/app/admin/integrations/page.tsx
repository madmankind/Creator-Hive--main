/**
 * Admin Integrations Settings Page
 * Manage Sentry, Google Analytics, PostHog, Hotjar
 */

'use client';

import { useState } from 'react';
import { Copy, Check, ExternalLink, AlertCircle } from 'lucide-react';

interface Integration {
  name: string;
  status: 'connected' | 'pending' | 'error';
  description: string;
  envVars: { name: string; required: boolean; value?: string }[];
  dashboardUrl: string;
  setupUrl: string;
  docsUrl: string;
}

const INTEGRATIONS: Integration[] = [
  {
    name: 'Sentry',
    status: 'pending',
    description: 'Error tracking & performance monitoring',
    envVars: [
      { name: 'NEXT_PUBLIC_SENTRY_DSN', required: true, value: process.env.NEXT_PUBLIC_SENTRY_DSN },
      { name: 'SENTRY_DSN', required: true, value: process.env.SENTRY_DSN },
    ],
    dashboardUrl: 'https://sentry.io',
    setupUrl: 'https://sentry.io/onboarding/',
    docsUrl: 'https://docs.sentry.io/platforms/javascript/guides/nextjs/',
  },
  {
    name: 'Google Analytics 4',
    status: 'pending',
    description: 'Visitor tracking and conversion measurement',
    envVars: [
      { name: 'NEXT_PUBLIC_GA_MEASUREMENT_ID', required: true, value: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID },
    ],
    dashboardUrl: 'https://analytics.google.com',
    setupUrl: 'https://analytics.google.com',
    docsUrl: 'https://developers.google.com/analytics',
  },
  {
    name: 'PostHog',
    status: 'connected',
    description: 'Product analytics and session recording',
    envVars: [
      { name: 'NEXT_PUBLIC_POSTHOG_KEY', required: true, value: process.env.NEXT_PUBLIC_POSTHOG_KEY },
    ],
    dashboardUrl: 'https://app.posthog.com',
    setupUrl: 'https://posthog.com/signup',
    docsUrl: 'https://posthog.com/docs',
  },
  {
    name: 'Hotjar',
    status: 'connected',
    description: 'Heatmaps, scrollmaps and session replay',
    envVars: [
      { name: 'NEXT_PUBLIC_HOTJAR_ID', required: false, value: process.env.NEXT_PUBLIC_HOTJAR_ID },
    ],
    dashboardUrl: 'https://dashboard.hotjar.com',
    setupUrl: 'https://www.hotjar.com/sign-up',
    docsUrl: 'https://support.hotjar.com',
  },
];

export default function IntegrationsPage() {
  const [copied, setCopied] = useState<string | null>(null);
  const [expandedIntegration, setExpandedIntegration] = useState<string | null>(null);

  const copyToClipboard = (text: string, name: string) => {
    navigator.clipboard.writeText(text);
    setCopied(name);
    setTimeout(() => setCopied(null), 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-emerald-900/20 border-emerald-700 text-emerald-300';
      case 'pending':
        return 'bg-amber-900/20 border-amber-700 text-amber-300';
      default:
        return 'bg-slate-800/50 border-slate-700 text-slate-300';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">Integrations</h1>
          <p className="text-slate-400">
            Manage analytics, error tracking, and user behavior monitoring
          </p>
        </div>

        {/* Integrations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {INTEGRATIONS.map((integration) => (
            <div
              key={integration.name}
              className={`border rounded-lg p-6 transition ${getStatusColor(integration.status)}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-xl font-bold text-white">{integration.name}</h2>
                    <span className="text-xs px-2 py-1 bg-black/20 rounded">
                      {integration.status === 'connected' ? '✓ Connected' : '⏳ Pending'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300">{integration.description}</p>
                </div>
              </div>

              <div className="flex gap-2 mb-4">
                <a
                  href={integration.dashboardUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-black/20 hover:bg-black/30 rounded text-xs font-medium transition"
                >
                  Dashboard <ExternalLink size={14} />
                </a>
                <a
                  href={integration.setupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-black/20 hover:bg-black/30 rounded text-xs font-medium transition"
                >
                  Setup <ExternalLink size={14} />
                </a>
              </div>

              <button
                onClick={() =>
                  setExpandedIntegration(
                    expandedIntegration === integration.name ? null : integration.name
                  )
                }
                className="w-full text-left px-3 py-2 bg-black/20 hover:bg-black/30 rounded text-xs font-medium transition"
              >
                {expandedIntegration === integration.name ? '▼' : '▶'} Environment Variables
              </button>

              {expandedIntegration === integration.name && (
                <div className="mt-4 space-y-3 border-t border-black/20 pt-4">
                  {integration.envVars.map((envVar) => (
                    <div key={envVar.name} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="font-mono text-xs">
                          {envVar.name}
                          {envVar.required && <span className="text-red-400 ml-1">*</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          {envVar.value ? (
                            <span className="text-xs px-2 py-1 bg-emerald-900/30 text-emerald-300 rounded">
                              Set
                            </span>
                          ) : (
                            <span className="text-xs px-2 py-1 bg-amber-900/30 text-amber-300 rounded">
                              Not Set
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Setup Instructions */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <AlertCircle size={20} />
            Setup Checklist
          </h2>
          <ol className="space-y-2 text-slate-300 text-sm">
            <li>✓ <strong>PostHog & Hotjar:</strong> Already installed and running</li>
            <li>◻ <strong>Sentry:</strong> Get DSN from sentry.io, add to .env.local</li>
            <li>◻ <strong>Google Analytics 4:</strong> Get Measurement ID, add to .env.local</li>
            <li>◻ <strong>Restart:</strong> npm run dev to load new environment variables</li>
            <li>◻ <strong>Verify:</strong> Check each dashboard for incoming data</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
