import { getTranslations } from 'next-intl/server';
import { EditorialPageLayout } from '../../../components/marketing/editorial-page';
import { MarketingSourcesStrip } from '../../../components/marketing/marketing-sources-strip';

export async function generateMetadata() {
  const t = await getTranslations('about');
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    openGraph: {
      title: t('metaTitle'),
      description: t('metaDescription'),
    },
  };
}

export default async function AboutPage() {
  const t = await getTranslations('about');

  return (
    <EditorialPageLayout eyebrow={t('eyebrow')} title={t('title')} subtitle={t('subtitle')}>
      <article className="text-ink/80 max-w-2xl space-y-6 text-lg leading-relaxed text-pretty">
        <p>{t('p1')}</p>
        <p>{t('p2')}</p>
        <p>{t('p3')}</p>
      </article>
      <MarketingSourcesStrip />
    </EditorialPageLayout>
  );
}
