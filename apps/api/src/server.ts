import 'dotenv/config';
import { serve } from '@hono/node-server';
import { trpcServer } from '@hono/trpc-server';
import { appRouter, createContext } from '@eushop/api-router';
import { auth } from '@eushop/auth';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { inngest, inngestFunctions } from './inngest/client.js';
import { serve as inngestServe } from 'inngest/hono';

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

// Better Auth handler — exposes /api/auth/*
app.on(['POST', 'GET'], '/api/auth/*', (c) => auth.handler(c.req.raw));

// tRPC at /trpc
app.use(
  '/trpc/*',
  trpcServer({
    router: appRouter,
    createContext: ({ req }) => createContext({ headers: req.headers }),
  }),
);

// Inngest jobs
app.on(
  ['GET', 'POST', 'PUT'],
  '/api/inngest',
  inngestServe({ client: inngest, functions: inngestFunctions }),
);

const port = Number(process.env.PORT ?? 3001);

serve({ fetch: app.fetch, port }, (info) => {
  console.info(`▸ eushop-api listening on http://localhost:${info.port}`);
});
