import { Inngest, EventSchemas } from 'inngest';

type Events = {
  'listing.created': { data: { listingId: string; sellerId: string } };
  'request.created': { data: { requestId: string; buyerId: string } };
  'message.sent': { data: { conversationId: string; messageId: string; senderId: string } };
  'media.uploaded': { data: { key: string; url: string; userId: string } };
  'catalog.reindex': { data: Record<string, never> };
};

export const inngest = new Inngest({
  id: 'eushop',
  schemas: new EventSchemas().fromRecord<Events>(),
});

import { matchListingToOpenRequests } from './functions/match-listing.js';
import { notifyMessage } from './functions/notify-message.js';
import { reindexCatalog } from './functions/reindex-catalog.js';

export const inngestFunctions = [matchListingToOpenRequests, notifyMessage, reindexCatalog];
