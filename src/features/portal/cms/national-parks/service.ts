'use server';

import { revalidatePath } from 'next/cache';
import type { SupabaseClient } from '@supabase/supabase-js';

import { requirePortalSession } from '@/lib/auth/portal';
import { createClient } from '@/lib/supabase/server';
import { normalizeDirectAnswers } from '@/lib/seo/direct-answers';
import { nationalParkFormSchema, type NationalParkFormValues } from './schema';

export type SaveStatus = 'draft' | 'published';

export interface NationalParkRecord extends NationalParkFormValues {
  id: string;
  status: string;
}

/** Editors and super admins only. */
const WRITE_ROLES = new Set(['owner', 'admin', 'editor']);

async function assertCanWrite() {
  const session = await requirePortalSession();
  if (!WRITE_ROLES.has(session.role)) {
    throw new Error('You do not have permission to manage national parks.');
  }
  return session;
}

/**
 * The freshly-added `gallery` column is not in the generated DB types yet, so
 * park access uses the untyped client surface (same pattern as portal/api).
 */
async function genericClient(): Promise<SupabaseClient> {
  return (await createClient()) as unknown as SupabaseClient;
}

function toNumberOrNull(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Creates or updates a national park and its English translation in one call.
 * Publishing stamps `published_at`; saving a draft clears it (unpublishes).
 */
export async function saveNationalPark(input: {
  id?: string;
  values: NationalParkFormValues;
  status: SaveStatus;
}): Promise<{ id: string }> {
  await assertCanWrite();

  const values = nationalParkFormSchema.parse(input.values);
  const supabase = await genericClient();
  const now = new Date().toISOString();

  const basePayload = {
    country: values.country,
    region: values.region || null,
    destination_id: values.destinationId || null,
    park_size_km2: toNumberOrNull(values.parkSizeKm2),
    established_year: toNumberOrNull(values.establishedYear),
    latitude: toNumberOrNull(values.latitude),
    longitude: toNumberOrNull(values.longitude),
    best_time: { summary: values.bestTimeSummary || '' },
    wildlife: values.wildlife,
    activities: values.activities,
    gallery: values.gallery,
    status: input.status,
    updated_at: now
  };

  let parkId = input.id;

  if (parkId) {
    const { error } = await supabase.from('national_parks').update(basePayload).eq('id', parkId);
    if (error) throw new Error(error.message);
  } else {
    const { data, error } = await supabase
      .from('national_parks')
      .insert(basePayload)
      .select('id')
      .single();
    if (error) throw new Error(error.message);
    parkId = data.id as string;
  }

  const { data: existing } = await supabase
    .from('national_park_translations')
    .select('id, published_at')
    .eq('park_id', parkId)
    .eq('locale', 'en')
    .maybeSingle();

  const publishedAt = input.status === 'published' ? (existing?.published_at ?? now) : null;

  const translationPayload = {
    park_id: parkId,
    locale: 'en',
    slug: values.slug,
    name: values.name,
    summary: values.summary || null,
    description: values.description ? { html: values.description } : null,
    faqs: normalizeDirectAnswers(values.faqs),
    seo_title: values.seoTitle || values.name,
    seo_description: values.seoDescription || null,
    focus_keyword: values.focusKeyword || null,
    keywords: values.keywords,
    published_at: publishedAt,
    updated_at: now
  };

  if (existing) {
    const { error } = await supabase
      .from('national_park_translations')
      .update(translationPayload)
      .eq('id', existing.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from('national_park_translations').insert(translationPayload);
    if (error) throw new Error(error.message);
  }

  revalidatePath('/portal/national-parks');
  return { id: parkId };
}

/** Loads a park + its English translation as flat wizard values. */
export async function getNationalPark(id: string): Promise<NationalParkRecord | null> {
  const supabase = await genericClient();

  const { data: base } = await supabase
    .from('national_parks')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (!base) return null;

  const { data: translation } = await supabase
    .from('national_park_translations')
    .select('*')
    .eq('park_id', id)
    .eq('locale', 'en')
    .maybeSingle();

  const bestTime = (base.best_time as { summary?: string } | null) ?? null;
  const wildlife = Array.isArray(base.wildlife) ? (base.wildlife as string[]) : [];
  const activities = Array.isArray(base.activities) ? (base.activities as string[]) : [];
  const gallery = Array.isArray(base.gallery) ? (base.gallery as string[]) : [];
  const description = (translation?.description as { html?: string; text?: string } | null) ?? null;
  const keywords = Array.isArray(translation?.keywords) ? (translation.keywords as string[]) : [];
  const faqs = normalizeDirectAnswers(translation?.faqs);

  return {
    id: base.id as string,
    status: base.status as string,
    country: base.country ?? '',
    region: base.region ?? '',
    destinationId: base.destination_id ?? '',
    parkSizeKm2: base.park_size_km2 != null ? String(base.park_size_km2) : '',
    establishedYear: base.established_year != null ? String(base.established_year) : '',
    latitude: base.latitude != null ? String(base.latitude) : '',
    longitude: base.longitude != null ? String(base.longitude) : '',
    bestTimeSummary: bestTime?.summary ?? '',
    wildlife,
    activities,
    gallery,
    name: translation?.name ?? '',
    slug: translation?.slug ?? '',
    summary: translation?.summary ?? '',
    description: description?.html ?? description?.text ?? '',
    seoTitle: translation?.seo_title ?? '',
    seoDescription: translation?.seo_description ?? '',
    focusKeyword: translation?.focus_keyword ?? '',
    keywords,
    faqs
  };
}

/**
 * Distinct country/region values already in use, so the wizard comboboxes can
 * offer them for quick re-selection.
 */
export async function getNationalParkFacets(): Promise<{ countries: string[]; regions: string[] }> {
  const supabase = await genericClient();
  const { data } = await supabase.from('national_parks').select('country, region');

  const countries = new Set<string>();
  const regions = new Set<string>();
  for (const row of data ?? []) {
    if (row.country) countries.add(row.country as string);
    if (row.region) regions.add(row.region as string);
  }

  return {
    countries: [...countries].toSorted((a, b) => a.localeCompare(b)),
    regions: [...regions].toSorted((a, b) => a.localeCompare(b))
  };
}

/** Parent-destination options (id + en name) for the wizard's parent selector. */
export async function getDestinationParentOptions(): Promise<
  Array<{ value: string; label: string }>
> {
  const supabase = await genericClient();
  const { data } = await supabase
    .from('destination_translations')
    .select('destination_id, name')
    .eq('locale', 'en')
    .order('name', { ascending: true });

  return (data ?? []).map((row) => ({
    value: row.destination_id as string,
    label: (row.name as string) ?? 'Untitled'
  }));
}

/**
 * All parks (id + en name) for the Tours wizard's national-park multi-select.
 * Includes drafts so a tour can reference a park that is still being authored.
 */
export async function getParkOptions(): Promise<Array<{ value: string; label: string }>> {
  const supabase = await genericClient();
  const { data } = await supabase
    .from('national_park_translations')
    .select('park_id, name')
    .eq('locale', 'en')
    .order('name', { ascending: true });

  return (data ?? []).map((row) => ({
    value: row.park_id as string,
    label: (row.name as string) ?? 'Untitled'
  }));
}

export async function deleteNationalPark(id: string): Promise<void> {
  await assertCanWrite();
  const supabase = await genericClient();

  await supabase.from('national_park_translations').delete().eq('park_id', id);
  const { error } = await supabase.from('national_parks').delete().eq('id', id);
  if (error) throw new Error(error.message);

  revalidatePath('/portal/national-parks');
}
