'use client';

import type { CSSProperties, ReactNode } from 'react';
import { useRef } from 'react';

import { cn } from '@/lib/utils';

type ListingAsideProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

/**
 * Sticky filter column with its own scrollport. Wheel/trackpad over this column
 * scrolls filters; over the results column the page scrolls — no forced page jump.
 */
export function ListingAside({ children, className, style }: ListingAsideProps) {
  const ref = useRef<HTMLElement>(null);

  return (
    <aside
      className={cn(
        'benroso-listing-aside bg-white lg:sticky lg:top-[var(--listing-sticky-top)] lg:max-h-[var(--listing-sticky-max-h)] lg:self-start lg:overflow-y-auto lg:overscroll-contain',
        className
      )}
      onWheel={(event) => {
        const node = ref.current;
        if (!node) return;
        const canScroll = node.scrollHeight > node.clientHeight + 1;
        if (!canScroll) return;

        const delta = event.deltaY;
        if (delta === 0) return;

        const atTop = node.scrollTop <= 0;
        const atBottom = node.scrollTop + node.clientHeight >= node.scrollHeight - 1;
        const scrollingUp = delta < 0;
        const scrollingDown = delta > 0;

        // Keep wheel intent inside the filter column while it can still move.
        if ((scrollingUp && !atTop) || (scrollingDown && !atBottom)) {
          event.stopPropagation();
        }
      }}
      ref={ref}
      style={style}
    >
      {children}
    </aside>
  );
}
