'use client';

import { ContourBackground } from '@/components/public/contour-background';
import { TourCard } from '@/components/public/cards/content-cards';
import { BenrosoButton } from '@/components/public/ui/benroso-button';
import { ScrollReveal } from '@/components/public/ui/scroll-reveal';
import { SectionHeader } from '@/components/public/ui/section-header';
import { localePath } from '@/lib/public/locale-path';
import type { PublicTour } from '@/lib/public/types';

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
