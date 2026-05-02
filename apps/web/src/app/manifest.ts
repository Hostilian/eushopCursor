import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Eushop — Niche EU food near you',
    short_name: 'Eushop',
    description: 'Find Krówki, Stroopwafels, Mastiha and more from neighbours in your city.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FAF7F2',
    theme_color: '#1A1612',
    lang: 'en',
    orientation: 'portrait-primary',
    categories: ['food', 'lifestyle', 'shopping'],
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
