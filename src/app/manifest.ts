import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'বাংলা টাইপিং মাস্টার - Bangla Typing Master & Speed Test',
    short_name: 'বাংলা টাইপিং',
    description: 'অনলাইনে সেরা বাংলা টাইপিং টেস্ট ও প্র্যাকটিস প্ল্যাটফর্ম। Avro, Bijoy ও BanglaWord লেআউট সাপোর্ট।',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#ffffff',
    theme_color: '#059669',
    lang: 'bn',
    dir: 'ltr',
    categories: ['education', 'productivity'],
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: '/logo.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icons/maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    screenshots: [
      {
        src: '/screenshots/typing-test.png',
        sizes: '1280x720',
        type: 'image/png',
      },
      {
        src: '/screenshots/lessons-mobile.png',
        sizes: '390x844',
        type: 'image/png',
      },
    ],
  };
}
