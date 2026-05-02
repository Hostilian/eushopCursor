/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@eushop/api-router',
    '@eushop/auth',
    '@eushop/catalog-data',
    '@eushop/db',
  ],
};

export default nextConfig;
