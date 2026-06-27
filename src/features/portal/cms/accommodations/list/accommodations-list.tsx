'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { parseAsInteger, parseAsString, parseAsStringEnum, useQueryStates } from 'nuqs';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Icons } from '@/components/icons';
import {
  formatAvailabilityLabel,
  formatCountryLabel
} from '@/features/accommodations/public/constants';
import { cn } from '@/lib/utils';
import { CMS_SURFACE } from '../../shared/surface';
import { accommodationsListKeys, accommodationsListQueryOptions } from './queries';
import {
  deleteAccommodationsPermanently,
  emptyAccommodationsTrash,
  restoreAccommodations,
  trashAccommodations
} from './service';
import type {
  AccommodationListItem,
  AccommodationListStatus,
  AccommodationListView
} from './types';

const TABLE_COLUMN_COUNT = 8;

function confirmDelete(ids: string[], message: string): boolean {
  if (typeof window !== 'undefined' && !window.confirm(message)) return false;
  return ids.length > 0;
}

function formatPrice(price: number | null) {
  if (price == null) return 'On request';
  return new Intl.NumberFormat('en-US', {
    currency: 'USD',
    maximumFractionDigits: 0,
    style: 'currency'
  }).format(price);
}

const STATUS_TABS: Array<{ value: AccommodationListStatus; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
  { value: 'trash', label: 'Trash' }
];

const listParsers = {
  status: parseAsStringEnum<AccommodationListStatus>([
    'all',
    'published',
    'draft',
    'trash'
  ]).withDefault('all'),
  s: parseAsString.withDefault(''),
  country: parseAsString.withDefault(''),
  property_type: parseAsString.withDefault(''),
  availability: parseAsString.withDefault(''),
  view: parseAsStringEnum<AccommodationListView>(['grid', 'table']).withDefault('grid'),
  paged: parseAsInteger.withDefault(1)
};

export function AccommodationsList() {
  const queryClient = useQueryClient();
  const [params, setParams] = useQueryStates(listParsers, { shallow: true });
  const {
    status,
    s: search,
    country,
    property_type: propertyType,
    availability,
    view,
    paged: page
  } = params;

  const { data, isFetching } = useQuery({
    ...accommodationsListQueryOptions({
      status,
      search,
      country,
      propertyType,
      availability,
      page
    }),
    placeholderData: keepPreviousData
  });

  const items = data?.items ?? [];
  const counts = data?.counts ?? { all: 0, published: 0, draft: 0, trash: 0 };
  const total = data?.total ?? 0;
  const pageSize = data?.pageSize ?? 20;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const isTrashView = status === 'trash';

  const resetKey = `${status}|${search}|${country}|${propertyType}|${availability}|${page}`;
  const [selected, setSelected] = React.useState<string[]>([]);
  const [bulkAction, setBulkAction] = React.useState('');
  const [searchInput, setSearchInput] = React.useState(search);
  React.useEffect(() => {
    setSelected([]);
    setBulkAction('');
  }, [resetKey]);
  React.useEffect(() => {
    setSearchInput(search);
  }, [search]);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: accommodationsListKeys.all });

  const trashMutation = useMutation({
    mutationFn: (ids: string[]) => trashAccommodations(ids),
    onSuccess: (_data, ids) => {
      toast.success(ids.length > 1 ? `${ids.length} moved to trash.` : 'Moved to trash.');
      setSelected([]);
      void invalidate();
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : 'Action failed.')
  });

  const restoreMutation = useMutation({
    mutationFn: (ids: string[]) => restoreAccommodations(ids),
    onSuccess: (_data, ids) => {
      toast.success(ids.length > 1 ? `${ids.length} restored.` : 'Restored.');
      setSelected([]);
      void invalidate();
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : 'Action failed.')
  });

  const deleteMutation = useMutation({
    mutationFn: (ids: string[]) => deleteAccommodationsPermanently(ids),
    onSuccess: (_data, ids) => {
      toast.success(ids.length > 1 ? `${ids.length} deleted permanently.` : 'Deleted permanently.');
      setSelected([]);
      void invalidate();
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : 'Action failed.')
  });

  const emptyTrashMutation = useMutation({
    mutationFn: () => emptyAccommodationsTrash(),
    onSuccess: () => {
      toast.success('Trash emptied.');
      setSelected([]);
      void invalidate();
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : 'Action failed.')
  });

  const allSelected = items.length > 0 && selected.length === items.length;
  const someSelected = selected.length > 0 && !allSelected;

  function toggleAll() {
    setSelected(allSelected ? [] : items.map((item) => item.id));
  }
  function toggleOne(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function applyBulkAction() {
    if (!selected.length || !bulkAction) return;
    if (bulkAction === 'trash') trashMutation.mutate(selected);
    if (bulkAction === 'restore') restoreMutation.mutate(selected);
    if (bulkAction === 'delete') {
      if (
        confirmDelete(
          selected,
          `Permanently delete ${selected.length} accommodation(s)? This cannot be undone.`
        )
      ) {
        deleteMutation.mutate(selected);
      }
    }
  }

  function updateFilters(next: Partial<typeof params>) {
    void setParams({ ...next, paged: 1 });
  }

  const isBusy =
    isFetching ||
    trashMutation.isPending ||
    restoreMutation.isPending ||
    deleteMutation.isPending ||
    emptyTrashMutation.isPending;

  return (
    <div className='min-h-full space-y-3 bg-white'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <nav className='flex flex-wrap items-center gap-x-2 gap-y-1 text-sm'>
          {STATUS_TABS.map((tab, index) => {
            const isActive = status === tab.value;
            const count = counts[tab.value];
            if (tab.value === 'draft' && count === 0 && status !== 'draft') return null;
            return (
              <span key={tab.value} className='flex items-center'>
                {index > 0 ? <span className='mr-2 text-muted-foreground'>|</span> : null}
                <button
                  type='button'
                  onClick={() => void setParams({ status: tab.value, paged: 1 })}
                  className={cn(
                    'hover:text-[#3c5142]',
                    isActive ? 'font-semibold text-[#3c5142]' : 'text-muted-foreground'
                  )}
                >
                  {tab.label} <span className='text-muted-foreground'>({count})</span>
                </button>
              </span>
            );
          })}
        </nav>

        <form
          className='flex items-center gap-2'
          onSubmit={(event) => {
            event.preventDefault();
            updateFilters({ s: searchInput.trim() });
          }}
        >
          <Input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder='Search accommodations'
            className='h-9 w-56'
          />
          <Button type='submit' size='sm' variant='outline'>
            Search
          </Button>
        </form>
      </div>

      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div className='flex flex-wrap items-center gap-2'>
          <Select value={bulkAction || undefined} onValueChange={setBulkAction}>
            <SelectTrigger size='sm' className='w-40'>
              <SelectValue placeholder='Bulk actions' />
            </SelectTrigger>
            <SelectContent className={CMS_SURFACE}>
              {isTrashView ? (
                <>
                  <SelectItem value='restore'>Restore</SelectItem>
                  <SelectItem value='delete'>Delete permanently</SelectItem>
                </>
              ) : (
                <SelectItem value='trash'>Move to Trash</SelectItem>
              )}
            </SelectContent>
          </Select>
          <Button
            type='button'
            size='sm'
            variant='outline'
            disabled={!selected.length || !bulkAction || isBusy}
            onClick={applyBulkAction}
          >
            Apply
          </Button>

          <Select
            value={country || 'all'}
            onValueChange={(value) => updateFilters({ country: value === 'all' ? '' : value })}
          >
            <SelectTrigger size='sm' className='w-40'>
              <SelectValue placeholder='All countries' />
            </SelectTrigger>
            <SelectContent className={CMS_SURFACE}>
              <SelectItem value='all'>All countries</SelectItem>
              {(data?.countries ?? []).map((value) => (
                <SelectItem key={value} value={value}>
                  {formatCountryLabel(value) ?? value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={propertyType || 'all'}
            onValueChange={(value) =>
              updateFilters({ property_type: value === 'all' ? '' : value })
            }
          >
            <SelectTrigger size='sm' className='w-44'>
              <SelectValue placeholder='All types' />
            </SelectTrigger>
            <SelectContent className={CMS_SURFACE}>
              <SelectItem value='all'>All types</SelectItem>
              {(data?.propertyTypes ?? []).map((value) => (
                <SelectItem key={value} value={value}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={availability || 'all'}
            onValueChange={(value) => updateFilters({ availability: value === 'all' ? '' : value })}
          >
            <SelectTrigger size='sm' className='w-40'>
              <SelectValue placeholder='Availability' />
            </SelectTrigger>
            <SelectContent className={CMS_SURFACE}>
              <SelectItem value='all'>All availability</SelectItem>
              <SelectItem value='available'>Available</SelectItem>
              <SelectItem value='limited'>Limited</SelectItem>
              <SelectItem value='on_request'>On request</SelectItem>
            </SelectContent>
          </Select>

          {isTrashView && counts.trash > 0 ? (
            <Button
              type='button'
              size='sm'
              variant='outline'
              isLoading={emptyTrashMutation.isPending}
              onClick={() => {
                if (confirmDelete(['x'], 'Permanently delete all trashed accommodations?')) {
                  emptyTrashMutation.mutate();
                }
              }}
            >
              Empty trash
            </Button>
          ) : null}
        </div>

        <div className='flex items-center gap-2'>
          <p className='text-muted-foreground text-sm'>{total} items</p>
          <div className='flex rounded-md border'>
            <button
              type='button'
              aria-label='Grid view'
              className={cn(
                'inline-flex items-center justify-center px-2.5 py-1.5 transition-colors',
                view === 'grid'
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              onClick={() => void setParams({ view: 'grid' })}
            >
              <Icons.dashboard className='size-4' />
            </button>
            <button
              type='button'
              aria-label='Table view'
              className={cn(
                'inline-flex items-center justify-center border-l px-2.5 py-1.5 transition-colors',
                view === 'table'
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              onClick={() => void setParams({ view: 'table' })}
            >
              <Icons.page className='size-4' />
            </button>
          </div>
        </div>
      </div>

      {view === 'grid' ? (
        <AccommodationGrid
          allSelected={allSelected}
          isBusy={isBusy}
          isFetching={isFetching}
          isTrashView={isTrashView}
          items={items}
          onDelete={(id, name) => {
            if (confirmDelete([id], `Permanently delete “${name}”? This cannot be undone.`)) {
              deleteMutation.mutate([id]);
            }
          }}
          onRestore={(id) => restoreMutation.mutate([id])}
          onToggleAll={toggleAll}
          onToggleOne={toggleOne}
          selected={selected}
          someSelected={someSelected}
          onTrash={(id) => trashMutation.mutate([id])}
        />
      ) : (
        <div className='overflow-hidden rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-10'>
                  <Checkbox
                    checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                    onCheckedChange={toggleAll}
                    aria-label='Select all'
                  />
                </TableHead>
                <TableHead>Property</TableHead>
                <TableHead className='w-28'>Status</TableHead>
                <TableHead className='w-28'>Country</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className='w-32'>Type</TableHead>
                <TableHead className='w-28'>Availability</TableHead>
                <TableHead className='w-28'>Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={TABLE_COLUMN_COUNT}
                    className='py-12 text-center text-muted-foreground'
                  >
                    {isFetching ? 'Loading…' : 'No accommodations found.'}
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <AccommodationTableRow
                    key={item.id}
                    item={item}
                    isTrashView={isTrashView}
                    selected={selected.includes(item.id)}
                    onToggle={() => toggleOne(item.id)}
                    onTrash={() => trashMutation.mutate([item.id])}
                    onRestore={() => restoreMutation.mutate([item.id])}
                    onDelete={() => {
                      if (
                        confirmDelete(
                          [item.id],
                          `Permanently delete “${item.name}”? This cannot be undone.`
                        )
                      ) {
                        deleteMutation.mutate([item.id]);
                      }
                    }}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {totalPages > 1 ? (
        <div className='flex items-center justify-end gap-2'>
          <span className='text-muted-foreground text-sm'>
            Page {page} of {totalPages}
          </span>
          <Button
            type='button'
            size='sm'
            variant='outline'
            disabled={page <= 1 || isBusy}
            onClick={() => void setParams({ paged: Math.max(1, page - 1) })}
          >
            <Icons.chevronLeft className='size-4' />
            Prev
          </Button>
          <Button
            type='button'
            size='sm'
            variant='outline'
            disabled={page >= totalPages || isBusy}
            onClick={() => void setParams({ paged: Math.min(totalPages, page + 1) })}
          >
            Next
            <Icons.chevronRight className='size-4' />
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function AvailabilityBadge({ availability }: { availability: string | null }) {
  const label = formatAvailabilityLabel(
    availability === 'available' || availability === 'limited' || availability === 'on_request'
      ? availability
      : 'on_request'
  );
  const tone =
    availability === 'available'
      ? 'border-[#3c5142] text-[#3c5142]'
      : availability === 'limited'
        ? 'border-[#D99A2B] text-[#5D2411]'
        : 'text-muted-foreground';

  return (
    <span
      className={cn(
        'inline-flex rounded-[3px] border px-2 py-0.5 text-xs font-medium uppercase',
        tone
      )}
    >
      {label}
    </span>
  );
}

function StatusPill({ status }: { status: string }) {
  if (status === 'published') {
    return (
      <span className='inline-flex items-center rounded-[3px] border border-[#3c5142] px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-[#3c5142]'>
        Published
      </span>
    );
  }
  if (status === 'trash') {
    return (
      <span className='text-muted-foreground inline-flex items-center rounded-[3px] border px-2 py-0.5 text-xs font-medium uppercase tracking-wide'>
        Trash
      </span>
    );
  }
  return (
    <span className='text-muted-foreground inline-flex items-center rounded-[3px] border px-2 py-0.5 text-xs font-medium uppercase tracking-wide'>
      Draft
    </span>
  );
}

interface AccommodationGridProps {
  allSelected: boolean;
  isBusy: boolean;
  isFetching: boolean;
  isTrashView: boolean;
  items: AccommodationListItem[];
  onDelete: (id: string, name: string) => void;
  onRestore: (id: string) => void;
  onToggleAll: () => void;
  onToggleOne: (id: string) => void;
  onTrash: (id: string) => void;
  selected: string[];
  someSelected: boolean;
}

function AccommodationGrid({
  allSelected,
  isFetching,
  isTrashView,
  items,
  onDelete,
  onRestore,
  onToggleAll,
  onToggleOne,
  onTrash,
  selected,
  someSelected
}: AccommodationGridProps) {
  if (!items.length) {
    return (
      <div className='rounded-md border py-16 text-center text-muted-foreground'>
        {isFetching ? 'Loading…' : 'No accommodations found.'}
      </div>
    );
  }

  return (
    <div className='space-y-3'>
      <div className='flex items-center gap-2 text-sm'>
        <Checkbox
          checked={allSelected ? true : someSelected ? 'indeterminate' : false}
          onCheckedChange={onToggleAll}
          aria-label='Select all'
        />
        <span className='text-muted-foreground'>Select all on this page</span>
      </div>
      <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>
        {items.map((item) => (
          <AccommodationGridCard
            key={item.id}
            item={item}
            isTrashView={isTrashView}
            selected={selected.includes(item.id)}
            onToggle={() => onToggleOne(item.id)}
            onTrash={() => onTrash(item.id)}
            onRestore={() => onRestore(item.id)}
            onDelete={() => onDelete(item.id, item.name)}
          />
        ))}
      </div>
    </div>
  );
}

function AccommodationGridCard({
  item,
  isTrashView,
  selected,
  onToggle,
  onTrash,
  onRestore,
  onDelete
}: {
  item: AccommodationListItem;
  isTrashView: boolean;
  selected: boolean;
  onToggle: () => void;
  onTrash: () => void;
  onRestore: () => void;
  onDelete: () => void;
}) {
  const location = [item.region, formatCountryLabel(item.country)].filter(Boolean).join(', ');

  return (
    <article
      className={cn(
        'group overflow-hidden rounded-md border bg-card transition-shadow hover:shadow-md',
        selected && 'ring-2 ring-[#3c5142]/30'
      )}
    >
      <div className='relative aspect-[16/10] bg-muted'>
        {item.imageUrl ? (
          <Image
            alt={item.imageAlt || item.name}
            className='object-cover'
            fill
            sizes='(max-width:768px) 100vw, 33vw'
            src={item.imageUrl}
          />
        ) : (
          <div className='absolute inset-0 flex items-center justify-center bg-[#3c5142]/10'>
            <Icons.media className='size-8 text-muted-foreground/50' />
          </div>
        )}
        <div className='absolute left-2 top-2'>
          <Checkbox
            checked={selected}
            onCheckedChange={onToggle}
            aria-label={`Select ${item.name}`}
          />
        </div>
        <div className='absolute right-2 top-2'>
          <AvailabilityBadge availability={item.availability} />
        </div>
      </div>

      <div className='space-y-3 p-4'>
        <div>
          <h3 className='font-semibold leading-snug'>
            {isTrashView ? (
              item.name
            ) : (
              <Link
                className='text-[#3c5142] hover:underline'
                href={`/portal/accommodations/${item.id}`}
              >
                {item.name}
              </Link>
            )}
          </h3>
          <p className='text-muted-foreground mt-1 text-sm'>{location || '—'}</p>
          {item.propertyType ? (
            <p className='text-muted-foreground mt-1 text-xs uppercase tracking-wide'>
              {item.propertyType}
            </p>
          ) : null}
        </div>

        <div className='flex items-end justify-between gap-3 border-t pt-3'>
          <div>
            <span className='text-muted-foreground text-xs uppercase'>From</span>
            <p className='font-semibold text-[#5D2411]'>{formatPrice(item.pricePerNight)}</p>
            {item.pricePerNight != null ? (
              <span className='text-muted-foreground text-xs'>/ night</span>
            ) : null}
          </div>
          <div className='flex items-center gap-2 text-sm'>
            {isTrashView ? (
              <>
                <button
                  type='button'
                  className='text-[#3c5142] hover:underline'
                  onClick={onRestore}
                >
                  Restore
                </button>
                <button
                  type='button'
                  className='text-destructive hover:underline'
                  onClick={onDelete}
                >
                  Delete
                </button>
              </>
            ) : (
              <>
                <Link
                  className='text-[#3c5142] hover:underline'
                  href={`/portal/accommodations/${item.id}`}
                >
                  Edit
                </Link>
                <button
                  type='button'
                  className='text-destructive inline-flex items-center gap-1 hover:underline'
                  onClick={onTrash}
                >
                  <Icons.trash className='size-3.5' />
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function AccommodationTableRow({
  item,
  isTrashView,
  selected,
  onToggle,
  onTrash,
  onRestore,
  onDelete
}: {
  item: AccommodationListItem;
  isTrashView: boolean;
  selected: boolean;
  onToggle: () => void;
  onTrash: () => void;
  onRestore: () => void;
  onDelete: () => void;
}) {
  return (
    <TableRow data-state={selected ? 'selected' : undefined} className='group'>
      <TableCell>
        <Checkbox
          checked={selected}
          onCheckedChange={onToggle}
          aria-label={`Select ${item.name}`}
        />
      </TableCell>
      <TableCell>
        <div className='flex items-center gap-3'>
          <div className='relative size-10 shrink-0 overflow-hidden rounded bg-muted'>
            {item.imageUrl ? (
              <Image alt='' className='object-cover' fill sizes='40px' src={item.imageUrl} />
            ) : null}
          </div>
          <div>
            <div className='font-medium'>
              {isTrashView ? (
                <span>{item.name}</span>
              ) : (
                <Link
                  href={`/portal/accommodations/${item.id}`}
                  className='text-[#3c5142] hover:underline'
                >
                  {item.name}
                </Link>
              )}
            </div>
            <div className='mt-1 flex items-center gap-2 text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100'>
              {isTrashView ? (
                <>
                  <RowAction onClick={onRestore}>Restore</RowAction>
                  <span aria-hidden>|</span>
                  <RowAction onClick={onDelete} destructive>
                    Delete Permanently
                  </RowAction>
                </>
              ) : (
                <>
                  <Link href={`/portal/accommodations/${item.id}`} className='hover:text-[#3c5142]'>
                    Edit
                  </Link>
                  <span aria-hidden>|</span>
                  <RowAction onClick={onTrash} destructive>
                    Trash
                  </RowAction>
                  <span aria-hidden>|</span>
                  <a
                    href={`/en/accommodations/${item.slug}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='hover:text-[#3c5142]'
                  >
                    View
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <StatusPill status={item.status} />
      </TableCell>
      <TableCell className='text-sm'>{formatCountryLabel(item.country) ?? '—'}</TableCell>
      <TableCell className='text-sm'>{item.region || '—'}</TableCell>
      <TableCell className='text-sm'>{item.propertyType || '—'}</TableCell>
      <TableCell>
        <AvailabilityBadge availability={item.availability} />
      </TableCell>
      <TableCell className='text-sm font-medium'>{formatPrice(item.pricePerNight)}</TableCell>
    </TableRow>
  );
}

function RowAction({
  onClick,
  destructive,
  children
}: {
  onClick: () => void;
  destructive?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={cn('hover:underline', destructive ? 'text-destructive' : 'hover:text-[#3c5142]')}
    >
      {children}
    </button>
  );
}
