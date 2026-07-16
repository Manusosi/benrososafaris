import type { SupabaseClient } from '@supabase/supabase-js';

import type { TourCardItem } from '@/components/public/cards/content-cards';
import { localePath } from '@/lib/public/locale-path';
import { createEnquiryPublicClient } from '@/lib/supabase/service-role';

export interface ParkListItem {
  activities: string[];
  bestTimeSummary: string | null;
  country: string | null;
  establishedYear: number | null;
  imageAlt: string | null;
  imageUrl: string | null;
  id: string;
  name: string;
  parkSizeKm2: number | null;
  priceFrom: number | null;
  region: string | null;
  slug: string;
  summary: string | null;
  tourCount: number;
  wildlife: string[];
}

export type ParkParentDestination = {
  href: string;
  name: string;
  slug: string;
};

export interface ParkDetail {
  id: string;
  slug: string;
  name: string;
  summary: string | null;
  descriptionHtml: string | null;
  country: string | null;
  region: string | null;
  parkSizeKm2: number | null;
  establishedYear: number | null;
  bestTimeSummary: string | null;
  wildlife: string[];
  activities: string[];
  gallery: Array<{ url: string | null; alt: string | null }>;
  faqs: unknown;
  seoTitle: string | null;
  seoDescription: string | null;
  ogImageUrl: string | null;
  ogImageAlt: string | null;
  parentDestination: ParkParentDestination | null;
}

export type ParkListFilters = {
  activities?: string[];
  countries?: string[];
  locale: string;
  regions?: string[];
  wildlife?: string[];
};

export type ParkFilterFacets = {
  activities: string[];
  countries: string[];
  regions: string[];
  wildlife: string[];
};

/** The newly-added `gallery` column is not in generated types yet. */
async function genericClient(): Promise<SupabaseClient> {
  return createEnquiryPublicClient() as unknown as SupabaseClient;
}

type ParkCoverSource = {
  destination_id?: string | null;
  gallery: unknown;
  id: string;
};

/** Park gallery first; falls back to linked destination gallery via destination_id FK. */
async function resolveParkCoverImages(
  supabase: SupabaseClient,
  parks: ParkCoverSource[]
): Promise<Map<string, { url: string | null; alt: string | null }>> {
  const coverByParkId = new Map<string, { url: string | null; alt: string | null }>();
  const parkCoverIdByParkId = new Map<string, string>();
  const fallbackByParkId = new Map<string, string>();
  const mediaIds = new Set<string>();

  for (const park of parks) {
    const coverId = Array.isArray(park.gallery) ? (park.gallery as string[])[0] : undefined;
    if (coverId) {
      parkCoverIdByParkId.set(park.id, coverId);
      mediaIds.add(coverId);
    } else if (park.destination_id) {
      fallbackByParkId.set(park.id, park.destination_id);
    }
  }

  const destCoverIdByDestId = new Map<string, string>();
  if (fallbackByParkId.size) {
    const destinationIds = [...new Set(fallbackByParkId.values())];
    const { data: destinations } = await supabase
      .from('destinations')
      .select('id, gallery')
      .in('id', destinationIds)
      .eq('status', 'published');

    for (const destination of destinations ?? []) {
      const coverId = Array.isArray(destination.gallery)
        ? (destination.gallery as string[])[0]
        : undefined;
      if (coverId) {
        destCoverIdByDestId.set(destination.id as string, coverId);
        mediaIds.add(coverId);
      }
    }
  }

  const media = await resolveMedia(supabase, [...mediaIds]);

  for (const [parkId, coverId] of parkCoverIdByParkId) {
    const cover = media.get(coverId);
    if (cover) coverByParkId.set(parkId, cover);
  }

  for (const [parkId, destinationId] of fallbackByParkId) {
    if (coverByParkId.has(parkId)) continue;
    const coverId = destCoverIdByDestId.get(destinationId);
    if (!coverId) continue;
    const cover = media.get(coverId);
    if (cover) coverByParkId.set(parkId, cover);
  }

  return coverByParkId;
}

/** Resolves media_assets (url + alt) for a set of ids, preserving caller order. */
async function resolveMedia(
  supabase: SupabaseClient,
  ids: string[]
): Promise<Map<string, { url: string | null; alt: string | null }>> {
  const map = new Map<string, { url: string | null; alt: string | null }>();
  if (!ids.length) return map;
  const { data } = await supabase.from('media_assets').select('id, url, alt').in('id', ids);
  for (const row of data ?? []) {
    map.set(row.id as string, {
      url: (row.url as string | null) ?? null,
      alt: (row.alt as string | null) ?? null
    });
  }
  return map;
}

function parseStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter((item) => item.length > 0);
}

function normalizeFacet(value: string) {
  return value.trim().toLowerCase();
}

function matchesListFilter(value: string | null, filters?: string[]) {
  if (!filters?.length) return true;
  if (!value) return false;
  const normalized = normalizeFacet(value);
  return filters.some((filter) => normalizeFacet(filter) === normalized);
}

function matchesArrayFilter(values: string[], filters?: string[]) {
  if (!filters?.length) return true;
  const normalizedValues = values.map(normalizeFacet);
  return filters.some((filter) => normalizedValues.includes(normalizeFacet(filter)));
}

function buildParkListItem(
  park: Record<string, unknown>,
  translation: { name: string; slug: string; summary: string | null },
  cover?: { url: string | null; alt: string | null },
  destinationMeta?: { country: string | null; region: string | null }
): ParkListItem {
  const bestTime = (park.best_time as { summary?: string } | null) ?? null;

  return {
    activities: parseStringArray(park.activities),
    bestTimeSummary: bestTime?.summary ?? null,
    country: (park.country as string | null) ?? destinationMeta?.country ?? null,
    establishedYear: (park.established_year as number | null) ?? null,
    imageAlt: cover?.alt ?? null,
    imageUrl: cover?.url ?? null,
    id: park.id as string,
    name: translation.name,
    parkSizeKm2: (park.park_size_km2 as number | null) ?? null,
    priceFrom: null,
    region: (park.region as string | null) ?? destinationMeta?.region ?? null,
    slug: translation.slug,
    summary: translation.summary,
    tourCount: 0,
    wildlife: parseStringArray(park.wildlife)
  };
}

function matchesFilters(item: ParkListItem, filters: Omit<ParkListFilters, 'locale'>) {
  return (
    matchesListFilter(item.country, filters.countries) &&
    matchesListFilter(item.region, filters.regions) &&
    matchesArrayFilter(item.wildlife, filters.wildlife) &&
    matchesArrayFilter(item.activities, filters.activities)
  );
}

/** Falls back to linked destination country/region when park fields are empty. */
async function resolveDestinationMeta(
  supabase: SupabaseClient,
  destinationIds: string[]
): Promise<Map<string, { country: string | null; region: string | null }>> {
  const map = new Map<string, { country: string | null; region: string | null }>();
  const uniqueIds = [...new Set(destinationIds.filter(Boolean))];
  if (!uniqueIds.length) return map;

  const { data } = await supabase
    .from('destinations')
    .select('id, country, region')
    .in('id', uniqueIds)
    .eq('status', 'published');

  for (const row of data ?? []) {
    map.set(row.id as string, {
      country: (row.country as string | null) ?? null,
      region: (row.region as string | null) ?? null
    });
  }

  return map;
}

/** Published parks for the listing grid, with cover image resolved. */
export async function getPublishedParks(locale: string): Promise<ParkListItem[]> {
  const supabase = await genericClient();

  const { data: parks } = await supabase
    .from('national_parks')
    .select(
      'id, country, region, gallery, destination_id, position, wildlife, activities, best_time, park_size_km2, established_year'
    )
    .eq('status', 'published')
    .order('position', { ascending: true });

  if (!parks?.length) return [];

  const ids = parks.map((p) => p.id as string);
  const destinationIds = parks
    .map((park) => (park.destination_id as string | null) ?? null)
    .filter((id): id is string => Boolean(id));
  const [translations, destinationMeta, coverByParkId] = await Promise.all([
    supabase
      .from('national_park_translations')
      .select('park_id, slug, name, summary')
      .eq('locale', locale)
      .not('published_at', 'is', null)
      .in('park_id', ids)
      .then(({ data }) => data ?? []),
    resolveDestinationMeta(supabase, destinationIds),
    resolveParkCoverImages(
      supabase,
      parks.map((park) => ({
        destination_id: (park.destination_id as string | null) ?? null,
        gallery: park.gallery,
        id: park.id as string
      }))
    )
  ]);

  const translationByPark = new Map(translations.map((t) => [t.park_id as string, t]));

  return parks.flatMap((park) => {
    const translation = translationByPark.get(park.id as string);
    if (!translation) return [];

    const destinationId = (park.destination_id as string | null) ?? null;
    const meta = destinationId ? destinationMeta.get(destinationId) : undefined;

    return [
      buildParkListItem(
        park as Record<string, unknown>,
        {
          name: translation.name as string,
          slug: translation.slug as string,
          summary: (translation.summary as string | null) ?? null
        },
        coverByParkId.get(park.id as string),
        meta
      )
    ];
  });
}

/** Joins live tour_national_parks + published tour prices for compare/listing stats. */
async function attachParkTourStats(locale: string, parks: ParkListItem[]): Promise<ParkListItem[]> {
  if (!parks.length) return parks;

  const supabase = await genericClient();
  const parkIds = parks.map((park) => park.id);
  const { data: links } = await supabase
    .from('tour_national_parks')
    .select('park_id, tour_id')
    .in('park_id', parkIds);

  if (!links?.length) return parks;

  const tourIds = [...new Set(links.map((link) => link.tour_id as string))];
  const { data: translations } = await supabase
    .from('tour_translations')
    .select('tour_id, tour:tours!inner(id, status, price_from)')
    .eq('locale', locale)
    .not('published_at', 'is', null)
    .eq('tour.status', 'published')
    .in('tour_id', tourIds);

  const publishedTourIds = new Set<string>();
  const tourPriceById = new Map<string, number | null>();
  for (const row of translations ?? []) {
    const tour = row.tour as { price_from?: number | null };
    publishedTourIds.add(row.tour_id as string);
    tourPriceById.set(row.tour_id as string, tour?.price_from ?? null);
  }

  const statsByPark = new Map<string, { count: number; minPrice: number | null }>();
  for (const link of links) {
    const parkId = link.park_id as string;
    const tourId = link.tour_id as string;
    if (!publishedTourIds.has(tourId)) continue;

    const price = tourPriceById.get(tourId);
    const current = statsByPark.get(parkId) ?? { count: 0, minPrice: null };
    current.count += 1;
    if (typeof price === 'number' && Number.isFinite(price)) {
      current.minPrice = current.minPrice == null ? price : Math.min(current.minPrice, price);
    }
    statsByPark.set(parkId, current);
  }

  return parks.map((park) => {
    const stats = statsByPark.get(park.id);
    return {
      ...park,
      priceFrom: stats?.minPrice ?? null,
      tourCount: stats?.count ?? 0
    };
  });
}

export async function listPublishedParks(filters: ParkListFilters): Promise<ParkListItem[]> {
  const parks = await attachParkTourStats(filters.locale, await getPublishedParks(filters.locale));
  return parks.filter((park) =>
    matchesFilters(park, {
      activities: filters.activities,
      countries: filters.countries,
      regions: filters.regions,
      wildlife: filters.wildlife
    })
  );
}

export async function getParkFilterFacets(locale: string): Promise<ParkFilterFacets> {
  const parks = await getPublishedParks(locale);
  const activities = new Set<string>();
  const countries = new Set<string>();
  const regions = new Set<string>();
  const wildlife = new Set<string>();

  for (const park of parks) {
    if (park.country) countries.add(park.country);
    if (park.region) regions.add(park.region);
    park.activities.forEach((activity) => activities.add(activity));
    park.wildlife.forEach((animal) => wildlife.add(animal));
  }

  return {
    activities: [...activities].toSorted((a, b) => a.localeCompare(b)),
    countries: [...countries].toSorted((a, b) => a.localeCompare(b)),
    regions: [...regions].toSorted((a, b) => a.localeCompare(b)),
    wildlife: [...wildlife].toSorted((a, b) => a.localeCompare(b))
  };
}

/** A single published park by slug, with gallery + facts resolved. */
export async function getParkBySlug(locale: string, slug: string): Promise<ParkDetail | null> {
  const supabase = await genericClient();

  const { data: translation } = await supabase
    .from('national_park_translations')
    .select('*, park:national_parks!inner(*)')
    .eq('locale', locale)
    .eq('slug', slug)
    .not('published_at', 'is', null)
    .eq('park.status', 'published')
    .maybeSingle();

  if (!translation) return null;

  const park = translation.park as Record<string, unknown>;
  const destinationId = (park.destination_id as string | null) ?? null;
  const galleryIds = Array.isArray(park.gallery) ? (park.gallery as string[]) : [];
  let resolvedGalleryIds = galleryIds;

  if (!resolvedGalleryIds.length && destinationId) {
    const { data: destination } = await supabase
      .from('destinations')
      .select('gallery')
      .eq('id', destinationId)
      .eq('status', 'published')
      .maybeSingle();
    resolvedGalleryIds = Array.isArray(destination?.gallery)
      ? (destination.gallery as string[])
      : [];
  }

  const media = await resolveMedia(supabase, resolvedGalleryIds);
  const gallery = resolvedGalleryIds
    .map((id) => media.get(id))
    .filter((m): m is { url: string | null; alt: string | null } => Boolean(m));

  const ogId = translation.og_image_id as string | null;
  const og = ogId
    ? (media.get(ogId) ?? (await resolveMedia(supabase, [ogId])).get(ogId))
    : undefined;
  const description = (translation.description as { html?: string; text?: string } | null) ?? null;
  const bestTime = (park.best_time as { summary?: string } | null) ?? null;
  let parentDestination: ParkParentDestination | null = null;

  if (destinationId) {
    const { data: destinationTranslation } = await supabase
      .from('destination_translations')
      .select('name, slug, destination:destinations!inner(status)')
      .eq('destination_id', destinationId)
      .eq('locale', locale)
      .not('published_at', 'is', null)
      .eq('destination.status', 'published')
      .maybeSingle();

    if (destinationTranslation) {
      parentDestination = {
        href: localePath(locale, `/destinations/${destinationTranslation.slug as string}`),
        name: destinationTranslation.name as string,
        slug: destinationTranslation.slug as string
      };
    }
  }

  return {
    id: park.id as string,
    slug: translation.slug as string,
    name: translation.name as string,
    summary: (translation.summary as string | null) ?? null,
    descriptionHtml: description?.html ?? description?.text ?? null,
    country: (park.country as string | null) ?? null,
    region: (park.region as string | null) ?? null,
    parkSizeKm2: (park.park_size_km2 as number | null) ?? null,
    establishedYear: (park.established_year as number | null) ?? null,
    bestTimeSummary: bestTime?.summary ?? null,
    wildlife: parseStringArray(park.wildlife),
    activities: parseStringArray(park.activities),
    gallery,
    faqs: translation.faqs,
    seoTitle: (translation.seo_title as string | null) ?? null,
    seoDescription: (translation.seo_description as string | null) ?? null,
    ogImageUrl: og?.url ?? gallery[0]?.url ?? null,
    ogImageAlt: og?.alt ?? gallery[0]?.alt ?? null,
    parentDestination
  };
}

/** Published parks linked to a destination hub via destination_id. */
export async function getDestinationParks(
  locale: string,
  destinationId: string
): Promise<ParkListItem[]> {
  const supabase = await genericClient();
  const { data: parks } = await supabase
    .from('national_parks')
    .select(
      'id, country, region, gallery, destination_id, position, wildlife, activities, best_time, park_size_km2, established_year'
    )
    .eq('destination_id', destinationId)
    .eq('status', 'published')
    .order('position', { ascending: true });

  if (!parks?.length) return [];

  const ids = parks.map((park) => park.id as string);
  const destinationIds = parks
    .map((park) => (park.destination_id as string | null) ?? null)
    .filter((id): id is string => Boolean(id));
  const [translations, destinationMeta, coverByParkId] = await Promise.all([
    supabase
      .from('national_park_translations')
      .select('park_id, slug, name, summary')
      .eq('locale', locale)
      .not('published_at', 'is', null)
      .in('park_id', ids)
      .then(({ data }) => data ?? []),
    resolveDestinationMeta(supabase, destinationIds),
    resolveParkCoverImages(
      supabase,
      parks.map((park) => ({
        destination_id: (park.destination_id as string | null) ?? null,
        gallery: park.gallery,
        id: park.id as string
      }))
    )
  ]);

  const translationByPark = new Map(translations.map((row) => [row.park_id as string, row]));

  const items = parks.flatMap((park) => {
    const translation = translationByPark.get(park.id as string);
    if (!translation) return [];

    const destinationId = (park.destination_id as string | null) ?? null;
    const meta = destinationId ? destinationMeta.get(destinationId) : undefined;

    return [
      buildParkListItem(
        park as Record<string, unknown>,
        {
          name: translation.name as string,
          slug: translation.slug as string,
          summary: (translation.summary as string | null) ?? null
        },
        coverByParkId.get(park.id as string),
        meta
      )
    ];
  });

  return attachParkTourStats(locale, items);
}

/** Published safaris (tours) that visit a given park, as ready-to-render cards. */
export async function getParkTours(locale: string, parkId: string): Promise<TourCardItem[]> {
  const supabase = await genericClient();

  const { data: links } = await supabase
    .from('tour_national_parks')
    .select('tour_id, position')
    .eq('park_id', parkId)
    .order('position', { ascending: true });

  const tourIds = (links ?? []).map((l) => l.tour_id as string);
  if (!tourIds.length) return [];

  const { data: translations } = await supabase
    .from('tour_translations')
    .select(
      'slug, title, excerpt, og_image_id, tour:tours!inner(id, status, days, nights, price_from)'
    )
    .eq('locale', locale)
    .not('published_at', 'is', null)
    .eq('tour.status', 'published')
    .in('tour_id', tourIds);

  if (!translations?.length) return [];

  const ogIds = translations
    .map((t) => t.og_image_id as string | null)
    .filter((id): id is string => Boolean(id));
  const media = await resolveMedia(supabase, ogIds);

  return translations.map((t) => {
    const tour = t.tour as {
      days?: number | null;
      nights?: number | null;
      price_from?: number | null;
    };
    const ogId = t.og_image_id as string | null;
    const cover = ogId ? media.get(ogId) : undefined;
    return {
      href: `/${locale}/tours/${t.slug}`,
      title: t.title as string,
      excerpt: (t.excerpt as string | null) ?? null,
      days: tour?.days ?? null,
      nights: tour?.nights ?? null,
      priceFrom: tour?.price_from ?? null,
      imageUrl: cover?.url ?? null,
      imageAlt: cover?.alt ?? null
    } satisfies TourCardItem;
  });
}
