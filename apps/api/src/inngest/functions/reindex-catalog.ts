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
      const cats = await db.select().from(categories);
      const bs = await db.select().from(brands);
      const cs = await db.select().from(countries);
      const catBy = new Map(cats.map((c) => [c.id, c]));
      const brandBy = new Map(bs.map((b) => [b.id, b]));
      const countryBy = new Map(cs.map((c) => [c.iso2, c]));

      // Stream food items in pages and push to Meili in batches so a
      // 100k+ row catalog doesn't materialise as one huge in-memory array
      // (or one huge addDocuments POST). Default chunk size is 1k rows;
      // override with `MEILI_REINDEX_BATCH_SIZE` if needed.
      const PAGE_SIZE = Math.max(
        100,
        Math.min(5_000, Number(process.env.MEILI_REINDEX_BATCH_SIZE ?? 1_000)),
      );
      const index = meili.index('food_items');
      const taskUids: number[] = [];
      let total = 0;
      let offset = 0;

      for (;;) {
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
            defaultImageUrl: foodItems.defaultImageUrl,
            imageVariants: foodItems.imageVariants,
            barcode: foodItems.barcode,
            openFoodFactsId: foodItems.openFoodFactsId,
            createdAt: foodItems.createdAt,
          })
          .from(foodItems)
          .orderBy(foodItems.createdAt, foodItems.id)
          .limit(PAGE_SIZE)
          .offset(offset);

        if (rows.length === 0) break;

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
          createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
        }));

        const task = await index.addDocuments(docs, { primaryKey: 'id' });
        taskUids.push(task.taskUid);
        total += docs.length;

        if (rows.length < PAGE_SIZE) break;
        offset += PAGE_SIZE;
      }

      return { count: total, batches: taskUids.length, taskUids };
    });
  },
);

void eq; // keep imports tree-shake-friendly
