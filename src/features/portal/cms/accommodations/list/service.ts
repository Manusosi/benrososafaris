'use server';

import { revalidatePath } from 'next/cache';

import type { SupabaseClient } from '@supabase/supabase-js';

import { requirePortalSession } from '@/lib/auth/portal';
import { createClient } from '@/lib/supabase/server';
import {
  ACCOMMODATIONS_PAGE_SIZE,
  type AccommodationListItem,
  type AccommodationListParams,
  type AccommodationListResult,
  type AccommodationStatusCounts
} from './types';

const WRITE_ROLES = new Set(['owner', 'admin', 'editor']);

async function assertCanWrite() {
  const session = await requirePortalSession();
  if (!WRITE_ROLES.has(session.role)) {
    throw new Error('You do not have permission to manage accommodations.');
  }
}

function parseGalleryIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string' && item.length > 0);
}

async function resolveCoverUrls(
  supabase: SupabaseClient,
  galleryByAccommodationId: Map<string, string[]>
): Promise<Map<string, { url: string | null; alt: string | null }>> {
  const allIds = [...new Set([...galleryByAccommodationId.values()].flatMap((ids) => ids))];
  if (!allIds.length) return new Map();

  const { data } = await supabase.from('media_assets').select('id, url, alt').in('id', allIds);
  const mediaById = new Map((data ?? []).map((asset) => [asset.id, asset]));

  const result = new Map<string, { url: string | null; alt: string | null }>();
  for (const [accommodationId, galleryIds] of galleryByAccommodationId) {
    const coverId = galleryIds[0];
    const cover = coverId ? mediaById.get(coverId) : null;
    result.set(accommodationId, { url: cover?.url ?? null, alt: cover?.alt ?? null });
  }
  return result;
}

export async function listAccommodations(
  params: AccommodationListParams
): Promise<AccommodationListResult> {
  const supabase = (await createClient()) as unknown as SupabaseClient;
  const page = Math.max(1, params.page);
  const from = (page - 1) * ACCOMMODATIONS_PAGE_SIZE;
  const to = from + ACCOMMODATIONS_PAGE_SIZE - 1;

  let query = supabase
    .from('accommodation_translations')
    .select(
      'accommodation_id, name, slug, published_at, accommodations!inner(id, status, country, region, property_type, availability, price_per_night, gallery, updated_at, deleted_at)',
      { count: 'exact' }
    )
    .eq('locale', 'en');

  if (params.status === 'trash') {
    query = query.not('accommodations.deleted_at', 'is', null);
  } else {
    query = query.is('accommodations.deleted_at', null);
    if (params.status === 'published') query = query.eq('accommodations.status', 'published');
    if (params.status === 'draft') query = query.eq('accommodations.status', 'draft');
  }

  if (params.search.trim()) {
    const term = `%${params.search.trim()}%`;
    query = query.or(`name.ilike.${term},slug.ilike.${term}`);
  }
  if (params.country) query = query.eq('accommodations.country', params.country);
  if (params.propertyType) query = query.eq('accommodations.property_type', params.propertyType);
  if (params.availability) query = query.eq('accommodations.availability', params.availability);

  query = query
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('name', { ascending: true })
    .range(from, to);

  const { data, count } = await query;

  type Row = {
    accommodation_id: string;
    name: string | null;
    slug: string | null;
    published_at: string | null;
    accommodations: {
      id: string;
      status: string;
      country: string | null;
      region: string | null;
      property_type: string | null;
      availability: string | null;
      price_per_night: number | null;
      gallery: unknown;
      updated_at: string;
      deleted_at: string | null;
    } | null;
  };

  const rows = ((data as Row[] | null) ?? []).filter((row) => row.accommodations);
  const galleryById = new Map<string, string[]>(
    rows.map((row) => [row.accommodation_id, parseGalleryIds(row.accommodations!.gallery)])
  );
  const coverById = await resolveCoverUrls(supabase, galleryById);

  const items: AccommodationListItem[] = rows.map((row) => {
    const base = row.accommodations!;
    const cover = coverById.get(row.accommodation_id);
    return {
      id: row.accommodation_id,
      name: row.name ?? 'Untitled',
      slug: row.slug ?? '',
      status: base.status,
      country: base.country,
      region: base.region,
      propertyType: base.property_type,
      availability: base.availability,
      pricePerNight: base.price_per_night,
      imageUrl: cover?.url ?? null,
      imageAlt: cover?.alt ?? null,
      publishedAt: row.published_at,
      updatedAt: base.updated_at,
      trashed: base.deleted_at !== null
    };
  });

  const [counts, countries, propertyTypes] = await Promise.all([
    getStatusCounts(params),
    getCountryOptions(),
    getPropertyTypeOptions()
  ]);

  return {
    items,
    total: count ?? 0,
    page,
    pageSize: ACCOMMODATIONS_PAGE_SIZE,
    counts,
    countries,
    propertyTypes
  };
}

async function getStatusCounts(
  params: Pick<AccommodationListParams, 'search' | 'country' | 'propertyType' | 'availability'>
): Promise<AccommodationStatusCounts> {
  const supabase = (await createClient()) as unknown as SupabaseClient;

  async function countForStatus(status: AccommodationListParams['status']): Promise<number> {
    let query = supabase
      .from('accommodation_translations')
      .select('accommodation_id, accommodations!inner(id)', { count: 'exact', head: true })
      .eq('locale', 'en');

    if (status === 'trash') {
      query = query.not('accommodations.deleted_at', 'is', null);
    } else {
      query = query.is('accommodations.deleted_at', null);
      if (status === 'published') query = query.eq('accommodations.status', 'published');
      if (status === 'draft') query = query.eq('accommodations.status', 'draft');
    }

    if (params.search.trim()) {
      const term = `%${params.search.trim()}%`;
      query = query.or(`name.ilike.${term},slug.ilike.${term}`);
    }
    if (params.country) query = query.eq('accommodations.country', params.country);
    if (params.propertyType) query = query.eq('accommodations.property_type', params.propertyType);
    if (params.availability) query = query.eq('accommodations.availability', params.availability);

    const { count } = await query;
    return count ?? 0;
  }

  const [all, published, draft, trash] = await Promise.all([
    countForStatus('all'),
    countForStatus('published'),
    countForStatus('draft'),
    countForStatus('trash')
  ]);

  return { all, published, draft, trash };
}

async function getCountryOptions(): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase.from('accommodations').select('country').is('deleted_at', null);
  const set = new Set<string>();
  for (const row of data ?? []) if (row.country) set.add(row.country);
  return [...set].toSorted((a, b) => a.localeCompare(b));
}

async function getPropertyTypeOptions(): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('accommodations')
    .select('property_type')
    .is('deleted_at', null);
  const set = new Set<string>();
  for (const row of data ?? []) if (row.property_type) set.add(row.property_type);
  return [...set].toSorted((a, b) => a.localeCompare(b));
}

export async function trashAccommodations(ids: string[]): Promise<void> {
  if (!ids.length) return;
  await assertCanWrite();
  const supabase = await createClient();
  const { error } = await supabase
    .from('accommodations')
    .update({ deleted_at: new Date().toISOString(), status: 'trash' })
    .in('id', ids);
  if (error) throw new Error(error.message);
  revalidatePath('/portal/accommodations');
}

export async function restoreAccommodations(ids: string[]): Promise<void> {
  if (!ids.length) return;
  await assertCanWrite();
  const supabase = await createClient();

  const { data: translations } = await supabase
    .from('accommodation_translations')
    .select('accommodation_id, published_at')
    .eq('locale', 'en')
    .in('accommodation_id', ids);

  const publishedIds = new Set(
    (translations ?? []).filter((t) => t.published_at).map((t) => t.accommodation_id)
  );

  const toPublished = ids.filter((id) => publishedIds.has(id));
  const toDraft = ids.filter((id) => !publishedIds.has(id));

  if (toPublished.length) {
    const { error } = await supabase
      .from('accommodations')
      .update({ deleted_at: null, status: 'published' })
      .in('id', toPublished);
    if (error) throw new Error(error.message);
  }
  if (toDraft.length) {
    const { error } = await supabase
      .from('accommodations')
      .update({ deleted_at: null, status: 'draft' })
      .in('id', toDraft);
    if (error) throw new Error(error.message);
  }

  revalidatePath('/portal/accommodations');
}

export async function deleteAccommodationsPermanently(ids: string[]): Promise<void> {
  if (!ids.length) return;
  await assertCanWrite();
  const supabase = await createClient();

  await supabase.from('accommodation_translations').delete().in('accommodation_id', ids);
  const { error } = await supabase.from('accommodations').delete().in('id', ids);
  if (error) throw new Error(error.message);

  revalidatePath('/portal/accommodations');
}

export async function emptyAccommodationsTrash(): Promise<void> {
  await assertCanWrite();
  const supabase = await createClient();

  const { data } = await supabase.from('accommodations').select('id').not('deleted_at', 'is', null);
  const ids = (data ?? []).map((row) => row.id);
  await deleteAccommodationsPermanently(ids);
}
