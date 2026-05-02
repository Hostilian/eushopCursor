import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Eushop — Luggage space & finder fees',
    short_name: 'Eushop',
    description:
      'City-to-city marketplace: sell spare bag capacity on your routes (fixed price or bids) or post requests with a finder’s fee. Rich profiles, low-friction deals.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FAF7F2',
    theme_color: '#1A1612',
    lang: 'en',
    orientation: 'portrait-primary',
    categories: ['travel', 'shopping', 'lifestyle', 'social'],
    icons: [
      {
        src: '/icon.svg',
        type: 'image/svg+xml',
        sizes: 'any',
        purpose: 'any',
      },
    ],
  };
}
