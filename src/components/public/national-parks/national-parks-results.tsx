'use client';

import * as React from 'react';

import { EmptyState } from '@/components/public/page-shell';
import { NationalParkCard } from '@/components/public/national-parks/national-park-card';
import { NationalParkCompare } from '@/components/public/national-parks/national-park-compare';
import {
  NationalParkViewToggle,
  useNationalParkView
} from '@/components/public/national-parks/national-park-view-toggle';
import { localePath } from '@/lib/public/locale-path';
import type { ParkListItem } from '@/lib/public/national-parks';
import { cn } from '@/lib/utils';

type NationalParksResultsProps = {
  locale: string;
  parks: ParkListItem[];
};

const MAX_COMPARE = 2;

export function NationalParksResults({ locale, parks }: NationalParksResultsProps) {
  const [view] = useNationalParkView();
  const [compareIds, setCompareIds] = React.useState<string[]>([]);
  const countLabel = `${parks.length} ${parks.length === 1 ? 'park or reserve' : 'parks and reserves'} found`;
  const compareParks = compareIds
    .map((id) => parks.find((park) => park.id === id))
    .filter((park): park is ParkListItem => Boolean(park));

  function toggleCompare(parkId: string) {
    setCompareIds((current) => {
      if (current.includes(parkId)) {
        return current.filter((id) => id !== parkId);
      }
      if (current.length >= MAX_COMPARE) {
        return [current[1], parkId];
      }
      return [...current, parkId];
    });
  }

  if (!parks.length) {
    return (
      <>
        <p className='mb-6 text-sm font-medium text-[var(--benroso-muted)]'>{countLabel}</p>
        <EmptyState
          actionHref={localePath(locale, '/contact')}
          actionLabel='Ask a Safari Planner'
          message='No published national park guides yet. Add and publish parks in the portal under National Parks, or ask our team which reserves fit your dates and wildlife interests.'
          title='No parks published yet'
        />
      </>
    );
  }

  return (
    <>
      <div className='mb-6 flex flex-wrap items-center justify-between gap-3'>
        <div>
          <p className='benroso-eyebrow'>Safari Parks</p>
          <p className='mt-2 text-sm font-medium text-[var(--benroso-muted)]'>{countLabel}</p>
          <p className='mt-1 text-xs text-[var(--benroso-muted)]'>
            Select up to two parks to compare wildlife, seasonality, and safari availability.
          </p>
        </div>
        <NationalParkViewToggle />
      </div>

      {compareParks.length === MAX_COMPARE ? (
        <NationalParkCompare
          locale={locale}
          onClear={() => setCompareIds([])}
          parks={compareParks}
        />
      ) : null}

      <div
        className={cn(
          view === 'grid'
            ? 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'
            : 'flex flex-col gap-6'
        )}
      >
        {parks.map((park) => (
          <NationalParkCard
            compareChecked={compareIds.includes(park.id)}
            compareDisabled={!compareIds.includes(park.id) && compareIds.length >= MAX_COMPARE}
            href={localePath(locale, `/national-parks/${park.slug}`)}
            item={park}
            key={park.id}
            locale={locale}
            onCompareToggle={toggleCompare}
            variant={view}
          />
        ))}
      </div>
    </>
  );
}
