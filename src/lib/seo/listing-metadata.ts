import type { Metadata } from 'next';

import { SUPPORTED_LOCALES } from '@/lib/i18n';
import type { PageHeroKey } from '@/lib/public/page-heroes';
import { getPageHero } from '@/lib/public/site-data';
import { absoluteUrl, buildMetadata } from '@/lib/seo';

type ListingMetadataInput = {
  canonicalPath: string;
  defaultDescription: string;
  defaultTitle: string;
  hasFilters?: boolean;
  heroKey?: PageHeroKey;
  imageAlt?: string | null;
  imageUrl?: string | null;
  locale: string;
};

export function hasSearchParams(params: Record<string, string | undefined>) {
  return Object.values(params).some((value) => value?.trim());
}

export async function buildListingPageMetadata({
  canonicalPath,
  defaultDescription,
  defaultTitle,
  hasFilters = false,
  heroKey,
  imageAlt,
  imageUrl,
  locale
}: ListingMetadataInput): Promise<Metadata> {
  const pageHero = heroKey ? await getPageHero(heroKey) : null;
  const title = pageHero?.heading ?? defaultTitle;
  const description = pageHero?.subheading ?? defaultDescription;
  const metaTitle = title.includes('Benroso') ? title : `${title} | Benroso Safaris`;
  const languages = Object.fromEntries(
    SUPPORTED_LOCALES.map((supportedLocale) => [
      supportedLocale,
      absoluteUrl(canonicalPath.replace(`/${locale}`, `/${supportedLocale}`))
    ])
  );

  return buildMetadata({
    canonicalPath,
    description,
    imageAlt: imageAlt ?? metaTitle,
    imageUrl: imageUrl ?? undefined,
    languages,
    noIndex: hasFilters,
    title: metaTitle
  });
}
