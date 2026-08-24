import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';

import { Icons } from '@/components/icons';
import { FaqSection } from '@/components/public/faq-section';
import { BenrosoButton } from '@/components/public/ui/benroso-button';
import { BenrosoButtonGroup } from '@/components/public/ui/benroso-button-group';
import { BENROSO_PUBLIC_HERO_IMAGES } from '@/config/benroso';
import { getFleetVehicleBySlug } from '@/lib/public/fleet';
import { localePath } from '@/lib/public/locale-path';
import { absoluteUrl, buildAlternates, buildFaqJsonLd } from '@/lib/seo';

type FleetVehiclePageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: FleetVehiclePageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const vehicle = await getFleetVehicleBySlug(locale, slug);
  if (!vehicle) notFound();

  const canonical = absoluteUrl(`/${locale}/our-fleet/${vehicle.slug}`);
  const title = vehicle.seoTitle || `${vehicle.title} | Safari Fleet | Benroso Safaris`;
  const description =
    vehicle.seoDescription ||
    vehicle.summary ||
    'Explore Benroso Safaris vehicle details, comfort features, and private safari support.';

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: await buildAlternates({
        table: 'fleet_vehicle_translations',
        parentId: vehicle.id,
        parentKey: 'vehicle_id',
        pathBuilder: (item) => `/${item.locale}/our-fleet/${item.slug}`
      })
    },
    openGraph: {
      title,
      description,
      images: vehicle.imageUrl ? [{ url: vehicle.imageUrl, alt: vehicle.imageAlt || title }] : [],
      type: 'website',
      url: canonical
    }
  };
}

export default async function FleetVehicleDetailPage({ params }: FleetVehiclePageProps) {
  const { locale, slug } = await params;
  const vehicle = await getFleetVehicleBySlug(locale, slug);
  if (!vehicle) notFound();

  const heroFallback = BENROSO_PUBLIC_HERO_IMAGES.fleet;
  const heroImage = vehicle.imageUrl ?? heroFallback.imageUrl;
  const heroAlt = vehicle.imageAlt ?? heroFallback.imageAlt;
  const faqJsonLd = buildFaqJsonLd(vehicle.faqs);
  const highlights = [
    vehicle.vehicleType ? { label: 'Vehicle type', value: vehicle.vehicleType } : null,
    vehicle.capacity ? { label: 'Capacity', value: `${vehicle.capacity} guests` } : null,
    vehicle.features.length
      ? { label: 'Features', value: `${vehicle.features.length} listed` }
      : null
  ].filter((item): item is { label: string; value: string } => Boolean(item));

  return (
    <main className='bg-white'>
      {faqJsonLd ? (
        <script
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
          type='application/ld+json'
        />
      ) : null}

      <section className='relative isolate flex min-h-[clamp(380px,54vh,580px)] items-center overflow-hidden bg-[var(--benroso-primary-dark)] text-white'>
        <Image alt={heroAlt} className='object-cover' fill priority sizes='100vw' src={heroImage} />
        <div aria-hidden className='absolute inset-0 bg-black/55' />
        <div
          aria-hidden
          className='absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent'
        />
        <div className='benroso-container relative z-10 py-12'>
          <nav
            aria-label='Breadcrumb'
            className='mb-8 flex flex-wrap items-center justify-center gap-x-3 text-sm font-semibold uppercase tracking-[0.14em] text-white/75'
          >
            <a className='transition-colors hover:text-white' href={localePath(locale)}>
              Home
            </a>
            <span aria-hidden className='text-white/50'>
              |
            </span>
            <a
              className='transition-colors hover:text-white'
              href={localePath(locale, '/our-fleet')}
            >
              Our Fleet
            </a>
          </nav>
          <div className='mx-auto max-w-3xl text-center'>
            <p className='text-xs font-bold uppercase tracking-[0.2em] text-[var(--benroso-lime)]'>
              {vehicle.vehicleType || 'Safari Vehicle'}
            </p>
            <h1 className='mt-4 font-display text-[clamp(2.35rem,5vw,4rem)] leading-[1.08] text-white'>
              {vehicle.title}
            </h1>
            <span aria-hidden className='benroso-gold-line mt-5' />
            {vehicle.summary ? (
              <p className='mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/88'>
                {vehicle.summary}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className='border-b border-[var(--benroso-line)] bg-white'>
        <div className='benroso-container py-8'>
          <div className='grid gap-4 md:grid-cols-3'>
            {highlights.length ? (
              highlights.map((item) => (
                <div
                  className='rounded-[var(--benroso-radius)] border border-[var(--benroso-line)] bg-[var(--benroso-ivory)] p-5'
                  key={item.label}
                >
                  <p className='text-xs font-bold uppercase tracking-[0.14em] text-[var(--benroso-muted)]'>
                    {item.label}
                  </p>
                  <p className='benroso-heading mt-2 font-display text-2xl'>{item.value}</p>
                </div>
              ))
            ) : (
              <div className='rounded-[var(--benroso-radius)] border border-[var(--benroso-line)] bg-[var(--benroso-ivory)] p-5 md:col-span-3'>
                <p className='benroso-body text-[var(--benroso-muted)]'>
                  Vehicle facts will appear here once capacity and feature details are added in the
                  portal.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className='benroso-section bg-white'>
        <div className='benroso-container grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start'>
          <article className='min-w-0'>
            <p className='benroso-eyebrow'>Fleet Detail</p>
            <h2 className='benroso-heading mt-3 font-display text-[clamp(1.9rem,3.5vw,2.75rem)] leading-tight'>
              Built for comfortable safari days
            </h2>

            {vehicle.descriptionHtml ? (
              <div
                className='benroso-legal-prose mt-7 max-w-3xl'
                dangerouslySetInnerHTML={{ __html: vehicle.descriptionHtml }}
              />
            ) : vehicle.summary ? (
              <p className='benroso-body mt-7 max-w-3xl text-base leading-8'>{vehicle.summary}</p>
            ) : (
              <p className='benroso-body mt-7 max-w-3xl text-base leading-8 text-[var(--benroso-muted)]'>
                Add a public description in the portal to describe this vehicle's comfort,
                photography setup, luggage space, and route suitability.
              </p>
            )}

            {vehicle.features.length ? (
              <div className='mt-10'>
                <h3 className='benroso-heading font-display text-2xl'>Vehicle Features</h3>
                <ul className='mt-5 grid gap-3 sm:grid-cols-2'>
                  {vehicle.features.map((feature) => (
                    <li
                      className='flex items-start gap-3 rounded-[var(--benroso-radius)] border border-[var(--benroso-line)] bg-[var(--benroso-ivory)] p-4 text-sm leading-6 text-[var(--benroso-ink)]'
                      key={feature}
                    >
                      <Icons.check className='mt-0.5 size-4 shrink-0 text-[var(--benroso-primary)]' />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {vehicle.gallery.length > 1 ? (
              <div className='mt-12'>
                <h3 className='benroso-heading font-display text-2xl'>Gallery</h3>
                <div className='mt-5 grid gap-4 sm:grid-cols-2'>
                  {vehicle.gallery.map((image) => (
                    <div
                      className='relative aspect-[4/3] overflow-hidden rounded-[var(--benroso-radius)] bg-[var(--benroso-primary)]'
                      key={image.id}
                    >
                      {image.url ? (
                        <Image
                          alt={image.alt || vehicle.title}
                          className='object-cover'
                          fill
                          sizes='(max-width: 768px) 100vw, 50vw'
                          src={image.url}
                        />
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </article>

          <aside className='sticky top-[calc(var(--benroso-topbar-h)+var(--benroso-header-h)+1rem)] rounded-[var(--benroso-radius)] border border-[var(--benroso-line)] bg-[var(--benroso-primary-dark)] p-6 text-white'>
            <p className='text-xs font-bold uppercase tracking-[0.16em] text-white/60'>
              Plan With This Vehicle
            </p>
            <h2 className='mt-3 font-display text-3xl leading-tight'>Ask for availability</h2>
            <p className='mt-4 text-sm leading-7 text-white/75'>
              Share your route, dates, group size, and comfort expectations. Our team will confirm
              the best vehicle match for the safari.
            </p>
            <BenrosoButtonGroup className='mt-6'>
              <BenrosoButton href={localePath(locale, '/contact')} variant='gold'>
                Enquire Now
              </BenrosoButton>
              <BenrosoButton
                className='border-white/35'
                href={localePath(locale, '/tours')}
                variant='gold-outline'
              >
                View Safari Tours
              </BenrosoButton>
            </BenrosoButtonGroup>
          </aside>
        </div>
      </section>

      {vehicle.faqs.length ? (
        <FaqSection faqs={vehicle.faqs} headingId='fleet-faq-heading' title='Fleet questions' />
      ) : null}
    </main>
  );
}
