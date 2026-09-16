import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'বাংলা টাইপিং মাস্টার - Bangla Typing Master & Speed Test',
    short_name: 'বাংলা টাইপিং',
    description: 'অনলাইনে সেরা বাংলা টাইপিং টেস্ট ও প্র্যাকটিস প্ল্যাটফর্ম। Avro, Bijoy ও BanglaWord লেআউট সাপোর্ট।',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#059669',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
