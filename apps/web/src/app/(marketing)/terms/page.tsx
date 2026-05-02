import { Footer } from '../../../components/layout/footer';
import { Nav } from '../../../components/layout/nav';

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
            share taste-of-home foods. We are <strong>not</strong> the seller of the goods, a food
            retailer, or a carrier. Where trip checkout is enabled, we may provide payment
            infrastructure (authorization and settlement rails) between buyers and travellers
            through a licensed partner — you still contract for the handoff with the other person.
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

          <h2 className="text-ink mt-10 font-serif text-2xl">
            Money, finder&apos;s fees &amp; trip slots
          </h2>
          <p>
            For <strong>local listings</strong>, buyers and sellers usually settle the finder&apos;s
            fee directly (cash or a peer-to-peer app). Eushop does not process those payments.
          </p>
          <p id="trip-payments" className="mt-4">
            For <strong>trip reservations</strong>, when checkout is available, you may authorize a
            card <strong>hold</strong> for the agreed slot fee plus a small{' '}
            <strong>platform fee</strong> (capped at €1.50 or 12% of the slot fee, whichever is
            lower). The hold is only <strong>captured</strong> after the traveller confirms your
            booking. If the booking is cancelled in line with our flows, we release or refund the
            hold where the payment network allows.
          </p>
          <h2 id="refunds-disputes" className="text-ink mt-10 font-serif text-2xl">
            Refunds, disputes &amp; chargebacks
          </h2>
          <p>
            If something goes wrong, contact the other party in chat first. For card payments,
            refunds follow the rules of the card network and our payment partner. A{' '}
            <strong>chargeback</strong> is a separate process you may start with your bank or card
            issuer; outcomes are decided by them, not by Eushop. We do not guarantee any particular
            refund for peer-to-peer handoffs — see our role above.
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
