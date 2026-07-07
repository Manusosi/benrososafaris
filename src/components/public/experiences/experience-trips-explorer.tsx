'use client';

import * as React from 'react';

import { Icons } from '@/components/icons';
import { TourCard } from '@/components/public/cards/content-cards';
import { EmptyState } from '@/components/public/page-shell';
import { localePath } from '@/lib/public/locale-path';
import { cn } from '@/lib/utils';
import type { PublicExperienceRelatedTour } from '@/features/experiences/public/types';

type DurationFilter = 'all' | 'short' | 'classic' | 'extended';

type ExperienceTripsExplorerProps = {
  description: string;
  locale: string;
  title: string;
  tours: PublicExperienceRelatedTour[];
};

const MAX_VISIBLE_TOURS = 6;

const durationOptions: Array<{ label: string; value: DurationFilter }> = [
  { label: 'All Durations', value: 'all' },
  { label: '1-3 Days', value: 'short' },
  { label: '4-6 Days', value: 'classic' },
  { label: '7+ Days', value: 'extended' }
];

function durationBucket(days: number | null): DurationFilter {
  if (!days) return 'all';
  if (days <= 3) return 'short';
  if (days <= 6) return 'classic';
  return 'extended';
}

function uniqueRoutes(tours: PublicExperienceRelatedTour[]) {
  return Array.from(
    new Set(
      tours
        .map((tour) => tour.parksLabel?.trim())
        .filter((route): route is string => Boolean(route))
    )
  );
}

export function ExperienceTripsExplorer({
  description,
  locale,
  title,
  tours
}: ExperienceTripsExplorerProps) {
  const [duration, setDuration] = React.useState<DurationFilter>('all');
  const [route, setRoute] = React.useState('all');
  const routeOptions = React.useMemo(() => uniqueRoutes(tours), [tours]);
  const filteredTours = tours.filter((tour) => {
    const matchesDuration = duration === 'all' || durationBucket(tour.days) === duration;
    const matchesRoute = route === 'all' || tour.parksLabel === route;
    return matchesDuration && matchesRoute;
  });
  const visibleTours = filteredTours.slice(0, MAX_VISIBLE_TOURS);

  return (
    <div className='benroso-container'>
      <div className='mx-auto max-w-3xl text-center'>
        <p className='benroso-eyebrow'>Under This Experience</p>
        <h2 className='benroso-heading mt-3 font-display text-[clamp(2rem,4vw,3rem)] leading-tight'>
          {title}
        </h2>
        <p className='benroso-body mx-auto mt-4 max-w-2xl text-base leading-7'>{description}</p>
      </div>

      <div className='mt-12 grid gap-8 border-t border-[var(--benroso-line)] pt-8 lg:grid-cols-[240px_minmax(0,1fr)]'>
        <aside className='benroso-contact-credentials-box h-fit lg:sticky lg:top-[calc(var(--benroso-header-h)+5.25rem)]'>
          <div className='space-y-6'>
            <FilterGroup label='Duration'>
              {durationOptions.map((option) => (
                <FilterButton
                  active={duration === option.value}
                  key={option.value}
                  onClick={() => setDuration(option.value)}
                >
                  {option.label}
                </FilterButton>
              ))}
            </FilterGroup>

            {routeOptions.length ? (
              <FilterGroup label='Route / Park Area'>
                <FilterButton active={route === 'all'} onClick={() => setRoute('all')}>
                  All Routes
                </FilterButton>
                {routeOptions.map((option) => (
                  <FilterButton
                    active={route === option}
                    key={option}
                    onClick={() => setRoute(option)}
                  >
                    {option}
                  </FilterButton>
                ))}
              </FilterGroup>
            ) : null}
          </div>
        </aside>

        <div>
          <div className='mb-6 flex flex-wrap items-center justify-between gap-3'>
            <p className='text-sm font-medium text-[var(--benroso-muted)]'>
              {visibleTours.length} of {filteredTours.length} matching safari
              {filteredTours.length === 1 ? '' : 's'} shown
            </p>
            {(duration !== 'all' || route !== 'all') && (
              <button
                className='inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[var(--benroso-primary)] transition-colors hover:text-[var(--benroso-gold)]'
                onClick={() => {
                  setDuration('all');
                  setRoute('all');
                }}
                type='button'
              >
                <Icons.close className='h-3.5 w-3.5' />
                Clear Filters
              </button>
            )}
          </div>

          {visibleTours.length ? (
            <div className='grid gap-6 md:grid-cols-2 xl:grid-cols-3'>
              {visibleTours.map((tour) => (
                <div data-reveal-item key={tour.id}>
                  <TourCard
                    item={{
                      days: tour.days,
                      excerpt: tour.excerpt,
                      href: tour.href,
                      imageAlt: tour.imageAlt,
                      imageUrl: tour.imageUrl,
                      nights: tour.nights,
                      priceFrom: tour.priceFrom,
                      regionLabel: tour.parksLabel ?? undefined,
                      title: tour.title
                    }}
                    linkAccent='gold'
                  />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              actionHref={localePath(locale, '/contact')}
              actionLabel='Request a Custom Safari'
              message='Safaris connected to this experience will appear here once they are linked in the tour wizard.'
              title='No matching safaris yet'
            />
          )}
        </div>
      </div>
    </div>
  );
}

function FilterGroup({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className='space-y-3 border-b border-[var(--benroso-line)] pb-5 last:border-b-0 last:pb-0'>
      <h3 className='benroso-heading font-display text-sm uppercase tracking-[0.12em]'>{label}</h3>
      <ul className='space-y-2.5 font-sans text-sm'>{children}</ul>
    </div>
  );
}

function FilterButton({
  active,
  children,
  onClick
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        className={cn(
          'flex w-full items-center gap-2.5 text-left transition-colors hover:text-[var(--benroso-primary)]',
          active ? 'font-semibold text-[var(--benroso-primary)]' : 'text-[var(--benroso-ink)]'
        )}
        onClick={onClick}
        type='button'
      >
        <span
          aria-hidden
          className={cn(
            'h-4 w-4 rounded-[3px] border-2',
            active
              ? 'border-[var(--benroso-primary)] bg-[var(--benroso-primary)]'
              : 'border-[#bbb] bg-white'
          )}
        />
        <span>{children}</span>
      </button>
    </li>
  );
}
