import { createClient } from '@/lib/supabase/server';
import { localePath } from '@/lib/public/locale-path';

import type {
  AccommodationListFilters,
  PublicAccommodation,
  PublicAccommodationDetail,
  PublicAccommodationMedia
} from './types';
import { buildLocationLabel, countriesMatch } from './constants';

type AccommodationTranslationRow = {
  accommodation:
    | {
        amenities: unknown;
        availability: string | null;
        comfort_level: string | null;
        country: string | null;
        deleted_at?: string | null;
        destination_id?: string | null;
        gallery: string[] | null;
        id: string;
        map_query?: string | null;
        price_per_night: number | null;
        property_type: string | null;
        region: string | null;
        status: string;
      }
    | Array<{
        amenities: unknown;
        availability: string | null;
        comfort_level: string | null;
        country: string | null;
        deleted_at?: string | null;
        destination_id?: string | null;
        gallery: string[] | null;
        id: string;
        map_query?: string | null;
        price_per_night: number | null;
        property_type: string | null;
        region: string | null;
        status: string;
      }>
    | null;
  description: { html?: string; text?: string } | null;
  name: string;
  og_image?:
    | { alt?: string | null; url?: string | null }
    | Array<{ alt?: string | null; url?: string | null }>
    | null;
  seo_description: string | null;
  seo_title: string | null;
  slug: string;
  summary: string | null;
};

type DestinationLookup = {
  id: string;
  label: string;
  slug: string;
};

function unwrapRelation<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function parseStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string' && item.length > 0);
}

function parseGalleryIds(value: unknown): string[] {
  return parseStringArray(value);
}

async function resolveMediaByIds(ids: string[]): Promise<Map<string, PublicAccommodationMedia>> {
  const uniqueIds = [...new Set(ids.filter(Boolean))];
  if (!uniqueIds.length) return new Map();

  const supabase = await createClient();
  const { data } = await supabase.from('media_assets').select('id, url, alt').in('id', uniqueIds);

  return new Map(
    (data ?? []).map((asset) => [
      asset.id,
      {
        alt: asset.alt,
        id: asset.id,
        url: asset.url
      }
    ])
  );
}

function coverFromGallery(
  galleryIds: string[],
  mediaById: Map<string, PublicAccommodationMedia>,
  fallbackTitle: string,
  ogImage?: { alt?: string | null; url?: string | null } | null
) {
  const coverId = galleryIds[0];
  if (coverId) {
    const cover = mediaById.get(coverId);
    if (cover?.url) {
      return {
        imageAlt: cover.alt ?? fallbackTitle,
        imageUrl: cover.url
      };
    }
  }

  if (ogImage?.url) {
    return {
      imageAlt: ogImage.alt ?? fallbackTitle,
      imageUrl: ogImage.url
    };
  }

  return { imageAlt: null, imageUrl: null };
}

function mapListingRow(
  row: AccommodationTranslationRow,
  locale: string,
  mediaById: Map<string, PublicAccommodationMedia>,
  destinationsById: Map<string, DestinationLookup>
): PublicAccommodation | null {
  const accommodation = unwrapRelation(row.accommodation);
  if (!accommodation || accommodation.status !== 'published' || accommodation.deleted_at)
    return null;

  const galleryIds = parseGalleryIds(accommodation.gallery);
  const ogImage = unwrapRelation(row.og_image);
  const cover = coverFromGallery(galleryIds, mediaById, row.name, ogImage);
  const destination = accommodation.destination_id
    ? (destinationsById.get(accommodation.destination_id) ?? null)
    : null;

  return {
    availability:
      accommodation.availability === 'available' ||
      accommodation.availability === 'on_request' ||
      accommodation.availability === 'limited'
        ? accommodation.availability
        : null,
    comfortLevel: accommodation.comfort_level,
    country: accommodation.country,
    destination,
    excerpt: row.summary,
    href: localePath(locale, `/accommodations/${row.slug}`),
    id: accommodation.id,
    imageAlt: cover.imageAlt,
    imageUrl: cover.imageUrl,
    locationLabel: buildLocationLabel(accommodation.region, accommodation.country),
    name: row.name,
    pricePerNight: accommodation.price_per_night,
    propertyType: accommodation.property_type,
    region: accommodation.region,
    slug: row.slug
  };
}

async function fetchPublishedRows(locale: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from('accommodation_translations')
    .select(
      `
      slug,
      name,
      summary,
      description,
      seo_title,
      seo_description,
      accommodation:accommodations!inner(
        id,
        status,
        country,
        region,
        destination_id,
        comfort_level,
        property_type,
        price_per_night,
        availability,
        gallery,
        amenities,
        map_query,
        deleted_at
      ),
      og_image:media_assets!accommodation_translations_og_image_id_fkey(url, alt)
    `
    )
    .eq('locale', locale)
    .eq('accommodation.status', 'published')
    .is('accommodation.deleted_at', null)
    .order('name');

  return (data ?? []) as AccommodationTranslationRow[];
}

async function resolveDestinationsByIds(
  destinationIds: string[],
  locale: string
): Promise<Map<string, DestinationLookup>> {
  const uniqueIds = [...new Set(destinationIds.filter(Boolean))];
  if (!uniqueIds.length) return new Map();

  const supabase = await createClient();
  const { data } = await supabase
    .from('destination_translations')
    .select('destination_id, name, slug')
    .eq('locale', locale)
    .in('destination_id', uniqueIds);

  const byId = new Map<string, DestinationLookup>();
  for (const row of data ?? []) {
    byId.set(row.destination_id, {
      id: row.destination_id,
      label: row.name,
      slug: row.slug
    });
  }

  if (locale !== 'en') {
    const missingIds = uniqueIds.filter((id) => !byId.has(id));
    if (missingIds.length) {
      const { data: fallback } = await supabase
        .from('destination_translations')
        .select('destination_id, name, slug')
        .eq('locale', 'en')
        .in('destination_id', missingIds);
      for (const row of fallback ?? []) {
        if (!byId.has(row.destination_id)) {
          byId.set(row.destination_id, {
            id: row.destination_id,
            label: row.name,
            slug: row.slug
          });
        }
      }
    }
  }

  return byId;
}

function matchesFilters(
  item: PublicAccommodation,
  filters: Omit<AccommodationListFilters, 'locale'>
) {
  if (
    filters.countries?.length &&
    !filters.countries.some((country) => countriesMatch(item.country, country))
  ) {
    return false;
  }
  if (
    filters.propertyTypes?.length &&
    (!item.propertyType || !filters.propertyTypes.includes(item.propertyType))
  ) {
    return false;
  }
  if (
    filters.comfortLevels?.length &&
    (!item.comfortLevel || !filters.comfortLevels.includes(item.comfortLevel))
  ) {
    return false;
  }
  if (filters.regions?.length && (!item.region || !filters.regions.includes(item.region))) {
    return false;
  }
  if (
    filters.destinationSlugs?.length &&
    (!item.destination?.slug || !filters.destinationSlugs.includes(item.destination.slug))
  ) {
    return false;
  }
  if (filters.minPrice != null && (item.pricePerNight ?? 0) < filters.minPrice) return false;
  if (
    filters.maxPrice != null &&
    (item.pricePerNight ?? Number.MAX_SAFE_INTEGER) > filters.maxPrice
  ) {
    return false;
  }
  return true;
}

export async function listPublishedAccommodations(
  filters: AccommodationListFilters
): Promise<PublicAccommodation[]> {
  const rows = await fetchPublishedRows(filters.locale);
  const galleryIds = rows.flatMap((row) =>
    parseGalleryIds(unwrapRelation(row.accommodation)?.gallery)
  );
  const destinationIds = rows.flatMap((row) => {
    const destinationId = unwrapRelation(row.accommodation)?.destination_id;
    return destinationId ? [destinationId] : [];
  });
  const [mediaById, destinationsById] = await Promise.all([
    resolveMediaByIds(galleryIds),
    resolveDestinationsByIds(destinationIds, filters.locale)
  ]);

  return rows
    .map((row) => mapListingRow(row, filters.locale, mediaById, destinationsById))
    .filter((item): item is PublicAccommodation => item !== null)
    .filter((item) =>
      matchesFilters(item, {
        comfortLevels: filters.comfortLevels,
        countries: filters.countries,
        destinationSlugs: filters.destinationSlugs,
        maxPrice: filters.maxPrice,
        minPrice: filters.minPrice,
        propertyTypes: filters.propertyTypes,
        regions: filters.regions
      })
    );
}

export async function getRelatedAccommodationsInRegion(
  locale: string,
  options: {
    country?: string | null;
    excludeId: string;
    limit?: number;
    region?: string | null;
  }
): Promise<PublicAccommodation[]> {
  const { country, excludeId, limit = 6, region } = options;
  const filters: AccommodationListFilters = { locale };

  if (region) {
    filters.regions = [region];
  } else if (country) {
    filters.countries = [country];
  }

  const items = await listPublishedAccommodations(filters);
  return items.filter((item) => item.id !== excludeId).slice(0, limit);
}

export async function getPublishedAccommodationBySlug(
  locale: string,
  slug: string
): Promise<PublicAccommodationDetail | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('accommodation_translations')
    .select(
      `
      slug,
      name,
      summary,
      description,
      seo_title,
      seo_description,
      accommodation:accommodations!inner(
        id,
        status,
        country,
        region,
        destination_id,
        comfort_level,
        property_type,
        price_per_night,
        availability,
        gallery,
        amenities,
        map_query,
        deleted_at
      ),
      og_image:media_assets!accommodation_translations_og_image_id_fkey(url, alt)
    `
    )
    .eq('locale', locale)
    .eq('slug', slug)
    .eq('accommodation.status', 'published')
    .is('accommodation.deleted_at', null)
    .maybeSingle<AccommodationTranslationRow>();

  if (!data) return null;

  const accommodation = unwrapRelation(data.accommodation);
  if (!accommodation) return null;

  const galleryIds = parseGalleryIds(accommodation.gallery);
  const destinationsById = await resolveDestinationsByIds(
    accommodation.destination_id ? [accommodation.destination_id] : [],
    locale
  );
  const mediaById = await resolveMediaByIds(galleryIds);
  const listing = mapListingRow(data, locale, mediaById, destinationsById);
  if (!listing) return null;

  const description = data.description;
  const descriptionHtml = description?.html ?? description?.text ?? null;

  const gallery = galleryIds.flatMap((id) => {
    const asset = mediaById.get(id);
    return asset?.url ? [asset] : [];
  });

  return {
    ...listing,
    amenities: parseStringArray(accommodation.amenities),
    descriptionHtml,
    gallery,
    mapQuery: accommodation.map_query ?? null,
    seoDescription: data.seo_description,
    seoTitle: data.seo_title
  };
}

export async function getAccommodationFilterFacets(locale: string) {
  const [items, destinations] = await Promise.all([
    listPublishedAccommodations({ locale }),
    listPublishedDestinationOptions(locale)
  ]);

  const countries = new Set<string>();
  const propertyTypes = new Set<string>();
  const comfortLevels = new Set<string>();
  const regions = new Set<string>();
  const prices: number[] = [];

  for (const item of items) {
    if (item.country) countries.add(item.country);
    if (item.propertyType) propertyTypes.add(item.propertyType);
    if (item.comfortLevel) comfortLevels.add(item.comfortLevel);
    if (item.region) regions.add(item.region);
    if (item.pricePerNight != null) prices.push(item.pricePerNight);
  }

  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 1000;

  return {
    comfortLevels: [...comfortLevels].toSorted((a, b) => a.localeCompare(b)),
    countries: [...countries].toSorted((a, b) => a.localeCompare(b)),
    destinations,
    priceBounds: {
      min: Math.floor(minPrice / 50) * 50,
      max: Math.ceil(maxPrice / 50) * 50 || 1000
    },
    propertyTypes: [...propertyTypes].toSorted((a, b) => a.localeCompare(b)),
    regions: [...regions].toSorted((a, b) => a.localeCompare(b))
  };
}

async function listPublishedDestinationOptions(locale: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('destination_translations')
    .select('name, slug, destination:destinations!inner(country, deleted_at, status)')
    .eq('locale', locale)
    .eq('destination.status', 'published')
    .is('destination.deleted_at', null)
    .order('name', { ascending: true });

  const options = (data ?? []).flatMap((row) => {
    const destination = Array.isArray(row.destination) ? row.destination[0] : row.destination;
    if (!destination || destination.status !== 'published' || destination.deleted_at) return [];
    return [
      {
        country: (destination.country as string | null) ?? null,
        label: row.name,
        slug: row.slug
      }
    ];
  });

  if (options.length || locale === 'en') return options;

  const { data: fallback } = await supabase
    .from('destination_translations')
    .select('name, slug, destination:destinations!inner(country, deleted_at, status)')
    .eq('locale', 'en')
    .eq('destination.status', 'published')
    .is('destination.deleted_at', null)
    .order('name', { ascending: true });

  return (fallback ?? []).flatMap((row) => {
    const destination = Array.isArray(row.destination) ? row.destination[0] : row.destination;
    if (!destination || destination.status !== 'published' || destination.deleted_at) return [];
    return [
      {
        country: (destination.country as string | null) ?? null,
        label: row.name,
        slug: row.slug
      }
    ];
  });
}
