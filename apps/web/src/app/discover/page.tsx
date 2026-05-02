import { Footer } from '../../components/layout/footer';
import { Nav } from '../../components/layout/nav';
import { DiscoverFeed } from '../../components/discover/discover-feed';
import { MapPreview } from '../../components/discover/map-preview';

export default function DiscoverPage() {
  return (
    <>
      <Nav />
      <main className="container-editorial pt-12 pb-32">
        <p className="text-xs uppercase tracking-widest text-ash">Around you</p>
        <h1 className="mt-3 font-serif text-5xl text-ink md:text-6xl">Within a 25 km cell.</h1>
        <p className="mt-4 max-w-xl text-lg text-ink/70">
          Pins are jittered inside their 5 km cell — we never reveal exact addresses.
          Tap a card to message.
        </p>
        <div className="mt-10 grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <MapPreview label="Example: Berlin centre" lat={52.52} lng={13.405} />
          </div>
          <div className="lg:col-span-3">
            <DiscoverFeed />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
