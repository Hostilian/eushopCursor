import { COUNTRIES, FOOD_ITEMS } from '@eushop/catalog-data';
import { countryPalette } from '@eushop/design-tokens';
import { ArrowRight, MapPin, Tag } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Footer } from '../../../components/layout/footer';
import { Nav } from '../../../components/layout/nav';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';

export function generateStaticParams() {
  return FOOD_ITEMS.map((i) => ({ slug: i.slug }));
}

export default async function ItemPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = FOOD_ITEMS.find((i) => i.slug === slug);
  if (!item) notFound();
  const country = COUNTRIES.find((c) => c.iso2 === item.originCountryIso2);
  const palette = countryPalette[item.originCountryIso2] ?? { primary: '#3B2F22', accent: '#FAF7F2', ink: '#1A1612' };
  const related = FOOD_ITEMS.filter(
    (i) => i.originCountryIso2 === item.originCountryIso2 && i.slug !== item.slug,
  ).slice(0, 4);

  return (
    <>
      <Nav />
      <main>
        <section
          className="relative overflow-hidden"
          style={{ background: palette.primary, color: palette.accent }}
        >
          <div className="container-editorial grid grid-cols-1 gap-12 py-20 md:grid-cols-12 md:py-28">
            <div className="md:col-span-5">
              <div className="aspect-square w-full max-w-md rounded-[2.5rem] border border-white/15 bg-black/20 p-10">
                <div className="flex h-full items-center justify-center text-9xl">
                  {country?.flagEmoji ?? '🇪🇺'}
                </div>
              </div>
            </div>
            <div className="md:col-span-7">
              <Link href={`/countries/${item.originCountryIso2.toLowerCase()}`} className="text-xs uppercase tracking-widest opacity-70 hover:opacity-100">
                {country?.name} · {item.categorySlug}
              </Link>
              <h1 className="mt-3 font-serif text-balance text-6xl md:text-7xl">{item.name}</h1>
              {item.aka?.length ? (
                <p className="mt-2 text-sm uppercase tracking-widest opacity-70">aka {item.aka.join(' · ')}</p>
              ) : null}
              <p className="mt-8 max-w-xl text-lg leading-relaxed opacity-80">{item.description}</p>
              <div className="mt-10 flex flex-wrap gap-3">
                <Button asChild variant="accent" size="lg">
                  <Link href={`/discover?item=${item.slug}`}>
                    See active listings <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
                  <Link href={`/requests/new?item=${item.slug}`}>Post a request</Link>
                </Button>
              </div>
              {item.tags?.length ? (
                <div className="mt-8 flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="border-white/20 text-white">
                      <Tag className="h-3 w-3" /> {tag}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <section className="container-editorial mt-20 grid gap-12 md:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-widest text-ash">What it tastes like</p>
            <p className="mt-3 font-serif text-2xl text-ink">{item.description}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-ash">Where it's from</p>
            <p className="mt-3 font-serif text-2xl text-ink">
              {country?.flagEmoji} {country?.name}
            </p>
            <p className="mt-1 text-sm text-ash">{country?.blurb}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-ash">How to get it</p>
            <p className="mt-3 text-pretty text-ink/80">
              Search nearby listings, message the seller, agree on a finder's fee and a meet-up
              spot. Cash or app — your choice; we don't take a cut.
            </p>
            <Button asChild variant="link" className="mt-2">
              <Link href={`/discover?item=${item.slug}`}>
                <MapPin className="mr-1 h-4 w-4" /> Find near me
              </Link>
            </Button>
          </div>
        </section>

        {related.length ? (
          <section className="container-editorial mt-32">
            <h2 className="font-serif text-3xl text-ink">More from {country?.name}</h2>
            <ul className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={`/items/${r.slug}`}
                    className="group block rounded-3xl border border-ink/10 bg-porcelain p-5 transition-all hover:-translate-y-1 hover:shadow-md"
                  >
                    <p className="font-serif text-lg text-ink">{r.name}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-ash">{r.description}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </main>
      <Footer />
    </>
  );
}
