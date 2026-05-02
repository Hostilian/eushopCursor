import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Eushop — Trips & neighbourhood shares',
    short_name: 'Eushop',
    description:
      'Spare luggage space on trips you take, local shares, and open asks—profiles, chat, public handoffs.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FAF7F2',
    theme_color: '#1A1612',
    lang: 'en',
    orientation: 'portrait-primary',
    categories: ['travel', 'food', 'shopping', 'lifestyle', 'social'],
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
