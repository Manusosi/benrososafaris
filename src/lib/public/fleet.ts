import type { SupabaseClient } from '@supabase/supabase-js';

import { localePath } from '@/lib/public/locale-path';
import type {
  PublicDestinationMedia,
  PublicFleetVehicle,
  PublicFleetVehicleDetail
} from '@/lib/public/types';
import { normalizeDirectAnswers } from '@/lib/seo/direct-answers';
import { createEnquiryPublicClient } from '@/lib/supabase/service-role';

async function publicClient(): Promise<SupabaseClient> {
  return createEnquiryPublicClient() as unknown as SupabaseClient;
}

async function genericClient(): Promise<SupabaseClient> {
  return publicClient();
}

function parseStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter((item) => item.length > 0);
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

async function resolveMedia(
  supabase: SupabaseClient,
  ids: string[]
): Promise<Map<string, PublicDestinationMedia>> {
  const uniqueIds = [...new Set(ids.filter(Boolean))];
  if (!uniqueIds.length) return new Map();

  const { data } = await supabase.from('media_assets').select('id, url, alt').in('id', uniqueIds);
  return new Map(
    (data ?? []).map((asset) => [
      asset.id as string,
      {
        alt: (asset.alt as string | null) ?? null,
        id: asset.id as string,
        url: (asset.url as string | null) ?? null
      }
    ])
  );
}

function galleryIds(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string' && item.length > 0)
    : [];
}

const FLEET_GALLERY_FALLBACK: PublicDestinationMedia[] = [
  {
    id: 'benroso-fleet-lion',
    url: '/assets/benroso-fleet-lion.png',
    alt: 'Benroso Safaris four by four with pop up roof near a lion on the plains'
  },
  {
    id: 'benroso-4x4-safaris-fleet',
    url: '/assets/benroso-4x4-safaris-fleet.png',
    alt: 'Benroso Safaris 4x4 fleet at a scenic East African viewpoint'
  },
  {
    id: 'benroso-fleet-mara-gate',
    url: '/assets/benroso-fleet-mara-gate.png',
    alt: 'Benroso Safaris vehicle at Lake Naivasha Sopa Resort'
  },
  {
    id: 'benroso-fleet-branded',
    url: '/assets/benroso-fleet-branded.png',
    alt: 'Benroso Safaris Land Cruiser ready for off road game drives'
  },
  {
    id: 'benroso-fleet-guests',
    url: '/assets/benroso-fleet-guests.png',
    alt: 'Safari guests with Benroso Safaris private safari vehicles'
  }
];

export async function getFleetGalleryImages(_locale: string): Promise<PublicDestinationMedia[]> {
  const supabase = await publicClient();

  const { data: galleryRows, error: galleryError } = await supabase
    .from('fleet_gallery_items')
    .select('id, media_id, position, created_at')
    .order('position', { ascending: true })
    .order('created_at', { ascending: true });

  if (!galleryError && galleryRows?.length) {
    const mediaIds = galleryRows.map((row) => row.media_id as string);
    const media = await resolveMedia(supabase, mediaIds);
    const images = galleryRows.flatMap((row) => {
      const asset = media.get(row.media_id as string);
      if (!asset?.url) return [];
      return [
        {
          alt: asset.alt,
          id: row.id as string,
          url: asset.url
        } satisfies PublicDestinationMedia
      ];
    });
    return images;
  }

  return FLEET_GALLERY_FALLBACK;
}

export async function getPublishedFleet(locale: string): Promise<PublicFleetVehicle[]> {
  const supabase = await genericClient();

  const { data: vehicles } = await supabase
    .from('fleet_vehicles')
    .select('id, vehicle_type, capacity, features, gallery, created_at')
    .eq('status', 'published')
    .order('created_at', { ascending: true });

  if (!vehicles?.length) return [];

  const ids = vehicles.map((vehicle) => vehicle.id as string);
  const { data: translations } = await supabase
    .from('fleet_vehicle_translations')
    .select('vehicle_id, slug, title, summary, og_image_id')
    .eq('locale', locale)
    .not('published_at', 'is', null)
    .in('vehicle_id', ids);

  const translationByVehicle = new Map(
    (translations ?? []).map((translation) => [translation.vehicle_id as string, translation])
  );

  const mediaIds = vehicles.flatMap((vehicle) => galleryIds(vehicle.gallery).slice(0, 1));
  for (const translation of translations ?? []) {
    if (translation.og_image_id) mediaIds.push(translation.og_image_id as string);
  }
  const media = await resolveMedia(supabase, mediaIds);

  return vehicles
    .map((vehicle) => {
      const translation = translationByVehicle.get(vehicle.id as string);
      if (!translation) return null;

      const coverId =
        (translation.og_image_id as string | null) ?? galleryIds(vehicle.gallery)[0] ?? null;
      const cover = coverId ? media.get(coverId) : undefined;

      return {
        capacity: (vehicle.capacity as number | null) ?? null,
        features: parseStringArray(vehicle.features),
        gallery: cover ? [cover] : [],
        href: localePath(locale, `/our-fleet/${translation.slug}`),
        id: vehicle.id as string,
        imageAlt: cover?.alt ?? null,
        imageUrl: cover?.url ?? null,
        slug: translation.slug as string,
        summary: (translation.summary as string | null) ?? null,
        title: translation.title as string,
        vehicleType: (vehicle.vehicle_type as string | null) ?? null
      } satisfies PublicFleetVehicle;
    })
    .filter((item): item is PublicFleetVehicle => item !== null)
    .toSorted((a, b) => a.title.localeCompare(b.title));
}

export async function getFleetVehicleBySlug(
  locale: string,
  slug: string
): Promise<PublicFleetVehicleDetail | null> {
  const supabase = await genericClient();

  const { data: translation } = await supabase
    .from('fleet_vehicle_translations')
    .select('*, vehicle:fleet_vehicles!inner(*)')
    .eq('locale', locale)
    .eq('slug', slug)
    .not('published_at', 'is', null)
    .eq('vehicle.status', 'published')
    .maybeSingle();

  if (!translation) return null;

  const vehicle = translation.vehicle as Record<string, unknown>;
  const ids = galleryIds(vehicle.gallery);
  const ogId = translation.og_image_id as string | null;
  const media = await resolveMedia(supabase, ogId ? [ogId, ...ids] : ids);
  const gallery = ids
    .map((id) => media.get(id))
    .filter((asset): asset is PublicDestinationMedia => Boolean(asset));
  const cover = ogId ? media.get(ogId) : gallery[0];

  return {
    capacity: (vehicle.capacity as number | null) ?? null,
    descriptionHtml: parseRichTextHtml(translation.description),
    faqs: normalizeDirectAnswers(translation.faqs),
    features: parseStringArray(vehicle.features),
    gallery,
    href: localePath(locale, `/our-fleet/${translation.slug}`),
    id: vehicle.id as string,
    imageAlt: cover?.alt ?? null,
    imageUrl: cover?.url ?? null,
    seoDescription: (translation.seo_description as string | null) ?? null,
    seoTitle: (translation.seo_title as string | null) ?? null,
    slug: translation.slug as string,
    summary: (translation.summary as string | null) ?? null,
    title: translation.title as string,
    vehicleType: (vehicle.vehicle_type as string | null) ?? null
  };
}
