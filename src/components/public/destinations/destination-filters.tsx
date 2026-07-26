import {
  ListingFilterGroup,
  ListingFilterNavItem,
  ListingFilters
} from '@/components/public/listing-filters';
import { localePath } from '@/lib/public/locale-path';

type DestinationCountryFacet = {
  count: number;
  label: string;
  slug: string;
};

type DestinationFiltersProps = {
  activeCountry: string | null;
  facets: DestinationCountryFacet[];
  locale: string;
  totalCount: number;
};

export function DestinationFilters({
  activeCountry,
  facets,
  locale,
  totalCount
}: DestinationFiltersProps) {
  const basePath = localePath(locale, '/destinations');

  return (
    <ListingFilters
      activeCount={activeCountry ? 1 : 0}
      clearHref={activeCountry ? basePath : undefined}
      clearLabel='Clear'
      title='Destinations'
    >
      <ListingFilterGroup title='Browse by country'>
        <ListingFilterNavItem
          active={!activeCountry}
          count={totalCount}
          href={basePath}
          label='All destinations'
        />
        {facets.map((facet) => (
          <ListingFilterNavItem
            key={facet.slug}
            active={activeCountry === facet.slug}
            count={facet.count}
            href={`${basePath}?country=${facet.slug}`}
            label={facet.label}
          />
        ))}
      </ListingFilterGroup>
    </ListingFilters>
  );
}
