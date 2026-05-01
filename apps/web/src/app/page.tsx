import { ArrowRight, MapPin, Sparkles } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Footer } from '../components/layout/footer';
import { Nav } from '../components/layout/nav';
import { ConsentBanner } from '../components/layout/consent-banner';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Hero } from '../components/marketing/hero';
import { CountryRail } from '../components/marketing/country-rail';
import { CategoryShelf } from '../components/marketing/category-shelf';
import { EditorialBlock } from '../components/marketing/editorial-block';
import { api } from '../lib/trpc-server';
import { COUNTRIES } from '@eushop/catalog-data';

export default async function HomePage() {
  const t = await getTranslations();
  let categories: Awaited<ReturnType<Awaited<ReturnType<typeof api>>['catalog']['categories']>> = [];
  try {
    const trpc = await api();
    categories = await trpc.catalog.categories();
  } catch {
    // DB might not be running locally — render with empty rails. UI still demonstrates.
  }
  const featuredCountries = ['PL', 'IT', 'DE', 'GR', 'FR', 'NL', 'ES', 'PT', 'FI', 'IE'];
  const countries = COUNTRIES.filter((c) => featuredCountries.includes(c.iso2));

  return (
    <>
      <Nav />
      <main>
        <Hero />

        <section className="container-editorial mt-24">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-widest text-ash">From around the union</p>
              <h2 className="mt-2 font-serif text-4xl text-ink md:text-5xl">A taste of {countries.length} home countries.</h2>
            </div>
            <Button asChild variant="link">
              <Link href="/countries" className="hidden sm:flex">
                See all {COUNTRIES.length} <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <CountryRail countries={countries} />
        </section>

        <section className="container-editorial mt-24">
          <p className="text-xs uppercase tracking-widest text-ash">Browse by craving</p>
          <h2 className="mt-2 font-serif text-4xl text-ink md:text-5xl">Categories.</h2>
          <CategoryShelf categories={categories} />
        </section>

        <EditorialBlock
          eyebrow="A new kind of marketplace"
          title="The neighbour with the suitcase, found."
          body="Eushop is not a shop. We are the introduction. Someone in your city brought back the Krówki, the Mastiha, the Sült. Set a small finder's fee, share approximate location, agree on a coffee-shop handoff. We just make the meeting possible."
          ctaLabel={t('cta.postListing')}
          ctaHref="/listings/new"
        />

        <section className="container-editorial mt-24 grid gap-8 md:grid-cols-3">
          <Pillar
            icon={<MapPin className="h-5 w-5" />}
            title="Approximate, on purpose."
            body="We never reveal precise addresses. Pins jitter inside a 5 km cell — meet at a café, a metro stop, your office lobby. Up to you."
          />
          <Pillar
            icon={<Sparkles className="h-5 w-5" />}
            title="Niche, not bulk."
            body="No commercial sellers. Just neighbours sharing what they brought back from a trip home. Single jars. Half a chocolate box. The good stuff."
          />
          <Pillar
            icon={<MapPin className="h-5 w-5" />}
            title="No payments handled."
            body="You agree the finder's fee in chat and settle in person. Cash, Revolut, your call. We never touch your money."
          />
        </section>

        <section className="container-editorial mt-32 rounded-[2.5rem] bg-ink p-10 text-paper md:p-16">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-xl">
              <Badge variant="accent">Open beta · 2026</Badge>
              <h2 className="mt-4 font-serif text-4xl md:text-5xl">{t('cta.postListing')}</h2>
              <p className="mt-3 text-paper/70">
                Brought back a tin of Wedel, a wheel of Manchego, a tube of Aromat? Share it within
                a 5 km cell of where you live and earn a small finder's fee.
              </p>
            </div>
            <Button asChild variant="accent" size="lg">
              <Link href="/listings/new">
                Start a listing <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
      <ConsentBanner />
    </>
  );
}

function Pillar({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-3xl border border-ink/10 bg-porcelain p-8">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-saffron-100 text-saffron-700">
        {icon}
      </div>
      <h3 className="mt-6 font-serif text-2xl text-ink">{title}</h3>
      <p className="mt-3 text-sm text-ash">{body}</p>
    </div>
  );
}
