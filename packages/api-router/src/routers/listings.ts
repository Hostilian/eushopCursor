import {
  encode,
  neighborsWithinRadius,
  publicCell,
  publicPoint,
  PRECISION_INDEX,
  roughCatalogCountryIso2FromLatLng,
} from '@eushop/geo';
import {
  createListingInput,
  listingByCountryFeedInput,
  listingByPublicIdInput,
  listingFeedLimitInput,
  listingSearchInput,
  updateListingInput,
  uuidIdParam,
} from '@eushop/validators';
import { TRPCError } from '@trpc/server';
import { and, asc, desc, eq, inArray, sql } from 'drizzle-orm';
import { brands, categories, foodItems, listings } from '@eushop/db';
import { protectedProcedure, publicProcedure, router } from '../trpc';

function publicListing<T extends { id: string; cellGeohash: string; location?: unknown }>(row: T) {
  const { location: _omit, ...rest } = row as unknown as Record<string, unknown> & {
    cellGeohash: string;
    id: string;
  };
  const point = publicPoint(rest.cellGeohash, rest.id);
  return { ...rest, point } as Omit<T, 'location'> & { point: { lat: number; lng: number } };
}

export const listingsRouter = router({
  near: publicProcedure.input(listingSearchInput).query(async ({ ctx, input }) => {
    const conditions = [eq(listings.status, 'live' as const)];

    if (input.countryIso2) conditions.push(eq(listings.countryIso2, input.countryIso2));

    if (input.near) {
      const cells = neighborsWithinRadius(input.near, input.radiusKm);
      conditions.push(inArray(listings.cellGeohash, cells));
    }

    if (input.q) {
      const pattern = `%${input.q.replace(/[%_]/g, '')}%`;
      conditions.push(
        sql`(${listings.freeformName} ILIKE ${pattern} OR ${listings.notes} ILIKE ${pattern})`,
      );
    }

    if (input.freshness) {
      conditions.push(eq(listings.freshness, input.freshness));
    }

    if (input.hasPhoto === true) {
      conditions.push(sql`coalesce(jsonb_array_length(${listings.photos}), 0) > 0`);
    }

    if (input.categorySlug) {
      const cat = await ctx.db.query.categories.findFirst({
        where: eq(categories.slug, input.categorySlug),
      });
      if (cat) {
        conditions.push(
          sql`${listings.foodItemId} IN (SELECT id FROM food_items WHERE category_id = ${cat.id})`,
        );
      }
    }

    if (input.brandSlug) {
      const b = await ctx.db.query.brands.findFirst({ where: eq(brands.slug, input.brandSlug) });
      if (b) {
        conditions.push(
          sql`${listings.foodItemId} IN (SELECT id FROM food_items WHERE brand_id = ${b.id})`,
        );
      }
    }

    try {
      const rows = await ctx.db
        .select()
        .from(listings)
        .where(and(...conditions))
        .orderBy(desc(listings.createdAt))
        .limit(input.limit);
      return rows.filter((r) => r.status === 'live').map(publicListing);
    } catch (e) {
      // DB unreachable in development. Real users see no synthetic listings —
      // the surfaces are responsible for showing inviting empty states. We
      // still log so the operator can see why the fallback kicked in.
      console.error('[listings.feed] DB read failed; returning empty list', e);
      return [];
    }
  }),

  byId: publicProcedure.input(listingByPublicIdInput).query(async ({ ctx, input }) => {
    const row = await ctx.db.query.listings.findFirst({
      where: and(eq(listings.id, input.id), eq(listings.status, 'live' as const)),
    });
    if (!row || row.status !== 'live') throw new TRPCError({ code: 'NOT_FOUND' });
    let item = null;
    if (row.foodItemId) {
      item = await ctx.db.query.foodItems.findFirst({
        where: eq(foodItems.id, row.foodItemId),
      });
    }
    return { ...publicListing(row), item };
  }),

  mine: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select()
      .from(listings)
      .where(eq(listings.sellerId, ctx.user.id))
      .orderBy(desc(listings.createdAt));
  }),

  create: protectedProcedure.input(createListingInput).mutation(async ({ ctx, input }) => {
    const indexHash = encode(input.location, PRECISION_INDEX);
    const cell = publicCell(indexHash);
    const country = (await inferCountryFromLatLng(input.location)) ?? 'EU';

    const [created] = await ctx.db
      .insert(listings)
      .values({
        sellerId: ctx.user.id,
        foodItemId: input.foodItemId,
        freeformName: input.freeformName,
        brandName: input.brandName,
        notes: input.notes,
        qty: input.qty,
        unit: input.unit,
        finderFee: String(input.finderFee),
        currency: input.currency,
        freshness: input.freshness,
        photos: input.photos,
        location: input.location,
        indexGeohash: indexHash,
        cellGeohash: cell,
        approximateCity: input.approximateCity,
        countryIso2: country,
        expiresAt: input.expiresAt,
      })
      .returning();
    if (!created) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Insert failed' });
    void ctx.enqueueEvent({
      name: 'listing.created',
      data: { listingId: created.id, sellerId: created.sellerId },
    });
    return publicListing(created);
  }),

  update: protectedProcedure.input(updateListingInput).mutation(async ({ ctx, input }) => {
    const existing = await ctx.db.query.listings.findFirst({ where: eq(listings.id, input.id) });
    if (!existing) throw new TRPCError({ code: 'NOT_FOUND' });
    if (existing.sellerId !== ctx.user.id) throw new TRPCError({ code: 'FORBIDDEN' });

    const patch: Record<string, unknown> = { updatedAt: new Date() };
    if (input.qty !== undefined) patch.qty = input.qty;
    if (input.finderFee !== undefined) patch.finderFee = String(input.finderFee);
    if (input.notes !== undefined) patch.notes = input.notes;
    if (input.brandName !== undefined) patch.brandName = input.brandName;
    if (input.freshness !== undefined) patch.freshness = input.freshness;
    if (input.photos) patch.photos = input.photos;
    if (input.expiresAt) patch.expiresAt = input.expiresAt;
    if (input.location) {
      const indexHash = encode(input.location, PRECISION_INDEX);
      patch.location = input.location;
      patch.indexGeohash = indexHash;
      patch.cellGeohash = publicCell(indexHash);
      patch.countryIso2 = (await inferCountryFromLatLng(input.location)) ?? 'EU';
    }
    if (input.approximateCity !== undefined) patch.approximateCity = input.approximateCity;

    const [updated] = await ctx.db
      .update(listings)
      .set(patch)
      .where(eq(listings.id, input.id))
      .returning();
    if (!updated) throw new TRPCError({ code: 'NOT_FOUND' });
    return publicListing(updated);
  }),

  remove: protectedProcedure.input(uuidIdParam).mutation(async ({ ctx, input }) => {
    const existing = await ctx.db.query.listings.findFirst({ where: eq(listings.id, input.id) });
    if (!existing) throw new TRPCError({ code: 'NOT_FOUND' });
    if (existing.sellerId !== ctx.user.id) throw new TRPCError({ code: 'FORBIDDEN' });
    await ctx.db.update(listings).set({ status: 'removed' }).where(eq(listings.id, input.id));
    return { ok: true };
  }),

  recent: publicProcedure.input(listingFeedLimitInput).query(async ({ ctx, input }) => {
    const limit = input?.limit ?? 12;
    try {
      const rows = await ctx.db
        .select()
        .from(listings)
        .where(eq(listings.status, 'live'))
        .orderBy(desc(listings.createdAt))
        .limit(limit);
      return rows.filter((r) => r.status === 'live').map(publicListing);
    } catch (e) {
      console.error('[listings.recent] DB read failed', e);
      return [];
    }
  }),

  byCountry: publicProcedure.input(listingByCountryFeedInput).query(async ({ ctx, input }) => {
    try {
      const rows = await ctx.db
        .select()
        .from(listings)
        .where(and(eq(listings.status, 'live'), eq(listings.countryIso2, input.iso2)))
        .orderBy(asc(listings.createdAt))
        .limit(input.limit);
      return rows.filter((r) => r.status === 'live').map(publicListing);
    } catch (e) {
      console.error('[listings.byCountry] DB read failed', e);
      return [];
    }
  }),
});

async function inferCountryFromLatLng(p: { lat: number; lng: number }): Promise<string | null> {
  return roughCatalogCountryIso2FromLatLng(p);
}
