import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { AccommodationDetailShell } from '@/components/public/accommodations/accommodation-detail-shell';
import { getPublishedAccommodationBySlug } from '@/features/accommodations/public/service';
import { absoluteUrl, buildAlternates } from '@/lib/seo';

type AccommodationPageProps = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

export async function generateMetadata(props: AccommodationPageProps): Promise<Metadata> {
  const { locale, slug } = await props.params;
  const accommodation = await getPublishedAccommodationBySlug(locale, slug);

  if (!accommodation) notFound();

  const canonical = absoluteUrl(`/${locale}/accommodations/${accommodation.slug}`);
  const title =
    accommodation.seoTitle || `${accommodation.name} | Safari Accommodation | Benroso Safaris`;
  const description = accommodation.seoDescription || accommodation.excerpt || '';

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: await buildAlternates({
        table: 'accommodation_translations',
        parentId: accommodation.id,
        parentKey: 'accommodation_id',
        pathBuilder: (item) => `/${item.locale}/accommodations/${item.slug}`
      })
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
      images: accommodation.imageUrl
        ? [{ url: accommodation.imageUrl, alt: accommodation.imageAlt || title }]
        : []
    }
  };
}

export default async function AccommodationDetailPage(props: AccommodationPageProps) {
  const { locale, slug } = await props.params;
  const accommodation = await getPublishedAccommodationBySlug(locale, slug);

  if (!accommodation) notFound();

  return <AccommodationDetailShell accommodation={accommodation} locale={locale} />;
}
