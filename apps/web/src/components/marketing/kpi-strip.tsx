import { STATS } from '@eushop/catalog-data';
import { getTranslations } from 'next-intl/server';
import { isDemoModeEnabled } from '../../lib/demo-mode';
import { showcaseStats } from '../../lib/showcase';

/**
 * Hero KPI strip. By default it shows only counts that are *true today*:
 *
 *  - The size of the curated catalog (countries / categories / items).
 *  - In demo mode, four extra showcase tiles drawn from the showcase dataset
 *    so the page never feels empty during a YC partner walkthrough.
 *
 * Live counts that depend on real user activity (signups, listings, trips,
 * GMV) live on `/traction`, never here. The traction page is the place
 * investors look for "real numbers", and it never honours demo mode.
 */
export async function KpiStrip() {
  const t = await getTranslations('kpi');
  const demo = await isDemoModeEnabled();
  const baseTiles = [
    { label: t('euCountries'), value: STATS.countries },
    { label: t('categories'), value: STATS.categories },
    { label: t('catalogItems'), value: STATS.items },
  ];
  const tiles = demo
    ? [...baseTiles, { label: t('showcaseListings'), value: showcaseStats().liveListings }]
    : [...baseTiles, { label: t('brands'), value: STATS.brands }];

  return (
    <section className="border-ink/10 bg-parchment/60 border-y">
      <div className="container-editorial grid grid-cols-2 gap-6 py-12 md:grid-cols-4 md:gap-10 md:py-16">
        {tiles.map((t) => (
          <div key={t.label} className="text-center md:text-left">
            <p className="text-ink font-serif text-4xl tabular-nums md:text-5xl">{t.value}</p>
            <p className="text-ash mt-2 text-xs tracking-widest uppercase">{t.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
