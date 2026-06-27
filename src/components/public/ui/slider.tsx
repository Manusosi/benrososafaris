'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';

type SliderProps = {
  children: React.ReactNode[];
  className?: string;
  slideClassName?: string;
  autoPlayMs?: number;
  showArrows?: boolean;
  showDots?: boolean;
};

export function Slider({
  children,
  className,
  slideClassName,
  autoPlayMs,
  showArrows = true,
  showDots = true
}: SliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const count = children.length;

  const scrollToIndex = useCallback((index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const target = track.children[index] as HTMLElement | undefined;
    if (!target) return;
    track.scrollTo({ left: target.offsetLeft, behavior: 'smooth' });
  }, []);

  const goTo = useCallback(
    (index: number) => {
      const next = (index + count) % count;
      setActiveIndex(next);
      scrollToIndex(next);
    },
    [count, scrollToIndex]
  );

  useEffect(() => {
    if (!autoPlayMs) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    const interval = window.setInterval(() => {
      setActiveIndex((current) => {
        const next = (current + 1) % count;
        scrollToIndex(next);
        return next;
      });
    }, autoPlayMs);

    return () => window.clearInterval(interval);
  }, [autoPlayMs, count, scrollToIndex]);

  return (
    <div className={cn('relative', className)}>
      <div
        className='flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
        ref={trackRef}
      >
        {children.map((child, index) => (
          <div className={cn('w-full shrink-0 snap-start', slideClassName)} key={index}>
            {child}
          </div>
        ))}
      </div>

      {(showArrows || showDots) && count > 1 ? (
        <div className='mt-6 flex items-center justify-center gap-6'>
          {showArrows ? (
            <button
              aria-label='Previous slide'
              className='flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--benroso-radius)] border border-[var(--benroso-line)] text-[var(--benroso-primary)] transition-colors hover:bg-[var(--benroso-primary)] hover:text-white'
              onClick={() => goTo(activeIndex - 1)}
              type='button'
            >
              <Icons.chevronLeft className='h-5 w-5' />
            </button>
          ) : null}

          {showDots ? (
            <div className='flex items-center gap-2'>
              {children.map((_, index) => (
                <button
                  aria-label={`Go to slide ${index + 1}`}
                  className={cn(
                    'h-2 w-2 rounded-full transition-colors',
                    index === activeIndex
                      ? 'bg-[var(--benroso-primary)]'
                      : 'bg-[var(--benroso-line)] hover:bg-[var(--benroso-muted)]'
                  )}
                  key={index}
                  onClick={() => goTo(index)}
                  type='button'
                />
              ))}
            </div>
          ) : null}

          {showArrows ? (
            <button
              aria-label='Next slide'
              className='flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--benroso-radius)] border border-[var(--benroso-line)] text-[var(--benroso-primary)] transition-colors hover:bg-[var(--benroso-primary)] hover:text-white'
              onClick={() => goTo(activeIndex + 1)}
              type='button'
            >
              <Icons.chevronRight className='h-5 w-5' />
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
