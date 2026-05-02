import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { EditorialPageLayout } from '../../../components/marketing/editorial-page';
import { Button } from '../../../components/ui/button';

const STEPS = [
  {
    n: '01',
    title: 'Search by craving or by flag.',
    body: 'Browse 30 countries (today, mostly Europe) or hunt a specific item. Type "Krówki" — see who in your radius has a tin.',
  },
  {
    n: '02',
    title: 'Name the fee that matches the trade.',
    body: 'Local shares use a small finder\u2019s fee (€3, €5, €10). Trip slots use an agreed fee per slot. You lock the number in chat before you meet.',
  },
  {
    n: '03',
    title: 'Meet in public, settle in person.',
    body: 'Eushop never handles money or food. You arrange a coffee-shop handoff, settle cash or Revolut, and we step out of the way.',
  },
  {
    n: '04',
    title: 'Leave a quick review.',
    body: 'Five-star rating with tags like fresh / on-time / friendly. Trust grows for everyone.',
  },
];

export default function HowItWorksPage() {
  return (
    <EditorialPageLayout
      eyebrow="How it works"
      title="From craving to handoff."
      subtitle="Eushop is built around four steps. We are not a shop — we are the introduction."
    >
      <ol className="max-w-3xl space-y-12">
        {STEPS.map((s) => (
          <li key={s.n} className="grid items-start gap-8 md:grid-cols-12">
            <div className="md:col-span-2">
              <p className="text-saffron-700 font-serif text-6xl">{s.n}</p>
            </div>
            <div className="md:col-span-10">
              <h2 className="text-ink font-serif text-3xl">{s.title}</h2>
              <p className="text-ink/80 mt-3 max-w-xl text-pretty">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-16 flex justify-end">
        <Button asChild size="lg" variant="primary">
          <Link href="/listings/new">
            Start a listing <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </EditorialPageLayout>
  );
}
