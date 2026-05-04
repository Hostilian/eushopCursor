import { CATEGORIES, COUNTRIES, FOOD_ITEMS } from '@eushop/catalog';
import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://eushop.eu';
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    '',
    '/discover',
    '/countries',
    '/requests',
    '/search',
    '/about',
    '/how-it-works',
    '/safety',
    '/privacy',
    '/terms',
    '/imprint',
    '/data-export',
    '/pitch',
    '/press',
    '/roadmap',
    '/changelog',
    '/sign-in',
    '/listings/new',
    '/requests/new',
    '/notifications',
    '/messages',
    '/trips',
    '/trips/new',
    '/reservations',
    '/manifesto',
    '/traction',
    '/investors',
    '/sources',
    '/safety/handoff-protocol',
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1 : 0.7,
  }));

  const countries = COUNTRIES.map((c) => ({
    url: `${base}/countries/${c.iso2.toLowerCase()}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const categories = CATEGORIES.map((cat) => ({
    url: `${base}/categories/${cat.slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.75,
  }));

  const items = FOOD_ITEMS.map((i) => ({
    url: `${base}/items/${i.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...countries, ...categories, ...items];
}
