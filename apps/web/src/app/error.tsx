'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '../components/ui/button';

export default function RootErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="bg-paper text-ink flex min-h-[50vh] flex-col items-center justify-center px-6 py-24">
      <h1 className="font-serif text-3xl">Something went wrong</h1>
      <p className="text-ink/70 mt-3 max-w-md text-center text-sm">
        An unexpected error occurred. You can try again or return home.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button type="button" variant="primary" onClick={() => reset()}>
          Try again
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/">Home</Link>
        </Button>
      </div>
    </div>
  );
}
