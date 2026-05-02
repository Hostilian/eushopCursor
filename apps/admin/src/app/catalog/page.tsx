import { CATEGORIES, STATS } from '@eushop/catalog-data';

export default function AdminCatalogPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-ink font-serif text-3xl">Catalog</h1>
      <p className="text-ink/70 text-sm">
        Seed data: {STATS.items} items across {STATS.countries} countries and {STATS.categories}{' '}
        category rows.
      </p>
      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((c) => (
          <li
            key={c.slug}
            className="border-ink/10 bg-porcelain/50 rounded-xl border px-3 py-2 text-sm"
          >
            <span className="mr-2">{c.emoji}</span>
            {c.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
