import { STATS } from '@eushop/catalog-data';
import { SHOWCASE_STATS } from '@eushop/mock-data';

export function KpiStrip() {
  const tiles = [
    { label: 'EU countries', value: STATS.countries },
    { label: 'Categories', value: STATS.categories },
    { label: 'Catalog items', value: STATS.items },
    { label: 'Cities (demo feed)', value: SHOWCASE_STATS.cities },
  ];

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
