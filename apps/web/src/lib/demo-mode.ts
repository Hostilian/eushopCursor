/**
 * Demo mode is opt-in via ENABLE_DEMO_MODE and cookie `eushop_demo=1` (set via `?demo=1`).
 * Production defaults: flag unset → no cookie handling, no showcase data.
 * Staging / sales demos: set ENABLE_DEMO_MODE=1 and share `/?demo=1` once to populate the cookie.
 */

import { cookies } from 'next/headers';

export const DEMO_MODE_COOKIE = 'eushop_demo';

/** Sync check for middleware and server code that cannot use cookies(). */
export function isDemoModeEnvEnabled(): boolean {
  const v = process.env.ENABLE_DEMO_MODE?.trim().toLowerCase();
  return v === '1' || v === 'true' || v === 'yes';
}

export async function isDemoModeEnabled(): Promise<boolean> {
  if (!isDemoModeEnvEnabled()) return false;
  try {
    const jar = await cookies();
    return jar.get(DEMO_MODE_COOKIE)?.value === '1';
  } catch {
    return false;
  }
}
