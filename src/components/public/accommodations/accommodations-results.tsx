'use client';

import { AccommodationCard } from '@/components/public/accommodations/accommodation-card';
import {
  AccommodationViewToggle,
  useAccommodationView
} from '@/components/public/accommodations/accommodation-view-toggle';
import { EmptyState } from '@/components/public/page-shell';
import type { PublicAccommodation } from '@/features/accommodations/public/types';
import { localePath } from '@/lib/public/locale-path';
import { cn } from '@/lib/utils';

type AccommodationsResultsProps = {
  accommodations: PublicAccommodation[];
  locale: string;
};

export function AccommodationsResults({ accommodations, locale }: AccommodationsResultsProps) {
  const [view] = useAccommodationView();
  const countLabel = `${accommodations.length} ${accommodations.length === 1 ? 'property' : 'properties'} found`;

  if (!accommodations.length) {
    return (
      <>
        <p className='mb-6 text-sm font-medium text-[var(--benroso-muted)]'>{countLabel}</p>
        <EmptyState
          actionHref={localePath(locale, '/contact')}
          actionLabel='Request a custom quote'
          message='Published accommodations will appear here once they are added through the Benroso CMS.'
          title='No properties match your filters'
        />
      </>
    );
  }

  return (
    <>
      <div className='mb-6 flex flex-wrap items-center justify-between gap-3'>
        <p className='text-sm font-medium text-[var(--benroso-muted)]'>{countLabel}</p>
        <AccommodationViewToggle />
      </div>

      <div
        className={cn(
          view === 'grid'
            ? 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'
            : 'flex flex-col gap-6'
        )}
      >
        {accommodations.map((accommodation) => (
          <AccommodationCard item={accommodation} key={accommodation.id} variant={view} />
        ))}
      </div>
    </>
  );
}
