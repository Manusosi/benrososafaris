import type { MetadataRoute } from 'next';

import { absoluteUrl } from '@/lib/seo/absolute-url';
import { AI_SCRAPER_USER_AGENTS } from '@/lib/seo/ai-crawler-agents';
import { DISALLOWED_ROBOTS_PATHS } from '@/lib/seo/robots';

const DEFAULT_DISALLOW = [
  ...DISALLOWED_ROBOTS_PATHS,
  '/dashboard',
  '/auth',
  '/sign-in',
  '/sign-up',
  '/monitoring',
  '/v1/',
  '/*/newsletter/unsubscribe'
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: DEFAULT_DISALLOW
      },
      {
        userAgent: [...AI_SCRAPER_USER_AGENTS],
        disallow: '/'
      }
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: absoluteUrl('/')
  };
}
