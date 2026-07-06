import { SUPPORTED_LOCALES } from '@/lib/i18n';

import { notifySearchEnginesLater } from './indexing';

const LISTING_SEGMENTS_BY_PREFIX: Record<string, string[]> = {
  accommodations: ['', 'accommodations'],
  blog: ['', 'blog'],
  destinations: ['', 'destinations'],
  experiences: ['', 'experiences', 'tours'],
  'national-parks': ['', 'national-parks', 'tours'],
  'our-fleet': ['', 'our-fleet'],
  'safari-packages': ['', 'safari-packages', 'tours'],
  tours: ['', 'tours', 'safari-packages']
};

type PublishedContentInput = {
  listingPaths?: string[];
  locales?: string[];
  pathPrefix: string;
  slug: string;
};

function defaultListingPaths(pathPrefix: string, locales: string[]) {
  const segments = LISTING_SEGMENTS_BY_PREFIX[pathPrefix] ?? ['', pathPrefix];
  return locales.flatMap((locale) =>
    segments.map((segment) => (segment ? `/${locale}/${segment}` : `/${locale}`))
  );
}

/**
 * Revalidate + instant-index a published CMS entity across locales.
 */
export function notifyPublishedContent({
  listingPaths,
  locales = SUPPORTED_LOCALES,
  pathPrefix,
  slug
}: PublishedContentInput) {
  const paths = [
    ...(listingPaths ?? defaultListingPaths(pathPrefix, locales)),
    ...locales.map((locale) => `/${locale}/${pathPrefix}/${slug}`)
  ];

  notifySearchEnginesLater(paths);
}
