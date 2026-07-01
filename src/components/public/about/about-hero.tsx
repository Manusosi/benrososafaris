import { HeroMediaBackdrop } from '@/components/public/hero-media-backdrop';
import { BENROSO_ABOUT_HERO } from '@/config/benroso';
import { heroHasMedia } from '@/lib/public/page-heroes';
import type { PageHero } from '@/lib/public/types';
import { cn } from '@/lib/utils';

type AboutHeroProps = {
  breadcrumbs?: Array<{ href?: string; label: string }>;
  className?: string;
  description?: string;
  eyebrow?: string;
  /** Optional per-page hero from Portal > Settings > Hero Sections. */
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
  const hasMedia = heroHasMedia(hero);
  const overlayAlpha = hero ? hero.overlayOpacity : 0.65;
  const effectiveEyebrow = hero?.eyebrow ?? eyebrow;
  const effectiveTitle = hero?.heading ?? title;
  const effectiveDescription = hero?.subheading ?? description;

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
              className='mb-10 flex flex-wrap gap-2 text-sm text-white/70'
            >
              {breadcrumbs.map((crumb, index) => (
                <span className='inline-flex items-center gap-2' key={`${crumb.label}-${index}`}>
                  {index > 0 ? <span>/</span> : null}
                  {crumb.href ? (
                    <a className='hover:text-white' href={crumb.href}>
                      {crumb.label}
                    </a>
                  ) : (
                    <span className='text-white'>{crumb.label}</span>
                  )}
                </span>
              ))}
            </nav>
          ) : null}

          <div className='mx-auto max-w-3xl text-center' data-animate='hero'>
            {effectiveEyebrow ? (
              <p className='text-xs font-bold uppercase tracking-[0.18em] text-white/70'>
                {effectiveEyebrow}
              </p>
            ) : null}
            <h1 className='mt-4 font-display text-[clamp(2.25rem,5vw,3.75rem)] leading-[1.1] text-white'>
              {effectiveTitle}
            </h1>
            <span aria-hidden className='mx-auto mt-5 block h-[3px] w-[72px] bg-white/60' />
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
