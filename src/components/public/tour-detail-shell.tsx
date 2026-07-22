import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { Icons } from '@/components/icons';
import { AccommodationGallery } from '@/components/public/accommodations/accommodation-gallery';
import { ContactAdvantagesList } from '@/components/public/contact/contact-advantages-list';
import { ContactScrollReveal } from '@/components/public/contact/contact-scroll-reveal';
import { DestinationTripsSection } from '@/components/public/destinations/destination-trips-section';
import { SectionAnchorNav } from '@/components/public/section-anchor-nav';
import { MountainRoutePricingTable } from '@/components/public/experiences/mountain-route-pricing-table';
import { RouteAccommodationsSection } from '@/components/public/tours/route-accommodations-section';
import { TourInquiryPanel } from '@/components/public/tours/tour-inquiry-panel';
import { ItineraryTimeline } from '@/components/public/tours/itinerary-timeline';
import { TourPricingTable } from '@/components/public/tours/tour-pricing-table';
import {
  isMountainTourPricing,
  mountainPricingRowsFromTier
} from '@/features/portal/cms/tours/legacy-pricing';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { localePath } from '@/lib/public/locale-path';
import { formatTourDuration, formatTourPrice } from '@/lib/public/tour-format';
import type { PublicTour, PublicTourDetail, PublicTourPricingTier } from '@/lib/public/types';
import { cn } from '@/lib/utils';

const baseTabs = [
  { href: '#description', label: 'Overview' },
  { href: '#itinerary', label: 'Itinerary' },
  { href: '#route-map', label: 'Route Map' },
  { href: '#price-seasons', label: 'Costs' },
  { href: '#included', label: "What's Included" }
];

type RouteStop = {
  label: string;
  value: string;
};

type GalleryImage = PublicTourDetail['gallery'][number];

type TourDetailShellProps = {
  breadcrumbParent?: {
    href: string;
    label: string;
  };
  description?: string | null;
  eyebrow?: string;
  introHtml?: string | null;
  locale: string;
  primaryDestination?: string | null;
  pricingTiers?: PublicTourPricingTier[];
  similarTours?: PublicTour[];
  title?: string;
  tour: PublicTourDetail;
};

export function TourDetailShell({
  breadcrumbParent,
  description,
  eyebrow,
  introHtml,
  locale,
  primaryDestination,
  pricingTiers,
  similarTours = [],
  title,
  tour
}: TourDetailShellProps) {
  const price = formatTourPrice(tour.priceFrom);
  const visiblePricing = pricingTiers ?? tour.pricingTiers ?? [];
  const isMountainLayout = isMountainTourPricing(visiblePricing);
  const mountainPricingTier = isMountainLayout ? visiblePricing[0] : null;
  const tabs = [
    ...baseTabs.filter((tab) => !(isMountainLayout && tab.href === '#route-map')),
    !isMountainLayout && tour.accommodations.length
      ? { href: '#accommodation', label: 'Accommodation' }
      : null,
    tour.faqs.length ? { href: '#tour-faqs', label: 'FAQs' } : null
  ].filter((tab): tab is { href: string; label: string } => tab !== null);
  const galleryImages = tour.gallery.length
    ? tour.gallery
    : tour.imageUrl
      ? [{ id: 'cover', url: tour.imageUrl, alt: tour.imageAlt }]
      : [];
  const routeLabel = [tour.startLocation, tour.endLocation].filter(Boolean).join(' to ');
  const displayTitle = title ?? tour.title;
  const displayDescription = description ?? tour.excerpt;
  const routeStops = buildRouteStops(tour);
  const routeMapLegs = tour.routeLegs.length
    ? tour.routeLegs
    : buildRouteLegsFromItinerary(tour.itineraryDays);
  const classificationLabel = buildTourClassification(tour);
  const parent = breadcrumbParent ?? {
    href: localePath(locale, '/tours'),
    label: 'Safari Tours'
  };

  return (
    <>
      <TourHero
        duration={formatTourDuration(tour.days, tour.nights)}
        eyebrow={eyebrow}
        imageAlt={tour.imageAlt}
        imageUrl={tour.imageUrl ?? galleryImages[0]?.url ?? null}
        locale={locale}
        parent={parent}
        price={price}
        classificationLabel={classificationLabel}
        routeLabel={routeLabel}
        title={displayTitle}
      />

      <SectionAnchorNav items={tabs} />

      <section className='bg-white'>
        <div className='benroso-container py-10 md:py-12'>
          <div className='grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10'>
            <article>
              <section className='scroll-mt-36' id='description'>
                <h2 className='benroso-heading font-display text-[clamp(1.9rem,3vw,2.55rem)] leading-tight'>
                  Trip Overview
                </h2>
                {routeLabel ? (
                  <p className='mt-3 flex flex-wrap items-center gap-2 text-base text-[var(--benroso-muted)]'>
                    <Icons.mapPin className='size-4 text-[var(--benroso-primary)]' />
                    <span>
                      Starts {tour.startLocation}
                      {tour.endLocation ? ` - Ends ${tour.endLocation}` : ''}
                    </span>
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
              </section>

              {galleryImages.length > 1 ? (
                <div className='mt-8'>
                  <AccommodationGallery images={galleryImages} title={displayTitle} />
                </div>
              ) : null}

              <div className='mt-8 lg:hidden'>
                <TourInquiryPanel
                  days={tour.days}
                  locale={locale}
                  nights={tour.nights}
                  price={price}
                  tourSlug={tour.slug}
                  tourTitle={displayTitle}
                />
              </div>

              {tour.importantNotice ? (
                <details className='mt-8 rounded-[var(--benroso-radius)] border border-[var(--benroso-line)] bg-[var(--benroso-ivory)] p-5'>
                  <summary className='cursor-pointer font-display text-lg font-bold text-[var(--benroso-heading)]'>
                    Important Notice
                  </summary>
                  <p className='benroso-body mt-3 text-sm leading-7'>{tour.importantNotice}</p>
                </details>
              ) : null}

              <section
                className='mt-12 scroll-mt-36 border-t border-[var(--benroso-line)] pt-10'
                id='itinerary'
              >
                <h2 className='benroso-heading font-display text-[clamp(1.9rem,3vw,2.55rem)] leading-tight'>
                  {isMountainLayout ? 'Day-by-day overview' : 'Safari Itinerary'}
                </h2>
                <span aria-hidden className='benroso-gold-line benroso-gold-line--left mt-3' />
                <ItineraryTimeline days={tour.itineraryDays} />
              </section>

              {!isMountainLayout ? (
                <section
                  className='mt-12 scroll-mt-36 border-t border-[var(--benroso-line)] pt-10'
                  id='route-map'
                >
                  <div className='flex flex-wrap items-end justify-between gap-4'>
                    <div>
                      <h2 className='benroso-heading font-display text-[clamp(1.9rem,3vw,2.55rem)] leading-tight'>
                        Route Map
                      </h2>
                      <span
                        aria-hidden
                        className='benroso-gold-line benroso-gold-line--left mt-3'
                      />
                    </div>
                  </div>
                  <RouteMapPanel
                    endLocation={tour.endLocation}
                    routeLegs={routeMapLegs}
                    routeLabel={routeLabel}
                    startLocation={tour.startLocation}
                    stops={routeStops}
                  />
                </section>
              ) : null}

              <section
                className='mt-12 scroll-mt-36 border-t border-[var(--benroso-line)] pt-10'
                id='price-seasons'
              >
                <h2 className='benroso-heading font-display text-[clamp(1.75rem,2.6vw,2.35rem)] leading-tight'>
                  {isMountainLayout ? 'Prices' : 'Package Prices for This Trip'}
                </h2>
                {isMountainLayout ? (
                  <p className='benroso-body mt-3 max-w-2xl text-base leading-7'>
                    Camping and hut prices for this climbing route, per person.
                  </p>
                ) : (
                  <p className='benroso-body mt-3 max-w-2xl text-base leading-7'>
                    Each table belongs to this itinerary. The comfort tiers show how the same trip
                    can be sold as budget, mid-range, or luxury, while the columns compare the
                    per-person cost by group size.
                  </p>
                )}
                <div className='mt-6'>
                  {isMountainLayout && mountainPricingTier ? (
                    <MountainRoutePricingTable
                      currency={mountainPricingTier.currency}
                      notes={mountainPricingTier.notes}
                      rows={mountainPricingRowsFromTier(mountainPricingTier)}
                    />
                  ) : (
                    <TourPricingTable locale={locale} tiers={visiblePricing} />
                  )}
                </div>
              </section>

              <section
                className='mt-12 scroll-mt-36 border-t border-[var(--benroso-line)] pt-10'
                id='included'
              >
                <h2 className='benroso-heading font-display text-[clamp(1.9rem,3vw,2.55rem)] leading-tight'>
                  What&apos;s Included
                </h2>
                <span aria-hidden className='benroso-gold-line benroso-gold-line--left mt-3' />
                <InclusionSplit included={tour.inclusions} excluded={tour.exclusions} />
              </section>

              {!isMountainLayout && tour.accommodations.length ? (
                <div className='mt-12 border-t border-[var(--benroso-line)] pt-10'>
                  <RouteAccommodationsSection accommodations={tour.accommodations} />
                </div>
              ) : null}

              <TourFaqSection faqs={tour.faqs} />
            </article>

            <aside className='hidden h-fit space-y-4 lg:block lg:sticky lg:top-[calc(var(--benroso-header-h)+5.25rem)]'>
              <TourInquiryPanel
                days={tour.days}
                locale={locale}
                nights={tour.nights}
                price={price}
                tourSlug={tour.slug}
                tourTitle={displayTitle}
              />
              <div className='benroso-contact-advantages-block'>
                <h3 className='benroso-contact-sidebar-heading benroso-contact-sidebar-heading--sm'>
                  Trip Facts
                </h3>
                <div className='benroso-contact-credentials-box'>
                  <dl className='space-y-3 text-sm'>
                    {tour.startLocation ? (
                      <FactRow label='Starts in' value={tour.startLocation} />
                    ) : null}
                    {tour.endLocation ? <FactRow label='Ends in' value={tour.endLocation} /> : null}
                    {tour.destinationLabels?.length ? (
                      <FactRow label='Destinations' value={tour.destinationLabels.join(', ')} />
                    ) : null}
                    {tour.parkLabels?.length ? (
                      <FactRow label='Parks' value={tour.parkLabels.join(', ')} />
                    ) : null}
                    {tour.countryLabels?.length ? (
                      <FactRow label='Country' value={tour.countryLabels.join(', ')} />
                    ) : null}
                    {tour.experienceLabels?.length ? (
                      <FactRow label='Experience' value={tour.experienceLabels.join(', ')} />
                    ) : null}
                  </dl>
                </div>
              </div>
              <ContactScrollReveal>
                <div className='benroso-contact-advantages-block'>
                  <h3 className='benroso-contact-sidebar-heading benroso-contact-sidebar-heading--sm'>
                    Advantages of Booking with Benroso Safaris
                  </h3>
                  <div className='benroso-contact-credentials-box'>
                    <ContactAdvantagesList />
                  </div>
                </div>
              </ContactScrollReveal>
            </aside>
          </div>
        </div>
      </section>

      {similarTours.length ? (
        <DestinationTripsSection
          description={`Other published safaris that visit ${primaryDestination ?? 'the same destination'}. Compare duration, route, and price before you enquire.`}
          destinationName={primaryDestination ?? 'this destination'}
          eyebrow='More Safaris'
          id='similar-tours'
          locale={locale}
          title={`Similar Safaris to ${primaryDestination ?? 'this destination'}`}
          tours={similarTours}
          variant='plain'
        />
      ) : null}
    </>
  );
}

function buildRouteStops(tour: PublicTourDetail): RouteStop[] {
  const stops: RouteStop[] = [];
  const seen = new Set<string>();

  function add(label: string, value: string | null | undefined) {
    const clean = value?.trim();
    if (!clean) return;
    const key = clean.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    stops.push({ label, value: clean });
  }

  add('Start', tour.startLocation);
  for (const destination of tour.destinationLabels ?? []) {
    add('Destination', destination);
  }
  if (stops.length <= 1) {
    for (const day of tour.itineraryDays.slice(0, 4)) {
      add(`Day ${day.day}`, day.title);
    }
  }
  add('End', tour.endLocation);

  return stops;
}

function buildRouteLegsFromItinerary(days: PublicTourDetail['itineraryDays']) {
  return days.flatMap((day) => {
    const [from, ...rest] = day.title.split(/\s+to\s+/i);
    const to = rest
      .join(' to ')
      .replace(/\s+[—-].*$/, '')
      .trim();
    return from?.trim() && to ? [{ from: from.trim(), to }] : [];
  });
}

function buildTourClassification(tour: PublicTourDetail) {
  const countryName = tour.countryLabels?.[0] ?? null;
  const country = countryName ? `${countryName} Safaris` : null;
  const park = tour.parkLabels?.[0] ?? null;
  const destination = tour.destinationLabels?.[0] ?? null;
  const experience = tour.experienceLabels?.[0] ?? null;

  return [country, park, destination, experience].filter(Boolean).slice(0, 2).join(' | ');
}

function TourHero({
  classificationLabel,
  duration,
  eyebrow,
  imageAlt,
  imageUrl,
  locale,
  parent,
  price,
  routeLabel,
  title
}: {
  classificationLabel: string;
  duration: string;
  eyebrow?: string;
  imageAlt?: string | null;
  imageUrl: string | null;
  locale: string;
  parent: { href: string; label: string };
  price: string | null;
  routeLabel: string;
  title: string;
}) {
  return (
    <section className='relative isolate min-h-[500px] overflow-hidden bg-[var(--benroso-primary-dark)] text-white md:min-h-[560px]'>
      {imageUrl ? (
        <Image
          alt={imageAlt ?? title}
          className='absolute inset-0 -z-20 h-full w-full object-cover'
          fill
          priority
          sizes='100vw'
          src={imageUrl}
        />
      ) : null}
      <div className='absolute inset-0 -z-10 bg-black/60' />
      <div className='absolute inset-0 -z-10 bg-black/20' />

      <div className='benroso-container flex min-h-[500px] items-center justify-center py-16 text-center md:min-h-[560px] md:py-20'>
        <div className='mx-auto w-full max-w-5xl'>
          <nav
            aria-label='Breadcrumb'
            className='flex flex-wrap items-center justify-center gap-2 text-sm font-bold text-white/80'
          >
            <Link className='transition hover:text-white' href={localePath(locale, '/')}>
              Home
            </Link>
            <Icons.chevronRight className='h-4 w-4 text-white/55' />
            <Link className='transition hover:text-white' href={parent.href}>
              {parent.label}
            </Link>
          </nav>
          {classificationLabel || eyebrow ? (
            <p className='mt-7 text-sm font-semibold text-white/85'>
              {classificationLabel || eyebrow}
            </p>
          ) : null}
          <h1 className='mx-auto mt-5 max-w-5xl font-display text-[clamp(2.6rem,5.8vw,5.25rem)] font-bold leading-[1.02] text-white'>
            {title}
          </h1>
          <span aria-hidden className='benroso-gold-line mx-auto mt-5' />
          <div className='mx-auto mt-8 grid max-w-4xl overflow-hidden rounded-[var(--benroso-radius)] border border-white/25 bg-black/20 text-left backdrop-blur-sm md:grid-cols-3'>
            <HeroFact
              icon={<Icons.mapPin className='h-5 w-5' />}
              label={routeLabel || 'Route details on request'}
            />
            <HeroFact icon={<Icons.calendar className='h-5 w-5' />} label={duration} />
            <HeroFact
              icon={<Icons.teams className='h-5 w-5' />}
              label={price ? `From ${price} / Per Person` : 'Custom quote available'}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroFact({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className='flex items-center gap-3 border-b border-white/20 px-4 py-3 text-sm font-bold text-white md:border-b-0 md:border-r md:last:border-r-0'>
      <span className='shrink-0 text-[var(--benroso-lime)] [&_svg]:text-[var(--benroso-lime)]'>
        {icon}
      </span>
      <span>{label}</span>
    </div>
  );
}

function RouteMapPanel({
  endLocation,
  routeLegs,
  routeLabel,
  startLocation,
  stops
}: {
  endLocation?: string | null;
  routeLegs: PublicTourDetail['routeLegs'];
  routeLabel: string;
  startLocation?: string | null;
  stops: RouteStop[];
}) {
  if (!stops.length) {
    return (
      <div className='mt-6 flex min-h-[340px] items-center justify-center border border-dashed border-[var(--benroso-line)] bg-[var(--benroso-ivory)] p-6 text-center'>
        <div>
          <Icons.mapPin className='mx-auto h-8 w-8 text-[var(--benroso-primary)]' />
          <h3 className='benroso-heading mt-3 font-display text-xl'>Route Preview Pending</h3>
          <p className='benroso-body mt-2 text-sm leading-6'>
            Add start, destination, itinerary, and end details in the portal to generate this map.
          </p>
        </div>
      </div>
    );
  }

  const directionPoints = routeLegs.length
    ? [routeLegs[0].from, ...routeLegs.map((leg) => leg.to)]
    : [startLocation, endLocation].filter((point): point is string => Boolean(point));
  const mapQuery =
    directionPoints.length >= 2 ? directionPoints.join(' to ') : routeLabel || stops[0]?.value;
  const mapSrc =
    directionPoints.length >= 2
      ? `https://maps.google.com/maps?saddr=${encodeURIComponent(directionPoints[0])}&daddr=${encodeURIComponent(directionPoints.slice(1).join(' to '))}&output=embed`
      : `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`;

  return (
    <div className='mt-6 space-y-5'>
      <div className='flex flex-wrap items-center gap-x-3 gap-y-2 border border-[var(--benroso-line)] bg-white px-4 py-4 text-sm font-semibold text-[var(--benroso-ink)]'>
        <Icons.mapPin className='h-4 w-4 text-[var(--benroso-primary)]' />
        <span>{directionPoints[0] ?? startLocation ?? stops[0]?.value}</span>
        {directionPoints.slice(1).map((point, index) => (
          <span className='inline-flex items-center gap-3' key={`${point}-${index}`}>
            <Icons.chevronRight className='h-4 w-4 text-[var(--benroso-muted)]' />
            <span>{point}</span>
          </span>
        ))}
      </div>
      <div className='overflow-hidden border border-[var(--benroso-line)] bg-[var(--benroso-ivory)]'>
        <iframe
          className='h-[420px] w-full'
          loading='lazy'
          referrerPolicy='no-referrer-when-downgrade'
          sandbox='allow-forms allow-popups allow-scripts'
          src={mapSrc}
          title={routeLabel || 'Safari route map'}
        />
      </div>
    </div>
  );
}

function TourFaqSection({ faqs }: { faqs: PublicTourDetail['faqs'] }) {
  if (!faqs.length) return null;

  return (
    <section className='mt-12 scroll-mt-36' id='tour-faqs'>
      <h2 className='benroso-heading font-display text-[clamp(1.9rem,3vw,2.55rem)] leading-tight'>
        Trip FAQs
      </h2>

      <Accordion className='mt-7' collapsible type='single'>
        {faqs.map((faq, index) => (
          <AccordionItem
            className='border-[var(--benroso-line)]'
            key={`${faq.question}-${index}`}
            value={`tour-faq-${index}`}
          >
            <AccordionTrigger className='font-display text-base font-semibold text-[var(--benroso-heading)] hover:no-underline'>
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className='text-[15px] leading-7 text-[var(--benroso-muted)]'>
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}

function InclusionSplit({ excluded, included }: { excluded: string[]; included: string[] }) {
  return (
    <div className='mt-6 grid gap-4 md:grid-cols-2'>
      <InclusionColumn
        emptyText='Included details available on request.'
        icon='included'
        items={included}
        title='Included'
      />
      <InclusionColumn
        emptyText='Exclusions will be confirmed with your quote.'
        icon='excluded'
        items={excluded}
        title='Excluded'
      />
    </div>
  );
}

function InclusionColumn({
  emptyText,
  icon,
  items,
  title
}: {
  emptyText: string;
  icon: 'included' | 'excluded';
  items: string[];
  title: string;
}) {
  const isIncluded = icon === 'included';

  return (
    <div
      className={cn(
        'benroso-inclusion-panel',
        isIncluded ? 'benroso-inclusion-panel--included' : 'benroso-inclusion-panel--excluded'
      )}
    >
      <h3 className='benroso-inclusion-panel__title'>{title}</h3>
      {items.length ? (
        <ul className='benroso-inclusion-panel__list'>
          {items.map((item) => (
            <li className='benroso-inclusion-panel__item' key={item}>
              <span
                className={cn(
                  'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full',
                  isIncluded ? 'bg-[var(--benroso-lime)] text-white' : 'bg-[#9a7358] text-white'
                )}
              >
                {isIncluded ? (
                  <Icons.check className='h-3 w-3 stroke-[2.5]' />
                ) : (
                  <Icons.close className='h-3 w-3 stroke-[2.5]' />
                )}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className='benroso-inclusion-panel__empty'>{emptyText}</p>
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
