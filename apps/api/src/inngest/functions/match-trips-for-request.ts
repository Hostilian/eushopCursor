import { db, foodItems, notifications, requests, tripOffers } from '@eushop/db';
import { decode, neighborsWithinRadius } from '@eushop/geo';
import { and, eq, gte, inArray, ne, or, sql } from 'drizzle-orm';
import { inngest } from '../client.js';

/**
 * When a buyer posts a request, notify **sellers** with an open trip whose
 * destination cell overlaps the buyer's search radius and whose origin /
 * declared `intendedItemIds` plausibly cover the requested catalog item.
 */
export const matchTripsForOpenRequest = inngest.createFunction(
  { id: 'match-trips-for-open-request' },
  { event: 'request.created' },
  async ({ event, step }) => {
    const request = await step.run('load-request', async () =>
      db.query.requests.findFirst({ where: eq(requests.id, event.data.requestId) }),
    );
    if (!request?.foodItemId) return { skipped: true, reason: 'no-food-item' };

    const item = await step.run('load-item', async () =>
      db.query.foodItems.findFirst({ where: eq(foodItems.id, request.foodItemId!) }),
    );
    if (!item) return { skipped: true, reason: 'item-not-found' };

    const anchor = decode(request.cellGeohash);
    const radius = Math.min(request.radiusKm, 150);
    const cells = neighborsWithinRadius(anchor, radius);

    const itemClause = or(
      and(
        sql`coalesce(jsonb_array_length(${tripOffers.intendedItemIds}::jsonb), 0) > 0`,
        sql`${tripOffers.intendedItemIds}::jsonb @> to_jsonb(${request.foodItemId}::text)`,
      ),
      eq(tripOffers.originCountryIso2, item.originCountryIso2),
    );

    const trips = await step.run('find-trips', async () =>
      db
        .select()
        .from(tripOffers)
        .where(
          and(
            eq(tripOffers.status, 'open'),
            gte(tripOffers.departAt, new Date()),
            ne(tripOffers.sellerId, request.buyerId),
            inArray(tripOffers.cellGeohashDestination, cells),
            itemClause,
          ),
        )
        .limit(40),
    );

    if (!trips.length) return { matches: 0 };

    const notified = await step.run('notify-sellers', async () => {
      const seen = new Set<string>();
      for (const trip of trips) {
        if (seen.has(trip.sellerId)) continue;
        seen.add(trip.sellerId);
        await db.insert(notifications).values({
          userId: trip.sellerId,
          kind: 'system',
          title: 'A request may fit your trip',
          body: `Someone near ${request.approximateCity} is looking for "${request.freeformText}" — your ${trip.originCity} → ${trip.destinationCity} trip could match.`,
          data: { requestId: request.id, tripOfferId: trip.id },
        });
      }
      return seen.size;
    });

    return { tripRows: trips.length, sellersNotified: notified };
  },
);
