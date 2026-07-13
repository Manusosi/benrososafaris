import Image from 'next/image';
import Link from 'next/link';

import { Icons } from '@/components/icons';
import { ExperienceDetailHero } from '@/components/public/experiences/experience-detail-hero';
import { ExperienceFaqSection } from '@/components/public/experiences/experience-faq-section';
import { ExperienceGallery } from '@/components/public/experiences/experience-gallery';
import { ExperienceScrollReveal } from '@/components/public/experiences/experience-scroll-reveal';
import { ExperienceTripsExplorer } from '@/components/public/experiences/experience-trips-explorer';
import { SectionAnchorNav } from '@/components/public/section-anchor-nav';
import { SectionHeader } from '@/components/public/ui/section-header';
import { BenrosoButton } from '@/components/public/ui/benroso-button';
import { BenrosoButtonGroup } from '@/components/public/ui/benroso-button-group';
import { localePath } from '@/lib/public/locale-path';
import { buildExperienceGuideHeading } from '@/features/experiences/public/guide-heading';
import { isMountainExperienceLayout } from '@/features/experiences/public/layout-variant';
import type {
  PublicExperienceDetail,
  PublicExperienceRelatedAccommodation,
  PublicExperienceRelatedTour
} from '@/features/experiences/public/types';

type ExperienceDetailShellProps = {
  accommodations: PublicExperienceRelatedAccommodation[];
  experience: PublicExperienceDetail;
  locale: string;
  tours: PublicExperienceRelatedTour[];
};

const EXPERIENCE_HEADING_SUFFIX = /\s+(Safari(s)?|Experience)$/i;

function stripExperienceHeadingSuffix(value: string) {
  return value.replace(EXPERIENCE_HEADING_SUFFIX, '').trim();
}

function formatExperienceTourHeading(category: string | null, title: string) {
  const trimmedTitle = title.trim();
  const trimmedCategory = category?.trim() ?? '';

  const source =
    trimmedTitle && EXPERIENCE_HEADING_SUFFIX.test(trimmedTitle)
      ? trimmedTitle
      : trimmedCategory || trimmedTitle;

  const label = stripExperienceHeadingSuffix(source);
  if (!label) return 'Safaris For This Experience';
  return `Our Best ${label} Safaris`;
}

function formatMountainTripsHeading(title: string) {
  const trimmed = stripExperienceHeadingSuffix(title)
    .replace(/\s+Routes$/i, '')
    .trim();
  return trimmed ? `${trimmed} Routes` : 'Climbing Routes';
}

export function ExperienceDetailShell({
  accommodations,
  experience,
  locale,
  tours
}: ExperienceDetailShellProps) {
  const galleryImages = experience.gallery.filter((image) => image.url);
  const isMountainLayout = isMountainExperienceLayout(experience);
  const guideHeading = buildExperienceGuideHeading({
    category: experience.category,
    countries: experience.countries,
    title: experience.title
  });
  const anchorItems = [
    { href: '#experience-overview', label: 'Overview' },
    experience.highlights.length ? { href: '#experience-expect', label: 'What To Expect' } : null,
    {
      href: '#experience-trips',
      label: isMountainLayout ? 'Routes' : 'Safaris'
    },
    accommodations.length ? { href: '#experience-lodges', label: 'Lodges' } : null,
    experience.faqs.length ? { href: '#experience-faqs', label: 'FAQs' } : null
  ].filter((item): item is { href: string; label: string } => item !== null);

  return (
    <>
      <ExperienceDetailHero
        countries={experience.countries}
        imageAlt={experience.imageAlt}
        imageUrl={experience.imageUrl}
        locale={locale}
        summary={experience.summary}
        title={experience.title}
      />

      <SectionAnchorNav items={anchorItems} />

      <main className='bg-white'>
        <ExperienceScrollReveal
          className='benroso-section scroll-mt-36 bg-white'
          id='experience-overview'
        >
          <div className='benroso-container'>
            <section className='mx-auto max-w-4xl text-center'>
              <p className='benroso-eyebrow'>Experience Guide</p>
              <h2 className='benroso-heading mt-3 font-display text-[clamp(2rem,4vw,3.2rem)] leading-tight'>
                {guideHeading}
              </h2>
              {experience.contentHtml ? (
                <article
                  className='benroso-legal-prose mx-auto mt-8 max-w-3xl text-left'
                  dangerouslySetInnerHTML={{ __html: experience.contentHtml }}
                />
              ) : null}
            </section>

            {galleryImages.length ? (
              <div className='mt-12'>
                <ExperienceGallery images={galleryImages} title={experience.title} />
              </div>
            ) : null}

            {experience.highlights.length ? (
              <section className='mx-auto mt-14 max-w-5xl scroll-mt-36' id='experience-expect'>
                <div className='mx-auto max-w-2xl text-center'>
                  <p className='benroso-eyebrow'>What To Expect</p>
                  <h2 className='benroso-heading mt-3 font-display text-3xl leading-tight'>
                    The Experience At a Glance
                  </h2>
                </div>
                <div className='mt-8 grid gap-x-10 gap-y-0 md:grid-cols-2'>
                  {experience.highlights.map((item, index) => (
                    <div
                      className='grid grid-cols-[56px_1fr] gap-4 border-t border-[var(--benroso-line)] py-5'
                      key={item}
                    >
                      <span className='font-display text-3xl text-[var(--benroso-gold)]'>
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <p className='text-[15px] leading-7 text-[var(--benroso-ink)]'>{item}</p>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        </ExperienceScrollReveal>

        <ExperienceScrollReveal
          className='benroso-section scroll-mt-36 border-y border-[var(--benroso-line)] bg-white'
          id='experience-trips'
          stagger
        >
          <ExperienceTripsExplorer
            description={
              isMountainLayout
                ? 'Each route is a published climbing itinerary. Open a route for the full day-by-day trek, camping or hut prices, and what is included.'
                : `Under ${experience.title}, we curate safaris that let guests experience this travel style in different ways. Compare the routes below by duration and park area, then open a trip for pricing and the full itinerary.`
            }
            hideFilters={isMountainLayout}
            itemLabel={isMountainLayout ? 'route' : 'safari'}
            locale={locale}
            showAll={isMountainLayout}
            title={
              isMountainLayout
                ? formatMountainTripsHeading(experience.title)
                : formatExperienceTourHeading(experience.category, experience.title)
            }
            tours={tours}
          />
        </ExperienceScrollReveal>

        {accommodations.length ? (
          <ExperienceScrollReveal
            className='benroso-section scroll-mt-36 bg-white'
            id='experience-lodges'
            stagger
          >
            <div className='benroso-container'>
              <SectionHeader
                align='left'
                description='Lodges and camps featured on linked safari routes. Each stay is chosen for location, comfort, and access to the wildlife areas that define this experience.'
                eyebrow='Where To Stay'
                title='Recommended Safari Lodges'
              />
              <div className='mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
                {accommodations.map((accommodation) => (
                  <article
                    className='flex h-full flex-col overflow-hidden rounded-[var(--benroso-radius)] border border-[var(--benroso-line)] bg-white'
                    data-reveal-item
                    key={accommodation.id}
                  >
                    <Link
                      className='group relative block aspect-[4/3] overflow-hidden bg-[var(--benroso-primary)]'
                      href={accommodation.href}
                    >
                      {accommodation.imageUrl ? (
                        <Image
                          alt={accommodation.imageAlt || accommodation.name}
                          className='object-cover transition-transform duration-500 group-hover:scale-105'
                          fill
                          sizes='(max-width:768px) 100vw, 33vw'
                          src={accommodation.imageUrl}
                        />
                      ) : (
                        <div className='absolute inset-0 bg-[var(--benroso-primary-light)]' />
                      )}
                    </Link>
                    <div className='flex flex-1 flex-col p-5'>
                      {accommodation.locationLabel ? (
                        <p className='text-xs font-bold uppercase tracking-wide text-[var(--benroso-gold)]'>
                          {accommodation.locationLabel}
                        </p>
                      ) : null}
                      <h3 className='benroso-heading mt-2 font-display text-xl leading-tight'>
                        <Link
                          className='transition-colors hover:text-[var(--benroso-primary)]'
                          href={accommodation.href}
                        >
                          {accommodation.name}
                        </Link>
                      </h3>
                      {accommodation.summary ? (
                        <p className='benroso-body mt-3 line-clamp-3 flex-1 text-[15px] leading-7'>
                          {accommodation.summary}
                        </p>
                      ) : null}
                      <div className='mt-5 border-t border-[var(--benroso-line)] pt-4'>
                        <Link
                          className='inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-[var(--benroso-primary)] transition-colors hover:text-[var(--benroso-gold)]'
                          href={accommodation.href}
                        >
                          View Lodge
                          <Icons.arrowRight className='h-3.5 w-3.5' />
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </ExperienceScrollReveal>
        ) : null}

        <ExperienceScrollReveal
          className='relative isolate bg-cover bg-center'
          styleImage={experience.imageUrl}
        >
          <div aria-hidden className='absolute inset-0 bg-black/55' />
          <div className='benroso-container benroso-section relative flex justify-center'>
            <div className='w-full max-w-xl rounded-[var(--benroso-radius)] bg-white p-8 text-center shadow-2xl md:p-10'>
              <p className='benroso-eyebrow'>Plan With Benroso Safaris</p>
              <h2 className='benroso-heading mt-3 font-display text-3xl leading-tight'>
                Ready to start planning?
              </h2>
              <p className='benroso-body mx-auto mt-3 max-w-md'>
                {isMountainLayout
                  ? 'Tell us your preferred route, month, and group size. We will confirm camping or hut arrangements and guide support.'
                  : 'Tell us your month, group size, and comfort level. We will match the right safari route and prepare a quote for your trip.'}
              </p>
              <BenrosoButtonGroup align='center' className='mt-7'>
                <BenrosoButton href={localePath(locale, '/contact')}>
                  {isMountainLayout ? 'Plan My Climb' : 'Plan My Safari'}
                </BenrosoButton>
                <BenrosoButton href={localePath(locale, '/experiences')} variant='accent-outline'>
                  All Experiences
                </BenrosoButton>
              </BenrosoButtonGroup>
            </div>
          </div>
        </ExperienceScrollReveal>

        <div id='experience-faqs'>
          <ExperienceFaqSection faqs={experience.faqs} />
        </div>
      </main>
    </>
  );
}
