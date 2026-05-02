import {
  decode,
  encode,
  neighborsWithinRadius,
  publicCell,
  PRECISION_INDEX,
  roughCatalogCountryIso2FromLatLng,
} from '@eushop/geo';
import { createRequestInput } from '@eushop/validators';
import { TRPCError } from '@trpc/server';
import { and, desc, eq, inArray } from 'drizzle-orm';
import { z } from 'zod';
import { foodItems, listings, requests } from '@eushop/db';
import { protectedProcedure, publicProcedure, router } from '../trpc';

export const requestsRouter = router({
  feed: publicProcedure
    .input(
      z.object({
        countryIso2: z.string().length(2).optional(),
        limit: z.number().int().min(1).max(40).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        const where = and(
          eq(requests.status, 'open' as const),
          input.countryIso2 ? eq(requests.countryIso2, input.countryIso2.toUpperCase()) : undefined,
        );
        return await ctx.db
          .select()
          .from(requests)
          .where(where)
          .orderBy(desc(requests.createdAt))
          .limit(input.limit);
      } catch {
        return [];
      }
    }),

  near: publicProcedure
    .input(
      z.object({
        lat: z.number(),
        lng: z.number(),
        radiusKm: z.number().min(1).max(500).default(50),
        limit: z.number().int().min(1).max(40).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        const cells = neighborsWithinRadius({ lat: input.lat, lng: input.lng }, input.radiusKm);
        return await ctx.db
          .select()
          .from(requests)
          .where(and(eq(requests.status, 'open'), inArray(requests.cellGeohash, cells)))
          .orderBy(desc(requests.createdAt))
          .limit(input.limit);
      } catch {
        return [];
      }
    }),

  byId: publicProcedure.input(z.object({ id: z.string().min(1) })).query(async ({ ctx, input }) => {
    const r = await ctx.db.query.requests.findFirst({ where: eq(requests.id, input.id) });
    if (!r) throw new TRPCError({ code: 'NOT_FOUND' });
    let item = null;
    if (r.foodItemId) {
      item = await ctx.db.query.foodItems.findFirst({
        where: eq(foodItems.id, r.foodItemId),
      });
    }
    return { ...r, item };
  }),

  mine: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select()
      .from(requests)
      .where(eq(requests.buyerId, ctx.user.id))
      .orderBy(desc(requests.createdAt));
  }),

  create: protectedProcedure.input(createRequestInput).mutation(async ({ ctx, input }) => {
    const indexHash = encode(input.location, PRECISION_INDEX);
    const cell = publicCell(indexHash);
    const country = roughCatalogCountryIso2FromLatLng(input.location) ?? 'EU';
    const [created] = await ctx.db
      .insert(requests)
      .values({
        buyerId: ctx.user.id,
        foodItemId: input.foodItemId,
        freeformText: input.freeformText,
        notes: input.notes,
        maxFinderFee: input.maxFinderFee?.toString(),
        currency: input.currency,
        location: input.location,
        cellGeohash: cell,
        approximateCity: input.approximateCity,
        countryIso2: country,
        radiusKm: input.radiusKm,
        notifyOnMatch: input.notifyOnMatch,
        expiresAt: input.expiresAt,
      })
      .returning();
    if (created) {
      void ctx.enqueueEvent({
        name: 'request.created',
        data: { requestId: created.id, buyerId: created.buyerId },
      });
    }
    return created;
  }),

  close: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.requests.findFirst({ where: eq(requests.id, input.id) });
      if (!existing) throw new TRPCError({ code: 'NOT_FOUND' });
      if (existing.buyerId !== ctx.user.id) throw new TRPCError({ code: 'FORBIDDEN' });
      await ctx.db.update(requests).set({ status: 'closed' }).where(eq(requests.id, input.id));
      return { ok: true };
    }),

  matchesFor: protectedProcedure
    .input(z.object({ requestId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const req = await ctx.db.query.requests.findFirst({
        where: eq(requests.id, input.requestId),
      });
      if (!req) throw new TRPCError({ code: 'NOT_FOUND' });
      const anchor = decode(req.cellGeohash);
      const cells = neighborsWithinRadius(anchor, req.radiusKm);
      const conditions = [eq(listings.status, 'live'), inArray(listings.cellGeohash, cells)];
      if (req.foodItemId) {
        conditions.push(eq(listings.foodItemId, req.foodItemId));
      }
      return ctx.db
        .select()
        .from(listings)
        .where(and(...conditions))
        .limit(20);
    }),
});
