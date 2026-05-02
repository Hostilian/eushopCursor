import { Footer } from '../../components/layout/footer';
import { Nav } from '../../components/layout/nav';
import { SearchClient } from '../../components/search/search-client';

export const metadata = {
  title: 'Search the catalog',
  description: 'Search 150+ canonical EU food items, growing daily. Typo-tolerant and instant.',
  openGraph: {
    title: 'Search the catalog · Eushop',
    description: 'Search 150+ canonical EU food items, growing daily.',
  },
};

export default function SearchPage() {
  return (
    <>
      <Nav />
      <main id="main-content" className="container-editorial pt-16 pb-32">
        <p className="text-ash text-xs tracking-widest uppercase">Find anything</p>
        <h1 className="text-ink mt-3 font-serif text-5xl md:text-6xl">Search the catalog.</h1>
        <p className="text-ink/70 mt-4 max-w-xl text-lg">
          150+ canonical items across the EU, growing daily. Typo-tolerant, instant.
        </p>
        <div className="mt-12">
          <SearchClient />
        </div>
      </main>
      <Footer />
    </>
  );
}
