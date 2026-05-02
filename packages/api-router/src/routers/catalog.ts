import { searchOpenFoodFacts } from '@eushop/catalog-data';
import {
  adminCatalogUgcQueueInput,
  adminReviewFoodItemCandidateInput,
  adminReviewFoodItemImageProposalInput,
  catalogQuery,
  catalogSearchWithSuggestionsInput,
  proposeFoodItemImageInput,
  proposeFoodItemInput,
  upvoteFoodItemImageInput,
} from '@eushop/validators';
import { TRPCError } from '@trpc/server';
import { and, asc, desc, eq, ilike, or, sql } from 'drizzle-orm';
import { z } from 'zod';
import {
  brands,
  categories,
  countries,
  foodItemCandidates,
  foodItemImageProposals,
  foodItemImageVotes,
  foodItems,
} from '@eushop/db';
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
import { adminProcedure, protectedProcedure, publicProcedure, router } from '../trpc';
import type { Context } from '../context';

type CatalogImageVariantSource = 'off' | 'r2' | 'user';

function baseSlugFromName(name: string): string {
  const s = name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return s.length >= 2 ? s : 'food-item';
}

/** Accepts root `db` or a transaction client — same query surface for reads/writes used here. */
async function uniqueFoodItemSlug(db: Context['db'], name: string): Promise<string> {
  const stem = baseSlugFromName(name);
  for (let n = 0; n < 500; n++) {
    const slug = (n === 0 ? stem : `${stem}-${n}`).slice(0, 96);
    const taken = await db.query.foodItems.findFirst({
      where: eq(foodItems.slug, slug),
      columns: { id: true },
    });
    if (!taken) return slug;
  }
  throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Could not allocate slug' });
}

function imageVariantSourceFromProposedTag(tag: string | undefined): CatalogImageVariantSource {
  const t = tag?.toLowerCase();
  if (t === 'off') return 'off';
  if (t === 'r2') return 'r2';
  return 'user';
}

function imageVariantSourceFromProposalSource(source: string): CatalogImageVariantSource {
  if (source === 'off') return 'off';
  if (source === 'r2') return 'r2';
  return 'user';
}

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

  /**
   * Picker-grade search. First hits Meili (then Postgres trigram, then the
   * curated catalog fallback), then optionally enriches with Open Food Facts
   * candidates that are *not yet in our index*. The remote results are
   * tagged `source: 'remote'` so the UI can offer a one-click "Pull this in"
   * button which routes through `proposeItem`.
   */
  searchWithSuggestions: publicProcedure
    .input(catalogSearchWithSuggestionsInput)
    .query(async ({ ctx, input }) => {
      type Hit = {
        id: string;
        slug?: string;
        name: string;
        originCountryIso2: string;
        description: string;
        imageVariants?: { thumb?: string; small?: string; large?: string };
        images: string[];
        source: 'local' | 'remote';
        barcode?: string | null;
        openFoodFactsId?: string | null;
      };
      const hits: Hit[] = [];
      const seenSlugs = new Set<string>();
      const seenBarcodes = new Set<string>();

      try {
        const result = await ctx.meili.index('food_items').search<{
          id: string;
          name: string;
          slug: string;
          originCountryIso2: string;
          description: string;
          imageVariants?: { thumb?: string; small?: string; large?: string };
          defaultImageUrl?: string;
          barcode?: string;
          openFoodFactsId?: string;
        }>(input.q, { limit: input.limit });
        for (const h of result.hits) {
          const images = [h.imageVariants?.large, h.imageVariants?.small, h.defaultImageUrl]
            .filter((u): u is string => !!u)
            .slice(0, 3);
          hits.push({
            id: h.id,
            slug: h.slug,
            name: h.name,
            originCountryIso2: h.originCountryIso2,
            description: h.description,
            imageVariants: h.imageVariants,
            images,
            source: 'local',
            barcode: h.barcode,
            openFoodFactsId: h.openFoodFactsId,
          });
          if (h.slug) seenSlugs.add(h.slug);
          if (h.barcode) seenBarcodes.add(h.barcode);
        }
      } catch {
        // Meili offline; fall through to DB / catalog.
      }

      if (hits.length < input.limit) {
        try {
          const pattern = `%${input.q.replace(/[%_]/g, '')}%`;
          const rows = await ctx.db
            .select()
            .from(foodItems)
            .where(or(ilike(foodItems.name, pattern), ilike(foodItems.description, pattern)))
            .limit(input.limit);
          for (const r of rows) {
            if (seenSlugs.has(r.slug)) continue;
            const images = [r.imageVariants?.large, r.imageVariants?.small, r.defaultImageUrl]
              .filter((u): u is string => !!u)
              .slice(0, 3);
            hits.push({
              id: r.id,
              slug: r.slug,
              name: r.name,
              originCountryIso2: r.originCountryIso2,
              description: r.description,
              imageVariants: r.imageVariants,
              images,
              source: 'local',
              barcode: r.barcode,
              openFoodFactsId: r.openFoodFactsId,
            });
            seenSlugs.add(r.slug);
            if (r.barcode) seenBarcodes.add(r.barcode);
          }
        } catch {
          /* DB offline */
        }
      }

      if (hits.length === 0) {
        const q = input.q.toLowerCase();
        for (const it of fallbackItems(
          (s) => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q),
        ).slice(0, input.limit)) {
          if (seenSlugs.has(it.slug)) continue;
          hits.push({
            id: it.id,
            slug: it.slug,
            name: it.name,
            originCountryIso2: it.originCountryIso2,
            description: it.description,
            images: [],
            source: 'local',
            barcode: null,
            openFoodFactsId: null,
          });
          seenSlugs.add(it.slug);
        }
      }

      if (input.includeRemote && hits.length < input.limit) {
        const remote = await searchOpenFoodFacts(input.q, {
          limit: input.limit - hits.length,
        }).catch(() => []);
        for (const r of remote) {
          if (r.barcode && seenBarcodes.has(r.barcode)) continue;
          hits.push({
            id: `off:${r.barcode ?? r.name}`,
            name: r.name,
            originCountryIso2: r.originCountryIso2 ?? 'EU',
            description: r.description ?? '',
            images: r.images.slice(0, 3),
            source: 'remote',
            barcode: r.barcode ?? null,
            openFoodFactsId: r.barcode ?? null,
          });
        }
      }

      return hits.slice(0, input.limit);
    }),

  /* -------------------------------------------------------------- *
   * UGC: propose new product / propose alternate image / upvote.    *
   * -------------------------------------------------------------- */

  proposeItem: protectedProcedure.input(proposeFoodItemInput).mutation(async ({ ctx, input }) => {
    const [created] = await ctx.db
      .insert(foodItemCandidates)
      .values({
        name: input.name,
        aka: input.aka ?? [],
        categorySlug: input.categorySlug,
        originCountryIso2: input.originCountryIso2,
        description: input.description,
        proposedImages: input.proposedImages ?? [],
        submittedById: ctx.user.id,
      })
      .returning();
    return created;
  }),

  proposeImage: protectedProcedure
    .input(proposeFoodItemImageInput)
    .mutation(async ({ ctx, input }) => {
      const item = await ctx.db.query.foodItems.findFirst({
        where: eq(foodItems.id, input.foodItemId),
      });
      if (!item) throw new TRPCError({ code: 'NOT_FOUND' });
      try {
        const [created] = await ctx.db
          .insert(foodItemImageProposals)
          .values({
            foodItemId: input.foodItemId,
            url: input.url,
            source: input.source,
            submittedById: ctx.user.id,
          })
          .returning();
        return created;
      } catch (e) {
        // Most likely cause is the unique (item, user, url) constraint
        // — surfaces as 409 to the client without leaking stack traces.
        throw new TRPCError({
          code: 'CONFLICT',
          message: e instanceof Error ? e.message : 'Image already proposed',
        });
      }
    }),

  upvoteImage: protectedProcedure
    .input(upvoteFoodItemImageInput)
    .mutation(async ({ ctx, input }) => {
      const proposal = await ctx.db.query.foodItemImageProposals.findFirst({
        where: eq(foodItemImageProposals.id, input.proposalId),
      });
      if (!proposal) throw new TRPCError({ code: 'NOT_FOUND' });
      try {
        await ctx.db.insert(foodItemImageVotes).values({
          proposalId: input.proposalId,
          userId: ctx.user.id,
        });
      } catch {
        // Already voted — idempotent return.
        return { ok: true, alreadyVoted: true as const, votes: proposal.votes };
      }
      const [updated] = await ctx.db
        .update(foodItemImageProposals)
        .set({ votes: sql`${foodItemImageProposals.votes} + 1` })
        .where(eq(foodItemImageProposals.id, input.proposalId))
        .returning();
      return {
        ok: true,
        alreadyVoted: false as const,
        votes: updated?.votes ?? proposal.votes + 1,
      };
    }),

  imagesForItem: publicProcedure
    .input(
      z.object({
        foodItemId: z.string().uuid(),
        limit: z.number().int().min(1).max(20).default(6),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        return await ctx.db
          .select()
          .from(foodItemImageProposals)
          .where(
            and(
              eq(foodItemImageProposals.foodItemId, input.foodItemId),
              eq(foodItemImageProposals.status, 'approved'),
            ),
          )
          .orderBy(desc(foodItemImageProposals.votes))
          .limit(input.limit);
      } catch {
        return [];
      }
    }),

  /* -------------------------------------------------------------- *
   * Admin: UGC moderation queues + review actions.                 *
   * -------------------------------------------------------------- */

  adminCatalogUgcQueue: adminProcedure
    .input(adminCatalogUgcQueueInput)
    .query(async ({ ctx, input }) => {
      const candidates = await ctx.db
        .select()
        .from(foodItemCandidates)
        .where(eq(foodItemCandidates.status, 'pending'))
        .orderBy(asc(foodItemCandidates.createdAt))
        .limit(input.candidateLimit);

      const imageProposals = await ctx.db
        .select({
          proposal: foodItemImageProposals,
          itemName: foodItems.name,
          itemSlug: foodItems.slug,
        })
        .from(foodItemImageProposals)
        .innerJoin(foodItems, eq(foodItemImageProposals.foodItemId, foodItems.id))
        .where(eq(foodItemImageProposals.status, 'pending'))
        .orderBy(desc(foodItemImageProposals.votes), asc(foodItemImageProposals.createdAt))
        .limit(input.imageProposalLimit);

      return { candidates, imageProposals };
    }),

  adminReviewFoodItemCandidate: adminProcedure
    .input(adminReviewFoodItemCandidateInput)
    .mutation(async ({ ctx, input }) => {
      const candidate = await ctx.db.query.foodItemCandidates.findFirst({
        where: eq(foodItemCandidates.id, input.id),
      });
      if (!candidate) throw new TRPCError({ code: 'NOT_FOUND' });
      if (candidate.status !== 'pending') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Candidate is not pending' });
      }

      const now = new Date();
      const modPatch = {
        status: input.status,
        moderatorId: ctx.user.id,
        moderatorNote: input.moderatorNote ?? null,
        updatedAt: now,
        mergedIntoItemId: null as string | null,
      };

      if (input.status === 'duplicate') {
        const merged = await ctx.db.query.foodItems.findFirst({
          where: eq(foodItems.id, input.mergedIntoItemId!),
        });
        if (!merged)
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'mergedIntoItemId not found' });
        modPatch.mergedIntoItemId = merged.id;
        await ctx.db
          .update(foodItemCandidates)
          .set(modPatch)
          .where(eq(foodItemCandidates.id, input.id));
        return { ok: true as const, action: 'duplicate' as const, mergedIntoItemId: merged.id };
      }

      if (input.status === 'rejected') {
        await ctx.db
          .update(foodItemCandidates)
          .set(modPatch)
          .where(eq(foodItemCandidates.id, input.id));
        return { ok: true as const, action: 'rejected' as const };
      }

      const country = await ctx.db.query.countries.findFirst({
        where: eq(countries.iso2, candidate.originCountryIso2.toUpperCase()),
      });
      if (!country) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Unknown country ISO2: ${candidate.originCountryIso2}`,
        });
      }

      const cat = await ctx.db.query.categories.findFirst({
        where: eq(categories.slug, candidate.categorySlug),
      });
      if (!cat) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Unknown category slug: ${candidate.categorySlug}`,
        });
      }

      const firstImg = candidate.proposedImages[0];
      const defaultImageUrl = firstImg?.url ?? null;
      const variantSource = imageVariantSourceFromProposedTag(firstImg?.source);
      const imageVariants = defaultImageUrl
        ? ({ large: defaultImageUrl, source: variantSource } as const)
        : ({} as { large?: string; source?: CatalogImageVariantSource });

      const created = await ctx.db.transaction(async (tx) => {
        const slug = await uniqueFoodItemSlug(tx, candidate.name);
        const [row] = await tx
          .insert(foodItems)
          .values({
            slug,
            name: candidate.name,
            aka: candidate.aka,
            originCountryIso2: country.iso2,
            categoryId: cat.id,
            description: candidate.description?.trim() || 'No description provided.',
            defaultImageUrl: defaultImageUrl ?? undefined,
            imageVariants,
            verifiedAt: now,
            submittedById: candidate.submittedById,
          })
          .returning();
        if (!row) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Insert failed' });

        await tx
          .update(foodItemCandidates)
          .set({
            status: 'approved',
            moderatorId: ctx.user.id,
            moderatorNote: input.moderatorNote ?? null,
            updatedAt: now,
            mergedIntoItemId: null,
          })
          .where(eq(foodItemCandidates.id, input.id));
        return row;
      });

      await ctx.enqueueEvent({ name: 'catalog.reindex', data: {} });

      return {
        ok: true as const,
        action: 'approved' as const,
        foodItemId: created.id,
        slug: created.slug,
      };
    }),

  adminReviewFoodItemImageProposal: adminProcedure
    .input(adminReviewFoodItemImageProposalInput)
    .mutation(async ({ ctx, input }) => {
      const proposal = await ctx.db.query.foodItemImageProposals.findFirst({
        where: eq(foodItemImageProposals.id, input.id),
      });
      if (!proposal) throw new TRPCError({ code: 'NOT_FOUND' });
      if (proposal.status !== 'pending') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Proposal is not pending' });
      }

      if (input.status === 'rejected') {
        await ctx.db
          .update(foodItemImageProposals)
          .set({
            status: 'rejected',
            moderatorId: ctx.user.id,
            moderatorNote: input.moderatorNote ?? null,
          })
          .where(eq(foodItemImageProposals.id, input.id));
        return { ok: true as const, action: 'rejected' as const };
      }

      const item = await ctx.db.query.foodItems.findFirst({
        where: eq(foodItems.id, proposal.foodItemId),
      });
      if (!item) throw new TRPCError({ code: 'NOT_FOUND', message: 'Food item missing' });

      const variantSource = imageVariantSourceFromProposalSource(proposal.source);

      const patch: Partial<typeof foodItems.$inferInsert> = {};
      if (!item.defaultImageUrl) {
        patch.defaultImageUrl = proposal.url;
        patch.imageVariants = { large: proposal.url, source: variantSource };
        patch.updatedAt = new Date();
      }

      if (Object.keys(patch).length > 0) {
        await ctx.db.update(foodItems).set(patch).where(eq(foodItems.id, item.id));
      }

      await ctx.db
        .update(foodItemImageProposals)
        .set({
          status: 'approved',
          moderatorId: ctx.user.id,
          moderatorNote: input.moderatorNote ?? null,
        })
        .where(eq(foodItemImageProposals.id, input.id));

      if (Object.keys(patch).length > 0) {
        await ctx.enqueueEvent({ name: 'catalog.reindex', data: {} });
      }

      return { ok: true as const, action: 'approved' as const };
    }),
});
