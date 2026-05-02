import { EditorialPageLayout } from '../../components/marketing/editorial-page';

export default function SafetyPage() {
  return (
    <EditorialPageLayout
      eyebrow="Safety"
      title="Meet smart."
      subtitle="Privacy-first locations and clear expectations for every handoff."
    >
      <article className="text-ink/80 max-w-2xl space-y-10 leading-relaxed">
        <section>
          <h2 className="text-ink font-serif text-2xl">Address privacy</h2>
          <p className="mt-3">
            We never reveal exact addresses. Listings are bucketed into 5 km cells, and the
            displayed pin is jittered inside that cell. You and the seller agree a meeting spot
            inside the chat.
          </p>
        </section>

        <section>
          <h2 className="text-ink font-serif text-2xl">Suggested meeting points</h2>
          <ul className="mt-3 ml-5 list-disc space-y-1">
            <li>Cafés, bakeries, restaurants — busy and well-lit.</li>
            <li>Metro / S-Bahn / Tube station entrances.</li>
            <li>Office lobbies during business hours.</li>
            <li>Open squares with foot traffic.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-ink font-serif text-2xl">Food safety</h2>
          <p className="mt-3">
            Always check seals, expiry dates and packaging integrity before you settle. If a product
            looks tampered with, walk away. Some products may be restricted in your country;
            you&apos;re responsible for knowing local rules.
          </p>
        </section>

        <section>
          <h2 className="text-ink font-serif text-2xl">Reporting</h2>
          <p className="mt-3">
            Every listing, request and message has a Report button. Reports go straight to our
            moderation queue and are reviewed within 48 hours. Repeat offenders are removed.
          </p>
        </section>
      </article>
    </EditorialPageLayout>
  );
}
