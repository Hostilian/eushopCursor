import Link from 'next/link';
import { isDemoModeEnabled } from '../lib/demo-mode';

/**
 * Visible, dismissable-only-by-leaving-demo strip pinned above the nav. Its
 * job is to make sure that no investor, journalist, or screenshot ever reads
 * a demo dataset as production traffic. Renders nothing when the cookie is
 * absent.
 */
export async function DemoModeBanner() {
  const enabled = await isDemoModeEnabled();
  if (!enabled) return null;
  return (
    <div className="bg-saffron-100 text-ink/90 border-saffron-200 border-b">
      <div className="container-editorial flex flex-wrap items-center justify-between gap-3 py-2 text-xs">
        <p>
          <span className="font-medium">Demo data</span> — illustrative only, drawn from our curated
          catalog. No real users, no real listings.
        </p>
        <Link href="/?demo=0" className="hover:text-saffron-800 underline underline-offset-2">
          Switch to live →
        </Link>
      </div>
    </div>
  );
}
