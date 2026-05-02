import { getTranslations, getMessages } from 'next-intl/server';
import { EditorialPageLayout } from '../../../components/marketing/editorial-page';

export async function generateMetadata() {
  const t = await getTranslations('changelog');
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  };
}

type ChangelogEntry = { date: string; title: string; body: string };

export default async function ChangelogPage() {
  const t = await getTranslations('changelog');
  const messages = (await getMessages()) as { changelog?: { entries?: ChangelogEntry[] } };
  const entries = messages.changelog?.entries;
  const list: ChangelogEntry[] = Array.isArray(entries) ? entries : [];

  return (
    <EditorialPageLayout eyebrow={t('eyebrow')} title={t('title')} subtitle={t('subtitle')}>
      <ol className="border-ink/10 max-w-2xl space-y-10 border-l pl-8">
        {list.map((e) => (
          <li key={`${e.date}-${e.title}`} className="relative">
            <span className="border-ink/20 bg-paper absolute top-1.5 -left-[39px] h-3 w-3 rounded-full border" />
            <time className="text-ash text-xs tracking-widest uppercase">{e.date}</time>
            <h2 className="text-ink mt-1 font-serif text-2xl">{e.title}</h2>
            <p className="text-ink/75 mt-2">{e.body}</p>
          </li>
        ))}
      </ol>
    </EditorialPageLayout>
  );
}
