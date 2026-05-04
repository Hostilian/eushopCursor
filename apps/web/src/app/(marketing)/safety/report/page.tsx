import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

import { EditorialPageLayout } from '../../../../components/marketing/editorial-page';

export async function generateMetadata() {
  const t = await getTranslations('illegalContentReport');
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  };
}

export default async function IllegalContentReportPage() {
  const t = await getTranslations('illegalContentReport');
  return (
    <EditorialPageLayout eyebrow={t('eyebrow')} title={t('title')} subtitle={t('subtitle')}>
      <article className="text-ink/80 max-w-2xl space-y-8 text-sm leading-relaxed">
        <section>
          <h2 className="text-ink font-serif text-2xl">{t('whatToReport.title')}</h2>
          <p className="mt-3">{t('whatToReport.body')}</p>
          <ul className="mt-4 ml-5 list-disc space-y-2">
            <li>{t('whatToReport.b1')}</li>
            <li>{t('whatToReport.b2')}</li>
            <li>{t('whatToReport.b3')}</li>
            <li>{t('whatToReport.b4')}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-ink font-serif text-2xl">{t('howToReport.title')}</h2>
          <p className="mt-3">{t('howToReport.body')}</p>
          <p className="mt-3">{t('howToReport.include')}</p>
        </section>

        <section>
          <h2 className="text-ink font-serif text-2xl">{t('process.title')}</h2>
          <p className="mt-3">{t('process.body')}</p>
        </section>

        <section>
          <h2 className="text-ink font-serif text-2xl">{t('transparency.title')}</h2>
          <p className="mt-3">{t('transparency.body')}</p>
        </section>

        <section className="border-ink/10 bg-parchment rounded-2xl border p-6">
          <p className="text-ink font-medium">{t('notLegal.title')}</p>
          <p className="text-ink/75 mt-2">{t('notLegal.body')}</p>
        </section>

        <p>
          <Link href="/contact" className="text-ink underline underline-offset-4">
            {t('contactLink')}
          </Link>
          {' · '}
          <Link href="/help" className="text-ink underline underline-offset-4">
            {t('helpLink')}
          </Link>
          {' · '}
          <Link href="/terms" className="text-ink underline underline-offset-4">
            {t('termsLink')}
          </Link>
        </p>
      </article>
    </EditorialPageLayout>
  );
}
