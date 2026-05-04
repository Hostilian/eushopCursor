import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import { EditorialPageLayout } from '../../../components/marketing/editorial-page';
import { MarketingSourcesStrip } from '../../../components/marketing/marketing-sources-strip';

export async function generateMetadata() {
  const t = await getTranslations('pitchPage');
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  };
}

export default async function PitchPage() {
  const t = await getTranslations('pitchPage');
  return (
    <EditorialPageLayout eyebrow={t('eyebrow')} title={t('title')} subtitle={t('subtitle')}>
      <div className="text-ink/80 max-w-2xl space-y-10 text-lg leading-relaxed text-pretty">
        <section>
          <h2 className="text-ink font-serif text-2xl">{t('problemTitle')}</h2>
          <p className="mt-3">{t('problemBody')}</p>
        </section>
        <section>
          <h2 className="text-ink font-serif text-2xl">{t('mobilityTitle')}</h2>
          <p className="mt-3">
            {t('mobilityBefore')}{' '}
            <Link href="/sources" className="text-ink underline underline-offset-4">
              {t('mobilitySourcesLabel')}
            </Link>
            {t('mobilityAfter')}
          </p>
        </section>
        <section>
          <h2 className="text-ink font-serif text-2xl">{t('solutionTitle')}</h2>
          <p className="mt-3">{t('solutionBody')}</p>
        </section>
        <section>
          <h2 className="text-ink font-serif text-2xl">{t('gtmTitle')}</h2>
          <p className="mt-3">{t('gtmBody')}</p>
        </section>
        <section>
          <h2 className="text-ink font-serif text-2xl">{t('askTitle')}</h2>
          <p className="mt-3">{t('askBody')}</p>
        </section>
      </div>
      <MarketingSourcesStrip />
    </EditorialPageLayout>
  );
}
