'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';

import { Icons } from '@/components/icons';
import { EmptyState } from '@/components/public/page-shell';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { localePath } from '@/lib/public/locale-path';
import type { PublicDestinationMedia } from '@/lib/public/types';
import { cn } from '@/lib/utils';

type FleetGalleryProps = {
  images: PublicDestinationMedia[];
  locale: string;
};

export function FleetGallery({ images, locale }: FleetGalleryProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);

  const goTo = useCallback(
    (index: number) => {
      if (!images.length) return;
      setActiveIndex((index + images.length) % images.length);
    },
    [images.length]
  );

  const showPrevious = useCallback(() => {
    goTo(activeIndex - 1);
  }, [activeIndex, goTo]);

  const showNext = useCallback(() => {
    goTo(activeIndex + 1);
  }, [activeIndex, goTo]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'ArrowLeft') showPrevious();
      if (event.key === 'ArrowRight') showNext();
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, showNext, showPrevious]);

  if (!images.length) {
    return (
      <EmptyState
        actionHref={localePath(locale, '/contact')}
        actionLabel='Ask about our vehicles'
        message='Fleet photos will appear here once they are uploaded and saved in the Benroso portal under Our Fleet.'
        title='Fleet gallery coming soon'
      />
    );
  }

  const hasMultiple = images.length > 1;
  const activeImage = images[activeIndex];

  function openAt(index: number) {
    setActiveIndex(index);
    setOpen(true);
  }

  function handleTouchStart(event: React.TouchEvent<HTMLDivElement>) {
    touchStartX.current = event.touches[0]?.clientX ?? 0;
    touchDeltaX.current = 0;
  }

  function handleTouchMove(event: React.TouchEvent<HTMLDivElement>) {
    touchDeltaX.current = (event.touches[0]?.clientX ?? 0) - touchStartX.current;
  }

  function handleTouchEnd() {
    if (Math.abs(touchDeltaX.current) < 40) return;
    if (touchDeltaX.current < 0) showNext();
    else showPrevious();
  }

  return (
    <>
      <div className='mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3'>
        {images.map((image, index) => (
          <button
            className='group relative aspect-[4/3] overflow-hidden rounded-[var(--benroso-radius)] bg-[var(--benroso-primary-light)]'
            key={`${image.id}-${index}`}
            onClick={() => openAt(index)}
            type='button'
          >
            {image.url ? (
              <Image
                alt={image.alt || `Safari vehicle ${index + 1}`}
                className='object-cover transition-transform duration-500 group-hover:scale-105'
                fill
                sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
                src={image.url}
              />
            ) : null}
            <span
              aria-hidden
              className='absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10'
            />
          </button>
        ))}
      </div>

      <Dialog onOpenChange={setOpen} open={open}>
        <DialogContent
          className={cn(
            'h-[100dvh] w-[100vw] max-w-none translate-x-[-50%] translate-y-[-50%] gap-0 rounded-none border-0 bg-black/95 p-0 sm:max-w-none',
            '[&>button]:right-4 [&>button]:top-4 [&>button]:text-white [&>button]:hover:opacity-100'
          )}
        >
          <DialogTitle className='sr-only'>Fleet photo viewer</DialogTitle>
          <div
            className='relative flex h-full w-full items-center justify-center px-4 py-16 sm:px-16'
            onTouchEnd={hasMultiple ? handleTouchEnd : undefined}
            onTouchMove={hasMultiple ? handleTouchMove : undefined}
            onTouchStart={hasMultiple ? handleTouchStart : undefined}
          >
            {activeImage?.url ? (
              <div className='relative h-full w-full max-h-[calc(100dvh-8rem)] max-w-6xl'>
                <Image
                  alt={activeImage.alt || `Safari vehicle ${activeIndex + 1}`}
                  className='object-contain'
                  fill
                  priority
                  sizes='100vw'
                  src={activeImage.url}
                />
              </div>
            ) : null}

            {hasMultiple ? (
              <>
                <button
                  aria-label='Previous vehicle photo'
                  className='absolute left-3 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:left-6'
                  onClick={showPrevious}
                  type='button'
                >
                  <Icons.chevronLeft className='size-6' />
                </button>
                <button
                  aria-label='Next vehicle photo'
                  className='absolute right-3 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-6'
                  onClick={showNext}
                  type='button'
                >
                  <Icons.chevronRight className='size-6' />
                </button>
                <p className='absolute bottom-6 left-1/2 -translate-x-1/2 text-sm text-white/70'>
                  {activeIndex + 1} / {images.length}
                </p>
              </>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
