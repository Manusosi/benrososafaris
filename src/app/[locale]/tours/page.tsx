import type { Metadata } from 'next';

import { TourCard } from '@/components/public/cards/content-cards';
import { TourCatalogFilters } from '@/components/public/tours/tour-catalog-filters';
import { EmptyState, ListingShell } from '@/components/public/page-shell';
import { PublicPageHero } from '@/components/public/public-page-hero';
import { BENROSO_PUBLIC_HERO_IMAGES } from '@/config/benroso';
import { localePath } from '@/lib/public/locale-path';
import { getPageHero, getPublicTourCatalog } from '@/lib/public/site-data';
import { TOUR_CATALOG_COUNTRIES } from '@/lib/public/tour-format';
import type { PublicTourPricingTier } from '@/lib/public/types';
import { absoluteUrl } from '@/lib/seo';

const toursPageTitle = 'Safari Tours & Itineraries';
const toursPageDescription =
  'Find the safari that fits you. Benroso Safaris brings together expert-led tours across Kenya, Tanzania, Uganda, Rwanda, and South Africa, so you can compare trip lengths, prices, and routes at your own pace.';

type ToursPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    country?: string;
    destination?: string;
    duration_max?: string;
    duration_min?: string;
    experience?: string;
    park?: string;
    price_max?: string;
    price_min?: string;
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

function parseCountry(value?: string) {
  const slug = value?.trim();
  if (!slug) return undefined;
  return TOUR_CATALOG_COUNTRIES.some((item) => item.slug === slug) ? slug : undefined;
}

export async function generateMetadata({ params }: ToursPageProps): Promise<Metadata> {
  const { locale } = await params;
  const pageHero = await getPageHero('tours');
  const title = pageHero?.heading ?? toursPageTitle;
  const description = pageHero?.subheading ?? toursPageDescription;
  const metaTitle = title.includes('Benroso') ? title : `${title} | Benroso Safaris`;
  const canonical = absoluteUrl(`/${locale}/tours`);

  return {
    title: metaTitle,
    description,
    alternates: { canonical },
    openGraph: {
      title: metaTitle,
      description,
      url: canonical,
      type: 'website'
    }
  };
}

export default async function ToursPage({ params, searchParams }: ToursPageProps) {
  const { locale } = await params;
  const query = await searchParams;
  const activeFilters = {
    country: parseCountry(query.country),
    destination: parseFilterList(query.destination),
    durationMax: query.duration_max?.trim() || undefined,
    durationMin: query.duration_min?.trim() || undefined,
    experience: parseFilterList(query.experience),
    park: parseFilterList(query.park),
    priceMax: query.price_max?.trim() || undefined,
    priceMin: query.price_min?.trim() || undefined,
    pricingTier: parseTierList(query.tier)
  };

  const [{ tours, facets }, pageHero] = await Promise.all([
    getPublicTourCatalog(locale, {
      country: activeFilters.country,
      destination: activeFilters.destination,
      durationMax: parsePrice(activeFilters.durationMax),
      durationMin: parsePrice(activeFilters.durationMin),
      experience: activeFilters.experience,
      park: activeFilters.park,
      priceMax: parsePrice(activeFilters.priceMax),
      priceMin: parsePrice(activeFilters.priceMin),
      pricingTier: activeFilters.pricingTier
    }),
    getPageHero('tours')
  ]);
  const hero = BENROSO_PUBLIC_HERO_IMAGES.tours;

  return (
    <>
      <PublicPageHero
        breadcrumbs={[{ href: localePath(locale), label: 'Home' }, { label: 'Safari Tours' }]}
        description={toursPageDescription}
        eyebrow='Safari Tours'
        hero={pageHero}
        imageAlt={hero.imageAlt}
        imageUrl={hero.imageUrl}
        overlayTone='black'
        title={toursPageTitle}
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
