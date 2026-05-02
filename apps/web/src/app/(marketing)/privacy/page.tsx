import { Footer } from '../../components/layout/footer';
import { Nav } from '../../components/layout/nav';

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
              Payment data. Eushop does not process payments — buyers and sellers settle
              off-platform.
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
            Postgres &amp; Meilisearch on Hetzner Falkenstein, Germany. Media on Cloudflare R2 EU
            region. Email via Resend EU. Analytics via self-hosted PostHog inside our cluster.
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
