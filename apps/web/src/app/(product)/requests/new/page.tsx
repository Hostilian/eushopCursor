import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Footer } from '../../../../components/layout/footer';
import { Nav } from '../../../../components/layout/nav';
import { PayoutReadinessCallout } from '../../../../components/payments/payout-readiness-callout';
import { RequestForm } from '../../../../components/requests/request-form';

export const metadata = {
  title: 'Post a request',
  description:
    "Say what you're looking for, set an optional max finder's fee, and we'll surface nearby listings and matching trips.",
  openGraph: {
    title: 'Post a request · Eushop',
    description:
      "Say what you're looking for, set an optional max finder's fee, and we'll surface nearby listings and matching trips.",
  },
};

export default async function NewRequestPage() {
  const t = await getTranslations('requestsNew');
  return (
    <>
      <Nav />
      <main id="main-content" className="container-editorial pt-16 pb-32">
        <nav aria-label="Breadcrumb" className="text-ash text-xs">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/requests" className="hover:text-ink underline-offset-2 hover:underline">
                Requests
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-ink/70" aria-current="page">
              New
            </li>
          </ol>
        </nav>
        <p className="text-ash mt-6 text-xs tracking-widest uppercase">Make it known</p>
        <h1 className="text-ink mt-3 font-serif text-5xl text-balance md:text-6xl">
          Tell us what to find.
        </h1>
        <p className="text-ink/70 mt-4 max-w-xl text-lg">
          Set a max finder&apos;s fee, a radius, and we&rsquo;ll ping you the moment a matching
          listing lands within reach.
        </p>
        <p className="text-ink/65 mt-6 max-w-2xl text-sm leading-relaxed">{t('explainerHint')}</p>
        <PayoutReadinessCallout />
        <div className="mt-8 max-w-3xl">
          <RequestForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
