import type { Context, Next } from 'hono';

type Bucket = { count: number; resetAt: number };

const WINDOW_MS = 60_000;

function clientKey(c: Context): string {
  const xf = c.req.header('x-forwarded-for');
  if (xf) {
    const first = xf.split(',')[0]?.trim();
    if (first) return first;
  }
  const cf = c.req.header('cf-connecting-ip');
  if (cf) return cf;
  return c.req.header('x-real-ip') ?? 'unknown';
}

function pruneExpired(buckets: Map<string, Bucket>, now: number) {
  if (buckets.size > 2000 && Math.random() < 0.05) {
    for (const [k, b] of buckets) {
      if (now >= b.resetAt) buckets.delete(k);
    }
  }
}

/** Per-IP sliding window limiter (separate map per instance). */
export function createRateLimiter(maxPerWindow: number): (c: Context, next: Next) => Promise<Response | void> {
  const buckets = new Map<string, Bucket>();
  return async (c, next) => {
    const key = clientKey(c);
    const now = Date.now();
    pruneExpired(buckets, now);
    let b = buckets.get(key);
    if (!b || now >= b.resetAt) {
      b = { count: 0, resetAt: now + WINDOW_MS };
      buckets.set(key, b);
    }
    b.count += 1;
    if (b.count > maxPerWindow) {
      c.header('Retry-After', String(Math.ceil((b.resetAt - now) / 1000)));
      return c.json({ error: 'Too many requests' }, 429);
    }
    await next();
  };
}

export function trpcRateLimit(): (c: Context, next: Next) => Promise<Response | void> {
  return createRateLimiter(Number(process.env.API_RATE_LIMIT_PER_MIN ?? 240));
}

export function authRateLimit(): (c: Context, next: Next) => Promise<Response | void> {
  return createRateLimiter(Number(process.env.API_AUTH_RATE_LIMIT_PER_MIN ?? 60));
}
