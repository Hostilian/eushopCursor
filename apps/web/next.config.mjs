import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const isProd = process.env.NODE_ENV === 'production';

/** Optional extra hostname for user media (e.g. custom R2 public domain). */
const extraImageHost = process.env.NEXT_PUBLIC_MEDIA_HOSTNAME?.trim();

/** Content-Security-Policy: tight enough for OSM embeds; dev keeps eval for Next/Turbopack. */
const contentSecurityPolicy = [
  "default-src 'self'",
  isProd
    ? "script-src 'self' 'unsafe-inline'"
    : "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https: http://localhost:* http://127.0.0.1:* ws: wss:",
  "frame-src 'self' https://www.openstreetmap.org https://*.openstreetmap.org",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  async headers() {
    const securityHeaders = [
      { key: 'Content-Security-Policy', value: contentSecurityPolicy },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
    ];
    return [{ source: '/:path*', headers: securityHeaders }];
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
        ? [{ protocol: 'https', hostname: extraImageHost.replace(/^https?:\/\//, '').split('/')[0] }]
        : []),
    ],
  },
  transpilePackages: [
    '@eushop/api-router',
    '@eushop/auth',
    '@eushop/catalog-data',
    '@eushop/db',
    '@eushop/design-tokens',
    '@eushop/i18n',
    '@eushop/ui-web',
    '@eushop/validators',
  ],
};

export default withNextIntl(nextConfig);
