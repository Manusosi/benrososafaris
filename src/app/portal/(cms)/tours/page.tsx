import Link from 'next/link';

import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { Icons } from '@/components/icons';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { ToursList } from '@/features/portal/cms/tours/list/tours-list';
import { toursListQueryOptions } from '@/features/portal/cms/tours/list/queries';
import type { TourListStatus } from '@/features/portal/cms/tours/list/types';
import { requirePortalSession } from '@/lib/auth/portal';
import { getQueryClient } from '@/lib/query-client';

const STATUSES: TourListStatus[] = ['all', 'published', 'draft', 'trash'];

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
}

export default async function PortalToursPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requirePortalSession();
  const sp = await searchParams;

  const statusParam = first(sp.status) as TourListStatus;
  const params = {
    status: STATUSES.includes(statusParam) ? statusParam : 'all',
    search: first(sp.s),
    month: first(sp.m),
    page: Math.max(1, Number(first(sp.paged)) || 1)
  };

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(toursListQueryOptions(params));

  return (
    <PageContainer
      pageTitle='Safari Tours'
      pageDescription='Manage safari tour pages — filter, quick edit, and trash.'
      pageHeaderAction={
        <Button asChild size='sm'>
          <Link href='/portal/tours/new'>
            <Icons.add className='mr-2 size-4' />
            Add new
          </Link>
        </Button>
      }
    >
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ToursList />
      </HydrationBoundary>
    </PageContainer>
  );
}
