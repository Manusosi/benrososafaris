import Image from 'next/image';
import Link from 'next/link';

import { Icons } from '@/components/icons';
import { BenrosoButton } from '@/components/public/ui/benroso-button';
import type { AccommodationViewMode } from '@/components/public/accommodations/accommodation-view-toggle';
import {
  comfortLevelBadgeClass,
  comfortLevelIconKey,
  formatComfortLevelLabel
} from '@/features/accommodations/public/constants';
import type { PublicAccommodation } from '@/features/accommodations/public/types';
import { cn } from '@/lib/utils';

function formatNightPrice(price?: number | null) {
  if (!price) return null;
  return new Intl.NumberFormat('en-US', {
    currency: 'USD',
    maximumFractionDigits: 0,
    style: 'currency'
  }).format(price);
}

type AccommodationCardProps = {
  item: PublicAccommodation;
  variant?: AccommodationViewMode;
};

export function AccommodationCard({ item, variant = 'grid' }: AccommodationCardProps) {
  const price = formatNightPrice(item.pricePerNight);
  const comfortLabel = formatComfortLevelLabel(item.comfortLevel);
  const comfortIconKey = comfortLevelIconKey(item.comfortLevel);
  const ComfortIcon = comfortIconKey ? Icons[comfortIconKey] : null;
  const isList = variant === 'list';

  return (
    <article
      className={cn(
        'group overflow-hidden rounded-[var(--benroso-radius)] border border-[var(--benroso-line)] bg-white',
        isList ? 'flex flex-col sm:flex-row' : 'flex h-full flex-col'
      )}
    >
      <Link
        className={cn(
          'relative block shrink-0 overflow-hidden bg-[var(--benroso-primary)]',
          isList
            ? 'aspect-[16/10] w-full sm:aspect-auto sm:w-[min(32%,320px)] sm:min-w-[240px] sm:self-stretch sm:min-h-[220px]'
            : 'aspect-[16/10]'
        )}
        href={item.href}
      >
        {item.imageUrl ? (
          <Image
            alt={item.imageAlt || item.name}
            className='object-cover transition-transform duration-500 group-hover:scale-105'
            fill
            sizes={
              isList
                ? '(max-width: 640px) 100vw, 320px'
                : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
            }
            src={item.imageUrl}
          />
        ) : (
          <div className='absolute inset-0 bg-[var(--benroso-primary-light)]' />
        )}
        <div className='absolute left-3 top-3 flex flex-wrap gap-2'>
          {comfortLabel ? (
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-[var(--benroso-radius)] px-3 py-1 text-xs font-bold uppercase tracking-wide',
                comfortLevelBadgeClass(item.comfortLevel)
              )}
            >
              {ComfortIcon ? <ComfortIcon aria-hidden className='size-3.5 shrink-0' /> : null}
              {comfortLabel}
            </span>
          ) : null}
          {item.propertyType ? (
            <span className='rounded-[var(--benroso-radius)] border border-[var(--benroso-line)] bg-white/95 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[var(--benroso-ink)]'>
              {item.propertyType}
            </span>
          ) : null}
        </div>
      </Link>

      <div className='flex flex-1 flex-col p-5 md:p-6'>
        <p className='flex items-center gap-1.5 text-sm font-medium text-[var(--benroso-muted)]'>
          <Icons.mapPin className='size-3.5 shrink-0 text-[var(--benroso-primary)]' />
          {item.locationLabel}
        </p>
        <h2
          className={cn(
            'benroso-heading mt-2 font-display leading-tight',
            isList ? 'text-xl md:text-2xl' : 'text-2xl md:text-[1.75rem]'
          )}
        >
          <Link className='transition-colors hover:text-[var(--benroso-primary)]' href={item.href}>
            {item.name}
          </Link>
        </h2>
        {item.excerpt ? (
          <p
            className={cn(
              'benroso-body mt-3 text-[15px] leading-7',
              isList ? 'line-clamp-2 sm:line-clamp-3 sm:flex-1' : 'line-clamp-3 flex-1'
            )}
          >
            {item.excerpt}
          </p>
        ) : null}

        <div
          className={cn(
            'mt-5 flex gap-4 border-t border-[var(--benroso-line)] pt-4',
            isList
              ? 'flex-col items-stretch sm:mt-auto sm:flex-row sm:items-end sm:justify-end'
              : 'items-end justify-between'
          )}
        >
          <div className={cn(isList ? 'sm:text-right' : undefined)}>
            {price ? (
              <p className='flex flex-wrap items-baseline gap-x-1.5 sm:justify-end'>
                <span className='text-sm font-semibold text-[var(--benroso-muted)]'>From</span>
                <strong className='text-xl text-[var(--benroso-brown)]'>{price}</strong>
                <span className='text-sm text-[var(--benroso-muted)]'>/ night</span>
              </p>
            ) : (
              <span className='text-sm font-semibold text-[var(--benroso-brown)]'>
                Price on request
              </span>
            )}
          </div>
          <Link
            className={cn(
              'inline-flex items-center justify-center gap-1 border border-[var(--benroso-primary)] px-4 py-2 text-xs font-bold uppercase tracking-wide',
              'text-[var(--benroso-primary)] transition-colors hover:bg-[var(--benroso-primary)] hover:text-white',
              'rounded-[var(--benroso-radius)]',
              isList ? 'sm:shrink-0' : undefined
            )}
            href={item.href}
          >
            See Availability
            <Icons.arrowRight className='h-3.5 w-3.5' />
          </Link>
        </div>
      </div>
    </article>
  );
}

export function AccommodationBackLink({ href }: { href: string }) {
  return (
    <BenrosoButton href={href} size='sm' variant='accent-outline'>
      <Icons.chevronLeft className='mr-1 h-4 w-4' />
      Back to all properties
    </BenrosoButton>
  );
}
