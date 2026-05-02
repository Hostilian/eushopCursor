import Link from 'next/link';
import { isDemoModeEnabled } from '../lib/demo-mode';

/**
 * Visible strip when demo cookie is active and ENABLE_DEMO_MODE is on.
 */
export async function DemoModeBanner() {
  const enabled = await isDemoModeEnabled();
  if (!enabled) return null;

  return (
    <div className="bg-saffron-600 text-paper border-ink/10 border-b px-4 py-2 text-center text-sm">
      <strong className="font-medium">Demo / staging data</strong>
      {' — '}
      Illustrative listings and trips from the curated catalog, not live marketplace traffic.{' '}
      <Link href="/?demo=0" className="underline underline-offset-2">
        Switch to live view
      </Link>
      .
    </div>
  );
}
