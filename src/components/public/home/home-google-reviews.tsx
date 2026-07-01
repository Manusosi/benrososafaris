'use client';

import { Icons } from '@/components/icons';
import { ScrollReveal } from '@/components/public/ui/scroll-reveal';
import { Slider } from '@/components/public/ui/slider';
import {
  FALLBACK_HOME_REVIEWS,
  type HomeReviewItem,
  type HomeReviewSource
} from '@/lib/public/home-reviews';

const SOURCE_LABEL: Record<HomeReviewSource, string> = {
  google: 'Google',
  tripadvisor: 'Tripadvisor'
};

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

/** Per-card provider badge — Google "G" or the Tripadvisor owl. */
function SourceLogo({ source, className }: { source: HomeReviewSource; className?: string }) {
  if (source === 'tripadvisor') {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        alt='Tripadvisor'
        className={className}
        height={20}
        src='/assets/tripadvisor-logomark.svg'
        width={20}
      />
    );
  }
  return <GoogleGlyph className={className} />;
}

/**
 * Per-card rating shown the way each platform officially does: gold stars for
 * Google, green bubbles for Tripadvisor.
 */
function Rating({ rating, source }: { rating: number; source: HomeReviewSource }) {
  const filled = Math.round(rating);

  if (source === 'tripadvisor') {
    return (
      <div aria-label={`${rating} out of 5 on Tripadvisor`} className='flex gap-1'>
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            className={`h-3.5 w-3.5 rounded-full ${
              i < filled ? 'bg-[#00AA6C]' : 'bg-[var(--benroso-line)]'
            }`}
            key={i}
          />
        ))}
      </div>
    );
  }

  return (
    <div aria-label={`${rating} out of 5 stars on Google`} className='flex gap-0.5'>
      {Array.from({ length: 5 }).map((_, i) => (
        <Icons.exclusive
          className={`h-4 w-4 ${
            i < filled ? 'fill-[#FBBC04] text-[#FBBC04]' : 'text-[var(--benroso-line)]'
          }`}
          key={i}
        />
      ))}
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

export function HomeGoogleReviews({ reviews }: { reviews?: HomeReviewItem[] }) {
  const items = reviews?.length ? reviews : FALLBACK_HOME_REVIEWS;

  return (
    <section aria-label='Guest reviews' className='border-t border-[var(--benroso-line)] bg-white'>
      <div className='benroso-container benroso-section'>
        {/* Header — descriptive, not boxed */}
        <div className='mx-auto max-w-2xl text-center'>
          <p className='benroso-eyebrow'>Do Not Take Our Word For It</p>
          <h2 className='benroso-heading mt-3 font-display text-[clamp(2rem,4vw,3.25rem)] leading-[1.15]'>
            What Our Clients Say
          </h2>
          <div className='mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-2'>
            <span className='inline-flex items-center gap-0.5'>
              {Array.from({ length: 5 }).map((_, i) => (
                <Icons.exclusive className='h-5 w-5 fill-[#FBBC04] text-[#FBBC04]' key={i} />
              ))}
            </span>
            <span className='text-sm font-semibold text-[var(--benroso-heading)]'>
              5 Star Reviews on
            </span>
            <GoogleGlyph className='h-5 w-5 shrink-0' />
            <span className='text-sm font-semibold text-[var(--benroso-muted)]'>+</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt='Tripadvisor'
              className='h-6 w-auto'
              height={24}
              src='/assets/tripadvisor-logo-primary.svg'
              width={158}
            />
          </div>
        </div>

        <ScrollReveal className='mt-12'>
          <Slider autoPlayMs={7000} slideClassName='md:basis-1/2 xl:basis-1/3 md:w-1/2 xl:w-1/3'>
            {items.map((review, index) => (
              <article
                className='flex h-full flex-col rounded-[var(--benroso-radius)] border border-[var(--benroso-line)] bg-white p-6'
                key={review.id || `${review.authorName}-${index}`}
              >
                <div className='flex items-center gap-3'>
                  {review.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      alt={review.authorName}
                      className='h-11 w-11 shrink-0 rounded-full object-cover'
                      height={44}
                      src={review.avatarUrl}
                      width={44}
                    />
                  ) : (
                    <span className='flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--benroso-primary)] text-sm font-bold text-white'>
                      {initials(review.authorName)}
                    </span>
                  )}
                  <div className='min-w-0 flex-1'>
                    <p className='benroso-heading truncate font-display text-base leading-tight'>
                      {review.authorName}
                    </p>
                    <p className='truncate text-xs text-[var(--benroso-muted)]'>
                      {review.authorLocation
                        ? `${review.authorLocation} · via ${SOURCE_LABEL[review.source]}`
                        : `via ${SOURCE_LABEL[review.source]}`}
                    </p>
                  </div>
                  <SourceLogo className='h-5 w-5 shrink-0' source={review.source} />
                </div>
                <div className='mt-3'>
                  <Rating rating={review.rating} source={review.source} />
                </div>
                <p className='benroso-body mt-3 line-clamp-5 flex-1 text-sm leading-7'>
                  {review.body}
                </p>
              </article>
            ))}
          </Slider>
        </ScrollReveal>
      </div>
    </section>
  );
}
