'use client';

import { useEffect, useState } from 'react';

import { youtubeVideoId } from '@/lib/public/page-heroes';
import type { PageHero } from '@/lib/public/types';

const HERO_SLIDE_INTERVAL = 6500;

/**
 * Absolutely-positioned hero background (image slider / YouTube / single image)
 * for pages whose hero is configured in Portal > Settings > Hero Sections.
 * Renders nothing when the hero has no media — the host keeps its own backdrop.
 */
export function HeroMediaBackdrop({ hero }: { hero: PageHero }) {
  const videoId = hero.type === 'youtube' ? youtubeVideoId(hero.youtubeUrl) : null;
  const images =
    hero.type === 'slider' || hero.type === 'image'
      ? hero.slides
          .filter((slide) => slide.isActive && slide.mediaUrl)
          .map((slide) => slide.mediaUrl)
      : [];
  const poster = hero.slides[0]?.mediaUrl ?? null;

  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    const interval = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % images.length);
    }, HERO_SLIDE_INTERVAL);
    return () => window.clearInterval(interval);
  }, [images.length]);

  if (videoId) {
    return (
      <>
        {poster ? (
          <div
            aria-hidden
            className='absolute inset-0 bg-cover bg-center bg-no-repeat'
            style={{ backgroundImage: `url("${poster}")` }}
          />
        ) : null}
        <iframe
          allow='autoplay; encrypted-media'
          aria-hidden
          className='pointer-events-none absolute left-1/2 top-1/2 h-[56.25vw] min-h-full w-[177.78vh] min-w-full -translate-x-1/2 -translate-y-1/2'
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&playsinline=1&rel=0&modestbranding=1&showinfo=0`}
          title='Background video'
        />
      </>
    );
  }

  if (images.length === 0) return null;

  return (
    <>
      {images.map((url, index) => (
        <div
          aria-hidden
          className='absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000'
          key={`${url}-${index}`}
          style={{ backgroundImage: `url("${url}")`, opacity: index === activeSlide ? 1 : 0 }}
        />
      ))}
    </>
  );
}
