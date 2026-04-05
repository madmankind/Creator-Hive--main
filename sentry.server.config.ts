import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  // Set sample rate for performance monitoring
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
});
