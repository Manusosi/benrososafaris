'use client';

import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { TableCell, TableRow } from '@/components/ui/table';
import { CMS_SURFACE } from '../../shared/surface';
import type { ArticleCategoryOption, ArticleListItem, ArticleQuickEditInput } from './types';

interface QuickEditRowProps {
  item: ArticleListItem;
  columnCount: number;
  categories: ArticleCategoryOption[];
  isSaving: boolean;
  onCancel: () => void;
  onSave: (input: ArticleQuickEditInput) => void;
}

const NO_CATEGORY = '__none__';
const pad = (n: number) => String(n).padStart(2, '0');

/** Converts an ISO timestamp to the `datetime-local` input format. */
function toLocalInput(iso: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/**
 * Inline Quick Edit, mirroring WordPress: edit the title, slug, status, primary
 * category, focus keyword, and publish date/time without leaving the list.
 */
export function QuickEditRow({
  item,
  columnCount,
  categories,
  isSaving,
  onCancel,
  onSave
}: QuickEditRowProps) {
  const [title, setTitle] = React.useState(item.title);
  const [slug, setSlug] = React.useState(item.slug);
  const [categoryId, setCategoryId] = React.useState(item.categoryId ?? NO_CATEGORY);
  const [focusKeyword, setFocusKeyword] = React.useState(item.focusKeyword ?? '');
  const [status, setStatus] = React.useState<'published' | 'draft'>(
    item.status === 'published' ? 'published' : 'draft'
  );
  const [publishedAt, setPublishedAt] = React.useState(toLocalInput(item.publishedAt));

  function handleSave() {
    const isoPublished = publishedAt ? new Date(publishedAt).toISOString() : '';
    onSave({
      id: item.id,
      title,
      slug,
      categoryId: categoryId === NO_CATEGORY ? '' : categoryId,
      focusKeyword,
      status,
      publishedAt: isoPublished
    });
  }

  return (
    <TableRow className='bg-muted/30'>
      <TableCell colSpan={columnCount} className='p-4'>
        <div className='grid gap-4'>
          <p className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
            Quick edit
          </p>
          <div className='grid gap-3 sm:grid-cols-2'>
            <div className='grid gap-1.5'>
              <Label htmlFor={`qe-title-${item.id}`}>Title</Label>
              <Input
                id={`qe-title-${item.id}`}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </div>
            <div className='grid gap-1.5'>
              <Label htmlFor={`qe-slug-${item.id}`}>Slug</Label>
              <Input
                id={`qe-slug-${item.id}`}
                value={slug}
                onChange={(event) => setSlug(event.target.value)}
              />
            </div>
            <div className='grid gap-1.5'>
              <Label htmlFor={`qe-category-${item.id}`}>Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger id={`qe-category-${item.id}`} className='w-full'>
                  <SelectValue placeholder='No category' />
                </SelectTrigger>
                <SelectContent className={CMS_SURFACE}>
                  <SelectItem value={NO_CATEGORY}>No category</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='grid gap-1.5'>
              <Label htmlFor={`qe-keyword-${item.id}`}>Focus keyword</Label>
              <Input
                id={`qe-keyword-${item.id}`}
                value={focusKeyword}
                onChange={(event) => setFocusKeyword(event.target.value)}
              />
            </div>
            <div className='grid gap-1.5'>
              <Label htmlFor={`qe-date-${item.id}`}>Publish date &amp; time</Label>
              <Input
                id={`qe-date-${item.id}`}
                type='datetime-local'
                value={publishedAt}
                onChange={(event) => setPublishedAt(event.target.value)}
              />
            </div>
            <div className='grid gap-1.5'>
              <Label htmlFor={`qe-status-${item.id}`}>Status</Label>
              <Select
                value={status}
                onValueChange={(value) => setStatus(value as 'published' | 'draft')}
              >
                <SelectTrigger id={`qe-status-${item.id}`} className='w-full'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={CMS_SURFACE}>
                  <SelectItem value='published'>Published</SelectItem>
                  <SelectItem value='draft'>Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <Button type='button' size='sm' isLoading={isSaving} onClick={handleSave}>
              Update
            </Button>
            <Button
              type='button'
              size='sm'
              variant='outline'
              disabled={isSaving}
              onClick={onCancel}
            >
              Cancel
            </Button>
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
}
