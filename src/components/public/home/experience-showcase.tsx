'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

import { Icons } from '@/components/icons';
import { localePath } from '@/lib/public/locale-path';
import { HOME_SHOWCASE_ITEMS, type HomeShowcaseItem } from '@/lib/public/home-content';
import { cn } from '@/lib/utils';

gsap.registerPlugin(useGSAP);

const AUTOPLAY_MS = 6000;

type ExperienceShowcaseProps = {
  locale: string;
  items?: HomeShowcaseItem[];
};

export function ExperienceShowcase({
  locale,
  items = HOME_SHOWCASE_ITEMS
}: ExperienceShowcaseProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const count = items.length;

  const advance = useCallback(
    (next: number) => {
      setActiveIndex(((next % count) + count) % count);
    },
    [count]
  );

  // Animate the active slide: reveal copy, run the autoplay progress bar, queue the next slide.
  useGSAP(
    () => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (contentRef.current && !reduced) {
        gsap.fromTo(
          contentRef.current.querySelectorAll('[data-showcase-reveal]'),
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.08 }
        );
      }

      if (reduced) return;

      timelineRef.current?.kill();
      const timeline = gsap.timeline({ onComplete: () => advance(activeIndex + 1) });
      if (progressRef.current) {
        timeline.fromTo(
          progressRef.current,
          { scaleX: 0 },
          { scaleX: 1, duration: AUTOPLAY_MS / 1000, ease: 'none' }
        );
      }
      timelineRef.current = timeline;

      return () => {
        timeline.kill();
      };
    },
    { dependencies: [activeIndex], scope: rootRef }
  );

  const pause = () => timelineRef.current?.pause();
  const resume = () => timelineRef.current?.resume();

  return (
    <section className='benroso-section bg-[var(--benroso-primary-dark)]'>
      <div className='benroso-container'>
        <div className='flex flex-col gap-4 text-white md:flex-row md:items-end md:justify-between'>
          <div>
            <p className='benroso-eyebrow text-[var(--benroso-gold)]'>Signature Experiences</p>
            <h2 className='mt-3 max-w-2xl font-display text-[clamp(1.875rem,4vw,3rem)] leading-[1.1]'>
              The Safaris We Are Known For
            </h2>
          </div>
          <p className='max-w-md text-sm leading-7 text-white/70'>
            Twenty five years of fieldwork distilled into the experiences travelers ask us for again
            and again. Every one is fully tailorable to your dates and pace.
          </p>
        </div>

        <div
          className='relative mt-10 overflow-hidden rounded-[var(--benroso-radius)] border border-white/10'
          onMouseEnter={pause}
          onMouseLeave={resume}
          ref={rootRef}
          style={{ height: 'min(78vh, 660px)', minHeight: '480px' }}
        >
          {items.map((item, index) => (
            <div
              aria-hidden={index !== activeIndex}
              className='absolute inset-0 transition-opacity duration-[1100ms] ease-out'
              key={item.id}
              style={{ opacity: index === activeIndex ? 1 : 0 }}
            >
              <Image
                alt={item.imageAlt}
                className={cn(
                  'object-cover transition-transform duration-[7000ms] ease-out',
                  index === activeIndex ? 'scale-110' : 'scale-100'
                )}
                fill
                priority={index === 0}
                sizes='100vw'
                src={item.imageUrl}
              />
            </div>
          ))}

          <div
            aria-hidden
            className='absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10'
          />
          <div
            aria-hidden
            className='absolute inset-0 bg-gradient-to-r from-black/55 via-transparent to-transparent'
          />

          <div className='absolute inset-x-0 bottom-0 p-6 md:p-10'>
            <div className='flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between'>
              <div className='max-w-xl text-white' key={activeIndex} ref={contentRef}>
                <p
                  className='inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[var(--benroso-gold)]'
                  data-showcase-reveal
                >
                  <span className='h-px w-8 bg-[var(--benroso-gold)]' />
                  {items[activeIndex].category}
                </p>
                <h3
                  className='mt-4 font-display text-[clamp(1.875rem,4.5vw,3.25rem)] leading-[1.05]'
                  data-showcase-reveal
                >
                  {items[activeIndex].title}
                </h3>
                <p
                  className='mt-3 inline-flex items-center gap-2 text-sm text-white/80'
                  data-showcase-reveal
                >
                  <Icons.mapPin className='h-4 w-4 text-[var(--benroso-gold)]' />
                  {items[activeIndex].location}
                </p>
                <p className='mt-4 max-w-lg text-sm leading-7 text-white/85' data-showcase-reveal>
                  {items[activeIndex].description}
                </p>
                <div data-showcase-reveal>
                  <Link
                    className='mt-7 inline-flex items-center gap-2 rounded-[var(--benroso-button-radius)] bg-[var(--benroso-gold)] px-6 py-3 text-sm font-bold uppercase tracking-[0.08em] text-[var(--benroso-primary-dark)] transition-colors hover:bg-[var(--benroso-gold-hover)]'
                    href={localePath(locale, items[activeIndex].href)}
                  >
                    Explore This Safari
                    <Icons.arrowRight className='h-4 w-4' />
                  </Link>
                </div>
              </div>

              <div className='flex items-center gap-3 overflow-x-auto pb-1 [scrollbar-width:none] lg:max-w-[46%] [&::-webkit-scrollbar]:hidden'>
                {items.map((item, index) => (
                  <button
                    aria-label={`Show ${item.title}`}
                    className={cn(
                      'group relative h-24 shrink-0 overflow-hidden rounded-[var(--benroso-radius)] border transition-all duration-300',
                      index === activeIndex
                        ? 'w-40 border-[var(--benroso-gold)]'
                        : 'w-20 border-white/30 opacity-70 hover:opacity-100'
                    )}
                    key={item.id}
                    onClick={() => advance(index)}
                    type='button'
                  >
                    <Image
                      alt={item.imageAlt}
                      className='object-cover'
                      fill
                      sizes='160px'
                      src={item.imageUrl}
                    />
                    <span
                      aria-hidden
                      className='absolute inset-0 bg-black/30 transition-colors group-hover:bg-black/10'
                    />
                    {index === activeIndex ? (
                      <span className='absolute inset-x-2 bottom-2 text-left text-[11px] font-semibold leading-tight text-white'>
                        {item.title}
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>
            </div>

            <div className='mt-6 flex items-center gap-4'>
              <span className='font-display text-sm text-white/80'>
                {String(activeIndex + 1).padStart(2, '0')}
              </span>
              <span className='relative h-px flex-1 overflow-hidden bg-white/25'>
                <span
                  className='absolute inset-0 origin-left bg-[var(--benroso-gold)]'
                  ref={progressRef}
                  style={{ transform: 'scaleX(0)' }}
                />
              </span>
              <span className='font-display text-sm text-white/50'>
                {String(count).padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
