import 'dotenv/config';
import { serve } from '@hono/node-server';
import { trpcServer } from '@hono/trpc-server';
import { appRouter, createContext } from '@eushop/api-router';
import { auth } from '@eushop/auth';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { inngest } from './inngest/client.js';
import { inngestFunctions } from './inngest/functions-registry.js';
import { serve as inngestServe } from 'inngest/hono';
import { captureError, initSentry } from './observability.js';
import { openApiDocument } from './openapi.js';
import { authRateLimit, healthRateLimit, inngestRateLimit, trpcRateLimit } from './rate-limit.js';
import { handleStripeWebhook } from './routes/stripe-webhook.js';

await initSentry();

const app = new Hono();

app.onError((err, c) => {
  captureError(err, { route: c.req.path });
  console.error('[hono] unhandled error', err);
  return c.json({ ok: false, error: 'Internal server error' }, 500);
});

app.use('*', logger());
app.use(
  '*',
  cors({
    origin: (origin) => origin ?? '*',
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Trpc-Source'],
  }),
);

// Tiny limiter on public/unauthenticated surfaces so a single noisy
// client (or scraper) cannot saturate health probes or the OpenAPI doc.
const healthLimiter = healthRateLimit();
app.use('/', healthLimiter);
app.use('/health', healthLimiter);
app.use('/openapi.json', healthLimiter);

app.get('/', (c) => c.json({ name: 'eushop-api', ok: true }));
app.get('/health', (c) => c.json({ ok: true, ts: Date.now() }));
app.get('/openapi.json', (c) => c.json(openApiDocument));

// Better Auth handler — exposes /api/auth/*
app.use('/api/auth/*', authRateLimit());
app.on(['POST', 'GET'], '/api/auth/*', (c) => auth.handler(c.req.raw));

// tRPC at /trpc
app.use('/trpc/*', trpcRateLimit());
app.use(
  '/trpc/*',
  trpcServer({
    router: appRouter,
    createContext: ({ req }) =>
      createContext({
        headers: req.headers,
        enqueueEvent: async (event) => {
          await inngest.send({ name: event.name as never, data: event.data as never });
        },
      }),
  }),
);

app.use('/api/inngest', inngestRateLimit());
app.on(
  ['GET', 'POST', 'PUT'],
  '/api/inngest',
  inngestServe({ client: inngest, functions: inngestFunctions }),
);

/** Stripe webhooks — signature verified inside handleStripeWebhook. */
app.post('/webhooks/stripe', handleStripeWebhook);

const port = Number(process.env.PORT ?? 3001);

serve({ fetch: app.fetch, port }, (info) => {
  console.info(`▸ eushop-api listening on http://localhost:${info.port}`);
});
