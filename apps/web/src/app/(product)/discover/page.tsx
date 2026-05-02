import { Footer } from '../../components/layout/footer';
import { Nav } from '../../components/layout/nav';
import { DiscoverFeed } from '../../components/discover/discover-feed';
import { MapPreview } from '../../components/discover/map-preview';

export const metadata = {
  title: 'Discover near you',
  description:
    'Listings within a 25 km cell. Pins are jittered inside their 5 km cell — exact addresses stay private.',
  openGraph: {
    title: 'Discover near you · Eushop',
    description: 'Listings within a 25 km cell. Privacy-first map.',
  },
};

export default function DiscoverPage() {
  return (
    <>
      <Nav />
      <main id="main-content" className="container-editorial pt-12 pb-32">
        <p className="text-ash text-xs tracking-widest uppercase">Around you</p>
        <h1 className="text-ink mt-3 font-serif text-5xl md:text-6xl">Within a 25 km cell.</h1>
        <p className="text-ink/70 mt-4 max-w-xl text-lg">
          Pins are jittered inside their 5 km cell — we never reveal exact addresses. Tap a card to
          message.
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
