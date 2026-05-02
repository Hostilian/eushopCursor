import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Footer } from '../../../components/layout/footer';
import { Nav } from '../../../components/layout/nav';
import { MapPreview } from '../../../components/discover/map-preview';
import { Button } from '../../../components/ui/button';
import { api } from '../../../lib/trpc-server';

export default async function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let data: Awaited<ReturnType<Awaited<ReturnType<typeof api>>['listings']['byId']>>;
  try {
    const trpc = await api();
    data = await trpc.listings.byId({ id });
  } catch {
    notFound();
  }

  const title = data.freeformName ?? 'Listing';
  const photo = data.photos[0]?.url;

  return (
    <>
      <Nav />
      <main id="main-content" className="container-editorial pt-12 pb-32">
        <Link href="/discover" className="text-ash hover:text-ink text-sm">
          ← Back to discover
        </Link>
        <div className="mt-8 grid gap-10 lg:grid-cols-2">
          <div className="border-ink/10 bg-parchment relative aspect-square overflow-hidden rounded-[2rem] border">
            {photo ? (
              <Image
                src={photo}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                unoptimized
              />
            ) : null}
          </div>
          <div>
            <p className="text-ash text-xs tracking-widest uppercase">
              {data.approximateCity} · {data.countryIso2}
            </p>
            <h1 className="text-ink mt-2 font-serif text-4xl md:text-5xl">{title}</h1>
            <p className="text-ink/80 mt-4 text-lg">
              Finder&apos;s fee: <span className="text-ink font-medium">€{data.finderFee}</span> ·
              Qty {data.qty}
            </p>
            {data.notes ? <p className="text-ink/70 mt-6 text-pretty">{data.notes}</p> : null}
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="primary">
                <Link href="/sign-in">Message seller</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/discover">More nearby</Link>
              </Button>
            </div>
            <div className="mt-10">
              <MapPreview label={data.approximateCity} lat={data.point.lat} lng={data.point.lng} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
