import Link from 'next/link';

import { EditorialPageLayout } from '../../../../components/marketing/editorial-page';

export const metadata = {
  title: 'Handoff protocol · Safety · Eushop',
  description:
    'How Eushop thinks about in-person handoffs, food safety expectations, and the trust layer we are building for institutional partners.',
};

export default function HandoffProtocolPage() {
  return (
    <EditorialPageLayout
      eyebrow="Safety · institutional"
      title="Handoff protocol."
      subtitle="What we promise today, what we are building for tomorrow, and what we will never pretend to be."
    >
      <article className="text-ink/80 max-w-2xl space-y-10 text-lg leading-relaxed text-pretty">
        <section>
          <h2 className="text-ink font-serif text-2xl">What Eushop is</h2>
          <p className="mt-3">
            A discovery and messaging layer between private individuals. We match diaspora
            travellers who have spare suitcase capacity with neighbours who want a taste of home. We
            do not import, warehouse, refrigerate, or ship. We do not touch the cash that changes
            hands at the café table unless and until regulated in-app payments are live in your
            jurisdiction.
          </p>
        </section>

        <section>
          <h2 className="text-ink font-serif text-2xl">The public handoff rule</h2>
          <p className="mt-3">
            Every first meeting should happen in a busy, well-lit, third place — a station
            concourse, a chain café, a hotel lobby during daylight hours. We surface this in product
            copy, in onboarding, and in the report flow when someone tries to steer a buyer toward a
            private residence on day one.
          </p>
        </section>

        <section>
          <h2 className="text-ink font-serif text-2xl">Food safety &amp; labelling</h2>
          <p className="mt-3">
            Parties inspect seals, expiry dates, and packaging at the handoff. If anything looks
            wrong, the answer is always to walk away — no reputation score is worth a hospital trip.
            Commercial sellers are not permitted on the personal marketplace lane; anything that
            looks like bulk import is routed to human moderation.
          </p>
          <p className="mt-3">
            Product imagery sourced from Open Food Facts is labelled in-app under CC-BY-SA 4.0.
            User-uploaded photos are re-hosted on our infrastructure so EXIF location data does not
            leak back into the wild.
          </p>
        </section>

        <section>
          <h2 className="text-ink font-serif text-2xl">
            Identity &amp; the verified-bringer roadmap
          </h2>
          <p className="mt-3">
            Today we rely on community norms, mutual reviews after successful handoffs, and a
            moderation queue with a 48-hour SLA. The next financing milestone explicitly budgets a{' '}
            <strong className="text-ink font-medium">verified-bringer</strong> attestation —
            passport-country match via a Tier-1 KYC vendor (Veriff / Onfido class) — so that a
            &quot;flying PL → DE next Friday&quot; badge is cryptographically boring to fake.
          </p>
          <p className="mt-3">
            That badge will be optional at first, then strongly recommended for anyone posting trip
            capacity above a threshold of active reservations. Buyers always retain the right to
            decline a seller without the badge; the market will price the difference.
          </p>
        </section>

        <section>
          <h2 className="text-ink font-serif text-2xl">Privacy by geometry</h2>
          <p className="mt-3">
            Listings, requests, and trip endpoints are pinned to a five-kilometre geohash cell. Map
            pins are deterministically jittered inside that cell. We can show this line-by-line in
            diligence — the database never stores a buyer&apos;s kitchen GPS from a casual browse.
          </p>
        </section>

        <section>
          <h2 className="text-ink font-serif text-2xl">When something goes wrong</h2>
          <p className="mt-3">
            Report buttons exist on listings, requests, trips, and every message thread. Repeat
            patterns (ghosting after payment promises, pressure to leave the platform, harassment)
            escalate automatically in our internal tooling. We can export moderation statistics for
            data-room review without exposing individual messages.
          </p>
        </section>

        <p className="text-ink/60 text-sm">
          Questions from insurers, marketplaces regulators, or LP diligence?{' '}
          <Link href="/investors" className="text-ink underline underline-offset-4">
            /investors
          </Link>{' '}
          (token-gated deck) and live operating numbers at{' '}
          <Link href="/traction" className="text-ink underline underline-offset-4">
            /traction
          </Link>
          .
        </p>

        <p className="text-ink/60 text-sm">
          <Link href="/safety" className="text-ink underline underline-offset-4">
            ← Back to general safety
          </Link>
        </p>
      </article>
    </EditorialPageLayout>
  );
}
