'use client';

import * as React from 'react';
import Image from 'next/image';

import { cn } from '@/lib/utils';
import type { PublicTourDetail } from '@/lib/public/types';

type GalleryImage = PublicTourDetail['gallery'][number];

type ItineraryTimelineProps = {
  days: PublicTourDetail['itineraryDays'];
  images: GalleryImage[];
  title: string;
};

function isBulletLine(line: string) {
  return /^[-•*]\s+|^\d+\.\s+/.test(line);
}

function stripBulletPrefix(line: string) {
  return line.replace(/^[-•*]\s+|^\d+\.\s+/, '').trim();
}

type DescriptionBlock = { type: 'list'; items: string[] } | { type: 'paragraph'; text: string };

function buildDescriptionBlocks(description: string): DescriptionBlock[] {
  const lines = description
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const blocks: DescriptionBlock[] = [];

  for (const line of lines) {
    if (isBulletLine(line)) {
      const content = stripBulletPrefix(line);
      const last = blocks[blocks.length - 1];
      if (last?.type === 'list') last.items.push(content);
      else blocks.push({ type: 'list', items: [content] });
      continue;
    }

    blocks.push({ type: 'paragraph', text: line });
  }

  return blocks;
}

function ItineraryDescription({ description }: { description: string }) {
  const blocks = buildDescriptionBlocks(description);
  if (!blocks.length) return null;

  return (
    <div className='benroso-body mt-3 space-y-3 text-[15px] leading-7'>
      {blocks.map((block, index) =>
        block.type === 'list' ? (
          <ul className='list-disc space-y-1.5 pl-5' key={`list-${index}`}>
            {block.items.map((item, itemIndex) => (
              <li key={`${index}-${itemIndex}`}>{item}</li>
            ))}
          </ul>
        ) : (
          <p key={`paragraph-${index}`}>{block.text}</p>
        )
      )}
    </div>
  );
}

function ItineraryAccommodationOptions({ options }: { options: string[] }) {
  const visibleOptions = options.map((option) => option.trim()).filter(Boolean);
  if (!visibleOptions.length) return null;

  return (
    <ul className='benroso-body mt-4 list-disc space-y-1.5 pl-5 text-[15px] leading-7'>
      <li>
        Dinner and overnight at:
        <ul className='mt-1.5 list-[circle] space-y-1 pl-5'>
          {visibleOptions.map((option, index) => (
            <li key={`${index}-${option}`}>
              <strong className='text-[var(--benroso-heading)]'>Option {index + 1}:</strong>{' '}
              {option}
            </li>
          ))}
        </ul>
      </li>
    </ul>
  );
}

function ItineraryMealPlan({ mealPlan }: { mealPlan: string }) {
  const value = mealPlan.trim();
  if (!value) return null;

  return (
    <p className='benroso-body mt-4 text-[15px] leading-7'>
      <strong className='text-[var(--benroso-heading)]'>Meal Plan:</strong> {value}
    </p>
  );
}

function useTimelineProgress(
  containerRef: React.RefObject<HTMLElement | null>,
  markerRefs: React.RefObject<(HTMLSpanElement | null)[]>,
  itemCount: number
) {
  const [progress, setProgress] = React.useState(0);
  const [activeIndex, setActiveIndex] = React.useState(0);

  React.useEffect(() => {
    const update = () => {
      const markers = markerRefs.current.filter(Boolean) as HTMLSpanElement[];
      if (!markers.length || !containerRef.current) return;

      const scrollY = window.scrollY;
      const anchor = scrollY + window.innerHeight * 0.38;

      const firstMarker = markers[0];
      const lastMarker = markers[markers.length - 1];
      const trackStart =
        firstMarker.getBoundingClientRect().top + scrollY + firstMarker.offsetHeight / 2;
      const trackEnd =
        lastMarker.getBoundingClientRect().top + scrollY + lastMarker.offsetHeight / 2;
      const trackLength = Math.max(trackEnd - trackStart, 1);

      setProgress(Math.min(1, Math.max(0, (anchor - trackStart) / trackLength)));

      let nextActive = 0;
      for (let index = 0; index < markers.length; index++) {
        const markerCenter =
          markers[index].getBoundingClientRect().top + scrollY + markers[index].offsetHeight / 2;
        if (anchor >= markerCenter) nextActive = index;
      }
      setActiveIndex(nextActive);
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [containerRef, itemCount, markerRefs]);

  return { activeIndex, progress };
}

export function ItineraryTimeline({ days, images, title }: ItineraryTimelineProps) {
  const containerRef = React.useRef<HTMLOListElement>(null);
  const markerRefs = React.useRef<(HTMLSpanElement | null)[]>([]);
  const { activeIndex, progress } = useTimelineProgress(containerRef, markerRefs, days.length);

  if (!days.length) {
    return (
      <div className='mt-6 border border-dashed border-[var(--benroso-line)] bg-[var(--benroso-ivory)] p-6'>
        <h3 className='benroso-heading font-display text-xl'>Itinerary Pending</h3>
        <p className='benroso-body mt-2 text-sm leading-6'>
          Add day-by-day routing in the portal so guests can understand how this safari unfolds.
        </p>
      </div>
    );
  }

  return (
    <ol className='benroso-itinerary-timeline relative mt-8' ref={containerRef}>
      <div aria-hidden className='benroso-itinerary-timeline__track'>
        <div className='benroso-itinerary-timeline__track-bg' />
        <div
          className='benroso-itinerary-timeline__track-fill'
          style={{ transform: `scaleY(${progress})` }}
        />
      </div>

      {days.map((day, index) => {
        const fallbackImage = images[index + 1] ?? images[index];
        const imageUrl = day.imageUrl ?? fallbackImage?.url ?? null;
        const imageAlt = day.imageAlt ?? fallbackImage?.alt ?? `${title} day ${day.day}`;
        const isReached = index <= activeIndex;

        return (
          <li
            className='benroso-itinerary-timeline__item relative grid grid-cols-[3rem_minmax(0,1fr)] gap-4 md:grid-cols-[3.25rem_minmax(0,1fr)] md:gap-6'
            key={`${day.day}-${day.title}`}
          >
            <div className='flex justify-center pt-1'>
              <span
                className={cn(
                  'relative z-10 flex h-10 w-10 items-center justify-center rounded-full font-display text-sm font-bold transition-colors duration-300 md:h-11 md:w-11',
                  isReached
                    ? 'bg-[var(--benroso-primary)] text-white'
                    : 'border border-[var(--benroso-line)] bg-white text-[var(--benroso-muted)]'
                )}
                ref={(node) => {
                  markerRefs.current[index] = node;
                }}
              >
                {String(day.day).padStart(2, '0')}
              </span>
            </div>

            <article className='min-w-0 border-b border-[rgb(60_81_66/8%)] pb-10 last:border-b-0'>
              <div className='grid md:grid-cols-[minmax(0,1fr)_210px]'>
                <div className='md:pr-6 md:py-1'>
                  <span className='text-xs font-bold uppercase tracking-[0.18em] text-[var(--benroso-primary)]'>
                    Day {day.day}
                  </span>
                  <h3 className='benroso-heading mt-2 font-display text-xl leading-tight'>
                    {day.title}
                  </h3>
                  <ItineraryDescription description={day.description} />
                  <ItineraryAccommodationOptions options={day.accommodationOptions} />
                  <ItineraryMealPlan mealPlan={day.mealPlan} />
                </div>
                {imageUrl ? (
                  <div className='relative mt-5 min-h-[190px] overflow-hidden rounded-[var(--benroso-radius)] bg-[var(--benroso-ivory)] md:mt-0 md:min-h-[220px]'>
                    <Image
                      alt={imageAlt}
                      className='object-cover'
                      fill
                      sizes='(min-width: 1024px) 210px, 100vw'
                      src={imageUrl}
                    />
                  </div>
                ) : null}
              </div>
            </article>
          </li>
        );
      })}
    </ol>
  );
}
