import { queryOptions } from '@tanstack/react-query';

import { listAccommodations } from './service';
import type { AccommodationListParams } from './types';

export const accommodationsListKeys = {
  all: ['portal', 'accommodations', 'list'] as const,
  list: (params: AccommodationListParams) => [...accommodationsListKeys.all, params] as const
};

export function accommodationsListQueryOptions(params: AccommodationListParams) {
  return queryOptions({
    queryKey: accommodationsListKeys.list(params),
    queryFn: () => listAccommodations(params)
  });
}
