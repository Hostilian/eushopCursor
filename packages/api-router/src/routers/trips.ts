import {
  encode,
  neighborsWithinRadius,
  publicCell,
  publicPoint,
  PRECISION_INDEX,
} from '@eushop/geo';
import {
  cancelReservationInput,
  calculatePlatformFeeCents,
  completeReservationInput,
  confirmReservationInput,
  createTripOfferInput,
  reserveSlotInput,
  tripFeedNearInput,
  tripSearchInput,
  tripsRecentInput,
  uuidIdParam,
} from '@eushop/validators';
import { TRPCError } from '@trpc/server';
import { and, asc, desc, eq, gte, inArray, lte, sql } from 'drizzle-orm';
import { tripOffers, tripReservations } from '@eushop/db';
import { protectedProcedure, publicProcedure, router } from '../trpc';

/**
 * Trips router. Implements the create / search / reserve / confirm / complete
 * flow described in `0.2.0 — Trip marketplace pivot` (CHANGELOG).
 *
 * Notable behaviours:
 *   - `slotsAvailable` decrements *atomically* when a buyer reserves; we use a
 *     UPDATE … WHERE slots_available > 0 RETURNING to avoid a race.
 *   - Platform fee is computed on the server and frozen on the reservation row
 *     (see `validators.calculatePlatformFeeCents`).
 *   - Public listings expose only the cell-jittered coordinates, mirroring how
 *     `listings.near` redacts seller addresses.
 */

type TripOfferRow = typeof tripOffers.$inferSelect;

/** Strip precise geography; expose jittered public points plus all other trip fields. */
function publicTrip(row: TripOfferRow) {
  const { originLocation: _ol, destinationLocation: _dl, ...rest } = row;
  const originPoint = publicPoint(rest.cellGeohashOrigin, `${rest.id}-origin`);
  const destinationPoint = publicPoint(rest.cellGeohashDestination, `${rest.id}-destination`);
  return { ...rest, originPoint, destinationPoint };
}

export const tripsRouter = router({
  /** Search trips by route (country/city pair + optional date window). */
  byRoute: publicProcedure.input(tripSearchInput).query(async ({ ctx, input }) => {
    try {
      const conditions = [];
      if (input.onlyOpen) {
        conditions.push(eq(tripOffers.status, 'open' as const));
      }
      if (input.fromIso) conditions.push(eq(tripOffers.originCountryIso2, input.fromIso));
      if (input.toIso) conditions.push(eq(tripOffers.destinationCountryIso2, input.toIso));
      if (input.fromCity) {
        conditions.push(sql`${tripOffers.originCity} ILIKE ${`%${input.fromCity}%`}`);
      }
      if (input.toCity) {
        conditions.push(sql`${tripOffers.destinationCity} ILIKE ${`%${input.toCity}%`}`);
      }
      if (input.departFromMs)
        conditions.push(gte(tripOffers.departAt, new Date(input.departFromMs)));
      if (input.departToMs) conditions.push(lte(tripOffers.departAt, new Date(input.departToMs)));

      const rows = await ctx.db
        .select()
        .from(tripOffers)
        .where(and(...conditions))
        .orderBy(asc(tripOffers.departAt))
        .limit(input.limit);
      return rows.map(publicTrip);
    } catch {
      return [];
    }
  }),

  /** Trips with origin or destination near a coordinate. */
  feedNear: publicProcedure.input(tripFeedNearInput).query(async ({ ctx, input }) => {
    try {
      const cells = neighborsWithinRadius(input.near, input.radiusKm);
      const cellCol =
        input.side === 'origin' ? tripOffers.cellGeohashOrigin : tripOffers.cellGeohashDestination;
      const rows = await ctx.db
        .select()
        .from(tripOffers)
        .where(
          and(
            eq(tripOffers.status, 'open' as const),
            inArray(cellCol, cells),
            gte(tripOffers.departAt, new Date()),
          ),
        )
        .orderBy(asc(tripOffers.departAt))
        .limit(input.limit);
      return rows.map(publicTrip);
    } catch {
      return [];
    }
  }),

  byId: publicProcedure.input(uuidIdParam).query(async ({ ctx, input }) => {
    const trip = await ctx.db.query.tripOffers.findFirst({
      where: eq(tripOffers.id, input.id),
    });
    if (!trip) throw new TRPCError({ code: 'NOT_FOUND' });
    const reservations = await ctx.db
      .select({
        id: tripReservations.id,
        buyerId: tripReservations.buyerId,
        status: tripReservations.status,
        freeformText: tripReservations.freeformText,
        qty: tripReservations.qty,
        agreedFinderFee: tripReservations.agreedFinderFee,
        createdAt: tripReservations.createdAt,
      })
      .from(tripReservations)
      .where(eq(tripReservations.tripOfferId, trip.id))
      .orderBy(desc(tripReservations.createdAt));
    return { trip: publicTrip(trip), reservations };
  }),

  recent: publicProcedure.input(tripsRecentInput).query(async ({ ctx, input }) => {
    try {
      const rows = await ctx.db
        .select()
        .from(tripOffers)
        .where(and(eq(tripOffers.status, 'open'), gte(tripOffers.departAt, new Date())))
        .orderBy(asc(tripOffers.departAt))
        .limit(input?.limit ?? 12);
      return rows.map(publicTrip);
    } catch {
      return [];
    }
  }),

  mineAsSeller: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select()
      .from(tripOffers)
      .where(eq(tripOffers.sellerId, ctx.user.id))
      .orderBy(desc(tripOffers.createdAt));
  }),

  mineReservations: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select()
      .from(tripReservations)
      .where(eq(tripReservations.buyerId, ctx.user.id))
      .orderBy(desc(tripReservations.createdAt));
  }),

  create: protectedProcedure.input(createTripOfferInput).mutation(async ({ ctx, input }) => {
    const originIndex = encode(input.originLocation, PRECISION_INDEX);
    const destIndex = encode(input.destinationLocation, PRECISION_INDEX);
    const [created] = await ctx.db
      .insert(tripOffers)
      .values({
        sellerId: ctx.user.id,
        originCountryIso2: input.originCountryIso2,
        originCity: input.originCity,
        originLocation: input.originLocation,
        cellGeohashOrigin: publicCell(originIndex),
        destinationCountryIso2: input.destinationCountryIso2,
        destinationCity: input.destinationCity,
        destinationLocation: input.destinationLocation,
        cellGeohashDestination: publicCell(destIndex),
        departAt: input.departAt,
        returnAt: input.returnAt,
        slotsTotal: input.slotsTotal,
        slotsAvailable: input.slotsTotal,
        defaultPerSlotFee: String(input.defaultPerSlotFee),
        currency: input.currency,
        notes: input.notes,
        intendedItemIds: input.intendedItemIds ?? [],
      })
      .returning();
    if (!created) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
    void ctx.enqueueEvent({
      name: 'trip.offer.created',
      data: { tripOfferId: created.id, sellerId: created.sellerId },
    });
    return publicTrip(created);
  }),

  close: protectedProcedure.input(uuidIdParam).mutation(async ({ ctx, input }) => {
    const trip = await ctx.db.query.tripOffers.findFirst({ where: eq(tripOffers.id, input.id) });
    if (!trip) throw new TRPCError({ code: 'NOT_FOUND' });
    if (trip.sellerId !== ctx.user.id) throw new TRPCError({ code: 'FORBIDDEN' });
    await ctx.db.update(tripOffers).set({ status: 'closed' }).where(eq(tripOffers.id, input.id));
    return { ok: true };
  }),

  reserve: protectedProcedure.input(reserveSlotInput).mutation(async ({ ctx, input }) => {
    const trip = await ctx.db.query.tripOffers.findFirst({
      where: eq(tripOffers.id, input.tripOfferId),
    });
    if (!trip) throw new TRPCError({ code: 'NOT_FOUND' });
    if (trip.sellerId === ctx.user.id) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Sellers cannot reserve their own trip',
      });
    }
    if (trip.status !== 'open') {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'This trip is not accepting reservations',
      });
    }

    // Atomically decrement slots_available and bail if exhausted.
    const [updated] = await ctx.db
      .update(tripOffers)
      .set({ slotsAvailable: sql`${tripOffers.slotsAvailable} - 1`, updatedAt: new Date() })
      .where(and(eq(tripOffers.id, trip.id), sql`${tripOffers.slotsAvailable} > 0`))
      .returning({ slotsAvailable: tripOffers.slotsAvailable });
    if (!updated) {
      throw new TRPCError({ code: 'BAD_REQUEST', message: 'No slots remaining' });
    }

    const finderFeeCents = Math.round(input.agreedFinderFee * 100);
    const platformFeeCents = calculatePlatformFeeCents(finderFeeCents);

    try {
      const [created] = await ctx.db
        .insert(tripReservations)
        .values({
          tripOfferId: trip.id,
          buyerId: ctx.user.id,
          foodItemId: input.foodItemId,
          freeformText: input.freeformText,
          qty: input.qty,
          agreedFinderFee: (finderFeeCents / 100).toFixed(2),
          platformFee: (platformFeeCents / 100).toFixed(2),
          currency: trip.currency,
        })
        .returning();
      if (created) {
        void ctx.enqueueEvent({
          name: 'trip.reservation.created',
          data: {
            reservationId: created.id,
            tripOfferId: trip.id,
            buyerId: ctx.user.id,
          },
        });
      }
      return created;
    } catch (e) {
      // Restore the slot on insert failure (e.g. duplicate active reservation).
      await ctx.db
        .update(tripOffers)
        .set({ slotsAvailable: sql`${tripOffers.slotsAvailable} + 1`, updatedAt: new Date() })
        .where(eq(tripOffers.id, trip.id));
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: e instanceof Error ? e.message : 'Could not create reservation',
      });
    }
  }),

  confirmReservation: protectedProcedure
    .input(confirmReservationInput)
    .mutation(async ({ ctx, input }) => {
      const reservation = await ctx.db.query.tripReservations.findFirst({
        where: eq(tripReservations.id, input.reservationId),
      });
      if (!reservation) throw new TRPCError({ code: 'NOT_FOUND' });
      const trip = await ctx.db.query.tripOffers.findFirst({
        where: eq(tripOffers.id, reservation.tripOfferId),
      });
      if (!trip || trip.sellerId !== ctx.user.id) throw new TRPCError({ code: 'FORBIDDEN' });
      if (reservation.status !== 'pending') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Reservation is already ${reservation.status}`,
        });
      }
      const [updated] = await ctx.db
        .update(tripReservations)
        .set({ status: 'confirmed', confirmedAt: new Date(), updatedAt: new Date() })
        .where(eq(tripReservations.id, input.reservationId))
        .returning();
      return updated;
    }),

  rejectReservation: protectedProcedure
    .input(cancelReservationInput)
    .mutation(async ({ ctx, input }) => {
      const reservation = await ctx.db.query.tripReservations.findFirst({
        where: eq(tripReservations.id, input.reservationId),
      });
      if (!reservation) throw new TRPCError({ code: 'NOT_FOUND' });
      const trip = await ctx.db.query.tripOffers.findFirst({
        where: eq(tripOffers.id, reservation.tripOfferId),
      });
      if (!trip || trip.sellerId !== ctx.user.id) throw new TRPCError({ code: 'FORBIDDEN' });
      if (reservation.status !== 'pending') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Already decided' });
      }
      await ctx.db
        .update(tripReservations)
        .set({
          status: 'seller-rejected',
          cancelledAt: new Date(),
          cancellationReason: input.reason,
          updatedAt: new Date(),
        })
        .where(eq(tripReservations.id, input.reservationId));
      // Restore the slot.
      await ctx.db
        .update(tripOffers)
        .set({ slotsAvailable: sql`${tripOffers.slotsAvailable} + 1`, updatedAt: new Date() })
        .where(eq(tripOffers.id, trip.id));
      return { ok: true };
    }),

  completeReservation: protectedProcedure
    .input(completeReservationInput)
    .mutation(async ({ ctx, input }) => {
      const reservation = await ctx.db.query.tripReservations.findFirst({
        where: eq(tripReservations.id, input.reservationId),
      });
      if (!reservation) throw new TRPCError({ code: 'NOT_FOUND' });
      const trip = await ctx.db.query.tripOffers.findFirst({
        where: eq(tripOffers.id, reservation.tripOfferId),
      });
      if (!trip) throw new TRPCError({ code: 'NOT_FOUND' });
      // Either seller or buyer can mark the handoff complete after departure.
      const isParty = reservation.buyerId === ctx.user.id || trip.sellerId === ctx.user.id;
      if (!isParty) throw new TRPCError({ code: 'FORBIDDEN' });
      if (reservation.status !== 'confirmed') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Only confirmed reservations can complete',
        });
      }
      const [updated] = await ctx.db
        .update(tripReservations)
        .set({ status: 'completed', completedAt: new Date(), updatedAt: new Date() })
        .where(eq(tripReservations.id, input.reservationId))
        .returning();
      return updated;
    }),

  cancelReservation: protectedProcedure
    .input(cancelReservationInput)
    .mutation(async ({ ctx, input }) => {
      const reservation = await ctx.db.query.tripReservations.findFirst({
        where: eq(tripReservations.id, input.reservationId),
      });
      if (!reservation) throw new TRPCError({ code: 'NOT_FOUND' });
      if (reservation.buyerId !== ctx.user.id) throw new TRPCError({ code: 'FORBIDDEN' });
      if (reservation.status !== 'pending' && reservation.status !== 'confirmed') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cannot cancel from this state' });
      }
      await ctx.db
        .update(tripReservations)
        .set({
          status: 'cancelled',
          cancelledAt: new Date(),
          cancellationReason: input.reason,
          updatedAt: new Date(),
        })
        .where(eq(tripReservations.id, input.reservationId));
      await ctx.db
        .update(tripOffers)
        .set({ slotsAvailable: sql`${tripOffers.slotsAvailable} + 1`, updatedAt: new Date() })
        .where(eq(tripOffers.id, reservation.tripOfferId));
      return { ok: true };
    }),
});
