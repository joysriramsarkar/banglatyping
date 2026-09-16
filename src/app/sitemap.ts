import { MetadataRoute } from 'next';
import { lessons, rowCategories } from '@/lib/lessons';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://banglatyping.com';
  const lastModified = new Date();

  // Core static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}`,
      lastModified,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${siteUrl}/dashboard/test`,
      lastModified,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/dashboard/lessons`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/dashboard/practice/mistakes`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/game`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/about`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/login`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${siteUrl}/signup`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // Row category pages (e.g. /dashboard/lessons/home-row)
  const categoryRoutes: MetadataRoute.Sitemap = rowCategories.map(cat => ({
    url: `${siteUrl}/dashboard/lessons/${cat.id}`,
    lastModified,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Individual lesson practice pages
  const lessonRoutes: MetadataRoute.Sitemap = lessons.map(lesson => ({
    url: `${siteUrl}/dashboard/practice/${lesson.id}`,
    lastModified,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [...staticRoutes, ...categoryRoutes, ...lessonRoutes];
}
