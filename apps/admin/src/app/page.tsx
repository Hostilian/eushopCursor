import { CATEGORIES, COUNTRIES, FOOD_ITEMS, BRANDS, STATS } from '@eushop/catalog-data';
import Link from 'next/link';

export default function AdminHome() {
  return (
    <main className="mx-auto max-w-6xl p-10">
      <p className="text-xs uppercase tracking-widest text-ash">Eushop · Admin</p>
      <h1 className="mt-2 font-serif text-4xl text-ink">Catalog overview</h1>
      <p className="mt-3 text-ink/70">
        The seed catalog is shipped from <code>packages/catalog-data</code>. Use the editors below
        to extend it; changes go straight to Postgres and are reindexed in Meilisearch.
      </p>

      <ul className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-4">
        <Stat label="Countries" value={STATS.countries} href="/countries" />
        <Stat label="Categories" value={STATS.categories} href="/categories" />
        <Stat label="Brands" value={STATS.brands} href="/brands" />
        <Stat label="Food items" value={STATS.items} href="/items" />
      </ul>

      <section className="mt-16">
        <h2 className="font-serif text-2xl text-ink">Quick actions</h2>
        <ul className="mt-4 space-y-2 text-sm">
          <li>
            <code className="rounded bg-ink/5 px-2 py-1">pnpm db:up</code> — start Postgres,
            Meilisearch and Redis containers
          </li>
          <li>
            <code className="rounded bg-ink/5 px-2 py-1">pnpm db:generate &amp;&amp; pnpm db:migrate</code>
            — apply schema migrations
          </li>
          <li>
            <code className="rounded bg-ink/5 px-2 py-1">pnpm db:seed</code> — seed the EU food
            catalog ({STATS.items} items)
          </li>
          <li>
            <code className="rounded bg-ink/5 px-2 py-1">pnpm search:index</code> — push the
            catalog to Meilisearch
          </li>
        </ul>
      </section>

      <section className="mt-16">
        <h2 className="font-serif text-2xl text-ink">Catalog peek</h2>
        <div className="mt-4 grid gap-8 md:grid-cols-3">
          <ListBlock title="Latest 8 items" items={FOOD_ITEMS.slice(0, 8).map((i) => i.name)} />
          <ListBlock title="Countries" items={COUNTRIES.slice(0, 12).map((c) => `${c.flagEmoji} ${c.name}`)} />
          <ListBlock title="Categories" items={CATEGORIES.slice(0, 10).map((c) => `${c.emoji} ${c.name}`)} />
        </div>
      </section>

      <section className="mt-16">
        <h2 className="font-serif text-2xl text-ink">Brands ({BRANDS.length})</h2>
        <ul className="mt-4 grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
          {BRANDS.map((b) => (
            <li key={b.slug}>
              {b.name} <span className="text-ash">— {b.countryIso2}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

function Stat({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <li className="rounded-2xl border border-ink/10 bg-white p-5">
      <Link href={href}>
        <p className="text-xs uppercase tracking-widest text-ash">{label}</p>
        <p className="mt-2 font-serif text-3xl text-ink">{value}</p>
      </Link>
    </li>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-ash">{title}</p>
      <ul className="mt-3 space-y-1 text-sm">
        {items.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
    </div>
  );
}
