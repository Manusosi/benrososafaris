import { queryOptions } from '@tanstack/react-query';

import { listArticles } from './service';
import type { ArticleListParams } from './types';

export const articlesListKeys = {
  all: ['portal', 'blog', 'list'] as const,
  list: (params: ArticleListParams) => [...articlesListKeys.all, params] as const
};

export function articlesListQueryOptions(params: ArticleListParams) {
  return queryOptions({
    queryKey: articlesListKeys.list(params),
    queryFn: () => listArticles(params)
  });
}
