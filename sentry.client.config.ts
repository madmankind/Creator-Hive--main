import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  integrations: [
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  // Set `tracePropagationTargets` to control what URLs distributed tracing should be enabled for
  tracePropagationTargets: ["localhost", /^\//],
  // Set sample rate for performance monitoring
  tracesSampleRate: 1.0,
  // Set `tracePropagationTargets` to control what URLs distributed tracing should be enabled for
  // Set sample rates for replays
  // If you don't want to sample replays, just remove sample rate config
  replaysSessionSampleRate: 0.1, // 10% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% of sessions with an error
  environment: process.env.NODE_ENV,
});

export const withSentry = Sentry.withProfiler;
