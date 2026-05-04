import {
  listOpenFoodFactsByCategory,
  searchOpenFoodFacts,
  type OpenFoodFactsCandidate,
} from '@eushop/catalog/openfoodfacts';
import { brands, categories, db, foodItems } from '@eushop/db';
import { eq, sql } from 'drizzle-orm';
import { inngest } from '../client.js';

/**
 * Pull a batch of products from Open Food Facts and upsert them into
 * `food_items`. Items land with `verified_at = null` so they remain visible
 * but flagged in the admin moderation queue. Attribution is enforced at the
 * UI layer.
 *
 * Runs from `catalog.import-openfoodfacts` events; chained from the cron
 * function below so an empty database can warm up the catalog overnight.
 */
export const importOpenFoodFactsBatch = inngest.createFunction(
  {
    id: 'import-openfoodfacts-batch',
    /** OFF asks well-behaved clients to keep traffic gentle. */
    concurrency: { limit: 1 },
    retries: 3,
  },
  { event: 'catalog.import-openfoodfacts' },
  async ({ event, step, logger }) => {
    const candidates = await step.run('fetch-from-off', async () => {
      if (event.data.query) {
        return searchOpenFoodFacts(event.data.query, {
          limit: event.data.pageSize ?? 50,
        });
      }
      return listOpenFoodFactsByCategory(event.data.categoryTag ?? 'snacks', {
        page: event.data.page ?? 1,
        pageSize: event.data.pageSize ?? 100,
        euOnly: true,
      });
    });

    if (candidates.length === 0) {
      logger.info('OFF returned 0 candidates', event.data);
      return { imported: 0 };
    }

    const result = await step.run('upsert', async () => {
      let inserted = 0;
      let updated = 0;
      let skipped = 0;
      for (const c of candidates) {
        if (!c.barcode) {
          skipped++;
          continue;
        }
        const cat = await pickCategory(c);
        if (!cat) {
          skipped++;
          continue;
        }
        const brand = await pickBrand(c);
        const slug = `off-${c.barcode}`;
        const imageVariants = {
          large: c.images[0],
          small: c.images[1] ?? c.images[0],
          thumb: c.images[2] ?? c.images[1] ?? c.images[0],
          source: 'off' as const,
        };
        const existing = await db.query.foodItems.findFirst({
          where: eq(foodItems.openFoodFactsId, c.barcode),
        });
        if (existing) {
          await db
            .update(foodItems)
            .set({
              name: existing.verifiedAt ? existing.name : c.name,
              description: existing.verifiedAt ? existing.description : (c.description ?? ''),
              imageVariants,
              defaultImageUrl: imageVariants.large ?? existing.defaultImageUrl,
              updatedAt: new Date(),
            })
            .where(eq(foodItems.id, existing.id));
          updated++;
          continue;
        }
        try {
          await db.insert(foodItems).values({
            slug,
            name: c.name,
            aka: [],
            originCountryIso2: c.originCountryIso2 ?? 'EU',
            categoryId: cat.id,
            brandId: brand?.id,
            description: c.description ?? '',
            tags: [],
            defaultImageUrl: imageVariants.large,
            imageVariants,
            barcode: c.barcode,
            openFoodFactsId: c.barcode,
            verifiedAt: null,
            submittedById: null,
          });
          inserted++;
        } catch (e) {
          // Most likely a slug collision from a non-OFF curated entry that
          // happened to claim the same barcode. We skip rather than blow up.
          logger.warn('OFF upsert skipped', {
            barcode: c.barcode,
            reason: e instanceof Error ? e.message : 'unknown',
          });
          skipped++;
        }
      }
      return { inserted, updated, skipped };
    });

    if (result.inserted > 0 || result.updated > 0) {
      // Push fresh and refreshed docs into Meili so the picker reflects the
      // new image variants/descriptions, not just first-seen barcodes.
      await step.sendEvent('trigger-reindex', {
        name: 'catalog.reindex',
        data: {},
      });
    }

    return { imported: result.inserted, updated: result.updated, skipped: result.skipped };
  },
);

/**
 * Daily cron: pulls a fresh batch of EU snacks/dairy/condiments from OFF.
 * Runs at 03:14 UTC to dodge Open Food Facts' peak hours.
 */
export const importOpenFoodFactsDaily = inngest.createFunction(
  { id: 'import-openfoodfacts-daily' },
  { cron: '14 3 * * *' },
  async ({ step }) => {
    const tags = ['snacks', 'dairies', 'condiments', 'beverages', 'biscuits-and-cakes'];
    for (const tag of tags) {
      await step.sendEvent(`enqueue-${tag}`, {
        name: 'catalog.import-openfoodfacts',
        data: { categoryTag: tag, page: 1, pageSize: 100 },
      });
    }
    return { enqueued: tags.length };
  },
);

async function pickCategory(c: OpenFoodFactsCandidate) {
  const tags = c.categoriesRaw ?? [];
  const guess = pickCategorySlugFromTags(tags);
  if (guess) {
    const found = await db.query.categories.findFirst({ where: eq(categories.slug, guess) });
    if (found) return found;
  }
  // Fallback: a generic "snacks" bucket. If even that is missing we abort
  // the row instead of inventing a category — staying honest with the seed.
  return db.query.categories.findFirst({ where: eq(categories.slug, 'snacks') });
}

function pickCategorySlugFromTags(tags: string[]): string | null {
  for (const t of tags) {
    const code = t.replace(/^en:/, '');
    if (code.includes('snack')) return 'snacks';
    if (code.includes('cheese')) return 'cheese';
    if (code.includes('dairy') || code.includes('milk')) return 'dairy';
    if (code.includes('chocolate') || code.includes('confection')) return 'chocolate';
    if (code.includes('beer')) return 'beer';
    if (code.includes('wine')) return 'wine';
    if (code.includes('coffee')) return 'coffee';
    if (code.includes('tea')) return 'tea';
    if (code.includes('biscuit')) return 'biscuits';
    if (code.includes('candy') || code.includes('sweet')) return 'sweets';
    if (code.includes('condiment')) return 'condiments';
  }
  return null;
}

async function pickBrand(c: OpenFoodFactsCandidate) {
  if (!c.brandRaw) return undefined;
  const brandSlug = c.brandRaw.toLowerCase().split(',')[0]?.trim().replace(/\s+/g, '-');
  if (!brandSlug) return undefined;
  const found = await db.query.brands.findFirst({ where: eq(brands.slug, brandSlug) });
  return found;
}

void sql; // keep tree-shake happy
