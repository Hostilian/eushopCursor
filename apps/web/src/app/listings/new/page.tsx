import { Footer } from '../../../components/layout/footer';
import { Nav } from '../../../components/layout/nav';
import { ListingForm } from '../../../components/listings/listing-form';

export default function NewListingPage() {
  return (
    <>
      <Nav />
      <main className="container-editorial pt-16 pb-32">
        <p className="text-xs uppercase tracking-widest text-ash">Step into the kitchen</p>
        <h1 className="mt-3 font-serif text-5xl text-ink md:text-6xl text-balance">
          Share what you brought back.
        </h1>
        <p className="mt-4 max-w-xl text-lg text-ink/70">
          A few photos, a finder's fee, an approximate neighbourhood. We never publish your exact
          address — just a 5km cell.
        </p>

        <div className="mt-12 max-w-3xl">
          <ListingForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
