import Link from 'next/link';

/**
 * Compact footnote strip for marketing pages that reference historic
 * population or mobility context. Full bibliography lives at /sources.
 */
export function MarketingSourcesStrip() {
  return (
    <aside
      className="border-ink/10 text-ink/65 mt-12 border-t pt-8 text-sm"
      aria-labelledby="marketing-sources-heading"
    >
      <h2
        id="marketing-sources-heading"
        className="text-ash text-xs font-semibold tracking-widest uppercase"
      >
        Sources
      </h2>
      <p className="mt-2 max-w-2xl">
        Historic population and migration framing on this site points to official statistics issued
        in <strong>2007 or earlier</strong> (see bibliography for exact titles and links).{' '}
        <Link href="/sources" className="text-ink font-medium underline underline-offset-4">
          Pre-2008 references
        </Link>
      </p>
    </aside>
  );
}
