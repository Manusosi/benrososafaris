'use client';

import { useState } from 'react';
import Image from 'next/image';

import { Icons } from '@/components/icons';
import type { PublicAccommodationMedia } from '@/features/accommodations/public/types';
import { cn } from '@/lib/utils';

const VISIBLE_THUMBNAILS = 5;

type AccommodationGalleryProps = {
  images: PublicAccommodationMedia[];
  title: string;
};

export function AccommodationGallery({ images, title }: AccommodationGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images.length) {
    return (
      <div className='aspect-[16/10] rounded-[var(--benroso-radius)] bg-[var(--benroso-primary-light)]' />
    );
  }

  const active = images[activeIndex] ?? images[0];
  const thumbnails = images.slice(0, VISIBLE_THUMBNAILS);
  const hiddenCount = Math.max(images.length - VISIBLE_THUMBNAILS, 0);

  function showPrevious() {
    setActiveIndex((current) => (current === 0 ? images.length - 1 : current - 1));
  }

  function showNext() {
    setActiveIndex((current) => (current === images.length - 1 ? 0 : current + 1));
  }

  return (
    <div className='space-y-4'>
      <div className='relative aspect-[16/10] overflow-hidden rounded-[var(--benroso-radius)] bg-[var(--benroso-primary-light)]'>
        {active.url ? (
          <Image
            alt={active.alt || title}
            className='object-cover'
            fill
            priority
            sizes='(max-width: 1024px) 100vw, 66vw'
            src={active.url}
          />
        ) : null}

        {images.length > 1 ? (
          <>
            <button
              aria-label='Previous image'
              className='absolute left-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white transition-colors hover:bg-black/65'
              onClick={showPrevious}
              type='button'
            >
              <Icons.chevronLeft className='size-5' />
            </button>
            <button
              aria-label='Next image'
              className='absolute right-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white transition-colors hover:bg-black/65'
              onClick={showNext}
              type='button'
            >
              <Icons.chevronRight className='size-5' />
            </button>
          </>
        ) : null}
      </div>

      {images.length > 1 ? (
        <div className='grid grid-cols-5 gap-3'>
          {thumbnails.map((image, index) => {
            const isActive = index === activeIndex;
            const isLastVisible = index === thumbnails.length - 1 && hiddenCount > 0;

            return (
              <button
                aria-label={`Show image ${index + 1}`}
                aria-pressed={isActive}
                className={cn(
                  'relative aspect-[4/3] overflow-hidden rounded-[var(--benroso-radius)] border-2',
                  isActive
                    ? 'border-[var(--benroso-primary)]'
                    : 'border-transparent opacity-80 hover:opacity-100'
                )}
                key={image.id}
                onClick={() => setActiveIndex(index)}
                type='button'
              >
                {image.url ? (
                  <Image
                    alt={image.alt || `${title} image ${index + 1}`}
                    className='object-cover'
                    fill
                    sizes='120px'
                    src={image.url}
                  />
                ) : null}
                {isLastVisible ? (
                  <span className='absolute inset-0 flex items-center justify-center bg-black/55 text-sm font-semibold text-white'>
                    +{hiddenCount} more
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
