import Link from 'next/link';
import { Footer } from '../../../../components/layout/footer';
import { Nav } from '../../../../components/layout/nav';
import { PayoutReadinessCallout } from '../../../../components/payments/payout-readiness-callout';
import { TripOfferForm } from '../../../../components/trips/trip-offer-form';

export const metadata = {
  title: 'Post a trip',
  description: 'Share spare bag space on a trip you are already taking.',
  openGraph: {
    title: 'Post a trip · Eushop',
    description: 'Share spare bag space on a trip you are already taking.',
  },
};

export default async function NewTripPage() {
  return (
    <>
      <Nav />
      <main id="main-content" className="container-editorial py-16">
        <nav aria-label="Breadcrumb" className="text-ash text-xs">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/trips" className="hover:text-ink underline-offset-2 hover:underline">
                Trips
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-ink/70" aria-current="page">
              New
            </li>
          </ol>
        </nav>
        <p className="text-ash mt-6 text-xs tracking-widest uppercase">Trip offer</p>
        <h1 className="text-ink mt-3 font-serif text-5xl">
          Post the trip you&apos;re already taking.
        </h1>
        <p className="text-ink/70 mt-4 max-w-2xl text-lg">
          Set the route, the date, and how many bag slots you can spare. Buyers in your destination
          city reserve slots; you confirm what you can bring. When Stripe Connect is enabled for
          your account, we place a card hold at reservation time and capture a small platform fee
          when you confirm—everything else is routed to your connected account.
        </p>
        <PayoutReadinessCallout />
        <div className="border-ink/10 bg-paper mt-12 rounded-3xl border p-8 md:p-10">
          <TripOfferForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
