import { Icons } from '@/components/icons';
import { AccommodationGallery } from '@/components/public/accommodations/accommodation-gallery';
import { DestinationInquiryPanel } from '@/components/public/destinations/destination-inquiry-panel';
import { TrustedChecklist } from '@/components/public/home/home-trusted-checklist';
import { localePath } from '@/lib/public/locale-path';
import type { PublicDestinationDetail } from '@/lib/public/types';

type DestinationDetailShellProps = {
  destination: PublicDestinationDetail;
  locale: string;
};

export function DestinationDetailShell({ destination, locale }: DestinationDetailShellProps) {
  const galleryImages = destination.gallery.length
    ? destination.gallery
    : destination.imageUrl
      ? [{ id: 'og', url: destination.imageUrl, alt: destination.imageAlt }]
      : [];

  const locationLabel = [destination.region, destination.country].filter(Boolean).join(', ');

  const facts = [
    { label: 'Country', value: destination.country },
    { label: 'Region / circuit', value: destination.region },
    { label: 'Best time to visit', value: destination.bestTime }
  ].filter((fact) => fact.value);

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
              href={localePath(locale, '/destinations')}
            >
              Destinations
            </a>
            <span>/</span>
            <span className='text-[var(--benroso-ink)]'>{destination.name}</span>
          </nav>

          <div className='grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10'>
            <div>
              <AccommodationGallery images={galleryImages} title={destination.name} />

              <div className='mt-6 flex flex-wrap gap-2'>
                {destination.country ? (
                  <span className='rounded-[var(--benroso-radius)] bg-[var(--benroso-primary)] px-3 py-1 text-xs font-bold uppercase tracking-wide text-white'>
                    {destination.country}
                  </span>
                ) : null}
                {destination.region ? (
                  <span className='rounded-[var(--benroso-radius)] border border-[var(--benroso-line)] bg-white px-3 py-1 text-xs font-bold uppercase tracking-wide text-[var(--benroso-ink)]'>
                    {destination.region}
                  </span>
                ) : null}
              </div>

              <p className='benroso-eyebrow mt-5'>Destination Guide</p>
              <h1 className='benroso-heading mt-2 font-display text-[clamp(2rem,4vw,3rem)] leading-tight'>
                {destination.name}
              </h1>
              {locationLabel ? (
                <p className='mt-2 flex items-center gap-2 text-base text-[var(--benroso-muted)]'>
                  <Icons.mapPin className='size-4 shrink-0 text-[var(--benroso-primary)]' />
                  {locationLabel}
                </p>
              ) : null}

              {destination.summary ? (
                <p className='mt-5 text-lg leading-8 text-[var(--benroso-muted)]'>
                  {destination.summary}
                </p>
              ) : null}

              {/* Inquiry panel inline on mobile, sidebar on desktop. */}
              <div className='mt-10 lg:hidden'>
                <DestinationInquiryPanel
                  country={destination.country}
                  destinationName={destination.name}
                  destinationSlug={destination.slug}
                  locale={locale}
                />
              </div>

              {destination.descriptionHtml ? (
                <section className='mt-10 scroll-mt-36' id='why-go'>
                  <h2 className='benroso-heading font-display text-2xl'>
                    About {destination.name}
                  </h2>
                  <div
                    className='benroso-legal-prose mt-4'
                    dangerouslySetInnerHTML={{ __html: destination.descriptionHtml }}
                  />
                </section>
              ) : null}

              {destination.bestTime ? (
                <section className='mt-10 scroll-mt-36' id='when-to-go'>
                  <h2 className='benroso-heading font-display text-2xl'>Best time to visit</h2>
                  <p className='benroso-body mt-4 inline-flex items-center gap-2 text-[15px] leading-7'>
                    <Icons.calendar className='size-5 shrink-0 text-[var(--benroso-primary)]' />
                    {destination.bestTime}
                  </p>
                </section>
              ) : null}

              {destination.wildlife.length ? (
                <section className='mt-10 scroll-mt-36' id='where-to-go'>
                  <h2 className='benroso-heading font-display text-2xl'>
                    Key {destination.name} Highlights
                  </h2>
                  {/* Light whiteboard-style panel; highlights flow in two columns. */}
                  <div
                    className='mt-4 rounded-[var(--benroso-radius)] border border-[var(--benroso-line)] bg-[var(--benroso-ivory)] p-6 md:p-8'
                    style={{
                      backgroundImage:
                        'radial-gradient(rgba(60,81,66,0.06) 1.5px, transparent 1.6px)',
                      backgroundSize: '24px 24px'
                    }}
                  >
                    <TrustedChecklist
                      items={destination.wildlife}
                      className='grid gap-x-10 gap-y-3.5 sm:grid-cols-2'
                    />
                  </div>
                </section>
              ) : null}

              <div className='mt-10'>
                <a
                  className='inline-flex items-center gap-2 text-sm font-semibold text-[var(--benroso-primary)] transition-colors hover:text-[var(--benroso-lime)]'
                  href={localePath(locale, '/destinations')}
                >
                  <Icons.chevronLeft className='size-4' />
                  Back to all destinations
                </a>
              </div>
            </div>

            <aside className='hidden lg:block'>
              <div className='sticky top-[calc(var(--benroso-topbar-h)+var(--benroso-header-h)+1rem)] space-y-4'>
                <DestinationInquiryPanel
                  country={destination.country}
                  destinationName={destination.name}
                  destinationSlug={destination.slug}
                  locale={locale}
                />
                {facts.length ? (
                  <div className='rounded-[var(--benroso-radius)] border border-[var(--benroso-line)] bg-white p-6 shadow-sm'>
                    <h2 className='benroso-heading font-display text-lg'>Quick facts</h2>
                    <dl className='mt-4 space-y-3'>
                      {facts.map((fact) => (
                        <div
                          className='flex items-start justify-between gap-3 border-b border-[var(--benroso-line)] pb-3 last:border-b-0 last:pb-0'
                          key={fact.label}
                        >
                          <dt className='text-sm text-[var(--benroso-muted)]'>{fact.label}</dt>
                          <dd className='text-right text-sm font-semibold text-[var(--benroso-ink)]'>
                            {fact.value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                ) : null}
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
