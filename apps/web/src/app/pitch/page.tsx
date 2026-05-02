import { EditorialPageLayout } from '../../components/marketing/editorial-page';

export default function PitchPage() {
  return (
    <EditorialPageLayout
      eyebrow="Investor narrative"
      title="Eushop in one sitting."
      subtitle="Problem, market, wedge, GTM, and what we need next."
    >
      <div className="text-ink/80 max-w-2xl space-y-10 text-lg leading-relaxed text-pretty">
        <section>
          <h2 className="text-ink font-serif text-2xl">Problem</h2>
          <p className="mt-3">
            Diaspora groceries are fragmented across Facebook groups, WhatsApp chains, and luck.
            There is no trusted, EU-wide layer for &quot;who near me has this niche thing right
            now?&quot;
          </p>
        </section>
        <section>
          <h2 className="text-ink font-serif text-2xl">Market</h2>
          <p className="mt-3">
            16M+ intra-EU movers, plus students and seasonal workers. Every corridor has suitcase
            traffic — we monetise attention and trust, not the goods themselves.
          </p>
        </section>
        <section>
          <h2 className="text-ink font-serif text-2xl">Solution</h2>
          <p className="mt-3">
            Eushop is discovery + messaging with privacy-preserving cells, finder&apos;s fees agreed
            in chat, and handoffs in public. Web, admin, and Expo share one design language and one
            API surface (tRPC + Postgres + Meili).
          </p>
        </section>
        <section>
          <h2 className="text-ink font-serif text-2xl">GTM</h2>
          <p className="mt-3">
            Seed dense corridors (Munich–Warsaw, Lisbon–Athens, Berlin–Tallinn) with community
            partners, then expand along rail hubs. Catalog is seeded; growth is user-generated
            listings and requests.
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
    </EditorialPageLayout>
  );
}
