import { ArrowRight } from 'lucide-react';
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
import { KpiStrip } from '../components/marketing/kpi-strip';
import { LiveDiscover, type LiveListingCard } from '../components/marketing/live-discover';
import { MobilePreview } from '../components/marketing/mobile-preview';
import { api } from '../lib/trpc-server';
import { isDemoModeEnabled } from '../lib/demo-mode';
import { showcaseListings } from '../lib/showcase';
import { COUNTRIES } from '@eushop/catalog-data';

function showcaseCards(): LiveListingCard[] {
  // Showcase listings are deterministic, drawn from the curated catalog, and
  // shown only when the demo cookie is set (see lib/demo-mode.ts). They use
  // a country-tinted swatch instead of a fake photo so nothing on the page
  // pretends to be a real product photo.
  return showcaseListings().map((s) => ({
    id: s.id,
    freeformName: s.itemName,
    approximateCity: s.city,
    countryIso2: s.countryIso2,
    finderFee: s.finderFee.toFixed(2),
    photos: [],
    point: { lat: 50, lng: 10 },
  }));
}

export default async function HomePage() {
  const t = await getTranslations();
  const demo = await isDemoModeEnabled();
  let categories: Awaited<ReturnType<Awaited<ReturnType<typeof api>>['catalog']['categories']>> =
    [];
  let liveCards: LiveListingCard[] = [];
  try {
    const trpc = await api();
    categories = await trpc.catalog.categories();
    const recent = await trpc.listings.recent({ limit: 12 });
    liveCards = recent.map((r) => ({
      id: r.id,
      freeformName: r.freeformName,
      approximateCity: r.approximateCity,
      countryIso2: r.countryIso2,
      finderFee: r.finderFee,
      photos: r.photos,
      point: r.point,
    }));
  } catch {
    /* offline */
  }
  if (liveCards.length === 0 && demo) liveCards = showcaseCards();
  const featuredCountries = ['PL', 'IT', 'DE', 'GR', 'FR', 'NL', 'ES', 'PT', 'FI', 'IE'];
  const countries = COUNTRIES.filter((c) => featuredCountries.includes(c.iso2));

  return (
    <>
      <Nav />
      <main id="main-content">
        <Hero />
        <KpiStrip />
        <LiveDiscover listings={liveCards} />

        <section className="container-editorial mt-24">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-ash text-xs tracking-widest uppercase">From around the union</p>
              <h2 className="text-ink mt-2 font-serif text-4xl md:text-5xl">
                A taste of {countries.length} home countries.
              </h2>
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
          <p className="text-ash text-xs tracking-widest uppercase">Browse by craving</p>
          <h2 className="text-ink mt-2 font-serif text-4xl md:text-5xl">Categories.</h2>
          <CategoryShelf categories={categories} />
        </section>

        <MobilePreview />

        <EditorialBlock
          eyebrow="A new kind of marketplace"
          title="The neighbour with the suitcase, found."
          body="Eushop is not a shop. We are the introduction. Someone in your city brought back the Krówki, the Mastiha, the Sült. Set a small finder's fee, share approximate location, agree on a coffee-shop handoff. We just make the meeting possible."
          ctaLabel={t('cta.postListing')}
          ctaHref="/listings/new"
        />

        <section className="container-editorial mt-24 grid gap-8 md:grid-cols-3">
          <Pillar
            title="Approximate, on purpose."
            body="We never reveal precise addresses. Pins jitter inside a 5 km cell — meet at a café, a metro stop, your office lobby. Up to you."
          />
          <Pillar
            title="Niche, not bulk."
            body="No commercial sellers. Just neighbours sharing what they brought back from a trip home. Single jars. Half a chocolate box. The good stuff."
          />
          <Pillar
            title="No payments handled."
            body="You agree the finder's fee in chat and settle in person. Cash, Revolut, your call. We never touch your money."
          />
        </section>

        <section className="container-editorial bg-ink text-paper mt-32 rounded-[2.5rem] p-10 md:p-16">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-xl">
              <Badge variant="accent">Open beta · 2026</Badge>
              <h2 className="mt-4 font-serif text-4xl md:text-5xl">{t('cta.postListing')}</h2>
              <p className="text-paper/70 mt-3">
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

function Pillar({ title, body }: { title: string; body: string }) {
  return (
    <div className="border-ink/10 bg-porcelain rounded-3xl border p-8">
      <h3 className="text-ink font-serif text-2xl">{title}</h3>
      <p className="text-ash mt-3 text-sm">{body}</p>
    </div>
  );
}
