import { EditorialPageLayout } from '../../components/marketing/editorial-page';

const PHASES = [
  {
    q: 'Q1 2026',
    title: 'Trip & luggage capacity',
    body: 'First-class flows to publish real routes, dates, spare volume/weight, and legs. Match travellers to catalog items and freeform requests—still location-first.',
  },
  {
    q: 'Q2 2026',
    title: 'Trust & density',
    body: 'Moderation tooling, repeat-handoff prompts, corridor playbooks.',
  },
  {
    q: 'Q3 2026',
    title: 'Payments (where legal)',
    body: 'Optional in-app settlement for finder fees on local shares and for trip slot fees; fixed price first, then pilot auctions where regulation allows.',
  },
  {
    q: 'Q4 2026',
    title: 'Profiles & native polish',
    body: 'Photo-first profiles and reputation signals; offline maps for cells, richer item graph, retailer opt-in exports.',
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
