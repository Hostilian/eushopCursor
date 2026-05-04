import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { EditorialPageLayout } from '../../../components/marketing/editorial-page';

export async function generateMetadata() {
  const t = await getTranslations('contact');
  return { title: t('metaTitle'), description: t('subtitle') };
}

export default async function ContactPage() {
  const t = await getTranslations('contact');
  const email = process.env.NEXT_PUBLIC_OPERATIONS_EMAIL?.trim();
  const phone = process.env.NEXT_PUBLIC_OPERATIONS_PHONE_E164?.trim();

  return (
    <EditorialPageLayout eyebrow="Contact" title={t('title')} subtitle={t('subtitle')}>
      <div className="text-ink/80 max-w-2xl space-y-8 text-lg leading-relaxed">
        <p>{t('responseTime')}</p>

        {!email && !phone ? (
          <p className="border-amber/30 bg-amber/10 text-ink/80 rounded-xl border p-4 text-sm">
            {t('notConfigured')}
          </p>
        ) : (
          <ul className="space-y-4 text-base">
            {email ? (
              <li>
                <strong className="text-ink">{t('operationsEmail')}:</strong>{' '}
                <a href={`mailto:${email}`} className="underline">
                  {email}
                </a>
              </li>
            ) : null}
            {phone ? (
              <li>
                <strong className="text-ink">{t('operationsPhone')}:</strong>{' '}
                <a href={`tel:${phone}`} className="underline">
                  {phone}
                </a>
              </li>
            ) : null}
          </ul>
        )}

        <div>
          <h2 className="text-ink font-serif text-2xl">{t('abuse')}</h2>
          <p className="mt-2">{t('abuseBody')}</p>
          <p className="mt-4">
            <Link href="/safety" className="underline">
              {t('safetyLink')}
            </Link>
          </p>
        </div>

        <p className="text-ash text-sm">{t('pressNote')}</p>
      </div>
    </EditorialPageLayout>
  );
}
