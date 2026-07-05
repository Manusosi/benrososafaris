import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';

import { Icons } from '@/components/icons';
import { AccommodationCard } from '@/components/public/accommodations/accommodation-card';
import { TourCard } from '@/components/public/cards/content-cards';
import { FaqSection } from '@/components/public/faq-section';
import { ParkScrollTabs } from '@/components/public/national-parks/park-scroll-tabs';
import { ParkWhenToGo } from '@/components/public/national-parks/park-when-to-go';
import { BenrosoButton } from '@/components/public/ui/benroso-button';
import { listPublishedAccommodations } from '@/features/accommodations/public/service';
import { getParkBySlug, getParkTours } from '@/lib/public/national-parks';
import { localePath } from '@/lib/public/locale-path';
import { absoluteUrl, buildAlternates, buildFaqJsonLd } from '@/lib/seo';
import { normalizeDirectAnswers } from '@/lib/seo/direct-answers';

type ParkPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata(props: ParkPageProps): Promise<Metadata> {
  const { locale, slug } = await props.params;
  const park = await getParkBySlug(locale, slug);
  if (!park) notFound();

  const canonical = absoluteUrl(`/${locale}/national-parks/${park.slug}`);
  const title = park.seoTitle || `${park.name} Safari Guide | Benroso Safaris`;
  const description = park.seoDescription || park.summary || '';

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: await buildAlternates({
        table: 'national_park_translations',
        parentId: park.id,
        parentKey: 'park_id',
        pathBuilder: (item) => `/${item.locale}/national-parks/${item.slug}`
      })
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
      images: park.ogImageUrl ? [{ url: park.ogImageUrl, alt: park.ogImageAlt || title }] : []
    }
  };
}

const SECTION_OFFSET = 'scroll-mt-[140px]';

export default async function NationalParkDetailPage(props: ParkPageProps) {
  const { locale, slug } = await props.params;
  const park = await getParkBySlug(locale, slug);
  if (!park) notFound();

  const [tours, accommodations] = await Promise.all([
    getParkTours(locale, park.id),
    park.country
      ? listPublishedAccommodations({ locale, countries: [park.country] })
      : Promise.resolve([])
  ]);
  const nearbyStays = accommodations.slice(0, 6);
  const faqs = normalizeDirectAnswers(park.faqs);
  const faqJsonLd = buildFaqJsonLd(faqs);

  const heroImage = park.ogImageUrl ?? park.gallery[0]?.url ?? null;
  const facts = [
    { label: 'Country', value: park.country },
    { label: 'Region', value: park.region },
    { label: 'Size', value: park.parkSizeKm2 ? `${park.parkSizeKm2.toLocaleString()} km²` : null },
    { label: 'Established', value: park.establishedYear ? String(park.establishedYear) : null }
  ].filter((fact) => fact.value);

  const tabs = [
    { id: 'why-visit', label: 'Why Visit' },
    { id: 'when-to-go', label: 'When to Go' },
    { id: 'safaris', label: 'Safaris' },
    { id: 'accommodation', label: 'Accommodation' }
  ];

  return (
    <main className='bg-white'>
      {faqJsonLd ? (
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      ) : null}

      {/* Hero */}
      <section className='relative isolate flex min-h-[clamp(360px,52vh,560px)] items-end overflow-hidden bg-[var(--benroso-primary-dark)] text-white'>
        {heroImage ? (
          <Image
            alt={park.ogImageAlt || park.name}
            className='object-cover'
            fill
            priority
            sizes='100vw'
            src={heroImage}
          />
        ) : null}
        <div
          aria-hidden
          className='absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/20'
        />
        <div className='benroso-container relative z-10 py-10 md:py-14'>
          <nav aria-label='Breadcrumb' className='mb-4 flex flex-wrap gap-2 text-sm text-white/75'>
            <a className='hover:text-white' href={localePath(locale)}>
              Home
            </a>
            <span>/</span>
            <a className='hover:text-white' href={localePath(locale, '/national-parks')}>
              National Parks
            </a>
            {park.parentDestination ? (
              <>
                <span>/</span>
                <a className='hover:text-white' href={park.parentDestination.href}>
                  {park.parentDestination.name}
                </a>
              </>
            ) : null}
            <span>/</span>
            <span className='text-white'>{park.name}</span>
          </nav>
          {park.parentDestination ? (
            <p className='mb-3 text-sm text-white/80'>
              Part of{' '}
              <a
                className='font-semibold text-white underline-offset-2 hover:underline'
                href={park.parentDestination.href}
              >
                {park.parentDestination.name}
              </a>
            </p>
          ) : null}
          <p className='text-xs font-bold uppercase tracking-[0.18em] text-[var(--benroso-lime)]'>
            National Park
          </p>
          <h1 className='mt-3 max-w-3xl font-display text-[clamp(2rem,5vw,3.5rem)] leading-[1.08]'>
            {park.name}
          </h1>
          {park.summary ? (
            <p className='mt-4 max-w-2xl text-lg leading-8 text-white/90'>{park.summary}</p>
          ) : null}
          {facts.length ? (
            <div className='mt-6 flex flex-wrap gap-2'>
              {facts.map((fact) => (
                <span
                  className='rounded-[5px] border border-white/25 bg-white/10 px-3 py-1.5 text-sm backdrop-blur'
                  key={fact.label}
                >
                  <span className='text-white/60'>{fact.label}:</span>{' '}
                  <span className='font-semibold'>{fact.value}</span>
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <ParkScrollTabs tabs={tabs} />

      {/* Why Visit */}
      <section className={`${SECTION_OFFSET} benroso-section bg-white`} id='why-visit'>
        <div className='benroso-container'>
          <p className='benroso-eyebrow'>Overview</p>
          <h2 className='benroso-heading mt-3 font-display text-[clamp(1.75rem,3.5vw,2.5rem)] leading-tight'>
            Why Visit {park.name}
          </h2>

          {park.descriptionHtml ? (
            <div
              className='benroso-legal-prose mt-6 max-w-3xl'
              dangerouslySetInnerHTML={{ __html: park.descriptionHtml }}
            />
          ) : park.summary ? (
            <p className='benroso-body mt-6 max-w-3xl text-base leading-8'>{park.summary}</p>
          ) : null}

          {park.wildlife.length ? (
            <div className='mt-10'>
              <h3 className='benroso-heading font-display text-xl'>Wildlife to spot</h3>
              <ul className='mt-4 flex flex-wrap gap-2'>
                {park.wildlife.map((animal) => (
                  <li
                    className='inline-flex items-center gap-1.5 rounded-[5px] border border-[var(--benroso-line)] bg-[var(--benroso-ivory)] px-3 py-1.5 text-sm text-[var(--benroso-ink)]'
                    key={animal}
                  >
                    <Icons.check className='size-3.5 text-[var(--benroso-primary)]' />
                    {animal}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {park.activities.length ? (
            <div className='mt-8'>
              <h3 className='benroso-heading font-display text-xl'>Things to do</h3>
              <ul className='mt-4 flex flex-wrap gap-2'>
                {park.activities.map((activity) => (
                  <li
                    className='inline-flex items-center gap-1.5 rounded-[5px] border border-[var(--benroso-line)] bg-white px-3 py-1.5 text-sm text-[var(--benroso-ink)]'
                    key={activity}
                  >
                    <Icons.compass className='size-3.5 text-[var(--benroso-primary)]' />
                    {activity}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {!park.descriptionHtml &&
          !park.summary &&
          !park.wildlife.length &&
          !park.activities.length ? (
            <p className='benroso-body mt-6 max-w-2xl text-base leading-8 text-[var(--benroso-muted)]'>
              An overview of {park.name} — wildlife, scenery and things to do — will appear here
              once it is added in the portal.
            </p>
          ) : null}
        </div>
      </section>

      {/* When to Go */}
      <section
        className={`${SECTION_OFFSET} benroso-section bg-[var(--benroso-ivory)]`}
        id='when-to-go'
      >
        <div className='benroso-container'>
          <p className='benroso-eyebrow'>When to Go</p>
          <h2 className='benroso-heading mt-3 font-display text-[clamp(1.75rem,3.5vw,2.5rem)] leading-tight'>
            The Best Time to Visit {park.name}
          </h2>
          <div className='mt-6'>
            <ParkWhenToGo bestTimeSummary={park.bestTimeSummary} parkName={park.name} />
          </div>
        </div>
      </section>

      {/* Safaris */}
      <section className={`${SECTION_OFFSET} benroso-section bg-white`} id='safaris'>
        <div className='benroso-container'>
          <div className='flex flex-wrap items-end justify-between gap-4'>
            <div>
              <p className='benroso-eyebrow'>Safaris</p>
              <h2 className='benroso-heading mt-3 font-display text-[clamp(1.75rem,3.5vw,2.5rem)] leading-tight'>
                Safaris That Visit {park.name}
              </h2>
            </div>
            {tours.length ? (
              <BenrosoButton
                href={localePath(locale, `/tours?park=${encodeURIComponent(park.slug)}`)}
                size='sm'
                variant='accent-outline'
              >
                Browse All Safaris
                <Icons.arrowRight className='h-3.5 w-3.5' />
              </BenrosoButton>
            ) : null}
          </div>
          {tours.length ? (
            <div className='mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3'>
              {tours.map((tour) => (
                <TourCard item={tour} key={tour.href} />
              ))}
            </div>
          ) : (
            <div className='mt-8 rounded-[var(--benroso-radius)] border border-dashed border-[var(--benroso-line)] bg-[var(--benroso-ivory)] px-8 py-14 text-center'>
              <h3 className='benroso-heading font-display text-2xl'>
                Safaris to {park.name} coming soon
              </h3>
              <p className='benroso-body mx-auto mt-3 max-w-xl'>
                We are building itineraries that include {park.name}. Our team can also craft a
                custom safari around this park for you.
              </p>
              <div className='mt-6'>
                <BenrosoButton href={localePath(locale, '/contact')}>
                  Plan a Custom Safari
                </BenrosoButton>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Accommodation */}
      <section
        className={`${SECTION_OFFSET} benroso-section bg-[var(--benroso-ivory)]`}
        id='accommodation'
      >
        <div className='benroso-container'>
          <p className='benroso-eyebrow'>Accommodation</p>
          <h2 className='benroso-heading mt-3 font-display text-[clamp(1.75rem,3.5vw,2.5rem)] leading-tight'>
            Where to Stay {park.country ? `in ${park.country}` : ''}
          </h2>
          {nearbyStays.length ? (
            <div className='mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3'>
              {nearbyStays.map((stay) => (
                <AccommodationCard item={stay} key={stay.id} />
              ))}
            </div>
          ) : (
            <div className='mt-8 rounded-[var(--benroso-radius)] border border-dashed border-[var(--benroso-line)] bg-white px-8 py-14 text-center'>
              <h3 className='benroso-heading font-display text-2xl'>
                Lodges &amp; camps coming soon
              </h3>
              <p className='benroso-body mx-auto mt-3 max-w-xl'>
                Hand-picked lodges and tented camps near {park.name} will appear here. Ask our team
                for current recommendations.
              </p>
              <div className='mt-6'>
                <BenrosoButton
                  href={localePath(locale, '/accommodations')}
                  variant='accent-outline'
                >
                  Browse Accommodations
                </BenrosoButton>
              </div>
            </div>
          )}
        </div>
      </section>

      {faqs.length ? <FaqSection faqs={faqs} headingId='national-park-faq-heading' /> : null}
    </main>
  );
}
