import Image from 'next/image';

import { ABOUT_VISION_MISSION, ABOUT_WHY_TRAVEL } from '@/lib/public/about-content';

export function AboutMissionCommitment() {
  return (
    <section className='grid lg:grid-cols-2'>
      <div className='relative bg-[var(--benroso-primary-dark)] px-6 py-14 md:px-10 md:py-16 lg:px-12 lg:py-20'>
        <div
          aria-hidden
          className='pointer-events-none absolute inset-0 opacity-20'
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 80%, rgba(0,0,0,0.35) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(0,0,0,0.25) 0%, transparent 45%)'
          }}
        />

        <div className='relative grid gap-10 md:grid-cols-2 md:gap-8 lg:gap-12'>
          <div>
            <p className='font-display text-[clamp(1.5rem,3vw,2rem)] italic leading-none text-[var(--benroso-lime)]/75'>
              Our
            </p>
            <h2 className='font-display text-[clamp(2rem,4vw,2.75rem)] font-bold leading-tight text-white'>
              Mission
            </h2>
            <span
              aria-hidden
              className='benroso-gold-line benroso-gold-line--left mt-5 opacity-80'
            />
            <p className='mt-6 text-base leading-8 text-white/90'>
              {ABOUT_VISION_MISSION.mission.body}
            </p>
          </div>

          <div className='md:border-l md:border-white/15 md:pl-8 lg:pl-10'>
            <h2 className='font-display text-[clamp(1.5rem,3vw,2.25rem)] font-bold leading-tight text-white'>
              {ABOUT_WHY_TRAVEL.title}
            </h2>
            <span
              aria-hidden
              className='benroso-gold-line benroso-gold-line--left mt-5 opacity-80'
            />
            <p className='mt-6 text-base leading-8 text-white/90'>{ABOUT_WHY_TRAVEL.intro}</p>
          </div>
        </div>
      </div>

      <div className='relative min-h-[280px] lg:min-h-[420px]'>
        <Image
          alt='Guests on a rhino conservation safari at Ol Pejeta Conservancy'
          className='object-cover'
          fill
          sizes='(max-width:1024px) 100vw, 50vw'
          src='/assets/ol-pejeta-conservancy-rhino.png'
        />
      </div>
    </section>
  );
}
