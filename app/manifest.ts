import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Amelia AI Health Assistant',
    short_name: 'Amelia',
    description: 'Your personal Multimodal AI healthcare companion.',
    start_url: '/',
    display: 'standalone',
    background_color: '#1E1F22',
    theme_color: '#FC94AF',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}