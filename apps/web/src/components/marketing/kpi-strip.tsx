import { STATS } from '@eushop/catalog';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { isDemoModeEnabled } from '../../lib/demo-mode';
import { showcaseStats } from '../../lib/showcase';

/**
 * KPI strip: curated catalog scale (countries, categories, items, brands).
 * With demo mode on, extra tiles show illustrative marketplace counts from the showcase dataset.
 * Live marketplace metrics stay on `/traction`.
 */
export async function KpiStrip() {
  const t = await getTranslations('kpi');
  const tNav = await getTranslations('nav');
  const demo = await isDemoModeEnabled();
  const stats = showcaseStats();
  const baseTiles = [
    { label: t('euCountries'), value: STATS.countries },
    { label: t('categories'), value: STATS.categories },
    { label: t('catalogItems'), value: STATS.items },
    { label: t('brands'), value: STATS.brands },
  ];
  const tiles = demo
    ? [
        ...baseTiles,
        { label: t('demoShowcaseListings'), value: stats.liveListings },
        { label: t('demoShowcaseRequests'), value: stats.openRequests },
        { label: t('demoShowcaseTrips'), value: stats.tripOffers },
      ]
    : baseTiles;

  return (
    <section className="border-ink/10 bg-parchment/60 border-y">
      <div
        className={`container-editorial grid grid-cols-2 gap-6 py-12 md:gap-10 md:py-16 ${demo ? 'md:grid-cols-4 lg:grid-cols-7' : 'md:grid-cols-4'}`}
      >
        {tiles.map((tile) => (
          <div key={tile.label} className="text-center md:text-left">
            <p className="text-ink font-serif text-4xl tabular-nums md:text-5xl">{tile.value}</p>
            <p className="text-ash mt-2 text-xs tracking-widest uppercase">{tile.label}</p>
          </div>
        ))}
      </div>
      <p className="text-ink/55 container-editorial -mt-4 pb-10 text-center text-xs md:text-left">
        {t('stripFootnote')}{' '}
        <Link href="/traction" className="text-ink underline underline-offset-4">
          /traction
        </Link>
        . {t('stripFootnoteSources')}{' '}
        <Link href="/sources" className="text-ink underline underline-offset-4">
          {tNav('sources')}
        </Link>
        .
      </p>
    </section>
  );
}
