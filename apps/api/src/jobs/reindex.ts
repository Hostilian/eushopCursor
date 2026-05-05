import 'dotenv/config';
import { brands, categories, countries, db, foodItems, sql } from '@eushop/db';
import { MeiliSearch } from 'meilisearch';

async function run() {
  const meili = new MeiliSearch({
    host: process.env.MEILI_HOST ?? 'http://localhost:7700',
    apiKey: process.env.MEILI_MASTER_KEY ?? 'eushopDevMeiliMasterKey',
  });

  console.info('▸ Configuring Meilisearch index');
  const index = meili.index('food_items');
  await index.updateSettings({
    searchableAttributes: ['name', 'aka', 'description', 'tags', 'brandName', 'countryName'],
    filterableAttributes: ['originCountryIso2', 'categorySlug', 'brandSlug', 'tags'],
    sortableAttributes: ['createdAt'],
    rankingRules: ['words', 'typo', 'proximity', 'attribute', 'sort', 'exactness'],
    typoTolerance: { enabled: true, minWordSizeForTypos: { oneTypo: 4, twoTypos: 8 } },
    synonyms: {
      pierogi: ['pirogi', 'vareniki'],
      pirogi: ['pierogi', 'vareniki'],
      ajvar: ['ajvara'],
      burek: ['byrek'],
      cevapcici: ['cevapi', 'ćevapi'],
      passata: ['passata di pomodoro'],
      gochujang: ['kochujang'],
      yoghurt: ['yogurt'],
      paprika: ['bell pepper'],
    },
    pagination: { maxTotalHits: 2000 },
  });

  console.info('▸ Loading rows');
  const [rows, cats, bs, cs] = await Promise.all([
    db.select().from(foodItems),
    db.select().from(categories),
    db.select().from(brands),
    db.select().from(countries),
  ]);

  const catBy = new Map(cats.map((c) => [c.id, c]));
  const brandBy = new Map(bs.map((b) => [b.id, b]));
  const countryBy = new Map(cs.map((c) => [c.iso2, c]));

  const docs = rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    aka: r.aka,
    description: r.description,
    tags: r.tags,
    originCountryIso2: r.originCountryIso2,
    countryName: countryBy.get(r.originCountryIso2)?.name ?? '',
    categorySlug: catBy.get(r.categoryId)?.slug ?? '',
    brandSlug: r.brandId ? (brandBy.get(r.brandId)?.slug ?? null) : null,
    brandName: r.brandId ? (brandBy.get(r.brandId)?.name ?? null) : null,
    defaultImageUrl: r.defaultImageUrl,
    imageVariants: r.imageVariants,
    barcode: r.barcode,
    openFoodFactsId: r.openFoodFactsId,
    createdAt: r.createdAt.toISOString(),
  }));

  console.info(`▸ Indexing ${docs.length} food items`);
  const task = await index.addDocuments(docs, { primaryKey: 'id' });
  console.info(`✓ Enqueued Meilisearch task ${task.taskUid}`);

  await sql.end();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
