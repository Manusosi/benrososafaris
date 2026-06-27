import Link from 'next/link';

import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { Icons } from '@/components/icons';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { AccommodationsList } from '@/features/portal/cms/accommodations/list/accommodations-list';
import { accommodationsListQueryOptions } from '@/features/portal/cms/accommodations/list/queries';
import type { AccommodationListStatus } from '@/features/portal/cms/accommodations/list/types';
import { requirePortalSession } from '@/lib/auth/portal';
import { getQueryClient } from '@/lib/query-client';

const STATUSES: AccommodationListStatus[] = ['all', 'published', 'draft', 'trash'];

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
}

export default async function PortalAccommodationsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requirePortalSession();
  const sp = await searchParams;

  const statusParam = first(sp.status) as AccommodationListStatus;
  const params = {
    status: STATUSES.includes(statusParam) ? statusParam : 'all',
    search: first(sp.s),
    country: first(sp.country),
    propertyType: first(sp.property_type),
    availability: first(sp.availability),
    page: Math.max(1, Number(first(sp.paged)) || 1)
  };

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(accommodationsListQueryOptions(params));

  return (
    <PageContainer
      className='bg-white'
      pageTitle='Accommodations'
      pageDescription='Manage lodges, camps, and stays — filter, preview, and trash.'
      pageHeaderAction={
        <Button asChild size='sm'>
          <Link href='/portal/accommodations/new'>
            <Icons.add className='mr-2 size-4' />
            Add new
          </Link>
        </Button>
      }
    >
      <HydrationBoundary state={dehydrate(queryClient)}>
        <AccommodationsList />
      </HydrationBoundary>
    </PageContainer>
  );
}
