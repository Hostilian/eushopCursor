import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Footer } from '../../components/layout/footer';
import { Nav } from '../../components/layout/nav';
import { Button } from '../../components/ui/button';

const STEPS = [
  {
    n: '01',
    title: 'Search by craving or by flag.',
    body: 'Browse 30 EU + EEA countries or hunt a specific item. Type "Krówki" — see who in your radius has a tin.',
  },
  {
    n: '02',
    title: 'Set a finder\u2019s fee.',
    body: 'Sellers list a small fee — €3, €5, €10 — to compensate for the suitcase real-estate. You agree on it in chat.',
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
    <>
      <Nav />
      <main className="container-editorial pt-16 pb-32">
        <p className="text-xs uppercase tracking-widest text-ash">How it works</p>
        <h1 className="mt-3 font-serif text-5xl text-ink md:text-6xl">From craving to handoff.</h1>
        <p className="mt-4 max-w-xl text-lg text-ink/70">
          Eushop is built around four steps. We're not a shop — we're the introduction.
        </p>

        <ol className="mt-16 space-y-12">
          {STEPS.map((s) => (
            <li key={s.n} className="grid items-start gap-8 md:grid-cols-12">
              <div className="md:col-span-2">
                <p className="font-serif text-6xl text-saffron-700">{s.n}</p>
              </div>
              <div className="md:col-span-10">
                <h2 className="font-serif text-3xl text-ink">{s.title}</h2>
                <p className="mt-3 max-w-xl text-pretty text-ink/80">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-24 flex justify-end">
          <Button asChild size="lg" variant="primary">
            <Link href="/listings/new">
              Start a listing <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </main>
      <Footer />
    </>
  );
}
