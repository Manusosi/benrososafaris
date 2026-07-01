import type { SupabaseClient } from '@supabase/supabase-js';

import { createClient } from '@/lib/supabase/server';
import type { TourCardItem } from '@/components/public/cards/content-cards';

export interface ParkListItem {
  slug: string;
  name: string;
  summary: string | null;
  country: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
}

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
}

/** The newly-added `gallery` column is not in generated types yet. */
async function genericClient(): Promise<SupabaseClient> {
  return (await createClient()) as unknown as SupabaseClient;
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

/** Published parks for the listing grid, with cover image resolved. */
export async function getPublishedParks(locale: string): Promise<ParkListItem[]> {
  const supabase = await genericClient();

  const { data: parks } = await supabase
    .from('national_parks')
    .select('id, country, gallery, position')
    .eq('status', 'published')
    .order('position', { ascending: true });

  if (!parks?.length) return [];

  const ids = parks.map((p) => p.id as string);
  const { data: translations } = await supabase
    .from('national_park_translations')
    .select('park_id, slug, name, summary')
    .eq('locale', locale)
    .not('published_at', 'is', null)
    .in('park_id', ids);

  const translationByPark = new Map((translations ?? []).map((t) => [t.park_id as string, t]));

  const coverIds = parks
    .map((p) => (Array.isArray(p.gallery) ? (p.gallery as string[])[0] : undefined))
    .filter((id): id is string => Boolean(id));
  const media = await resolveMedia(supabase, coverIds);

  return parks
    .map((park) => {
      const translation = translationByPark.get(park.id as string);
      if (!translation) return null;
      const coverId = Array.isArray(park.gallery) ? (park.gallery as string[])[0] : undefined;
      const cover = coverId ? media.get(coverId) : undefined;
      return {
        slug: translation.slug as string,
        name: translation.name as string,
        summary: (translation.summary as string | null) ?? null,
        country: (park.country as string | null) ?? null,
        imageUrl: cover?.url ?? null,
        imageAlt: cover?.alt ?? null
      } satisfies ParkListItem;
    })
    .filter((item): item is ParkListItem => item !== null);
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
  const galleryIds = Array.isArray(park.gallery) ? (park.gallery as string[]) : [];
  const media = await resolveMedia(supabase, galleryIds);
  const gallery = galleryIds
    .map((id) => media.get(id))
    .filter((m): m is { url: string | null; alt: string | null } => Boolean(m));

  const ogId = translation.og_image_id as string | null;
  const og = ogId
    ? (media.get(ogId) ?? (await resolveMedia(supabase, [ogId])).get(ogId))
    : undefined;
  const description = (translation.description as { html?: string; text?: string } | null) ?? null;
  const bestTime = (park.best_time as { summary?: string } | null) ?? null;

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
    wildlife: Array.isArray(park.wildlife) ? (park.wildlife as string[]) : [],
    activities: Array.isArray(park.activities) ? (park.activities as string[]) : [],
    gallery,
    faqs: translation.faqs,
    seoTitle: (translation.seo_title as string | null) ?? null,
    seoDescription: (translation.seo_description as string | null) ?? null,
    ogImageUrl: og?.url ?? gallery[0]?.url ?? null,
    ogImageAlt: og?.alt ?? gallery[0]?.alt ?? null
  };
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
