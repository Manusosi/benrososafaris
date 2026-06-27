import { Icons } from '@/components/icons';
import {
  AccommodationBackLink,
  AccommodationCard
} from '@/components/public/accommodations/accommodation-card';
import { AccommodationGallery } from '@/components/public/accommodations/accommodation-gallery';
import { AccommodationInquiryPanel } from '@/components/public/accommodations/accommodation-inquiry-panel';
import {
  buildMapQuery,
  formatAvailabilityLabel,
  formatComfortLevelLabel
} from '@/features/accommodations/public/constants';
import type { PublicAccommodationDetail } from '@/features/accommodations/public/types';
import { localePath } from '@/lib/public/locale-path';
import { cn } from '@/lib/utils';

type AccommodationDetailShellProps = {
  accommodation: PublicAccommodationDetail;
  locale: string;
};

function formatNightPrice(price?: number | null) {
  if (!price) return null;
  return new Intl.NumberFormat('en-US', {
    currency: 'USD',
    maximumFractionDigits: 0,
    style: 'currency'
  }).format(price);
}

function availabilityBadgeClass(availability: PublicAccommodationDetail['availability']) {
  if (availability === 'available') return 'bg-[var(--benroso-primary)] text-white';
  if (availability === 'limited')
    return 'bg-[var(--benroso-gold)] text-[var(--benroso-primary-dark)]';
  return 'border border-[var(--benroso-line)] bg-white text-[var(--benroso-ink)]';
}

export function AccommodationDetailShell({ accommodation, locale }: AccommodationDetailShellProps) {
  const price = formatNightPrice(accommodation.pricePerNight);
  const availabilityLabel = formatAvailabilityLabel(accommodation.availability);
  const comfortLabel = formatComfortLevelLabel(accommodation.comfortLevel);
  const mapQuery = buildMapQuery(
    accommodation.region,
    accommodation.country,
    accommodation.mapQuery
  );

  return (
    <main className='bg-[var(--benroso-ivory)]'>
      <section className='border-b border-[var(--benroso-line)] bg-white'>
        <div className='benroso-container py-6 md:py-8'>
          <nav
            aria-label='Breadcrumb'
            className='mb-6 flex flex-wrap gap-2 text-sm text-[var(--benroso-muted)]'
          >
            <a className='hover:text-[var(--benroso-primary)]' href={localePath(locale)}>
              Home
            </a>
            <span>/</span>
            <a
              className='hover:text-[var(--benroso-primary)]'
              href={localePath(locale, '/accommodations')}
            >
              Accommodations
            </a>
            <span>/</span>
            <span className='text-[var(--benroso-ink)]'>{accommodation.name}</span>
          </nav>

          <div className='grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10'>
            <div>
              <AccommodationGallery images={accommodation.gallery} title={accommodation.name} />

              <div className='mt-6 flex flex-wrap gap-2'>
                {accommodation.propertyType ? (
                  <span className='rounded-[var(--benroso-radius)] border border-[var(--benroso-line)] bg-white px-3 py-1 text-xs font-bold uppercase tracking-wide text-[var(--benroso-ink)]'>
                    {accommodation.propertyType}
                  </span>
                ) : null}
                <span
                  className={cn(
                    'rounded-[var(--benroso-radius)] px-3 py-1 text-xs font-bold uppercase tracking-wide',
                    availabilityBadgeClass(accommodation.availability)
                  )}
                >
                  {availabilityLabel}
                </span>
                {comfortLabel ? (
                  <span className='rounded-[var(--benroso-radius)] border border-[var(--benroso-line)] bg-white px-3 py-1 text-xs font-bold uppercase tracking-wide text-[var(--benroso-ink)]'>
                    {comfortLabel}
                  </span>
                ) : null}
              </div>

              <h1 className='benroso-heading mt-5 font-display text-[clamp(2rem,4vw,3rem)] leading-tight'>
                {accommodation.name}
              </h1>
              <p className='mt-2 flex items-center gap-2 text-base text-[var(--benroso-muted)]'>
                <Icons.mapPin className='size-4 shrink-0 text-[var(--benroso-primary)]' />
                {accommodation.locationLabel}
              </p>

              <div className='mt-10 lg:hidden'>
                <AccommodationInquiryPanel
                  accommodationName={accommodation.name}
                  accommodationSlug={accommodation.slug}
                  availabilityLabel={availabilityLabel}
                  locale={locale}
                  price={price}
                />
              </div>

              <section className='mt-10'>
                <h2 className='benroso-heading font-display text-2xl'>About this property</h2>
                {accommodation.descriptionHtml ? (
                  <div
                    className='benroso-legal-prose mt-4'
                    dangerouslySetInnerHTML={{ __html: accommodation.descriptionHtml }}
                  />
                ) : accommodation.excerpt ? (
                  <p className='benroso-body mt-4 text-[15px] leading-7'>{accommodation.excerpt}</p>
                ) : null}
              </section>

              {accommodation.amenities.length ? (
                <section className='mt-10'>
                  <h2 className='benroso-heading font-display text-2xl'>Amenities</h2>
                  <ul className='mt-4 grid gap-3 sm:grid-cols-2'>
                    {accommodation.amenities.map((amenity) => (
                      <li
                        className='flex items-start gap-2 text-[15px] leading-7 text-[var(--benroso-ink)]'
                        key={amenity}
                      >
                        <Icons.check className='mt-1 size-4 shrink-0 text-[var(--benroso-primary)]' />
                        <span>{amenity}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              <div className='mt-10'>
                <AccommodationBackLink href={localePath(locale, '/accommodations')} />
              </div>
            </div>

            <aside className='hidden lg:block'>
              <div className='sticky top-[calc(var(--benroso-topbar-h)+var(--benroso-header-h)+1rem)] space-y-4'>
                <AccommodationInquiryPanel
                  accommodationName={accommodation.name}
                  accommodationSlug={accommodation.slug}
                  availabilityLabel={availabilityLabel}
                  locale={locale}
                  price={price}
                />
                {mapQuery ? <LocationMapPanel mapQuery={mapQuery} /> : null}
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}

export { AccommodationCard };

function LocationMapPanel({ mapQuery }: { mapQuery: string }) {
  const encodedQuery = encodeURIComponent(mapQuery);
  const mapSrc = `https://maps.google.com/maps?q=${encodedQuery}&output=embed`;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedQuery}`;

  return (
    <div className='overflow-hidden rounded-[var(--benroso-radius)] border border-[var(--benroso-line)] bg-white shadow-sm'>
      <div className='border-b border-[var(--benroso-line)] px-4 py-3'>
        <h2 className='benroso-heading font-display text-lg'>Location</h2>
        <p className='mt-1 text-sm text-[var(--benroso-muted)]'>{mapQuery}</p>
      </div>
      <iframe
        allowFullScreen
        className='h-44 w-full border-0'
        loading='lazy'
        referrerPolicy='no-referrer-when-downgrade'
        sandbox='allow-scripts allow-same-origin allow-popups'
        src={mapSrc}
        title='Property location map'
      />
      <div className='border-t border-[var(--benroso-line)] px-4 py-3'>
        <a
          className='inline-flex items-center gap-1.5 text-sm font-medium text-[var(--benroso-primary)] hover:underline'
          href={mapsUrl}
          rel='noopener noreferrer'
          target='_blank'
        >
          Open in Google Maps
          <Icons.externalLink className='size-3.5' />
        </a>
      </div>
    </div>
  );
}
