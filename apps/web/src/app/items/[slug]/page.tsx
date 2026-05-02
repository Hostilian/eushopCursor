import { COUNTRIES, FOOD_ITEMS } from '@eushop/catalog-data';
import { OPEN_FOOD_FACTS_ATTRIBUTION } from '@eushop/catalog-data/openfoodfacts';
import { countryPalette } from '@eushop/design-tokens';
import { ArrowRight, MapPin, Tag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Footer } from '../../../components/layout/footer';
import { Nav } from '../../../components/layout/nav';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { api } from '../../../lib/trpc-server';

export function generateStaticParams() {
  return FOOD_ITEMS.map((i) => ({ slug: i.slug }));
}

export default async function ItemPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = FOOD_ITEMS.find((i) => i.slug === slug);
  if (!item) notFound();
  const country = COUNTRIES.find((c) => c.iso2 === item.originCountryIso2);
  const palette = countryPalette[item.originCountryIso2] ?? {
    primary: '#3B2F22',
    accent: '#FAF7F2',
    ink: '#1A1612',
  };

  // Fetch the live row so we can render real images + propagate attribution
  // when the item came from Open Food Facts.
  let liveImage: string | null = null;
  let imageSource: 'off' | 'r2' | 'user' | null = null;
  try {
    const trpc = await api();
    const live = await trpc.catalog.itemBySlug({ slug });
    const variants = (
      live as unknown as { imageVariants?: { large?: string; source?: 'off' | 'r2' | 'user' } }
    ).imageVariants;
    liveImage =
      variants?.large ?? (live as unknown as { defaultImageUrl?: string }).defaultImageUrl ?? null;
    imageSource = variants?.source ?? null;
  } catch {
    /* item only exists in seed; OFF attribution does not apply */
  }
  const related = FOOD_ITEMS.filter(
    (i) => i.originCountryIso2 === item.originCountryIso2 && i.slug !== item.slug,
  ).slice(0, 4);
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
          {
            '@type': 'ListItem',
            position: 2,
            name: country?.name ?? 'Catalog',
            item: `${base}/countries/${item.originCountryIso2.toLowerCase()}`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: item.name,
            item: `${base}/items/${item.slug}`,
          },
        ],
      },
    ],
  };

  return (
    <>
      <Nav />
      <main id="main-content">
        <section
          className="relative overflow-hidden"
          style={{ background: palette.primary, color: palette.accent }}
        >
          <div className="container-editorial grid grid-cols-1 gap-12 py-20 md:grid-cols-12 md:py-28">
            <div className="md:col-span-5">
              <div className="relative aspect-square w-full max-w-md overflow-hidden rounded-[2.5rem] border border-white/15 bg-black/20">
                {liveImage ? (
                  <Image
                    src={liveImage}
                    alt={item.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 40vw"
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full items-center justify-center p-10 text-9xl">
                    {country?.flagEmoji ?? '🇪🇺'}
                  </div>
                )}
              </div>
              {imageSource === 'off' ? (
                <p className="mt-3 max-w-md text-xs opacity-70">
                  {OPEN_FOOD_FACTS_ATTRIBUTION}.{' '}
                  <a
                    href="https://world.openfoodfacts.org/"
                    target="_blank"
                    rel="noreferrer noopener"
                    className="underline"
                  >
                    openfoodfacts.org
                  </a>
                </p>
              ) : null}
            </div>
            <div className="md:col-span-7">
              <Link
                href={`/countries/${item.originCountryIso2.toLowerCase()}`}
                className="text-xs tracking-widest uppercase opacity-70 hover:opacity-100"
              >
                {country?.name} · {item.categorySlug}
              </Link>
              <h1 className="mt-3 font-serif text-6xl text-balance md:text-7xl">{item.name}</h1>
              {item.aka?.length ? (
                <p className="mt-2 text-sm tracking-widest uppercase opacity-70">
                  aka {item.aka.join(' · ')}
                </p>
              ) : null}
              <p className="mt-8 max-w-xl text-lg leading-relaxed opacity-80">{item.description}</p>
              <div className="mt-10 flex flex-wrap gap-3">
                <Button asChild variant="accent" size="lg">
                  <Link href={`/discover?item=${item.slug}`}>
                    See active listings <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-white/30 text-white hover:bg-white/10"
                >
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
            <p className="text-ash text-xs tracking-widest uppercase">What it tastes like</p>
            <p className="text-ink mt-3 font-serif text-2xl">{item.description}</p>
          </div>
          <div>
            <p className="text-ash text-xs tracking-widest uppercase">Where it's from</p>
            <p className="text-ink mt-3 font-serif text-2xl">
              {country?.flagEmoji} {country?.name}
            </p>
            <p className="text-ash mt-1 text-sm">{country?.blurb}</p>
          </div>
          <div>
            <p className="text-ash text-xs tracking-widest uppercase">How to get it</p>
            <p className="text-ink/80 mt-3 text-pretty">
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
            <h2 className="text-ink font-serif text-3xl">More from {country?.name}</h2>
            <ul className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={`/items/${r.slug}`}
                    className="group border-ink/10 bg-porcelain block rounded-3xl border p-5 transition-all hover:-translate-y-1 hover:shadow-md"
                  >
                    <p className="text-ink font-serif text-lg">{r.name}</p>
                    <p className="text-ash mt-1 line-clamp-2 text-xs">{r.description}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </main>
      <Footer />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
