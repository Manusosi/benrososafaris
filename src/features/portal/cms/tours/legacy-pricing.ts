import type { PricingTier } from './schema';

export const LEGACY_PAX_BANDS = ['1 PAX', '2-3 PAX', '4-5 PAX', '6 AND ABOVE'] as const;

export const DEFAULT_LEGACY_SEASONS = [
  '1st JAN - 31ST MARCH',
  '1st April – 31ST MAY',
  '1ST JUN – 30TH JUNE',
  '1ST JULY – 31ST AUG',
  '1ST SEPT – 31ST OCT',
  '1ST NOV – 22ND DEC',
  '23RD – 2ND JAN 2027'
] as const;

export function createLegacyPricingSeason(label: string): PricingTier['seasons'][number] {
  return {
    label,
    dateStart: '',
    dateEnd: '',
    cells: LEGACY_PAX_BANDS.map((groupBand) => ({ groupBand, price: '' }))
  };
}

export function createDefaultLegacyPricingTier(
  tier: PricingTier['tier'] = 'mid_range'
): PricingTier {
  return {
    tier,
    label: '',
    blurb: '',
    notes: '',
    currency: 'USD',
    seasons: DEFAULT_LEGACY_SEASONS.map((label) => createLegacyPricingSeason(label))
  };
}
