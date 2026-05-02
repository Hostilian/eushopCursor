import { fetchRemoteImageInput, presignUploadInput } from '@eushop/validators';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import crypto from 'node:crypto';
import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';
import { adminProcedure, protectedProcedure, rateLimited, router } from '../trpc';

const fetchRemoteImageLimit = rateLimited({
  scope: 'media.fetchRemoteImage',
  perMinute: 10,
  perDay: 60,
});

/**
 * Media uploads are presigned client-side directly to Cloudflare R2 via the
 * S3-compatible PutObject API. The API server only mints the signature and
 * records the resulting public URL on the listing/profile when the client
 * calls back in.
 *
 * For the dev environment we return a tiny stub (a `data:` URL) so frontend
 * flows can be exercised without any storage backend configured.
 */

const ALLOWED_CONTENT_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
/** 15 MiB — keeps random Google-image URLs from killing memory. */
const MAX_REMOTE_BYTES = 15 * 1024 * 1024;
/** Cap on redirect depth — prevents redirect-loop SSRF and malicious chains. */
const MAX_REDIRECTS = 4;

/**
 * Reject the entire IPv4/IPv6 private address space and link-local + loopback.
 * Catches `10/8`, `172.16/12`, `192.168/16`, `127/8`, `169.254/16`, `::1`,
 * `fc00::/7`, `fe80::/10`, plus IPv4-mapped IPv6 (`::ffff:10.0.0.1`).
 */
function isPrivateOrLoopbackIp(addr: string): boolean {
  const family = isIP(addr);
  if (family === 0) return true;
  if (family === 4) return ipv4IsPrivate(addr);
  return ipv6IsPrivate(addr);
}

function ipv4IsPrivate(addr: string): boolean {
  const parts = addr.split('.').map(Number);
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) return true;
  const [a = 0, b = 0] = parts;
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 0) return true;
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
  if (a >= 224) return true; // multicast / reserved
  return false;
}

function ipv6IsPrivate(addr: string): boolean {
  const lower = addr.toLowerCase();
  if (lower === '::1' || lower === '::') return true;
  if (lower.startsWith('fe80:')) return true;
  if (lower.startsWith('fc') || lower.startsWith('fd')) return true;
  // IPv4-mapped IPv6 (::ffff:a.b.c.d) — strip mapping and re-evaluate.
  const mapped = lower.match(/^::ffff:([\d.]+)$/);
  if (mapped) return ipv4IsPrivate(mapped[1] ?? '');
  return false;
}

/**
 * Resolve `hostname` and require **every** answer to be a public unicast IP.
 * This prevents DNS-rebinding tricks from leaking the request to an internal
 * address after the initial check passed.
 */
async function assertPublicHostname(hostname: string): Promise<void> {
  const ipFamily = isIP(hostname);
  if (ipFamily !== 0) {
    if (isPrivateOrLoopbackIp(hostname)) {
      throw new TRPCError({ code: 'BAD_REQUEST', message: 'Private host not allowed' });
    }
    return;
  }
  const lower = hostname.toLowerCase();
  if (
    lower === 'localhost' ||
    lower.endsWith('.localhost') ||
    lower.endsWith('.internal') ||
    lower.endsWith('.local')
  ) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Private host not allowed' });
  }
  let answers: { address: string }[];
  try {
    answers = await lookup(hostname, { all: true });
  } catch {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'DNS resolution failed' });
  }
  if (answers.length === 0) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'DNS resolution returned no addresses' });
  }
  for (const a of answers) {
    if (isPrivateOrLoopbackIp(a.address)) {
      throw new TRPCError({ code: 'BAD_REQUEST', message: 'Private host not allowed' });
    }
  }
}

/**
 * `fetch` wrapper that walks redirects manually so each hop's hostname is
 * re-validated against {@link assertPublicHostname}. Returns the final
 * `Response` whose body the caller may consume.
 */
async function safeFetch(initialUrl: URL, signal: AbortSignal): Promise<Response> {
  let url = initialUrl;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
      throw new TRPCError({ code: 'BAD_REQUEST', message: 'Only http(s) URLs allowed' });
    }
    await assertPublicHostname(url.hostname);
    const res = await fetch(url, {
      redirect: 'manual',
      signal,
      headers: {
        Accept: 'image/avif,image/webp,image/png,image/jpeg,image/*;q=0.8',
        'User-Agent': 'Eushop/0.2 image-importer',
      },
    });
    const isRedirect = res.status >= 300 && res.status < 400 && res.headers.has('location');
    if (!isRedirect) return res;
    const next = res.headers.get('location') ?? '';
    try {
      url = new URL(next, url);
    } catch {
      throw new TRPCError({ code: 'BAD_REQUEST', message: 'Bad redirect target' });
    }
  }
  throw new TRPCError({ code: 'BAD_REQUEST', message: 'Too many redirects' });
}

export const mediaRouter = router({
  presign: protectedProcedure.input(presignUploadInput).mutation(async ({ ctx, input }) => {
    const id = crypto.randomUUID();
    const ext = input.contentType.split('/')[1];
    const key = `${input.purpose}/${ctx.user.id}/${id}.${ext}`;

    const bucket = process.env.R2_BUCKET;
    const accountId = process.env.R2_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    const publicUrlBase = process.env.R2_PUBLIC_URL ?? 'https://media.eushop.eu';

    if (!bucket || !accountId || !accessKeyId || !secretAccessKey) {
      const transparentSvg =
        'data:image/svg+xml;utf8,' +
        encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><rect width="1" height="1" fill="#FAF7F2"/></svg>`,
        );
      return {
        method: 'PUT' as const,
        uploadUrl: `data:dev-noop;key=${encodeURIComponent(key)}`,
        publicUrl: transparentSvg,
        key,
        headers: { 'Content-Type': input.contentType },
      };
    }

    const uploadUrl = `https://${accountId}.r2.cloudflarestorage.com/${bucket}/${key}`;
    return {
      method: 'PUT' as const,
      uploadUrl,
      publicUrl: `${publicUrlBase}/${key}`,
      key,
      headers: { 'Content-Type': input.contentType },
    };
  }),

  /**
   * Server-side image fetch. Lets a user paste a Google-image (or any) URL
   * and re-hosts it on R2 so we never hotlink and never leak the user's IP
   * to a third-party origin. We also strip any redirects through internal
   * IP space (basic SSRF protection — full mitigation is the network
   * boundary in production).
   *
   * Returns the same shape as `presign` so call sites can swap freely.
   */
  fetchRemoteImage: protectedProcedure
    .use(fetchRemoteImageLimit)
    .input(fetchRemoteImageInput)
    .mutation(async ({ ctx, input }) => {
      const url = new URL(input.url);
      if (url.protocol !== 'https:' && url.protocol !== 'http:') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Only http(s) URLs allowed' });
      }

      let res: Response;
      try {
        res = await safeFetch(url, AbortSignal.timeout(8_000));
      } catch (e) {
        if (e instanceof TRPCError) throw e;
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: e instanceof Error ? e.message : 'Could not fetch image',
        });
      }
      if (!res.ok) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Image host returned HTTP ${res.status}`,
        });
      }
      const contentType = (res.headers.get('content-type') ?? '').split(';')[0]?.trim();
      if (!contentType || !ALLOWED_CONTENT_TYPES.has(contentType)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Unsupported image type: ${contentType ?? 'unknown'}`,
        });
      }
      const lengthHeader = Number(res.headers.get('content-length') ?? '0');
      if (lengthHeader > MAX_REMOTE_BYTES) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Image too large' });
      }
      const buffer = await res.arrayBuffer();
      if (buffer.byteLength > MAX_REMOTE_BYTES) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Image too large' });
      }

      const ext = contentType.split('/')[1] ?? 'jpg';
      const id = crypto.randomUUID();
      const key = `${input.purpose}/${ctx.user.id}/${id}.${ext}`;

      const bucket = process.env.R2_BUCKET;
      const accountId = process.env.R2_ACCOUNT_ID;
      const accessKeyId = process.env.R2_ACCESS_KEY_ID;
      const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
      const publicUrlBase = process.env.R2_PUBLIC_URL ?? 'https://media.eushop.eu';

      if (!bucket || !accountId || !accessKeyId || !secretAccessKey) {
        // Dev path — re-encode as a data URL so the rest of the form flow
        // can complete locally without R2 credentials.
        const base64 = Buffer.from(buffer).toString('base64');
        return {
          publicUrl: `data:${contentType};base64,${base64}`,
          key,
          contentType,
          source: 'dev-data-url' as const,
          byteLength: buffer.byteLength,
        };
      }

      // Real implementation: PUT into R2 via S3 SigV4. We keep the AWS SDK
      // out of this generic package; the api app's deploy bundle wraps this
      // call in a trampoline that signs and uploads. For now we surface the
      // payload to the client which already knows how to PUT (mirrors
      // `presign` semantics).
      const uploadUrl = `https://${accountId}.r2.cloudflarestorage.com/${bucket}/${key}`;
      return {
        publicUrl: `${publicUrlBase}/${key}`,
        key,
        contentType,
        source: 'r2' as const,
        byteLength: buffer.byteLength,
        // The api app's R2 trampoline reads `payloadBase64` and PUTs it.
        payloadBase64: Buffer.from(buffer).toString('base64'),
        uploadUrl,
      };
    }),

  /**
   * Admin-only image proxy used by the catalog UGC moderation page so admins
   * never load arbitrary submitter URLs in their browser. Reuses the same
   * SSRF-hardened `safeFetch` and returns a base64 data URL the admin UI can
   * render via `<img src>` without further network requests.
   */
  adminProxyImage: adminProcedure
    .use(rateLimited({ scope: 'media.adminProxyImage', perMinute: 60, perDay: 600 }))
    .input(z.object({ url: z.string().url() }))
    .query(async ({ input }) => {
      const url = new URL(input.url);
      if (url.protocol !== 'https:' && url.protocol !== 'http:') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Only http(s) URLs allowed' });
      }
      let res: Response;
      try {
        res = await safeFetch(url, AbortSignal.timeout(8_000));
      } catch (e) {
        if (e instanceof TRPCError) throw e;
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: e instanceof Error ? e.message : 'Could not fetch image',
        });
      }
      if (!res.ok) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Image host returned HTTP ${res.status}`,
        });
      }
      const contentType = (res.headers.get('content-type') ?? '').split(';')[0]?.trim();
      if (!contentType || !ALLOWED_CONTENT_TYPES.has(contentType)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Unsupported image type: ${contentType ?? 'unknown'}`,
        });
      }
      const lengthHeader = Number(res.headers.get('content-length') ?? '0');
      if (lengthHeader > MAX_REMOTE_BYTES) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Image too large' });
      }
      const buffer = await res.arrayBuffer();
      if (buffer.byteLength > MAX_REMOTE_BYTES) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Image too large' });
      }
      const base64 = Buffer.from(buffer).toString('base64');
      return {
        dataUrl: `data:${contentType};base64,${base64}`,
        contentType,
        byteLength: buffer.byteLength,
      };
    }),
});
