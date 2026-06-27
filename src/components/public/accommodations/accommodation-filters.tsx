'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

import { Slider } from '@/components/ui/slider';
import {
  ACCOMMODATION_COMFORT_LEVELS,
  ACCOMMODATION_COUNTRIES,
  ACCOMMODATION_PROPERTY_TYPES,
  formatComfortLevelLabel,
  formatCountryLabel,
  normalizeCountryValue
} from '@/features/accommodations/public/constants';
import { localePath } from '@/lib/public/locale-path';
import { cn } from '@/lib/utils';

type AccommodationFiltersProps = {
  active: {
    comfortLevels: string[];
    countries: string[];
    maxPrice?: string;
    minPrice?: string;
    propertyTypes: string[];
    regions: string[];
  };
  facets: {
    comfortLevels: string[];
    countries: string[];
    propertyTypes: string[];
    regions: string[];
  };
  locale: string;
  priceBounds: {
    max: number;
    min: number;
  };
};

function toggleList(current: string[], value: string) {
  return current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
}

function buildQuery(active: AccommodationFiltersProps['active']) {
  const params = new URLSearchParams();
  if (active.countries.length) params.set('country', active.countries.join(','));
  if (active.propertyTypes.length) params.set('property_type', active.propertyTypes.join(','));
  if (active.comfortLevels.length) params.set('comfort_level', active.comfortLevels.join(','));
  if (active.regions.length) params.set('region', active.regions.join(','));
  if (active.minPrice) params.set('min_price', active.minPrice);
  if (active.maxPrice) params.set('max_price', active.maxPrice);
  return params.toString();
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
  onCheckedChange: (checked: boolean) => void;
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
          onChange={() => onCheckedChange(!checked)}
          type='checkbox'
        />
        <span>{label}</span>
      </label>
    </li>
  );
}

export function AccommodationFilters({
  active,
  facets,
  locale,
  priceBounds
}: AccommodationFiltersProps) {
  const router = useRouter();
  const basePath = localePath(locale, '/accommodations');

  const propertyTypes = [
    ...ACCOMMODATION_PROPERTY_TYPES,
    ...facets.propertyTypes.filter(
      (type) =>
        !ACCOMMODATION_PROPERTY_TYPES.includes(
          type as (typeof ACCOMMODATION_PROPERTY_TYPES)[number]
        )
    )
  ];

  const comfortLevels = ACCOMMODATION_COMFORT_LEVELS.map((level) => level.value).filter(
    (value) => facets.comfortLevels.length === 0 || facets.comfortLevels.includes(value)
  );

  const countries = ACCOMMODATION_COUNTRIES.map((country) => country.value);

  const sliderMin = priceBounds.min;
  const sliderMax = Math.max(priceBounds.max, sliderMin + 100);
  const activeMin = active.minPrice ? Number(active.minPrice) : sliderMin;
  const activeMax = active.maxPrice ? Number(active.maxPrice) : sliderMax;
  const [priceRange, setPriceRange] = React.useState<[number, number]>([
    Number.isFinite(activeMin) ? activeMin : sliderMin,
    Number.isFinite(activeMax) ? activeMax : sliderMax
  ]);

  React.useEffect(() => {
    setPriceRange([
      active.minPrice ? Number(active.minPrice) : sliderMin,
      active.maxPrice ? Number(active.maxPrice) : sliderMax
    ]);
  }, [active.minPrice, active.maxPrice, sliderMin, sliderMax]);

  function navigate(next: AccommodationFiltersProps['active']) {
    const query = buildQuery(next);
    router.push(query ? `${basePath}?${query}` : basePath);
  }

  function update(partial: Partial<AccommodationFiltersProps['active']>) {
    navigate({ ...active, ...partial });
  }

  return (
    <div className='benroso-accommodation-filters space-y-5'>
      <FilterGroup title='Country'>
        {countries.map((country) => {
          const id = `filter-country-${country}`;
          const checked = active.countries.some(
            (value) => normalizeCountryValue(value) === country
          );
          return (
            <FilterCheckbox
              key={country}
              checked={checked}
              id={id}
              label={formatCountryLabel(country) ?? country}
              onCheckedChange={() => update({ countries: toggleList(active.countries, country) })}
            />
          );
        })}
      </FilterGroup>

      <FilterGroup title='Property Type'>
        {propertyTypes.map((type) => {
          const id = `filter-type-${type.replace(/\s+/g, '-').toLowerCase()}`;
          return (
            <FilterCheckbox
              key={type}
              checked={active.propertyTypes.includes(type)}
              id={id}
              label={type}
              onCheckedChange={() =>
                update({ propertyTypes: toggleList(active.propertyTypes, type) })
              }
            />
          );
        })}
      </FilterGroup>

      <FilterGroup title='Comfort Level'>
        {comfortLevels.map((level) => {
          const id = `filter-comfort-${level}`;
          return (
            <FilterCheckbox
              key={level}
              checked={active.comfortLevels.includes(level)}
              id={id}
              label={formatComfortLevelLabel(level) ?? level}
              onCheckedChange={() =>
                update({ comfortLevels: toggleList(active.comfortLevels, level) })
              }
            />
          );
        })}
      </FilterGroup>

      {facets.regions.length ? (
        <FilterGroup title='Location'>
          {facets.regions.map((region) => {
            const id = `filter-region-${region.replace(/\s+/g, '-').toLowerCase()}`;
            return (
              <FilterCheckbox
                key={region}
                checked={active.regions.includes(region)}
                id={id}
                label={region}
                onCheckedChange={() => update({ regions: toggleList(active.regions, region) })}
              />
            );
          })}
        </FilterGroup>
      ) : null}

      <div className='space-y-4 border-b border-[var(--benroso-line)] pb-5 last:border-b-0 last:pb-0'>
        <h3 className='benroso-heading font-display text-sm uppercase tracking-[0.12em]'>
          Price Per Night (USD)
        </h3>
        <div className='space-y-4 px-1'>
          <Slider
            max={sliderMax}
            min={sliderMin}
            step={25}
            value={priceRange}
            onValueChange={(value) => setPriceRange([value[0], value[1]])}
            onValueCommit={(value) =>
              update({
                minPrice: value[0] <= sliderMin ? undefined : String(value[0]),
                maxPrice: value[1] >= sliderMax ? undefined : String(value[1])
              })
            }
          />
          <div className='flex items-center justify-between text-xs text-[var(--benroso-muted)]'>
            <span>${priceRange[0].toLocaleString()}</span>
            <span>${priceRange[1].toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
