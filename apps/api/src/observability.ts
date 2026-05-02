/**
 * Sentry bootstrap for the Hono API process. Gated entirely on `SENTRY_DSN`
 * being present, with a graceful no-op when `@sentry/node` is not installed
 * (so the dev/CI Docker image doesn't have to ship the dependency).
 *
 * Keep this file dependency-free at compile time — the import is dynamic.
 */

let sentryReady = false;
type SentryLike = {
  init: (opts: Record<string, unknown>) => void;
  captureException: (e: unknown, ctx?: Record<string, unknown>) => void;
  flush: (timeoutMs?: number) => Promise<boolean>;
};
let sentry: SentryLike | null = null;

export async function initSentry(): Promise<void> {
  const dsn = process.env.SENTRY_DSN?.trim();
  if (!dsn) return;
  try {
    // Dynamic + indirect specifier so TypeScript doesn't try to resolve
    // the optional `@sentry/node` package at compile time. Production
    // installs ship it; minimal CI/dev images don't, and we no-op there.
    const specifier = '@sentry/node';
    const mod = (await import(/* @vite-ignore */ specifier)) as unknown as SentryLike;
    sentry = mod;
    mod.init({
      dsn,
      environment: process.env.NODE_ENV ?? 'development',
      tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? '0.05'),
      release: process.env.SENTRY_RELEASE,
    });
    sentryReady = true;
    console.info('[sentry] initialised for eushop-api');
  } catch (e) {
    // Package not installed; silently no-op so prod still boots.
    console.warn('[sentry] @sentry/node not installed, skipping init', e);
  }
}

export function captureError(e: unknown, ctx?: Record<string, unknown>): void {
  if (!sentryReady || !sentry) return;
  try {
    sentry.captureException(e, ctx);
  } catch {
    /* swallow */
  }
}

export async function flushSentry(timeoutMs = 2_000): Promise<void> {
  if (!sentryReady || !sentry) return;
  try {
    await sentry.flush(timeoutMs);
  } catch {
    /* swallow */
  }
}
