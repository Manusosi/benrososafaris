'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

import { Slider } from '@/components/ui/slider';
import type { PublicTourCatalogFacets, PublicTourPricingTier } from '@/lib/public/types';
import { localePath } from '@/lib/public/locale-path';
import { formatComfortTierLabel, TOUR_COMFORT_TIERS } from '@/lib/public/tour-format';
import { cn } from '@/lib/utils';

type TourCatalogFiltersProps = {
  active: {
    destination: string[];
    durationMax?: string;
    durationMin?: string;
    experience: string[];
    priceMax?: string;
    priceMin?: string;
    pricingTier: PublicTourPricingTier['tier'][];
    sort?: 'name' | 'price';
  };
  facets: PublicTourCatalogFacets;
  locale: string;
};

function toggleList(current: string[], value: string) {
  return current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
}

function buildQuery(active: TourCatalogFiltersProps['active']) {
  const params = new URLSearchParams();
  if (active.destination.length) params.set('destination', active.destination.join(','));
  if (active.experience.length) params.set('experience', active.experience.join(','));
  if (active.pricingTier.length) params.set('tier', active.pricingTier.join(','));
  if (active.durationMin) params.set('duration_min', active.durationMin);
  if (active.durationMax) params.set('duration_max', active.durationMax);
  if (active.priceMin) params.set('price_min', active.priceMin);
  if (active.priceMax) params.set('price_max', active.priceMax);
  if (active.sort && active.sort !== 'name') params.set('sort', active.sort);
  return params.toString();
}

function asNumber(value: string | undefined, fallback: number) {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function FilterGroup({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div className='space-y-3 border-b border-[var(--benroso-line)] pb-5 last:border-b-0 last:pb-0'>
      <h3 className='benroso-heading font-display text-sm uppercase tracking-[0.12em]'>{title}</h3>
      <ul className='space-y-2.5 font-sans text-sm'>{children}</ul>
    </div>
  );
}

function FilterCheckbox({
  checked,
  id,
  label,
  onCheckedChange
}: {
  checked: boolean;
  id: string;
  label: string;
  onCheckedChange: () => void;
}) {
  return (
    <li>
      <label
        className={cn(
          'flex cursor-pointer items-center gap-2.5 transition-colors hover:text-[var(--benroso-primary)]',
          checked ? 'font-semibold text-[var(--benroso-primary)]' : 'text-[var(--benroso-ink)]'
        )}
        htmlFor={id}
      >
        <input
          checked={checked}
          className='benroso-contact-checkbox-input'
          id={id}
          onChange={onCheckedChange}
          type='checkbox'
        />
        <span className='min-w-0 truncate'>{label}</span>
      </label>
    </li>
  );
}

export function TourCatalogFilters({ active, facets, locale }: TourCatalogFiltersProps) {
  const router = useRouter();
  const basePath = localePath(locale, '/tours');

  const durationMin = facets.durationBounds.min;
  const durationMax = Math.max(facets.durationBounds.max, durationMin + 1);
  const priceMin = facets.priceBounds.min;
  const priceMax = Math.max(facets.priceBounds.max, priceMin + 100);

  const [durationRange, setDurationRange] = React.useState<[number, number]>([
    asNumber(active.durationMin, durationMin),
    asNumber(active.durationMax, durationMax)
  ]);
  const [priceRange, setPriceRange] = React.useState<[number, number]>([
    asNumber(active.priceMin, priceMin),
    asNumber(active.priceMax, priceMax)
  ]);

  React.useEffect(() => {
    setDurationRange([
      asNumber(active.durationMin, durationMin),
      asNumber(active.durationMax, durationMax)
    ]);
  }, [active.durationMin, active.durationMax, durationMin, durationMax]);

  React.useEffect(() => {
    setPriceRange([asNumber(active.priceMin, priceMin), asNumber(active.priceMax, priceMax)]);
  }, [active.priceMin, active.priceMax, priceMin, priceMax]);

  function navigate(next: TourCatalogFiltersProps['active']) {
    const query = buildQuery(next);
    router.push(query ? `${basePath}?${query}` : basePath);
  }

  function update(partial: Partial<TourCatalogFiltersProps['active']>) {
    navigate({ ...active, ...partial });
  }

  const visibleTiers = TOUR_COMFORT_TIERS.filter(
    (tier) => !facets.pricingTiers.length || facets.pricingTiers.includes(tier.value)
  );

  return (
    <div className='benroso-accommodation-filters space-y-5'>
      <div className='space-y-2 border-b border-[var(--benroso-line)] pb-5'>
        <label
          className='benroso-heading block font-display text-sm uppercase tracking-[0.12em]'
          htmlFor='tour-sort'
        >
          Sort By
        </label>
        <select
          className='benroso-contact-field'
          id='tour-sort'
          name='sort'
          onChange={(event) => update({ sort: event.target.value as 'name' | 'price' })}
          value={active.sort ?? 'name'}
        >
          <option value='name'>Name</option>
          <option value='price'>Price</option>
        </select>
      </div>

      {facets.destinationLabels.length ? (
        <FilterGroup title='Destinations'>
          {facets.destinationLabels.map((destination) => (
            <FilterCheckbox
              checked={active.destination.includes(destination)}
              id={`tour-destination-${destination.replace(/\W+/g, '-').toLowerCase()}`}
              key={destination}
              label={destination}
              onCheckedChange={() =>
                update({ destination: toggleList(active.destination, destination) })
              }
            />
          ))}
        </FilterGroup>
      ) : null}

      {facets.experienceLabels.length ? (
        <FilterGroup title='Safari Adventures'>
          {facets.experienceLabels.map((experience) => (
            <FilterCheckbox
              checked={active.experience.includes(experience)}
              id={`tour-experience-${experience.replace(/\W+/g, '-').toLowerCase()}`}
              key={experience}
              label={experience}
              onCheckedChange={() =>
                update({ experience: toggleList(active.experience, experience) })
              }
            />
          ))}
        </FilterGroup>
      ) : null}

      {visibleTiers.length ? (
        <FilterGroup title='Comfort Tier'>
          {visibleTiers.map((tier) => (
            <FilterCheckbox
              checked={active.pricingTier.includes(tier.value)}
              id={`tour-tier-${tier.value}`}
              key={tier.value}
              label={formatComfortTierLabel(tier.value, 'short')}
              onCheckedChange={() =>
                update({
                  pricingTier: toggleList(
                    active.pricingTier,
                    tier.value
                  ) as PublicTourPricingTier['tier'][]
                })
              }
            />
          ))}
        </FilterGroup>
      ) : null}

      <div className='space-y-4 border-b border-[var(--benroso-line)] pb-5'>
        <h3 className='benroso-heading font-display text-sm uppercase tracking-[0.12em]'>
          Durations
        </h3>
        <Slider
          max={durationMax}
          min={durationMin}
          step={1}
          value={durationRange}
          onValueChange={(value) => setDurationRange([value[0], value[1]])}
          onValueCommit={(value) =>
            update({
              durationMin: value[0] <= durationMin ? undefined : String(value[0]),
              durationMax: value[1] >= durationMax ? undefined : String(value[1])
            })
          }
        />
        <div className='flex items-center justify-between text-xs text-[var(--benroso-muted)]'>
          <span>{durationRange[0]} days</span>
          <span>{durationRange[1]} days</span>
        </div>
      </div>

      <div className='space-y-4'>
        <h3 className='benroso-heading font-display text-sm uppercase tracking-[0.12em]'>
          Price From
        </h3>
        <Slider
          max={priceMax}
          min={priceMin}
          step={50}
          value={priceRange}
          onValueChange={(value) => setPriceRange([value[0], value[1]])}
          onValueCommit={(value) =>
            update({
              priceMin: value[0] <= priceMin ? undefined : String(value[0]),
              priceMax: value[1] >= priceMax ? undefined : String(value[1])
            })
          }
        />
        <div className='flex items-center justify-between text-xs text-[var(--benroso-muted)]'>
          <span>${priceRange[0].toLocaleString()}</span>
          <span>${priceRange[1].toLocaleString()}</span>
        </div>
        <button
          className='text-sm font-semibold text-[var(--benroso-primary)] underline-offset-4 hover:underline'
          onClick={() =>
            navigate({
              destination: [],
              experience: [],
              pricingTier: [],
              sort: 'name'
            })
          }
          type='button'
        >
          Reset Search Result
        </button>
      </div>
    </div>
  );
}
