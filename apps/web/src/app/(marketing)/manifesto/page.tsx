import { EditorialPageLayout } from '../../../components/marketing/editorial-page';
import { MarketingSourcesStrip } from '../../../components/marketing/marketing-sources-strip';

export const metadata = {
  title: 'Manifesto · Eushop',
  description:
    'Suitcase capacity is the new last-mile. The Eushop manifesto for a polite, peer-powered diaspora marketplace.',
};

export default function ManifestoPage() {
  return (
    <EditorialPageLayout
      eyebrow="Manifesto"
      title="Suitcase capacity is the new last-mile."
      subtitle="Every weekend someone is already crossing a border with room in the bag. The gap is coordination—not another freight company."
    >
      <article className="text-ink/80 max-w-2xl space-y-8 text-lg leading-relaxed text-pretty">
        <p>
          Every weekend a Polish nurse in Munich wires twenty euros to her cousin in Warsaw for a
          tube of Wedel chocolate, a packet of Krówki, a jar of Łowicz beetroot. The cousin walks
          three hundred metres to a corner shop, pays four euros, hands the bag to a friend who is
          already booked on Saturday&apos;s LO 369 to Munich, and the next morning the chocolate is
          on a kitchen table in Schwabing.
        </p>
        <p>
          The transaction works. The transaction has always worked. What it lacks is a coordination
          layer that two strangers from the same country, who haven&apos;t met yet, can both trust.
        </p>
        <p>That coordination layer is Eushop.</p>

        <hr className="border-ink/10" />

        <h2 className="text-ink font-serif text-3xl">Three convictions</h2>

        <h3 className="text-ink font-serif text-xl">
          1. The marginal cost of a suitcase slot is zero.
        </h3>
        <p>
          Diaspora travel is already booked, already paid for, already at the airport. Three empty
          kilos in a checked bag are a wasted resource the way an empty Uber seat was a wasted
          resource in 2008. We are the matchmaker, not the carrier.
        </p>

        <h3 className="text-ink font-serif text-xl">2. The product is the introduction.</h3>
        <p>
          We will not import. We will not warehouse. We will not pretend to be a courier company.
          The handoff stays human, in a café, in a public square, between two people who chose each
          other. We charge a small platform fee on the reservation — that is all.
        </p>

        <h3 className="text-ink font-serif text-xl">3. Trust is the moat. Privacy is the floor.</h3>
        <p>
          Every map we render is a five-kilometre cell with a deterministic jitter. Every chat is
          end-of-conversation expirable. Every piece of personal data lives in a Hetzner rack in
          Falkenstein. We can prove this in code, line by line.
        </p>

        <hr className="border-ink/10" />

        <h2 className="text-ink font-serif text-3xl">What we will not do</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>We will not sell ads against your search for &quot;Aromat&quot;.</li>
          <li>We will not let commercial importers post under a personal profile.</li>
          <li>We will not charge buyers for the privilege of finding their own neighbours.</li>
          <li>
            We will not pretend to handle customs declarations, allergen labelling, or cold-chain
            logistics. Those are not our promises to keep.
          </li>
          <li>We will not export this trust graph to anyone, ever.</li>
        </ul>

        <hr className="border-ink/10" />

        <h2 className="text-ink font-serif text-3xl">Why now</h2>
        <p>
          Post-Brexit re-shoring. Inflation that turned a €4 import into a €19 import. Open Food
          Facts maturing into a serious commons. The first cohort of European founders comfortable
          building a marketplace that is small, polite, and unapologetically EU-first.
        </p>
        <p>The neighbour with the suitcase is already there. We are just turning on the light.</p>

        <hr className="border-ink/10" />

        <p className="text-ink/60 text-sm">
          — The Eushop founding team. Munich, Warsaw, Lisbon, Athens, Tallinn.
        </p>
      </article>
      <MarketingSourcesStrip />
    </EditorialPageLayout>
  );
}
