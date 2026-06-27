'use client';

import * as React from 'react';
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
import { cn } from '@/lib/utils';
import { CMS_SURFACE } from '../../shared/surface';
import { QuickEditRow } from './quick-edit-row';
import { articlesListKeys, articlesListQueryOptions } from './queries';
import {
  deleteArticlesPermanently,
  emptyArticlesTrash,
  quickEditArticle,
  restoreArticles,
  trashArticles
} from './service';
import type { ArticleListItem, ArticleListStatus, ArticleQuickEditInput } from './types';

const COLUMN_COUNT = 7;

function confirmDelete(ids: string[], message: string): boolean {
  if (typeof window !== 'undefined' && !window.confirm(message)) return false;
  return ids.length > 0;
}

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

const STATUS_TABS: Array<{ value: ArticleListStatus; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
  { value: 'trash', label: 'Trash' }
];

const listParsers = {
  status: parseAsStringEnum<ArticleListStatus>(['all', 'published', 'draft', 'trash']).withDefault(
    'all'
  ),
  s: parseAsString.withDefault(''),
  cat: parseAsString.withDefault(''),
  m: parseAsString.withDefault(''),
  paged: parseAsInteger.withDefault(1)
};

export function BlogArticlesList() {
  const queryClient = useQueryClient();
  const [params, setParams] = useQueryStates(listParsers, { shallow: true });
  const { status, s: search, cat: category, m: month, paged: page } = params;

  const { data, isFetching } = useQuery({
    ...articlesListQueryOptions({ status, search, category, month, page }),
    placeholderData: keepPreviousData
  });

  const items = data?.items ?? [];
  const counts = data?.counts ?? { all: 0, published: 0, draft: 0, trash: 0 };
  const categories = data?.categories ?? [];
  const total = data?.total ?? 0;
  const pageSize = data?.pageSize ?? 20;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const isTrashView = status === 'trash';

  // Selection + quick-edit reset whenever the visible result set changes.
  const resetKey = `${status}|${search}|${category}|${month}|${page}`;
  const [selected, setSelected] = React.useState<string[]>([]);
  const [quickEditId, setQuickEditId] = React.useState<string | null>(null);
  const [bulkAction, setBulkAction] = React.useState('');
  const [searchInput, setSearchInput] = React.useState(search);
  React.useEffect(() => {
    setSelected([]);
    setQuickEditId(null);
    setBulkAction('');
  }, [resetKey]);
  React.useEffect(() => {
    setSearchInput(search);
  }, [search]);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: articlesListKeys.all });

  const trashMutation = useMutation({
    mutationFn: (ids: string[]) => trashArticles(ids),
    onSuccess: (_data, ids) => {
      toast.success(ids.length > 1 ? `${ids.length} moved to trash.` : 'Moved to trash.');
      setSelected([]);
      void invalidate();
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : 'Action failed.')
  });

  const restoreMutation = useMutation({
    mutationFn: (ids: string[]) => restoreArticles(ids),
    onSuccess: (_data, ids) => {
      toast.success(ids.length > 1 ? `${ids.length} restored.` : 'Restored.');
      setSelected([]);
      void invalidate();
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : 'Action failed.')
  });

  const deleteMutation = useMutation({
    mutationFn: (ids: string[]) => deleteArticlesPermanently(ids),
    onSuccess: (_data, ids) => {
      toast.success(ids.length > 1 ? `${ids.length} deleted permanently.` : 'Deleted permanently.');
      setSelected([]);
      void invalidate();
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : 'Action failed.')
  });

  const emptyTrashMutation = useMutation({
    mutationFn: () => emptyArticlesTrash(),
    onSuccess: () => {
      toast.success('Trash emptied.');
      setSelected([]);
      void invalidate();
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : 'Action failed.')
  });

  const quickEditMutation = useMutation({
    mutationFn: (input: ArticleQuickEditInput) => quickEditArticle(input),
    onSuccess: () => {
      toast.success('Article updated.');
      setQuickEditId(null);
      void invalidate();
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : 'Update failed.')
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
          `Permanently delete ${selected.length} article(s)? This cannot be undone.`
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
    <div className='space-y-3'>
      {/* Status tabs + search */}
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <nav className='flex flex-wrap items-center gap-x-2 gap-y-1 text-sm'>
          {STATUS_TABS.map((tab, index) => {
            const isActive = status === tab.value;
            const count = counts[tab.value];
            // Match WordPress: hide empty Draft tab, always show All/Published/Trash.
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
            placeholder='Search articles'
            className='h-9 w-56'
          />
          <Button type='submit' size='sm' variant='outline'>
            Search
          </Button>
        </form>
      </div>

      {/* Toolbar: bulk actions + filters + count */}
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
            value={month || 'all'}
            onValueChange={(value) => updateFilters({ m: value === 'all' ? '' : value })}
          >
            <SelectTrigger size='sm' className='w-40'>
              <SelectValue placeholder='All dates' />
            </SelectTrigger>
            <SelectContent className={CMS_SURFACE}>
              <SelectItem value='all'>All dates</SelectItem>
              {(data?.months ?? []).map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={category || 'all'}
            onValueChange={(value) => updateFilters({ cat: value === 'all' ? '' : value })}
          >
            <SelectTrigger size='sm' className='w-44'>
              <SelectValue placeholder='All categories' />
            </SelectTrigger>
            <SelectContent className={CMS_SURFACE}>
              <SelectItem value='all'>All categories</SelectItem>
              {categories.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {isTrashView && counts.trash > 0 ? (
            <Button
              type='button'
              size='sm'
              variant='outline'
              isLoading={emptyTrashMutation.isPending}
              onClick={() => {
                if (confirmDelete(['x'], 'Permanently delete all trashed articles?')) {
                  emptyTrashMutation.mutate();
                }
              }}
            >
              Empty trash
            </Button>
          ) : null}
        </div>

        <p className='text-muted-foreground text-sm'>{total} items</p>
      </div>

      {/* Table */}
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
              <TableHead>Article</TableHead>
              <TableHead className='w-28'>Status</TableHead>
              <TableHead className='w-36'>Category</TableHead>
              <TableHead className='w-44'>Keyword (main)</TableHead>
              <TableHead className='w-28'>SEO score</TableHead>
              <TableHead className='w-32'>Published</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={COLUMN_COUNT}
                  className='py-12 text-center text-muted-foreground'
                >
                  {isFetching ? 'Loading…' : 'No articles found.'}
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) =>
                quickEditId === item.id ? (
                  <QuickEditRow
                    key={item.id}
                    item={item}
                    columnCount={COLUMN_COUNT}
                    categories={categories}
                    isSaving={quickEditMutation.isPending}
                    onCancel={() => setQuickEditId(null)}
                    onSave={(input) => quickEditMutation.mutate(input)}
                  />
                ) : (
                  <ArticleRow
                    key={item.id}
                    item={item}
                    isTrashView={isTrashView}
                    selected={selected.includes(item.id)}
                    onToggle={() => toggleOne(item.id)}
                    onQuickEdit={() => setQuickEditId(item.id)}
                    onTrash={() => trashMutation.mutate([item.id])}
                    onRestore={() => restoreMutation.mutate([item.id])}
                    onDelete={() => {
                      if (
                        confirmDelete(
                          [item.id],
                          `Permanently delete “${item.title}”? This cannot be undone.`
                        )
                      ) {
                        deleteMutation.mutate([item.id]);
                      }
                    }}
                  />
                )
              )
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
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

function SeoScoreBadge({ score }: { score: number }) {
  // Mirror the SEO analyzer colour thresholds (good ≥ 80, ok ≥ 50, else poor).
  const tone =
    score >= 80
      ? { dot: 'bg-emerald-500', text: 'text-emerald-700' }
      : score >= 50
        ? { dot: 'bg-amber-500', text: 'text-amber-700' }
        : { dot: 'bg-red-500', text: 'text-red-700' };

  return (
    <span className='inline-flex items-center gap-1.5'>
      <span className={cn('size-2 shrink-0 rounded-full', tone.dot)} aria-hidden />
      <span className={cn('text-sm font-medium tabular-nums', tone.text)}>{score}%</span>
    </span>
  );
}

interface ArticleRowProps {
  item: ArticleListItem;
  isTrashView: boolean;
  selected: boolean;
  onToggle: () => void;
  onQuickEdit: () => void;
  onTrash: () => void;
  onRestore: () => void;
  onDelete: () => void;
}

function ArticleRow({
  item,
  isTrashView,
  selected,
  onToggle,
  onQuickEdit,
  onTrash,
  onRestore,
  onDelete
}: ArticleRowProps) {
  return (
    <TableRow data-state={selected ? 'selected' : undefined} className='group'>
      <TableCell>
        <Checkbox
          checked={selected}
          onCheckedChange={onToggle}
          aria-label={`Select ${item.title}`}
        />
      </TableCell>
      <TableCell>
        <div className='font-medium'>
          {isTrashView ? (
            <span>{item.title}</span>
          ) : (
            <Link href={`/portal/blog/${item.id}`} className='text-[#3c5142] hover:underline'>
              {item.title}
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
              <Link href={`/portal/blog/${item.id}`} className='hover:text-[#3c5142]'>
                Edit
              </Link>
              <span aria-hidden>|</span>
              <RowAction onClick={onQuickEdit}>Quick Edit</RowAction>
              <span aria-hidden>|</span>
              <RowAction onClick={onTrash} destructive>
                Trash
              </RowAction>
              <span aria-hidden>|</span>
              <a
                href={`/en/blog/${item.slug}`}
                target='_blank'
                rel='noopener noreferrer'
                className='hover:text-[#3c5142]'
              >
                View
              </a>
            </>
          )}
        </div>
      </TableCell>
      <TableCell>
        <StatusPill status={item.status} />
      </TableCell>
      <TableCell className='text-sm'>{item.category || '—'}</TableCell>
      <TableCell className='text-muted-foreground text-sm'>{item.focusKeyword || '—'}</TableCell>
      <TableCell>
        <SeoScoreBadge score={item.seoScore} />
      </TableCell>
      <TableCell className='text-muted-foreground text-sm'>
        {formatDate(item.publishedAt)}
      </TableCell>
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
