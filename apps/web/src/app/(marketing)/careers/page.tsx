import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { EditorialPageLayout } from '../../../components/marketing/editorial-page';

export async function generateMetadata() {
  const t = await getTranslations('careers');
  return { title: t('metaTitle'), description: t('subtitle') };
}

export default async function CareersPage() {
  const t = await getTranslations('careers');
  const ops = process.env.NEXT_PUBLIC_OPERATIONS_EMAIL?.trim();

  return (
    <EditorialPageLayout eyebrow="Careers" title={t('title')} subtitle={t('subtitle')}>
      <div className="text-ink/80 max-w-2xl space-y-6 text-lg leading-relaxed">
        <p>{t('body1')}</p>
        <p>{t('body2')}</p>
        <h2 className="text-ink font-serif text-2xl">{t('openRoles')}</h2>
        <p>{t('openRolesBody')}</p>
        <p>
          <strong className="text-ink">{t('applyCta')}:</strong>{' '}
          {ops ? (
            <a href={`mailto:${ops}?subject=Eushop%20—%20careers`} className="underline">
              {ops}
            </a>
          ) : (
            <Link href="/contact" className="underline">
              /contact
            </Link>
          )}
        </p>
      </div>
    </EditorialPageLayout>
  );
}
