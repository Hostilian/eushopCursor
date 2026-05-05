import { NextResponse } from 'next/server';

/**
 * Android Digital Asset Links — App Links manifest.
 *
 * Served at https://eushop.eu/.well-known/assetlinks.json as `application/json`.
 * Maps the Play upload + signing certificate SHA-256 fingerprints to the
 * `eu.eushop.app` package, so Android auto-verifies our App Links and opens
 * matching URLs directly in the app.
 *
 * Fingerprints come from env (set after `eas credentials --platform android`
 * runs). When absent, returns an empty array so verification fails closed
 * (browser fallback) instead of granting a wrong package access.
 *
 * Multiple fingerprints are supported — Play App Signing rotates the upload
 * key and the app-signing key separately.
 *
 * Reference: https://developer.android.com/training/app-links/verify-android-applinks
 */
export const dynamic = 'force-static';
export const revalidate = 3600;

const PACKAGE = process.env.ANDROID_PACKAGE_NAME?.trim() || 'eu.eushop.app';

function fingerprints(): string[] {
  const raw = process.env.ANDROID_SHA256_FINGERPRINTS?.trim();
  if (!raw) return [];
  return raw
    .split(/[,;\s]+/)
    .map((f) => f.trim())
    .filter((f) => /^[0-9A-Fa-f:]{40,}$/.test(f));
}

export function GET() {
  const fps = fingerprints();
  const manifest = fps.length
    ? [
        {
          relation: ['delegate_permission/common.handle_all_urls'],
          target: {
            namespace: 'android_app',
            package_name: PACKAGE,
            sha256_cert_fingerprints: fps,
          },
        },
      ]
    : [];

  return NextResponse.json(manifest, {
    headers: {
      'content-type': 'application/json',
      'cache-control': 'public, max-age=3600',
    },
  });
}
