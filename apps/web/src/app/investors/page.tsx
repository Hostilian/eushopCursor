import { promises as fs } from 'node:fs';
import path from 'node:path';

import Link from 'next/link';

import { EditorialPageLayout } from '../../components/marketing/editorial-page';
import { MarkdownArticle } from '../../lib/markdown';

export const metadata = {
  title: 'Investors · Eushop',
  description: 'Token-gated long-form investor pitch. Suitcase capacity is the new last-mile.',
};

const PUBLIC_PREVIEW = `
# Eushop — Investor pitch (gated)

This page is intended for investors and partners who already have a shared
access token from a member of the founding team.

> If you have a token, append \`?token=…\` to this URL to view the full deck.
> If you don't, write to [investors@eushop.eu](mailto:investors@eushop.eu)
> with one line about your fund and your typical seed cheque size.

We do this for two reasons. The first is signal: every door needs a name on
it. The second is that we keep our financials, our take-rate maths, and our
Series A milestones inside the building until we know who is reading.

The public-facing summary lives at [/manifesto](/manifesto) and the live
operating numbers — never invented, never inflated — at [/traction](/traction).
`.trim();

function loadAccessTokens(): string[] {
  const raw = process.env.INVESTOR_ACCESS_TOKENS ?? '';
  return raw
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

async function loadPitch(): Promise<string | null> {
  try {
    const file = path.join(process.cwd(), 'content', 'pitch.md');
    return await fs.readFile(file, 'utf8');
  } catch {
    return null;
  }
}

interface InvestorsPageProps {
  readonly searchParams: Promise<{ token?: string }>;
}

export default async function InvestorsPage({ searchParams }: InvestorsPageProps) {
  const sp = await searchParams;
  const provided = (sp.token ?? '').trim();
  const allowedTokens = loadAccessTokens();
  // If no env tokens are configured we still gate the page so the deck never
  // leaks by accident. Operators must explicitly opt in by setting at least
  // one token in INVESTOR_ACCESS_TOKENS.
  const hasAccess = provided.length > 0 && allowedTokens.includes(provided);

  if (!hasAccess) {
    return (
      <EditorialPageLayout
        eyebrow="Investors"
        title="A door with a name on it."
        subtitle="Long-form investor materials are kept inside the building until we know who is reading."
      >
        <MarkdownArticle source={PUBLIC_PREVIEW} />
        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/manifesto"
            className="bg-ink text-cream rounded-full px-5 py-2.5 text-sm font-medium"
          >
            Read the public manifesto
          </Link>
          <Link
            href="/traction"
            className="border-ink/15 text-ink rounded-full border px-5 py-2.5 text-sm font-medium"
          >
            See live traction
          </Link>
        </div>
      </EditorialPageLayout>
    );
  }

  const pitch = await loadPitch();

  return (
    <EditorialPageLayout
      eyebrow="Investors · gated"
      title="Suitcase capacity is the new last-mile."
      subtitle="Welcome. The numbers below are the same ones the operating team looks at on Monday mornings."
    >
      {pitch ? (
        <MarkdownArticle source={pitch} />
      ) : (
        <p className="text-ink/70 max-w-xl text-sm">
          The pitch deck file is missing on this deployment. Ping the founding team.
        </p>
      )}
      <p className="text-ink/50 mt-12 max-w-xl text-xs">
        This page is gated by a per-investor token. Please do not share it. We rotate tokens monthly
        and log access timestamps for our own diligence.
      </p>
    </EditorialPageLayout>
  );
}
