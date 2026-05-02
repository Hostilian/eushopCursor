import { Footer } from '../../components/layout/footer';
import { Nav } from '../../components/layout/nav';
import { SearchClient } from '../../components/search/search-client';

export default function SearchPage() {
  return (
    <>
      <Nav />
      <main className="container-editorial pt-16 pb-32">
        <p className="text-xs uppercase tracking-widest text-ash">Find anything</p>
        <h1 className="mt-3 font-serif text-5xl text-ink md:text-6xl">Search the catalog.</h1>
        <p className="mt-4 max-w-xl text-lg text-ink/70">
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
