import { CATEGORIES, COUNTRIES, FOOD_ITEMS } from '@eushop/catalog-data';
import { countryPalette } from '@eushop/design-tokens';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Footer } from '../../../components/layout/footer';
import { Nav } from '../../../components/layout/nav';

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = CATEGORIES.find((c) => c.slug === slug);
  if (!category) notFound();
  const items = FOOD_ITEMS.filter((i) => i.categorySlug === slug);

  return (
    <>
      <Nav />
      <main className="container-editorial pt-16 pb-32">
        <p className="text-xs uppercase tracking-widest text-ash">Category</p>
        <div className="mt-3 flex items-center gap-4">
          <span className="text-6xl">{category.emoji}</span>
          <h1 className="font-serif text-5xl text-ink md:text-6xl">{category.name}</h1>
        </div>
        <p className="mt-6 max-w-2xl text-lg text-ink/70">{category.description}</p>
        <p className="mt-4 text-sm text-ash">{items.length} canonical items across the EU</p>

        <ul className="mt-16 grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => {
            const country = COUNTRIES.find((c) => c.iso2 === item.originCountryIso2);
            const palette = countryPalette[item.originCountryIso2] ?? { primary: '#3B2F22', accent: '#FAF7F2' };
            return (
              <li key={item.slug}>
                <Link href={`/items/${item.slug}`} className="group block">
                  <div
                    className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-ink/10"
                    style={{ background: `linear-gradient(180deg, ${palette.primary}30, ${palette.primary}80)` }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center text-7xl opacity-30">
                      {country?.flagEmoji}
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 text-paper">
                      <p className="text-xs uppercase tracking-widest opacity-80">{country?.name}</p>
                    </div>
                  </div>
                  <p className="mt-4 font-serif text-lg text-ink">{item.name}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-ash">{item.description}</p>
                </Link>
              </li>
            );
          })}
        </ul>
      </main>
      <Footer />
    </>
  );
}
