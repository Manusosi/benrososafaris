import { Icons } from '@/components/icons';
import { BenrosoButton } from '@/components/public/ui/benroso-button';
import { SectionHeader } from '@/components/public/ui/section-header';
import type { AboutTestimonial } from '@/lib/public/about-placeholders';

type AboutReviewsSectionProps = {
  contactHref: string;
  testimonials: AboutTestimonial[];
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className='flex gap-0.5' aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Icons.exclusive
          className={`h-4 w-4 ${i < rating ? 'fill-[#FBBC04] text-[#FBBC04]' : 'text-[var(--benroso-line)]'}`}
          key={i}
        />
      ))}
    </div>
  );
}

export function AboutReviewsSection({ contactHref, testimonials }: AboutReviewsSectionProps) {
  return (
    <div className='space-y-0'>
      <section className='benroso-section bg-white'>
        <div className='benroso-container'>
          <SectionHeader
            description='Guest feedback from safaris across Kenya, Tanzania, Uganda, and Rwanda — placeholder reviews until dashboard content is live.'
            eyebrow='Guest Reviews'
            title='What Our Customers Say About Us'
          />

          <div className='mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3'>
            {testimonials.map((item) => (
              <article
                className='flex flex-col rounded-[var(--benroso-radius)] border border-[var(--benroso-line)] bg-[var(--benroso-ivory)] p-6'
                key={item.id}
              >
                <StarRating rating={item.rating} />
                <blockquote className='benroso-body mt-4 flex-1 text-sm leading-7 italic'>
                  &ldquo;{item.quote}&rdquo;
                </blockquote>
                <div className='mt-6 border-t border-[var(--benroso-line)] pt-4'>
                  <p className='benroso-heading font-display text-lg'>{item.guestName}</p>
                  <p className='mt-1 text-xs text-[var(--benroso-muted)]'>{item.country}</p>
                  <p className='mt-2 text-xs font-medium text-[var(--benroso-primary)]'>
                    {item.tourLabel}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className='border-t border-[var(--benroso-line)] bg-[var(--benroso-ivory)]'>
        <div className='benroso-container benroso-section'>
          <div className='mx-auto max-w-2xl text-center'>
            <Icons.exclusive className='mx-auto h-8 w-8 text-[var(--benroso-accent)]' />
            <h2 className='benroso-heading mt-4 font-display text-2xl md:text-3xl'>
              Verified on SafariBookings.com
            </h2>
            <p className='benroso-body mt-4 text-sm leading-7'>
              Benroso Safaris is represented on SafariBookings.com — read additional guest reviews
              and compare safari packages from verified travelers.
            </p>
            <div className='mt-8 flex flex-wrap justify-center gap-4'>
              <BenrosoButton href='https://www.safaribookings.com/' variant='primary'>
                View SafariBookings Profile
              </BenrosoButton>
              <BenrosoButton href={contactHref} variant='accent-outline'>
                Start Your Safari Enquiry
              </BenrosoButton>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
