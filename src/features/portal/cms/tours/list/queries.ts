import { queryOptions } from '@tanstack/react-query';

import { listTours } from './service';
import type { TourListParams } from './types';

export const toursListKeys = {
  all: ['portal', 'tours', 'list'] as const,
  list: (params: TourListParams) => [...toursListKeys.all, params] as const
};

export function toursListQueryOptions(params: TourListParams) {
  return queryOptions({
    queryKey: toursListKeys.list(params),
    queryFn: () => listTours(params)
  });
}
