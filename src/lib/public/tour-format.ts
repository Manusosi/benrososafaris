import type { PublicTourPricingTier } from './types';

export const TOUR_COMFORT_TIERS: Array<{
  value: PublicTourPricingTier['tier'];
  label: string;
  packageLabel: string;
}> = [
  { value: 'budget', label: 'Budget', packageLabel: 'Budget Package' },
  { value: 'mid_range', label: 'Mid Range', packageLabel: 'Mid-Range Package' },
  { value: 'luxury', label: 'Luxury', packageLabel: 'Luxury Package' }
];

export function formatComfortTierLabel(
  tier: PublicTourPricingTier['tier'] | null | undefined,
  variant: 'short' | 'package' = 'package'
) {
  if (!tier) return 'Custom Package';
  const option = TOUR_COMFORT_TIERS.find((item) => item.value === tier);
  if (!option) return 'Custom Package';
  return variant === 'short' ? option.label : option.packageLabel;
}

export function formatTourPrice(price?: number | null, currency = 'USD') {
  if (!price) return null;
  return new Intl.NumberFormat('en-US', {
    currency,
    maximumFractionDigits: 0,
    style: 'currency'
  }).format(price);
}

export function formatTourDuration(days?: number | null, nights?: number | null) {
  if (days && nights) return `${days} Days / ${nights} Nights`;
  if (days) return `${days} Days`;
  return 'Safari';
}
