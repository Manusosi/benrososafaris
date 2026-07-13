import type { PublicTourPricingTier } from './types';
import {
  TOUR_EAST_AFRICA_MARKET_ID,
  TOUR_SAFARI_MARKET_IDS,
  tourMarketCatalogLabel,
  type TourSafariMarketId
} from '@/features/experiences/public/tour-markets';

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
  const amount = price.toLocaleString('en-US', { maximumFractionDigits: 0 });
  if (currency === 'USD') return `$${amount}`;
  return `${currency} ${amount}`;
}

export function formatTourDuration(days?: number | null, nights?: number | null) {
  if (days && nights) return `${days} Days / ${nights} Nights`;
  if (days) return `${days} Days`;
  return 'Safari';
}

export const TOUR_CATALOG_COUNTRIES = TOUR_SAFARI_MARKET_IDS.map((slug) => ({
  country: tourMarketCatalogLabel(slug),
  slug,
  flag: slug === TOUR_EAST_AFRICA_MARKET_ID ? '🌍' : ''
}));

export function tourCountrySlugFromLabel(label: string): TourSafariMarketId | null {
  const normalized = label.trim().toLowerCase();
  const match = TOUR_CATALOG_COUNTRIES.find(
    (item) =>
      item.country.toLowerCase() === normalized ||
      item.slug === normalized ||
      item.country.toLowerCase().replace(/\s+safaris$/i, '') === normalized
  );
  return (match?.slug as TourSafariMarketId | undefined) ?? null;
}

export function tourCountryLabelFromSlug(slug: string): string | null {
  if (!TOUR_SAFARI_MARKET_IDS.includes(slug as TourSafariMarketId)) return null;
  return tourMarketCatalogLabel(slug as TourSafariMarketId);
}

export const TOUR_CATALOG_DURATION_BOUNDS = { min: 1, max: 14 } as const;
export const TOUR_CATALOG_PRICE_BOUNDS = { min: 200, max: 10000 } as const;
