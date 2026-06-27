'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import type { HeroSlide } from '@/lib/public/types';
import { saveHeroSlides } from './hero-actions';

function emptySlide(sortOrder: number): HeroSlide {
  return {
    mediaType: 'image',
    mediaUrl: '',
    posterUrl: null,
    alt: null,
    heading: null,
    subheading: null,
    isActive: true,
    sortOrder
  };
}

export function HeroSettingsForm({ initialSlides }: { initialSlides: HeroSlide[] }) {
  const [slides, setSlides] = useState<HeroSlide[]>(initialSlides);
  const [isPending, startTransition] = useTransition();

  function update(index: number, patch: Partial<HeroSlide>) {
    setSlides((current) =>
      current.map((slide, i) => (i === index ? { ...slide, ...patch } : slide))
    );
  }

  function move(index: number, direction: -1 | 1) {
    setSlides((current) => {
      const next = [...current];
      const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function remove(index: number) {
    setSlides((current) => current.filter((_, i) => i !== index));
  }

  function add() {
    setSlides((current) => [...current, emptySlide(current.length)]);
  }

  function onSave() {
    const invalid = slides.find((slide) => !slide.mediaUrl.trim());
    if (invalid) {
      toast.error('Every slide needs a media URL.');
      return;
    }

    startTransition(async () => {
      try {
        await saveHeroSlides(slides.map((slide, index) => ({ ...slide, sortOrder: index })));
        toast.success('Homepage hero updated.');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Could not save hero slides.');
      }
    });
  }

  return (
    <div className='space-y-4'>
      <p className='text-sm text-muted-foreground'>
        Manage the slides shown in the homepage hero. Upload files in the Media Library, copy the
        URL, and paste it below. Leave the list empty to use the default safari photos. Videos
        should be small, web-optimised MP4 files.
      </p>

      {slides.length === 0 ? (
        <div className='rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground'>
          No custom hero slides yet. The site is showing the default photos.
        </div>
      ) : null}

      <div className='space-y-4'>
        {slides.map((slide, index) => (
          <div className='rounded-md border p-4' key={index}>
            <div className='mb-3 flex items-center justify-between'>
              <span className='text-sm font-medium'>Slide {index + 1}</span>
              <div className='flex items-center gap-1'>
                <Button
                  aria-label='Move up'
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                  size='icon'
                  variant='ghost'
                >
                  <Icons.chevronUp className='h-4 w-4' />
                </Button>
                <Button
                  aria-label='Move down'
                  disabled={index === slides.length - 1}
                  onClick={() => move(index, 1)}
                  size='icon'
                  variant='ghost'
                >
                  <Icons.chevronDown className='h-4 w-4' />
                </Button>
                <Button
                  aria-label='Remove slide'
                  onClick={() => remove(index)}
                  size='icon'
                  variant='ghost'
                >
                  <Icons.trash className='h-4 w-4 text-destructive' />
                </Button>
              </div>
            </div>

            <div className='grid gap-3 sm:grid-cols-2'>
              <div className='space-y-1.5'>
                <Label htmlFor={`media-type-${index}`}>Media type</Label>
                <select
                  className='border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs'
                  id={`media-type-${index}`}
                  onChange={(event) =>
                    update(index, { mediaType: event.target.value === 'video' ? 'video' : 'image' })
                  }
                  value={slide.mediaType}
                >
                  <option value='image'>Image</option>
                  <option value='video'>Video (MP4)</option>
                </select>
              </div>

              <div className='space-y-1.5'>
                <Label htmlFor={`media-url-${index}`}>Media URL</Label>
                <Input
                  id={`media-url-${index}`}
                  onChange={(event) => update(index, { mediaUrl: event.target.value })}
                  placeholder='/assets/hero/your-file.jpg'
                  value={slide.mediaUrl}
                />
              </div>

              {slide.mediaType === 'video' ? (
                <div className='space-y-1.5'>
                  <Label htmlFor={`poster-${index}`}>Poster image URL</Label>
                  <Input
                    id={`poster-${index}`}
                    onChange={(event) => update(index, { posterUrl: event.target.value || null })}
                    placeholder='/assets/hero/poster.jpg'
                    value={slide.posterUrl ?? ''}
                  />
                </div>
              ) : null}

              <div className='space-y-1.5'>
                <Label htmlFor={`alt-${index}`}>Alt text</Label>
                <Input
                  id={`alt-${index}`}
                  onChange={(event) => update(index, { alt: event.target.value || null })}
                  placeholder='Describe the scene for accessibility'
                  value={slide.alt ?? ''}
                />
              </div>
            </div>

            <div className='mt-3 flex items-center gap-2'>
              <Switch
                checked={slide.isActive}
                id={`active-${index}`}
                onCheckedChange={(checked) => update(index, { isActive: checked })}
              />
              <Label htmlFor={`active-${index}`}>Show on site</Label>
            </div>
          </div>
        ))}
      </div>

      <div className='flex flex-wrap items-center gap-3'>
        <Button onClick={add} type='button' variant='outline'>
          <Icons.add className='h-4 w-4' />
          Add slide
        </Button>
        <Button disabled={isPending} onClick={onSave} type='button'>
          {isPending ? <Icons.spinner className='h-4 w-4 animate-spin' /> : null}
          Save hero
        </Button>
      </div>
    </div>
  );
}
