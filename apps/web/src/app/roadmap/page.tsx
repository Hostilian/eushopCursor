import { EditorialPageLayout } from '../../components/marketing/editorial-page';

const PHASES = [
  {
    q: 'Q2 2026',
    title: 'Trust & density',
    body: 'Moderation tooling, repeat-handoff prompts, corridor playbooks.',
  },
  {
    q: 'Q3 2026',
    title: 'Payments (where legal)',
    body: 'Optional in-app settlement for small finder fees in pilot countries.',
  },
  {
    q: 'Q4 2026',
    title: 'Native polish',
    body: 'Offline maps for cells, richer item graph, retailer opt-in exports.',
  },
];

export default function RoadmapPage() {
  return (
    <EditorialPageLayout
      eyebrow="Roadmap"
      title="Where we are headed."
      subtitle="Indicative horizons — ship order may shift with regulation and community feedback."
    >
      <ul className="max-w-2xl space-y-8">
        {PHASES.map((p) => (
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
