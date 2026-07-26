'use client';

import {
  ListingFilterGroup,
  ListingFilterOption,
  ListingFilters,
  toggleFilterValue
} from '@/components/public/listing-filters';
import { BENROSO_OPERATING_COUNTRIES } from '@/features/experiences/public/country-map-copy';
import type {
  ExperienceListingFiltersState,
  ExperienceMenuGroup
} from '@/features/experiences/public/filters';
import type { BenrosoCountryId } from '@/features/experiences/public/country-map-copy';

type ExperienceListingFiltersProps = {
  active: ExperienceListingFiltersState;
  onChange: (next: ExperienceListingFiltersState) => void;
};

const MENU_GROUP_FILTERS = [
  {
    label: 'Signature Experiences',
    value: 'top_experiences' as const
  },
  {
    label: 'Wildlife Safaris',
    value: 'wildlife_safari' as const
  }
];

export function ExperienceListingFilters({ active, onChange }: ExperienceListingFiltersProps) {
  const activeCount = active.countries.length + active.groups.length;

  function update(partial: Partial<ExperienceListingFiltersState>) {
    onChange({ ...active, ...partial });
  }

  return (
    <ListingFilters
      activeCount={activeCount}
      clearLabel='Clear all'
      onClear={() => onChange({ countries: [], groups: [] })}
      title='Experiences'
    >
      <ListingFilterGroup title='Show'>
        <ListingFilterOption
          checked={activeCount === 0}
          id='filter-all-experiences'
          label='All experiences'
          name='experience-scope'
          type='radio'
          onChange={() => onChange({ countries: [], groups: [] })}
        />
      </ListingFilterGroup>

      <ListingFilterGroup title='Country'>
        {BENROSO_OPERATING_COUNTRIES.map((country) => (
          <ListingFilterOption
            checked={active.countries.includes(country.id)}
            id={`filter-country-${country.id}`}
            key={country.id}
            label={country.name}
            onChange={() =>
              update({
                countries: toggleFilterValue(active.countries, country.id) as BenrosoCountryId[]
              })
            }
          />
        ))}
      </ListingFilterGroup>

      <ListingFilterGroup title='Collection'>
        {MENU_GROUP_FILTERS.map((entry) => (
          <ListingFilterOption
            checked={active.groups.includes(entry.value)}
            id={`filter-group-${entry.value}`}
            key={entry.value}
            label={entry.label}
            onChange={() =>
              update({
                groups: toggleFilterValue(active.groups, entry.value) as ExperienceMenuGroup[]
              })
            }
          />
        ))}
      </ListingFilterGroup>
    </ListingFilters>
  );
}
