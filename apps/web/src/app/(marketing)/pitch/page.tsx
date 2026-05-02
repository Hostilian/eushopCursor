import Link from 'next/link';

import { EditorialPageLayout } from '../../components/marketing/editorial-page';
import { MarketingSourcesStrip } from '../../components/marketing/marketing-sources-strip';

export default function PitchPage() {
  return (
    <EditorialPageLayout
      eyebrow="Investor narrative"
      title="Eushop in one sitting."
      subtitle="Problem, wedge, GTM, and what we need next—without mixing historic statistics and forward-looking TAM."
    >
      <div className="text-ink/80 max-w-2xl space-y-10 text-lg leading-relaxed text-pretty">
        <section>
          <h2 className="text-ink font-serif text-2xl">Problem</h2>
          <p className="mt-3">
            Diaspora groceries are fragmented across groups, messaging chains, and luck. There is no
            trusted, EU-wide layer for &quot;who near me—or on my route—has this niche thing right
            now?&quot;
          </p>
        </section>
        <section>
          <h2 className="text-ink font-serif text-2xl">Mobility context</h2>
          <p className="mt-3">
            Large-scale cross-border residence inside Europe is a long-documented statistical fact.
            We cite official publications from 2007 and earlier (plus Eurostat&apos;s first 2007
            headline release, documented in 2008) when we need that framing—see{' '}
            <Link href="/sources" className="text-ink underline underline-offset-4">
              /sources
            </Link>
            . We do <em>not</em> treat a headline &quot;millions&quot; number as revenue TAM without
            a defined cohort and a matching source.
          </p>
        </section>
        <section>
          <h2 className="text-ink font-serif text-2xl">Solution</h2>
          <p className="mt-3">
            Eushop is discovery + messaging with privacy-preserving cells: trip reservations use an
            agreed slot fee; local shares and requests keep finder&apos;s-fee wording where it
            matches the schema. Handoffs stay in public. Web, admin, and Expo share one design
            language and one API surface (tRPC + Postgres + Meili).
          </p>
        </section>
        <section>
          <h2 className="text-ink font-serif text-2xl">GTM</h2>
          <p className="mt-3">
            Seed dense corridors with community partners, then expand along rail hubs. Catalog is
            seeded; growth is user-generated listings, requests, and trip offers.
          </p>
        </section>
        <section>
          <h2 className="text-ink font-serif text-2xl">Ask</h2>
          <p className="mt-3">
            Capital to harden trust & safety, ship native payments rails where legal, and hire a
            small moderation pod per time zone. We&apos;re building the polite corner of European
            food peer trade.
          </p>
        </section>
      </div>
      <MarketingSourcesStrip />
    </EditorialPageLayout>
  );
}
