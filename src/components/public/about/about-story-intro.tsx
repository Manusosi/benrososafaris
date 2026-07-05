'use client';

import Image from 'next/image';

import { Slider } from '@/components/public/ui/slider';
import { ABOUT_STORY, ABOUT_STORY_IMAGES } from '@/lib/public/about-content';

export function AboutStoryIntro() {
  return (
    <section className='benroso-section'>
      <div className='benroso-container grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-14'>
        <div>
          <h2 className='benroso-heading font-display text-[clamp(2rem,4vw,3rem)] leading-tight'>
            {ABOUT_STORY.title}
          </h2>
          <span aria-hidden className='benroso-gold-line benroso-gold-line--left mt-6' />
          <div className='benroso-body mt-8 space-y-5 text-base leading-8'>
            {ABOUT_STORY.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 48)}>{paragraph}</p>
            ))}
          </div>
        </div>

        <Slider autoPlayMs={5000} showArrows={false}>
          {ABOUT_STORY_IMAGES.map((image) => (
            <div
              className='relative aspect-[4/3] overflow-hidden rounded-[var(--benroso-radius)] bg-[var(--benroso-primary)]'
              key={image.imageUrl}
            >
              <Image
                alt={image.imageAlt}
                className='object-cover'
                fill
                loading={image.imageUrl === ABOUT_STORY_IMAGES[0].imageUrl ? 'eager' : 'lazy'}
                priority={image.imageUrl === ABOUT_STORY_IMAGES[0].imageUrl}
                sizes='(max-width:1024px) 100vw, 50vw'
                src={image.imageUrl}
              />
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
}
