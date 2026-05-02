import { createRequire } from 'node:module';

/**
 * Next.js instrumentation hook — enable Sentry/OpenTelemetry here when you add SDKs.
 * @see docs/ops/observability.md
 */
const require = createRequire(import.meta.url);

export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs' || !process.env.SENTRY_DSN) return;
  try {
    const Sentry = require('@sentry/nextjs');
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? '0.1'),
      beforeSend(event: { request?: { cookies?: unknown } }) {
        if (event.request?.cookies) delete event.request.cookies;
        return event;
      },
    });
  } catch {
    console.info('[eushop] SENTRY_DSN is set; install @sentry/nextjs to enable server SDK.');
  }
}
