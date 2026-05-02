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
import { openApiDocument } from './openapi.js';
import { authRateLimit, trpcRateLimit } from './rate-limit.js';
import { handleStripeWebhook } from './routes/stripe-webhook.js';

const app = new Hono();

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

// Inngest jobs
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
