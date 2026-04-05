import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  integrations: [],
  // Set `tracePropagationTargets` to control what URLs distributed tracing should be enabled for
  tracePropagationTargets: ["localhost", /^\//],
  // Set sample rate for performance monitoring
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
});

export const withSentry = Sentry.withProfiler;
