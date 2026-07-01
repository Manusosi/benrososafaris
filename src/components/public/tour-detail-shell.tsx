import Link from 'next/link';

import { Icons } from '@/components/icons';
import { AccommodationGallery } from '@/components/public/accommodations/accommodation-gallery';
import { RouteAccommodationsSection } from '@/components/public/tours/route-accommodations-section';
import { TourPricingTable } from '@/components/public/tours/tour-pricing-table';
import { BenrosoButton } from '@/components/public/ui/benroso-button';
import { localePath } from '@/lib/public/locale-path';
import { formatTourDuration, formatTourPrice } from '@/lib/public/tour-format';
import type { PublicTourDetail, PublicTourPricingTier } from '@/lib/public/types';

const baseTabs = [
  { id: 'description', label: 'Description' },
  { id: 'itinerary', label: 'Itinerary' },
  { id: 'price-seasons', label: 'Price & Seasons' },
  { id: 'included', label: "What's Included" }
];

type TourDetailShellProps = {
  breadcrumbParent?: {
    href: string;
    label: string;
  };
  description?: string | null;
  eyebrow?: string;
  introHtml?: string | null;
  locale: string;
  pricingTiers?: PublicTourPricingTier[];
  title?: string;
  tour: PublicTourDetail;
};

export function TourDetailShell({
  breadcrumbParent,
  description,
  eyebrow,
  introHtml,
  locale,
  pricingTiers,
  title,
  tour
}: TourDetailShellProps) {
  const price = formatTourPrice(tour.priceFrom);
  const tabs = tour.accommodations.length
    ? [...baseTabs, { id: 'accommodation', label: 'Accommodation' }]
    : baseTabs;
  const galleryImages = tour.gallery.length
    ? tour.gallery
    : tour.imageUrl
      ? [{ id: 'cover', url: tour.imageUrl, alt: tour.imageAlt }]
      : [];
  const routeLabel = [tour.startLocation, tour.endLocation].filter(Boolean).join(' to ');
  const visiblePricing = pricingTiers ?? tour.pricingTiers ?? [];
  const displayTitle = title ?? tour.title;
  const displayDescription = description ?? tour.excerpt;
  const parent = breadcrumbParent ?? {
    href: localePath(locale, '/tours'),
    label: 'Safari Tours'
  };

  return (
    <>
      <section className='bg-white pt-8'>
        <div className='benroso-container'>
          <nav
            aria-label='Breadcrumb'
            className='mb-6 flex flex-wrap gap-2 text-sm text-[var(--benroso-muted)]'
          >
            <Link className='hover:text-[var(--benroso-primary)]' href={localePath(locale)}>
              Home
            </Link>
            <span>/</span>
            <Link className='hover:text-[var(--benroso-primary)]' href={parent.href}>
              {parent.label}
            </Link>
            <span>/</span>
            <span className='text-[var(--benroso-ink)]'>{displayTitle}</span>
          </nav>
          <AccommodationGallery images={galleryImages} title={displayTitle} />
        </div>
      </section>

      <nav className='sticky top-[calc(var(--benroso-topbar-h)+var(--benroso-header-h))] z-40 border-y border-white/10 bg-[var(--benroso-primary-dark)] text-white'>
        <div className='benroso-container flex flex-wrap'>
          {tabs.map((tab) => (
            <a
              className='border-b-2 border-transparent px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] hover:border-white hover:text-white'
              href={`#${tab.id}`}
              key={tab.id}
            >
              {tab.label}
            </a>
          ))}
        </div>
      </nav>

      <section className='benroso-section bg-[var(--benroso-ivory)]'>
        <div className='benroso-container grid gap-10 xl:grid-cols-[minmax(0,1fr)_340px]'>
          <article className='space-y-8'>
            <div id='description'>
              <p className='benroso-eyebrow'>
                {eyebrow ?? formatTourDuration(tour.days, tour.nights)}
              </p>
              <h1 className='benroso-heading mt-3 font-display text-[clamp(2rem,4vw,3rem)] leading-tight'>
                {displayTitle}
              </h1>
              {routeLabel ? (
                <p className='mt-3 flex flex-wrap items-center gap-2 text-base text-[var(--benroso-muted)]'>
                  <Icons.mapPin className='size-4 text-[var(--benroso-primary)]' />
                  Starts {tour.startLocation}
                  {tour.endLocation ? <> · Ends {tour.endLocation}</> : null}
                </p>
              ) : null}
              {displayDescription ? (
                <p className='mt-4 text-lg leading-8 text-[var(--benroso-muted)]'>
                  {displayDescription}
                </p>
              ) : null}
              {introHtml ? (
                <div
                  className='benroso-legal-prose mt-6'
                  dangerouslySetInnerHTML={{ __html: introHtml }}
                />
              ) : null}
              {tour.descriptionHtml ? (
                <div
                  className='benroso-legal-prose mt-6'
                  dangerouslySetInnerHTML={{ __html: tour.descriptionHtml }}
                />
              ) : null}
              {tour.destinationLabels?.length || tour.experienceLabels?.length ? (
                <div className='mt-6 flex flex-wrap gap-2'>
                  {[...(tour.destinationLabels ?? []), ...(tour.experienceLabels ?? [])].map(
                    (label) => (
                      <span
                        className='rounded-[var(--benroso-radius)] border border-[var(--benroso-line)] bg-white px-3 py-1 text-xs font-bold uppercase tracking-wide text-[var(--benroso-ink)]'
                        key={label}
                      >
                        {label}
                      </span>
                    )
                  )}
                </div>
              ) : null}
            </div>

            {tour.importantNotice ? (
              <details className='rounded-[var(--benroso-radius)] border border-[var(--benroso-line)] bg-white p-5'>
                <summary className='cursor-pointer font-display text-lg font-bold text-[var(--benroso-heading)]'>
                  Important Notice
                </summary>
                <p className='benroso-body mt-3 text-sm leading-7'>{tour.importantNotice}</p>
              </details>
            ) : null}

            <div
              className='rounded-[var(--benroso-radius)] border border-[var(--benroso-line)] bg-white p-6'
              id='itinerary'
            >
              <h2 className='benroso-heading font-display text-2xl'>Day-by-Day Itinerary</h2>
              {tour.itineraryDays.length ? (
                <div className='mt-6 space-y-5'>
                  {tour.itineraryDays.map((day) => (
                    <article
                      className='grid gap-4 border-b border-[var(--benroso-line)] pb-5 last:border-b-0 last:pb-0 md:grid-cols-[88px_1fr]'
                      key={`${day.day}-${day.title}`}
                    >
                      <div className='flex h-14 w-14 items-center justify-center rounded-[var(--benroso-radius)] bg-[var(--benroso-primary)] font-display text-xl font-bold text-white'>
                        {day.day}
                      </div>
                      <div>
                        <h3 className='benroso-heading font-display text-xl'>{day.title}</h3>
                        {day.description ? (
                          <p className='benroso-body mt-2 text-sm leading-7'>{day.description}</p>
                        ) : null}
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className='mt-3 text-sm text-[var(--benroso-muted)]'>
                  Full itinerary content will render from CMS once published.
                </p>
              )}
            </div>

            <section id='price-seasons'>
              <h2 className='benroso-heading font-display text-2xl'>Prices and Seasons</h2>
              <p className='benroso-body mt-3 max-w-2xl text-base leading-7'>
                Prices are per person and change by travel season, comfort tier, and group size.
                Packages reuse these same route prices so clients compare like-for-like options.
              </p>
              <div className='mt-6'>
                <TourPricingTable locale={locale} tiers={visiblePricing} />
              </div>
            </section>

            <section
              className='rounded-[var(--benroso-radius)] border border-[var(--benroso-line)] bg-white p-6'
              id='included'
            >
              <h2 className='benroso-heading font-display text-2xl'>What's Included?</h2>
              <div className='mt-6 grid gap-6 md:grid-cols-2'>
                <InclusionList items={tour.inclusions} title='Included' />
                <InclusionList items={tour.exclusions} title='Not Included' />
              </div>
            </section>

            <RouteAccommodationsSection accommodations={tour.accommodations} />
          </article>

          <aside className='h-fit space-y-4 xl:sticky xl:top-[calc(var(--benroso-topbar-h)+var(--benroso-header-h)+4rem)]'>
            <div className='rounded-[var(--benroso-radius)] border border-[var(--benroso-line)] bg-white p-6'>
              {tour.days ? (
                <p className='text-sm font-semibold uppercase tracking-wide text-[var(--benroso-muted)]'>
                  {formatTourDuration(tour.days, tour.nights)}
                </p>
              ) : null}
              {price ? (
                <p className='mt-2'>
                  <span className='text-xs uppercase tracking-wide text-[var(--benroso-muted)]'>
                    From
                  </span>
                  <strong className='block text-3xl text-[var(--benroso-brown)]'>{price}</strong>
                </p>
              ) : null}
              <div className='mt-5 space-y-3'>
                <BenrosoButton
                  className='w-full justify-center'
                  href={localePath(locale, '/contact')}
                >
                  Enquire Now
                </BenrosoButton>
                <Link
                  className='inline-flex w-full items-center justify-center gap-2 rounded-[var(--benroso-button-radius)] border border-[var(--benroso-accent)] px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-[var(--benroso-accent)]'
                  href={localePath(locale, '/contact')}
                >
                  Help Me Choose
                </Link>
              </div>
            </div>
            <div className='rounded-[var(--benroso-radius)] border border-[var(--benroso-line)] bg-white p-6'>
              <h3 className='benroso-heading font-display text-lg'>Trip Facts</h3>
              <dl className='mt-4 space-y-3 text-sm'>
                {tour.startLocation ? (
                  <FactRow label='Starts in' value={tour.startLocation} />
                ) : null}
                {tour.endLocation ? <FactRow label='Ends in' value={tour.endLocation} /> : null}
                {tour.destinationLabels?.length ? (
                  <FactRow label='Route' value={tour.destinationLabels.join(', ')} />
                ) : null}
              </dl>
            </div>
            <div className='rounded-[var(--benroso-radius)] border border-[var(--benroso-line)] bg-white p-6'>
              <h3 className='benroso-heading font-display text-lg'>Why Benroso Safaris?</h3>
              <ul className='mt-4 space-y-2 text-sm text-[var(--benroso-muted)]'>
                <li className='flex gap-2'>
                  <Icons.check className='mt-0.5 h-4 w-4 text-[var(--benroso-accent)]' />
                  Customizable private safaris
                </li>
                <li className='flex gap-2'>
                  <Icons.check className='mt-0.5 h-4 w-4 text-[var(--benroso-accent)]' />
                  Local expert guides
                </li>
                <li className='flex gap-2'>
                  <Icons.check className='mt-0.5 h-4 w-4 text-[var(--benroso-accent)]' />
                  Secure booking support
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

function InclusionList({ items, title }: { items: string[]; title: string }) {
  return (
    <div>
      <h3 className='benroso-heading font-display text-lg'>{title}</h3>
      {items.length ? (
        <ul className='mt-3 space-y-2 text-sm text-[var(--benroso-muted)]'>
          {items.map((item) => (
            <li className='flex gap-2' key={item}>
              <Icons.check className='mt-0.5 h-4 w-4 shrink-0 text-[var(--benroso-accent)]' />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className='benroso-body mt-3 text-sm'>Details available on request.</p>
      )}
    </div>
  );
}

function FactRow({ label, value }: { label: string; value: string }) {
  return (
    <div className='flex items-start justify-between gap-3 border-b border-[var(--benroso-line)] pb-3 last:border-b-0 last:pb-0'>
      <dt className='text-[var(--benroso-muted)]'>{label}</dt>
      <dd className='text-right font-semibold text-[var(--benroso-ink)]'>{value}</dd>
    </div>
  );
}
