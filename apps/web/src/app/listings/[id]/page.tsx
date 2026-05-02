import { ErrorState } from '@eushop/ui-web';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Footer } from '../../../components/layout/footer';
import { Nav } from '../../../components/layout/nav';
import { MapPreview } from '../../../components/discover/map-preview';
import { Button } from '../../../components/ui/button';
import { api } from '../../../lib/trpc-server';

type ListingBundle = Awaited<ReturnType<Awaited<ReturnType<typeof api>>['listings']['byId']>>;

async function fetchListing(
  id: string,
): Promise<{ data: ListingBundle | null; serviceError: boolean }> {
  try {
    const trpc = await api();
    const data = await trpc.listings.byId({ id });
    return { data, serviceError: false };
  } catch (e) {
    if (e instanceof Error && /NOT_FOUND/.test(e.message)) {
      return { data: null, serviceError: false };
    }
    return { data: null, serviceError: true };
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const { data } = await fetchListing(id);
  if (!data) return { title: 'Listing', description: 'Listing on Eushop.' };
  const title = data.freeformName ?? 'Listing';
  return {
    title: `${title} \u00b7 ${data.approximateCity}`,
    description: `${title} in ${data.approximateCity} (${data.countryIso2}). Finder's fee \u20ac${data.finderFee}.`,
    openGraph: {
      title: `${title} \u00b7 Eushop`,
      description: `${title} in ${data.approximateCity}. Finder's fee \u20ac${data.finderFee}.`,
      images: data.photos[0]?.url ? [{ url: data.photos[0].url }] : undefined,
    },
  };
}

export default async function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data, serviceError } = await fetchListing(id);

  if (serviceError) {
    return (
      <>
        <Nav />
        <main id="main-content" className="container-editorial pt-12 pb-32">
          <ErrorState
            title="Listings service is offline."
            description="We couldn't reach the catalog. Try again in a moment."
            actions={
              <Button asChild variant="primary">
                <Link href="/discover">Back to discover</Link>
              </Button>
            }
          />
        </main>
        <Footer />
      </>
    );
  }
  if (!data) notFound();

  const title = data.freeformName ?? 'Listing';
  const photo = data.photos[0]?.url;

  return (
    <>
      <Nav />
      <main id="main-content" className="container-editorial pt-12 pb-32">
        <nav aria-label="Breadcrumb" className="text-ash text-xs">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/discover" className="hover:text-ink underline-offset-2 hover:underline">
                Discover
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-ink/70" aria-current="page">
              {title}
            </li>
          </ol>
        </nav>
        <div className="mt-8 grid gap-10 lg:grid-cols-2">
          <div className="border-ink/10 bg-parchment relative aspect-square overflow-hidden rounded-[2rem] border">
            {photo ? (
              <Image
                src={photo}
                alt={`Photo of ${title}`}
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
