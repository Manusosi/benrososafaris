import type { Metadata } from 'next';

import { absoluteUrl } from './absolute-url';

const SITE_NAME = 'Benroso Safaris';

type BuildMetadataInput = {
  canonicalPath: string;
  description?: string | null;
  imageAlt?: string | null;
  imageUrl?: string | null;
  languages?: Record<string, string>;
  noIndex?: boolean;
  title: string;
  type?: 'article' | 'website';
};

function toAbsoluteLanguages(languages?: Record<string, string>) {
  if (!languages) return undefined;
  return Object.fromEntries(
    Object.entries(languages).map(([locale, path]) => [locale, absoluteUrl(path)])
  );
}

export function buildMetadata({
  canonicalPath,
  description,
  imageAlt,
  imageUrl,
  languages,
  noIndex,
  title,
  type = 'website'
}: BuildMetadataInput): Metadata {
  const canonical = absoluteUrl(canonicalPath);
  const safeDescription = description || 'Plan a tailored East Africa safari with Benroso Safaris.';
  const ogImages = imageUrl ? [{ url: imageUrl, alt: imageAlt || title }] : undefined;
  const absoluteLanguages = toAbsoluteLanguages(languages);

  return {
    title,
    description: safeDescription,
    alternates: {
      canonical,
      languages: absoluteLanguages
    },
    robots: noIndex
      ? {
          index: false,
          follow: true
        }
      : undefined,
    openGraph: {
      title,
      description: safeDescription,
      url: canonical,
      siteName: SITE_NAME,
      type,
      images: ogImages
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: safeDescription,
      images: imageUrl ? [imageUrl] : undefined
    }
  };
}
