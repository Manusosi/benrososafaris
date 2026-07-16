import { unstable_cache } from 'next/cache';

import { localePath } from '@/lib/public/locale-path';
import { getPublicToursByIds } from '@/lib/public/site-data';
import { createEnquiryPublicClient } from '@/lib/supabase/service-role';

import { BENROSO_OPERATING_COUNTRIES, type BenrosoCountryId } from './country-map-copy';
import { isMountainExperienceLayout, normalizeExperienceLayoutVariant } from './layout-variant';
import type {
  PublicExperience,
  PublicExperienceDetail,
  PublicExperienceFaq,
  PublicExperienceMenuItem,
  PublicExperienceMedia,
  PublicExperiencePackageLevel,
  PublicExperienceRelatedAccommodation,
  PublicExperienceRelatedTour,
  PublicMountainRoute,
  PublicMountainRouteDay,
  PublicMountainRoutePricingRow
} from './types';

type ExperienceTranslationRow = {
  content: { html?: string; text?: string } | null;
  experience:
    | {
        category: string | null;
        countries: string[] | null;
        deleted_at: string | null;
        gallery: string[] | null;
        highlights: string[] | null;
        id: string;
        menu_group: string | null;
        layout_variant?: string | null;
        package_pricing?: unknown;
        status: string;
      }
    | Array<{
        category: string | null;
        countries: string[] | null;
        deleted_at: string | null;
        gallery: string[] | null;
        highlights: string[] | null;
        id: string;
        menu_group: string | null;
        layout_variant?: string | null;
        package_pricing?: unknown;
        status: string;
      }>
    | null;
  faqs: unknown;
  og_image?:
    | { alt?: string | null; url?: string | null }
    | Array<{
        alt?: string | null;
        url?: string | null;
      }>
    | null;
  seo_description: string | null;
  seo_title: string | null;
  slug: string;
  summary: string | null;
  title: string;
};

type TourTranslationRow = {
  excerpt: string | null;
  slug: string;
  title: string;
  tour:
    | {
        days: number | null;
        id: string;
        nights: number | null;
        price_from: number | null;
        status: string;
      }
    | Array<{
        days: number | null;
        id: string;
        nights: number | null;
        price_from: number | null;
        status: string;
      }>
    | null;
  tour_id: string;
  og_image?:
    | { alt?: string | null; url?: string | null }
    | Array<{ alt?: string | null; url?: string | null }>
    | null;
};

type AccommodationTranslationRow = {
  accommodation:
    | {
        country: string | null;
        id: string;
        region: string | null;
        status: string;
      }
    | Array<{
        country: string | null;
        id: string;
        region: string | null;
        status: string;
      }>
    | null;
  accommodation_id: string;
  name: string;
  og_image?:
    | { alt?: string | null; url?: string | null }
    | Array<{ alt?: string | null; url?: string | null }>
    | null;
  slug: string;
  summary: string | null;
};

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

function parseCountries(value: unknown): BenrosoCountryId[] {
  if (!Array.isArray(value)) return [];

  const allowed = new Set(BENROSO_OPERATING_COUNTRIES.map((country) => country.id));

  return value.filter(
    (item): item is BenrosoCountryId =>
      typeof item === 'string' && allowed.has(item as BenrosoCountryId)
  );
}

function parseStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string' && item.length > 0);
}

function parsePackagePricing(value: unknown): PublicExperiencePackageLevel[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (typeof item !== 'object' || item === null) return [];
    const record = item as Record<string, unknown>;
    const key = typeof record.key === 'string' ? record.key : 'custom';
    if (!['economy', 'budget', 'mid_range', 'luxury', 'high_end', 'custom'].includes(key)) {
      return [];
    }

    const currency =
      typeof record.currency === 'string' && record.currency ? record.currency : 'USD';
    const seasons = Array.isArray(record.seasons)
      ? record.seasons.flatMap((season) => {
          if (typeof season !== 'object' || season === null) return [];
          const seasonRecord = season as Record<string, unknown>;
          const label = typeof seasonRecord.label === 'string' ? seasonRecord.label.trim() : '';
          const cells = Array.isArray(seasonRecord.cells)
            ? seasonRecord.cells.flatMap((cell) => {
                if (typeof cell !== 'object' || cell === null) return [];
                const cellRecord = cell as Record<string, unknown>;
                const groupBand =
                  typeof cellRecord.groupBand === 'string' ? cellRecord.groupBand.trim() : '';
                const price = toFiniteNumber(cellRecord.price);
                return groupBand && price != null ? [{ groupBand, price }] : [];
              })
            : [];
          return label ? [{ cells, label }] : [];
        })
      : [];

    const prices = seasons.flatMap((season) => season.cells.map((cell) => cell.price));
    return [
      {
        blurb:
          typeof record.blurb === 'string' && record.blurb.trim()
            ? record.blurb.trim()
            : packageLevelBlurb(key as PublicExperiencePackageLevel['key']),
        currency,
        key: key as PublicExperiencePackageLevel['key'],
        label:
          typeof record.label === 'string' && record.label.trim()
            ? record.label.trim()
            : packageLevelLabel(key as PublicExperiencePackageLevel['key']),
        priceFrom: prices.length ? Math.min(...prices) : null,
        seasons,
        tripCount: 0
      }
    ];
  });
}

function toFiniteNumber(value: unknown): number | null {
  const number = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(number) ? number : null;
}

function packageLevelLabel(tier: PublicExperiencePackageLevel['key']) {
  if (tier === 'economy') return 'Economy Safari Package';
  if (tier === 'budget') return 'Budget Safari Package';
  if (tier === 'mid_range') return 'Mid-Range Safari Package';
  if (tier === 'luxury') return 'Luxury Safari Package';
  if (tier === 'high_end') return 'High-End Safari Package';
  return 'Custom Safari Package';
}

function packageLevelBlurb(tier: PublicExperiencePackageLevel['key']) {
  if (tier === 'economy') {
    return 'A practical package option focused on essential inclusions, simple routing, and good value.';
  }
  if (tier === 'budget') {
    return 'Good-value safari planning with reliable stays, guided game drives, and the same core wildlife route.';
  }
  if (tier === 'mid_range') {
    return 'A balanced safari package with comfortable lodges or camps, strong locations, and thoughtful pacing.';
  }
  if (tier === 'luxury') {
    return 'A polished safari package with premium camps, elevated service, and more exclusive locations where available.';
  }
  if (tier === 'high_end') {
    return 'A top-tier package for the most exclusive stays, private pacing, and elevated arrangements.';
  }
  return 'A custom package table for this experience.';
}

function parseFaqs(value: unknown): PublicExperienceFaq[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (typeof item !== 'object' || item === null) return [];

    const record = item as Record<string, unknown>;
    const question = typeof record.question === 'string' ? record.question.trim() : '';
    const answer = typeof record.answer === 'string' ? record.answer.trim() : '';

    return question && answer ? [{ answer, question }] : [];
  });
}

function parseContentHtml(content: ExperienceTranslationRow['content']): string | null {
  if (!content) return null;
  const html = content.html ?? content.text ?? null;
  return html?.trim() ? html : null;
}

function hasTranslationContent(content: ExperienceTranslationRow['content']): boolean {
  return Boolean(parseContentHtml(content));
}

async function resolveMediaByIds(ids: string[]): Promise<Map<string, PublicExperienceMedia>> {
  const uniqueIds = [...new Set(ids.filter(Boolean))];
  if (!uniqueIds.length) return new Map();

  const supabase = createEnquiryPublicClient();
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
  mediaById: Map<string, PublicExperienceMedia>,
  fallbackTitle: string
): { imageAlt: string | null; imageUrl: string | null } {
  const coverId = galleryIds[0];
  if (!coverId) return { imageAlt: null, imageUrl: null };

  const cover = mediaById.get(coverId);
  return {
    imageAlt: cover?.alt ?? fallbackTitle,
    imageUrl: cover?.url ?? null
  };
}

function mapExperienceRow(
  row: ExperienceTranslationRow,
  locale: string,
  mediaById: Map<string, PublicExperienceMedia>
): PublicExperience | null {
  const experience = unwrapRelation(row.experience);
  if (!experience || experience.status !== 'published' || experience.deleted_at) return null;
  if (!hasTranslationContent(row.content)) return null;

  const galleryIds = parseStringArray(experience.gallery);
  const cover = coverFromGallery(galleryIds, mediaById, row.title);

  return {
    category: experience.category,
    countries: parseCountries(experience.countries),
    href: localePath(locale, `/experiences/${row.slug}`),
    id: experience.id,
    imageAlt: cover.imageAlt,
    imageUrl: cover.imageUrl,
    menuGroup: normalizeMenuGroup(experience.menu_group),
    slug: row.slug,
    summary: row.summary,
    title: row.title
  };
}

function normalizeMenuGroup(
  value: string | null | undefined
): PublicExperienceMenuItem['menuGroup'] {
  return value === 'wildlife_safari' ? 'wildlife_safari' : 'top_experiences';
}

async function fetchPublishedTranslationRows(
  locale: string,
  filters?: {
    countries?: BenrosoCountryId[];
    menuGroups?: PublicExperienceMenuItem['menuGroup'][];
  }
) {
  const supabase = createEnquiryPublicClient();

  let query = supabase
    .from('experience_translations')
    .select(
      `
      slug,
      title,
      summary,
      content,
      faqs,
      seo_title,
      seo_description,
      experience:experiences!inner(id, category, countries, menu_group, layout_variant, status, gallery, highlights, package_pricing, deleted_at),
      og_image:media_assets!experience_translations_og_image_id_fkey(url, alt)
    `
    )
    .eq('locale', locale)
    .eq('experience.status', 'published')
    .is('experience.deleted_at', null)
    .not('published_at', 'is', null)
    .not('content', 'is', null)
    .order('title');

  const { data } = await query;
  let rows = (data ?? []) as ExperienceTranslationRow[];

  if (filters?.countries?.length) {
    rows = rows.filter((row) => {
      const experience = unwrapRelation(row.experience);
      const countries = parseCountries(experience?.countries);
      return filters.countries!.some((country) => countries.includes(country));
    });
  }

  if (filters?.menuGroups?.length) {
    rows = rows.filter((row) => {
      const experience = unwrapRelation(row.experience);
      const menuGroup = normalizeMenuGroup(experience?.menu_group);
      return filters.menuGroups!.includes(menuGroup);
    });
  }

  return rows;
}

async function fetchPublishedExperiences({
  countries,
  locale,
  menuGroups
}: {
  countries?: BenrosoCountryId[];
  locale: string;
  menuGroups?: PublicExperienceMenuItem['menuGroup'][];
}): Promise<PublicExperience[]> {
  const rows = await fetchPublishedTranslationRows(locale, { countries, menuGroups });
  const galleryIds = rows.flatMap((row) => {
    const experience = unwrapRelation(row.experience);
    return parseStringArray(experience?.gallery);
  });
  const mediaById = await resolveMediaByIds(galleryIds);

  return rows.flatMap((row) => {
    const mapped = mapExperienceRow(row, locale, mediaById);
    return mapped ? [mapped] : [];
  });
}

export async function listPublishedExperiences({
  countries,
  locale,
  menuGroups
}: {
  countries?: BenrosoCountryId[];
  locale: string;
  menuGroups?: PublicExperienceMenuItem['menuGroup'][];
}): Promise<PublicExperience[]> {
  const countriesKey = (countries ?? []).toSorted().join(',') || 'all';
  const menuGroupsKey = (menuGroups ?? []).toSorted().join(',') || 'all';

  return unstable_cache(
    () => fetchPublishedExperiences({ countries, locale, menuGroups }),
    ['public-experiences', locale, countriesKey, menuGroupsKey],
    { revalidate: 300, tags: ['public-experiences'] }
  )();
}

async function fetchExperienceMenuItems(locale: string): Promise<PublicExperienceMenuItem[]> {
  const supabase = createEnquiryPublicClient();

  const { data } = await supabase
    .from('experience_menu_items')
    .select(
      `
      experience_id,
      label,
      slug,
      menu_group,
      menu_position
    `
    )
    .eq('locale', locale)
    .order('menu_group')
    .order('menu_position')
    .order('label');

  const seen = new Set<string>();
  return (
    (data ?? []) as Array<{
      experience_id: string;
      label: string;
      menu_group: string | null;
      menu_position: number | null;
      slug: string;
    }>
  )
    .flatMap((row) => {
      const label = row.label.trim();
      const slug = row.slug?.trim();
      if (!label || !slug) return [];
      const key = label.toLowerCase();
      if (seen.has(key)) return [];
      seen.add(key);

      return [
        {
          href: localePath(locale, `/experiences/${slug}`),
          id: row.experience_id,
          label,
          menuGroup: normalizeMenuGroup(row.menu_group),
          menuPosition: typeof row.menu_position === 'number' ? row.menu_position : 100
        } satisfies PublicExperienceMenuItem
      ];
    })
    .toSorted(
      (a, b) =>
        a.menuGroup.localeCompare(b.menuGroup) ||
        a.menuPosition - b.menuPosition ||
        a.label.localeCompare(b.label)
    );
}

export async function listExperienceMenuItems(locale: string): Promise<PublicExperienceMenuItem[]> {
  return unstable_cache(
    () => fetchExperienceMenuItems(locale),
    ['public-experience-menu', locale],
    {
      revalidate: 300,
      tags: ['public-experiences']
    }
  )();
}

export async function getExperienceCountries(locale: string): Promise<BenrosoCountryId[]> {
  const experiences = await listPublishedExperiences({ locale });
  const countries = new Set<BenrosoCountryId>();

  for (const experience of experiences) {
    for (const country of experience.countries) {
      countries.add(country);
    }
  }

  return BENROSO_OPERATING_COUNTRIES.map((country) => country.id).filter((id) => countries.has(id));
}

export async function getExperienceCategories(locale: string): Promise<string[]> {
  const experiences = await listPublishedExperiences({ locale });
  const categories = new Set<string>();

  for (const experience of experiences) {
    if (experience.category) categories.add(experience.category);
  }

  return [...categories].toSorted((a, b) => a.localeCompare(b));
}

export async function getPublishedExperienceBySlug(
  locale: string,
  slug: string
): Promise<PublicExperienceDetail | null> {
  const supabase = createEnquiryPublicClient();

  const { data: row } = await supabase
    .from('experience_translations')
    .select(
      `
      slug,
      title,
      summary,
      content,
      faqs,
      seo_title,
      seo_description,
      experience:experiences!inner(id, category, countries, menu_group, layout_variant, status, gallery, highlights, package_pricing, deleted_at),
      og_image:media_assets!experience_translations_og_image_id_fkey(url, alt)
    `
    )
    .eq('locale', locale)
    .eq('slug', slug)
    .eq('experience.status', 'published')
    .is('experience.deleted_at', null)
    .not('published_at', 'is', null)
    .not('content', 'is', null)
    .maybeSingle<ExperienceTranslationRow>();

  if (!row) return null;

  const experience = unwrapRelation(row.experience);
  if (!experience || !hasTranslationContent(row.content)) return null;

  const galleryIds = parseStringArray(experience.gallery);
  const mediaById = await resolveMediaByIds(galleryIds);
  const cover = coverFromGallery(galleryIds, mediaById, row.title);
  const ogImage = unwrapRelation(row.og_image);

  const gallery = galleryIds.flatMap((id) => {
    const asset = mediaById.get(id);
    return asset ? [asset] : [];
  });

  return {
    category: experience.category,
    contentHtml: parseContentHtml(row.content),
    countries: parseCountries(experience.countries),
    experienceId: experience.id,
    faqs: parseFaqs(row.faqs),
    gallery,
    highlights: parseStringArray(experience.highlights),
    href: localePath(locale, `/experiences/${row.slug}`),
    id: experience.id,
    imageAlt: ogImage?.alt ?? cover.imageAlt,
    imageUrl: ogImage?.url ?? cover.imageUrl,
    layoutVariant: normalizeExperienceLayoutVariant(experience.layout_variant),
    menuGroup: normalizeMenuGroup(experience.menu_group),
    seoDescription: row.seo_description,
    seoTitle: row.seo_title,
    slug: row.slug,
    summary: row.summary,
    title: row.title
  };
}

async function fetchParksByTourId(
  tourIds: string[],
  locale: string
): Promise<Map<string, string[]>> {
  if (!tourIds.length) return new Map();

  const supabase = createEnquiryPublicClient();
  const { data: parkLinks } = await supabase
    .from('tour_national_parks')
    .select('tour_id, park_id, position')
    .in('tour_id', tourIds)
    .order('position');

  const parkIds = [...new Set((parkLinks ?? []).map((link) => link.park_id))];
  if (!parkIds.length) return new Map();

  const { data: parkTranslations } = await supabase
    .from('national_park_translations')
    .select('park_id, name')
    .eq('locale', locale)
    .in('park_id', parkIds)
    .not('published_at', 'is', null);

  const parkNameById = new Map((parkTranslations ?? []).map((park) => [park.park_id, park.name]));
  const parksByTourId = new Map<string, string[]>();

  for (const link of parkLinks ?? []) {
    const name = parkNameById.get(link.park_id);
    if (!name) continue;

    const existing = parksByTourId.get(link.tour_id) ?? [];
    existing.push(name);
    parksByTourId.set(link.tour_id, existing);
  }

  return parksByTourId;
}

export async function getRelatedToursForExperience(
  experienceId: string,
  locale: string
): Promise<PublicExperienceRelatedTour[]> {
  const supabase = createEnquiryPublicClient();

  const { data: experienceLinks } = await supabase
    .from('tour_experiences')
    .select('tour_id, position')
    .eq('experience_id', experienceId)
    .order('position');

  if (!experienceLinks?.length) return [];

  const tourIds = experienceLinks.map((link) => link.tour_id);
  const orderByTourId = new Map(
    experienceLinks.map((link, index) => [link.tour_id, link.position ?? index])
  );

  const [publicTours, parksByTourId] = await Promise.all([
    getPublicToursByIds(locale, tourIds),
    fetchParksByTourId(tourIds, locale)
  ]);

  return publicTours
    .map((tour) => ({
      days: tour.days,
      excerpt: tour.excerpt,
      href: tour.href,
      id: tour.id,
      imageAlt: tour.imageAlt,
      imageUrl: tour.imageUrl,
      nights: tour.nights,
      parksLabel: (parksByTourId.get(tour.id) ?? []).length
        ? (parksByTourId.get(tour.id) ?? []).slice(0, 3).join(' · ')
        : null,
      priceFrom: tour.priceFrom,
      slug: tour.slug,
      title: tour.title
    }))
    .toSorted((a, b) => (orderByTourId.get(a.id) ?? 0) - (orderByTourId.get(b.id) ?? 0));
}

function parseMountainItineraryDays(value: unknown): PublicMountainRouteDay[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item, index) => {
    if (!item || typeof item !== 'object') return [];
    const record = item as Record<string, unknown>;
    const title = typeof record.title === 'string' ? record.title.trim() : '';
    if (!title) return [];

    const description = typeof record.description === 'string' ? record.description : '';
    const distanceMatch = description.match(
      /(?:distance|hiking distance)\s*([0-9]+(?:\.[0-9]+)?\s*km)/i
    );
    const elevationMatch = description.match(/(?:height|elevation)\s*([0-9][0-9,\s\-m.]+)/i);

    return [
      {
        day: typeof record.day === 'number' ? record.day : index + 1,
        distanceLabel: distanceMatch?.[1]?.trim() ?? null,
        elevationLabel: elevationMatch?.[1]?.replace(/\s+/g, ' ').trim() ?? null,
        title
      }
    ];
  });
}

async function fetchMountainPricingByTourId(
  tourIds: string[]
): Promise<Map<string, { currency: string; rows: PublicMountainRoutePricingRow[] }>> {
  const result = new Map<string, { currency: string; rows: PublicMountainRoutePricingRow[] }>();
  if (!tourIds.length) return result;

  const supabase = createEnquiryPublicClient();
  const { data: tiers } = await supabase
    .from('tour_pricing_tiers')
    .select('id, tour_id, currency, position')
    .in('tour_id', tourIds)
    .order('position', { ascending: true });

  const tierRows = (tiers ?? []) as Array<{
    currency: string | null;
    id: string;
    position: number | null;
    tour_id: string;
  }>;
  if (!tierRows.length) return result;

  const tierIds = tierRows.map((tier) => tier.id);
  const { data: seasons } = await supabase
    .from('tour_pricing_seasons')
    .select('id, tier_id, label, position')
    .in('tier_id', tierIds)
    .order('position', { ascending: true });

  const seasonRows = (seasons ?? []) as Array<{
    id: string;
    label: string;
    position: number | null;
    tier_id: string;
  }>;
  const seasonIds = seasonRows.map((season) => season.id);
  const { data: cells } = seasonIds.length
    ? await supabase
        .from('tour_pricing_cells')
        .select('season_id, group_band, band_position, price')
        .in('season_id', seasonIds)
        .order('band_position', { ascending: true })
    : { data: [] };

  const cellsBySeasonId = new Map<string, PublicMountainRoutePricingRow[]>();
  for (const cell of (cells ?? []) as Array<{
    band_position: number | null;
    group_band: string | null;
    price: number | null;
    season_id: string;
  }>) {
    if (!cell.group_band) continue;
    const price = toFiniteNumber(cell.price);
    if (price == null) continue;
    cellsBySeasonId.set(cell.season_id, [
      ...(cellsBySeasonId.get(cell.season_id) ?? []),
      { label: cell.group_band, price }
    ]);
  }

  const seasonsByTierId = new Map<string, typeof seasonRows>();
  for (const season of seasonRows) {
    seasonsByTierId.set(season.tier_id, [...(seasonsByTierId.get(season.tier_id) ?? []), season]);
  }

  for (const tier of tierRows) {
    const firstSeason = (seasonsByTierId.get(tier.id) ?? [])[0];
    if (!firstSeason) continue;
    const rows = cellsBySeasonId.get(firstSeason.id) ?? [];
    if (!rows.length) continue;
    result.set(tier.tour_id, {
      currency: tier.currency ?? 'USD',
      rows
    });
  }

  return result;
}

export async function getMountainRoutesForExperience(
  experienceId: string,
  locale: string
): Promise<PublicMountainRoute[]> {
  const supabase = createEnquiryPublicClient();
  const { data: experienceLinks } = await supabase
    .from('tour_experiences')
    .select('tour_id, position')
    .eq('experience_id', experienceId)
    .order('position');

  if (!experienceLinks?.length) return [];

  const tourIds = experienceLinks.map((link) => link.tour_id);
  const orderByTourId = new Map(
    experienceLinks.map((link, index) => [link.tour_id, link.position ?? index])
  );

  const { data: rows } = await supabase
    .from('tour_translations')
    .select(
      `
      slug,
      title,
      excerpt,
      tour:tours!inner(
        id,
        status,
        days,
        nights,
        price_from,
        itinerary_days,
        inclusions,
        exclusions,
        important_notice
      ),
      og_image:media_assets!tour_translations_og_image_id_fkey(url, alt)
    `
    )
    .eq('locale', locale)
    .in('tour_id', tourIds)
    .eq('tour.status', 'published')
    .not('published_at', 'is', null);

  const [publicTours, parksByTourId, pricingByTourId] = await Promise.all([
    getPublicToursByIds(locale, tourIds),
    fetchParksByTourId(tourIds, locale),
    fetchMountainPricingByTourId(tourIds)
  ]);
  const publicTourById = new Map(publicTours.map((tour) => [tour.id, tour]));

  return (rows ?? [])
    .flatMap((row) => {
      const tour = unwrapRelation(row.tour);
      if (!tour) return [];
      const publicTour = publicTourById.get(tour.id);
      if (!publicTour) return [];

      const parks = parksByTourId.get(tour.id) ?? [];
      const pricing = pricingByTourId.get(tour.id);
      const routeLabel = parks.length ? parks.join(' · ') : null;

      return [
        {
          days: tour.days,
          excerpt: row.excerpt,
          href: publicTour.href,
          id: tour.id,
          imageAlt: publicTour.imageAlt,
          imageUrl: publicTour.imageUrl,
          nights: tour.nights,
          parksLabel: routeLabel,
          priceFrom: tour.price_from != null ? Number(tour.price_from) : publicTour.priceFrom,
          slug: row.slug,
          title: row.title,
          currency: pricing?.currency ?? 'USD',
          exclusions: parseStringArray(tour.exclusions),
          inclusions: parseStringArray(tour.inclusions),
          itineraryDays: parseMountainItineraryDays(tour.itinerary_days),
          pricingRows: pricing?.rows ?? [],
          routeLabel,
          soloTravellerNote:
            typeof tour.important_notice === 'string' && tour.important_notice.trim()
              ? tour.important_notice.trim()
              : null
        } satisfies PublicMountainRoute
      ];
    })
    .toSorted((a, b) => (orderByTourId.get(a.id) ?? 0) - (orderByTourId.get(b.id) ?? 0));
}

export { isMountainExperienceLayout };

async function getExperienceTourIds(experienceId: string): Promise<string[]> {
  const supabase = createEnquiryPublicClient();
  const { data } = await supabase
    .from('tour_experiences')
    .select('tour_id, position')
    .eq('experience_id', experienceId)
    .order('position');

  return [
    ...new Set((data ?? []).map((link) => link.tour_id).filter((id): id is string => Boolean(id)))
  ];
}

export async function getPackageLevelsForExperience(
  experienceId: string
): Promise<PublicExperiencePackageLevel[]> {
  const supabase = createEnquiryPublicClient();
  const { data: experienceRow } = await supabase
    .from('experiences')
    .select('layout_variant, package_pricing')
    .eq('id', experienceId)
    .maybeSingle();

  if (experienceRow?.layout_variant === 'mountain') return [];

  const tourIds = await getExperienceTourIds(experienceId);
  const savedLevels = parsePackagePricing(experienceRow?.package_pricing);
  if (savedLevels.length) {
    return savedLevels.map((level) => ({
      ...level,
      tripCount: tourIds.length
    }));
  }

  if (!tourIds.length) return [];

  const { data: tiers } = await supabase
    .from('tour_pricing_tiers')
    .select('id, tour_id, tier, label, blurb, currency, position')
    .in('tour_id', tourIds)
    .order('position', { ascending: true });

  const typedTiers = (
    (tiers ?? []) as Array<{
      blurb: string | null;
      currency: string | null;
      id: string;
      label: string | null;
      tier: PublicExperiencePackageLevel['key'];
      tour_id: string;
    }>
  ).filter((tier) => ['budget', 'mid_range', 'luxury'].includes(tier.tier));

  if (!typedTiers.length) return [];

  const tierIds = typedTiers.map((tier) => tier.id);
  const { data: seasons } = await supabase
    .from('tour_pricing_seasons')
    .select('id, tier_id, label, position')
    .in('tier_id', tierIds)
    .order('position', { ascending: true });

  const typedSeasons = (seasons ?? []) as Array<{
    id: string;
    label: string;
    tier_id: string;
  }>;

  const seasonIds = typedSeasons.map((season) => season.id);
  const { data: cells } = seasonIds.length
    ? await supabase
        .from('tour_pricing_cells')
        .select('season_id, group_band, band_position, price')
        .in('season_id', seasonIds)
        .order('band_position', { ascending: true })
    : { data: [] };

  const cellsBySeasonId = new Map<
    string,
    Array<{ groupBand: string; price: number; position: number }>
  >();

  for (const cell of (cells ?? []) as Array<{
    band_position: number | null;
    group_band: string | null;
    price: number | null;
    season_id: string;
  }>) {
    if (!cell.group_band) continue;
    const price = toFiniteNumber(cell.price);
    if (price == null) continue;
    cellsBySeasonId.set(cell.season_id, [
      ...(cellsBySeasonId.get(cell.season_id) ?? []),
      {
        groupBand: cell.group_band,
        position: cell.band_position ?? 0,
        price
      }
    ]);
  }

  const seasonsByTierId = new Map<string, typeof typedSeasons>();
  for (const season of typedSeasons) {
    seasonsByTierId.set(season.tier_id, [...(seasonsByTierId.get(season.tier_id) ?? []), season]);
  }

  const groups = new Map<
    PublicExperiencePackageLevel['key'],
    {
      blurbs: string[];
      currencies: string[];
      labels: string[];
      prices: number[];
      seasonCells: Map<string, Map<string, { position: number; price: number }>>;
      tourIds: Set<string>;
    }
  >();

  for (const tier of typedTiers) {
    const group = groups.get(tier.tier) ?? {
      blurbs: [],
      currencies: [],
      labels: [],
      prices: [],
      seasonCells: new Map<string, Map<string, { position: number; price: number }>>(),
      tourIds: new Set<string>()
    };

    if (tier.label) group.labels.push(tier.label);
    if (tier.blurb) group.blurbs.push(tier.blurb);
    if (tier.currency) group.currencies.push(tier.currency);
    group.tourIds.add(tier.tour_id);

    for (const season of seasonsByTierId.get(tier.id) ?? []) {
      const seasonMap = group.seasonCells.get(season.label) ?? new Map();
      for (const cell of cellsBySeasonId.get(season.id) ?? []) {
        const existing = seasonMap.get(cell.groupBand);
        if (!existing || cell.price < existing.price) {
          seasonMap.set(cell.groupBand, {
            position: cell.position,
            price: cell.price
          });
        }
        group.prices.push(cell.price);
      }
      group.seasonCells.set(season.label, seasonMap);
    }

    groups.set(tier.tier, group);
  }

  const order: PublicExperiencePackageLevel['key'][] = ['budget', 'mid_range', 'luxury'];

  return order.flatMap((key) => {
    const group = groups.get(key);
    if (!group) return [];

    return [
      {
        blurb: group.blurbs[0] ?? packageLevelBlurb(key),
        currency: group.currencies[0] ?? 'USD',
        key,
        label: group.labels[0] ?? packageLevelLabel(key),
        priceFrom: group.prices.length ? Math.min(...group.prices) : null,
        seasons: [...group.seasonCells.entries()].map(([label, bandMap]) => ({
          cells: [...bandMap.entries()]
            .map(([groupBand, cell]) => ({
              groupBand,
              price: cell.price,
              position: cell.position
            }))
            .toSorted((a, b) => a.position - b.position)
            .map(({ groupBand, price }) => ({ groupBand, price })),
          label
        })),
        tripCount: group.tourIds.size
      }
    ];
  });
}

export async function getRelatedAccommodationsForExperience(
  experienceId: string,
  locale: string,
  limit = 6
): Promise<PublicExperienceRelatedAccommodation[]> {
  const supabase = createEnquiryPublicClient();

  const { data: tourLinks } = await supabase
    .from('tour_experiences')
    .select('tour_id')
    .eq('experience_id', experienceId);

  if (!tourLinks?.length) return [];

  const tourIds = tourLinks.map((link) => link.tour_id);

  const { data: accommodationLinks } = await supabase
    .from('tour_accommodations')
    .select('accommodation_id, position')
    .in('tour_id', tourIds)
    .order('position');

  const seen = new Set<string>();
  const accommodationIds: string[] = [];

  for (const link of accommodationLinks ?? []) {
    if (seen.has(link.accommodation_id)) continue;
    seen.add(link.accommodation_id);
    accommodationIds.push(link.accommodation_id);
    if (accommodationIds.length >= limit) break;
  }

  if (!accommodationIds.length) return [];

  const { data: rows } = await supabase
    .from('accommodation_translations')
    .select(
      `
      slug,
      name,
      summary,
      accommodation_id,
      accommodation:accommodations!inner(id, status, region, country),
      og_image:media_assets!accommodation_translations_og_image_id_fkey(url, alt)
    `
    )
    .eq('locale', locale)
    .in('accommodation_id', accommodationIds)
    .eq('accommodation.status', 'published')
    .not('published_at', 'is', null);

  const orderMap = new Map(accommodationIds.map((id, index) => [id, index]));

  return (rows ?? [])
    .flatMap((row: AccommodationTranslationRow) => {
      const accommodation = unwrapRelation(row.accommodation);
      if (!accommodation) return [];

      const locationParts = [accommodation.region, accommodation.country].filter(
        (part): part is string => Boolean(part)
      );

      return [
        {
          country: accommodation.country,
          href: localePath(locale, `/accommodations/${row.slug}`),
          id: accommodation.id,
          imageAlt: mediaAlt(row.og_image, row.name),
          imageUrl: mediaUrl(row.og_image),
          locationLabel: locationParts.length ? locationParts.join(', ') : null,
          name: row.name,
          slug: row.slug,
          summary: row.summary
        }
      ];
    })
    .toSorted((a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0));
}
