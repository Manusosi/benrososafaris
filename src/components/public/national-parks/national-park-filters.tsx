'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

import type { ParkFilterFacets } from '@/lib/public/national-parks';
import { localePath } from '@/lib/public/locale-path';
import { cn } from '@/lib/utils';

type NationalParkFiltersProps = {
  active: {
    activities: string[];
    countries: string[];
    regions: string[];
    wildlife: string[];
  };
  facets: ParkFilterFacets;
  locale: string;
};

function toggleList(current: string[], value: string) {
  return current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
}

function encodeFilterList(values: string[]) {
  return values.map((value) => encodeURIComponent(value)).join(',');
}

function buildQuery(active: NationalParkFiltersProps['active']) {
  const params = new URLSearchParams();
  if (active.countries.length) params.set('country', encodeFilterList(active.countries));
  if (active.regions.length) params.set('region', encodeFilterList(active.regions));
  if (active.wildlife.length) params.set('wildlife', encodeFilterList(active.wildlife));
  if (active.activities.length) params.set('activity', encodeFilterList(active.activities));
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
          aria-label={label}
          checked={checked}
          className='benroso-contact-checkbox-input'
          id={id}
          onChange={onCheckedChange}
          type='checkbox'
        />
        <span>{label}</span>
      </label>
    </li>
  );
}

function filterId(group: string, value: string) {
  return `park-${group}-${value.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`;
}

export function NationalParkFilters({ active, facets, locale }: NationalParkFiltersProps) {
  const router = useRouter();
  const basePath = localePath(locale, '/national-parks');
  const hasFacetValues =
    facets.countries.length ||
    facets.regions.length ||
    facets.wildlife.length ||
    facets.activities.length;

  function navigate(next: NationalParkFiltersProps['active']) {
    const query = buildQuery(next);
    router.push(query ? `${basePath}?${query}` : basePath, { scroll: false });
  }

  function update(partial: Partial<NationalParkFiltersProps['active']>) {
    navigate({ ...active, ...partial });
  }

  return (
    <div className='space-y-5'>
      <div>
        <p className='benroso-eyebrow text-[var(--benroso-primary)]'>Filter Parks</p>
        {!hasFacetValues ? (
          <p className='mt-2 text-sm leading-6 text-[var(--benroso-muted)]'>
            Published park filters will appear here as park guides are added.
          </p>
        ) : null}
      </div>

      {facets.countries.length ? (
        <FilterGroup title='Country'>
          {facets.countries.map((country) => (
            <FilterCheckbox
              checked={active.countries.includes(country)}
              id={filterId('country', country)}
              key={country}
              label={country}
              onCheckedChange={() => update({ countries: toggleList(active.countries, country) })}
            />
          ))}
        </FilterGroup>
      ) : null}

      {facets.regions.length ? (
        <FilterGroup title='Region'>
          {facets.regions.map((region) => (
            <FilterCheckbox
              checked={active.regions.includes(region)}
              id={filterId('region', region)}
              key={region}
              label={region}
              onCheckedChange={() => update({ regions: toggleList(active.regions, region) })}
            />
          ))}
        </FilterGroup>
      ) : null}

      {facets.wildlife.length ? (
        <FilterGroup title='Wildlife'>
          {facets.wildlife.slice(0, 12).map((animal) => (
            <FilterCheckbox
              checked={active.wildlife.includes(animal)}
              id={filterId('wildlife', animal)}
              key={animal}
              label={animal}
              onCheckedChange={() => update({ wildlife: toggleList(active.wildlife, animal) })}
            />
          ))}
        </FilterGroup>
      ) : null}

      {facets.activities.length ? (
        <FilterGroup title='Activities'>
          {facets.activities.slice(0, 12).map((activity) => (
            <FilterCheckbox
              checked={active.activities.includes(activity)}
              id={filterId('activity', activity)}
              key={activity}
              label={activity}
              onCheckedChange={() =>
                update({ activities: toggleList(active.activities, activity) })
              }
            />
          ))}
        </FilterGroup>
      ) : null}

      <button
        className='benroso-fill-hover inline-flex min-h-10 w-full items-center justify-center rounded-[var(--benroso-button-radius)] border border-[var(--benroso-primary)] px-4 text-xs font-bold uppercase tracking-[0.08em] text-[var(--benroso-primary)] transition-colors hover:text-white'
        onClick={() => router.push(basePath, { scroll: false })}
        type='button'
      >
        Clear Filters
      </button>
    </div>
  );
}
