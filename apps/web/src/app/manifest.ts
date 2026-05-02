import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Eushop — trips, locals & open asks',
    short_name: 'Eushop',
    description:
      'Get something from somewhere. Bring something for someone. Trips, locals, and open asks on one map — profiles, chat, public handoffs.',
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
