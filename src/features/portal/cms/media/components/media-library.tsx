'use client';

import * as React from 'react';
import Image from 'next/image';
import { useDropzone } from 'react-dropzone';
import { useMutation, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Icons } from '@/components/icons';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { deleteMediaAsset, updateMediaAsset, uploadMediaFile } from '../api/client';
import { mediaInfiniteListQueryOptions, mediaKeys } from '../api/queries';
import type { MediaAsset } from '../api/types';
import { CMS_SURFACE } from '../../shared/surface';

interface MediaLibraryProps {
  /** Currently selected asset ids (controlled). */
  selectedIds?: string[];
  onSelectedChange?: (ids: string[]) => void;
  /** Allow selecting more than one asset. Defaults to true. */
  multiple?: boolean;
  /**
   * Constrain the library to its parent's height and scroll the thumbnail grid
   * internally (used inside the picker dialog). Defaults to false so the
   * standalone page grows with its content.
   */
  scrollable?: boolean;
  className?: string;
}

function useDebounced<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

/**
 * WordPress-style media library: a square thumbnail grid with drag-and-drop
 * upload, search, and an inline details editor (alt text, caption, permanent
 * delete). Reused both as the standalone Media page and inside the picker
 * dialog.
 */
export function MediaLibrary({
  selectedIds = [],
  onSelectedChange,
  multiple = true,
  scrollable = false,
  className
}: MediaLibraryProps) {
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = React.useState('');
  const search = useDebounced(searchInput);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [isUploading, setUploading] = React.useState(false);

  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } = useInfiniteQuery(
    mediaInfiniteListQueryOptions(search)
  );
  const items = data?.pages.flatMap((page) => page.items) ?? [];
  const total = data?.pages[0]?.total ?? 0;
  const showInitialLoading = isLoading && items.length === 0;
  const activeAsset = items.find((item) => item.id === activeId) ?? null;

  const selectable = Boolean(onSelectedChange);

  function toggleSelection(asset: MediaAsset) {
    setActiveId(asset.id);
    if (!onSelectedChange) return;
    if (multiple) {
      onSelectedChange(
        selectedIds.includes(asset.id)
          ? selectedIds.filter((id) => id !== asset.id)
          : [...selectedIds, asset.id]
      );
    } else {
      onSelectedChange(selectedIds.includes(asset.id) ? [] : [asset.id]);
    }
  }

  async function handleFiles(files: File[]) {
    if (files.length === 0) return;
    setUploading(true);
    let uploaded = 0;
    try {
      for (const file of files) {
        await uploadMediaFile(file);
        uploaded += 1;
      }
      await queryClient.invalidateQueries({ queryKey: mediaKeys.all });
      toast.success(`Uploaded ${uploaded} ${uploaded === 1 ? 'file' : 'files'}.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  }

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept: { 'image/*': [] },
    noClick: true,
    noKeyboard: true,
    onDrop: (accepted) => void handleFiles(accepted)
  });

  return (
    <div
      className={cn(
        'grid gap-4 lg:grid-cols-[1fr_300px]',
        scrollable && 'min-h-0 flex-1',
        className
      )}
    >
      <div className={cn('min-w-0 space-y-3', scrollable && 'flex min-h-0 flex-col')}>
        <div className={cn('flex flex-wrap items-center gap-2', scrollable && 'shrink-0')}>
          <div className='relative flex-1 min-w-[12rem]'>
            <Icons.search className='text-muted-foreground absolute left-2.5 top-1/2 size-4 -translate-y-1/2' />
            <Input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder='Search by alt text, caption, or file…'
              className='pl-8'
            />
          </div>
          <Button type='button' variant='outline' onClick={open} isLoading={isUploading}>
            <Icons.upload className='size-4' />
            Upload
          </Button>
        </div>

        <div
          {...getRootProps()}
          className={cn(
            'rounded-[3px] border border-dashed border-[#D1D5DB] p-1 transition-colors',
            isDragActive && 'border-foreground bg-muted',
            scrollable && 'min-h-0 flex-1 overflow-y-auto'
          )}
        >
          <input {...getInputProps()} />

          {showInitialLoading ? (
            <div className='text-muted-foreground flex h-40 items-center justify-center text-sm'>
              <Icons.spinner className='mr-2 size-4 animate-spin' />
              Loading media…
            </div>
          ) : items.length === 0 ? (
            <div className='flex h-40 flex-col items-center justify-center gap-2 text-center'>
              <Icons.media className='text-muted-foreground size-8' />
              <p className='text-sm font-medium'>No media yet</p>
              <p className='text-muted-foreground text-xs'>
                Drag &amp; drop images here, or use the Upload button.
              </p>
            </div>
          ) : (
            <div className='grid grid-cols-3 gap-1.5 p-1.5 sm:grid-cols-4 md:grid-cols-5'>
              {items.map((asset) => (
                <MediaTile
                  key={asset.id}
                  asset={asset}
                  active={activeId === asset.id}
                  selected={selectedIds.includes(asset.id)}
                  selectable={selectable}
                  onClick={() => toggleSelection(asset)}
                />
              ))}
            </div>
          )}
        </div>

        <div className={cn('flex items-center justify-between', scrollable && 'shrink-0')}>
          <p className='text-muted-foreground text-xs'>
            Showing {items.length} of {total} {total === 1 ? 'asset' : 'assets'}
            {selectable && selectedIds.length > 0 ? ` · ${selectedIds.length} selected` : ''}
          </p>
          {hasNextPage ? (
            <Button
              type='button'
              variant='ghost'
              size='sm'
              isLoading={isFetchingNextPage}
              onClick={() => void fetchNextPage()}
            >
              Load more
            </Button>
          ) : null}
        </div>
      </div>

      <MediaDetails
        asset={activeAsset}
        scrollable={scrollable}
        onUpdated={() => void queryClient.invalidateQueries({ queryKey: mediaKeys.all })}
        onDeleted={() => {
          setActiveId(null);
          if (onSelectedChange && activeAsset) {
            onSelectedChange(selectedIds.filter((id) => id !== activeAsset.id));
          }
          void queryClient.invalidateQueries({ queryKey: mediaKeys.all });
        }}
      />
    </div>
  );
}

function MediaTile({
  asset,
  active,
  selected,
  selectable,
  onClick
}: {
  asset: MediaAsset;
  active: boolean;
  selected: boolean;
  selectable: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={cn(
        'group relative aspect-square overflow-hidden rounded-[3px] border bg-muted transition-transform active:scale-95',
        active
          ? 'border-[#3c5142] ring-1 ring-[#3c5142]'
          : 'border-[#E5E7EB] hover:border-[#3c5142]/40'
      )}
    >
      {asset.url ? (
        <Image
          src={asset.url}
          alt={asset.alt ?? ''}
          fill
          sizes='160px'
          className='object-cover'
          unoptimized
        />
      ) : (
        <Icons.media className='text-muted-foreground absolute inset-0 m-auto size-6' />
      )}
      {selectable && selected ? (
        <span className='animate-in zoom-in-75 absolute right-1 top-1 flex size-5 items-center justify-center rounded-[3px] bg-[#3c5142] text-white duration-150'>
          <Icons.check className='size-3.5' />
        </span>
      ) : null}
    </button>
  );
}

function MediaDetails({
  asset,
  scrollable = false,
  onUpdated,
  onDeleted
}: {
  asset: MediaAsset | null;
  scrollable?: boolean;
  onUpdated: () => void;
  onDeleted: () => void;
}) {
  const [title, setTitle] = React.useState('');
  const [alt, setAlt] = React.useState('');
  const [caption, setCaption] = React.useState('');

  // Sync local fields whenever the active asset changes.
  React.useEffect(() => {
    setTitle(asset?.title ?? '');
    setAlt(asset?.alt ?? '');
    setCaption(asset?.caption ?? '');
  }, [asset?.id, asset?.title, asset?.alt, asset?.caption]);

  const saveMutation = useMutation({
    mutationFn: () => updateMediaAsset(asset!.id, { title, alt, caption }),
    onSuccess: () => {
      toast.success('Details saved.');
      onUpdated();
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : 'Could not save.')
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteMediaAsset(asset!),
    onSuccess: () => {
      toast.success('Asset permanently deleted.');
      onDeleted();
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : 'Could not delete.')
  });

  if (!asset) {
    return (
      <aside className='text-muted-foreground hidden text-sm lg:block'>
        Select an image to edit its name, alt text, and caption.
      </aside>
    );
  }

  return (
    <aside className={cn('space-y-3', scrollable && 'min-h-0 overflow-y-auto')}>
      <div className='relative aspect-square w-full max-w-[200px] overflow-hidden rounded-[3px] border border-[#E5E7EB] bg-muted'>
        {asset.url ? (
          <Image
            src={asset.url}
            alt={asset.alt ?? ''}
            fill
            sizes='200px'
            className='object-cover'
            unoptimized
          />
        ) : null}
      </div>

      <div className='grid gap-2'>
        <Label htmlFor='media-name'>Name</Label>
        <Input
          id='media-name'
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder='Image name'
        />
      </div>

      <div className='grid gap-2'>
        <Label htmlFor='media-alt'>Alt text</Label>
        <Input
          id='media-alt'
          value={alt}
          onChange={(event) => setAlt(event.target.value)}
          placeholder='Describe the image for SEO & accessibility'
        />
      </div>

      <div className='grid gap-2'>
        <Label htmlFor='media-caption'>Caption</Label>
        <Textarea
          id='media-caption'
          value={caption}
          onChange={(event) => setCaption(event.target.value)}
          rows={2}
          placeholder='Optional caption'
        />
      </div>

      <div className='flex items-center gap-2'>
        <Button
          type='button'
          size='sm'
          onClick={() => saveMutation.mutate()}
          isLoading={saveMutation.isPending}
        >
          Save
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              type='button'
              size='sm'
              variant='outline'
              className='text-red-700 hover:text-red-700'
            >
              <Icons.trash className='size-4' />
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className={cn(CMS_SURFACE, 'rounded-[3px] shadow-none')}>
            <AlertDialogHeader>
              <AlertDialogTitle>Permanently delete this image?</AlertDialogTitle>
              <AlertDialogDescription>
                This removes the file from storage and cannot be undone. Pages still using it will
                lose the image.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteMutation.mutate()}
                className='bg-red-600 text-white hover:bg-red-700'
              >
                Delete permanently
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </aside>
  );
}
