import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { EditorialPageLayout } from '../../../components/marketing/editorial-page';

const FAQ_IDS = [
  'whatIsEushop',
  'matchingBasics',
  'openRequests',
  'fees',
  'payments',
  'privacyGeo',
  'demoMode',
  'deleteAccount',
  'reporting',
  'analytics',
  'inngestJobs',
  'hrVolunteer',
  'languages',
  'legalNotAdvice',
] as const;

export async function generateMetadata() {
  const t = await getTranslations('help');
  return {
    title: t('metaTitle'),
    description: t('subtitle'),
  };
}

export default async function HelpPage() {
  const t = await getTranslations('help');
  return (
    <EditorialPageLayout eyebrow="Help" title={t('title')} subtitle={t('subtitle')}>
      <div className="max-w-2xl space-y-4">
        {FAQ_IDS.map((id) => (
          <details
            key={id}
            className="border-ink/10 bg-cream rounded-2xl border px-5 py-3 open:shadow-sm"
          >
            <summary className="text-ink cursor-pointer font-medium">{t(`faq.${id}.q`)}</summary>
            <p className="text-ink/75 mt-3 text-sm leading-relaxed">{t(`faq.${id}.a`)}</p>
          </details>
        ))}
      </div>
      <div className="border-ink/10 bg-parchment mt-12 max-w-2xl rounded-2xl border p-6">
        <p className="text-ink font-medium">{t('contactCta')}</p>
        <p className="text-ink/70 mt-2 text-sm">{t('contactCtaBody')}</p>
        <Link href="/contact" className="text-ink mt-4 inline-block text-sm underline">
          /contact
        </Link>
      </div>
    </EditorialPageLayout>
  );
}
