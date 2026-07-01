import Image from 'next/image';
import Link from 'next/link';

import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';

import { BenrosoButton } from '@/components/public/ui/benroso-button';
import type { PublicPackage } from '@/lib/public/types';
import { formatComfortTierLabel } from '@/lib/public/tour-format';

export type TourCardItem = {
  days?: number | null;
  excerpt?: string | null;
  href: string;
  imageAlt?: string | null;
  imageUrl?: string | null;
  nights?: number | null;
  priceFrom?: number | null;
  regionLabel?: string;
  title: string;
};

function formatDuration(days?: number | null, nights?: number | null) {
  if (days && nights) return `${days} Days / ${nights} Nights`;
  if (days) return `${days} Days`;
  return 'Safari';
}

function formatPrice(price?: number | null) {
  if (!price) return null;
  return new Intl.NumberFormat('en-US', {
    currency: 'USD',
    maximumFractionDigits: 0,
    style: 'currency'
  }).format(price);
}

export function TourCard({
  item,
  linkAccent = 'green'
}: {
  item: TourCardItem;
  linkAccent?: 'green' | 'gold';
}) {
  const price = formatPrice(item.priceFrom);
  const linkBorderClass =
    linkAccent === 'gold'
      ? 'benroso-fill-hover border-[var(--benroso-lime)] text-[var(--benroso-lime)] hover:text-[var(--benroso-primary-dark)]'
      : 'border-[var(--benroso-primary)] text-[var(--benroso-primary)] hover:bg-[var(--benroso-primary)] hover:text-white';

  return (
    <article className='flex h-full flex-col overflow-hidden rounded-[var(--benroso-radius)] border border-[var(--benroso-line)] bg-white'>
      <Link
        className='group relative block aspect-[4/3] overflow-hidden bg-[var(--benroso-primary)]'
        href={item.href}
      >
        {item.imageUrl ? (
          <Image
            alt={item.imageAlt || item.title}
            className='object-cover transition-transform duration-500 group-hover:scale-105'
            fill
            sizes='(max-width:768px) 100vw, 33vw'
            src={item.imageUrl}
          />
        ) : (
          <div className='absolute inset-0 bg-[var(--benroso-primary-light)]' />
        )}
        <span className='absolute left-3 top-3 rounded-[var(--benroso-radius)] border border-[var(--benroso-line)] bg-white/95 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[var(--benroso-ink)]'>
          {formatDuration(item.days, item.nights)}
        </span>
        {item.regionLabel ? (
          <span className='absolute right-3 top-3 rounded-[var(--benroso-radius)] border border-[var(--benroso-line)] bg-white/95 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[var(--benroso-ink)]'>
            {item.regionLabel}
          </span>
        ) : null}
      </Link>
      <div className='flex flex-1 flex-col p-5'>
        <h3 className='benroso-heading font-display text-2xl leading-tight'>
          <Link className='transition-colors hover:text-[var(--benroso-primary)]' href={item.href}>
            {item.title}
          </Link>
        </h3>
        {item.excerpt ? (
          <p className='benroso-body mt-3 line-clamp-3 flex-1 text-[15px] leading-7'>
            {item.excerpt}
          </p>
        ) : null}
        <div className='mt-5 flex items-end justify-between gap-4 border-t border-[var(--benroso-line)] pt-4'>
          <div>
            {price ? (
              <>
                <span className='block text-xs font-semibold uppercase tracking-wide text-[var(--benroso-muted)]'>
                  From
                </span>
                <strong className='text-xl text-[var(--benroso-brown)]'>{price}</strong>
                <span className='block text-xs text-[var(--benroso-muted)]'>per person</span>
              </>
            ) : (
              <span className='text-sm font-semibold text-[var(--benroso-brown)]'>
                Request a quote
              </span>
            )}
          </div>
          <Link
            className={cn(
              'inline-flex items-center gap-1 border px-4 py-2 text-xs font-bold uppercase tracking-wide',
              'transition-colors rounded-[var(--benroso-radius)]',
              linkBorderClass
            )}
            href={item.href}
          >
            View Tour
            <Icons.arrowRight className='h-3.5 w-3.5' />
          </Link>
        </div>
      </div>
    </article>
  );
}

export function PackageCard({ item }: { item: PublicPackage }) {
  const price = formatPrice(item.priceFrom);
  const tierLabel = formatComfortTierLabel(item.comfortTier);
  const routeLabel = item.tour
    ? formatDuration(item.tour.days, item.tour.nights)
    : item.group || 'Safari Package';

  return (
    <article className='flex h-full flex-col overflow-hidden rounded-[var(--benroso-radius)] border border-[var(--benroso-line)] bg-white'>
      <Link
        className='group relative block aspect-[4/3] overflow-hidden bg-[var(--benroso-primary)]'
        href={item.href}
      >
        {item.imageUrl ? (
          <Image
            alt={item.imageAlt || item.title}
            className='object-cover transition-transform duration-500 group-hover:scale-105'
            fill
            sizes='(max-width:768px) 100vw, 33vw'
            src={item.imageUrl}
          />
        ) : (
          <div className='absolute inset-0 bg-[var(--benroso-primary-light)]' />
        )}
        <span className='absolute left-3 top-3 rounded-[var(--benroso-radius)] bg-[var(--benroso-lime)] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[var(--benroso-primary-dark)]'>
          {tierLabel}
        </span>
        <span className='absolute right-3 top-3 rounded-[var(--benroso-radius)] border border-[var(--benroso-line)] bg-white/95 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[var(--benroso-ink)]'>
          {routeLabel}
        </span>
      </Link>
      <div className='flex flex-1 flex-col p-5'>
        {item.tour ? (
          <p className='mb-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--benroso-muted)]'>
            Package variant of {item.tour.title}
          </p>
        ) : null}
        <h3 className='benroso-heading font-display text-2xl leading-tight'>
          <Link className='transition-colors hover:text-[var(--benroso-primary)]' href={item.href}>
            {item.title}
          </Link>
        </h3>
        {item.excerpt ? (
          <p className='benroso-body mt-3 line-clamp-3 flex-1 text-[15px] leading-7'>
            {item.excerpt}
          </p>
        ) : null}
        <div className='mt-5 flex items-end justify-between gap-4 border-t border-[var(--benroso-line)] pt-4'>
          <div>
            {price ? (
              <>
                <span className='block text-xs font-semibold uppercase tracking-wide text-[var(--benroso-muted)]'>
                  From
                </span>
                <strong className='text-xl text-[var(--benroso-brown)]'>{price}</strong>
                <span className='block text-xs text-[var(--benroso-muted)]'>per person</span>
              </>
            ) : (
              <span className='text-sm font-semibold text-[var(--benroso-brown)]'>
                Request a quote
              </span>
            )}
          </div>
          <Link
            className={cn(
              'benroso-fill-hover inline-flex items-center gap-1 rounded-[var(--benroso-radius)] border border-[var(--benroso-lime)] px-4 py-2 text-xs font-bold uppercase tracking-wide',
              'text-[var(--benroso-primary)] transition-colors hover:text-[var(--benroso-primary-dark)]'
            )}
            href={item.href}
          >
            View Package
            <Icons.arrowRight className='h-3.5 w-3.5' />
          </Link>
        </div>
      </div>
    </article>
  );
}

export function ExperienceCard({
  item
}: {
  item: {
    category?: string | null;
    excerpt?: string | null;
    href: string;
    imageAlt?: string | null;
    imageUrl?: string | null;
    title: string;
  };
}) {
  return (
    <article className='group flex h-full flex-col overflow-hidden rounded-[var(--benroso-radius)] border border-[var(--benroso-line)] bg-white'>
      <Link
        className='relative block aspect-[4/3] overflow-hidden bg-[var(--benroso-primary)]'
        href={item.href}
      >
        {item.imageUrl ? (
          <Image
            alt={item.imageAlt || item.title}
            className='object-cover transition-transform duration-500 group-hover:scale-105'
            fill
            sizes='(max-width:768px) 100vw, 33vw'
            src={item.imageUrl}
          />
        ) : (
          <div className='absolute inset-0 bg-[var(--benroso-primary-light)]' />
        )}
        {item.category ? (
          <span className='absolute left-3 top-3 rounded-[var(--benroso-radius)] border border-[var(--benroso-line)] bg-white/95 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[var(--benroso-ink)]'>
            {item.category}
          </span>
        ) : null}
      </Link>
      <div className='flex flex-1 flex-col p-5'>
        <h3 className='benroso-heading font-display text-2xl leading-tight'>
          <Link className='transition-colors hover:text-[var(--benroso-primary)]' href={item.href}>
            {item.title}
          </Link>
        </h3>
        {item.excerpt ? (
          <p className='benroso-body mt-3 line-clamp-3 flex-1 text-[15px] leading-7'>
            {item.excerpt}
          </p>
        ) : null}
        <div className='mt-5 border-t border-[var(--benroso-line)] pt-4'>
          <Link
            className={cn(
              'inline-flex items-center gap-1 border border-[var(--benroso-primary)] px-4 py-2 text-xs font-bold uppercase tracking-wide',
              'text-[var(--benroso-primary)] transition-colors hover:bg-[var(--benroso-primary)] hover:text-white',
              'rounded-[var(--benroso-radius)]'
            )}
            href={item.href}
          >
            View Details
            <Icons.arrowRight className='h-3.5 w-3.5' />
          </Link>
        </div>
      </div>
    </article>
  );
}

export function DestinationCard({
  item
}: {
  item: {
    country?: string | null;
    region?: string | null;
    excerpt?: string | null;
    href: string;
    imageAlt?: string | null;
    imageUrl?: string | null;
    title: string;
  };
}) {
  const badge = item.country?.trim() || 'East Africa';

  return (
    <article className='group flex h-full flex-col overflow-hidden rounded-[var(--benroso-radius)] border border-[var(--benroso-line)] bg-white shadow-sm transition-shadow hover:shadow-md'>
      <Link
        className='relative block aspect-[4/3] overflow-hidden bg-[var(--benroso-primary)]'
        href={item.href}
      >
        {item.imageUrl ? (
          <Image
            alt={item.imageAlt || item.title}
            className='object-cover transition-transform duration-500 group-hover:scale-105'
            fill
            sizes='(max-width:768px) 100vw, 33vw'
            src={item.imageUrl}
          />
        ) : (
          <div className='absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[var(--benroso-primary)] to-[var(--benroso-primary-dark)]'>
            <Icons.mapPin className='size-10 text-white/25' />
            <span className='absolute bottom-3 left-3 right-3 truncate font-display text-lg text-white/90'>
              {item.title}
            </span>
          </div>
        )}
        <span className='absolute right-3 top-3 rounded-[var(--benroso-radius)] border border-[var(--benroso-line)] bg-white/95 px-3 py-1 text-xs font-bold uppercase text-[var(--benroso-ink)]'>
          {badge}
        </span>
      </Link>
      <div className='flex flex-1 flex-col p-5'>
        <h3 className='benroso-heading font-display text-2xl'>
          <Link className='transition-colors hover:text-[var(--benroso-primary)]' href={item.href}>
            {item.title}
          </Link>
        </h3>
        {item.region ? (
          <p className='mt-1.5 inline-flex items-center gap-1.5 text-sm text-[var(--benroso-muted)]'>
            <Icons.mapPin className='size-3.5 text-[var(--benroso-primary)]' />
            {item.region}
          </p>
        ) : null}
        {item.excerpt ? (
          <p className='benroso-body mt-3 line-clamp-3 flex-1 text-[15px] leading-7'>
            {item.excerpt}
          </p>
        ) : null}
        <div className='mt-5 border-t border-[var(--benroso-line)] pt-4'>
          <BenrosoButton href={item.href} size='sm' variant='accent-outline'>
            Explore Destination
          </BenrosoButton>
        </div>
      </div>
    </article>
  );
}
