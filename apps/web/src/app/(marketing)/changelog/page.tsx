import { EditorialPageLayout } from '../../components/marketing/editorial-page';

const ENTRIES = [
  {
    date: '2026-05-02',
    title: 'Trip marketplace + sell-ready surface',
    body: 'Trip offers and reservations, platform-fee logic, and operator tooling. Marketplace pages use live data; optional ENABLE_DEMO_MODE + labelled showcase for empty staging hosts. Curated catalog static fallback in API for unseeded dev. Operations docs under docs/ops/. Shared design tokens, marketing home, admin shell, mobile onboarding, OG image, expanded sitemap.',
  },
  {
    date: '2026-04-01',
    title: 'Open beta scaffolding',
    body: 'Next.js web, Expo mobile, Hono API, Drizzle schema, Meili search, PartyKit stub, i18n package.',
  },
];

export default function ChangelogPage() {
  return (
    <EditorialPageLayout
      eyebrow="Changelog"
      title="Product log"
      subtitle="High-signal releases for operators and investors."
    >
      <ol className="border-ink/10 max-w-2xl space-y-10 border-l pl-8">
        {ENTRIES.map((e) => (
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
