import { getTranslations } from 'next-intl/server';
import { Footer } from '../../../components/layout/footer';
import { Nav } from '../../../components/layout/nav';
import { DiscoverFeed } from '../../../components/discover/discover-feed';
import { MapPreview } from '../../../components/discover/map-preview';

export async function generateMetadata() {
  const t = await getTranslations('discover');
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    openGraph: {
      title: t('metaTitle'),
      description: t('metaDescription'),
    },
  };
}

export default async function DiscoverPage() {
  const t = await getTranslations('discover');

  return (
    <>
      <Nav />
      <main id="main-content" className="container-editorial pt-12 pb-32">
        <p className="text-ash text-xs tracking-widest uppercase">{t('eyebrow')}</p>
        <h1 className="text-ink mt-3 font-serif text-5xl md:text-6xl">{t('heading')}</h1>
        <p className="text-ink/70 mt-4 max-w-xl text-lg">{t('intro')}</p>
        <div className="mt-10 grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <MapPreview label={t('mapExampleLabel')} lat={52.52} lng={13.405} />
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
