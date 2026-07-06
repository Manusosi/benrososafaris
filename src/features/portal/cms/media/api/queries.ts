import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';

import { listMedia } from './client';
import { MEDIA_PAGE_SIZE, type MediaListParams } from './types';

/** Query key factory for the media library cache. */
export const mediaKeys = {
  all: ['media'] as const,
  list: (params: MediaListParams) => [...mediaKeys.all, 'list', params] as const,
  infiniteList: (search: string) => [...mediaKeys.all, 'list', 'infinite', search] as const
};

export function mediaListQueryOptions(params: MediaListParams) {
  return queryOptions({
    queryKey: mediaKeys.list(params),
    queryFn: () => listMedia(params)
  });
}

export function mediaInfiniteListQueryOptions(search: string) {
  return infiniteQueryOptions({
    queryKey: mediaKeys.infiniteList(search),
    queryFn: ({ pageParam }) => listMedia({ search, page: pageParam, pageSize: MEDIA_PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((sum, page) => sum + page.items.length, 0);
      if (loaded >= lastPage.total) return undefined;
      return allPages.length + 1;
    }
  });
}
