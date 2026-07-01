'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

import { PublicHeroGhostCta } from '@/components/public/public-hero-ghost-cta';
import { BenrosoButton } from '@/components/public/ui/benroso-button';
import { youtubeVideoId } from '@/lib/public/page-heroes';
import type { PageHero } from '@/lib/public/types';
import { cn } from '@/lib/utils';

gsap.registerPlugin(useGSAP);

const HERO_SLIDE_INTERVAL = 6500;

type PublicPageHeroProps = {
  breadcrumbs?: Array<{ href?: string; label: string }>;
  breadcrumbStyle?: 'default' | 'pipe-uppercase';
  className?: string;
  cta?: {
    href: string;
    label: string;
  };
  ctaVariant?: 'gold' | 'ghost-hero';
  description?: string;
  eyebrow?: string;
  eyebrowTone?: 'gold' | 'white';
  /** Optional per-page hero from Portal > Settings > Hero Sections; overrides imageUrl/copy. */
  hero?: PageHero | null;
  imageAlt: string;
  imageUrl: string;
  showGoldLine?: boolean;
  title: string;
  titleTone?: 'white' | 'gold';
  children?: ReactNode;
};

export function PublicPageHero({
  breadcrumbs,
  breadcrumbStyle = 'default',
  className,
  cta,
  ctaVariant = 'gold',
  description,
  eyebrow,
  eyebrowTone = 'gold',
  hero,
  imageAlt,
  imageUrl,
  showGoldLine = true,
  title,
  titleTone = 'white',
  children
}: PublicPageHeroProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const isPipeUppercase = breadcrumbStyle === 'pipe-uppercase';

  // Per-page hero overrides (background media, copy, overlay).
  const videoId = hero?.type === 'youtube' ? youtubeVideoId(hero.youtubeUrl) : null;
  const heroSlides = (hero?.slides ?? []).filter((slide) => slide.isActive && slide.mediaUrl);
  const sliderImages =
    hero && (hero.type === 'slider' || hero.type === 'image') && heroSlides.length > 0
      ? heroSlides.map((slide) => slide.mediaUrl)
      : [];
  const posterUrl = heroSlides[0]?.mediaUrl ?? imageUrl;
  const overlayAlpha = hero ? hero.overlayOpacity : 0.68;

  const effectiveEyebrow = hero?.eyebrow ?? eyebrow;
  const effectiveTitle = hero?.heading ?? title;
  const effectiveDescription = hero?.subheading ?? description;
  const effectiveCta =
    hero?.ctaLabel && hero?.ctaHref ? { href: hero.ctaHref, label: hero.ctaLabel } : cta;

  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    if (sliderImages.length <= 1) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    const interval = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % sliderImages.length);
    }, HERO_SLIDE_INTERVAL);
    return () => window.clearInterval(interval);
  }, [sliderImages.length]);

  useGSAP(
    () => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduced || !contentRef.current) return;

      gsap.from(contentRef.current.children, {
        opacity: 0,
        y: 24,
        duration: 0.85,
        ease: 'power2.out',
        stagger: 0.1
      });
    },
    { scope: contentRef }
  );

  return (
    <section
      className={cn(
        'relative flex min-h-[420px] h-[50vh] max-h-[560px] items-center overflow-hidden border-b border-[var(--benroso-line)] text-white',
        className
      )}
    >
      {videoId ? (
        <>
          <div
            aria-hidden
            className='absolute inset-0 bg-cover bg-center bg-no-repeat'
            style={{ backgroundImage: `url("${posterUrl}")` }}
          />
          <iframe
            allow='autoplay; encrypted-media'
            aria-hidden
            className='pointer-events-none absolute left-1/2 top-1/2 h-[56.25vw] min-h-full w-[177.78vh] min-w-full -translate-x-1/2 -translate-y-1/2'
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&playsinline=1&rel=0&modestbranding=1&showinfo=0`}
            title='Background video'
          />
        </>
      ) : sliderImages.length > 0 ? (
        sliderImages.map((url, index) => (
          <div
            aria-hidden
            className='absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000'
            key={`${url}-${index}`}
            style={{ backgroundImage: `url("${url}")`, opacity: index === activeSlide ? 1 : 0 }}
          />
        ))
      ) : (
        <div
          aria-hidden
          className='absolute inset-0 bg-cover bg-center bg-no-repeat'
          style={{ backgroundImage: `url("${imageUrl}")` }}
        />
      )}
      <span className='sr-only'>{imageAlt}</span>
      <div
        aria-hidden
        className='absolute inset-0'
        style={{ backgroundColor: `rgba(60,81,66,${overlayAlpha})` }}
      />
      <div className='relative z-10 w-full py-10 md:py-14'>
        <div className='benroso-container'>
          <div className='mx-auto max-w-3xl text-center' ref={contentRef}>
            {breadcrumbs?.length ? (
              <nav
                aria-label='Breadcrumb'
                className={cn(
                  'mb-8 flex flex-wrap items-center justify-center gap-x-3 text-sm md:mb-10',
                  isPipeUppercase
                    ? 'font-semibold uppercase tracking-[0.14em] text-white/75'
                    : 'text-white/70'
                )}
              >
                {breadcrumbs.map((crumb, index) => (
                  <span className='inline-flex items-center gap-3' key={`${crumb.label}-${index}`}>
                    {index > 0 ? (
                      <span aria-hidden className={isPipeUppercase ? 'text-white/50' : undefined}>
                        {isPipeUppercase ? '|' : '/'}
                      </span>
                    ) : null}
                    {crumb.href ? (
                      <a className='transition-colors hover:text-white' href={crumb.href}>
                        {crumb.label}
                      </a>
                    ) : (
                      <span className='text-white'>{crumb.label}</span>
                    )}
                  </span>
                ))}
              </nav>
            ) : null}
            {effectiveEyebrow ? (
              <p
                className={cn(
                  'text-xs font-bold uppercase tracking-[0.2em]',
                  eyebrowTone === 'white' ? 'text-white' : 'benroso-eyebrow'
                )}
              >
                {effectiveEyebrow}
              </p>
            ) : null}
            <h1
              className={cn(
                'mt-4 font-display text-[clamp(2.25rem,5vw,3.75rem)] leading-[1.08]',
                titleTone === 'gold' ? 'text-[var(--benroso-gold)]' : 'text-white'
              )}
            >
              {effectiveTitle}
            </h1>
            {showGoldLine ? <span aria-hidden className='benroso-gold-line mt-5' /> : null}
            {effectiveDescription ? (
              <p className='mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/85'>
                {effectiveDescription}
              </p>
            ) : null}
            {effectiveCta ? (
              <div className='mt-8'>
                {ctaVariant === 'ghost-hero' ? (
                  <PublicHeroGhostCta href={effectiveCta.href} label={effectiveCta.label} />
                ) : (
                  <BenrosoButton href={effectiveCta.href} variant='gold'>
                    {effectiveCta.label}
                  </BenrosoButton>
                )}
              </div>
            ) : null}
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
