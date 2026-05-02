import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { ZodError } from 'zod';
import type { Context } from './context';

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zod: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const router = t.router;
export const middleware = t.middleware;
export const publicProcedure = t.procedure;

const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.user) throw new TRPCError({ code: 'UNAUTHORIZED' });
  return next({ ctx: { ...ctx, user: ctx.user } });
});

export const protectedProcedure = t.procedure.use(isAuthed);

const isAdmin = t.middleware(({ ctx, next }) => {
  if (!ctx.user) throw new TRPCError({ code: 'UNAUTHORIZED' });
  if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN', message: 'Admins only' });
  return next({ ctx: { ...ctx, user: ctx.user } });
});

export const adminProcedure = t.procedure.use(isAdmin);

/**
 * Per-user, per-procedure rate limiter. In-memory; intended for the modular
 * monolith. When we split into services, swap the bucket store for Redis.
 *
 * Buckets are keyed by `(scope, user.id|ip)` and tracked in two windows so we
 * can express "30/min and 200/day" with a single decorator. Anonymous callers
 * fall back to `headers['x-forwarded-for']` to keep the limit useful for
 * `publicProcedure` paths if we ever add one.
 */
type RateBucket = { count: number; resetAt: number };
const rateBuckets = new Map<string, RateBucket>();

function bucketCheck(key: string, max: number, windowMs: number, now: number): boolean {
  let bucket = rateBuckets.get(key);
  if (!bucket || now >= bucket.resetAt) {
    bucket = { count: 0, resetAt: now + windowMs };
    rateBuckets.set(key, bucket);
  }
  bucket.count += 1;
  return bucket.count <= max;
}

function clientIpFromHeaders(h: Headers): string {
  const xf = h.get('x-forwarded-for');
  if (xf) {
    const first = xf.split(',')[0]?.trim();
    if (first) return first;
  }
  return h.get('cf-connecting-ip') ?? h.get('x-real-ip') ?? 'unknown';
}

export interface RateLimitOptions {
  scope: string;
  perMinute?: number;
  perDay?: number;
}

export function rateLimited(opts: RateLimitOptions) {
  const { scope, perMinute, perDay } = opts;
  return t.middleware(({ ctx, next }) => {
    const id = ctx.user?.id ?? `ip:${clientIpFromHeaders(ctx.headers)}`;
    const now = Date.now();
    if (perMinute && !bucketCheck(`${scope}:m:${id}`, perMinute, 60_000, now)) {
      throw new TRPCError({ code: 'TOO_MANY_REQUESTS', message: `Rate limit (${scope}) exceeded` });
    }
    if (perDay && !bucketCheck(`${scope}:d:${id}`, perDay, 24 * 60 * 60_000, now)) {
      throw new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        message: `Daily limit (${scope}) exceeded`,
      });
    }
    return next();
  });
}

export const createCallerFactory = t.createCallerFactory;
