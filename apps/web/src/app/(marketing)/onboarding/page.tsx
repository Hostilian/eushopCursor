import { ArrowRight, Compass, Handshake, Plane } from 'lucide-react';
import Link from 'next/link';
import { Footer } from '../../../components/layout/footer';
import { Nav } from '../../../components/layout/nav';
import { Button } from '../../../components/ui/button';

/**
 * Web mirror of `apps/mobile/app/onboarding.tsx`. Same three-beat narrative,
 * tuned for desktop and indexed for SEO so first-time visitors who land on
 * marketing pages can discover the product before signing up.
 */

export const metadata = {
  title: 'Three beats · Onboarding',
  description:
    'Discover, share, meet. The same story on web, admin, and mobile — a quick tour of how Eushop works.',
};

const STEPS = [
  {
    icon: Compass,
    title: 'Discover',
    body: 'Browse countries and listings near you — pins stay approximate so addresses stay private and meetups stay practical.',
  },
  {
    icon: Plane,
    title: 'Share',
    body: 'Share what you brought from home with a small finder’s fee for pickup. Trips use a separate agreed slot fee when you publish carry-on capacity.',
  },
  {
    icon: Handshake,
    title: 'Meet',
    body: 'Message in-app, agree on a café or station, settle in person. We never touch the cash until you confirm the handoff.',
  },
];

export default function OnboardingPage() {
  return (
    <>
      <Nav />
      <main id="main-content" className="container-editorial pt-12 pb-32">
        <header>
          <p className="text-ash text-xs tracking-widest uppercase">Eushop</p>
          <h1 className="text-ink mt-3 font-serif text-5xl md:text-6xl">Three beats.</h1>
          <p className="text-ink/70 mt-4 max-w-2xl text-lg">
            The same story on web, admin, and mobile — tuned for the medium you’re on. Read it once
            here and the rest of the product will feel familiar.
          </p>
        </header>

        <ol className="mt-12 grid gap-6 md:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, body }, idx) => (
            <li
              key={title}
              className="border-ink/10 bg-porcelain rounded-3xl border p-6"
              aria-label={`Step ${idx + 1}: ${title}`}
            >
              <div className="text-saffron-600 flex items-center gap-2 text-xs tracking-widest uppercase">
                Step {idx + 1}
              </div>
              <Icon className="text-saffron-700 mt-3 h-8 w-8" aria-hidden="true" />
              <h2 className="text-ink mt-4 font-serif text-2xl">{title}</h2>
              <p className="text-ink/80 mt-2 text-sm leading-relaxed">{body}</p>
            </li>
          ))}
        </ol>

        <div className="mt-12 flex flex-wrap gap-3">
          <Button asChild variant="primary" size="lg">
            <Link href="/discover">
              Enter the map <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/sign-in">Sign in</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/manifesto">Read the manifesto</Link>
          </Button>
        </div>
      </main>
      <Footer />
    </>
  );
}
