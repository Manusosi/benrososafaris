'use client';

import * as React from 'react';

import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import type { TocItem } from '@/lib/public/blog';

const SCROLL_OFFSET = 110;

/** Sticky, card-style table of contents with scroll-spy, a reading-progress
 *  bar, a docs-style active rail, and a back-to-top action. */
export function ArticleToc({ items }: { items: TocItem[] }) {
  const [active, setActive] = React.useState(items[0]?.id ?? '');
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    if (!items.length) return;

    const onScroll = () => {
      // Active heading: the last one whose top has passed the offset line.
      let current = items[0].id;
      for (const item of items) {
        const el = document.getElementById(item.id);
        if (el && el.getBoundingClientRect().top - SCROLL_OFFSET <= 0) current = item.id;
      }
      setActive(current);

      // Reading progress across the page.
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [items]);

  function handleClick(event: React.MouseEvent, id: string) {
    event.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET + 10;
    window.scrollTo({ top, behavior: 'smooth' });
  }

  if (!items.length) return null;

  return (
    <nav
      aria-label='Table of contents'
      className='overflow-hidden rounded-[var(--benroso-radius)] border border-[var(--benroso-line)] bg-white shadow-sm'
    >
      <div className='flex items-center justify-between gap-2 border-b border-[var(--benroso-line)] bg-[var(--benroso-ivory)] px-4 py-3'>
        <p className='inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[var(--benroso-ink)]'>
          <Icons.listBullet className='size-4 text-[var(--benroso-primary)]' />
          On this page
        </p>
        <span className='text-[10px] font-semibold tabular-nums text-[var(--benroso-muted)]'>
          {Math.round(progress * 100)}%
        </span>
      </div>

      <div className='h-1 w-full bg-[var(--benroso-line)]'>
        <div
          className='h-full bg-[var(--benroso-primary)] transition-[width] duration-150 ease-out'
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      <ul className='my-3 max-h-[58vh] space-y-0.5 overflow-y-auto border-l border-[var(--benroso-line)] px-3'>
        {items.map((item) => (
          <li key={item.id}>
            <a
              className={cn(
                '-ml-3 block border-l-2 py-1.5 leading-snug transition-colors',
                item.level === 3 ? 'pl-6 text-[13px]' : 'pl-3.5 text-sm',
                active === item.id
                  ? 'border-[var(--benroso-primary)] bg-[var(--benroso-ivory)] font-semibold text-[var(--benroso-primary)]'
                  : 'border-transparent text-[var(--benroso-muted)] hover:border-[var(--benroso-line)] hover:text-[var(--benroso-primary)]'
              )}
              href={`#${item.id}`}
              onClick={(event) => handleClick(event, item.id)}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>

      <div className='border-t border-[var(--benroso-line)] p-3'>
        <button
          className='inline-flex w-full items-center justify-center gap-1.5 rounded-[5px] py-2 text-xs font-semibold uppercase tracking-wide text-[var(--benroso-muted)] transition-colors hover:bg-[var(--benroso-ivory)] hover:text-[var(--benroso-primary)]'
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          type='button'
        >
          <Icons.chevronUp className='size-3.5' />
          Back to top
        </button>
      </div>
    </nav>
  );
}
