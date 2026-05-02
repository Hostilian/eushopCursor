/**
 * Next.js instrumentation hook — enable Sentry/OpenTelemetry here when you add SDKs.
 * @see docs/ops/observability.md
 *
 * Stays minimal so webpack can bundle this for both the `nodejs` and `edge`
 * runtimes; the Sentry side import is dynamic and gated on `SENTRY_DSN`.
 */

export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs' || !process.env.SENTRY_DSN) return;
  try {
    type SentryNextjs = { init: (opts: Record<string, unknown>) => void };
    const specifier = '@sentry/nextjs';
    const mod = (await import(/* @vite-ignore */ specifier)) as unknown as SentryNextjs;
    mod.init({
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
