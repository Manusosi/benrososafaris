import { BENROSO_CONTACT_DEFAULTS } from '@/config/benroso';
import { listPublishedAccommodations } from '@/features/accommodations/public/service';
import type { PublicAccommodation } from '@/features/accommodations/public/types';
import { createClient } from '@/lib/supabase/server';
import type { SupabaseClient } from '@supabase/supabase-js';

import { normalizeDirectAnswers } from '@/lib/seo/direct-answers';
import { localePath } from './locale-path';
import { activeHeroSlides, normalizeHeroSlides } from './hero-slides';
import { normalizePageHero, type PageHeroKey } from './page-heroes';
import type { HomeReviewItem } from './home-reviews';
import type {
  HeroSlide,
  PageHero,
  PublicBlogPost,
  PublicDestination,
  PublicDestinationDetail,
  PublicDestinationMedia,
  PublicPackage,
  PublicPackageDetail,
  PublicSiteSettings,
  PublicTour,
  PublicTourCatalogFacets,
  PublicTourCatalogFilters,
  PublicTourDetail,
  PublicTourItineraryDay,
  PublicTourPricingCell,
  PublicTourPricingSeason,
  PublicTourPricingTier
} from './types';

function parseStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string' && item.length > 0);
}

async function createGenericClient(): Promise<SupabaseClient> {
  return (await createClient()) as unknown as SupabaseClient;
}

function parseRichTextHtml(value: unknown): string | null {
  const record = (value && typeof value === 'object' ? value : null) as {
    html?: unknown;
    text?: unknown;
  } | null;
  if (typeof record?.html === 'string' && record.html.trim()) return record.html;
  if (typeof record?.text === 'string' && record.text.trim()) return record.text;
  return null;
}

function parseItineraryDays(value: unknown): PublicTourItineraryDay[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item, index) => {
    if (!item || typeof item !== 'object') return [];
    const record = item as Record<string, unknown>;
    return [
      {
        day: typeof record.day === 'number' ? record.day : index + 1,
        title: typeof record.title === 'string' ? record.title : `Day ${index + 1}`,
        description: typeof record.description === 'string' ? record.description : ''
      }
    ];
  });
}

function toFiniteNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function normalizeFilterValue(value: string) {
  return value.trim().toLowerCase();
}

function formatTierLabel(tier: PublicTourPricingTier['tier']) {
  if (tier === 'budget') return 'Budget options';
  if (tier === 'mid_range') return 'Mid-range options';
  return 'Luxury options';
}

export function formatComfortTierLabel(tier: PublicTourPricingTier['tier'] | null | undefined) {
  if (!tier) return 'Custom Package';
  if (tier === 'budget') return 'Budget Package';
  if (tier === 'mid_range') return 'Mid-Range Package';
  return 'Luxury Package';
}

/** Batch-resolves media_assets rows for a set of ids (used for gallery covers). */
async function resolveMediaByIds(ids: string[]): Promise<Map<string, PublicDestinationMedia>> {
  const uniqueIds = [...new Set(ids.filter(Boolean))];
  if (!uniqueIds.length) return new Map();

  const supabase = await createClient();
  const { data } = await supabase.from('media_assets').select('id, url, alt').in('id', uniqueIds);

  return new Map(
    (data ?? []).map((asset) => [asset.id, { alt: asset.alt, id: asset.id, url: asset.url }])
  );
}

const DEFAULT_DESCRIPTION =
  'Benroso Safaris crafts premium Kenya and Tanzania safari holidays with local experts, tailored itineraries, and trusted on-the-ground support.';

function unwrapRelation<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function mediaUrl(asset: { url?: string | null } | { url?: string | null }[] | null | undefined) {
  return unwrapRelation(asset)?.url ?? null;
}

function mediaAlt(
  asset:
    | { alt?: string | null; url?: string | null }
    | { alt?: string | null; url?: string | null }[]
    | null
    | undefined,
  fallback: string
) {
  return unwrapRelation(asset)?.alt ?? fallback;
}

function readAnalytics(value: unknown): PublicSiteSettings['analytics'] {
  const record = (value && typeof value === 'object' ? value : {}) as Record<string, unknown>;
  const str = (key: string) =>
    typeof record[key] === 'string' && (record[key] as string).trim().length > 0
      ? (record[key] as string).trim()
      : null;
  return {
    gaMeasurementId: str('gaMeasurementId'),
    gtmId: str('gtmId'),
    metaPixelId: str('metaPixelId'),
    googleSiteVerification: str('googleSiteVerification'),
    bingSiteVerification: str('bingSiteVerification')
  };
}

export async function getPublicSiteSettings(): Promise<PublicSiteSettings> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('site_settings')
    .select('*')
    .eq('singleton_key', 'default')
    .maybeSingle();

  const social = (data?.social_links as Record<string, string> | null) ?? {};

  return {
    addressShort: data?.address_short ?? BENROSO_CONTACT_DEFAULTS.addressShort,
    analytics: readAnalytics(data?.analytics),
    companyName: data?.company_name ?? BENROSO_CONTACT_DEFAULTS.companyName,
    description: DEFAULT_DESCRIPTION,
    email: data?.email ?? BENROSO_CONTACT_DEFAULTS.email,
    faviconUrl: data?.favicon_url ?? null,
    logoUrl: data?.logo_url ?? null,
    ogImage: data?.og_default_image_url ?? null,
    phoneOffice: data?.phone_office ?? BENROSO_CONTACT_DEFAULTS.phoneOffice,
    phonePrimary: data?.phone_primary ?? BENROSO_CONTACT_DEFAULTS.phonePrimary,
    phoneSecondary: data?.phone_secondary ?? BENROSO_CONTACT_DEFAULTS.phoneSecondary,
    postalAddress: data?.postal_address ?? BENROSO_CONTACT_DEFAULTS.postalAddress,
    socialLinks: social,
    tagline: data?.tagline ?? null,
    themeColor: data?.theme_color ?? null,
    whatsappMessage:
      data?.whatsapp_message ?? 'Hello Benroso Safaris, I would like help planning a safari.'
  };
}

/**
 * Per-page hero configuration (Portal > Settings > Hero Sections). Returns null
 * when a page has no custom hero, so callers fall back to their default media.
 */
export async function getPageHero(key: PageHeroKey): Promise<PageHero | null> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('site_settings')
      .select('page_heroes')
      .eq('singleton_key', 'default')
      .maybeSingle();

    const map = (data as { page_heroes?: Record<string, unknown> } | null)?.page_heroes ?? {};
    return normalizePageHero(map[key]);
  } catch {
    return null;
  }
}

export async function getHeroSlides(): Promise<HeroSlide[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('site_settings')
      .select('hero_slides')
      .eq('singleton_key', 'default')
      .maybeSingle();

    const slides = normalizeHeroSlides((data as { hero_slides?: unknown } | null)?.hero_slides);
    return activeHeroSlides(slides);
  } catch {
    // Column may not exist yet (migration not applied). Hero falls back to defaults.
    return [];
  }
}

export async function getPublicDestinations(
  locale: string,
  limit = 12
): Promise<PublicDestination[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('destination_translations')
    .select(
      `
      slug,
      name,
      summary,
      destination:destinations!inner(id, country, region, status, gallery),
      og_image:media_assets!destination_translations_og_image_id_fkey(url, alt)
    `
    )
    .eq('locale', locale)
    .eq('destination.status', 'published')
    .not('published_at', 'is', null)
    .order('name')
    .limit(limit);

  const rows = data ?? [];
  const galleryIds = rows.flatMap((row) =>
    parseStringArray(unwrapRelation(row.destination)?.gallery)
  );
  const mediaById = await resolveMediaByIds(galleryIds);

  return rows.flatMap((row) => {
    const destination = unwrapRelation(row.destination);
    if (!destination) return [];

    // Cover preference: first gallery image, else the SEO/OG image.
    const coverId = parseStringArray(destination.gallery)[0];
    const cover = coverId ? mediaById.get(coverId) : null;

    return [
      {
        country: destination.country,
        href: localePath(locale, `/destinations/${row.slug}`),
        id: destination.id,
        imageAlt: cover?.alt ?? mediaAlt(row.og_image, row.name),
        imageUrl: cover?.url ?? mediaUrl(row.og_image),
        name: row.name,
        region: destination.region,
        slug: row.slug,
        summary: row.summary
      }
    ];
  });
}

/**
 * Published safari tours linked to a destination (via `tour_destinations`).
 * Returns [] when no tours are linked yet — the detail page shows an empty
 * state in that case.
 */
export async function getDestinationTours(
  locale: string,
  destinationId: string
): Promise<PublicTour[]> {
  const supabase = await createClient();

  const { data: links } = await supabase
    .from('tour_destinations')
    .select('tour_id, position')
    .eq('destination_id', destinationId)
    .order('position', { ascending: true });

  const tourIds = (links ?? []).map((link) => link.tour_id as string);
  if (!tourIds.length) return [];

  const { data } = await supabase
    .from('tour_translations')
    .select(
      `
      slug,
      title,
      excerpt,
      tour:tours!inner(id, status, days, nights, price_from),
      og_image:media_assets!tour_translations_og_image_id_fkey(url, alt)
    `
    )
    .eq('locale', locale)
    .in('tour_id', tourIds)
    .eq('tour.status', 'published')
    .not('published_at', 'is', null)
    .order('title');

  return (data ?? []).flatMap((row) => {
    const tour = unwrapRelation(row.tour);
    if (!tour) return [];
    return [
      {
        days: tour.days,
        excerpt: row.excerpt,
        href: localePath(locale, `/tours/${row.slug}`),
        id: tour.id,
        imageAlt: mediaAlt(row.og_image, row.title),
        imageUrl: mediaUrl(row.og_image),
        nights: tour.nights,
        priceFrom: tour.price_from,
        slug: row.slug,
        title: row.title
      }
    ];
  });
}

/** Full destination detail (all wizard fields) for the public detail page. */
export async function getPublicDestinationDetail(
  locale: string,
  slug: string
): Promise<PublicDestinationDetail | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('destination_translations')
    .select(
      `
      slug,
      name,
      summary,
      description,
      seo_title,
      seo_description,
      faqs,
      destination:destinations!inner(id, country, region, status, best_time, wildlife, gallery),
      og_image:media_assets!destination_translations_og_image_id_fkey(url, alt)
    `
    )
    .eq('locale', locale)
    .eq('slug', slug)
    .eq('destination.status', 'published')
    .not('published_at', 'is', null)
    .maybeSingle();

  if (!data) return null;

  const destination = unwrapRelation(data.destination);
  if (!destination) return null;

  const galleryIds = parseStringArray(destination.gallery);
  const mediaById = await resolveMediaByIds(galleryIds);
  const gallery = galleryIds.flatMap((id) => {
    const asset = mediaById.get(id);
    return asset?.url ? [asset] : [];
  });

  const description = (data.description as { html?: string; text?: string } | null) ?? null;
  const bestTime = (destination.best_time as { summary?: string } | null) ?? null;

  return {
    bestTime: bestTime?.summary || null,
    country: destination.country,
    descriptionHtml: description?.html ?? description?.text ?? null,
    faqs: normalizeDirectAnswers(data.faqs),
    gallery,
    id: destination.id,
    imageAlt: mediaAlt(data.og_image, data.name),
    imageUrl: mediaUrl(data.og_image),
    name: data.name,
    region: destination.region,
    seoDescription: data.seo_description,
    seoTitle: data.seo_title,
    slug: data.slug,
    summary: data.summary,
    wildlife: parseStringArray(destination.wildlife)
  };
}

type TourTranslationListRow = {
  slug: string;
  title: string;
  excerpt: string | null;
  overview?: unknown;
  faqs?: unknown;
  tour:
    | {
        id: string;
        status: string;
        days: number | null;
        nights: number | null;
        price_from: number | null;
        start_location?: string | null;
        end_location?: string | null;
        important_notice?: string | null;
        itinerary_days?: unknown;
        inclusions?: unknown;
        exclusions?: unknown;
        gallery?: unknown;
      }
    | Array<{
        id: string;
        status: string;
        days: number | null;
        nights: number | null;
        price_from: number | null;
        start_location?: string | null;
        end_location?: string | null;
        important_notice?: string | null;
        itinerary_days?: unknown;
        inclusions?: unknown;
        exclusions?: unknown;
        gallery?: unknown;
      }>
    | null;
  og_image?:
    | { alt?: string | null; url?: string | null }
    | Array<{ alt?: string | null; url?: string | null }>
    | null;
};

async function getTourRelationLabelMaps(locale: string, tourIds: string[]) {
  const uniqueIds = [...new Set(tourIds.filter(Boolean))];
  const empty = {
    destinations: new Map<string, string[]>(),
    experiences: new Map<string, string[]>()
  };
  if (!uniqueIds.length) return empty;

  const supabase = await createClient();
  const [destinationLinksResult, experienceLinksResult] = await Promise.all([
    supabase
      .from('tour_destinations')
      .select('tour_id, destination_id, position')
      .in('tour_id', uniqueIds)
      .order('position', { ascending: true }),
    supabase
      .from('tour_experiences')
      .select('tour_id, experience_id, position')
      .in('tour_id', uniqueIds)
      .order('position', { ascending: true })
  ]);

  const destinationLinks = destinationLinksResult.data ?? [];
  const experienceLinks = experienceLinksResult.data ?? [];
  const destinationIds = [
    ...new Set(destinationLinks.map((link) => link.destination_id as string).filter(Boolean))
  ];
  const experienceIds = [
    ...new Set(experienceLinks.map((link) => link.experience_id as string).filter(Boolean))
  ];

  const [destinationNamesResult, experienceNamesResult] = await Promise.all([
    destinationIds.length
      ? supabase
          .from('destination_translations')
          .select('destination_id, name')
          .eq('locale', locale)
          .in('destination_id', destinationIds)
      : Promise.resolve({ data: [] }),
    experienceIds.length
      ? supabase
          .from('experience_translations')
          .select('experience_id, title')
          .eq('locale', locale)
          .in('experience_id', experienceIds)
      : Promise.resolve({ data: [] })
  ]);

  const destinationNameById = new Map(
    (destinationNamesResult.data ?? []).map((row) => [
      row.destination_id as string,
      row.name as string
    ])
  );
  const experienceNameById = new Map(
    (experienceNamesResult.data ?? []).map((row) => [
      row.experience_id as string,
      row.title as string
    ])
  );

  const destinations = new Map<string, string[]>();
  for (const link of destinationLinks) {
    const tourId = link.tour_id as string;
    const label = destinationNameById.get(link.destination_id as string);
    if (!label) continue;
    destinations.set(tourId, [...(destinations.get(tourId) ?? []), label]);
  }

  const experiences = new Map<string, string[]>();
  for (const link of experienceLinks) {
    const tourId = link.tour_id as string;
    const label = experienceNameById.get(link.experience_id as string);
    if (!label) continue;
    experiences.set(tourId, [...(experiences.get(tourId) ?? []), label]);
  }

  return { destinations, experiences };
}

async function getTourPricingMap(tourIds: string[]) {
  const uniqueIds = [...new Set(tourIds.filter(Boolean))];
  const pricingByTourId = new Map<string, PublicTourPricingTier[]>();
  if (!uniqueIds.length) return pricingByTourId;

  const supabase = await createClient();
  const { data: tierRows } = await supabase
    .from('tour_pricing_tiers')
    .select('id, tour_id, tier, label, blurb, notes, currency, position')
    .in('tour_id', uniqueIds)
    .order('position', { ascending: true });

  const tiers = (tierRows ?? []) as Array<{
    id: string;
    tour_id: string;
    tier: PublicTourPricingTier['tier'];
    label: string | null;
    blurb: string | null;
    notes: string | null;
    currency: string | null;
    position: number | null;
  }>;
  const tierIds = tiers.map((tier) => tier.id);
  if (!tierIds.length) return pricingByTourId;

  const { data: seasonRows } = await supabase
    .from('tour_pricing_seasons')
    .select('id, tier_id, label, date_start, date_end, position')
    .in('tier_id', tierIds)
    .order('position', { ascending: true });

  const seasons = (seasonRows ?? []) as Array<{
    id: string;
    tier_id: string;
    label: string;
    date_start: string | null;
    date_end: string | null;
    position: number | null;
  }>;
  const seasonIds = seasons.map((season) => season.id);

  const { data: cellRows } = seasonIds.length
    ? await supabase
        .from('tour_pricing_cells')
        .select('season_id, group_band, band_position, price')
        .in('season_id', seasonIds)
        .order('band_position', { ascending: true })
    : { data: [] };

  const cellsBySeasonId = new Map<string, PublicTourPricingCell[]>();
  for (const cell of cellRows ?? []) {
    const seasonId = cell.season_id as string;
    const price = toFiniteNumber(cell.price);
    if (price == null) continue;
    cellsBySeasonId.set(seasonId, [
      ...(cellsBySeasonId.get(seasonId) ?? []),
      { groupBand: cell.group_band as string, price }
    ]);
  }

  const seasonsByTierId = new Map<string, PublicTourPricingSeason[]>();
  for (const season of seasons) {
    seasonsByTierId.set(season.tier_id, [
      ...(seasonsByTierId.get(season.tier_id) ?? []),
      {
        id: season.id,
        label: season.label,
        dateStart: season.date_start,
        dateEnd: season.date_end,
        cells: cellsBySeasonId.get(season.id) ?? []
      }
    ]);
  }

  for (const tier of tiers) {
    pricingByTourId.set(tier.tour_id, [
      ...(pricingByTourId.get(tier.tour_id) ?? []),
      {
        id: tier.id,
        tier: tier.tier,
        label: tier.label || formatTierLabel(tier.tier),
        blurb: tier.blurb,
        notes: tier.notes,
        currency: tier.currency || 'USD',
        seasons: seasonsByTierId.get(tier.id) ?? []
      }
    ]);
  }

  return pricingByTourId;
}

function pricingBounds(
  tiers: PublicTourPricingTier[] | undefined,
  fallbackPrice: number | null
): { min: number | null; max: number | null } {
  const prices =
    tiers?.flatMap((tier) =>
      tier.seasons.flatMap((season) => season.cells.map((cell) => cell.price))
    ) ?? [];

  if (!prices.length) return { min: fallbackPrice, max: fallbackPrice };
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

function mapTourListRows(
  locale: string,
  rows: TourTranslationListRow[],
  pricingByTourId: Map<string, PublicTourPricingTier[]>,
  relationLabels: Awaited<ReturnType<typeof getTourRelationLabelMaps>>,
  mediaById?: Map<string, PublicDestinationMedia>
): PublicTour[] {
  return rows.flatMap((row) => {
    const tour = unwrapRelation(row.tour);
    if (!tour) return [];

    const galleryIds = parseStringArray(tour.gallery);
    const cover = galleryIds[0] ? mediaById?.get(galleryIds[0]) : null;
    const pricingTiers = pricingByTourId.get(tour.id) ?? [];
    const bounds = pricingBounds(pricingTiers, tour.price_from);

    return [
      {
        days: tour.days,
        destinationLabels: relationLabels.destinations.get(tour.id) ?? [],
        excerpt: row.excerpt,
        experienceLabels: relationLabels.experiences.get(tour.id) ?? [],
        href: localePath(locale, `/tours/${row.slug}`),
        id: tour.id,
        imageAlt: cover?.alt ?? mediaAlt(row.og_image, row.title),
        imageUrl: cover?.url ?? mediaUrl(row.og_image),
        maxPrice: bounds.max,
        minPrice: bounds.min,
        nights: tour.nights,
        priceFrom: bounds.min ?? tour.price_from,
        pricingTiers,
        slug: row.slug,
        title: row.title
      }
    ];
  });
}

function tourMatchesFilters(tour: PublicTour, filters: PublicTourCatalogFilters) {
  const destinationFilters = filters.destination?.map(normalizeFilterValue) ?? [];
  const experienceFilters = filters.experience?.map(normalizeFilterValue) ?? [];
  const tierFilters = filters.pricingTier ?? [];

  if (
    destinationFilters.length &&
    !tour.destinationLabels?.some((label) =>
      destinationFilters.includes(normalizeFilterValue(label))
    )
  ) {
    return false;
  }

  if (
    experienceFilters.length &&
    !tour.experienceLabels?.some((label) => experienceFilters.includes(normalizeFilterValue(label)))
  ) {
    return false;
  }

  if (tierFilters.length && !tour.pricingTiers?.some((tier) => tierFilters.includes(tier.tier))) {
    return false;
  }

  if (filters.durationMin != null && (tour.days ?? 0) < filters.durationMin) return false;
  if (filters.durationMax != null && (tour.days ?? Number.MAX_SAFE_INTEGER) > filters.durationMax) {
    return false;
  }

  if (filters.priceMin != null && (tour.maxPrice ?? tour.priceFrom ?? 0) < filters.priceMin) {
    return false;
  }
  if (
    filters.priceMax != null &&
    (tour.minPrice ?? tour.priceFrom ?? Number.MAX_SAFE_INTEGER) > filters.priceMax
  ) {
    return false;
  }

  return true;
}

function buildTourCatalogFacets(tours: PublicTour[]): PublicTourCatalogFacets {
  const destinationLabels = new Set<string>();
  const experienceLabels = new Set<string>();
  const pricingTiers = new Set<PublicTourPricingTier['tier']>();
  const days: number[] = [];
  const prices: number[] = [];

  for (const tour of tours) {
    tour.destinationLabels?.forEach((label) => destinationLabels.add(label));
    tour.experienceLabels?.forEach((label) => experienceLabels.add(label));
    tour.pricingTiers?.forEach((tier) => pricingTiers.add(tier.tier));
    if (tour.days != null) days.push(tour.days);
    if (tour.minPrice != null) prices.push(tour.minPrice);
    if (tour.maxPrice != null) prices.push(tour.maxPrice);
  }

  const minDuration = days.length ? Math.min(...days) : 1;
  const maxDuration = days.length ? Math.max(...days) : 14;
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 10000;

  return {
    destinationLabels: [...destinationLabels].toSorted((a, b) => a.localeCompare(b)),
    durationBounds: { min: minDuration, max: maxDuration },
    experienceLabels: [...experienceLabels].toSorted((a, b) => a.localeCompare(b)),
    priceBounds: {
      min: Math.floor(minPrice / 50) * 50,
      max: Math.ceil(maxPrice / 50) * 50 || 10000
    },
    pricingTiers: [...pricingTiers]
  };
}

async function fetchPublishedTourRows(
  locale: string,
  tourIds?: string[]
): Promise<TourTranslationListRow[]> {
  const supabase = await createGenericClient();
  let query = supabase
    .from('tour_translations')
    .select(
      `
      slug,
      title,
      overview,
      excerpt,
      faqs,
      tour:tours!inner(
        id,
        status,
        days,
        nights,
        price_from,
        start_location,
        end_location,
        important_notice,
        itinerary_days,
        inclusions,
        exclusions,
        gallery
      ),
      og_image:media_assets!tour_translations_og_image_id_fkey(url, alt)
    `
    )
    .eq('locale', locale)
    .eq('tour.status', 'published')
    .not('published_at', 'is', null)
    .order('title');

  if (tourIds?.length) {
    query = query.in('tour_id', tourIds);
  }

  const { data } = await query;
  return (data ?? []) as TourTranslationListRow[];
}

async function buildToursFromRows(locale: string, rows: TourTranslationListRow[]) {
  const tourIds = rows.flatMap((row) => {
    const tour = unwrapRelation(row.tour);
    return tour?.id ? [tour.id] : [];
  });
  const galleryIds = rows.flatMap((row) => parseStringArray(unwrapRelation(row.tour)?.gallery));
  const [pricingByTourId, relationLabels, mediaById] = await Promise.all([
    getTourPricingMap(tourIds),
    getTourRelationLabelMaps(locale, tourIds),
    resolveMediaByIds(galleryIds)
  ]);

  return mapTourListRows(locale, rows, pricingByTourId, relationLabels, mediaById);
}

export async function getPublicTourCatalog(
  locale: string,
  filters: PublicTourCatalogFilters = {}
): Promise<{ facets: PublicTourCatalogFacets; tours: PublicTour[] }> {
  const rows = await fetchPublishedTourRows(locale);
  const allTours = await buildToursFromRows(locale, rows);
  const facets = buildTourCatalogFacets(allTours);

  const tours = allTours
    .filter((tour) => tourMatchesFilters(tour, filters))
    .toSorted((a, b) => {
      if (filters.sort === 'price') {
        return (a.priceFrom ?? Number.MAX_SAFE_INTEGER) - (b.priceFrom ?? Number.MAX_SAFE_INTEGER);
      }
      return a.title.localeCompare(b.title);
    });

  return { facets, tours };
}

export async function getPublicTours(locale: string, limit = 6): Promise<PublicTour[]> {
  const rows = (await fetchPublishedTourRows(locale)).slice(0, limit);
  return buildToursFromRows(locale, rows);
}

export async function getPublicToursByIds(
  locale: string,
  tourIds: string[]
): Promise<PublicTour[]> {
  if (!tourIds.length) return [];
  return buildToursFromRows(locale, await fetchPublishedTourRows(locale, tourIds));
}

async function getRouteAccommodations(
  locale: string,
  tourId: string
): Promise<PublicAccommodation[]> {
  const supabase = await createClient();
  const { data: links } = await supabase
    .from('tour_accommodations')
    .select('accommodation_id, position')
    .eq('tour_id', tourId)
    .order('position', { ascending: true });

  const ids = (links ?? []).map((link) => link.accommodation_id as string).filter(Boolean);
  if (!ids.length) return [];

  const order = new Map(ids.map((id, index) => [id, index]));
  const all = await listPublishedAccommodations({ locale });
  return all
    .filter((accommodation) => ids.includes(accommodation.id))
    .toSorted((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
}

export async function getDestinationAccommodations(
  locale: string,
  destinationId: string
): Promise<PublicAccommodation[]> {
  const supabase = await createClient();
  const { data: tourLinks } = await supabase
    .from('tour_destinations')
    .select('tour_id, position')
    .eq('destination_id', destinationId)
    .order('position', { ascending: true });

  const tourIds = [...new Set((tourLinks ?? []).map((link) => link.tour_id as string))];
  if (!tourIds.length) return [];

  const { data: accommodationLinks } = await supabase
    .from('tour_accommodations')
    .select('accommodation_id, position')
    .in('tour_id', tourIds)
    .order('position', { ascending: true });

  const ids = [
    ...new Set(
      (accommodationLinks ?? []).map((link) => link.accommodation_id as string).filter(Boolean)
    )
  ];
  if (!ids.length) return [];

  const order = new Map(ids.map((id, index) => [id, index]));
  const all = await listPublishedAccommodations({ locale });
  return all
    .filter((accommodation) => ids.includes(accommodation.id))
    .toSorted((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
}

export async function getPublicTourDetail(
  locale: string,
  slug: string
): Promise<PublicTourDetail | null> {
  const supabase = await createGenericClient();
  const { data } = await supabase
    .from('tour_translations')
    .select(
      `
      slug,
      title,
      excerpt,
      overview,
      faqs,
      tour:tours!inner(
        id,
        status,
        days,
        nights,
        price_from,
        start_location,
        end_location,
        important_notice,
        itinerary_days,
        inclusions,
        exclusions,
        gallery
      ),
      og_image:media_assets!tour_translations_og_image_id_fkey(url, alt)
    `
    )
    .eq('locale', locale)
    .eq('slug', slug)
    .eq('tour.status', 'published')
    .not('published_at', 'is', null)
    .maybeSingle<TourTranslationListRow>();

  if (!data) return null;

  const [summary] = await buildToursFromRows(locale, [data]);
  const tour = unwrapRelation(data.tour);
  if (!summary || !tour) return null;

  const galleryIds = parseStringArray(tour.gallery);
  const mediaById = await resolveMediaByIds(galleryIds);
  const gallery = galleryIds.flatMap((id) => {
    const asset = mediaById.get(id);
    return asset?.url ? [asset] : [];
  });

  return {
    ...summary,
    accommodations: await getRouteAccommodations(locale, summary.id),
    descriptionHtml: parseRichTextHtml(data.overview),
    endLocation: tour.end_location ?? null,
    exclusions: parseStringArray(tour.exclusions),
    gallery,
    importantNotice: tour.important_notice ?? null,
    inclusions: parseStringArray(tour.inclusions),
    itineraryDays: parseItineraryDays(tour.itinerary_days),
    startLocation: tour.start_location ?? null
  };
}

type PackageTranslationRow = {
  slug: string;
  title: string;
  excerpt: string | null;
  content?: unknown;
  package:
    | {
        id: string;
        status: string;
        package_group: string | null;
        comfort_tier: PublicTourPricingTier['tier'] | null;
        tour_id: string | null;
      }
    | Array<{
        id: string;
        status: string;
        package_group: string | null;
        comfort_tier: PublicTourPricingTier['tier'] | null;
        tour_id: string | null;
      }>
    | null;
  og_image?:
    | { alt?: string | null; url?: string | null }
    | Array<{ alt?: string | null; url?: string | null }>
    | null;
};

async function fetchPublishedPackageRows(
  locale: string,
  slug?: string
): Promise<PackageTranslationRow[]> {
  const supabase = await createClient();
  let query = supabase
    .from('package_translations')
    .select(
      `
      slug,
      title,
      excerpt,
      content,
      package:packages!inner(id, status, package_group, comfort_tier, tour_id),
      og_image:media_assets!package_translations_og_image_id_fkey(url, alt)
    `
    )
    .eq('locale', locale)
    .eq('package.status', 'published')
    .not('published_at', 'is', null)
    .order('title');

  if (slug) query = query.eq('slug', slug);

  const { data } = await query;
  return (data ?? []) as PackageTranslationRow[];
}

function mapPackageRows(
  locale: string,
  rows: PackageTranslationRow[],
  toursById: Map<string, PublicTour>
): PublicPackage[] {
  return rows.flatMap((row) => {
    const base = unwrapRelation(row.package);
    if (!base) return [];
    const tour = base.tour_id ? (toursById.get(base.tour_id) ?? null) : null;
    const tierPrice =
      base.comfort_tier && tour?.pricingTiers
        ? pricingBounds(
            tour.pricingTiers.filter((tier) => tier.tier === base.comfort_tier),
            tour.priceFrom
          ).min
        : null;

    return [
      {
        comfortTier: base.comfort_tier,
        excerpt: row.excerpt ?? tour?.excerpt ?? null,
        group: base.package_group,
        href: localePath(locale, `/safari-packages/${row.slug}`),
        id: base.id,
        imageAlt: mediaAlt(row.og_image, row.title) ?? tour?.imageAlt ?? row.title,
        imageUrl: mediaUrl(row.og_image) ?? tour?.imageUrl ?? null,
        priceFrom: tierPrice ?? tour?.priceFrom ?? null,
        slug: row.slug,
        title: row.title,
        tour
      }
    ];
  });
}

export async function getPublicPackages(locale: string, limit = 24): Promise<PublicPackage[]> {
  const rows = (await fetchPublishedPackageRows(locale)).slice(0, limit);
  const tourIds = [
    ...new Set(
      rows
        .map((row) => unwrapRelation(row.package)?.tour_id)
        .filter((id): id is string => typeof id === 'string')
    )
  ];
  const tours = await getPublicToursByIds(locale, tourIds);
  const toursById = new Map(tours.map((tour) => [tour.id, tour]));
  return mapPackageRows(locale, rows, toursById);
}

export async function getPublicPackageDetail(
  locale: string,
  slug: string
): Promise<PublicPackageDetail | null> {
  const [row] = await fetchPublishedPackageRows(locale, slug);
  if (!row) return null;

  const base = unwrapRelation(row.package);
  const linkedTour = base?.tour_id
    ? await getPublicTourDetail(
        locale,
        (await getPublicToursByIds(locale, [base.tour_id]))[0]?.slug ?? ''
      )
    : null;
  const toursById = new Map(linkedTour ? [[linkedTour.id, linkedTour as PublicTour]] : []);
  const [summary] = mapPackageRows(locale, [row], toursById);
  if (!summary) return null;

  const pricingTier =
    linkedTour?.pricingTiers?.find((tier) => tier.tier === summary.comfortTier) ?? null;

  return {
    ...summary,
    contentHtml: parseRichTextHtml(row.content),
    linkedTour,
    pricingTier
  };
}

export async function getPublicBlogPosts(locale: string, limit = 3): Promise<PublicBlogPost[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('blog_translations')
    .select(
      `
      slug,
      title,
      excerpt,
      published_at,
      post:blog_posts!inner(
        id,
        status,
        deleted_at,
        primary_category:blog_categories!blog_posts_primary_category_id_fkey(name)
      ),
      og_image:media_assets!blog_translations_og_image_id_fkey(url, alt)
    `
    )
    .eq('locale', locale)
    .eq('post.status', 'published')
    .is('post.deleted_at', null)
    .not('published_at', 'is', null)
    .order('published_at', { ascending: false })
    .limit(limit);

  return (data ?? []).flatMap((row) => {
    const post = unwrapRelation(row.post);
    if (!post) return [];

    return [
      {
        category: unwrapRelation(post.primary_category)?.name ?? null,
        excerpt: row.excerpt,
        href: localePath(locale, `/blog/${row.slug}`),
        id: post.id,
        imageAlt: mediaAlt(row.og_image, row.title),
        imageUrl: mediaUrl(row.og_image),
        publishedAt: row.published_at,
        slug: row.slug,
        title: row.title
      }
    ];
  });
}

export async function getHomeReviews(limit = 8): Promise<HomeReviewItem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('reviews')
    .select('id, author_name, author_location, rating, source, body, review_date, avatar_url')
    .eq('status', 'published')
    .eq('featured', true)
    .order('position', { ascending: true })
    .order('review_date', { ascending: false, nullsFirst: false })
    .limit(limit);

  return (data ?? []).map((row) => ({
    id: row.id,
    authorName: row.author_name,
    authorLocation: row.author_location,
    rating: row.rating,
    source: row.source === 'google' ? 'google' : 'tripadvisor',
    body: row.body,
    reviewDate: row.review_date,
    avatarUrl: row.avatar_url
  }));
}
