import { catalogQuery } from '@eushop/validators';
import { TRPCError } from '@trpc/server';
import { and, asc, desc, eq, ilike, or, sql } from 'drizzle-orm';
import { z } from 'zod';
import { brands, categories, countries, foodItems } from '@eushop/db';
import {
  fallbackBrands,
  fallbackCategories,
  fallbackCountries,
  fallbackCountriesByRegion,
  fallbackCountryByIso,
  fallbackItemBySlug,
  fallbackItems,
  fallbackItemsByCategory,
  withFallback,
  withListFallback,
} from '../lib/mock-fallback';
import { publicProcedure, router } from '../trpc';

export const catalogRouter = router({
  countries: publicProcedure.query(async ({ ctx }) =>
    withListFallback(
      () => ctx.db.select().from(countries).orderBy(asc(countries.name)),
      () => fallbackCountries(),
    ),
  ),

  countriesByRegion: publicProcedure.query(async ({ ctx }) =>
    withFallback(
      async () => {
        const rows = await ctx.db.select().from(countries).orderBy(asc(countries.name));
        if (rows.length === 0) throw new Error('empty');
        const grouped = new Map<string, typeof rows>();
        for (const row of rows) {
          const arr = grouped.get(row.region) ?? [];
          arr.push(row);
          grouped.set(row.region, arr);
        }
        return Array.from(grouped.entries()).map(([region, items]) => ({ region, items }));
      },
      () => fallbackCountriesByRegion(),
    ),
  ),

  country: publicProcedure
    .input(z.object({ iso2: z.string().length(2) }))
    .query(async ({ ctx, input }) => {
      const fallback = fallbackCountryByIso(input.iso2);
      const country = await withFallback(
        async () => {
          const row = await ctx.db.query.countries.findFirst({
            where: eq(countries.iso2, input.iso2.toUpperCase()),
          });
          if (!row) throw new TRPCError({ code: 'NOT_FOUND' });
          return row;
        },
        () => {
          if (!fallback) throw new TRPCError({ code: 'NOT_FOUND' });
          return fallback;
        },
      );
      return country;
    }),

  categories: publicProcedure.query(async ({ ctx }) =>
    withListFallback(
      () => ctx.db.select().from(categories).orderBy(asc(categories.sortOrder)),
      () => fallbackCategories(),
    ),
  ),

  brands: publicProcedure
    .input(z.object({ countryIso2: z.string().length(2).optional() }).optional())
    .query(async ({ ctx, input }) => {
      const where = input?.countryIso2
        ? eq(brands.countryIso2, input.countryIso2.toUpperCase())
        : undefined;
      return withListFallback(
        () => ctx.db.select().from(brands).where(where).orderBy(asc(brands.name)),
        () => fallbackBrands(input?.countryIso2),
      );
    }),

  itemBySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ ctx, input }) =>
    withFallback(
      async () => {
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
      },
      () => {
        const it = fallbackItemBySlug(input.slug);
        if (!it) throw new TRPCError({ code: 'NOT_FOUND' });
        return it;
      },
    ),
  ),

  browse: publicProcedure.input(catalogQuery).query(async ({ ctx, input }) =>
    withFallback(
      async () => {
        const conditions = [];
        if (input.countryIso2) conditions.push(eq(foodItems.originCountryIso2, input.countryIso2));
        if (input.categorySlug) {
          const cat = await ctx.db.query.categories.findFirst({
            where: eq(categories.slug, input.categorySlug),
          });
          if (cat) conditions.push(eq(foodItems.categoryId, cat.id));
        }
        if (input.brandSlug) {
          const b = await ctx.db.query.brands.findFirst({
            where: eq(brands.slug, input.brandSlug),
          });
          if (b) conditions.push(eq(foodItems.brandId, b.id));
        }
        if (input.q) {
          const pattern = `%${input.q.replace(/[%_]/g, '')}%`;
          conditions.push(
            or(ilike(foodItems.name, pattern), ilike(foodItems.description, pattern))!,
          );
        }

        const rows = await ctx.db
          .select()
          .from(foodItems)
          .where(conditions.length ? and(...conditions) : undefined)
          .orderBy(desc(foodItems.createdAt))
          .limit(input.limit);

        if (rows.length === 0) throw new Error('empty');
        return {
          items: rows,
          nextCursor: rows.length === input.limit ? rows.at(-1)?.id : undefined,
        };
      },
      () => {
        const items = fallbackItems((it) => {
          if (input.countryIso2 && it.originCountryIso2 !== input.countryIso2) return false;
          if (input.categorySlug && it.categorySlug !== input.categorySlug) return false;
          if (input.brandSlug && it.brandSlug !== input.brandSlug) return false;
          if (input.q) {
            const q = input.q.toLowerCase();
            return it.name.toLowerCase().includes(q) || it.description.toLowerCase().includes(q);
          }
          return true;
        }).slice(0, input.limit);
        return {
          items,
          nextCursor: items.length === input.limit ? items.at(-1)?.id : undefined,
        };
      },
    ),
  ),

  itemsByCountry: publicProcedure
    .input(
      z.object({ iso2: z.string().length(2), limit: z.number().int().min(1).max(60).default(24) }),
    )
    .query(async ({ ctx, input }) =>
      withListFallback(
        () =>
          ctx.db
            .select()
            .from(foodItems)
            .where(eq(foodItems.originCountryIso2, input.iso2.toUpperCase()))
            .orderBy(sql`random()`)
            .limit(input.limit),
        () =>
          fallbackItems((it) => it.originCountryIso2 === input.iso2.toUpperCase()).slice(
            0,
            input.limit,
          ),
      ),
    ),

  itemsByCategory: publicProcedure
    .input(z.object({ slug: z.string(), limit: z.number().int().min(1).max(60).default(24) }))
    .query(async ({ ctx, input }) =>
      withFallback(
        async () => {
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
          if (items.length === 0) throw new Error('empty');
          return { category: cat, items };
        },
        () => {
          const fb = fallbackItemsByCategory(input.slug, input.limit);
          if (!fb) throw new TRPCError({ code: 'NOT_FOUND' });
          return fb;
        },
      ),
    ),

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
        if (result.hits.length > 0) return result.hits;
        throw new Error('empty');
      } catch {
        const pattern = `%${input.q.replace(/[%_]/g, '')}%`;
        try {
          const rows = await ctx.db
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
          if (rows.length > 0) return rows;
        } catch {
          /* fall through to mock */
        }
        const q = input.q.toLowerCase();
        return fallbackItems(
          (it) => it.name.toLowerCase().includes(q) || it.description.toLowerCase().includes(q),
        )
          .slice(0, input.limit)
          .map((it) => ({
            id: it.id,
            name: it.name,
            slug: it.slug,
            originCountryIso2: it.originCountryIso2,
            description: it.description,
          }));
      }
    }),
});
