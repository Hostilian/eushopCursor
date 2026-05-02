import { Footer } from '../../../components/layout/footer';
import { Nav } from '../../../components/layout/nav';
import { RequestForm } from '../../../components/requests/request-form';

export default function NewRequestPage() {
  return (
    <>
      <Nav />
      <main className="container-editorial pt-16 pb-32">
        <p className="text-xs uppercase tracking-widest text-ash">Make it known</p>
        <h1 className="mt-3 font-serif text-5xl text-ink md:text-6xl text-balance">
          Tell us what to find.
        </h1>
        <p className="mt-4 max-w-xl text-lg text-ink/70">
          Set a max finder's fee, a radius, and we'll ping you the moment a matching listing
          lands within reach.
        </p>
        <div className="mt-12 max-w-3xl">
          <RequestForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
