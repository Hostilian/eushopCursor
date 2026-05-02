/**
 * Demo mode is a single, explicit, cookie-backed flag that lets us show a
 * curated showcase dataset on top of the real (live, possibly empty) database.
 *
 * Why this exists:
 *   - Investors and Y Combinator demos can't tolerate empty states the first
 *     time they open the homepage.
 *   - Production data must never silently fall back to fictional rows. If the
 *     DB is empty, the UI should *say* it's empty (or invite the visitor to
 *     post something).
 *
 * How it's set:
 *   - A visit to `/?demo=1` sets the cookie via `middleware.ts`.
 *   - A visit to `/?demo=0` clears it.
 *   - Once set, `isDemoModeEnabled()` returns true on the server and the
 *     `<DemoModeBanner />` shows a clear "Demo data — not real listings"
 *     marker so nobody confuses it with production traffic.
 *
 * What it controls:
 *   - The home `<KpiStrip />` and `<Hero />` showcase counts.
 *   - The `/discover` empty state (a small showcase rail instead of nothing).
 *   - The `/requests` empty state (likewise).
 *   - The `/traction` page never honours demo mode — investors must always see
 *     the *real* numbers there, even if they're zero.
 */

import { cookies } from 'next/headers';

export const DEMO_MODE_COOKIE = 'eushop_demo';

/** Server-side check; safe inside React Server Components and route handlers. */
export async function isDemoModeEnabled(): Promise<boolean> {
  try {
    const jar = await cookies();
    return jar.get(DEMO_MODE_COOKIE)?.value === '1';
  } catch {
    return false;
  }
}

/** Client-side fallback that reads `document.cookie`. */
export function isDemoModeEnabledClient(): boolean {
  if (typeof document === 'undefined') return false;
  return document.cookie.split('; ').some((c) => c === `${DEMO_MODE_COOKIE}=1`);
}
