import { Footer } from '../../../components/layout/footer';
import { Nav } from '../../../components/layout/nav';
import {
  getAllCountryLegalFrameworks,
  getCountryLegalFramework,
} from '../../../lib/legal-frameworks';

const LAST_REVIEWED = '2026-05-05';

export default async function PrivacyPage({
  searchParams,
}: {
  searchParams: Promise<{ country?: string }>;
}) {
  const { country } = await searchParams;
  const selected = country ? getCountryLegalFramework(country) : null;
  const allFrameworks = getAllCountryLegalFrameworks();

  return (
    <>
      <Nav />
      <main className="container-editorial pt-16 pb-32">
        <p className="text-ash text-xs tracking-widest uppercase">Privacy</p>
        <h1 className="text-ink mt-3 font-serif text-5xl md:text-6xl">How we treat your data.</h1>
        <article className="prose prose-stone text-ink/80 mt-12 max-w-2xl leading-relaxed">
          <p>
            Eushop is built in and for the European Union. We follow GDPR strictly, store everything
            inside the EU, and design every feature to collect the minimum data necessary.
          </p>
          <h2 className="text-ink mt-10 font-serif text-2xl">What we store</h2>
          <ul className="ml-5 list-disc space-y-1">
            <li>Your email and the magic-link sign-in events.</li>
            <li>Your profile (display name, home country, current country, optional city).</li>
            <li>Your listings and requests, including a 5 km approximate location cell.</li>
            <li>Messages exchanged inside the app and reviews you write.</li>
            <li>Optional analytics events (off by default; you choose in the consent banner).</li>
          </ul>
          <h2 className="text-ink mt-10 font-serif text-2xl">What we never store</h2>
          <ul className="ml-5 list-disc space-y-1">
            <li>
              Your precise address. We hash to a 5 km cell server-side and never serve the raw point
              to clients.
            </li>
            <li>
              <strong>Payments:</strong> For trip checkout, card data is processed by our payment
              partner (e.g. Stripe). We do not store full card numbers or CVC. We may store
              transaction metadata (amounts, currency, reservation ids, payment intent references)
              for support and reconciliation.
            </li>
            <li>
              <strong>Identity verification (optional):</strong> If you use a verified-bringing or
              similar programme, a verification vendor may process identity documents; we store the
              outcome (e.g. badge flags) and references as described in our processor agreements.
            </li>
            <li>Your phone number unless you choose to verify it for the trust badge.</li>
          </ul>
          <h2 className="text-ink mt-10 font-serif text-2xl">Your rights</h2>
          <ul className="ml-5 list-disc space-y-1">
            <li>
              <strong>Access &amp; portability (Art. 15, 20):</strong> export everything as JSON
              from your profile.
            </li>
            <li>
              <strong>Erasure (Art. 17):</strong> delete your account from your profile; cascading
              deletes wipe listings, requests and chats.
            </li>
            <li>
              <strong>Objection (Art. 21):</strong> opt out of analytics in the consent banner at
              any time.
            </li>
            <li>
              <strong>Lodge a complaint:</strong> contact your national supervisory authority. We
              link the country directory below.
            </li>
          </ul>
          <h2 className="text-ink mt-10 font-serif text-2xl">Country legal frameworks</h2>
          <p>
            Eushop supports country-specific legal contexts. Pick your country code to review the
            applicable privacy, consumer, and food-transfer framework before listing or reserving.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {allFrameworks.map((entry) => (
              <a
                key={entry.iso2}
                href={`/privacy?country=${entry.iso2}`}
                className={`rounded-full border px-3 py-1 text-xs tracking-widest uppercase ${
                  selected?.iso2 === entry.iso2
                    ? 'border-ink bg-ink text-paper'
                    : 'border-ink/20 text-ink/70'
                }`}
              >
                {entry.iso2}
              </a>
            ))}
          </div>
          {selected ? (
            <div className="border-ink/10 mt-6 rounded-2xl border bg-white p-6">
              <p className="text-ash text-xs tracking-widest uppercase">
                {selected.countryName} ({selected.iso2})
              </p>
              <ul className="mt-3 ml-5 list-disc space-y-2">
                <li>
                  <strong>Privacy:</strong> {selected.privacyFramework}
                </li>
                <li>
                  <strong>Commerce:</strong> {selected.commerceFramework}
                </li>
                <li>
                  <strong>Food transfer:</strong> {selected.foodSafetyFramework}
                </li>
                <li>
                  <strong>Authority:</strong>{' '}
                  <a
                    href={selected.authorityUrl}
                    rel="noopener noreferrer"
                    className="text-ink underline"
                  >
                    {selected.authorityName}
                  </a>
                </li>
              </ul>
              <p className="text-ink/70 mt-3 text-sm">{selected.note}</p>
            </div>
          ) : (
            <p className="text-ink/70 mt-4 text-sm">
              Add <code className="text-sm">?country=DE</code> (or any supported ISO2 code) to view
              country-specific legal framing.
            </p>
          )}
          <h2 className="text-ink mt-10 font-serif text-2xl">Mobile app (iOS + Android)</h2>
          <p>
            The Eushop mobile app (bundle <code className="text-sm">eu.eushop.app</code>) collects
            the same data as the web app, with these mobile-specific clauses:
          </p>
          <ul className="ml-5 list-disc space-y-1">
            <li>
              <strong>Camera &amp; photo library:</strong> only when you tap "Add photo" on a
              listing or profile. Images are uploaded to our EU object storage and shown in the
              listing or your profile only.
            </li>
            <li>
              <strong>Approximate location:</strong> we request only the coarse permission (Android{' '}
              <code className="text-sm">ACCESS_COARSE_LOCATION</code>, iOS{' '}
              <code className="text-sm">When In Use</code>). Pins are deterministically jittered
              inside a 5 km cell before they leave your device.
            </li>
            <li>
              <strong>Push notifications:</strong> we register an Expo push token tied to your
              account so we can send new-message and trip-reservation alerts. Revoke at any time in
              your device settings or by deleting your account.
            </li>
            <li>
              <strong>Crash reports:</strong> when Sentry is configured we send anonymized stack
              traces (no message content, no contact info) to our EU Sentry instance to help fix
              bugs. This is part of operating the service and is not optional.
            </li>
            <li>
              <strong>App Tracking Transparency (iOS):</strong> Eushop never requests the IDFA and
              never tracks you across other apps. We declare this in the Privacy Nutrition Label as
              "Data Used to Track You: None".
            </li>
            <li>
              <strong>Android Advertising ID:</strong> never read. We do not link Play install
              campaigns to your account.
            </li>
            <li>
              <strong>OTA updates:</strong> small JavaScript-bundle updates are delivered via Expo
              Updates over HTTPS. Native code changes always require a fresh store build.
            </li>
          </ul>
          <h2 className="text-ink mt-10 font-serif text-2xl">Where the data lives</h2>
          <p>
            Typical production layout: Postgres and Meilisearch in the EU (e.g. Hetzner Falkenstein,
            Germany), media on Cloudflare R2 in an EU region, and transactional email via Resend
            (EU) when configured. Your deployment may differ—see the ops runbook.
          </p>
          <p>
            <strong>Analytics (PostHog):</strong> We only initialise analytics after you opt in via
            the consent banner, and only when{' '}
            <code className="text-sm">NEXT_PUBLIC_POSTHOG_KEY</code> is set. You may point{' '}
            <code className="text-sm">NEXT_PUBLIC_POSTHOG_HOST</code> at{' '}
            <strong>EU PostHog Cloud</strong> or at a <strong>self-hosted PostHog</strong> instance
            you operate—see <code className="text-sm">docs/ops/zero-cost-stack.md</code> for the
            honest inventory and alternatives (Plausible, Matomo).
          </p>
          <p className="text-ash mt-10 text-xs">Last reviewed {LAST_REVIEWED}</p>
        </article>
      </main>
      <Footer />
    </>
  );
}
