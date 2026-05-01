import 'server-only';
import { appRouter, createContext } from '@eushop/api-router';
import { headers } from 'next/headers';
import { cache } from 'react';

const createServerContext = cache(async () => {
  const h = new Headers(await headers());
  return createContext({ headers: h });
});

export const api = cache(async () => {
  const ctx = await createServerContext();
  return appRouter.createCaller(ctx);
});
