import { CATEGORIES, COUNTRIES, FOOD_ITEMS, BRANDS, STATS } from '@eushop/catalog-data';
import Link from 'next/link';
import { api } from '../lib/trpc-server';

export default async function AdminHome() {
  // Live counts come straight from the DB via tRPC. If the database is offline
  // (a fresh dev clone before `pnpm db:up && pnpm db:migrate && pnpm db:seed`)
  // we silently fall back to the build-time STATS from the curated catalog,
  // which is genuine data — the values just stop being authoritative for the
  // moderation queue tiles.
  let live = {
    countries: STATS.countries,
    categories: STATS.categories,
    brands: STATS.brands,
    items: STATS.items,
  };
  try {
    const trpc = await api();
    const [countriesRows, categoriesRows, brandsRows, itemsRows] = await Promise.all([
      trpc.catalog.countries(),
      trpc.catalog.categories(),
      trpc.catalog.brands(),
      trpc.catalog.browse({ limit: 60 }),
    ]);
    live = {
      countries: countriesRows.length,
      categories: categoriesRows.length,
      brands: brandsRows.length,
      items: itemsRows.items.length,
    };
  } catch {
    /* offline — fall through to STATS */
  }

  return (
    <div className="mx-auto max-w-6xl p-6 md:p-10">
      <p className="text-ash text-xs tracking-widest uppercase">Eushop · Admin</p>
      <h1 className="text-ink mt-2 font-serif text-4xl">Catalog overview</h1>
      <p className="text-ink/70 mt-3">
        Live counts come from the database via tRPC. The seed catalog in{' '}
        <code>packages/catalog-data</code> is the floor; everything above it is contributed by users
        and approved through the moderation queue.
      </p>

      <ul className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-4">
        <Stat label="Countries" value={live.countries} href="/countries" />
        <Stat label="Categories" value={live.categories} href="/categories" />
        <Stat label="Brands" value={live.brands} href="/brands" />
        <Stat label="Food items" value={live.items} href="/items" />
      </ul>

      <section className="mt-16">
        <h2 className="text-ink font-serif text-2xl">Quick actions</h2>
        <ul className="mt-4 space-y-2 text-sm">
          <li>
            <code className="bg-ink/5 rounded px-2 py-1">pnpm db:up</code> — start Postgres,
            Meilisearch and Redis containers
          </li>
          <li>
            <code className="bg-ink/5 rounded px-2 py-1">
              pnpm db:generate &amp;&amp; pnpm db:migrate
            </code>
            — apply schema migrations
          </li>
          <li>
            <code className="bg-ink/5 rounded px-2 py-1">pnpm db:seed</code> — seed the EU food
            catalog ({STATS.items} curated items)
          </li>
          <li>
            <code className="bg-ink/5 rounded px-2 py-1">pnpm search:index</code> — push the catalog
            to Meilisearch
          </li>
        </ul>
      </section>

      <section className="mt-16">
        <h2 className="text-ink font-serif text-2xl">Catalog peek</h2>
        <div className="mt-4 grid gap-8 md:grid-cols-3">
          <ListBlock
            title="Latest 8 curated items"
            items={FOOD_ITEMS.slice(0, 8).map((i) => i.name)}
          />
          <ListBlock
            title="Countries"
            items={COUNTRIES.slice(0, 12).map((c) => `${c.flagEmoji} ${c.name}`)}
          />
          <ListBlock
            title="Categories"
            items={CATEGORIES.slice(0, 10).map((c) => `${c.emoji} ${c.name}`)}
          />
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-ink font-serif text-2xl">Brands ({BRANDS.length})</h2>
        <ul className="mt-4 grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
          {BRANDS.map((b) => (
            <li key={b.slug}>
              {b.name} <span className="text-ash">— {b.countryIso2}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Stat({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <li className="border-ink/10 rounded-2xl border bg-white p-5">
      <Link href={href}>
        <p className="text-ash text-xs tracking-widest uppercase">{label}</p>
        <p className="text-ink mt-2 font-serif text-3xl">{value}</p>
      </Link>
    </li>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="text-ash text-xs tracking-widest uppercase">{title}</p>
      <ul className="mt-3 space-y-1 text-sm">
        {items.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
    </div>
  );
}
