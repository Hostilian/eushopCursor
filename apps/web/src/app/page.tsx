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
              <p className="text-ash text-xs tracking-widest uppercase">
                {t('home.countriesEyebrow')}
              </p>
              <h2 className="text-ink mt-2 font-serif text-4xl md:text-5xl">
                {t('home.countriesHeading', { count: countries.length })}
              </h2>
            </div>
            <Button asChild variant="link">
              <Link href="/countries" className="hidden sm:flex">
                {t('home.countriesSeeAll', { count: COUNTRIES.length })}{' '}
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <CountryRail countries={countries} />
        </section>

        <section className="container-editorial mt-24">
          <p className="text-ash text-xs tracking-widest uppercase">
            {t('home.categoriesEyebrow')}
          </p>
          <h2 className="text-ink mt-2 font-serif text-4xl md:text-5xl">
            {t('home.categoriesHeading')}
          </h2>
          <CategoryShelf categories={categories} />
        </section>

        <MobilePreview />

        <EditorialBlock
          eyebrow={t('home.editorialEyebrow')}
          title={t('home.editorialTitle')}
          body={t('home.editorialBody')}
          ctaLabel={t('cta.postListing')}
          ctaHref="/listings/new"
        />

        <section className="container-editorial mt-24 grid gap-8 md:grid-cols-3">
          <Pillar title={t('home.pillar1Title')} body={t('home.pillar1Body')} />
          <Pillar title={t('home.pillar2Title')} body={t('home.pillar2Body')} />
          <Pillar title={t('home.pillar3Title')} body={t('home.pillar3Body')} />
        </section>

        <section className="container-editorial bg-ink text-paper mt-32 rounded-[2.5rem] p-10 md:p-16">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-xl">
              <Badge variant="accent">Open beta · 2026</Badge>
              <h2 className="mt-4 font-serif text-4xl md:text-5xl">{t('cta.postListing')}</h2>
              <p className="text-paper/70 mt-3">{t('home.ctaBandBody')}</p>
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
