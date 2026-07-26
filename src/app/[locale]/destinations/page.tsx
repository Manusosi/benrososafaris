import type { Metadata } from 'next';

import { DestinationCard } from '@/components/public/cards/content-cards';
import { DestinationFilters } from '@/components/public/destinations/destination-filters';
import { EmptyState, ListingShell } from '@/components/public/page-shell';
import { PublicPageHero } from '@/components/public/public-page-hero';
import { BENROSO_PUBLIC_HERO_IMAGES } from '@/config/benroso';
import { localePath } from '@/lib/public/locale-path';
import { getPageHero, getPublicDestinations } from '@/lib/public/site-data';
import { buildListingPageMetadata, hasSearchParams } from '@/lib/seo/listing-metadata';

type DestinationsPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ country?: string }>;
};

const destinationsDescription =
  'Explore East Africa safari destinations across Kenya, Tanzania, Uganda, and Rwanda with Benroso Safaris.';

export async function generateMetadata({
  params,
  searchParams
}: DestinationsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const query = await searchParams;

  return buildListingPageMetadata({
    canonicalPath: `/${locale}/destinations`,
    defaultDescription: destinationsDescription,
    defaultTitle: 'Safari Destinations',
    hasFilters: hasSearchParams(query),
    heroKey: 'destinations',
    locale
  });
}

function slugifyCountry(country: string) {
  return country.trim().toLowerCase().replace(/\s+/g, '-');
}

export default async function DestinationsPage({ params, searchParams }: DestinationsPageProps) {
  const { locale } = await params;
  const { country: countryParam } = await searchParams;
  const activeCountry = countryParam?.toLowerCase() ?? null;

  const [destinations, pageHero] = await Promise.all([
    getPublicDestinations(locale),
    getPageHero('destinations')
  ]);
  const hero = BENROSO_PUBLIC_HERO_IMAGES.destinations;

  const countryFacets = [
    ...new Map(
      destinations
        .filter((destination) => destination.country)
        .map((destination) => [
          slugifyCountry(destination.country as string),
          destination.country as string
        ])
    )
  ]
    .map(([slug, label]) => ({
      count: destinations.filter(
        (destination) => destination.country && slugifyCountry(destination.country) === slug
      ).length,
      label,
      slug
    }))
    .toSorted((a, b) => a.label.localeCompare(b.label));

  const visible = activeCountry
    ? destinations.filter(
        (destination) =>
          destination.country && slugifyCountry(destination.country) === activeCountry
      )
    : destinations;

  const activeLabel = countryFacets.find((facet) => facet.slug === activeCountry)?.label;
  const hasActiveFilter = Boolean(activeCountry);

  return (
    <>
      <PublicPageHero
        breadcrumbs={[{ href: localePath(locale), label: 'Home' }, { label: 'Destinations' }]}
        description='Destination guides for Kenya, Tanzania, national parks, wildlife seasons, and linked safari routes.'
        eyebrow='Destinations'
        hero={pageHero}
        imageAlt={hero.imageAlt}
        imageUrl={hero.imageUrl}
        title='East Africa Safari Destinations'
      />
      <ListingShell
        filters={
          <DestinationFilters
            activeCountry={activeCountry}
            facets={countryFacets}
            locale={locale}
            totalCount={destinations.length}
          />
        }
      >
        <div className='mb-6 flex items-baseline justify-between gap-3'>
          <h2 className='benroso-heading font-display text-2xl'>
            {activeLabel ? `${activeLabel} destinations` : 'All destinations'}
          </h2>
          <span className='text-sm text-[var(--benroso-muted)]'>
            {visible.length} {visible.length === 1 ? 'guide' : 'guides'}
          </span>
        </div>
        {visible.length ? (
          <div className='grid gap-6 md:grid-cols-2 xl:grid-cols-3'>
            {visible.map((destination) => (
              <DestinationCard
                item={{
                  country: destination.country,
                  region: destination.region,
                  excerpt: destination.summary,
                  href: destination.href,
                  imageAlt: destination.imageAlt,
                  imageUrl: destination.imageUrl,
                  title: destination.name
                }}
                key={destination.id}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            actionHref={localePath(locale, hasActiveFilter ? '/destinations' : '/contact')}
            actionLabel={hasActiveFilter ? 'Clear country filter' : 'Speak With a Safari Planner'}
            message={
              activeLabel
                ? `No published destination guides for ${activeLabel} yet. Try another country or talk to a planner.`
                : 'Destination guides will populate automatically from the CMS once published.'
            }
            title={hasActiveFilter ? 'No destinations match' : 'No destinations published yet'}
          />
        )}
      </ListingShell>
    </>
  );
}
