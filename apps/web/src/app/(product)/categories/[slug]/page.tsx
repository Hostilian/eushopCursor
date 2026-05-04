import { CATEGORIES, COUNTRIES, FOOD_ITEMS } from '@eushop/catalog-data';
import { countryPalette } from '@eushop/design-tokens';
import { EmptyState } from '@eushop/ui-web';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Footer } from '../../../../components/layout/footer';
import { Nav } from '../../../../components/layout/nav';
import { Button } from '../../../../components/ui/button';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = CATEGORIES.find((c) => c.slug === slug);
  if (!category) return { title: 'Category' };
  const items = FOOD_ITEMS.filter((i) => i.categorySlug === slug);
  return {
    title: `${category.name} \u2014 ${items.length} items`,
    description: category.description,
    openGraph: {
      title: `${category.name} \u00b7 Eushop`,
      description: `${items.length} canonical items across the EU.`,
    },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = CATEGORIES.find((c) => c.slug === slug);
  if (!category) notFound();
  const items = FOOD_ITEMS.filter((i) => i.categorySlug === slug);

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
              {category.name}
            </li>
          </ol>
        </nav>
        <p className="text-ash mt-6 text-xs tracking-widest uppercase">Category</p>
        <div className="mt-3 flex items-center gap-4">
          <span className="text-6xl" aria-hidden="true">
            {category.emoji}
          </span>
          <h1 className="text-ink font-serif text-5xl md:text-6xl">{category.name}</h1>
        </div>
        <p className="text-ink/70 mt-6 max-w-2xl text-lg">{category.description}</p>
        <p className="text-ash mt-4 text-sm">{items.length} canonical items across the EU</p>

        {items.length === 0 ? (
          <EmptyState
            className="mt-16"
            icon={<span className="text-5xl">{category.emoji}</span>}
            title="No items in this category yet."
            description="The curated catalog is still growing. Try search or another category."
            actions={
              <>
                <Button asChild variant="primary">
                  <Link href="/search">Search catalog</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/discover">Discover listings</Link>
                </Button>
              </>
            }
          />
        ) : (
          <ul className="mt-16 grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
            {items.map((item) => {
              const country = COUNTRIES.find((c) => c.iso2 === item.originCountryIso2);
              const palette = countryPalette[item.originCountryIso2] ?? {
                primary: '#3B2F22',
                accent: '#FAF7F2',
              };
              return (
                <li key={item.slug}>
                  <Link href={`/items/${item.slug}`} className="group block">
                    <div
                      className="border-ink/10 relative aspect-[4/5] overflow-hidden rounded-3xl border"
                      style={{
                        background: `linear-gradient(180deg, ${palette.primary}30, ${palette.primary}80)`,
                      }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center text-7xl opacity-30">
                        {country?.flagEmoji}
                      </div>
                      <div className="text-paper absolute right-4 bottom-4 left-4">
                        <p className="text-xs tracking-widest uppercase opacity-80">
                          {country?.name}
                        </p>
                      </div>
                    </div>
                    <p className="text-ink mt-4 font-serif text-lg">{item.name}</p>
                    <p className="text-ash mt-1 line-clamp-2 text-sm">{item.description}</p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>
      <Footer />
    </>
  );
}
