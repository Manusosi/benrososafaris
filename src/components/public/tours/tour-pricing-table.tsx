import { BenrosoButton } from '@/components/public/ui/benroso-button';
import { localePath } from '@/lib/public/locale-path';
import { formatTourPrice } from '@/lib/public/tour-format';
import type { PublicTourPricingTier } from '@/lib/public/types';

type TourPricingTableProps = {
  locale: string;
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

export function TourPricingTable({ locale, tiers }: TourPricingTableProps) {
  if (!tiers.length) {
    return (
      <div className='rounded-[var(--benroso-radius)] border border-dashed border-[var(--benroso-line)] bg-white p-6'>
        <h3 className='benroso-heading font-display text-xl'>Pricing on Request</h3>
        <p className='benroso-body mt-2 text-sm leading-6'>
          Pricing can vary by dates, group size, and lodge availability. Send an enquiry and the
          team will prepare the correct quote.
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {tiers.map((tier) => {
        const bands = collectBands(tier);
        return (
          <div
            className='overflow-hidden rounded-[var(--benroso-radius)] border border-[var(--benroso-line)] bg-white'
            key={tier.id}
          >
            <div className='border-b border-[var(--benroso-line)] bg-[var(--benroso-ivory)] px-5 py-4'>
              <h3 className='benroso-heading font-display text-xl'>{tier.label}</h3>
              {tier.blurb ? (
                <p className='mt-1 text-sm text-[var(--benroso-muted)]'>{tier.blurb}</p>
              ) : null}
            </div>
            {bands.length && tier.seasons.length ? (
              <div className='overflow-x-auto'>
                <table className='w-full min-w-[680px] text-left text-sm'>
                  <thead>
                    <tr className='border-b border-[var(--benroso-line)] text-xs font-bold uppercase tracking-[0.08em] text-[var(--benroso-muted)]'>
                      <th className='px-5 py-3'>Date</th>
                      {bands.map((band) => (
                        <th className='px-5 py-3' key={band}>
                          {band} {band.toLowerCase().includes('person') ? '' : 'people'}
                        </th>
                      ))}
                      <th className='px-5 py-3 text-right'>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tier.seasons.map((season) => (
                      <tr
                        className='border-b border-[var(--benroso-line)] last:border-b-0'
                        key={season.id}
                      >
                        <th className='px-5 py-4 font-semibold text-[var(--benroso-ink)]'>
                          {season.label}
                        </th>
                        {bands.map((band) => {
                          const cell = season.cells.find((item) => item.groupBand === band);
                          return (
                            <td
                              className='px-5 py-4 tabular-nums text-[var(--benroso-muted)]'
                              key={band}
                            >
                              {cell
                                ? `${formatTourPrice(cell.price, tier.currency)} per person`
                                : '—'}
                            </td>
                          );
                        })}
                        <td className='px-5 py-4 text-right'>
                          <BenrosoButton
                            href={localePath(locale, '/contact')}
                            size='sm'
                            variant='accent-outline'
                          >
                            Book
                          </BenrosoButton>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className='benroso-body px-5 py-5 text-sm'>
                This tier is available, but seasonal prices have not been published yet.
              </p>
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
