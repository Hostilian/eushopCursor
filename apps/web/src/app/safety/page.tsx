import { Footer } from '../../components/layout/footer';
import { Nav } from '../../components/layout/nav';

export default function SafetyPage() {
  return (
    <>
      <Nav />
      <main className="container-editorial pt-16 pb-32">
        <p className="text-xs uppercase tracking-widest text-ash">Safety</p>
        <h1 className="mt-3 font-serif text-5xl text-ink md:text-6xl">Meet smart.</h1>
        <article className="mt-12 max-w-2xl space-y-6 text-ink/80 leading-relaxed">
          <h2 className="font-serif text-2xl text-ink">Address privacy</h2>
          <p>
            We never reveal exact addresses. Listings are bucketed into 5 km cells, and the
            displayed pin is jittered inside that cell. You and the seller agree a meeting
            spot inside the chat.
          </p>

          <h2 className="font-serif text-2xl text-ink">Suggested meeting points</h2>
          <ul className="ml-5 list-disc space-y-1">
            <li>Cafés, bakeries, restaurants — busy and well-lit.</li>
            <li>Metro / S-Bahn / Tube station entrances.</li>
            <li>Office lobbies during business hours.</li>
            <li>Open squares with foot traffic.</li>
          </ul>

          <h2 className="font-serif text-2xl text-ink">Food safety</h2>
          <p>
            Always check seals, expiry dates and packaging integrity before you settle. If a
            product looks tampered with, walk away — Eushop will refund the meeting (a coffee,
            we'll pay for it) on a verified report. Some products may be restricted in your
            country; you're responsible for knowing local rules.
          </p>

          <h2 className="font-serif text-2xl text-ink">Reporting</h2>
          <p>
            Every listing, request and message has a Report button. Reports go straight to our
            moderation queue and are reviewed within 48 hours. Repeat offenders are removed.
          </p>
        </article>
      </main>
      <Footer />
    </>
  );
}
