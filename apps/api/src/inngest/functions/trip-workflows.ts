import {
  db,
  notifications,
  requests as openRequests,
  tripOffers,
  tripReservations,
} from '@eushop/db';
import { and, eq, gte, lte, sql } from 'drizzle-orm';
import { inngest } from '../client.js';

/**
 * When a buyer reserves a slot on a trip, ping the seller and warm-cache the
 * matcher (so other open requests for the same item see the new commitment).
 */
export const notifyReservationCreated = inngest.createFunction(
  { id: 'notify-reservation-created' },
  { event: 'trip.reservation.created' },
  async ({ event, step }) => {
    const reservation = await step.run('load', async () =>
      db.query.tripReservations.findFirst({
        where: eq(tripReservations.id, event.data.reservationId),
      }),
    );
    if (!reservation) return { skipped: true };
    const trip = await step.run('load-trip', async () =>
      db.query.tripOffers.findFirst({ where: eq(tripOffers.id, event.data.tripOfferId) }),
    );
    if (!trip) return { skipped: true };
    await step.run('notify-seller', async () => {
      await db.insert(notifications).values({
        userId: trip.sellerId,
        kind: 'trip-reservation',
        title: 'New reservation on your trip',
        body: `${reservation.qty}× ${reservation.freeformText} — agreed €${reservation.agreedFinderFee}.`,
        data: { reservationId: reservation.id, tripOfferId: trip.id },
      });
    });
    return { ok: true };
  },
);

/**
 * Cron: 48h before each `depart_at`, ping every confirmed reservation holder.
 */
export const notifyTripDepartureSoon = inngest.createFunction(
  { id: 'notify-trip-departure-soon' },
  { cron: '15 * * * *' },
  async ({ step }) => {
    const now = new Date();
    const upper = new Date(now.getTime() + 49 * 60 * 60 * 1000);
    const lower = new Date(now.getTime() + 47 * 60 * 60 * 1000);

    const trips = await step.run('find-trips', async () =>
      db
        .select()
        .from(tripOffers)
        .where(
          and(
            eq(tripOffers.status, 'open'),
            gte(tripOffers.departAt, lower),
            lte(tripOffers.departAt, upper),
          ),
        ),
    );

    for (const trip of trips) {
      await step.sendEvent(`imminent-${trip.id}`, {
        name: 'trip.departure.imminent',
        data: { tripOfferId: trip.id },
      });
    }
    return { tripsScheduled: trips.length };
  },
);

export const notifyTripDepartureFanout = inngest.createFunction(
  { id: 'notify-trip-departure-fanout' },
  { event: 'trip.departure.imminent' },
  async ({ event, step }) => {
    const reservations = await step.run('load-reservations', async () =>
      db
        .select()
        .from(tripReservations)
        .where(
          and(
            eq(tripReservations.tripOfferId, event.data.tripOfferId),
            sql`status IN ('confirmed','pending')`,
          ),
        ),
    );
    await step.run('notify', async () => {
      for (const r of reservations) {
        await db.insert(notifications).values({
          userId: r.buyerId,
          kind: 'trip-departure-soon',
          title: 'Your trip leaves in 48 hours',
          body: 'Confirm pickup logistics with the traveller in chat.',
          data: { reservationId: r.id, tripOfferId: r.tripOfferId },
        });
      }
    });
    return { notified: reservations.length };
  },
);

/**
 * Cron: trips whose `depart_at` is in the past and `status = open` get
 * auto-closed. Without this, stale offers clutter search.
 */
export const autoCloseStaleTrips = inngest.createFunction(
  { id: 'auto-close-stale-trips' },
  { cron: '0 4 * * *' },
  async ({ step }) => {
    const result = await step.run('close', async () => {
      const rows = await db
        .update(tripOffers)
        .set({ status: 'completed', updatedAt: new Date() })
        .where(and(eq(tripOffers.status, 'open'), lte(tripOffers.departAt, new Date())))
        .returning({ id: tripOffers.id });
      return rows.length;
    });
    return { closed: result };
  },
);

void openRequests; // reserved for the upcoming match-request-to-trip job
