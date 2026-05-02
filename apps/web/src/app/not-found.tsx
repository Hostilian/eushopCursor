import Link from 'next/link';
import { Footer } from '../components/layout/footer';
import { Nav } from '../components/layout/nav';
import { Button } from '../components/ui/button';

export default function NotFound() {
  return (
    <>
      <Nav />
      <main className="container-editorial flex min-h-[60vh] flex-col items-center justify-center text-center">
        <p className="text-xs uppercase tracking-widest text-ash">404</p>
        <h1 className="mt-3 font-serif text-6xl text-ink md:text-8xl">Out of stock.</h1>
        <p className="mt-4 max-w-md text-ink/70">
          Whatever you were after isn't here — try a flag or a category from the home page.
        </p>
        <Button asChild variant="primary" size="lg" className="mt-8">
          <Link href="/">Back to home</Link>
        </Button>
      </main>
      <Footer />
    </>
  );
}
