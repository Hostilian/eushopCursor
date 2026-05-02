import { Footer } from '../../components/layout/footer';
import { Nav } from '../../components/layout/nav';

export default function TermsPage() {
  return (
    <>
      <Nav />
      <main className="container-editorial pt-16 pb-32">
        <p className="text-ash text-xs tracking-widest uppercase">Terms</p>
        <h1 className="text-ink mt-3 font-serif text-5xl md:text-6xl">The deal.</h1>
        <article className="prose prose-stone text-ink/80 mt-12 max-w-2xl leading-relaxed">
          <h2 className="text-ink mt-10 font-serif text-2xl">What Eushop is</h2>
          <p>
            A discovery and messaging service that helps private individuals find each other to
            share niche European foods. We are <strong>not</strong> a marketplace operator, food
            retailer, or payment processor. We do not handle the goods or the money.
          </p>

          <h2 className="text-ink mt-10 font-serif text-2xl">Private use only</h2>
          <p>
            Listings must be private, occasional and non-commercial. Commercial sellers, food
            businesses and importers are not welcome on Eushop and may be removed without notice.
          </p>

          <h2 className="text-ink mt-10 font-serif text-2xl">Food safety</h2>
          <p>
            You alone are responsible for the safety, quality and legality of any food you share or
            buy. Always check seals, expiry dates, allergens and import restrictions. Some products
            (raw dairy, certain meats, alcohol above local thresholds) may be restricted in your
            country — it is on you to know.
          </p>

          <h2 className="text-ink mt-10 font-serif text-2xl">Money &amp; finder's fees</h2>
          <p>
            Buyers and sellers settle the finder's fee directly, typically in cash or a peer-to-peer
            payment app. Eushop never takes a cut and never holds funds. Disputes about money are
            between the two of you.
          </p>

          <h2 className="text-ink mt-10 font-serif text-2xl">Behaviour</h2>
          <p>
            Be kind. No harassment, no scams, no commercial spam. Report abuse. We will remove
            content and suspend accounts that violate this.
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
