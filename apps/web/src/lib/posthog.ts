/**
 * PostHog bootstrap for the web app.
 *
 * Gated on `NEXT_PUBLIC_POSTHOG_KEY` **and** analytics consent (see
 * `ConsentBanner` / `Providers`). Do not call `initPostHog` until the user opts in.
 * We also
 * default `autocapture: false` and `capture_pageview: false` — pageviews are
 * sent explicitly in the App Router shell to match Next.js navigations
 * cleanly. Operators can flip these via env when desired.
 */

let initialized = false;

export function initPostHog(): void {
  if (initialized) return;
  if (typeof window === 'undefined') return;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim();
  if (!key) return;

  type PostHogLike = {
    init: (key: string, opts: Record<string, unknown>) => void;
    capture?: (event: string, props?: Record<string, unknown>) => void;
  };

  // Indirect specifier so TypeScript doesn't try to resolve the
  // optional `posthog-js` package at compile time.
  const specifier = 'posthog-js';
  void import(/* @vite-ignore */ specifier)
    .then((mod) => {
      const ph = (mod as unknown as { default: PostHogLike }).default;
      ph.init(key, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://eu.posthog.com',
        person_profiles: 'identified_only',
        autocapture: process.env.NEXT_PUBLIC_POSTHOG_AUTOCAPTURE === '1',
        capture_pageview: false,
        disable_session_recording: process.env.NEXT_PUBLIC_POSTHOG_RECORDING !== '1',
      });
      initialized = true;
    })
    .catch(() => {
      // posthog-js not installed — silently no-op.
    });
}
