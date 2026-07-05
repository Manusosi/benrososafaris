'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

import { HeroMediaBackdrop } from '@/components/public/hero-media-backdrop';
import { BENROSO_ABOUT_HERO } from '@/config/benroso';
import { heroHasMedia } from '@/lib/public/page-heroes';
import type { PageHero } from '@/lib/public/types';
import { cn } from '@/lib/utils';

gsap.registerPlugin(useGSAP);

type AboutHeroProps = {
  breadcrumbs?: Array<{ href?: string; label: string }>;
  className?: string;
  description?: string;
  eyebrow?: string;
  hero?: PageHero | null;
  title: string;
};

export function AboutHero({
  breadcrumbs,
  className,
  description,
  eyebrow,
  hero,
  title
}: AboutHeroProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const hasMedia = heroHasMedia(hero);
  const overlayAlpha = hero ? hero.overlayOpacity : 0.62;
  const effectiveEyebrow = hero?.eyebrow ?? eyebrow;
  const effectiveTitle = hero?.heading ?? title;
  const effectiveDescription = hero?.subheading ?? description;

  useGSAP(
    () => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduced || !contentRef.current) return;

      gsap.from(contentRef.current.children, {
        duration: 0.85,
        ease: 'power2.out',
        opacity: 0,
        stagger: 0.1,
        y: 28
      });
    },
    { scope: contentRef }
  );

  return (
    <section className={cn('relative overflow-hidden text-white', className)}>
      {hasMedia && hero ? (
        <HeroMediaBackdrop hero={hero} />
      ) : (
        <div
          aria-hidden
          className='absolute inset-0 bg-cover bg-center bg-no-repeat'
          style={{ backgroundImage: `url("${BENROSO_ABOUT_HERO.imageUrl}")` }}
        />
      )}
      <div
        aria-hidden
        className='absolute inset-0'
        style={{ backgroundColor: `rgba(0,0,0,${overlayAlpha})` }}
      />
      <div className='relative z-10 benroso-section py-16 md:py-24'>
        <div className='benroso-container'>
          {breadcrumbs?.length ? (
            <nav
              aria-label='Breadcrumb'
              className='mb-10 flex flex-wrap items-center justify-center gap-2 text-sm text-white/70'
            >
              {breadcrumbs.map((crumb, index) => (
                <span className='inline-flex items-center gap-2' key={`${crumb.label}-${index}`}>
                  {index > 0 ? <span aria-hidden>|</span> : null}
                  {crumb.href ? (
                    <a className='hover:text-white' href={crumb.href}>
                      {crumb.label}
                    </a>
                  ) : (
                    <span className='benroso-breadcrumb-current'>{crumb.label}</span>
                  )}
                </span>
              ))}
            </nav>
          ) : null}

          <div className='mx-auto max-w-3xl text-center' ref={contentRef}>
            {effectiveEyebrow ? (
              <p className='text-xs font-bold uppercase tracking-[0.18em] text-white/70'>
                {effectiveEyebrow}
              </p>
            ) : null}
            <h1
              className={cn(
                'font-display text-[clamp(2.25rem,5vw,3.75rem)] leading-[1.1] text-white',
                effectiveEyebrow ? 'mt-4' : 'mt-0'
              )}
            >
              {effectiveTitle}
            </h1>
            <span aria-hidden className='benroso-gold-line benroso-gold-line--brand mt-5' />
            {effectiveDescription ? (
              <p className='mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/85'>
                {effectiveDescription}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
