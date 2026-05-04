import { getTranslations } from 'next-intl/server';

import { EditorialPageLayout } from '../../../components/marketing/editorial-page';

export async function generateMetadata() {
  const t = await getTranslations('roadmapPage');
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  };
}

export default async function RoadmapPage() {
  const t = await getTranslations('roadmapPage');
  const phases = [
    { q: t('phase1Quarter'), title: t('phase1Title'), body: t('phase1Body') },
    { q: t('phase2Quarter'), title: t('phase2Title'), body: t('phase2Body') },
    { q: t('phase3Quarter'), title: t('phase3Title'), body: t('phase3Body') },
    { q: t('phase4Quarter'), title: t('phase4Title'), body: t('phase4Body') },
  ] as const;

  return (
    <EditorialPageLayout eyebrow={t('eyebrow')} title={t('title')} subtitle={t('subtitle')}>
      <ul className="max-w-2xl space-y-8">
        {phases.map((p) => (
          <li key={p.q} className="border-ink/10 bg-porcelain/50 rounded-2xl border p-6">
            <p className="text-saffron-700 text-xs font-semibold tracking-widest uppercase">
              {p.q}
            </p>
            <h2 className="text-ink mt-2 font-serif text-2xl">{p.title}</h2>
            <p className="text-ink/75 mt-2">{p.body}</p>
          </li>
        ))}
      </ul>
    </EditorialPageLayout>
  );
}
