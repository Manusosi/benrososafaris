import Image from 'next/image';
import Link from 'next/link';

import { Icons } from '@/components/icons';
import { ABOUT_WHY_TRAVEL } from '@/lib/public/about-content';

type AboutAdvantagesSectionProps = {
  contactHref: string;
};

export function AboutAdvantagesSection({ contactHref }: AboutAdvantagesSectionProps) {
  return (
    <section className='benroso-section bg-white'>
      <div className='benroso-container'>
        <h2 className='text-center text-base font-bold uppercase tracking-[0.06em] text-[var(--benroso-heading)] md:text-lg'>
          {ABOUT_WHY_TRAVEL.advantagesTitle}
        </h2>

        <ul className='mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8'>
          {ABOUT_WHY_TRAVEL.items.map((item) => (
            <li className='text-center' key={item.iconSrc}>
              <Image
                alt=''
                aria-hidden
                className='mx-auto h-12 w-12 object-contain md:h-[52px] md:w-[52px]'
                height={52}
                src={item.iconSrc}
                width={52}
              />
              <p className='mx-auto mt-4 max-w-[14rem] text-[15px] leading-6 text-[var(--benroso-muted)]'>
                {item.text}
              </p>
            </li>
          ))}
        </ul>

        <div className='mt-12 flex justify-center md:mt-14'>
          <Link
            className='group inline-flex min-h-12 min-w-[220px] items-center justify-center gap-2 rounded-[var(--benroso-button-radius)] bg-[var(--benroso-lime)] px-8 text-sm font-bold uppercase tracking-[0.08em] text-[var(--benroso-primary-dark)] transition-colors hover:bg-[var(--benroso-lime-hover)]'
            href={contactHref}
          >
            <span>{ABOUT_WHY_TRAVEL.ctaLabel}</span>
            <Icons.mail aria-hidden className='hidden h-5 w-5 shrink-0 group-hover:block' />
          </Link>
        </div>
      </div>
    </section>
  );
}
