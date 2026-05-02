import { catalogQuery } from '@eushop/validators';
import { TRPCError } from '@trpc/server';
import { and, asc, desc, eq, ilike, or, sql } from 'drizzle-orm';
import { z } from 'zod';
import { brands, categories, countries, foodItems } from '@eushop/db';
import { publicProcedure, router } from '../trpc';

export const catalogRouter = router({
  countries: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.select().from(countries).orderBy(asc(countries.name));
  }),

  countriesByRegion: publicProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db.select().from(countries).orderBy(asc(countries.name));
    const grouped = new Map<string, typeof rows>();
    for (const row of rows) {
      const arr = grouped.get(row.region) ?? [];
      arr.push(row);
      grouped.set(row.region, arr);
    }
    return Array.from(grouped.entries()).map(([region, items]) => ({ region, items }));
  }),

  country: publicProcedure
    .input(z.object({ iso2: z.string().length(2) }))
    .query(async ({ ctx, input }) => {
      const country = await ctx.db.query.countries.findFirst({
        where: eq(countries.iso2, input.iso2.toUpperCase()),
      });
      if (!country) throw new TRPCError({ code: 'NOT_FOUND' });
      return country;
    }),

  categories: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.select().from(categories).orderBy(asc(categories.sortOrder));
  }),

  brands: publicProcedure
    .input(z.object({ countryIso2: z.string().length(2).optional() }).optional())
    .query(async ({ ctx, input }) => {
      const where = input?.countryIso2
        ? eq(brands.countryIso2, input.countryIso2.toUpperCase())
        : undefined;
      return ctx.db.select().from(brands).where(where).orderBy(asc(brands.name));
    }),

  itemBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const item = await ctx.db.query.foodItems.findFirst({
        where: eq(foodItems.slug, input.slug),
      });
      if (!item) throw new TRPCError({ code: 'NOT_FOUND' });
      const [country, category, brand] = await Promise.all([
        ctx.db.query.countries.findFirst({ where: eq(countries.iso2, item.originCountryIso2) }),
        ctx.db.query.categories.findFirst({ where: eq(categories.id, item.categoryId) }),
        item.brandId
          ? ctx.db.query.brands.findFirst({ where: eq(brands.id, item.brandId) })
          : Promise.resolve(undefined),
      ]);
      return { ...item, country, category, brand };
    }),

  browse: publicProcedure.input(catalogQuery).query(async ({ ctx, input }) => {
    const conditions = [];
    if (input.countryIso2) conditions.push(eq(foodItems.originCountryIso2, input.countryIso2));
    if (input.categorySlug) {
      const cat = await ctx.db.query.categories.findFirst({
        where: eq(categories.slug, input.categorySlug),
      });
      if (cat) conditions.push(eq(foodItems.categoryId, cat.id));
    }
    if (input.brandSlug) {
      const b = await ctx.db.query.brands.findFirst({ where: eq(brands.slug, input.brandSlug) });
      if (b) conditions.push(eq(foodItems.brandId, b.id));
    }
    if (input.q) {
      const pattern = `%${input.q.replace(/[%_]/g, '')}%`;
      conditions.push(or(ilike(foodItems.name, pattern), ilike(foodItems.description, pattern))!);
    }

    const rows = await ctx.db
      .select()
      .from(foodItems)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(foodItems.createdAt))
      .limit(input.limit);

    return { items: rows, nextCursor: rows.length === input.limit ? rows.at(-1)?.id : undefined };
  }),

  itemsByCountry: publicProcedure
    .input(
      z.object({ iso2: z.string().length(2), limit: z.number().int().min(1).max(60).default(24) }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db
        .select()
        .from(foodItems)
        .where(eq(foodItems.originCountryIso2, input.iso2.toUpperCase()))
        .orderBy(sql`random()`)
        .limit(input.limit);
    }),

  itemsByCategory: publicProcedure
    .input(z.object({ slug: z.string(), limit: z.number().int().min(1).max(60).default(24) }))
    .query(async ({ ctx, input }) => {
      const cat = await ctx.db.query.categories.findFirst({
        where: eq(categories.slug, input.slug),
      });
      if (!cat) throw new TRPCError({ code: 'NOT_FOUND' });
      const items = await ctx.db
        .select()
        .from(foodItems)
        .where(eq(foodItems.categoryId, cat.id))
        .orderBy(asc(foodItems.name))
        .limit(input.limit);
      return { category: cat, items };
    }),

  search: publicProcedure
    .input(
      z.object({
        q: z.string().min(1).max(120),
        limit: z.number().int().min(1).max(40).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        const result = await ctx.meili.index('food_items').search<{
          id: string;
          name: string;
          slug: string;
          originCountryIso2: string;
          description: string;
        }>(input.q, {
          limit: input.limit,
          attributesToHighlight: ['name', 'description'],
        });
        return result.hits;
      } catch {
        // graceful fallback to ilike if meili is not running
        const pattern = `%${input.q.replace(/[%_]/g, '')}%`;
        return ctx.db
          .select({
            id: foodItems.id,
            name: foodItems.name,
            slug: foodItems.slug,
            originCountryIso2: foodItems.originCountryIso2,
            description: foodItems.description,
          })
          .from(foodItems)
          .where(or(ilike(foodItems.name, pattern), ilike(foodItems.description, pattern)))
          .limit(input.limit);
      }
    }),
});
