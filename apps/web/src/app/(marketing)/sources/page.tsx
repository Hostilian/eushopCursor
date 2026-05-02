import Link from 'next/link';

import { EditorialPageLayout } from '../../../components/marketing/editorial-page';

export const metadata = {
  title: 'Sources · Eushop',
  description:
    'Bibliography for historic population and migration statistics cited on Eushop marketing pages (2007 and earlier publications).',
};

const REFERENCES: readonly {
  title: string;
  publisher: string;
  year: string;
  href: string;
  note?: string;
}[] = [
  {
    title: 'International Migration Report 2006',
    publisher: 'United Nations, Department of Economic and Social Affairs, Population Division',
    year: '2006',
    href: 'https://www.un.org/en/development/desa/population/publications/pdf/migration/migration-report2006.pdf',
    note: 'Synthesis of international migration data available to the Population Division at publication.',
  },
  {
    title: 'International Migration Outlook 2007 (SOPEMI)',
    publisher: 'OECD',
    year: '2007',
    href: 'https://www.oecd.org/migration/imo/',
    note: 'Annual outlook on migration flows and integration policy using mid-2000s official statistics.',
  },
  {
    title: 'Population in Europe 2007: first results (Statistics in Focus 81/2008, KS-SF-08-081)',
    publisher: 'Eurostat',
    year: '2008 (reference period 2007)',
    href: 'https://ec.europa.eu/eurostat/en/web/products-statistics-in-focus/-/ks-sf-08-081',
    note: 'First EU-27 headline aggregates for 2007; release dated September 2008. Used only where we need a Eurostat primary for 2007 reference-year population.',
  },
] as const;

export default function SourcesPage() {
  return (
    <EditorialPageLayout
      eyebrow="Sources"
      title="Pre-2008 references."
      subtitle="Official statistics and outlooks we use when the product copy mentions large-scale cross-border mobility or population context. These are not market-size forecasts for specialty groceries."
    >
      <ol className="text-ink/80 max-w-3xl list-decimal space-y-8 pl-5 text-base leading-relaxed">
        {REFERENCES.map((ref) => (
          <li key={ref.href}>
            <p className="text-ink font-medium">
              {ref.publisher} ({ref.year}). <cite className="not-italic">{ref.title}</cite>.
            </p>
            <p className="mt-1">
              <Link
                href={ref.href}
                className="underline underline-offset-4"
                rel="noopener noreferrer"
              >
                {ref.href}
              </Link>
            </p>
            {ref.note ? <p className="text-ink/60 mt-2 text-sm">{ref.note}</p> : null}
          </li>
        ))}
      </ol>

      <p className="text-ink/60 mt-12 max-w-2xl text-sm">
        Forward-looking corridor economics, take-rate tables, and fundraising milestones in the
        investor deck are <strong>illustrative models</strong>, not demographic facts drawn from
        this list. Live operating counts are on{' '}
        <Link href="/traction" className="text-ink underline underline-offset-4">
          /traction
        </Link>
        .
      </p>
    </EditorialPageLayout>
  );
}
