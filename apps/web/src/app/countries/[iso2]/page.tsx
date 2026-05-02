import { COUNTRIES, FOOD_ITEMS } from '@eushop/catalog-data';
import { countryPalette } from '@eushop/design-tokens';
import { ArrowRight, MapPin } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Footer } from '../../../components/layout/footer';
import { Nav } from '../../../components/layout/nav';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { CountryHero } from '../../../components/country/country-hero';

export function generateStaticParams() {
  return COUNTRIES.map((c) => ({ iso2: c.iso2.toLowerCase() }));
}

export default async function CountryPage({ params }: { params: Promise<{ iso2: string }> }) {
  const { iso2 } = await params;
  const country = COUNTRIES.find((c) => c.iso2.toLowerCase() === iso2.toLowerCase());
  if (!country) notFound();
  const palette = countryPalette[country.iso2] ?? { primary: '#3B2F22', accent: '#FAF7F2', ink: '#1A1612' };
  const items = FOOD_ITEMS.filter((i) => i.originCountryIso2 === country.iso2);

  return (
    <>
      <Nav />
      <main>
        <CountryHero country={country} palette={palette} count={items.length} />

        <section className="container-editorial mt-24">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-ash">The catalog</p>
              <h2 className="mt-3 font-serif text-4xl text-ink">All {items.length} {country.name} items.</h2>
            </div>
            <Button asChild variant="link">
              <Link href={`/discover?country=${country.iso2}`}>
                See active listings <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <ul className="mt-10 grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
            {items.map((item) => (
              <li key={item.slug}>
                <Link href={`/items/${item.slug}`} className="group block">
                  <div
                    className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-ink/10"
                    style={{ background: `linear-gradient(180deg, ${palette.primary}22, ${palette.primary}55)` }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-7xl opacity-30">{country.flagEmoji}</span>
                    </div>
                    <div className="absolute left-4 top-4">
                      <Badge variant="solid">{item.categorySlug}</Badge>
                    </div>
                  </div>
                  <p className="mt-4 font-serif text-lg text-ink transition-colors group-hover:text-saffron-700">
                    {item.name}
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm text-ash">{item.description}</p>
                  {item.aka?.length ? (
                    <p className="mt-1 text-xs uppercase tracking-widest text-ash/60">aka {item.aka[0]}</p>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="container-editorial mt-32 rounded-[2.5rem] p-12" style={{ background: palette.primary, color: palette.accent }}>
          <Badge variant="outline" className="border-white/30 text-white">
            <MapPin className="h-3 w-3" /> Bring back next time
          </Badge>
          <h2 className="mt-4 font-serif text-balance text-4xl md:text-5xl">
            Heading home to {country.name} soon? Pre-list what you'll bring.
          </h2>
          <p className="mt-3 max-w-2xl opacity-80">
            Set a finder's fee, mark when you're back, and your neighbours will reserve before
            the suitcase even closes.
          </p>
          <Button asChild variant="accent" size="lg" className="mt-8">
            <Link href="/listings/new">
              Start a listing <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </section>
      </main>
      <Footer />
    </>
  );
}
