import { HeroMediaBackdrop } from '@/components/public/hero-media-backdrop';
import { BenrosoButton } from '@/components/public/ui/benroso-button';
import { heroHasMedia } from '@/lib/public/page-heroes';
import type { PageHero as PageHeroConfig } from '@/lib/public/types';
import { cn } from '@/lib/utils';

type PageHeroProps = {
  breadcrumbs?: Array<{ href?: string; label: string }>;
  className?: string;
  description?: string;
  eyebrow?: string;
  /** Optional per-page hero from Portal > Settings > Hero Sections. */
  hero?: PageHeroConfig | null;
  title: string;
};

export function PageHero({
  breadcrumbs,
  className,
  description,
  eyebrow,
  hero,
  title
}: PageHeroProps) {
  const hasMedia = heroHasMedia(hero);
  const overlayAlpha = hero ? hero.overlayOpacity : 0.68;

  const effectiveEyebrow = hero?.eyebrow ?? eyebrow;
  const effectiveTitle = hero?.heading ?? title;
  const effectiveDescription = hero?.subheading ?? description;

  return (
    <section
      className={cn(
        'relative overflow-hidden border-b border-[var(--benroso-line)] bg-[var(--benroso-primary-dark)] text-white',
        className
      )}
    >
      {hasMedia && hero ? (
        <>
          <HeroMediaBackdrop hero={hero} />
          <div
            aria-hidden
            className='absolute inset-0'
            style={{ backgroundColor: `rgba(47,64,52,${overlayAlpha})` }}
          />
        </>
      ) : null}
      <div className='benroso-container relative z-10 py-14 md:py-20'>
        {breadcrumbs?.length ? (
          <nav aria-label='Breadcrumb' className='mb-6 flex flex-wrap gap-2 text-sm text-white/70'>
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
        {effectiveEyebrow ? (
          <p className='text-xs font-bold uppercase tracking-[0.18em] text-white/70'>
            {effectiveEyebrow}
          </p>
        ) : null}
        <h1 className='mt-3 max-w-4xl font-display text-[clamp(2.25rem,5vw,4rem)] leading-[1.08]'>
          {effectiveTitle}
        </h1>
        {effectiveDescription ? (
          <p className='mt-5 max-w-3xl text-lg leading-8 text-white/80'>{effectiveDescription}</p>
        ) : null}
      </div>
    </section>
  );
}

export function ListingShell({
  children,
  filters,
  title,
  className
}: {
  children: React.ReactNode;
  filters?: React.ReactNode;
  title?: string;
  className?: string;
}) {
  return (
    <section className={cn('benroso-section bg-[var(--benroso-ivory)]', className)}>
      <div className='benroso-container'>
        {title ? (
          <h2 className='benroso-heading mb-8 font-display text-3xl md:hidden'>{title}</h2>
        ) : null}
        <div className='grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)]'>
          {filters ? (
            <aside className='h-fit rounded-[var(--benroso-radius)] border border-[var(--benroso-line)] bg-white p-5 lg:sticky lg:top-[calc(var(--benroso-topbar-h)+var(--benroso-header-h)+1rem)]'>
              {filters}
            </aside>
          ) : null}
          <div>{children}</div>
        </div>
      </div>
    </section>
  );
}

export function EmptyState({
  actionHref,
  actionLabel,
  message,
  title
}: {
  actionHref?: string;
  actionLabel?: string;
  message: string;
  title: string;
}) {
  return (
    <div className='rounded-[var(--benroso-radius)] border border-dashed border-[var(--benroso-line)] bg-white px-8 py-16 text-center'>
      <h3 className='benroso-heading font-display text-2xl'>{title}</h3>
      <p className='benroso-body mx-auto mt-3 max-w-xl'>{message}</p>
      {actionHref && actionLabel ? (
        <div className='mt-6'>
          <BenrosoButton href={actionHref}>{actionLabel}</BenrosoButton>
        </div>
      ) : null}
    </div>
  );
}
