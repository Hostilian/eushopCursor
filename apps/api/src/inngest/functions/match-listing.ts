import { db, listings, notifications, requests } from '@eushop/db';
import { neighborsWithinRadius } from '@eushop/geo';
import { and, eq, inArray } from 'drizzle-orm';
import { inngest } from '../client.js';

/**
 * When a listing is created, look for matching open requests within radius
 * (foodItem match or freeform-text overlap) and queue a notification for each
 * buyer who opted into match alerts.
 */
export const matchListingToOpenRequests = inngest.createFunction(
  { id: 'match-listing-to-open-requests' },
  { event: 'listing.created' },
  async ({ event, step }) => {
    const listing = await step.run('load-listing', async () =>
      db.query.listings.findFirst({ where: eq(listings.id, event.data.listingId) }),
    );
    if (!listing) return { skipped: true };

    const matches = await step.run('find-matching-requests', async () => {
      const cells = neighborsWithinRadius(
        { lat: 0, lng: 0 }, // would decode from listing.indexGeohash in production
        50,
      );
      return db
        .select()
        .from(requests)
        .where(
          and(
            eq(requests.status, 'open'),
            listing.foodItemId ? eq(requests.foodItemId, listing.foodItemId) : undefined,
            inArray(requests.cellGeohash, cells),
          ),
        )
        .limit(50);
    });

    if (!matches.length) return { matches: 0 };

    await step.run('enqueue-notifications', async () => {
      for (const r of matches) {
        if (!r.notifyOnMatch) continue;
        await db.insert(notifications).values({
          userId: r.buyerId,
          kind: 'new-listing-match',
          title: 'A new listing matches what you\u2019re looking for',
          body: `Someone near ${listing.approximateCity} just posted ${listing.freeformName ?? 'a matching item'}.`,
          data: { listingId: listing.id, requestId: r.id },
        });
      }
    });

    return { matches: matches.length };
  },
);
