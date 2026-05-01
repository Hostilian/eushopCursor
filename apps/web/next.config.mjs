import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: true,
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
    '@eushop/validators',
  ],
};

export default withNextIntl(nextConfig);
