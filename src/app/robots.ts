import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://typing.onuron.org';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/_next/',
          '/dashboard/profile',
          '/login',
          '/signup',
          '/verify',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
