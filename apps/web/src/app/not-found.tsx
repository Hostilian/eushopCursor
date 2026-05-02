import Link from 'next/link';
import { Footer } from '../components/layout/footer';
import { Nav } from '../components/layout/nav';
import { Button } from '../components/ui/button';

export default function NotFound() {
  return (
    <>
      <Nav />
      <main className="container-editorial flex min-h-[60vh] flex-col items-center justify-center text-center">
        <p className="text-ash text-xs tracking-widest uppercase">404</p>
        <h1 className="text-ink mt-3 font-serif text-6xl md:text-8xl">Out of stock.</h1>
        <p className="text-ink/70 mt-4 max-w-md">
          Whatever you were after isn&apos;t here — try a flag or a category from the home page.
        </p>
        <Button asChild variant="primary" size="lg" className="mt-8">
          <Link href="/">Back to home</Link>
        </Button>
      </main>
      <Footer />
    </>
  );
}
