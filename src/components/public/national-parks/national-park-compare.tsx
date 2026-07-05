'use client';

import Link from 'next/link';

import { Icons } from '@/components/icons';
import { BenrosoButton } from '@/components/public/ui/benroso-button';
import { localePath } from '@/lib/public/locale-path';
import type { ParkListItem } from '@/lib/public/national-parks';
import { formatTourPrice } from '@/lib/public/tour-format';
import { cn } from '@/lib/utils';

type NationalParkCompareProps = {
  locale: string;
  onClear: () => void;
  /** Live ParkListItem rows from listPublishedParks — no hardcoded compare values. */
  parks: ParkListItem[];
};

function overlapWildlife(left: ParkListItem, right: ParkListItem) {
  const rightSet = new Set(right.wildlife.map((item) => item.toLowerCase()));
  return left.wildlife.filter((item) => rightSet.has(item.toLowerCase()));
}

function formatSize(value: number | null) {
  if (!value) return '—';
  return `${value.toLocaleString()} km²`;
}

function formatEstablished(value: number | null) {
  return value ? String(value) : '—';
}

function formatSafariStats(park: ParkListItem) {
  if (!park.tourCount) return 'No published safaris yet';
  const safariLabel = park.tourCount === 1 ? '1 safari' : `${park.tourCount} safaris`;
  const priceLabel = formatTourPrice(park.priceFrom);
  return priceLabel ? `${safariLabel} · From ${priceLabel} pp` : safariLabel;
}

function TagList({ items, shared }: { items: string[]; shared?: string[] }) {
  if (!items.length) {
    return <span className='text-sm text-[var(--benroso-muted)]'>—</span>;
  }

  const sharedSet = new Set((shared ?? []).map((item) => item.toLowerCase()));

  return (
    <div className='flex flex-wrap gap-2'>
      {items.map((item) => (
        <span
          className={cn(
            'rounded-[var(--benroso-radius)] px-2.5 py-1 text-xs font-semibold',
            sharedSet.has(item.toLowerCase())
              ? 'bg-[var(--benroso-lime)]/25 text-[var(--benroso-primary-dark)]'
              : 'border border-[var(--benroso-line)] bg-white text-[var(--benroso-primary)]'
          )}
          key={item}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function CompareColumn({ locale, park }: { locale: string; park: ParkListItem }) {
  return (
    <div className='rounded-[var(--benroso-radius)] border border-[var(--benroso-line)] bg-white p-5'>
      <p className='benroso-eyebrow'>Compare</p>
      <h3 className='benroso-heading mt-2 font-display text-xl leading-tight'>{park.name}</h3>
      <p className='mt-2 text-sm text-[var(--benroso-muted)]'>
        {[park.region, park.country].filter(Boolean).join(', ') || '—'}
      </p>
      <div className='mt-5 space-y-4'>
        <CompareRow label='Best time' value={park.bestTimeSummary || '—'} />
        <CompareRow label='Size' value={formatSize(park.parkSizeKm2)} />
        <CompareRow label='Established' value={formatEstablished(park.establishedYear)} />
        <CompareRow label='Safaris' value={formatSafariStats(park)} />
      </div>
      <div className='mt-5 flex flex-wrap gap-3'>
        <BenrosoButton
          href={localePath(locale, `/national-parks/${park.slug}`)}
          size='sm'
          variant='accent-outline'
        >
          Explore Park
        </BenrosoButton>
        <BenrosoButton
          href={localePath(locale, `/tours?park=${encodeURIComponent(park.slug)}`)}
          size='sm'
          variant={park.tourCount ? 'accent' : 'accent-outline'}
        >
          View Safaris
        </BenrosoButton>
      </div>
    </div>
  );
}

function CompareRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className='text-xs font-bold uppercase tracking-[0.12em] text-[var(--benroso-muted)]'>
        {label}
      </p>
      <p className='mt-1 text-sm leading-6 text-[var(--benroso-ink)]'>{value}</p>
    </div>
  );
}

export function NationalParkCompare({ locale, onClear, parks }: NationalParkCompareProps) {
  if (parks.length !== 2) return null;

  const [left, right] = parks;
  const sharedWildlife = overlapWildlife(left, right);

  return (
    <section className='mb-8 rounded-[var(--benroso-radius)] border border-[var(--benroso-line)] bg-[var(--benroso-ivory)] p-5 md:p-6'>
      <div className='flex flex-wrap items-start justify-between gap-4'>
        <div>
          <p className='benroso-eyebrow'>Compare Parks</p>
          <h2 className='benroso-heading mt-2 font-display text-2xl leading-tight'>
            {left.name} vs {right.name}
          </h2>
          <p className='mt-2 max-w-2xl text-sm leading-7 text-[var(--benroso-muted)]'>
            Compare wildlife, activities, seasonality, and published safari availability side by
            side.
          </p>
        </div>
        <button
          className='inline-flex items-center gap-2 text-sm font-semibold text-[var(--benroso-primary)] transition-colors hover:text-[var(--benroso-primary-dark)]'
          onClick={onClear}
          type='button'
        >
          <Icons.close className='size-4' />
          Clear comparison
        </button>
      </div>

      <div className='mt-6 grid gap-6 lg:grid-cols-2'>
        <CompareColumn locale={locale} park={left} />
        <CompareColumn locale={locale} park={right} />
      </div>

      <div className='mt-6 grid gap-6 lg:grid-cols-2'>
        <div className='rounded-[var(--benroso-radius)] border border-[var(--benroso-line)] bg-white p-5'>
          <p className='text-xs font-bold uppercase tracking-[0.12em] text-[var(--benroso-muted)]'>
            Wildlife
          </p>
          {sharedWildlife.length ? (
            <p className='mt-2 text-sm text-[var(--benroso-primary-dark)]'>
              Shared highlights: {sharedWildlife.join(', ')}
            </p>
          ) : null}
          <div className='mt-4 grid gap-4 md:grid-cols-2'>
            <div>
              <p className='text-xs font-semibold text-[var(--benroso-muted)]'>{left.name}</p>
              <div className='mt-2'>
                <TagList items={left.wildlife} shared={sharedWildlife} />
              </div>
            </div>
            <div>
              <p className='text-xs font-semibold text-[var(--benroso-muted)]'>{right.name}</p>
              <div className='mt-2'>
                <TagList items={right.wildlife} shared={sharedWildlife} />
              </div>
            </div>
          </div>
        </div>

        <div className='rounded-[var(--benroso-radius)] border border-[var(--benroso-line)] bg-white p-5'>
          <p className='text-xs font-bold uppercase tracking-[0.12em] text-[var(--benroso-muted)]'>
            Activities
          </p>
          <div className='mt-4 grid gap-4 md:grid-cols-2'>
            <div>
              <p className='text-xs font-semibold text-[var(--benroso-muted)]'>{left.name}</p>
              <div className='mt-2'>
                <TagList items={left.activities} />
              </div>
            </div>
            <div>
              <p className='text-xs font-semibold text-[var(--benroso-muted)]'>{right.name}</p>
              <div className='mt-2'>
                <TagList items={right.activities} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className='mt-5 text-sm text-[var(--benroso-muted)]'>
        Ready to book?{' '}
        <Link
          className='font-semibold text-[var(--benroso-primary)] hover:underline'
          href={localePath(locale, '/contact')}
        >
          Ask a safari planner
        </Link>{' '}
        to connect the right parks with your dates and lodge tier.
      </p>
    </section>
  );
}
