import { TourCard } from '@/components/public/cards/content-cards';
import { TourCatalogFilters } from '@/components/public/tours/tour-catalog-filters';
import { EmptyState, ListingShell } from '@/components/public/page-shell';
import { PublicPageHero } from '@/components/public/public-page-hero';
import { BENROSO_PUBLIC_HERO_IMAGES } from '@/config/benroso';
import { localePath } from '@/lib/public/locale-path';
import { getPageHero, getPublicTourCatalog } from '@/lib/public/site-data';
import type { PublicTourPricingTier } from '@/lib/public/types';

type ToursPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    destination?: string;
    duration_max?: string;
    duration_min?: string;
    experience?: string;
    price_max?: string;
    price_min?: string;
    sort?: string;
    tier?: string;
  }>;
};

function parseFilterList(value?: string) {
  if (!value?.trim()) return [];
  return value
    .split(',')
    .map((item) => decodeURIComponent(item.trim()))
    .filter(Boolean);
}

function parsePrice(value?: string) {
  if (!value?.trim()) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseTierList(value?: string): PublicTourPricingTier['tier'][] {
  return parseFilterList(value).filter(
    (tier): tier is PublicTourPricingTier['tier'] =>
      tier === 'budget' || tier === 'mid_range' || tier === 'luxury'
  );
}

export default async function ToursPage({ params, searchParams }: ToursPageProps) {
  const { locale } = await params;
  const query = await searchParams;
  const activeFilters = {
    destination: parseFilterList(query.destination),
    durationMax: query.duration_max?.trim() || undefined,
    durationMin: query.duration_min?.trim() || undefined,
    experience: parseFilterList(query.experience),
    priceMax: query.price_max?.trim() || undefined,
    priceMin: query.price_min?.trim() || undefined,
    pricingTier: parseTierList(query.tier),
    sort: query.sort === 'price' ? ('price' as const) : ('name' as const)
  };

  const [{ tours, facets }, pageHero] = await Promise.all([
    getPublicTourCatalog(locale, {
      destination: activeFilters.destination,
      durationMax: parsePrice(activeFilters.durationMax),
      durationMin: parsePrice(activeFilters.durationMin),
      experience: activeFilters.experience,
      priceMax: parsePrice(activeFilters.priceMax),
      priceMin: parsePrice(activeFilters.priceMin),
      pricingTier: activeFilters.pricingTier,
      sort: activeFilters.sort
    }),
    getPageHero('tours')
  ]);
  const hero = BENROSO_PUBLIC_HERO_IMAGES.tours;

  return (
    <>
      <PublicPageHero
        breadcrumbs={[{ href: localePath(locale), label: 'Home' }, { label: 'Safari Tours' }]}
        description='Browse Kenya and Tanzania safari tours with clear durations, pricing guidance, and expert-planned routes.'
        eyebrow='Safari Tours'
        hero={pageHero}
        imageAlt={hero.imageAlt}
        imageUrl={hero.imageUrl}
        title='Kenya & Tanzania Safari Tours'
      />
      <ListingShell
        filters={<TourCatalogFilters active={activeFilters} facets={facets} locale={locale} />}
      >
        <div className='mb-6 flex items-baseline justify-between gap-3'>
          <h2 className='benroso-heading font-display text-2xl'>Safari Tours</h2>
          <span className='text-sm text-[var(--benroso-muted)]'>
            {tours.length} {tours.length === 1 ? 'tour' : 'tours'} found
          </span>
        </div>
        {tours.length ? (
          <div className='grid gap-6 md:grid-cols-2 xl:grid-cols-3'>
            {tours.map((tour) => (
              <TourCard
                item={{
                  days: tour.days,
                  excerpt: tour.excerpt,
                  href: tour.href,
                  imageAlt: tour.imageAlt,
                  imageUrl: tour.imageUrl,
                  nights: tour.nights,
                  priceFrom: tour.priceFrom,
                  title: tour.title
                }}
                key={tour.id}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            actionHref={localePath(locale, '/contact')}
            actionLabel='Plan a Custom Safari'
            message='Published tours will appear here once they are added through the Benroso CMS.'
            title='No tours published yet'
          />
        )}
      </ListingShell>
    </>
  );
}
