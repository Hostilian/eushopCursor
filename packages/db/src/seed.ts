import 'dotenv/config';
import { eq } from 'drizzle-orm';
import { BRANDS, CATEGORIES, COUNTRIES, FOOD_ITEMS, STATS } from '@eushop/catalog-data';
import { db, sql } from './client';
import { brands, categories, countries, foodItems } from './schema/catalog';

async function seed() {
  console.info('▸ Seeding catalog');
  console.info(
    `   ${STATS.countries} countries · ${STATS.categories} categories · ${STATS.brands} brands · ${STATS.items} items`,
  );

  // Countries
  for (const c of COUNTRIES) {
    await db
      .insert(countries)
      .values({
        iso2: c.iso2,
        name: c.name,
        flagEmoji: c.flagEmoji,
        defaultLocale: c.defaultLocale,
        currency: c.currency,
        region: c.region,
        blurb: c.blurb,
      })
      .onConflictDoUpdate({
        target: countries.iso2,
        set: {
          name: c.name,
          flagEmoji: c.flagEmoji,
          defaultLocale: c.defaultLocale,
          currency: c.currency,
          region: c.region,
          blurb: c.blurb,
        },
      });
  }

  // Categories
  for (const cat of CATEGORIES) {
    await db
      .insert(categories)
      .values({
        slug: cat.slug,
        name: cat.name,
        description: cat.description,
        emoji: cat.emoji,
        sortOrder: cat.sortOrder,
      })
      .onConflictDoUpdate({
        target: categories.slug,
        set: {
          name: cat.name,
          description: cat.description,
          emoji: cat.emoji,
          sortOrder: cat.sortOrder,
        },
      });
  }

  // Brands
  for (const b of BRANDS) {
    await db
      .insert(brands)
      .values({
        slug: b.slug,
        name: b.name,
        countryIso2: b.countryIso2,
        blurb: b.blurb,
      })
      .onConflictDoUpdate({
        target: brands.slug,
        set: { name: b.name, countryIso2: b.countryIso2, blurb: b.blurb ?? null },
      });
  }

  // Food items
  let inserted = 0;
  for (const item of FOOD_ITEMS) {
    const cat = await db.query.categories.findFirst({
      where: eq(categories.slug, item.categorySlug),
    });
    if (!cat) {
      console.warn(`   skip ${item.slug} — unknown category ${item.categorySlug}`);
      continue;
    }
    let brandId: string | undefined;
    if (item.brandSlug) {
      const b = await db.query.brands.findFirst({ where: eq(brands.slug, item.brandSlug) });
      brandId = b?.id;
    }

    await db
      .insert(foodItems)
      .values({
        slug: item.slug,
        name: item.name,
        aka: item.aka ?? [],
        originCountryIso2: item.originCountryIso2,
        categoryId: cat.id,
        brandId,
        description: item.description,
        tags: item.tags ?? [],
      })
      .onConflictDoUpdate({
        target: foodItems.slug,
        set: {
          name: item.name,
          aka: item.aka ?? [],
          originCountryIso2: item.originCountryIso2,
          categoryId: cat.id,
          brandId,
          description: item.description,
          tags: item.tags ?? [],
          updatedAt: new Date(),
        },
      });
    inserted += 1;
  }

  console.info(`✓ Seeded ${inserted} food items`);
  await sql.end();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
