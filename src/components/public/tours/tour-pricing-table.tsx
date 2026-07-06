'use client';

import { Icons } from '@/components/icons';
import { formatTourPrice } from '@/lib/public/tour-format';
import type { PublicTourPricingTier } from '@/lib/public/types';
import { cn } from '@/lib/utils';

type TourPricingTableProps = {
  locale?: string;
  tiers: PublicTourPricingTier[];
};

function collectBands(tier: PublicTourPricingTier) {
  const bands: string[] = [];
  for (const season of tier.seasons) {
    for (const cell of season.cells) {
      if (!bands.includes(cell.groupBand)) bands.push(cell.groupBand);
    }
  }
  return bands;
}

function formatBandLabel(band: string) {
  const normalized = band.trim().toLowerCase();
  if (normalized.includes('pax') || normalized.includes('person')) return band;
  return `${band} people`;
}

function tierTheme(key: PublicTourPricingTier['tier']) {
  if (key === 'budget') {
    return {
      Icon: Icons.badgeCheck,
      button: 'border-[#5f8a3d]/30 text-[#496e2f] hover:border-[#5f8a3d]/55 hover:bg-[#5f8a3d]/8',
      header: 'border-[#5f8a3d]/25 bg-gradient-to-br from-[#f2faee] via-white to-[#e5f3dc]',
      icon: 'border-[#5f8a3d]/25 bg-[#5f8a3d]/12 text-[#5f8a3d]',
      info: 'text-[#5f8a3d]',
      title: 'text-[#334b25]'
    };
  }

  if (key === 'luxury') {
    return {
      Icon: Icons.pro,
      button:
        'border-[var(--benroso-gold)]/45 text-[var(--benroso-brown)] hover:border-[var(--benroso-gold)] hover:bg-[var(--benroso-gold)]/15',
      header:
        'border-[var(--benroso-gold)]/35 bg-gradient-to-br from-[#fff8df] via-white to-[#f1dfad]',
      icon: 'border-[var(--benroso-gold)]/50 bg-[var(--benroso-gold)]/25 text-[var(--benroso-brown)]',
      info: 'text-[var(--benroso-brown)]',
      title: 'text-[var(--benroso-brown)]'
    };
  }

  return {
    Icon: Icons.exclusive,
    button:
      'border-[var(--benroso-primary)]/28 text-[var(--benroso-primary)] hover:border-[var(--benroso-primary)]/55 hover:bg-[var(--benroso-primary)]/8',
    header:
      'border-[var(--benroso-primary)]/25 bg-gradient-to-br from-[#eef6f1] via-white to-[#dcebe2]',
    icon: 'border-[var(--benroso-primary)]/25 bg-[var(--benroso-primary)]/10 text-[var(--benroso-primary)]',
    info: 'text-[var(--benroso-primary)]',
    title: 'text-[var(--benroso-primary-dark)]'
  };
}

function openTourInquiry() {
  window.dispatchEvent(new CustomEvent('benroso:open-tour-inquiry'));
}

function PriceCell({ currency, price }: { currency: string; price: number | null | undefined }) {
  if (!price) {
    return <span className='text-sm text-[var(--benroso-muted)]'>On request</span>;
  }

  return (
    <span className='inline-flex min-w-[112px] flex-col leading-none'>
      <strong className='font-display text-xl font-bold text-[var(--benroso-heading)]'>
        {formatTourPrice(price, currency)}
      </strong>
      <span className='mt-2 text-xs font-normal text-[var(--benroso-muted)]'>per person</span>
    </span>
  );
}

export function TourPricingTable({ tiers }: TourPricingTableProps) {
  if (!tiers.length) {
    return (
      <div className='rounded-[var(--benroso-radius)] border border-dashed border-[var(--benroso-line)] bg-white p-6'>
        <h3 className='benroso-heading font-display text-xl'>Pricing on Request</h3>
        <p className='benroso-body mt-2 text-sm leading-6'>
          Pricing can vary by dates, group size, and lodge availability. Send an enquiry and the
          team will prepare the correct quote.
        </p>
        <button
          className='mt-5 inline-flex items-center gap-2 rounded-[var(--benroso-button-radius)] border border-[var(--benroso-primary)] px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-[var(--benroso-primary)] transition hover:bg-[var(--benroso-primary)] hover:text-white'
          onClick={openTourInquiry}
          type='button'
        >
          <Icons.mail className='h-4 w-4' />
          Request Prices
        </button>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {tiers.map((tier) => {
        const bands = collectBands(tier);
        const theme = tierTheme(tier.tier);
        const TierIcon = theme.Icon;

        return (
          <div
            className='overflow-hidden rounded-[var(--benroso-radius)] border border-[var(--benroso-line)] bg-white'
            key={tier.id}
          >
            <div className={cn('border-b px-5 py-4', theme.header)}>
              <div className='flex flex-wrap items-start justify-between gap-3'>
                <div className='flex min-w-0 items-center gap-3'>
                  <span
                    aria-hidden
                    className={cn(
                      'flex h-12 w-12 shrink-0 items-center justify-center rounded-full border shadow-sm',
                      theme.icon
                    )}
                  >
                    <TierIcon className='h-6 w-6' />
                  </span>
                  <div className='min-w-0'>
                    <div className='flex items-center gap-2'>
                      <h3 className={cn('font-display text-2xl font-bold', theme.title)}>
                        {tier.label}
                      </h3>
                      <span
                        aria-label='Package level'
                        className={cn('inline-flex rounded-full p-1', theme.info)}
                        title='Package level'
                      >
                        <Icons.info className='h-4 w-4' />
                      </span>
                    </div>
                    {tier.blurb ? (
                      <p className='mt-1 max-w-3xl text-sm leading-6 text-[var(--benroso-muted)]'>
                        {tier.blurb}
                      </p>
                    ) : null}
                  </div>
                </div>
                <button
                  className={cn(
                    'inline-flex items-center gap-2 rounded-[var(--benroso-button-radius)] border bg-white/70 px-4 py-2 text-xs font-bold uppercase tracking-wide shadow-sm transition',
                    theme.button
                  )}
                  onClick={openTourInquiry}
                  type='button'
                >
                  <Icons.mail className='h-4 w-4' />
                  Enquire
                </button>
              </div>
            </div>

            {bands.length && tier.seasons.length ? (
              <div className='overflow-x-auto'>
                <table className='w-full min-w-[760px] text-left text-sm'>
                  <thead>
                    <tr className='border-b border-[var(--benroso-line)] text-xs font-bold uppercase tracking-[0.08em] text-[var(--benroso-muted)]'>
                      <th className='px-5 py-3'>Date</th>
                      {bands.map((band) => (
                        <th className='px-5 py-3' key={band}>
                          {formatBandLabel(band)}
                        </th>
                      ))}
                      <th className='px-5 py-3 text-right'>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tier.seasons.map((season) => (
                      <tr
                        className='border-b border-[var(--benroso-line)] last:border-b-0 even:bg-[var(--benroso-ivory)]/35 hover:bg-[var(--benroso-ivory)]/65'
                        key={season.id}
                      >
                        <th className='px-5 py-4 font-semibold text-[var(--benroso-ink)]'>
                          {season.label}
                        </th>
                        {bands.map((band) => {
                          const cell = season.cells.find((item) => item.groupBand === band);
                          return (
                            <td className='px-5 py-4 tabular-nums' key={band}>
                              <PriceCell currency={tier.currency} price={cell?.price} />
                            </td>
                          );
                        })}
                        <td className='px-5 py-4 text-right'>
                          <button
                            className={cn(
                              'inline-flex items-center justify-center gap-2 rounded-[var(--benroso-button-radius)] border bg-white px-4 py-2 text-xs font-bold uppercase tracking-wide transition hover:bg-[var(--benroso-ivory)]',
                              theme.button
                            )}
                            onClick={openTourInquiry}
                            type='button'
                          >
                            <Icons.mail className='h-4 w-4' />
                            Book
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className='flex min-h-40 flex-col items-center justify-center gap-3 p-6 text-center'>
                <Icons.info className='h-8 w-8 text-[var(--benroso-gold)]' />
                <p className='benroso-body max-w-sm text-sm leading-7'>
                  This tier is available, but seasonal prices have not been published yet.
                </p>
                <button
                  className='inline-flex items-center gap-2 rounded-[var(--benroso-button-radius)] border border-[var(--benroso-primary)] px-4 py-2 text-xs font-bold uppercase tracking-wide text-[var(--benroso-primary)] transition hover:bg-[var(--benroso-primary)] hover:text-white'
                  onClick={openTourInquiry}
                  type='button'
                >
                  <Icons.mail className='h-4 w-4' />
                  Enquire
                </button>
              </div>
            )}

            {tier.notes ? (
              <p className='border-t border-[var(--benroso-line)] px-5 py-4 text-sm leading-6 text-[var(--benroso-muted)]'>
                {tier.notes}
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
