import { db, notifications, requests, tripOffers, tripReservations } from '@eushop/db';
import { and, eq, gte, inArray, isNotNull, lte, ne, or, sql } from 'drizzle-orm';
import { inngest } from '../client.js';
import { escapeHtml, notifyExternalChannels } from '../notify.js';

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
    await step.run('notify-seller-external', async () => {
      const route = `${trip.originCity} → ${trip.destinationCity}`;
      await notifyExternalChannels({
        userId: trip.sellerId,
        emailSubject: `New reservation on your ${route} trip`,
        emailHtml: `<p>You have a new reservation on your trip <strong>${escapeHtml(route)}</strong>:</p><ul><li>${reservation.qty}× ${escapeHtml(reservation.freeformText)}</li><li>Agreed fee: €${reservation.agreedFinderFee}</li></ul><p><a href="https://eushop.eu/trips/${trip.id}">Open in Eushop</a></p>`,
        pushTitle: 'New reservation',
        pushBody: `${reservation.qty}× ${reservation.freeformText} — €${reservation.agreedFinderFee}`,
        pushData: { kind: 'trip-reservation', reservationId: reservation.id, tripOfferId: trip.id },
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
    await step.run('notify-external', async () => {
      for (const r of reservations) {
        await notifyExternalChannels({
          userId: r.buyerId,
          emailSubject: 'Your Eushop trip leaves soon',
          emailHtml: `<p>Your trip leaves in about 48 hours.</p><p>Confirm the handoff window and pickup spot with the traveller in chat.</p><p><a href="https://eushop.eu/reservations">Open my reservations</a></p>`,
          pushTitle: 'Trip leaves in 48h',
          pushBody: 'Coordinate the handoff with the traveller.',
          pushData: {
            kind: 'trip-departure-soon',
            reservationId: r.id,
            tripOfferId: r.tripOfferId,
          },
        });
      }
    });
    return { notified: reservations.length };
  },
);

/**
 * Cron: trips whose `depart_at` is in the past and `status = open` get
 * auto-**closed** (not "completed"). Reservation completion is a separate
 * concept that requires the seller (or buyer) to confirm a successful handoff;
 * using `closed` here keeps the time-out behaviour distinct from end-of-flow
 * completion so the admin can tell the two apart.
 */
export const autoCloseStaleTrips = inngest.createFunction(
  { id: 'auto-close-stale-trips' },
  { cron: '0 4 * * *' },
  async ({ step }) => {
    const result = await step.run('close', async () => {
      const rows = await db
        .update(tripOffers)
        .set({ status: 'closed', updatedAt: new Date() })
        .where(and(eq(tripOffers.status, 'open'), lte(tripOffers.departAt, new Date())))
        .returning({ id: tripOffers.id });
      return rows.length;
    });
    return { closed: result };
  },
);

/**
 * When a seller posts a trip, notify buyers whose open requests match the
 * trip's **origin** country (sourcing market) and either the declared
 * `intendedItemIds` or the catalog origin of their requested food item.
 */
export const matchRequestToTrip = inngest.createFunction(
  { id: 'match-request-to-trip' },
  { event: 'trip.offer.created' },
  async ({ event, step }) => {
    const trip = await step.run('load-trip', async () =>
      db.query.tripOffers.findFirst({ where: eq(tripOffers.id, event.data.tripOfferId) }),
    );
    if (!trip) return { skipped: true };

    const intended = (trip.intendedItemIds ?? []) as string[];

    const originItemMatch = sql`exists (
      select 1 from food_items fi
      where fi.id = ${requests.foodItemId}
      and fi.origin_country_iso2 = ${trip.originCountryIso2}
    )`;

    const rows = await step.run('find-requests', async () => {
      const itemClause =
        intended.length > 0
          ? or(inArray(requests.foodItemId, intended), originItemMatch)
          : originItemMatch;

      return db
        .select()
        .from(requests)
        .where(
          and(
            eq(requests.status, 'open'),
            eq(requests.notifyOnMatch, true),
            ne(requests.buyerId, trip.sellerId),
            isNotNull(requests.foodItemId),
            itemClause,
          ),
        )
        .limit(80);
    });

    if (!rows.length) return { matches: 0 };

    await step.run('notify-buyers', async () => {
      for (const r of rows) {
        await db.insert(notifications).values({
          userId: r.buyerId,
          kind: 'new-request-match',
          title: 'A trip matches your request',
          body: `Someone is flying ${trip.originCity} → ${trip.destinationCity} and may be able to bring what you asked for.`,
          data: { requestId: r.id, tripOfferId: trip.id },
        });
      }
    });
    await step.run('notify-buyers-external', async () => {
      const route = `${trip.originCity} → ${trip.destinationCity}`;
      for (const r of rows) {
        await notifyExternalChannels({
          userId: r.buyerId,
          emailSubject: `A trip matches your Eushop request (${route})`,
          emailHtml: `<p>Someone is flying <strong>${escapeHtml(route)}</strong> and may be able to bring what you asked for.</p><p><a href="https://eushop.eu/trips/${trip.id}">View this trip</a></p>`,
          pushTitle: 'Trip matches your request',
          pushBody: route,
          pushData: { kind: 'new-request-match', requestId: r.id, tripOfferId: trip.id },
        });
      }
    });

    return { matches: rows.length };
  },
);
