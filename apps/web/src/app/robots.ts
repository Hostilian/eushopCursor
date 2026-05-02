import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://eushop.eu';
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/', '/trpc/'] }],
    sitemap: `${base}/sitemap.xml`,
    host: base.replace(/^https?:\/\//, ''),
  };
}
