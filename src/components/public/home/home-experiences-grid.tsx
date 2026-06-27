'use client';

import Image from 'next/image';
import Link from 'next/link';

import { Icons } from '@/components/icons';
import { ContourBackground } from '@/components/public/contour-background';
import { BenrosoButton } from '@/components/public/ui/benroso-button';
import { ScrollReveal } from '@/components/public/ui/scroll-reveal';
import { SectionHeader } from '@/components/public/ui/section-header';
import { HOME_EXPERIENCE_CATEGORIES } from '@/lib/public/home-content';
import { localePath } from '@/lib/public/locale-path';

export function HomeExperiencesGrid({ locale }: { locale: string }) {
  return (
    <section className='benroso-section relative overflow-hidden bg-white'>
      <ContourBackground opacity={0.07} />
      <div className='benroso-container relative'>
        <SectionHeader
          description='From first-time family safaris to fly-in luxury and gorilla treks, choose the kind of journey that fits you. Every experience is tailorable.'
          title='A Safari for Every Kind of Traveler'
        />

        <ScrollReveal
          className='mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4'
          stagger
        >
          {HOME_EXPERIENCE_CATEGORIES.map((category) => (
            <Link
              className='group relative block aspect-[4/5] overflow-hidden rounded-[var(--benroso-radius)] border border-[var(--benroso-line)]'
              data-reveal-item
              href={localePath(locale, category.href)}
              key={category.id}
            >
              <Image
                alt={category.imageAlt}
                className='object-cover transition-transform duration-500 group-hover:scale-110'
                fill
                sizes='(max-width:768px) 50vw, (max-width:1024px) 33vw, 25vw'
                src={category.imageUrl}
              />
              <span
                aria-hidden
                className='absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent transition-colors group-hover:from-black/90'
              />
              <span className='absolute inset-x-0 bottom-0 p-4'>
                <span className='block font-display text-lg leading-tight text-white'>
                  {category.title}
                </span>
                <span className='mt-1 hidden text-xs leading-5 text-white/80 sm:block'>
                  {category.blurb}
                </span>
                <span className='mt-2 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-[var(--benroso-gold)]'>
                  View Details
                  <Icons.arrowRight className='h-3 w-3 transition-transform group-hover:translate-x-1' />
                </span>
              </span>
            </Link>
          ))}
        </ScrollReveal>

        <div className='mt-10 flex justify-center'>
          <BenrosoButton href={localePath(locale, '/experiences')} variant='accent-outline'>
            See All Experiences
          </BenrosoButton>
        </div>
      </div>
    </section>
  );
}
