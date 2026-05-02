import { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import { router } from './trpc';
import { catalogRouter } from './routers/catalog';
import { listingsRouter } from './routers/listings';
import { messagingRouter } from './routers/messaging';
import { mediaRouter } from './routers/media';
import { notificationsRouter } from './routers/notifications';
import { profileRouter } from './routers/profile';
import { requestsRouter } from './routers/requests';
import { tractionRouter } from './routers/traction';
import { tripsRouter } from './routers/trips';
import { trustRouter } from './routers/trust';
import { paymentsRouter } from './routers/payments';

export const appRouter = router({
  catalog: catalogRouter,
  listings: listingsRouter,
  requests: requestsRouter,
  trips: tripsRouter,
  messaging: messagingRouter,
  media: mediaRouter,
  notifications: notificationsRouter,
  profile: profileRouter,
  traction: tractionRouter,
  trust: trustRouter,
  payments: paymentsRouter,
});

export type AppRouter = typeof appRouter;
export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
