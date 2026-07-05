import type { Metadata } from 'next';

import { Icons } from '@/components/icons';
import { NationalParkFilters } from '@/components/public/national-parks/national-park-filters';
import { NationalParksResults } from '@/components/public/national-parks/national-parks-results';
import { ListingShell } from '@/components/public/page-shell';
import { PublicPageHero } from '@/components/public/public-page-hero';
import { BENROSO_PUBLIC_HERO_IMAGES } from '@/config/benroso';
import { localePath } from '@/lib/public/locale-path';
import { getParkFilterFacets, listPublishedParks } from '@/lib/public/national-parks';
import { getPageHero } from '@/lib/public/site-data';
import { absoluteUrl } from '@/lib/seo';

type NationalParksPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    activity?: string;
    country?: string;
    region?: string;
    wildlife?: string;
  }>;
};

const nationalParksDescription =
  'Compare safari parks and reserves across East Africa. Filter by wildlife, season, and region, then jump to bookable tours for each park.';

function parseFilterList(value?: string) {
  if (!value?.trim()) return [];
  return value
    .split(',')
    .map((item) => decodeURIComponent(item.trim()))
    .filter(Boolean);
}

export async function generateMetadata({ params }: NationalParksPageProps): Promise<Metadata> {
  const { locale } = await params;
  const canonical = absoluteUrl(`/${locale}/national-parks`);

  return {
    title: 'National Parks & Safari Reserves | Benroso Safaris',
    description: nationalParksDescription,
    alternates: { canonical },
    openGraph: {
      title: 'National Parks & Safari Reserves | Benroso Safaris',
      description: nationalParksDescription,
      type: 'website',
      url: canonical
    }
  };
}

export default async function NationalParksPage({ params, searchParams }: NationalParksPageProps) {
  const { locale } = await params;
  const query = await searchParams;

  const activeFilters = {
    activities: parseFilterList(query.activity),
    countries: parseFilterList(query.country),
    regions: parseFilterList(query.region),
    wildlife: parseFilterList(query.wildlife)
  };

  const [parks, facets, pageHero] = await Promise.all([
    listPublishedParks({
      activities: activeFilters.activities,
      countries: activeFilters.countries,
      locale,
      regions: activeFilters.regions,
      wildlife: activeFilters.wildlife
    }),
    getParkFilterFacets(locale),
    getPageHero('national-parks')
  ]);
  const hero = BENROSO_PUBLIC_HERO_IMAGES.destinations;

  return (
    <>
      <PublicPageHero
        breadcrumbStyle='pipe-uppercase'
        breadcrumbs={[{ href: localePath(locale), label: 'Home' }, { label: 'National Parks' }]}
        description={nationalParksDescription}
        eyebrow='Safari Parks'
        eyebrowTone='white'
        hero={pageHero}
        imageAlt={hero.imageAlt}
        imageUrl={hero.imageUrl}
        overlayTone='black'
        showGoldLine={false}
        title='National Parks & Reserves'
        titleTone='white'
      />

      <section className='bg-white'>
        <div className='benroso-container border-b border-[var(--benroso-line)] py-10 md:py-14'>
          <div className='mx-auto max-w-5xl text-center'>
            <p className='benroso-eyebrow'>Your park guide</p>
            <h2 className='benroso-heading mt-3 font-display text-[clamp(1.9rem,3vw,2.75rem)] leading-tight'>
              Compare parks, filter by what matters, then jump to bookable safaris.
            </h2>
            <p className='benroso-body mx-auto mt-4 max-w-4xl text-base leading-8 md:text-lg md:leading-8'>
              Browse national parks and reserves across East and Southern Africa. Use the filters to
              narrow by country, region, wildlife, or activities. Select any two parks to compare
              seasonality, size, and live safari availability side by side.
            </p>
          </div>
          <ul className='mt-10 grid grid-cols-1 gap-8 text-left md:mt-12 md:grid-cols-3 lg:gap-12'>
            <li className='flex gap-4'>
              <Icons.adjustments className='mt-0.5 size-5 shrink-0 text-[var(--benroso-gold)]' />
              <div>
                <p className='text-sm font-semibold text-[var(--benroso-ink)] md:text-base'>
                  Filter by wildlife & season
                </p>
                <p className='mt-1.5 text-sm leading-6 text-[var(--benroso-muted)] md:leading-7'>
                  Narrow parks by animals, activities, country, or region.
                </p>
              </div>
            </li>
            <li className='flex gap-4'>
              <Icons.checks className='mt-0.5 size-5 shrink-0 text-[var(--benroso-gold)]' />
              <div>
                <p className='text-sm font-semibold text-[var(--benroso-ink)] md:text-base'>
                  Compare two parks
                </p>
                <p className='mt-1.5 text-sm leading-6 text-[var(--benroso-muted)] md:leading-7'>
                  Tick Compare on any two cards to see wildlife, size, and best time together.
                </p>
              </div>
            </li>
            <li className='flex gap-4'>
              <Icons.compass className='mt-0.5 size-5 shrink-0 text-[var(--benroso-gold)]' />
              <div>
                <p className='text-sm font-semibold text-[var(--benroso-ink)] md:text-base'>
                  View bookable safaris
                </p>
                <p className='mt-1.5 text-sm leading-6 text-[var(--benroso-muted)] md:leading-7'>
                  Each park links to published tours with live prices and availability.
                </p>
              </div>
            </li>
          </ul>
        </div>
      </section>

      <ListingShell
        className='bg-white'
        filters={<NationalParkFilters active={activeFilters} facets={facets} locale={locale} />}
      >
        <NationalParksResults locale={locale} parks={parks} />
      </ListingShell>
    </>
  );
}
