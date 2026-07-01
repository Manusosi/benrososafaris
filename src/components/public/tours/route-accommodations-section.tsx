import { AccommodationCard } from '@/components/public/accommodations/accommodation-card';
import type { PublicAccommodation } from '@/features/accommodations/public/types';

type RouteAccommodationsSectionProps = {
  accommodations: PublicAccommodation[];
  description?: string;
  id?: string;
  title?: string;
};

export function RouteAccommodationsSection({
  accommodations,
  description = 'These stays are linked to this route in the CMS, so clients see lodging that is actually relevant to the itinerary instead of a generic accommodation list.',
  id = 'accommodation',
  title = 'Accommodation on This Route'
}: RouteAccommodationsSectionProps) {
  if (!accommodations.length) return null;

  return (
    <section className='mt-10 scroll-mt-36' id={id}>
      <h2 className='benroso-heading font-display text-2xl'>{title}</h2>
      <p className='benroso-body mt-3 max-w-2xl text-base leading-7'>{description}</p>
      <div className='mt-6 grid gap-6 md:grid-cols-2'>
        {accommodations.slice(0, 4).map((accommodation) => (
          <AccommodationCard item={accommodation} key={accommodation.id} />
        ))}
      </div>
    </section>
  );
}
