'use client';

import Image from 'next/image';

import { Icons } from '@/components/icons';
import { BenrosoButton } from '@/components/public/ui/benroso-button';
import { ScrollReveal } from '@/components/public/ui/scroll-reveal';
import { TrustedChecklist } from '@/components/public/home/home-trusted-checklist';
import { Slider } from '@/components/public/ui/slider';
import { localePath } from '@/lib/public/locale-path';

const FLEET_SLIDER_IMAGES = [
  {
    imageUrl: '/assets/benroso-fleet-lion.png',
    imageAlt: 'Benroso Safaris four by four with pop up roof near a lion on the plains'
  },
  {
    imageUrl: '/assets/benroso-fleet-mara-gate.png',
    imageAlt: 'Benroso Safaris vehicle at the Masai Mara National Reserve gate'
  },
  {
    imageUrl: '/assets/benroso-fleet-branded.png',
    imageAlt: 'Benroso Safaris Land Cruiser ready for off road game drives'
  },
  {
    imageUrl: '/assets/benroso-fleet-guests.png',
    imageAlt: 'Guests boarding a Benroso Safaris private safari vehicle'
  }
];

const FLEET_HIGHLIGHTS = [
  'Roomy four by four cruisers with a pop up roof, charging points, and space to stand when a sighting calls for it.',
  'KPSGA certified guides who know the parks, read animal behaviour, and pace each day the way you actually want to travel.',
  'Serviced on a regular schedule for East African roads, long days in the park, and those extra stops for the photo you came for.',
  'Ready for night drives where parks allow them, with spotlights and safety kit on board.'
];

export function HomeFleetGuides({ locale }: { locale: string }) {
  return (
    <section className='border-t border-[var(--benroso-line)] bg-white'>
      <div className='benroso-container py-16 md:py-20'>
        <div className='grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-14'>
          <ScrollReveal from='left'>
            <p className='benroso-eyebrow'>How You Travel With Us</p>
            <h2 className='benroso-heading mt-3 font-display text-[clamp(1.875rem,4vw,3rem)] leading-[1.1]'>
              Your Vehicle and Guide Stay With You the Whole Way
            </h2>
            <span className='benroso-gold-line benroso-gold-line--left' />
            <p className='benroso-body mt-6 max-w-xl text-base leading-8'>
              From airport pickup to your last morning in the bush, you ride in the same private
              vehicle with the same people who already know how you like your day paced. No handoffs
              halfway through the trip, and no strangers turning up on day three.
            </p>
            <TrustedChecklist items={FLEET_HIGHLIGHTS} />
            <div className='mt-8 flex flex-wrap gap-4'>
              <BenrosoButton
                className='group'
                href={localePath(locale, '/our-fleet')}
                variant='primary'
              >
                <Icons.fleet className='h-4 w-4 transition-transform duration-500 ease-out group-hover:-translate-y-0.5 group-hover:scale-110' />
                View Our Fleet
              </BenrosoButton>
              <BenrosoButton
                className='group'
                href={localePath(locale, '/about#team')}
                variant='accent-outline'
              >
                <Icons.teams className='h-4 w-4 transition-transform duration-500 ease-out group-hover:scale-110' />
                Meet Our Guides
                <Icons.arrowRight className='h-4 w-4 transition-transform duration-300 group-hover:translate-x-1' />
              </BenrosoButton>
            </div>
          </ScrollReveal>

          <ScrollReveal className='relative' from='right'>
            <Slider autoPlayMs={5500} showArrows={false}>
              {FLEET_SLIDER_IMAGES.map((image) => (
                <div
                  className='relative aspect-[4/3] overflow-hidden rounded-[var(--benroso-radius)] bg-[var(--benroso-primary)]'
                  key={image.imageUrl}
                >
                  <Image
                    alt={image.imageAlt}
                    className='object-cover'
                    fill
                    loading='lazy'
                    sizes='(max-width:1024px) 100vw, 50vw'
                    src={image.imageUrl}
                  />
                </div>
              ))}
            </Slider>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
