'use server';

import { revalidatePath } from 'next/cache';

import { requirePortalSession } from '@/lib/auth/portal';
import { createClient } from '@/lib/supabase/server';
import { notifyPublishedContent } from '@/lib/seo/publish-notify';
import { accommodationFormSchema, type AccommodationFormValues } from './schema';

export type SaveStatus = 'draft' | 'published';

export interface AccommodationRecord extends AccommodationFormValues {
  id: string;
  status: string;
}

const WRITE_ROLES = new Set(['owner', 'admin', 'editor']);

async function assertCanWrite() {
  const session = await requirePortalSession();
  if (!WRITE_ROLES.has(session.role)) {
    throw new Error('You do not have permission to manage accommodations.');
  }
  return session;
}

function parsePricePerNight(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error('Enter a valid nightly price or leave it blank.');
  }
  return parsed;
}

export async function saveAccommodation(input: {
  id?: string;
  values: AccommodationFormValues;
  status: SaveStatus;
}): Promise<{ id: string }> {
  await assertCanWrite();

  const values = accommodationFormSchema.parse(input.values);
  const supabase = await createClient();
  const now = new Date().toISOString();

  const basePayload = {
    country: values.country,
    region: values.region || null,
    map_query: values.mapQuery.trim() || null,
    property_type: values.propertyType || null,
    comfort_level: values.comfortLevel || null,
    availability: values.availability,
    price_per_night: parsePricePerNight(values.pricePerNight),
    amenities: values.amenities,
    gallery: values.gallery,
    status: input.status,
    updated_at: now
  };

  let accommodationId = input.id;

  if (accommodationId) {
    const { error } = await supabase
      .from('accommodations')
      .update(basePayload)
      .eq('id', accommodationId);
    if (error) throw new Error(error.message);
  } else {
    const { data, error } = await supabase
      .from('accommodations')
      .insert(basePayload)
      .select('id')
      .single();
    if (error) throw new Error(error.message);
    accommodationId = data.id;
  }

  const { data: existing } = await supabase
    .from('accommodation_translations')
    .select('id, published_at')
    .eq('accommodation_id', accommodationId)
    .eq('locale', 'en')
    .maybeSingle();

  const publishedAt = input.status === 'published' ? (existing?.published_at ?? now) : null;

  const translationPayload = {
    accommodation_id: accommodationId,
    locale: 'en',
    slug: values.slug,
    name: values.name,
    summary: values.summary || null,
    description: values.description ? { html: values.description } : null,
    seo_title: values.seoTitle || values.name,
    seo_description: values.seoDescription || null,
    focus_keyword: values.focusKeyword || null,
    keywords: values.keywords,
    published_at: publishedAt,
    updated_at: now
  };

  if (existing) {
    const { error } = await supabase
      .from('accommodation_translations')
      .update(translationPayload)
      .eq('id', existing.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from('accommodation_translations').insert(translationPayload);
    if (error) throw new Error(error.message);
  }

  revalidatePath('/portal/accommodations');
  revalidatePath('/en/accommodations');
  if (input.status === 'published') {
    notifyPublishedContent({ pathPrefix: 'accommodations', slug: values.slug });
  }
  return { id: accommodationId };
}

export async function getAccommodation(id: string): Promise<AccommodationRecord | null> {
  const supabase = await createClient();

  const { data: base } = await supabase
    .from('accommodations')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (!base) return null;

  const { data: translation } = await supabase
    .from('accommodation_translations')
    .select('*')
    .eq('accommodation_id', id)
    .eq('locale', 'en')
    .maybeSingle();

  const amenities = Array.isArray(base.amenities) ? (base.amenities as string[]) : [];
  const gallery = Array.isArray(base.gallery) ? (base.gallery as string[]) : [];
  const keywords = Array.isArray(translation?.keywords) ? (translation.keywords as string[]) : [];
  const description = (translation?.description as { html?: string; text?: string } | null) ?? null;

  return {
    id: base.id,
    status: base.status,
    country: base.country ?? '',
    region: base.region ?? '',
    mapQuery: base.map_query ?? '',
    propertyType: base.property_type ?? '',
    comfortLevel: base.comfort_level ?? '',
    availability:
      base.availability === 'available' ||
      base.availability === 'on_request' ||
      base.availability === 'limited'
        ? base.availability
        : 'on_request',
    pricePerNight: base.price_per_night != null ? String(base.price_per_night) : '',
    amenities,
    gallery,
    name: translation?.name ?? '',
    slug: translation?.slug ?? '',
    summary: translation?.summary ?? '',
    description: description?.html ?? description?.text ?? '',
    seoTitle: translation?.seo_title ?? '',
    seoDescription: translation?.seo_description ?? '',
    focusKeyword: translation?.focus_keyword ?? '',
    keywords
  };
}

export async function getAccommodationFacets(): Promise<{
  countries: string[];
  propertyTypes: string[];
  regions: string[];
}> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('accommodations')
    .select('country, region, property_type')
    .is('deleted_at', null);

  const countries = new Set<string>();
  const propertyTypes = new Set<string>();
  const regions = new Set<string>();

  for (const row of data ?? []) {
    if (row.country) countries.add(row.country);
    if (row.region) regions.add(row.region);
    if (row.property_type) propertyTypes.add(row.property_type);
  }

  return {
    countries: [...countries].toSorted((a, b) => a.localeCompare(b)),
    propertyTypes: [...propertyTypes].toSorted((a, b) => a.localeCompare(b)),
    regions: [...regions].toSorted((a, b) => a.localeCompare(b))
  };
}
