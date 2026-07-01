'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

import { Icons } from '@/components/icons';
import { ContourBackground } from '@/components/public/contour-background';
import { TourCard } from '@/components/public/cards/content-cards';
import { BenrosoButton } from '@/components/public/ui/benroso-button';
import { ScrollReveal } from '@/components/public/ui/scroll-reveal';
import { SectionHeader } from '@/components/public/ui/section-header';
import { TrustedChecklist } from '@/components/public/home/home-trusted-checklist';
import { Slider } from '@/components/public/ui/slider';
import { localePath } from '@/lib/public/locale-path';
import { youtubeVideoId } from '@/lib/public/page-heroes';
import type { HeroSlide, PageHero, PublicSiteSettings, PublicTour } from '@/lib/public/types';

const HERO_FALLBACK_SLIDES: HeroSlide[] = [
  {
    mediaType: 'image',
    mediaUrl: '/assets/great%20migration%20of%20wildebeasts%20in%20across%20mara%20river.jpg',
    alt: 'Wildebeest crossing the Mara River during the Great Migration',
    heading: null,
    subheading: null,
    posterUrl: null,
    isActive: true,
    sortOrder: 0
  },
  {
    mediaType: 'image',
    mediaUrl: '/assets/Masai-Mara-Hot-Air-Balloon-Safari-with-Champagne-Breakfast.jpg',
    alt: 'Hot air balloon safari over the Maasai Mara at sunrise',
    heading: null,
    subheading: null,
    posterUrl: null,
    isActive: true,
    sortOrder: 1
  },
  {
    mediaType: 'image',
    mediaUrl: '/assets/Elephant-in-Amboseli-National-Park-2.jpeg',
    alt: 'Elephants walking across Amboseli National Park with Mount Kilimanjaro behind',
    heading: null,
    subheading: null,
    posterUrl: null,
    isActive: true,
    sortOrder: 2
  },
  {
    mediaType: 'image',
    mediaUrl: '/assets/Saruni-Basecamp-The-Great-Migration-river-crossing.jpg',
    alt: 'Safari guests watching a river crossing during the Great Migration',
    heading: null,
    subheading: null,
    posterUrl: null,
    isActive: true,
    sortOrder: 3
  }
];

const HERO_SLIDE_INTERVAL = 6500;

export function HomeHero({
  locale,
  hero,
  slides
}: {
  locale: string;
  hero?: PageHero | null;
  slides?: HeroSlide[];
}) {
  const contactHref = localePath(locale, '/contact');
  const toursHref = localePath(locale, '/tours');

  const configuredSlides = hero?.slides ?? slides;
  const heroSlides =
    configuredSlides && configuredSlides.length > 0 ? configuredSlides : HERO_FALLBACK_SLIDES;
  const videoId = hero?.type === 'youtube' ? youtubeVideoId(hero.youtubeUrl) : null;

  const eyebrow = hero?.eyebrow ?? 'Welcome to Benroso Safaris';
  const heading = hero?.heading ?? 'Unforgettable East African Safaris, Crafted Around You';
  const subheading =
    hero?.subheading ??
    'For twenty-five years we have guided travelers across Kenya, Tanzania, Uganda, and Rwanda — every itinerary built by people who know these parks firsthand, not from a brochure. Tell us how you like to travel, and we will take care of the rest.';
  const primaryCtaLabel = hero?.ctaLabel ?? 'Plan My Safari';
  const primaryCtaHref = hero?.ctaHref ? localePath(locale, hero.ctaHref) : contactHref;

  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    if (videoId) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || heroSlides.length <= 1) return;

    const interval = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, HERO_SLIDE_INTERVAL);

    return () => window.clearInterval(interval);
  }, [heroSlides.length, videoId]);

  return (
    <section className='relative min-h-[min(92vh,960px)] overflow-hidden bg-[var(--benroso-primary-dark)] text-white'>
      {videoId ? (
        <>
          {/* Poster fallback under the iframe for first paint / reduced motion */}
          {heroSlides[0]?.mediaUrl ? (
            <Image
              alt={heroSlides[0].alt ?? 'Benroso Safaris'}
              className='object-cover'
              fill
              priority
              sizes='100vw'
              src={heroSlides[0].mediaUrl}
            />
          ) : null}
          <iframe
            allow='autoplay; encrypted-media'
            aria-hidden
            className='pointer-events-none absolute left-1/2 top-1/2 h-[56.25vw] min-h-full w-[177.78vh] min-w-full -translate-x-1/2 -translate-y-1/2'
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&playsinline=1&rel=0&modestbranding=1&showinfo=0`}
            title='Background video'
          />
        </>
      ) : (
        heroSlides.map((slide, index) => (
          <div
            aria-hidden={index !== activeSlide}
            className='absolute inset-0 transition-opacity duration-1000'
            key={`${slide.mediaUrl}-${index}`}
            style={{ opacity: index === activeSlide ? 1 : 0 }}
          >
            {slide.mediaType === 'video' ? (
              <video
                autoPlay
                className='h-full w-full object-cover'
                loop
                muted
                playsInline
                poster={slide.posterUrl ?? undefined}
              >
                <source src={slide.mediaUrl} />
              </video>
            ) : (
              <Image
                alt={slide.alt ?? 'Benroso Safaris'}
                className='object-cover'
                fill
                priority={index === 0}
                sizes='100vw'
                src={slide.mediaUrl}
              />
            )}
          </div>
        ))
      )}
      <div
        aria-hidden
        className='absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30'
      />
      <div
        aria-hidden
        className='absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent'
      />

      <div className='relative z-10 flex min-h-[min(92vh,960px)] flex-col justify-between'>
        <div className='flex flex-1 items-center'>
          <div className='benroso-container py-20'>
            <p className='text-xs font-bold uppercase tracking-[0.18em] text-[var(--benroso-gold)]'>
              {eyebrow}
            </p>
            <h1 className='mt-4 max-w-3xl font-display text-[clamp(2.25rem,5vw,3.75rem)] leading-[1.05] text-white'>
              {heading}
            </h1>
            <p className='mt-6 max-w-2xl text-lg leading-8 text-white/90'>{subheading}</p>
            <div className='mt-8 flex flex-wrap gap-4'>
              <BenrosoButton
                className='border-[var(--benroso-lime)] bg-[var(--benroso-lime)] text-white [--benroso-fill:var(--benroso-primary)]'
                href={primaryCtaHref}
                variant='accent'
              >
                <Icons.compass className='h-4 w-4' />
                {primaryCtaLabel}
              </BenrosoButton>
              <BenrosoButton href={toursHref} variant='gold-outline'>
                View Safari Tours
                <Icons.arrowRight className='h-4 w-4' />
              </BenrosoButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const WHY_CHOOSE_IMAGES = [
  {
    imageUrl: '/assets/benroso-safaris-kenya.webp',
    imageAlt: 'Benroso Safaris vehicle on the plains of Kenya'
  },
  {
    imageUrl: '/assets/Elephant-in-Amboseli-National-Park-2.jpeg',
    imageAlt: 'Elephants in Amboseli National Park beneath Mount Kilimanjaro'
  },
  {
    imageUrl: '/assets/Masai-Mara-Hot-Air-Balloon-Safari-with-Champagne-Breakfast.jpg',
    imageAlt: 'Hot air balloon safari over the Maasai Mara'
  }
];

export function HomeWhyChooseUs({ locale }: { locale: string }) {
  const trustPoints = [
    'Registered, licensed, and KATO bonded, with KPSGA certified driver-guides.',
    'Custom itineraries built around your dates, interests, and comfort level.',
    'A modern, well-maintained private safari fleet you travel in start to finish.',
    'Responsive support before, during, and after your trip, every single day.'
  ];

  return (
    <section className='border-b border-[var(--benroso-line)] bg-white' id='why-choose-us'>
      <div className='benroso-container py-16 md:py-20'>
        <div className='grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-14'>
          <ScrollReveal className='relative' from='left'>
            <Slider autoPlayMs={5000} showArrows={false}>
              {WHY_CHOOSE_IMAGES.map((image) => (
                <div
                  className='relative aspect-[4/3] overflow-hidden rounded-[var(--benroso-radius)] bg-[var(--benroso-primary)]'
                  key={image.imageUrl}
                >
                  <Image
                    alt={image.imageAlt}
                    className='object-cover'
                    fill
                    sizes='(max-width:1024px) 100vw, 50vw'
                    src={image.imageUrl}
                  />
                </div>
              ))}
            </Slider>
          </ScrollReveal>

          <ScrollReveal from='right'>
            <p className='benroso-eyebrow'>Why Choose Benroso Safaris</p>
            <h2 className='benroso-heading mt-3 font-display text-[clamp(1.875rem,4vw,3rem)] leading-[1.1]'>
              Trusted East Africa Safari Experts Since 2000
            </h2>
            <span className='benroso-gold-line benroso-gold-line--left' />
            <p className='benroso-body mt-6 text-base leading-8'>
              From the Great Migration to gorilla trekking and the Cape, every itinerary is designed
              by a team that has spent close to thirty years in the field. You get local expertise,
              honest advice, and logistics that simply work.
            </p>
            <TrustedChecklist items={trustPoints} />
            <div className='mt-8'>
              <BenrosoButton
                className='group'
                href={localePath(locale, '/about')}
                variant='primary'
              >
                <Icons.compass className='h-4 w-4 transition-transform duration-500 ease-out group-hover:rotate-[360deg]' />
                Discover Our Story
              </BenrosoButton>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

export function HomeFeaturedTours({ locale, tours }: { locale: string; tours: PublicTour[] }) {
  return (
    <section className='benroso-section relative overflow-hidden bg-white'>
      <ContourBackground opacity={0.07} />
      <div className='benroso-container relative'>
        <SectionHeader
          description='Find your next adventure. Explore wildlife, unwind on the coast, or book a curated safari package.'
          title='Popular Safari Tours & Packages'
        />
        <ScrollReveal className='mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3' stagger>
          {tours.length ? (
            tours.map((tour) => (
              <div data-reveal-item key={tour.id}>
                <TourCard
                  item={{
                    days: tour.days,
                    excerpt: tour.excerpt,
                    href: tour.href,
                    imageAlt: tour.imageAlt,
                    imageUrl: tour.imageUrl,
                    nights: tour.nights,
                    priceFrom: tour.priceFrom,
                    regionLabel: 'Safari',
                    title: tour.title
                  }}
                />
              </div>
            ))
          ) : (
            <div className='col-span-full rounded-[var(--benroso-radius)] border border-dashed border-[var(--benroso-line)] bg-[var(--benroso-ivory)] px-8 py-14 text-center'>
              <p className='benroso-heading font-display text-2xl'>Safari tours coming soon</p>
              <p className='benroso-body mx-auto mt-3 max-w-xl'>
                Published tours from the CMS will appear here automatically once content is added in
                the admin.
              </p>
              <div className='mt-6'>
                <BenrosoButton href={localePath(locale, '/contact')}>
                  Tailor Make Your Tour
                </BenrosoButton>
              </div>
            </div>
          )}
        </ScrollReveal>
      </div>
    </section>
  );
}

const FLEET_GUIDES_GALLERY = [
  {
    imageUrl: '/assets/The-Great-Wildebeest-Migration-1024x683.jpg.webp',
    imageAlt: 'Safari vehicle following the Great Wildebeest Migration'
  },
  {
    imageUrl:
      '/assets/The-Ultimate-Guided-Rhino-Tracking-on-Foot-in-Kenya-Conservation-Safari-A-Journey-to-Save-the-Giants.jpg',
    imageAlt: 'Guided rhino tracking on foot with a Benroso guide'
  },
  {
    imageUrl: '/assets/benroso-safaris-kenya.webp',
    imageAlt: 'Benroso Safaris vehicle on the plains of Kenya'
  }
];

export function HomeFleetGuides({ locale }: { locale: string }) {
  return (
    <section className='benroso-section bg-white'>
      <div className='benroso-container grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center'>
        <ScrollReveal from='left'>
          <p className='benroso-eyebrow'>Our Fleet &amp; Guides</p>
          <h2 className='benroso-heading mt-3 font-display text-[clamp(1.75rem,3.5vw,2.5rem)] leading-tight'>
            The Same Vehicles and Guides for Every Trip
          </h2>
          <p className='benroso-body mt-5 max-w-xl text-base leading-8'>
            Our private 4x4 safari cruisers are serviced on a fixed schedule, and our driver-guides
            hold current KPSGA certification. You travel with people who know these parks well, not
            a rotating cast of subcontractors.
          </p>
          <div className='mt-8 flex flex-wrap gap-4'>
            <BenrosoButton href={localePath(locale, '/our-fleet')} variant='primary'>
              View Our Fleet
            </BenrosoButton>
            <BenrosoButton href={localePath(locale, '/safari-guides')} variant='accent-outline'>
              Meet Our Guides
            </BenrosoButton>
          </div>
        </ScrollReveal>
        <ScrollReveal className='grid grid-cols-2 gap-4' from='right' stagger>
          {FLEET_GUIDES_GALLERY.map((item, index) => (
            <div
              className={`relative overflow-hidden rounded-[var(--benroso-radius)] bg-[var(--benroso-primary)] ${
                index === 0 ? 'col-span-2 aspect-[16/9]' : 'aspect-square'
              }`}
              data-reveal-item
              key={item.imageUrl}
            >
              <Image
                alt={item.imageAlt}
                className='object-cover'
                fill
                sizes='(max-width:1024px) 100vw, 50vw'
                src={item.imageUrl}
              />
            </div>
          ))}
        </ScrollReveal>
      </div>
    </section>
  );
}

export function HomeTrustCta({
  locale,
  siteSettings
}: {
  locale: string;
  siteSettings: PublicSiteSettings;
}) {
  return (
    <section
      className='relative isolate bg-cover bg-center bg-fixed'
      style={{
        backgroundImage: "url('/assets/Saruni-Basecamp-The-Great-Migration-river-crossing.jpg')"
      }}
    >
      {/* Dark overlay over the fixed safari backdrop */}
      <div aria-hidden className='absolute inset-0 bg-black/60' />

      <div className='benroso-container benroso-section relative flex justify-center'>
        <ScrollReveal className='w-full max-w-lg rounded-[var(--benroso-radius)] bg-white p-8 text-center shadow-2xl md:p-10'>
          <h3 className='benroso-heading font-display text-[clamp(1.75rem,3vw,2.25rem)] leading-tight'>
            Ready to Start Planning?
          </h3>
          <p className='benroso-body mx-auto mt-3 max-w-md'>
            Tell us your dates, group size, and the parks you want to see. Our planners will respond
            with a tailored proposal, usually within one business day.
          </p>
          <div className='benroso-body mt-6 space-y-1.5 text-sm'>
            <p>
              <a
                className='transition-colors hover:text-[var(--benroso-primary)]'
                href={`mailto:${siteSettings.email}`}
              >
                {siteSettings.email}
              </a>
            </p>
            <p>
              {siteSettings.phoneSecondary} / {siteSettings.phonePrimary}
            </p>
          </div>
          <div className='mt-7 flex justify-center'>
            <BenrosoButton
              className='border-[var(--benroso-lime)] bg-[var(--benroso-lime)] text-white [--benroso-fill:var(--benroso-primary)]'
              href={localePath(locale, '/contact')}
              variant='accent'
            >
              Enquire Now
              <Icons.arrowRight className='h-4 w-4' />
            </BenrosoButton>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
