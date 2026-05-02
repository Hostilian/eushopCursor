/**
 * Next.js instrumentation hook — enable Sentry/OpenTelemetry here when you add SDKs.
 * @see docs/ops/observability.md
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs' && process.env.SENTRY_DSN) {
    console.info('[eushop] SENTRY_DSN is set; wire @sentry/nextjs in this hook when ready.');
  }
}
