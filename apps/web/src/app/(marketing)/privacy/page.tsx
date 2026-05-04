import { Footer } from '../../../components/layout/footer';
import { Nav } from '../../../components/layout/nav';

export default function PrivacyPage() {
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
              <strong>Lodge a complaint:</strong> contact your national supervisory authority.
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
          <p className="text-ash mt-10 text-xs">
            Last reviewed {new Date().toISOString().slice(0, 10)}
          </p>
        </article>
      </main>
      <Footer />
    </>
  );
}
