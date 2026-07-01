'use client';

import Link from 'next/link';
import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PortalContentTable } from '@/features/portal/components/portal-content-table';
import type { PortalContentList } from '@/features/portal/api/types';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';

type StatusFilter = 'all' | 'published' | 'draft' | 'trash';

interface StatusOption {
  value: StatusFilter;
  label: string;
  description: string;
}

const STATUS_OPTIONS: StatusOption[] = [
  {
    value: 'all',
    label: 'All',
    description: 'Every visible record in this module.'
  },
  {
    value: 'published',
    label: 'Published',
    description: 'Live public content.'
  },
  {
    value: 'draft',
    label: 'Drafts',
    description: 'Work saved before publishing.'
  },
  {
    value: 'trash',
    label: 'Trash',
    description: 'Archived or deleted records.'
  }
];

interface PortalModulePageProps {
  publicPath: string;
  data: PortalContentList;
  /** When set, the "Add new" button links here (otherwise it is disabled). */
  newHref?: string;
  /** When set, table rows link to `${editBasePath}/${id}` for editing. */
  editBasePath?: string;
  /** Heading + body shown in the table's empty state. */
  emptyTitle?: string;
  emptyMessage?: string;
}

function isTrashStatus(status: string): boolean {
  return ['trash', 'archived', 'deleted'].includes(status);
}

function matchesStatus(status: string, filter: StatusFilter): boolean {
  if (filter === 'all') return true;
  if (filter === 'trash') return isTrashStatus(status);
  return status === filter;
}

function getCounts(rows: PortalContentList['rows']) {
  return rows.reduce(
    (counts, row) => {
      if (row.status === 'published') counts.published += 1;
      if (row.status === 'draft') counts.draft += 1;
      if (isTrashStatus(row.status)) counts.trash += 1;
      return counts;
    },
    { all: rows.length, published: 0, draft: 0, trash: 0 } satisfies Record<StatusFilter, number>
  );
}

function getEmptyCopy({
  hasRows,
  hasQuery,
  filter,
  fallbackTitle,
  fallbackMessage
}: {
  hasRows: boolean;
  hasQuery: boolean;
  filter: StatusFilter;
  fallbackTitle?: string;
  fallbackMessage?: string;
}) {
  if (hasQuery) {
    return {
      title: 'No matching records',
      message: 'Try a different search term or switch the status filter.'
    };
  }

  if (filter === 'published') {
    return {
      title: 'Nothing published yet',
      message: 'Publish a record to make it available on the public website.'
    };
  }

  if (filter === 'draft') {
    return {
      title: 'No drafts waiting',
      message: 'Drafts appear here when content is saved before it is ready to publish.'
    };
  }

  if (filter === 'trash') {
    return {
      title: 'Trash is empty',
      message: 'Archived records will appear here when content is removed from the active workflow.'
    };
  }

  if (!hasRows) {
    return {
      title: fallbackTitle ?? 'No content yet',
      message:
        fallbackMessage ??
        'Create the first record for this module and it will appear in this table.'
    };
  }

  return {
    title: 'Nothing in this view',
    message: 'Change the filters above to see more records.'
  };
}

export function PortalModulePage({
  publicPath,
  data,
  newHref,
  editBasePath,
  emptyTitle,
  emptyMessage
}: PortalModulePageProps) {
  const [query, setQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>('all');
  const trimmedQuery = query.trim().toLowerCase();

  const counts = React.useMemo(() => getCounts(data.rows), [data.rows]);
  const filteredRows = React.useMemo(
    () =>
      data.rows.filter((row) => {
        const statusMatch = matchesStatus(row.status, statusFilter);
        const queryMatch =
          !trimmedQuery ||
          row.title.toLowerCase().includes(trimmedQuery) ||
          row.status.toLowerCase().includes(trimmedQuery) ||
          row.locale.toLowerCase().includes(trimmedQuery);

        return statusMatch && queryMatch;
      }),
    [data.rows, statusFilter, trimmedQuery]
  );
  const emptyCopy = getEmptyCopy({
    hasRows: data.rows.length > 0,
    hasQuery: trimmedQuery.length > 0,
    filter: statusFilter,
    fallbackTitle: emptyTitle,
    fallbackMessage: emptyMessage
  });

  return (
    <div className='space-y-5'>
      <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
        {STATUS_OPTIONS.map((option) => {
          const count = counts[option.value];
          const isActive = statusFilter === option.value;

          return (
            <button
              key={option.value}
              type='button'
              aria-pressed={isActive}
              className={cn(
                'bg-card rounded-[5px] border p-4 text-left shadow-xs transition-colors hover:border-primary/40 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none',
                isActive && 'border-primary/60 bg-primary/5'
              )}
              onClick={() => setStatusFilter(option.value)}
            >
              <span className='flex items-center justify-between gap-3'>
                <span className='text-muted-foreground text-xs font-medium uppercase tracking-[0.08em]'>
                  {option.label}
                </span>
                <Badge variant={isActive ? 'default' : 'outline'}>{count}</Badge>
              </span>
              <span className='mt-2 block text-sm leading-5 font-medium'>{option.description}</span>
            </button>
          );
        })}
      </div>

      <div className='bg-card rounded-[5px] border p-3 shadow-xs'>
        <div className='flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between'>
          <div className='relative w-full lg:max-w-md'>
            <Icons.search className='text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2' />
            <Input
              aria-label='Search portal records'
              className='pl-9'
              placeholder='Search by title, status, or locale'
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          <div className='flex flex-wrap gap-2'>
            {STATUS_OPTIONS.map((option) => (
              <Button
                key={option.value}
                type='button'
                size='sm'
                variant={statusFilter === option.value ? 'default' : 'outline'}
                onClick={() => setStatusFilter(option.value)}
              >
                {option.label}
                <Badge
                  className='ml-2'
                  variant={statusFilter === option.value ? 'secondary' : 'outline'}
                >
                  {counts[option.value]}
                </Badge>
              </Button>
            ))}
          </div>
        </div>

        <div className='mt-3 flex flex-col gap-3 border-t pt-3 sm:flex-row sm:items-center sm:justify-between'>
          <p className='text-muted-foreground text-sm'>
            Showing <span className='text-foreground font-medium'>{filteredRows.length}</span> of{' '}
            <span className='text-foreground font-medium'>{data.rows.length}</span> records
          </p>
          <div className='flex flex-wrap gap-2'>
            {newHref ? (
              <Button asChild size='sm' variant='outline'>
                <Link href={newHref}>
                  <Icons.add className='mr-2 size-4' />
                  Add new
                </Link>
              </Button>
            ) : (
              <Button disabled size='sm' variant='outline'>
                <Icons.add className='mr-2 size-4' />
                Add new
              </Button>
            )}
            <Button asChild size='sm' variant='secondary'>
              <a href={publicPath} rel='noopener noreferrer' target='_blank'>
                <Icons.externalLink className='mr-2 size-4' />
                View on site
              </a>
            </Button>
          </div>
        </div>
      </div>

      <PortalContentTable
        rows={filteredRows}
        editBasePath={editBasePath}
        emptyTitle={emptyCopy.title}
        emptyMessage={emptyCopy.message}
      />
    </div>
  );
}
