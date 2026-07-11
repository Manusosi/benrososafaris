import type { Metadata } from 'next';

import { AccommodationFilters } from '@/components/public/accommodations/accommodation-filters';
import { AccommodationsResults } from '@/components/public/accommodations/accommodations-results';
import { parseFilterList } from '@/features/accommodations/public/filters';
import { ListingShell } from '@/components/public/page-shell';
import { PublicPageHero } from '@/components/public/public-page-hero';
import { BENROSO_PUBLIC_HERO_IMAGES } from '@/config/benroso';
import {
  getAccommodationFilterFacets,
  listPublishedAccommodations
} from '@/features/accommodations/public/service';
import { localePath } from '@/lib/public/locale-path';
import { getPageHero } from '@/lib/public/site-data';
import { absoluteUrl } from '@/lib/seo';

type AccommodationsPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    comfort_level?: string;
    country?: string;
    destination?: string;
    max_price?: string;
    min_price?: string;
    property_type?: string;
    region?: string;
  }>;
};

const accommodationsDescription =
  'Browse handpicked safari lodges, tented camps, boutique stays, and Nairobi apartments, then enquire directly with our team.';

function parsePrice(value?: string) {
  if (!value?.trim()) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export async function generateMetadata({ params }: AccommodationsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const canonical = absoluteUrl(`/${locale}/accommodations`);

  return {
    title: 'Safari Accommodations & Lodges | Benroso Safaris',
    description: accommodationsDescription,
    alternates: { canonical },
    openGraph: {
      title: 'Safari Accommodations & Lodges | Benroso Safaris',
      description: accommodationsDescription,
      url: canonical,
      type: 'website'
    }
  };
}

export default async function AccommodationsPage({
  params,
  searchParams
}: AccommodationsPageProps) {
  const { locale } = await params;
  const query = await searchParams;

  const activeFilters = {
    comfortLevels: parseFilterList(query.comfort_level),
    countries: parseFilterList(query.country),
    destinations: parseFilterList(query.destination),
    maxPrice: query.max_price?.trim() || undefined,
    minPrice: query.min_price?.trim() || undefined,
    propertyTypes: parseFilterList(query.property_type),
    regions: parseFilterList(query.region)
  };

  const [accommodations, facets] = await Promise.all([
    listPublishedAccommodations({
      comfortLevels: activeFilters.comfortLevels,
      countries: activeFilters.countries,
      destinationSlugs: activeFilters.destinations,
      locale,
      maxPrice: parsePrice(activeFilters.maxPrice),
      minPrice: parsePrice(activeFilters.minPrice),
      propertyTypes: activeFilters.propertyTypes,
      regions: activeFilters.regions
    }),
    getAccommodationFilterFacets(locale)
  ]);

  const pageHero = await getPageHero('accommodations');
  const hero = BENROSO_PUBLIC_HERO_IMAGES.accommodations;

  return (
    <>
      <PublicPageHero
        breadcrumbStyle='pipe-uppercase'
        breadcrumbs={[{ href: localePath(locale), label: 'Home' }, { label: 'Accommodations' }]}
        description={accommodationsDescription}
        eyebrow='Where You Will Stay'
        eyebrowTone='white'
        hero={pageHero}
        imageAlt={hero.imageAlt}
        imageUrl={hero.imageUrl}
        overlayTone='black'
        showGoldLine={false}
        title='Accommodations'
        titleTone='white'
      />
      <ListingShell
        className='bg-white'
        filters={
          <AccommodationFilters
            active={activeFilters}
            facets={facets}
            locale={locale}
            priceBounds={facets.priceBounds}
          />
        }
      >
        <AccommodationsResults accommodations={accommodations} locale={locale} />
      </ListingShell>
    </>
  );
}
