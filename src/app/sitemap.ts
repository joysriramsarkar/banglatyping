import { MetadataRoute } from 'next';
import { getAllCurriculumLessons } from '@/lib/curriculum/curriculum-data';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://typing.onuron.org';

export default function sitemap(): MetadataRoute.Sitemap {
  const lessons = getAllCurriculumLessons();

  // Static core routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: '2026-09-19',
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    // P1 SEO Landing Pages
    {
      url: `${siteUrl}/bangla-typing-test`,
      lastModified: '2026-09-19',
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${siteUrl}/bangla-typing-practice`,
      lastModified: '2026-09-19',
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/bangla-typing-speed-test`,
      lastModified: '2026-09-19',
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/avro-typing-test`,
      lastModified: '2026-09-19',
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${siteUrl}/bijoy-typing-test`,
      lastModified: '2026-09-19',
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${siteUrl}/bangla-typing-course`,
      lastModified: '2026-09-19',
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${siteUrl}/bangla-keyboard`,
      lastModified: '2026-09-19',
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${siteUrl}/bangla-typing-for-jobs`,
      lastModified: '2026-09-19',
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    // P2 Learn Hub Pages
    {
      url: `${siteUrl}/learn`,
      lastModified: '2026-09-19',
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${siteUrl}/learn/home-row`,
      lastModified: '2026-09-19',
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/learn/top-row`,
      lastModified: '2026-09-19',
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/learn/bottom-row`,
      lastModified: '2026-09-19',
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/learn/kar`,
      lastModified: '2026-09-19',
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/learn/hasanta`,
      lastModified: '2026-09-19',
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/learn/phola`,
      lastModified: '2026-09-19',
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/learn/juktakkhor`,
      lastModified: '2026-09-19',
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/learn/numbers`,
      lastModified: '2026-09-19',
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/learn/words`,
      lastModified: '2026-09-19',
      changeFrequency: 'monthly',
      priority: 0.75,
    },
    {
      url: `${siteUrl}/learn/sentences`,
      lastModified: '2026-09-19',
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/learn/punctuation`,
      lastModified: '2026-09-19',
      changeFrequency: 'monthly',
      priority: 0.75,
    },
    // App/utility routes (non-personalised)
    {
      url: `${siteUrl}/game`,
      lastModified: '2026-09-19',
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: '2026-09-19',
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  // P3 — 61 individual curriculum lesson SEO pages
  const lessonRoutes: MetadataRoute.Sitemap = lessons.map((lesson) => ({
    url: `${siteUrl}/lesson/${lesson.id}`,
    lastModified: '2026-09-19',
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...lessonRoutes];
}
