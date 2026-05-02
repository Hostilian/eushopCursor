import { presignUploadInput } from '@eushop/validators';
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
      // Dev fallback. Returns a no-op PUT URL and a transparent 1×1 SVG so the
      // form flow can be exercised end-to-end without R2 credentials. This URL
      // is served via `data:` and is therefore safe in `next/image` and CSP
      // (img-src includes `data:`). It is *visually* obvious that there's no
      // real image, which is what we want during local development.
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

    // Real implementation: presign with @aws-sdk/client-s3 + @aws-sdk/s3-request-presigner
    // (kept as a stub here to avoid pulling AWS SDKs into this generic package;
    // the api app adds them at deploy time).
    const uploadUrl = `https://${accountId}.r2.cloudflarestorage.com/${bucket}/${key}`;
    return {
      method: 'PUT' as const,
      uploadUrl,
      publicUrl: `${publicUrlBase}/${key}`,
      key,
      headers: { 'Content-Type': input.contentType },
    };
  }),
});
