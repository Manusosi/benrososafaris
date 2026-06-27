'use client';

import { Icons } from '@/components/icons';
import { ContourBackground } from '@/components/public/contour-background';
import { ScrollReveal } from '@/components/public/ui/scroll-reveal';
import { SectionHeader } from '@/components/public/ui/section-header';
import { BENROSO_TRIPADVISOR } from '@/config/benroso';

const PILLARS = [
  {
    icon: 'badgeCheck' as const,
    title: 'KATO Bonded & Registered',
    copy: 'A fully licensed member of the Kenya Association of Tour Operators, so your booking is protected.'
  },
  {
    icon: 'compass' as const,
    title: 'KPSGA Certified Guides',
    copy: 'Our driver-guides hold Kenya Professional Safari Guides Association certification.'
  },
  {
    icon: 'clock' as const,
    title: '25 Years On The Ground',
    copy: 'Operating across East and Southern Africa since 2000, with the relationships to prove it.'
  },
  {
    icon: 'exclusive' as const,
    title: `Rated ${BENROSO_TRIPADVISOR.rating} by Travelers`,
    copy: 'Verified reviews on TripAdvisor and SafariBookings.com from guests around the world.'
  }
];

export function HomeTrustBadges() {
  return (
    <section className='relative overflow-hidden border-b border-[var(--benroso-line)] bg-white'>
      <ContourBackground opacity={0.08} />
      <div className='benroso-container relative py-14 md:py-16'>
        <SectionHeader
          description='Nearly three decades of safaris, the right credentials, and a team that treats your trip as if it were our own.'
          title='Booked With Confidence, Guided With Care'
        />

        <ScrollReveal className='mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4' stagger>
          {PILLARS.map((pillar) => {
            const Icon = Icons[pillar.icon];
            return (
              <article
                className='flex flex-col items-start rounded-[var(--benroso-radius)] border border-[var(--benroso-line)] bg-[var(--benroso-ivory)] p-6'
                data-reveal-item
                key={pillar.title}
              >
                <span className='flex h-12 w-12 items-center justify-center rounded-[var(--benroso-radius)] bg-[var(--benroso-primary)] text-white'>
                  <Icon className='h-6 w-6' />
                </span>
                <h3 className='benroso-heading mt-4 font-display text-lg leading-tight'>
                  {pillar.title}
                </h3>
                <p className='benroso-body mt-2 text-sm leading-6'>{pillar.copy}</p>
              </article>
            );
          })}
        </ScrollReveal>
      </div>
    </section>
  );
}
