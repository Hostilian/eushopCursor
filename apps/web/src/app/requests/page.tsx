import { COUNTRIES, FOOD_ITEMS } from '@eushop/catalog-data';
import { countryPalette } from '@eushop/design-tokens';
import { ArrowRight, MapPin } from 'lucide-react';
import Link from 'next/link';
import { Footer } from '../../components/layout/footer';
import { Nav } from '../../components/layout/nav';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';

const SAMPLE_REQUESTS = [
  { item: 'Krówki Mleczne', country: 'PL', city: 'Munich', maxFee: 7, radius: 30 },
  { item: 'Mastiha of Chios', country: 'GR', city: 'Lisbon', maxFee: 12, radius: 50 },
  { item: 'Sült', country: 'EE', city: 'Stockholm', maxFee: 8, radius: 40 },
  { item: 'Ptasie Mleczko', country: 'PL', city: 'Berlin', maxFee: 6, radius: 20 },
  { item: 'Halloumi PDO', country: 'CY', city: 'Vienna', maxFee: 10, radius: 25 },
  { item: 'Cuberdon', country: 'BE', city: 'Madrid', maxFee: 5, radius: 30 },
  { item: 'Manner Original Neapolitaner', country: 'AT', city: 'Paris', maxFee: 4, radius: 15 },
  { item: 'Becherovka', country: 'CZ', city: 'Helsinki', maxFee: 15, radius: 80 },
  { item: 'Tayto Cheese & Onion', country: 'IE', city: 'Amsterdam', maxFee: 6, radius: 35 },
  { item: 'Kalles Kaviar', country: 'SE', city: 'Rome', maxFee: 7, radius: 40 },
];

export default function RequestsPage() {
  return (
    <>
      <Nav />
      <main className="container-editorial pt-12 pb-32">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-xs uppercase tracking-widest text-ash">Wanted</p>
            <h1 className="mt-3 font-serif text-5xl text-ink md:text-6xl">Open requests near you.</h1>
            <p className="mt-4 max-w-xl text-lg text-ink/70">
              When someone posts a matching listing, we'll notify the requester. Set yours below.
            </p>
          </div>
          <Button asChild variant="primary" size="lg">
            <Link href="/requests/new">
              Post a request <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <ul className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
          {SAMPLE_REQUESTS.map((r, idx) => {
            const country = COUNTRIES.find((c) => c.iso2 === r.country);
            const palette = countryPalette[r.country] ?? { primary: '#3B2F22', accent: '#FAF7F2' };
            const item = FOOD_ITEMS.find((i) => i.name === r.item);
            return (
              <li
                key={idx}
                className="group rounded-3xl border border-ink/10 bg-porcelain p-6 transition-all hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="grid h-14 w-14 flex-none place-items-center rounded-2xl text-2xl"
                    style={{ background: palette.primary, color: palette.accent }}
                  >
                    {country?.flagEmoji}
                  </div>
                  <div className="flex-1">
                    <p className="font-serif text-2xl text-ink">{r.item}</p>
                    {item ? (
                      <p className="mt-1 line-clamp-2 text-sm text-ash">{item.description}</p>
                    ) : null}
                    <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-ash">
                      <Badge variant="soft">
                        <MapPin className="h-3 w-3" /> {r.city} · {r.radius} km
                      </Badge>
                      <Badge variant="accent">up to €{r.maxFee} fee</Badge>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-end">
                  <Button variant="outline" size="sm">
                    I have this
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      </main>
      <Footer />
    </>
  );
}
