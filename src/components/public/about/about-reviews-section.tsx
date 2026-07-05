import Image from 'next/image';

import { Icons } from '@/components/icons';

import { BenrosoButton } from '@/components/public/ui/benroso-button';

import { SectionHeader } from '@/components/public/ui/section-header';

import { BENROSO_SAFARI_BOOKINGS } from '@/config/benroso';

import type { AboutTestimonial } from '@/lib/public/about-placeholders';

type AboutReviewsSectionProps = {
  testimonials: AboutTestimonial[];
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div aria-label={`${rating} out of 5 stars`} className='flex gap-0.5'>
      {Array.from({ length: 5 }).map((_, index) => (
        <Icons.exclusive
          className={`h-4 w-4 ${index < rating ? 'fill-[#FBBC04] text-[#FBBC04]' : 'text-[var(--benroso-line)]'}`}
          key={index}
        />
      ))}
    </div>
  );
}

export function AboutReviewsSection({ testimonials }: AboutReviewsSectionProps) {
  return (
    <div className='space-y-0'>
      <section className='benroso-section border-b border-[var(--benroso-line)] bg-white'>
        <div className='benroso-container'>
          <div className='mx-auto max-w-3xl text-center'>
            <div className='mx-auto flex h-16 w-40 items-center justify-center px-4'>
              <Image
                alt={BENROSO_SAFARI_BOOKINGS.alt}
                className='h-auto w-full object-contain'
                height={BENROSO_SAFARI_BOOKINGS.logoHeight}
                src={BENROSO_SAFARI_BOOKINGS.logoPath}
                width={BENROSO_SAFARI_BOOKINGS.logoWidth}
              />
            </div>

            <h2 className='benroso-heading mt-6 font-display text-[clamp(1.75rem,3vw,2.5rem)] leading-tight'>
              Verified Guest Reviews on SafariBookings
            </h2>

            <span aria-hidden className='benroso-gold-line mt-5' />

            <p className='benroso-body mx-auto mt-5 max-w-2xl text-base leading-8 text-[var(--benroso-muted)]'>
              Benroso Safaris is listed on SafariBookings.com with independent reviews from
              travelers who have booked safaris across Kenya, Tanzania, Uganda, and Rwanda.
            </p>

            <div className='mt-8 flex flex-wrap justify-center gap-4'>
              <BenrosoButton href={BENROSO_SAFARI_BOOKINGS.url} variant='primary'>
                Read Reviews on SafariBookings
              </BenrosoButton>
            </div>
          </div>
        </div>
      </section>

      {testimonials.length ? (
        <section className='benroso-section bg-white'>
          <div className='benroso-container'>
            <SectionHeader
              description='A selection of guest feedback from recent Benroso safaris.'
              eyebrow='Guest Stories'
              title='What Travelers Say About Us'
            />

            <div className='mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-3'>
              {testimonials.map((item) => (
                <figure
                  className='flex flex-col border-t-2 border-[var(--benroso-primary)] pt-6'
                  key={item.id}
                >
                  <StarRating rating={item.rating} />

                  <blockquote className='benroso-body mt-4 flex-1 text-sm leading-7 text-[var(--benroso-muted)]'>
                    &ldquo;{item.quote}&rdquo;
                  </blockquote>

                  <figcaption className='mt-6 border-t border-[var(--benroso-line)] pt-4'>
                    <p className='benroso-heading font-display text-lg'>{item.guestName}</p>

                    <p className='mt-1 text-xs text-[var(--benroso-muted)]'>{item.country}</p>

                    <p className='mt-2 text-xs font-medium text-[var(--benroso-primary)]'>
                      {item.tourLabel}
                    </p>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
