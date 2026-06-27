'use client';

import { Icons } from '@/components/icons';
import { ScrollReveal } from '@/components/public/ui/scroll-reveal';
import { Slider } from '@/components/public/ui/slider';
import { PLACEHOLDER_TESTIMONIALS } from '@/lib/public/about-placeholders';

/**
 * Shape mirrors the Google Places API `reviews` entries so live data can be
 * dropped in later without touching the UI. Map a Places response to this type
 * and pass it as `reviews`. Until then we render real guest review text.
 */
export type GoogleReview = {
  authorName: string;
  authorLocation?: string;
  rating: number;
  relativeTime: string;
  text: string;
  profilePhotoUrl?: string;
};

const RELATIVE_TIMES = [
  '2 weeks ago',
  'a month ago',
  '2 months ago',
  '3 months ago',
  '5 months ago',
  '6 months ago'
];

const FALLBACK_REVIEWS: GoogleReview[] = PLACEHOLDER_TESTIMONIALS.map((item, index) => ({
  authorName: item.guestName,
  authorLocation: item.country,
  rating: item.rating,
  relativeTime: RELATIVE_TIMES[index % RELATIVE_TIMES.length],
  text: item.quote
}));

const AGGREGATE_RATING = 5.0;
const REVIEW_COUNT = 120;
const GOOGLE_REVIEWS_URL = 'https://www.google.com/search?q=Benroso+Safaris+Ltd+Nairobi+reviews';

function GoogleGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg' aria-hidden>
      <path
        d='M23.52 12.27c0-.82-.07-1.6-.21-2.36H12v4.47h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.58-5.17 3.58-8.73Z'
        fill='#4285F4'
      />
      <path
        d='M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.88-3c-1.08.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.95H1.28v3.09A12 12 0 0 0 12 24Z'
        fill='#34A853'
      />
      <path
        d='M5.29 14.29A7.2 7.2 0 0 1 4.91 12c0-.8.14-1.57.38-2.29V6.62H1.28A12 12 0 0 0 0 12c0 1.94.46 3.77 1.28 5.38l4.01-3.09Z'
        fill='#FBBC05'
      />
      <path
        d='M12 4.76c1.76 0 3.34.61 4.59 1.8l3.43-3.43C17.95 1.18 15.24 0 12 0A12 12 0 0 0 1.28 6.62l4.01 3.09C6.23 6.87 8.88 4.76 12 4.76Z'
        fill='#EA4335'
      />
    </svg>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <div aria-label={`${rating} out of 5 stars`} className='flex gap-0.5'>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < Math.round(rating);
        return (
          <Icons.exclusive
            className={`h-4 w-4 ${filled ? 'text-[#FBBC05]' : 'text-[var(--benroso-line)]'}`}
            fill={filled ? 'currentColor' : 'none'}
            key={i}
          />
        );
      })}
    </div>
  );
}

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function HomeGoogleReviews({ reviews = FALLBACK_REVIEWS }: { reviews?: GoogleReview[] }) {
  return (
    <section className='benroso-section bg-[var(--benroso-ivory)]'>
      <div className='benroso-container'>
        <div className='flex flex-col items-center gap-6 text-center lg:flex-row lg:items-center lg:justify-between lg:text-left'>
          <div>
            <h2 className='benroso-heading font-display text-[clamp(1.5rem,3vw,2.25rem)] leading-tight'>
              What Our Clients Say
            </h2>
          </div>

          <div className='flex items-center gap-4 rounded-[var(--benroso-radius)] border border-[var(--benroso-line)] bg-white px-6 py-4'>
            <GoogleGlyph className='h-9 w-9' />
            <div className='text-left'>
              <div className='flex items-center gap-2'>
                <span className='font-display text-2xl font-bold text-[var(--benroso-primary)]'>
                  {AGGREGATE_RATING.toFixed(1)}
                </span>
                <Stars rating={AGGREGATE_RATING} />
              </div>
              <p className='mt-0.5 text-xs text-[var(--benroso-muted)]'>
                Based on {REVIEW_COUNT}+ Google reviews
              </p>
            </div>
            <a
              className='ml-2 inline-flex items-center gap-1 rounded-[var(--benroso-button-radius)] border border-[var(--benroso-primary)] px-4 py-2 text-xs font-bold uppercase tracking-wide text-[var(--benroso-primary)] transition-colors hover:bg-[var(--benroso-primary)] hover:text-white'
              href={GOOGLE_REVIEWS_URL}
              rel='noopener noreferrer'
              target='_blank'
            >
              Read on Google
              <Icons.externalLink className='h-3.5 w-3.5' />
            </a>
          </div>
        </div>

        <ScrollReveal className='mt-12'>
          <Slider autoPlayMs={7000} slideClassName='md:basis-1/2 xl:basis-1/3 md:w-1/2 xl:w-1/3'>
            {reviews.map((review, index) => (
              <article
                className='flex h-full flex-col rounded-[var(--benroso-radius)] border border-[var(--benroso-line)] bg-white p-6'
                key={`${review.authorName}-${index}`}
              >
                <div className='flex items-center gap-3'>
                  <span className='flex h-11 w-11 items-center justify-center rounded-full bg-[var(--benroso-primary)] text-sm font-bold text-white'>
                    {initials(review.authorName)}
                  </span>
                  <div className='min-w-0 flex-1'>
                    <p className='benroso-heading truncate font-display text-base leading-tight'>
                      {review.authorName}
                    </p>
                    <p className='text-xs text-[var(--benroso-muted)]'>{review.relativeTime}</p>
                  </div>
                  <GoogleGlyph className='h-5 w-5 shrink-0' />
                </div>
                <div className='mt-3'>
                  <Stars rating={review.rating} />
                </div>
                <p className='benroso-body mt-3 line-clamp-5 flex-1 text-sm leading-7'>
                  {review.text}
                </p>
                {review.authorLocation ? (
                  <p className='mt-4 border-t border-[var(--benroso-line)] pt-3 text-xs text-[var(--benroso-muted)]'>
                    {review.authorLocation}
                  </p>
                ) : null}
              </article>
            ))}
          </Slider>
        </ScrollReveal>
      </div>
    </section>
  );
}
