import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const isProd = process.env.NODE_ENV === 'production';

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
  experimental: {
    typedRoutes: true,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [{ key: 'Content-Security-Policy', value: contentSecurityPolicy }],
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'media.eushop.eu' },
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
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
