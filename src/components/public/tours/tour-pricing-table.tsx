'use client';

import * as React from 'react';

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

type TierTheme = {
  Icon: typeof Icons.badgeCheck;
  button: string;
  headBg: string;
  headFg: string;
  icon: string;
  title: string;
};

function tierTheme(key: PublicTourPricingTier['tier']): TierTheme {
  if (key === 'budget') {
    return {
      Icon: Icons.badgeCheck,
      button:
        'border-[#5f8a3d] text-[#5f8a3d] hover:border-[#5f8a3d] hover:bg-[#5f8a3d] hover:text-white',
      headBg: '#5f8a3d',
      headFg: '#fff',
      icon: 'bg-[#5f8a3d] text-white',
      title: 'text-[#5f8a3d]'
    };
  }

  if (key === 'luxury') {
    return {
      Icon: Icons.pro,
      button:
        'border-[var(--benroso-primary-dark)] text-[var(--benroso-primary-dark)] hover:border-[var(--benroso-primary-dark)] hover:bg-[var(--benroso-primary-dark)] hover:text-white',
      headBg: 'var(--benroso-primary-dark)',
      headFg: '#fff',
      icon: 'bg-[var(--benroso-primary-dark)] text-white',
      title: 'text-[var(--benroso-primary-dark)]'
    };
  }

  return {
    Icon: Icons.exclusive,
    button:
      'border-[var(--benroso-primary)] text-[var(--benroso-primary)] hover:border-[var(--benroso-primary)] hover:bg-[var(--benroso-primary)] hover:text-white',
    headBg: 'var(--benroso-primary)',
    headFg: '#fff',
    icon: 'bg-[var(--benroso-primary)] text-white',
    title: 'text-[var(--benroso-primary)]'
  };
}

function openTourInquiry() {
  window.dispatchEvent(new CustomEvent('benroso:open-tour-inquiry'));
}

function PriceCell({ currency, price }: { currency: string; price: number | null | undefined }) {
  if (!price) {
    return <span className='text-xs text-[var(--benroso-muted)]'>On request</span>;
  }

  return (
    <span className='inline-flex flex-col items-center leading-tight'>
      <strong className='font-display text-base font-bold text-[var(--benroso-heading)] sm:text-[1.05rem]'>
        {formatTourPrice(price, currency)}
      </strong>
      <span className='mt-1 text-[10px] font-normal text-[var(--benroso-muted)] sm:text-[11px]'>
        per person
      </span>
    </span>
  );
}

function PricingTableIntro({
  blurb,
  label,
  theme
}: {
  blurb: string | null;
  label: string;
  theme: TierTheme;
}) {
  const TierIcon = theme.Icon;

  return (
    <div className='benroso-pricing-tier__intro'>
      <div className='flex items-start gap-3'>
        <span
          aria-hidden
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
            theme.icon
          )}
        >
          <TierIcon className='h-4 w-4' />
        </span>
        <div className='min-w-0'>
          <h3
            className={cn('font-display text-lg font-bold leading-tight sm:text-xl', theme.title)}
          >
            {label}
          </h3>
          {blurb ? (
            <p className='mt-1.5 max-w-3xl text-sm leading-6 text-[var(--benroso-muted)]'>
              {blurb}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function TourPricingTable({ tiers }: TourPricingTableProps) {
  if (!tiers.length) {
    return (
      <div className='benroso-contact-credentials-box'>
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
        const seasonWidth = bands.length > 4 ? 21 : 23;
        const actionWidth = 11;
        const paxWidth = bands.length ? (100 - seasonWidth - actionWidth) / bands.length : 0;
        const headStyle = {
          '--pricing-head-bg': theme.headBg,
          '--pricing-head-fg': theme.headFg
        } as React.CSSProperties;

        return (
          <div className='benroso-pricing-tier' key={tier.id}>
            <PricingTableIntro blurb={tier.blurb} label={tier.label} theme={theme} />

            {bands.length && tier.seasons.length ? (
              <div className='benroso-thin-scrollbar overflow-x-auto lg:overflow-x-visible'>
                <div className='benroso-pricing-tier__table-shell'>
                  <table className='benroso-pricing-tier__table text-left text-sm'>
                    <colgroup>
                      <col style={{ width: `${seasonWidth}%` }} />
                      {bands.map((band) => (
                        <col key={band} style={{ width: `${paxWidth}%` }} />
                      ))}
                      <col style={{ width: `${actionWidth}%` }} />
                    </colgroup>
                    <thead className='benroso-pricing-tier__head' style={headStyle}>
                      <tr>
                        <th scope='col'>Season</th>
                        {bands.map((band) => (
                          <th key={band} scope='col'>
                            {formatBandLabel(band)}
                          </th>
                        ))}
                        <th scope='col'>Enquire</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tier.seasons.map((season) => (
                        <tr className='benroso-pricing-tier__row' key={season.id}>
                          <th className='benroso-pricing-tier__season' scope='row'>
                            {season.label}
                          </th>
                          {bands.map((band) => {
                            const cell = season.cells.find((item) => item.groupBand === band);
                            return (
                              <td className='benroso-pricing-tier__price tabular-nums' key={band}>
                                <PriceCell currency={tier.currency} price={cell?.price} />
                              </td>
                            );
                          })}
                          <td className='benroso-pricing-tier__action'>
                            <button
                              className={cn(
                                'inline-flex w-full max-w-[5.25rem] items-center justify-center gap-1 rounded-[var(--benroso-button-radius)] border bg-white px-2 py-1.5 text-[10px] font-bold uppercase tracking-wide transition sm:max-w-none sm:px-2.5 sm:py-2 sm:text-[11px]',
                                theme.button
                              )}
                              onClick={openTourInquiry}
                              type='button'
                            >
                              <Icons.mail className='h-3.5 w-3.5 shrink-0' />
                              Book
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className='flex min-h-36 flex-col items-center justify-center gap-3 p-6 text-center'>
                <Icons.info className='h-7 w-7 text-[var(--benroso-gold)]' />
                <p className='benroso-body max-w-sm text-sm leading-7'>
                  This tier is available, but seasonal prices have not been published yet.
                </p>
                <button
                  className={cn(
                    'inline-flex items-center gap-2 rounded-[var(--benroso-button-radius)] border bg-white px-4 py-2 text-xs font-bold uppercase tracking-wide transition',
                    theme.button
                  )}
                  onClick={openTourInquiry}
                  type='button'
                >
                  <Icons.mail className='h-4 w-4' />
                  Enquire
                </button>
              </div>
            )}

            {tier.notes ? <p className='benroso-pricing-tier__notes'>{tier.notes}</p> : null}
          </div>
        );
      })}
    </div>
  );
}
