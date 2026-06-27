'use client';

import { parseAsStringEnum, useQueryState } from 'nuqs';

import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';

export type AccommodationViewMode = 'grid' | 'list';

const viewParser = parseAsStringEnum<AccommodationViewMode>(['grid', 'list']).withDefault('grid');

export function useAccommodationView() {
  return useQueryState('view', viewParser);
}

type AccommodationViewToggleProps = {
  className?: string;
};

export function AccommodationViewToggle({ className }: AccommodationViewToggleProps) {
  const [view, setView] = useAccommodationView();

  return (
    <div
      className={cn(
        'flex rounded-[var(--benroso-radius)] border border-[var(--benroso-line)] bg-white',
        className
      )}
      role='group'
      aria-label='Accommodation view mode'
    >
      <button
        type='button'
        aria-label='Grid view'
        aria-pressed={view === 'grid'}
        className={cn(
          'inline-flex items-center justify-center px-2.5 py-1.5 transition-colors',
          view === 'grid'
            ? 'bg-[var(--benroso-primary)] text-white'
            : 'text-[var(--benroso-muted)] hover:text-[var(--benroso-ink)]'
        )}
        onClick={() => void setView('grid')}
      >
        <Icons.dashboard className='size-4' />
      </button>
      <button
        type='button'
        aria-label='List view'
        aria-pressed={view === 'list'}
        className={cn(
          'inline-flex items-center justify-center border-l border-[var(--benroso-line)] px-2.5 py-1.5 transition-colors',
          view === 'list'
            ? 'bg-[var(--benroso-primary)] text-white'
            : 'text-[var(--benroso-muted)] hover:text-[var(--benroso-ink)]'
        )}
        onClick={() => void setView('list')}
      >
        <Icons.listBullet className='size-4' />
      </button>
    </div>
  );
}
