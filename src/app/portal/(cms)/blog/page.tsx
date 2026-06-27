import Link from 'next/link';

import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { Icons } from '@/components/icons';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { BlogArticlesList } from '@/features/portal/cms/blog/list/blog-articles-list';
import { articlesListQueryOptions } from '@/features/portal/cms/blog/list/queries';
import type { ArticleListStatus } from '@/features/portal/cms/blog/list/types';
import { requirePortalSession } from '@/lib/auth/portal';
import { getQueryClient } from '@/lib/query-client';

const STATUSES: ArticleListStatus[] = ['all', 'published', 'draft', 'trash'];

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
}

export default async function PortalBlogPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requirePortalSession();
  const sp = await searchParams;

  const statusParam = first(sp.status) as ArticleListStatus;
  const params = {
    status: STATUSES.includes(statusParam) ? statusParam : 'all',
    search: first(sp.s),
    category: first(sp.cat),
    month: first(sp.m),
    page: Math.max(1, Number(first(sp.paged)) || 1)
  };

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(articlesListQueryOptions(params));

  return (
    <PageContainer
      pageTitle='Posts'
      pageDescription='Manage blog articles — filter, quick edit, and trash.'
      pageHeaderAction={
        <Button asChild size='sm'>
          <Link href='/portal/blog/new'>
            <Icons.add className='mr-2 size-4' />
            Add new
          </Link>
        </Button>
      }
    >
      <HydrationBoundary state={dehydrate(queryClient)}>
        <BlogArticlesList />
      </HydrationBoundary>
    </PageContainer>
  );
}
