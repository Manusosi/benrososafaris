import type { MetadataRoute } from 'next';

import { absoluteUrl } from '@/lib/seo/absolute-url';
import { getAllSitemapUrls } from '@/lib/seo/sitemap-data';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = await getAllSitemapUrls();

  return entries.map((entry) => ({
    url: absoluteUrl(entry.path),
    lastModified: entry.lastModified,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority
  }));
}
