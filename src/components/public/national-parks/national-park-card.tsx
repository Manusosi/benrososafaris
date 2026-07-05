import Image from 'next/image';
import Link from 'next/link';

import { Icons } from '@/components/icons';
import { BenrosoButton } from '@/components/public/ui/benroso-button';
import type { NationalParkViewMode } from '@/components/public/national-parks/national-park-view-toggle';
import { localePath } from '@/lib/public/locale-path';
import type { ParkListItem } from '@/lib/public/national-parks';
import { formatTourPrice } from '@/lib/public/tour-format';
import { cn } from '@/lib/utils';

type NationalParkCardProps = {
  compareChecked?: boolean;
  compareDisabled?: boolean;
  href: string;
  item: ParkListItem;
  locale: string;
  onCompareToggle?: (parkId: string) => void;
  variant?: NationalParkViewMode;
};

function locationLabel(item: ParkListItem) {
  return [item.region, item.country].filter(Boolean).join(', ');
}

function badgeLabel(item: ParkListItem) {
  return item.country || item.region || null;
}

function safariStatsLabel(item: ParkListItem) {
  if (!item.tourCount) return null;
  const safariLabel = item.tourCount === 1 ? '1 safari' : `${item.tourCount} safaris`;
  const priceLabel = formatTourPrice(item.priceFrom);
  if (priceLabel) return `${safariLabel} · From ${priceLabel} pp`;
  return safariLabel;
}

export function NationalParkCard({
  compareChecked = false,
  compareDisabled = false,
  href,
  item,
  locale,
  onCompareToggle,
  variant = 'grid'
}: NationalParkCardProps) {
  const isList = variant === 'list';
  const wildlife = item.wildlife.slice(0, isList ? 5 : 3);
  const activities = item.activities.slice(0, isList ? 4 : 2);
  const statsLabel = safariStatsLabel(item);
  const toursHref = localePath(locale, `/tours?park=${encodeURIComponent(item.slug)}`);
  const location = locationLabel(item);
  const badge = badgeLabel(item);

  return (
    <article
      className={cn(
        'group overflow-hidden rounded-[var(--benroso-radius)] border border-[var(--benroso-line)] bg-white shadow-sm transition-shadow hover:shadow-md',
        compareChecked && 'ring-2 ring-[var(--benroso-primary)] ring-offset-2',
        isList ? 'flex flex-col sm:flex-row' : 'flex h-full flex-col'
      )}
    >
      <Link
        className={cn(
          'relative block shrink-0 overflow-hidden bg-[var(--benroso-primary)]',
          isList
            ? 'aspect-[16/10] w-full sm:aspect-auto sm:min-h-[240px] sm:w-[min(34%,340px)] sm:min-w-[250px] sm:self-stretch'
            : 'aspect-[16/10]'
        )}
        href={href}
      >
        {item.imageUrl ? (
          <Image
            alt={item.imageAlt || item.name}
            className='object-cover transition-transform duration-500 group-hover:scale-105'
            fill
            sizes={
              isList
                ? '(max-width: 640px) 100vw, 340px'
                : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
            }
            src={item.imageUrl}
          />
        ) : (
          <div className='absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[var(--benroso-primary)] to-[var(--benroso-primary-dark)]'>
            <Icons.park className='size-12 text-white/25' />
          </div>
        )}
        {badge ? (
          <span className='absolute left-3 top-3 rounded-[var(--benroso-radius)] border border-white/20 bg-black/55 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white backdrop-blur'>
            {badge}
          </span>
        ) : null}
      </Link>

      <div className='flex flex-1 flex-col p-5 md:p-6'>
        <div className='flex items-start justify-between gap-3'>
          {location ? (
            <p className='flex items-center gap-1.5 text-sm font-medium text-[var(--benroso-muted)]'>
              <Icons.mapPin className='size-3.5 shrink-0 text-[var(--benroso-primary)]' />
              {location}
            </p>
          ) : (
            <span />
          )}
          {onCompareToggle ? (
            <label className='flex shrink-0 cursor-pointer items-center gap-2 text-xs font-semibold text-[var(--benroso-primary)]'>
              <input
                checked={compareChecked}
                className='benroso-contact-checkbox-input'
                disabled={compareDisabled}
                onChange={() => onCompareToggle(item.id)}
                type='checkbox'
              />
              Compare
            </label>
          ) : null}
        </div>
        <h2
          className={cn(
            'benroso-heading mt-2 font-display leading-tight',
            isList ? 'text-xl md:text-2xl' : 'text-2xl md:text-[1.75rem]'
          )}
        >
          <Link className='transition-colors hover:text-[var(--benroso-primary)]' href={href}>
            {item.name}
          </Link>
        </h2>

        {item.summary ? (
          <p
            className={cn(
              'benroso-body mt-3 text-[15px] leading-7',
              isList ? 'line-clamp-2 sm:line-clamp-3 sm:flex-1' : 'line-clamp-3 flex-1'
            )}
          >
            {item.summary}
          </p>
        ) : null}

        {statsLabel ? (
          <p className='mt-4 flex items-center gap-2 text-sm font-semibold text-[var(--benroso-primary-dark)]'>
            <Icons.compass className='size-4 shrink-0 text-[var(--benroso-gold)]' />
            {statsLabel}
          </p>
        ) : null}

        {item.bestTimeSummary ? (
          <p className='mt-4 flex gap-2 rounded-[var(--benroso-radius)] bg-[var(--benroso-ivory)] px-3 py-2 text-sm leading-6 text-[var(--benroso-ink)]'>
            <Icons.calendar className='mt-0.5 size-4 shrink-0 text-[var(--benroso-gold)]' />
            <span>{item.bestTimeSummary}</span>
          </p>
        ) : null}

        {wildlife.length || activities.length ? (
          <div className='mt-4 flex flex-wrap gap-2'>
            {wildlife.map((animal) => (
              <span
                className='rounded-[var(--benroso-radius)] border border-[var(--benroso-line)] bg-white px-2.5 py-1 text-xs font-semibold text-[var(--benroso-primary)]'
                key={`wildlife-${animal}`}
              >
                {animal}
              </span>
            ))}
            {activities.map((activity) => (
              <span
                className='rounded-[var(--benroso-radius)] bg-[var(--benroso-lime)]/20 px-2.5 py-1 text-xs font-semibold text-[var(--benroso-primary-dark)]'
                key={`activity-${activity}`}
              >
                {activity}
              </span>
            ))}
          </div>
        ) : null}

        <div
          className={cn(
            'mt-auto border-t border-[var(--benroso-line)] pt-4',
            isList ? 'flex flex-wrap gap-3' : 'grid grid-cols-2 gap-2'
          )}
        >
          <BenrosoButton
            className={cn(!isList && 'w-full justify-center px-2')}
            href={href}
            size='sm'
            variant='accent-outline'
          >
            Explore Park
            <Icons.arrowRight className='h-3.5 w-3.5' />
          </BenrosoButton>
          <BenrosoButton
            className={cn(!isList && 'w-full justify-center px-2')}
            href={toursHref}
            size='sm'
            variant={item.tourCount ? 'accent' : 'accent-outline'}
          >
            View Safaris
            <Icons.arrowRight className='h-3.5 w-3.5' />
          </BenrosoButton>
        </div>
      </div>
    </article>
  );
}
