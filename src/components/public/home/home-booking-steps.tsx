'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

import { Icons } from '@/components/icons';
import { BenrosoButton } from '@/components/public/ui/benroso-button';
import { SectionHeader } from '@/components/public/ui/section-header';
import { localePath } from '@/lib/public/locale-path';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const STEPS = [
  {
    icon: 'send' as const,
    title: 'Share Your Dream Safari',
    copy: 'Tell us your dates, group size, and the parks or experiences you have in mind. No obligation, no pressure.'
  },
  {
    icon: 'edit' as const,
    title: 'Receive a Tailored Plan',
    copy: 'Our planners draft a day-by-day route and a clear price, usually within one business day.'
  },
  {
    icon: 'badgeCheck' as const,
    title: 'Confirm & Secure Your Trip',
    copy: 'Refine the details, then secure your safari with a simple deposit and clear payment terms.'
  },
  {
    icon: 'fleet' as const,
    title: 'Travel With Confidence',
    copy: 'A licensed driver-guide and a maintained vehicle handle every transfer and game drive, start to finish.'
  }
];

export function HomeBookingSteps({ locale }: { locale: string }) {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduced || !sectionRef.current) return;

      const scope = sectionRef.current;
      const line = scope.querySelector('[data-booking-line]');
      const nodes = scope.querySelectorAll('[data-booking-node]');
      const cards = scope.querySelectorAll('[data-booking-card]');

      const timeline = gsap.timeline({
        scrollTrigger: { trigger: scope, start: 'top 70%', once: true }
      });

      if (line) {
        timeline.fromTo(line, { scaleX: 0 }, { scaleX: 1, duration: 1, ease: 'power2.inOut' });
      }
      timeline.fromTo(
        nodes,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.8)', stagger: 0.18 },
        line ? '-=0.7' : 0
      );
      timeline.fromTo(
        cards,
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.45, ease: 'power2.out', stagger: 0.18 },
        '<'
      );
    },
    { scope: sectionRef }
  );

  return (
    <section className='benroso-section bg-[var(--benroso-ivory)]' ref={sectionRef}>
      <div className='benroso-container'>
        <SectionHeader
          description='From your first message to your last game drive, booking a Benroso safari is simple and personal.'
          title='How to Book a Safari With Us'
        />

        <div className='relative mt-14'>
          {/* Connector line (desktop) */}
          <span
            aria-hidden
            className='absolute left-0 right-0 top-7 hidden h-0.5 origin-left bg-[var(--benroso-gold)] lg:block'
            data-booking-line
            style={{ transform: 'scaleX(0)' }}
          />

          <ol className='grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6'>
            {STEPS.map((step, index) => {
              const Icon = Icons[step.icon];
              return (
                <li className='relative' key={step.title}>
                  <div
                    className='relative z-10 flex h-14 w-14 items-center justify-center rounded-full border-2 border-[var(--benroso-gold)] bg-white text-[var(--benroso-primary)] shadow-sm'
                    data-booking-node
                  >
                    <Icon className='h-6 w-6' />
                    <span className='absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--benroso-primary)] text-xs font-bold text-white'>
                      {index + 1}
                    </span>
                  </div>
                  <div className='mt-5' data-booking-card>
                    <h3 className='benroso-heading font-display text-xl leading-tight'>
                      {step.title}
                    </h3>
                    <p className='benroso-body mt-2 text-sm leading-7'>{step.copy}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        <div className='mt-12 flex justify-center'>
          <BenrosoButton href={localePath(locale, '/contact')} variant='accent'>
            <Icons.send className='h-4 w-4' />
            Start Planning My Safari
          </BenrosoButton>
        </div>
      </div>
    </section>
  );
}
