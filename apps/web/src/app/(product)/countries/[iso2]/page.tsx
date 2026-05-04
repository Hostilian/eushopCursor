import { COUNTRIES, FOOD_ITEMS } from '@eushop/catalog';
import { countryPalette } from '@eushop/tokens';
import { EmptyState } from '@eushop/ui';
import type { Metadata } from 'next';
import { ArrowRight, MapPin } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Footer } from '../../../../components/layout/footer';
import { Nav } from '../../../../components/layout/nav';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { CountryHero } from '../../../../components/country/country-hero';

/** See items/[slug]/page — static prerender of many ISO routes fails on Windows workers. */
export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ iso2: string }>;
}): Promise<Metadata> {
  const { iso2 } = await params;
  const country = COUNTRIES.find((c) => c.iso2.toLowerCase() === iso2.toLowerCase());
  if (!country) return { title: 'Country' };
  const items = FOOD_ITEMS.filter((i) => i.originCountryIso2 === country.iso2);
  return {
    title: `${country.name} \u2014 ${items.length} catalog items`,
    description: `Eushop's editorial guide to ${country.name} foods. ${items.length} canonical items.`,
    openGraph: {
      title: `${country.name} \u00b7 Eushop`,
      description: `Regional foods from ${country.name}. ${items.length} items in the catalog.`,
    },
  };
}

export default async function CountryPage({ params }: { params: Promise<{ iso2: string }> }) {
  const { iso2 } = await params;
  const country = COUNTRIES.find((c) => c.iso2.toLowerCase() === iso2.toLowerCase());
  if (!country) notFound();
  const palette = countryPalette[country.iso2] ?? {
    primary: '#3B2F22',
    accent: '#FAF7F2',
    ink: '#1A1612',
  };
  const items = FOOD_ITEMS.filter((i) => i.originCountryIso2 === country.iso2);
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://eushop.eu';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${base}/#organization`,
        name: 'Eushop',
        url: base,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${base}/` },
          { '@type': 'ListItem', position: 2, name: 'Countries', item: `${base}/countries` },
          {
            '@type': 'ListItem',
            position: 3,
            name: country.name,
            item: `${base}/countries/${country.iso2.toLowerCase()}`,
          },
        ],
      },
    ],
  };

  return (
    <>
      <Nav />
      <main id="main-content">
        <div className="container-editorial pt-8">
          <nav aria-label="Breadcrumb" className="text-ash text-xs">
            <ol className="flex items-center gap-2">
              <li>
                <Link
                  href="/countries"
                  className="hover:text-ink underline-offset-2 hover:underline"
                >
                  Countries
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-ink/70" aria-current="page">
                {country.name}
              </li>
            </ol>
          </nav>
        </div>
        <CountryHero country={country} palette={palette} count={items.length} />

        <section className="container-editorial mt-24">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-ash text-xs tracking-widest uppercase">The catalog</p>
              <h2 className="text-ink mt-3 font-serif text-4xl">
                All {items.length} {country.name} items.
              </h2>
            </div>
            <Button asChild variant="link">
              <Link href={`/discover?country=${country.iso2}`}>
                See active listings <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {items.length === 0 ? (
            <EmptyState
              className="mt-10"
              icon={<span className="text-5xl">{country.flagEmoji}</span>}
              title="No canonical items yet."
              description={
                <>
                  We haven&rsquo;t indexed niche foods for {country.name} in the curated catalog
                  yet. Browse discover for live listings, or search the global catalog.
                </>
              }
              actions={
                <>
                  <Button asChild variant="primary">
                    <Link href="/discover">Open discover</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/search">Search catalog</Link>
                  </Button>
                </>
              }
            />
          ) : (
            <ul className="mt-10 grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
              {items.map((item) => (
                <li key={item.slug}>
                  <Link href={`/items/${item.slug}`} className="group block">
                    <div
                      className="border-ink/10 relative aspect-[4/5] overflow-hidden rounded-3xl border"
                      style={{
                        background: `linear-gradient(180deg, ${palette.primary}22, ${palette.primary}55)`,
                      }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-7xl opacity-30">{country.flagEmoji}</span>
                      </div>
                      <div className="absolute top-4 left-4">
                        <Badge variant="solid">{item.categorySlug}</Badge>
                      </div>
                    </div>
                    <p className="text-ink group-hover:text-saffron-700 mt-4 font-serif text-lg transition-colors">
                      {item.name}
                    </p>
                    <p className="text-ash mt-1 line-clamp-2 text-sm">{item.description}</p>
                    {item.aka?.length ? (
                      <p className="text-ash/60 mt-1 text-xs tracking-widest uppercase">
                        aka {item.aka[0]}
                      </p>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section
          className="container-editorial mt-32 rounded-[2.5rem] p-12"
          style={{ background: palette.primary, color: palette.accent }}
        >
          <Badge variant="outline" className="border-white/30 text-white">
            <MapPin className="h-3 w-3" /> Bring back next time
          </Badge>
          <h2 className="mt-4 font-serif text-4xl text-balance md:text-5xl">
            Heading home to {country.name} soon? Pre-list what you&apos;ll bring.
          </h2>
          <p className="mt-3 max-w-2xl opacity-80">
            Name a small finder&apos;s fee on the listing, mark when you&apos;re back, and
            neighbours can reserve before the suitcase even closes.
          </p>
          <Button asChild variant="accent" size="lg" className="mt-8">
            <Link href="/listings/new">
              Start a listing <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </section>
      </main>
      <Footer />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
