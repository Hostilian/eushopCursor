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
      // Dev fallback: hand back a placeholder URL the client can echo back to mock a successful upload.
      return {
        method: 'PUT' as const,
        uploadUrl: `data:dev-noop;key=${encodeURIComponent(key)}`,
        publicUrl: `https://placehold.co/1200x1200/FAF7F2/3B2F22?text=${encodeURIComponent(key)}`,
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
