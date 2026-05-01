import { brands, categories, countries, db, foodItems } from '@eushop/db';
import { eq } from 'drizzle-orm';
import { MeiliSearch } from 'meilisearch';
import { inngest } from '../client.js';

const meili = new MeiliSearch({
  host: process.env.MEILI_HOST ?? 'http://localhost:7700',
  apiKey: process.env.MEILI_MASTER_KEY ?? 'eushopDevMeiliMasterKey',
});

export const reindexCatalog = inngest.createFunction(
  { id: 'reindex-catalog' },
  { event: 'catalog.reindex' },
  async ({ step }) => {
    await step.run('configure-index', async () => {
      const index = meili.index('food_items');
      await index.updateSettings({
        searchableAttributes: ['name', 'aka', 'description', 'tags', 'brandName', 'countryName'],
        filterableAttributes: ['originCountryIso2', 'categorySlug', 'brandSlug', 'tags'],
        sortableAttributes: ['createdAt'],
        rankingRules: ['words', 'typo', 'proximity', 'attribute', 'sort', 'exactness'],
      });
    });

    return await step.run('upsert-documents', async () => {
      const rows = await db
        .select({
          id: foodItems.id,
          slug: foodItems.slug,
          name: foodItems.name,
          aka: foodItems.aka,
          description: foodItems.description,
          tags: foodItems.tags,
          originCountryIso2: foodItems.originCountryIso2,
          categoryId: foodItems.categoryId,
          brandId: foodItems.brandId,
          createdAt: foodItems.createdAt,
        })
        .from(foodItems);

      const cats = await db.select().from(categories);
      const bs = await db.select().from(brands);
      const cs = await db.select().from(countries);
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
        brandSlug: r.brandId ? brandBy.get(r.brandId)?.slug ?? null : null,
        brandName: r.brandId ? brandBy.get(r.brandId)?.name ?? null : null,
        createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
      }));

      const task = await meili.index('food_items').addDocuments(docs, { primaryKey: 'id' });
      return { count: docs.length, taskUid: task.taskUid };
    });
  },
);

void eq; // keep imports tree-shake-friendly
