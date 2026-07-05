'use client';

import { useEffect, useRef } from 'react';

import { Icons } from '@/components/icons';
import { loadGsapRuntime } from '@/lib/gsap/load-runtime';
import { cn } from '@/lib/utils';

/**
 * Trust points that type themselves in one sentence at a time (GSAP TextPlugin),
 * kicked off the first time the list scrolls into view. Each tick pops in just
 * before its sentence is typed. The full text always lives in an `sr-only` span
 * so the content stays accessible and indexable regardless of the animation.
 */
export function TrustedChecklist({
  items,
  className = 'mt-7 space-y-3.5',
  itemClassName
}: {
  items: string[];
  /** Overrides the list layout (e.g. a two-column grid). */
  className?: string;
  /** Overrides each row’s typography/spacing. */
  itemClassName?: string;
}) {
  const rootRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const ticks = Array.from(root.querySelectorAll<SVGElement>('[data-tick]'));
    const texts = Array.from(root.querySelectorAll<HTMLElement>('[data-type]'));

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      texts.forEach((el, i) => (el.textContent = items[i]));
      return;
    }

    let killed = false;
    let cleanup: (() => void) | undefined;

    void loadGsapRuntime().then(({ gsap }) => {
      if (killed || !rootRef.current) return;

      let timeline: ReturnType<typeof gsap.timeline> | undefined;
      const ctx = gsap.context(() => {
        gsap.set(ticks, { autoAlpha: 0, scale: 0.4, transformOrigin: 'center' });
      }, root);

      const play = () =>
        ctx.add(() => {
          timeline = gsap.timeline();
          items.forEach((sentence, i) => {
            timeline!
              .to(
                ticks[i],
                { autoAlpha: 1, scale: 1, duration: 0.3, ease: 'back.out(2.2)' },
                i === 0 ? 0 : '+=0.25'
              )
              .to(
                texts[i],
                {
                  duration: Math.min(1.6, Math.max(0.5, sentence.length * 0.022)),
                  text: { value: sentence, delimiter: '' },
                  ease: 'none'
                },
                '<0.05'
              );
          });
        });

      const observer = new IntersectionObserver(
        (entries, obs) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            play();
            obs.disconnect();
          }
        },
        { threshold: 0.25 }
      );
      observer.observe(root);

      cleanup = () => {
        observer.disconnect();
        timeline?.kill();
        ctx.revert();
      };
    });

    return () => {
      killed = true;
      cleanup?.();
    };
  }, [items]);

  return (
    <ul className={className} ref={rootRef}>
      {items.map((item) => (
        <li
          className={cn('flex gap-3.5 text-sm leading-7 text-[var(--benroso-ink)]', itemClassName)}
          key={item}
        >
          <Icons.circleCheck
            className='mt-1 h-5 w-5 shrink-0 text-[var(--benroso-primary)] md:h-6 md:w-6'
            data-tick
          />
          <span className='min-w-0 flex-1'>
            <span className='sr-only'>{item}</span>
            <span aria-hidden='true' data-type />
          </span>
        </li>
      ))}
    </ul>
  );
}
