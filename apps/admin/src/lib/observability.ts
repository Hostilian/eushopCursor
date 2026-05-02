/**
 * Sentry bootstrap for the admin Next.js app. Same shape as `apps/web` —
 * dynamic import gated on `SENTRY_DSN`.
 */

let initialized = false;

export async function initAdminSentry(side: 'server' | 'client'): Promise<void> {
  if (initialized) return;
  const dsn = side === 'server' ? process.env.SENTRY_DSN : process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return;
  try {
    type SentryNextjs = { init: (opts: Record<string, unknown>) => void };
    const specifier = '@sentry/nextjs';
    const mod = (await import(/* @vite-ignore */ specifier)) as unknown as SentryNextjs;
    mod.init({
      dsn,
      tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? '0.05'),
      environment: process.env.NODE_ENV ?? 'development',
      release: process.env.SENTRY_RELEASE,
    });
    initialized = true;
  } catch {
    /* package not installed — no-op */
  }
}
