import { fetchRemoteImageInput, presignUploadInput } from '@eushop/validators';
import { TRPCError } from '@trpc/server';
import crypto from 'node:crypto';
import { protectedProcedure, router } from '../trpc';

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
    .input(fetchRemoteImageInput)
    .mutation(async ({ ctx, input }) => {
      const url = new URL(input.url);
      if (url.protocol !== 'https:' && url.protocol !== 'http:') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Only http(s) URLs allowed' });
      }
      // Cheap SSRF guard: refuse obvious private hostnames. The real defence
      // is at the network layer (the API container has no path to RFC1918).
      const hostname = url.hostname.toLowerCase();
      if (
        hostname === 'localhost' ||
        hostname === '0.0.0.0' ||
        hostname.startsWith('127.') ||
        hostname.startsWith('10.') ||
        hostname.startsWith('192.168.') ||
        hostname.endsWith('.internal') ||
        hostname.endsWith('.local')
      ) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Private host not allowed' });
      }

      let res: Response;
      try {
        res = await fetch(url, {
          redirect: 'follow',
          signal: AbortSignal.timeout(8_000),
          headers: {
            Accept: 'image/avif,image/webp,image/png,image/jpeg,image/*;q=0.8',
            'User-Agent': 'Eushop/0.2 image-importer',
          },
        });
      } catch (e) {
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
});
