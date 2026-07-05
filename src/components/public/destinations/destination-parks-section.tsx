import { NationalParkCard } from '@/components/public/national-parks/national-park-card';
import { BenrosoButton } from '@/components/public/ui/benroso-button';
import { localePath } from '@/lib/public/locale-path';
import type { ParkListItem } from '@/lib/public/national-parks';

type DestinationParksSectionProps = {
  destinationName: string;
  locale: string;
  parks: ParkListItem[];
};

export function DestinationParksSection({
  destinationName,
  locale,
  parks
}: DestinationParksSectionProps) {
  if (!parks.length) return null;

  return (
    <section className='benroso-section scroll-mt-36 bg-white' id='parks'>
      <div className='benroso-container'>
        <div className='flex flex-wrap items-end justify-between gap-4'>
          <div>
            <p className='benroso-eyebrow'>National Parks</p>
            <h2 className='benroso-heading mt-3 font-display text-[clamp(1.75rem,3.5vw,2.5rem)] leading-tight'>
              Parks in {destinationName}
            </h2>
            <p className='benroso-body mt-4 max-w-3xl text-base leading-8'>
              Explore the reserves and wildlife areas linked to {destinationName}, then jump
              straight to safaris that visit each park.
            </p>
          </div>
          <BenrosoButton
            href={localePath(locale, '/national-parks')}
            size='sm'
            variant='accent-outline'
          >
            Browse All Parks
          </BenrosoButton>
        </div>

        <div className='mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3'>
          {parks.map((park) => (
            <NationalParkCard
              href={localePath(locale, `/national-parks/${park.slug}`)}
              item={park}
              key={park.id}
              locale={locale}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
