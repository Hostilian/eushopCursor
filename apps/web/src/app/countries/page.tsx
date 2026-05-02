import { COUNTRIES } from '@eushop/catalog-data';
import { countryPalette } from '@eushop/design-tokens';
import Link from 'next/link';
import { Footer } from '../../components/layout/footer';
import { Nav } from '../../components/layout/nav';

const REGION_LABELS: Record<string, string> = {
  central: 'Central',
  western: 'Western',
  southern: 'Southern',
  northern: 'Northern',
  eastern: 'Eastern',
  eea: 'EEA',
};

export default function CountriesPage() {
  const grouped = COUNTRIES.reduce<Record<string, typeof COUNTRIES>>((acc, c) => {
    (acc[c.region] ??= []).push(c);
    return acc;
  }, {});

  return (
    <>
      <Nav />
      <main className="container-editorial pt-16 pb-32">
        <p className="text-xs uppercase tracking-widest text-ash">Pick a flag</p>
        <h1 className="mt-3 font-serif text-5xl text-ink md:text-6xl">All {COUNTRIES.length} home countries.</h1>
        <p className="mt-4 max-w-2xl text-lg text-ink/70">
          We index niche regional foods from every EU member, plus EEA neighbours Norway and
          Iceland. Tap a flag for the editorial.
        </p>

        {Object.entries(grouped).map(([region, items]) => (
          <section key={region} className="mt-20">
            <h2 className="font-serif text-2xl text-ink">{REGION_LABELS[region] ?? region}</h2>
            <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {items.map((c) => {
                const palette = countryPalette[c.iso2] ?? { primary: '#3B2F22', accent: '#FAF7F2' };
                return (
                  <li key={c.iso2}>
                    <Link
                      href={`/countries/${c.iso2.toLowerCase()}`}
                      className="group flex h-32 flex-col justify-between rounded-3xl border border-ink/10 p-5 transition-transform hover:-translate-y-1"
                      style={{ background: palette.primary, color: palette.accent }}
                    >
                      <span className="text-3xl">{c.flagEmoji}</span>
                      <div>
                        <p className="font-serif text-lg leading-tight">{c.name}</p>
                        <p className="text-xs uppercase tracking-widest opacity-70">{c.iso2}</p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </main>
      <Footer />
    </>
  );
}
