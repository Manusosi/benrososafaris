'use client';

import { useEffect, useRef, useState } from 'react';

import { ABOUT_TAB_CONFIG } from '@/lib/public/about-content';
import type { AboutTabId } from '@/lib/public/about-placeholders';
import { cn } from '@/lib/utils';

type AboutTabBarProps = {
  activeTab: AboutTabId;
  onTabChange: (tabId: AboutTabId) => void;
};

export function AboutTabBar({ activeTab, onTabChange }: AboutTabBarProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isStuck, setIsStuck] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(([entry]) => setIsStuck(!entry.isIntersecting), {
      rootMargin: '-1px 0px 0px 0px',
      threshold: [0, 1]
    });

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div aria-hidden className='h-0' ref={sentinelRef} />
      <div
        className={cn(
          'sticky top-[var(--benroso-header-h)] z-30 -mt-px',
          'border-b border-[var(--benroso-line)] bg-white transition-shadow duration-200',
          isStuck && 'shadow-[0_8px_24px_-18px_rgba(28,42,31,0.35)]'
        )}
      >
        <div className='benroso-container py-3 sm:py-4'>
          <div
            aria-label='About page sections'
            className='mx-auto grid w-full max-w-4xl grid-cols-2 gap-1 rounded-[var(--benroso-radius)] border border-[var(--benroso-line)] bg-[var(--benroso-surface-muted)] p-1 sm:grid-cols-4 sm:gap-1.5 sm:p-1.5'
            role='tablist'
          >
            {ABOUT_TAB_CONFIG.map((tab) => {
              const isActive = activeTab === tab.id;

              return (
                <button
                  aria-selected={isActive}
                  className={cn(
                    'min-h-11 rounded-[calc(var(--benroso-radius)-3px)] px-2 py-2.5 text-center text-[0.625rem] font-bold uppercase leading-tight tracking-[0.08em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--benroso-lime)] focus-visible:ring-offset-1 sm:min-h-12 sm:px-3 sm:py-3 sm:text-xs sm:tracking-[0.1em] md:tracking-[0.12em]',
                    isActive
                      ? 'bg-[var(--benroso-lime)] text-[var(--benroso-primary-dark)] shadow-[0_2px_8px_-2px_rgba(169,192,56,0.55)]'
                      : 'bg-transparent text-[var(--benroso-primary-dark)]/75 hover:bg-white/90 hover:text-[var(--benroso-primary-dark)]'
                  )}
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  role='tab'
                  type='button'
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
