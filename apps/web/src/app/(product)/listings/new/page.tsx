import Link from 'next/link';
import { Footer } from '../../../../components/layout/footer';
import { Nav } from '../../../../components/layout/nav';
import { ListingForm } from '../../../../components/listings/listing-form';
import { PayoutReadinessCallout } from '../../../../components/payments/payout-readiness-callout';

export const metadata = {
  title: 'Share what you brought',
  description: 'Post a finder-fee listing for what you brought back. Approximate city only.',
  openGraph: {
    title: 'Share what you brought · Eushop',
    description: 'Post a finder-fee listing for what you brought back. Approximate city only.',
  },
};

export default async function NewListingPage() {
  return (
    <>
      <Nav />
      <main id="main-content" className="container-editorial pt-16 pb-32">
        <nav aria-label="Breadcrumb" className="text-ash text-xs">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/discover" className="hover:text-ink underline-offset-2 hover:underline">
                Discover
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-ink/70" aria-current="page">
              Share
            </li>
          </ol>
        </nav>
        <p className="text-ash mt-6 text-xs tracking-widest uppercase">Step into the kitchen</p>
        <h1 className="text-ink mt-3 font-serif text-5xl text-balance md:text-6xl">
          Share what you brought back.
        </h1>
        <p className="text-ink/70 mt-4 max-w-xl text-lg">
          A few photos, a finder&apos;s fee, an approximate neighbourhood. We never publish your
          exact address. If you also post trips, complete Connect payouts so travellers can take
          card-backed reservations on those routes.
        </p>
        <PayoutReadinessCallout />
        <div className="mt-12 max-w-3xl">
          <ListingForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
