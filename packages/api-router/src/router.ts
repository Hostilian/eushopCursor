import { router } from './trpc.js';
import { catalogRouter } from './routers/catalog.js';
import { listingsRouter } from './routers/listings.js';
import { messagingRouter } from './routers/messaging.js';
import { mediaRouter } from './routers/media.js';
import { notificationsRouter } from './routers/notifications.js';
import { profileRouter } from './routers/profile.js';
import { requestsRouter } from './routers/requests.js';
import { trustRouter } from './routers/trust.js';

export const appRouter = router({
  catalog: catalogRouter,
  listings: listingsRouter,
  requests: requestsRouter,
  messaging: messagingRouter,
  media: mediaRouter,
  notifications: notificationsRouter,
  profile: profileRouter,
  trust: trustRouter,
});

export type AppRouter = typeof appRouter;
