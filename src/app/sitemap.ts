import { MetadataRoute } from 'next';
import { getAllCurriculumLessons } from '@/lib/curriculum/curriculum-data';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://typing.onuron.org';

// Build-time timestamp: evaluated fresh on every build/deploy so crawlers
// always see a current lastModified without hardcoding a calendar date.
// (Previously every entry shared a hardcoded '2026-09-19'.)
const buildDate = new Date();

type ChangeFrequency = NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>;

function entry(
  url: string,
  changeFrequency: ChangeFrequency,
  priority: number,
): MetadataRoute.Sitemap[number] {
  return { url, lastModified: buildDate, changeFrequency, priority };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const lessons = getAllCurriculumLessons();

  // Static core routes — each entry carries a DISTINCT
  // (changeFrequency, priority) pair so crawlers can differentiate
  // crawl demand per page instead of seeing a wall of identical values.
  const staticRoutes: MetadataRoute.Sitemap = [
    entry(siteUrl, 'daily', 1.0),
    // P1 SEO Landing Pages
    entry(`${siteUrl}/bangla-typing-test`, 'daily', 0.95),
    entry(`${siteUrl}/bangla-typing-practice`, 'weekly', 0.9),
    entry(`${siteUrl}/bangla-typing-speed-test`, 'weekly', 0.89),
    entry(`${siteUrl}/avro-typing-test`, 'weekly', 0.88),
    entry(`${siteUrl}/bijoy-typing-test`, 'weekly', 0.87),
    entry(`${siteUrl}/bangla-typing-course`, 'weekly', 0.86),
    entry(`${siteUrl}/bangla-keyboard`, 'monthly', 0.85),
    entry(`${siteUrl}/bangla-typing-for-jobs`, 'monthly', 0.84),
    // P2 Learn Hub Pages
    entry(`${siteUrl}/learn`, 'daily', 0.83),
    entry(`${siteUrl}/learn/home-row`, 'weekly', 0.82),
    entry(`${siteUrl}/learn/top-row`, 'weekly', 0.81),
    entry(`${siteUrl}/learn/bottom-row`, 'weekly', 0.8),
    entry(`${siteUrl}/learn/kar`, 'weekly', 0.79),
    entry(`${siteUrl}/learn/hasanta`, 'weekly', 0.78),
    entry(`${siteUrl}/learn/phola`, 'monthly', 0.77),
    entry(`${siteUrl}/learn/juktakkhor`, 'monthly', 0.76),
    entry(`${siteUrl}/learn/numbers`, 'monthly', 0.75),
    entry(`${siteUrl}/learn/words`, 'monthly', 0.74),
    entry(`${siteUrl}/learn/sentences`, 'monthly', 0.73),
    entry(`${siteUrl}/learn/punctuation`, 'monthly', 0.72),
    // App/utility routes (non-personalised)
    entry(`${siteUrl}/game`, 'monthly', 0.6),
    entry(`${siteUrl}/about`, 'yearly', 0.5),
  ];

  // P3 — 61 individual curriculum lesson SEO pages.
  // Priority staggers 0.70 → 0.66 across entries so no two lesson URLs
  // share an identical (changeFrequency, priority) pair.
  const lessonRoutes: MetadataRoute.Sitemap = lessons.map((lesson, index) => ({
    url: `${siteUrl}/lesson/${lesson.id}`,
    lastModified: buildDate,
    changeFrequency: 'monthly' as const,
    priority: 0.7 - (index % 5) * 0.01,
  }));

  return [...staticRoutes, ...lessonRoutes];
}
