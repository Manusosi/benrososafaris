import type { MetadataRoute } from 'next';

import { absoluteUrl } from '@/lib/seo/absolute-url';
import { DISALLOWED_ROBOTS_PATHS } from '@/lib/seo/robots';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          ...DISALLOWED_ROBOTS_PATHS,
          '/dashboard',
          '/auth',
          '/sign-in',
          '/sign-up',
          '/monitoring',
          '/v1/',
          '/*/newsletter/unsubscribe'
        ]
      }
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: absoluteUrl('/')
  };
}
