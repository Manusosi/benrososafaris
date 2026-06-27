import type { AccommodationAvailability } from './types';

export const SAFARI_COUNTRY_OPTIONS = [
  { value: 'Kenya', label: 'Kenya', icon: '🇰🇪' },
  { value: 'Tanzania', label: 'Tanzania', icon: '🇹🇿' },
  { value: 'Uganda', label: 'Uganda', icon: '🇺🇬' },
  { value: 'Rwanda', label: 'Rwanda', icon: '🇷🇼' },
  { value: 'South Africa', label: 'South Africa', icon: '🇿🇦' }
] as const;

export const ACCOMMODATION_COUNTRIES = SAFARI_COUNTRY_OPTIONS;

export const ACCOMMODATION_PROPERTY_TYPES = [
  'Safari Lodge',
  'Tented Camp',
  'Airbnb / Apartment',
  'Hotel',
  'Boutique'
] as const;

export const ACCOMMODATION_COMFORT_LEVELS = [
  { value: 'economy', label: 'Economy' },
  { value: 'mid-range', label: 'Mid Range' },
  { value: 'luxury', label: 'Luxury' },
  { value: 'ultra-luxury', label: 'Ultra Luxury' }
] as const;

export const ACCOMMODATION_AVAILABILITY_OPTIONS: Array<{
  value: AccommodationAvailability;
  label: string;
}> = [
  { value: 'available', label: 'Available' },
  { value: 'on_request', label: 'On Request' },
  { value: 'limited', label: 'Limited' }
];

function normalizeCountryKey(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, '-');
}

export function normalizeCountryValue(value: string | null | undefined) {
  if (!value) return null;
  const key = normalizeCountryKey(value);
  const match = SAFARI_COUNTRY_OPTIONS.find(
    (option) =>
      normalizeCountryKey(option.value) === key || normalizeCountryKey(option.label) === key
  );
  return match?.value ?? value;
}

export function formatAvailabilityLabel(value: AccommodationAvailability | null | undefined) {
  if (!value) return 'On Request';
  return (
    ACCOMMODATION_AVAILABILITY_OPTIONS.find((option) => option.value === value)?.label ?? value
  );
}

export function formatComfortLevelLabel(value: string | null | undefined) {
  if (!value) return null;
  return (
    ACCOMMODATION_COMFORT_LEVELS.find((option) => option.value === value)?.label ??
    value.replace(/-/g, ' ')
  );
}

export function formatCountryLabel(value: string | null | undefined) {
  if (!value) return null;
  const normalized = normalizeCountryValue(value);
  return SAFARI_COUNTRY_OPTIONS.find((option) => option.value === normalized)?.label ?? normalized;
}

export function countriesMatch(a: string | null | undefined, b: string | null | undefined) {
  if (!a || !b) return false;
  return (
    normalizeCountryKey(normalizeCountryValue(a) ?? a) ===
    normalizeCountryKey(normalizeCountryValue(b) ?? b)
  );
}

export function buildLocationLabel(region: string | null | undefined, country: string | null) {
  const countryLabel = formatCountryLabel(country);
  if (region && countryLabel) return `${region}, ${countryLabel}`;
  return region || countryLabel || 'East Africa';
}

export function buildMapQuery(
  region: string | null | undefined,
  country: string | null,
  mapQuery?: string | null
) {
  if (mapQuery?.trim()) return mapQuery.trim();
  const countryLabel = formatCountryLabel(country);
  if (region && countryLabel) return `${region}, ${countryLabel}`;
  return countryLabel || region || '';
}
