import { getTranslations } from 'next-intl/server';

import { EditorialPageLayout } from '../../../components/marketing/editorial-page';
import { MarketingSourcesStrip } from '../../../components/marketing/marketing-sources-strip';

export async function generateMetadata() {
  const t = await getTranslations('manifestoPage');
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  };
}

export default async function ManifestoPage() {
  const t = await getTranslations('manifestoPage');
  return (
    <EditorialPageLayout eyebrow={t('eyebrow')} title={t('title')} subtitle={t('subtitle')}>
      <article className="text-ink/80 max-w-2xl space-y-8 text-lg leading-relaxed text-pretty">
        <p>{t('intro1')}</p>
        <p>{t('intro2')}</p>
        <p>{t('intro3')}</p>

        <hr className="border-ink/10" />

        <h2 className="text-ink font-serif text-3xl">{t('sectionConvictions')}</h2>

        <h3 className="text-ink font-serif text-xl">{t('c1Title')}</h3>
        <p>{t('c1Body')}</p>

        <h3 className="text-ink font-serif text-xl">{t('c2Title')}</h3>
        <p>{t('c2Body')}</p>

        <h3 className="text-ink font-serif text-xl">{t('c3Title')}</h3>
        <p>{t('c3Body')}</p>

        <hr className="border-ink/10" />

        <h2 className="text-ink font-serif text-3xl">{t('sectionWillNot')}</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>{t('willNot1')}</li>
          <li>{t('willNot2')}</li>
          <li>{t('willNot3')}</li>
          <li>{t('willNot4')}</li>
          <li>{t('willNot5')}</li>
        </ul>

        <hr className="border-ink/10" />

        <h2 className="text-ink font-serif text-3xl">{t('sectionWhyNow')}</h2>
        <p>{t('whyNowBody')}</p>
        <p>{t('whyNowClosing')}</p>

        <hr className="border-ink/10" />

        <p className="text-ink/60 text-sm">{t('signoff')}</p>
      </article>
      <MarketingSourcesStrip />
    </EditorialPageLayout>
  );
}
