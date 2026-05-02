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
