'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

import { Slider } from '@/components/ui/slider';
import type { PublicTourCatalogFacets, PublicTourPricingTier } from '@/lib/public/types';
import { localePath } from '@/lib/public/locale-path';
import {
  formatComfortTierLabel,
  TOUR_CATALOG_COUNTRIES,
  TOUR_CATALOG_DURATION_BOUNDS,
  TOUR_CATALOG_PRICE_BOUNDS,
  TOUR_COMFORT_TIERS
} from '@/lib/public/tour-format';
import { cn } from '@/lib/utils';

type TourCatalogFiltersProps = {
  active: {
    country?: string;
    destination: string[];
    durationMax?: string;
    durationMin?: string;
    experience: string[];
    park: string[];
    priceMax?: string;
    priceMin?: string;
    pricingTier: PublicTourPricingTier['tier'][];
  };
  facets: PublicTourCatalogFacets;
  locale: string;
};

function toggleList(current: string[], value: string) {
  return current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
}

function buildQuery(active: TourCatalogFiltersProps['active']) {
  const params = new URLSearchParams();
  if (active.country) params.set('country', active.country);
  if (active.destination.length) params.set('destination', active.destination.join(','));
  if (active.experience.length) params.set('experience', active.experience.join(','));
  if (active.park.length) params.set('park', active.park.join(','));
  if (active.pricingTier.length) params.set('tier', active.pricingTier.join(','));
  if (active.durationMin) params.set('duration_min', active.durationMin);
  if (active.durationMax) params.set('duration_max', active.durationMax);
  if (active.priceMin) params.set('price_min', active.priceMin);
  if (active.priceMax) params.set('price_max', active.priceMax);
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

function FilterRadio({
  checked,
  id,
  label,
  name,
  onSelect
}: {
  checked: boolean;
  id: string;
  label: string;
  name: string;
  onSelect: () => void;
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
          className='benroso-contact-radio-input'
          id={id}
          name={name}
          onChange={onSelect}
          type='radio'
        />
        <span className='min-w-0 truncate'>{label}</span>
      </label>
    </li>
  );
}

function RangeFilter({
  max,
  min,
  onCommit,
  onValueChange,
  suffix,
  title,
  value
}: {
  max: number;
  min: number;
  onCommit: (value: [number, number]) => void;
  onValueChange: (value: [number, number]) => void;
  suffix?: string;
  title: string;
  value: [number, number];
}) {
  return (
    <div className='space-y-4 border-b border-[var(--benroso-line)] pb-5 last:border-b-0 last:pb-0'>
      <h3 className='benroso-heading font-display text-sm uppercase tracking-[0.12em]'>{title}</h3>
      <div className='rounded-[var(--benroso-radius)] bg-[var(--benroso-warm-gray)] px-5 py-4'>
        <Slider
          className='benroso-range-slider'
          max={max}
          min={min}
          step={title === 'Price From' ? 50 : 1}
          value={value}
          onValueChange={(next) => onValueChange([next[0], next[1]])}
          onValueCommit={(next) => onCommit([next[0], next[1]])}
        />
        <div className='mt-4 grid grid-cols-2 gap-3 text-xs text-[var(--benroso-muted)]'>
          <RangeValue label='Min' suffix={suffix} value={value[0]} />
          <RangeValue align='right' label='Max' suffix={suffix} value={value[1]} />
        </div>
      </div>
    </div>
  );
}

function RangeValue({
  align = 'left',
  label,
  suffix,
  value
}: {
  align?: 'left' | 'right';
  label: string;
  suffix?: string;
  value: number;
}) {
  return (
    <span className={cn('block', align === 'right' && 'text-right')}>
      <span className='block text-[10px] font-bold uppercase tracking-wide text-[var(--benroso-muted)]/75'>
        {label}
      </span>
      <strong className='mt-1 block text-sm text-[var(--benroso-ink)]'>
        {suffix === 'USD'
          ? `USD ${value.toLocaleString()}`
          : `${value.toLocaleString()} ${suffix ?? ''}`.trim()}
      </strong>
    </span>
  );
}

export function TourCatalogFilters({ active, facets, locale }: TourCatalogFiltersProps) {
  const router = useRouter();
  const basePath = localePath(locale, '/tours');

  const durationMin = TOUR_CATALOG_DURATION_BOUNDS.min;
  const durationMax = TOUR_CATALOG_DURATION_BOUNDS.max;
  const priceMin = TOUR_CATALOG_PRICE_BOUNDS.min;
  const priceMax = TOUR_CATALOG_PRICE_BOUNDS.max;

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
      <FilterGroup title='Country'>
        <FilterRadio
          checked={!active.country}
          id='tour-country-all'
          label='All'
          name='tour-country'
          onSelect={() => update({ country: undefined })}
        />
        {TOUR_CATALOG_COUNTRIES.map(({ country, slug }) => (
          <FilterRadio
            checked={active.country === slug}
            id={`tour-country-${slug}`}
            key={slug}
            label={country}
            name='tour-country'
            onSelect={() => update({ country: slug })}
          />
        ))}
      </FilterGroup>

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

      {facets.parkOptions.length ? (
        <FilterGroup title='National Parks'>
          {facets.parkOptions.map((park) => (
            <FilterCheckbox
              checked={active.park.includes(park.slug)}
              id={`tour-park-${park.slug}`}
              key={park.slug}
              label={park.label}
              onCheckedChange={() => update({ park: toggleList(active.park, park.slug) })}
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

      <RangeFilter
        max={durationMax}
        min={durationMin}
        suffix='days'
        title='Duration'
        value={durationRange}
        onValueChange={(value) => setDurationRange(value)}
        onCommit={(value) =>
          update({
            durationMin: value[0] <= durationMin ? undefined : String(value[0]),
            durationMax: value[1] >= durationMax ? undefined : String(value[1])
          })
        }
      />

      <div className='space-y-5'>
        <RangeFilter
          max={priceMax}
          min={priceMin}
          suffix='USD'
          title='Price From'
          value={priceRange}
          onValueChange={(value) => setPriceRange(value)}
          onCommit={(value) =>
            update({
              priceMin: value[0] <= priceMin ? undefined : String(value[0]),
              priceMax: value[1] >= priceMax ? undefined : String(value[1])
            })
          }
        />
        <button
          className='inline-flex w-full items-center justify-center rounded-[var(--benroso-radius)] border border-[var(--benroso-line)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--benroso-primary)] transition-colors hover:border-[var(--benroso-primary)] hover:bg-[var(--benroso-ivory)]'
          onClick={() =>
            navigate({
              country: undefined,
              destination: [],
              experience: [],
              park: [],
              pricingTier: []
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
