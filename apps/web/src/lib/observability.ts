/**
 * Sentry bootstrap for the web Next.js app.
 *
 * Gated on `SENTRY_DSN` (server) or `NEXT_PUBLIC_SENTRY_DSN` (client). The
 * `@sentry/nextjs` import is dynamic so the package only ships when the DSN
 * is configured — keeps client bundles small for the public surface.
 */

let initialized = false;

export async function initWebSentry(side: 'server' | 'client'): Promise<void> {
  if (initialized) return;
  const dsn = side === 'server' ? process.env.SENTRY_DSN : process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return;
  try {
    type SentryNextjs = {
      init: (opts: Record<string, unknown>) => void;
    };
    // Indirect specifier so TypeScript doesn't try to resolve the
    // optional `@sentry/nextjs` package at compile time.
    const specifier = '@sentry/nextjs';
    const mod = (await import(/* @vite-ignore */ specifier)) as unknown as SentryNextjs;
    mod.init({
      dsn,
      tracesSampleRate: Number(
        (side === 'server'
          ? process.env.SENTRY_TRACES_SAMPLE_RATE
          : process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE) ?? '0.05',
      ),
      environment: process.env.NODE_ENV ?? 'development',
      release: process.env.SENTRY_RELEASE,
    });
    initialized = true;
  } catch {
    // Package isn't installed — fall back to console-only error reporting.
  }
}
