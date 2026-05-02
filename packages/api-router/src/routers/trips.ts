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
  refundReservationInput,
  reserveSlotInput,
  tripFeedNearInput,
  tripSearchInput,
  tripsRecentInput,
  uuidIdParam,
} from '@eushop/validators';
import { TRPCError } from '@trpc/server';
import { and, asc, desc, eq, gte, inArray, lte, sql } from 'drizzle-orm';
import {
  connectAccounts,
  financialEvents,
  payouts,
  reservationPayments,
  tripOffers,
  tripReservations,
} from '@eushop/db';
import {
  StripeNotConfiguredError,
  cancelPaymentIntent,
  capturePaymentIntent,
  createPaymentIntent,
  createRefund,
} from '../lib/stripe';
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

    const isSeller = ctx.user?.id === trip.sellerId;
    if (isSeller) {
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
      return {
        trip: publicTrip(trip),
        viewerIsSeller: true as const,
        reservations,
      };
    }

    // For everyone else expose only aggregate counts so trip URLs do not leak
    // who reserved what.
    const counts = await ctx.db
      .select({ status: tripReservations.status, count: sql<number>`count(*)::int` })
      .from(tripReservations)
      .where(eq(tripReservations.tripOfferId, trip.id))
      .groupBy(tripReservations.status);
    const summary = {
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
    };
    for (const row of counts) {
      const k = row.status as keyof typeof summary;
      if (k in summary) summary[k] = row.count;
    }

    // Buyers may see *their own* row(s) on this trip if they are signed in.
    const ownReservations = ctx.user
      ? await ctx.db
          .select({
            id: tripReservations.id,
            status: tripReservations.status,
            freeformText: tripReservations.freeformText,
            qty: tripReservations.qty,
            agreedFinderFee: tripReservations.agreedFinderFee,
            createdAt: tripReservations.createdAt,
          })
          .from(tripReservations)
          .where(
            and(
              eq(tripReservations.tripOfferId, trip.id),
              eq(tripReservations.buyerId, ctx.user.id),
            ),
          )
          .orderBy(desc(tripReservations.createdAt))
      : [];

    return {
      trip: publicTrip(trip),
      viewerIsSeller: false as const,
      reservationSummary: summary,
      ownReservations,
    };
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
        spareWeightKg: input.spareWeightKg ?? null,
        spareVolumeLiters: input.spareVolumeLiters ?? null,
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
    if (trip.departAt.getTime() < Date.now()) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'This trip has already departed',
      });
    }

    // Enforce floor: buyer's offer must meet the seller's per-slot fee.
    const defaultFeeNumber = Number(trip.defaultPerSlotFee);
    if (Number.isFinite(defaultFeeNumber) && input.agreedFinderFee + 1e-6 < defaultFeeNumber) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: `Minimum finder fee for this trip is ${trip.currency} ${defaultFeeNumber.toFixed(2)}`,
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

    let created;
    try {
      const [row] = await ctx.db
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
      created = row;
    } catch (e) {
      await ctx.db
        .update(tripOffers)
        .set({ slotsAvailable: sql`${tripOffers.slotsAvailable} + 1`, updatedAt: new Date() })
        .where(eq(tripOffers.id, trip.id));
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: e instanceof Error ? e.message : 'Could not create reservation',
      });
    }
    if (!created) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });

    // If Stripe is wired and the seller has a connected account with charges
    // enabled, mint a manual-capture PaymentIntent now. The slot is reserved
    // either way; payments are best-effort here so a Stripe outage cannot
    // block buyers from booking on a marketplace built around timely flights.
    let clientSecret: string | null = null;
    if (process.env.STRIPE_SECRET_KEY) {
      try {
        const [sellerConnect] = await ctx.db
          .select()
          .from(connectAccounts)
          .where(eq(connectAccounts.userId, trip.sellerId))
          .limit(1);
        if (sellerConnect?.chargesEnabled) {
          const totalCents = finderFeeCents + platformFeeCents;
          const pi = await createPaymentIntent({
            amountCents: totalCents,
            applicationFeeCents: platformFeeCents,
            currency: trip.currency,
            destinationAccountId: sellerConnect.stripeAccountId,
            description: `Eushop reservation ${created.id}`,
            metadata: {
              reservationId: created.id,
              tripOfferId: trip.id,
              buyerId: ctx.user.id,
              sellerId: trip.sellerId,
            },
          });
          clientSecret = pi.client_secret ?? null;
          await ctx.db.insert(reservationPayments).values({
            reservationId: created.id,
            sellerUserId: trip.sellerId,
            buyerUserId: ctx.user.id,
            sellerStripeAccountId: sellerConnect.stripeAccountId,
            stripePaymentIntentId: pi.id,
            amountTotalCents: String(totalCents),
            amountPlatformFeeCents: String(platformFeeCents),
            amountSellerCents: String(finderFeeCents),
            currency: trip.currency,
            status: pi.status,
          });
          await ctx.db.insert(financialEvents).values({
            kind: 'payment_intent.created',
            stripeObjectId: pi.id,
            reservationId: created.id,
            tripOfferId: trip.id,
            sellerUserId: trip.sellerId,
            buyerUserId: ctx.user.id,
            amountCents: String(totalCents),
            currency: trip.currency,
            payload: { applicationFeeCents: platformFeeCents },
          });
        }
      } catch (e) {
        if (!(e instanceof StripeNotConfiguredError)) {
          console.error('[trips.reserve] PI creation failed; reservation kept', e);
        }
      }
    }

    void ctx.enqueueEvent({
      name: 'trip.reservation.created',
      data: {
        reservationId: created.id,
        tripOfferId: trip.id,
        buyerId: ctx.user.id,
      },
    });
    return { ...created, paymentClientSecret: clientSecret };
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

      // Capture the PaymentIntent (if any) so the buyer's card actually gets
      // charged once the seller commits. Capture failures are surfaced but
      // do not flip the reservation back to pending — the seller already said
      // yes; financial reconciliation is the job of the webhook.
      const [payment] = await ctx.db
        .select()
        .from(reservationPayments)
        .where(eq(reservationPayments.reservationId, input.reservationId))
        .limit(1);
      if (payment?.stripePaymentIntentId && process.env.STRIPE_SECRET_KEY) {
        try {
          const captured = await capturePaymentIntent(payment.stripePaymentIntentId);
          await ctx.db
            .update(reservationPayments)
            .set({
              status: captured.status,
              stripeChargeId: captured.latest_charge ?? null,
              capturedAt: new Date(),
              updatedAt: new Date(),
            })
            .where(eq(reservationPayments.id, payment.id));
          await ctx.db.insert(financialEvents).values({
            kind: 'charge.captured',
            stripeObjectId: payment.stripePaymentIntentId,
            reservationId: input.reservationId,
            tripOfferId: trip.id,
            sellerUserId: trip.sellerId,
            buyerUserId: reservation.buyerId,
            amountCents: payment.amountTotalCents,
            currency: payment.currency,
            payload: { paymentIntentStatus: captured.status },
          });
        } catch (e) {
          console.error('[trips.confirmReservation] capture failed', e);
        }
      }
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

      // Cancel the held PaymentIntent so the buyer's card is released.
      const [payment] = await ctx.db
        .select()
        .from(reservationPayments)
        .where(eq(reservationPayments.reservationId, input.reservationId))
        .limit(1);
      if (payment?.stripePaymentIntentId && process.env.STRIPE_SECRET_KEY) {
        try {
          const cancelled = await cancelPaymentIntent(payment.stripePaymentIntentId);
          await ctx.db
            .update(reservationPayments)
            .set({ status: cancelled.status, cancelledAt: new Date(), updatedAt: new Date() })
            .where(eq(reservationPayments.id, payment.id));
          await ctx.db.insert(financialEvents).values({
            kind: 'payment_intent.canceled',
            stripeObjectId: payment.stripePaymentIntentId,
            reservationId: input.reservationId,
            tripOfferId: trip.id,
            sellerUserId: trip.sellerId,
            buyerUserId: reservation.buyerId,
            amountCents: payment.amountTotalCents,
            currency: payment.currency,
            payload: { reason: input.reason ?? null },
          });
        } catch (e) {
          console.error('[trips.rejectReservation] cancel PI failed', e);
        }
      }
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

      // Roll up the payout row. We write one payout per reservation; the
      // settlement job (next milestone) will batch them per Stripe transfer.
      try {
        const grossCents = Math.round(Number(reservation.agreedFinderFee) * 100);
        const feeCents = Math.round(Number(reservation.platformFee) * 100);
        const netCents = grossCents - feeCents;
        await ctx.db.insert(payouts).values({
          sellerId: trip.sellerId,
          tripOfferId: trip.id,
          amountGross: (grossCents / 100).toFixed(2),
          amountFee: (feeCents / 100).toFixed(2),
          amountNet: (netCents / 100).toFixed(2),
          currency: reservation.currency,
          status: 'pending',
        });
      } catch (e) {
        console.error('[trips.completeReservation] payout write failed', e);
      }

      return updated;
    }),

  /**
   * Buyer- or admin-initiated refund. Calls Stripe Refund (with
   * `reverse_transfer = true` so the seller's connected balance is debited)
   * and writes a `financial_events` row. Reservation status moves to
   * `refunded`. Slot is *not* restored — the trip already happened.
   */
  refundReservation: protectedProcedure
    .input(refundReservationInput)
    .mutation(async ({ ctx, input }) => {
      const reservation = await ctx.db.query.tripReservations.findFirst({
        where: eq(tripReservations.id, input.reservationId),
      });
      if (!reservation) throw new TRPCError({ code: 'NOT_FOUND' });
      const trip = await ctx.db.query.tripOffers.findFirst({
        where: eq(tripOffers.id, reservation.tripOfferId),
      });
      if (!trip) throw new TRPCError({ code: 'NOT_FOUND' });
      const isAdmin = ctx.user.role === 'admin';
      const isParty = reservation.buyerId === ctx.user.id || trip.sellerId === ctx.user.id;
      if (!isAdmin && !isParty) throw new TRPCError({ code: 'FORBIDDEN' });
      if (reservation.status === 'refunded') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Already refunded' });
      }

      const [payment] = await ctx.db
        .select()
        .from(reservationPayments)
        .where(eq(reservationPayments.reservationId, input.reservationId))
        .limit(1);
      if (!payment?.stripePaymentIntentId || !process.env.STRIPE_SECRET_KEY) {
        // No Stripe wiring; flip status only so the books reflect intent.
        await ctx.db
          .update(tripReservations)
          .set({ status: 'refunded', updatedAt: new Date() })
          .where(eq(tripReservations.id, input.reservationId));
        return { ok: true as const, refundedExternally: false };
      }
      try {
        const refund = await createRefund({
          paymentIntentId: payment.stripePaymentIntentId,
          amountCents: input.amount ? Math.round(input.amount * 100) : undefined,
          reason: input.reason,
          reverseTransfer: true,
          refundApplicationFee: true,
        });
        await ctx.db
          .update(reservationPayments)
          .set({ status: 'refunded', refundedAt: new Date(), updatedAt: new Date() })
          .where(eq(reservationPayments.id, payment.id));
        await ctx.db
          .update(tripReservations)
          .set({ status: 'refunded', updatedAt: new Date() })
          .where(eq(tripReservations.id, input.reservationId));
        await ctx.db.insert(financialEvents).values({
          kind: 'charge.refunded',
          stripeObjectId: refund.id,
          reservationId: input.reservationId,
          tripOfferId: trip.id,
          sellerUserId: trip.sellerId,
          buyerUserId: reservation.buyerId,
          amountCents: String(refund.amount),
          currency: payment.currency,
          payload: { initiatedBy: isAdmin ? 'admin' : 'party' },
        });
        return { ok: true as const, refundedExternally: true, refundId: refund.id };
      } catch (e) {
        if (e instanceof StripeNotConfiguredError) {
          throw new TRPCError({
            code: 'PRECONDITION_FAILED',
            message: 'Stripe is not configured (STRIPE_SECRET_KEY).',
          });
        }
        throw e;
      }
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
      const trip = await ctx.db.query.tripOffers.findFirst({
        where: eq(tripOffers.id, reservation.tripOfferId),
      });
      if (trip && trip.departAt.getTime() < Date.now()) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Trip has already departed; contact the traveller via chat',
        });
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

      // Cancel the held PaymentIntent (or refund if already captured) so the
      // buyer's card is released the moment they back out.
      const [payment] = await ctx.db
        .select()
        .from(reservationPayments)
        .where(eq(reservationPayments.reservationId, input.reservationId))
        .limit(1);
      if (payment?.stripePaymentIntentId && process.env.STRIPE_SECRET_KEY) {
        try {
          if (payment.status === 'succeeded' || payment.capturedAt) {
            const refund = await createRefund({
              paymentIntentId: payment.stripePaymentIntentId,
              reason: 'requested_by_customer',
              reverseTransfer: true,
              refundApplicationFee: true,
            });
            await ctx.db
              .update(reservationPayments)
              .set({ status: 'refunded', refundedAt: new Date(), updatedAt: new Date() })
              .where(eq(reservationPayments.id, payment.id));
            await ctx.db.insert(financialEvents).values({
              kind: 'charge.refunded',
              stripeObjectId: refund.id,
              reservationId: input.reservationId,
              tripOfferId: reservation.tripOfferId,
              sellerUserId: trip?.sellerId ?? null,
              buyerUserId: reservation.buyerId,
              amountCents: String(refund.amount),
              currency: payment.currency,
              payload: { initiatedBy: 'buyer-cancel' },
            });
          } else {
            const cancelled = await cancelPaymentIntent(payment.stripePaymentIntentId);
            await ctx.db
              .update(reservationPayments)
              .set({ status: cancelled.status, cancelledAt: new Date(), updatedAt: new Date() })
              .where(eq(reservationPayments.id, payment.id));
            await ctx.db.insert(financialEvents).values({
              kind: 'payment_intent.canceled',
              stripeObjectId: payment.stripePaymentIntentId,
              reservationId: input.reservationId,
              tripOfferId: reservation.tripOfferId,
              sellerUserId: trip?.sellerId ?? null,
              buyerUserId: reservation.buyerId,
              amountCents: payment.amountTotalCents,
              currency: payment.currency,
              payload: { reason: input.reason ?? null, initiatedBy: 'buyer-cancel' },
            });
          }
        } catch (e) {
          console.error('[trips.cancelReservation] PI release failed', e);
        }
      }
      return { ok: true };
    }),
});
