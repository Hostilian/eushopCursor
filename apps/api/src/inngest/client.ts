import { Inngest, EventSchemas } from 'inngest';

type Events = {
  'listing.created': { data: { listingId: string; sellerId: string } };
  'request.created': { data: { requestId: string; buyerId: string } };
  'message.sent': { data: { conversationId: string; messageId: string; senderId: string } };
  'media.uploaded': { data: { key: string; url: string; userId: string } };
  'catalog.reindex': { data: Record<string, never> };
  /** Manually triggered by `pnpm catalog:import-off` or the admin "Import"
   *  button. Pulls a paginated batch of EU products from Open Food Facts
   *  and upserts them as unverified rows. */
  'catalog.import-openfoodfacts': {
    data: {
      categoryTag?: string;
      query?: string;
      page?: number;
      pageSize?: number;
    };
  };
  /** Created when a buyer reserves a slot. Triggers seller notification +
   *  the matcher so other open requests for the same item get a heads-up. */
  'trip.reservation.created': {
    data: { reservationId: string; tripOfferId: string; buyerId: string };
  };
  /** Emitted after `trips.create` — matches open requests by origin country + item. */
  'trip.offer.created': { data: { tripOfferId: string; sellerId: string } };
  /** Cron-driven: 48h before a trip departs, ping all reservation holders. */
  'trip.departure.imminent': { data: { tripOfferId: string } };
};

export const inngest = new Inngest({
  id: 'eushop',
  schemas: new EventSchemas().fromRecord<Events>(),
});
