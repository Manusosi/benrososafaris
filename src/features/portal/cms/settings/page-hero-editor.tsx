'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { DEFAULT_HERO_OVERLAY, youtubeVideoId } from '@/lib/public/page-heroes';
import type { HeroSlide, PageHero, PageHeroType } from '@/lib/public/types';
import { MediaUrlField } from './media-url-field';
import { savePageHero } from './hero-actions';

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

const HERO_TYPES: { value: PageHeroType; label: string; icon: keyof typeof Icons }[] = [
  { value: 'slider', label: 'Image slider', icon: 'media' },
  { value: 'image', label: 'Single image', icon: 'media' },
  { value: 'youtube', label: 'YouTube background', icon: 'world' }
];

export function PageHeroEditor({
  pageKey,
  initial,
  defaultImageUrl
}: {
  pageKey: string;
  initial: PageHero;
  defaultImageUrl: string | null;
}) {
  const [hero, setHero] = useState<PageHero>(initial);
  const [isPending, startTransition] = useTransition();

  const set = (patch: Partial<PageHero>) => setHero((current) => ({ ...current, ...patch }));

  function updateSlide(index: number, patch: Partial<HeroSlide>) {
    setHero((current) => ({
      ...current,
      slides: current.slides.map((slide, i) => (i === index ? { ...slide, ...patch } : slide))
    }));
  }

  function moveSlide(index: number, direction: -1 | 1) {
    setHero((current) => {
      const next = [...current.slides];
      const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return { ...current, slides: next };
    });
  }

  function removeSlide(index: number) {
    setHero((current) => ({ ...current, slides: current.slides.filter((_, i) => i !== index) }));
  }

  function addSlide() {
    setHero((current) => ({
      ...current,
      slides: [...current.slides, emptySlide(current.slides.length)]
    }));
  }

  function onSave() {
    if (hero.type === 'youtube' && !youtubeVideoId(hero.youtubeUrl)) {
      toast.error('Enter a valid YouTube URL.');
      return;
    }
    if (
      (hero.type === 'slider' || hero.type === 'image') &&
      hero.slides.some((s) => !s.mediaUrl.trim())
    ) {
      toast.error('Every image needs a media URL.');
      return;
    }
    startTransition(async () => {
      try {
        await savePageHero(pageKey, hero);
        toast.success('Hero saved.');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Could not save hero.');
      }
    });
  }

  const showSlides = hero.type === 'slider' || hero.type === 'image';
  const singleImage = hero.type === 'image';

  return (
    <div className='space-y-5'>
      {/* Type selector */}
      <div className='space-y-1.5'>
        <Label>Hero type</Label>
        <div className='flex flex-wrap gap-2'>
          {HERO_TYPES.map((option) => {
            const Icon = Icons[option.icon];
            const active = hero.type === option.value;
            return (
              <Button
                key={option.value}
                onClick={() => set({ type: option.value })}
                size='sm'
                type='button'
                variant={active ? 'default' : 'outline'}
              >
                <Icon className='h-4 w-4' />
                {option.label}
              </Button>
            );
          })}
        </div>
        {defaultImageUrl ? (
          <p className='text-muted-foreground text-xs'>
            When no media is set, the page shows its built-in default image.
          </p>
        ) : null}
      </div>

      {/* YouTube */}
      {hero.type === 'youtube' ? (
        <div className='space-y-4'>
          <div className='space-y-1.5'>
            <Label htmlFor={`yt-${pageKey}`}>YouTube URL</Label>
            <Input
              id={`yt-${pageKey}`}
              onChange={(event) => set({ youtubeUrl: event.target.value })}
              placeholder='https://www.youtube.com/watch?v=…'
              value={hero.youtubeUrl ?? ''}
            />
            <p className='text-muted-foreground text-xs'>
              Plays muted and looping as the background.
            </p>
          </div>
          <MediaUrlField
            label='Fallback image'
            hint='Shown on mobile and when motion is reduced. Uses the first slide slot.'
            onChange={(url) =>
              setHero((current) => {
                const slides = current.slides.length
                  ? current.slides.map((s, i) => (i === 0 ? { ...s, mediaUrl: url } : s))
                  : [{ ...emptySlide(0), mediaUrl: url }];
                return { ...current, slides: url ? slides : [] };
              })
            }
            value={hero.slides[0]?.mediaUrl ?? ''}
          />
        </div>
      ) : null}

      {/* Slides */}
      {showSlides ? (
        <div className='space-y-3'>
          <div className='flex items-center justify-between'>
            <Label>{singleImage ? 'Background image' : 'Slides'}</Label>
            {!singleImage || hero.slides.length === 0 ? (
              <Button onClick={addSlide} size='sm' type='button' variant='outline'>
                <Icons.add className='h-4 w-4' />
                {singleImage ? 'Set image' : 'Add slide'}
              </Button>
            ) : null}
          </div>

          {hero.slides.length === 0 ? (
            <p className='text-muted-foreground rounded-md border border-dashed p-4 text-center text-xs'>
              No media set — the page uses its default image.
            </p>
          ) : null}

          {(singleImage ? hero.slides.slice(0, 1) : hero.slides).map((slide, index) => (
            <div className='rounded-md border p-4' key={index}>
              {!singleImage ? (
                <div className='mb-3 flex items-center justify-between'>
                  <span className='text-sm font-medium'>Slide {index + 1}</span>
                  <div className='flex items-center gap-1'>
                    <Button
                      aria-label='Move up'
                      disabled={index === 0}
                      onClick={() => moveSlide(index, -1)}
                      size='icon'
                      variant='ghost'
                    >
                      <Icons.chevronUp className='h-4 w-4' />
                    </Button>
                    <Button
                      aria-label='Move down'
                      disabled={index === hero.slides.length - 1}
                      onClick={() => moveSlide(index, 1)}
                      size='icon'
                      variant='ghost'
                    >
                      <Icons.chevronDown className='h-4 w-4' />
                    </Button>
                    <Button
                      aria-label='Remove slide'
                      onClick={() => removeSlide(index)}
                      size='icon'
                      variant='ghost'
                    >
                      <Icons.trash className='h-4 w-4 text-destructive' />
                    </Button>
                  </div>
                </div>
              ) : null}

              <div className='space-y-3'>
                <MediaUrlField
                  label='Image'
                  onChange={(mediaUrl) => updateSlide(index, { mediaUrl, mediaType: 'image' })}
                  value={slide.mediaUrl}
                />
                <Input
                  onChange={(event) => updateSlide(index, { alt: event.target.value || null })}
                  placeholder='Alt text (describe the scene for accessibility)'
                  value={slide.alt ?? ''}
                />
                {!singleImage ? (
                  <div className='flex items-center gap-2'>
                    <Switch
                      checked={slide.isActive}
                      id={`active-${pageKey}-${index}`}
                      onCheckedChange={(checked) => updateSlide(index, { isActive: checked })}
                    />
                    <Label htmlFor={`active-${pageKey}-${index}`}>Show this slide</Label>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {/* Overlay text + CTA */}
      <div className='space-y-3 rounded-md border p-4'>
        <p className='text-sm font-medium'>Overlay content</p>
        <div className='grid gap-3 sm:grid-cols-2'>
          <Input
            onChange={(e) => set({ eyebrow: e.target.value || null })}
            placeholder='Eyebrow (small label)'
            value={hero.eyebrow ?? ''}
          />
          <Input
            onChange={(e) => set({ heading: e.target.value || null })}
            placeholder='Heading'
            value={hero.heading ?? ''}
          />
        </div>
        <Input
          onChange={(e) => set({ subheading: e.target.value || null })}
          placeholder='Subheading'
          value={hero.subheading ?? ''}
        />
        <div className='grid gap-3 sm:grid-cols-2'>
          <Input
            onChange={(e) => set({ ctaLabel: e.target.value || null })}
            placeholder='Button label (optional)'
            value={hero.ctaLabel ?? ''}
          />
          <Input
            onChange={(e) => set({ ctaHref: e.target.value || null })}
            placeholder='Button link, e.g. /contact'
            value={hero.ctaHref ?? ''}
          />
        </div>
        <div className='space-y-1.5'>
          <Label htmlFor={`overlay-${pageKey}`}>
            Overlay darkness: {Math.round((hero.overlayOpacity ?? DEFAULT_HERO_OVERLAY) * 100)}%
          </Label>
          <input
            className='w-full'
            id={`overlay-${pageKey}`}
            max={1}
            min={0}
            onChange={(e) => set({ overlayOpacity: Number(e.target.value) })}
            step={0.05}
            type='range'
            value={hero.overlayOpacity ?? DEFAULT_HERO_OVERLAY}
          />
        </div>
      </div>

      <div className='flex justify-end'>
        <Button disabled={isPending} onClick={onSave} type='button'>
          {isPending ? (
            <Icons.spinner className='h-4 w-4 animate-spin' />
          ) : (
            <Icons.check className='h-4 w-4' />
          )}
          Save hero
        </Button>
      </div>
    </div>
  );
}
