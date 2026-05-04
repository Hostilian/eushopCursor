import path from 'node:path';
import { fileURLToPath } from 'node:url';

import createNextIntlPlugin from 'next-intl/plugin';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.join(__dirname, '../..');

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** Optional extra hostname for user media (e.g. custom R2 public domain). */
const extraImageHost = process.env.NEXT_PUBLIC_MEDIA_HOSTNAME?.trim();

/**
 * Content-Security-Policy is now applied per-request from `src/middleware.ts`
 * so we can mint a fresh nonce per response. We keep static `Permissions-Policy`,
 * `Referrer-Policy`, and `X-Content-Type-Options` here as a backstop in case
 * the middleware ever short-circuits a request before reaching us.
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  outputFileTracingRoot: monorepoRoot,
  reactStrictMode: true,
  // Typed route validator can false-fail against generated `routes.d.ts` in some Next 15.5
  // builds; Link hrefs are still checked at compile time via string literals in practice.
  typedRoutes: false,
  async headers() {
    const fallbackHeaders = [
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
    ];
    return [
      {
        source: '/((?!_next/|api/).*)',
        headers: fallbackHeaders,
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'media.eushop.eu' },
      // Open Food Facts hosts product photos under both static.openfoodfacts.org
      // and images.openfoodfacts.org. They are CC-BY-SA 4.0; we display them
      // with attribution on the item page.
      { protocol: 'https', hostname: 'static.openfoodfacts.org' },
      { protocol: 'https', hostname: 'images.openfoodfacts.org' },
      ...(extraImageHost
        ? [
            {
              protocol: 'https',
              hostname: extraImageHost.replace(/^https?:\/\//, '').split('/')[0],
            },
          ]
        : []),
    ],
  },
  transpilePackages: [
    '@eushop/api-router',
    '@eushop/auth',
    '@eushop/catalog',
    '@eushop/db',
    '@eushop/tokens',
    '@eushop/i18n',
    '@eushop/ui',
    '@eushop/validators',
  ],
};

export default withNextIntl(nextConfig);
