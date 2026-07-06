'use server';

import { revalidatePath } from 'next/cache';

import { requirePortalSession } from '@/lib/auth/portal';
import { createClient } from '@/lib/supabase/server';
import { normalizeDirectAnswers } from '@/lib/seo/direct-answers';
import { notifyPublishedContent } from '@/lib/seo/publish-notify';
import { destinationFormSchema, type DestinationFormValues } from './schema';

export type SaveStatus = 'draft' | 'published';

export interface DestinationRecord extends DestinationFormValues {
  id: string;
  status: string;
}

/** Editors and super admins only. */
const WRITE_ROLES = new Set(['owner', 'admin', 'editor']);

async function assertCanWrite() {
  const session = await requirePortalSession();
  if (!WRITE_ROLES.has(session.role)) {
    throw new Error('You do not have permission to manage destinations.');
  }
  return session;
}

/**
 * Creates or updates a destination and its English translation in one call.
 * Publishing stamps `published_at`; saving a draft clears it (unpublishes).
 */
export async function saveDestination(input: {
  id?: string;
  values: DestinationFormValues;
  status: SaveStatus;
}): Promise<{ id: string }> {
  await assertCanWrite();

  const values = destinationFormSchema.parse(input.values);
  const supabase = await createClient();
  const now = new Date().toISOString();

  const basePayload = {
    country: values.country,
    region: values.region || null,
    best_time: { summary: values.bestTimeSummary || '' },
    wildlife: values.wildlife,
    gallery: values.gallery,
    status: input.status,
    updated_at: now
  };

  let destinationId = input.id;

  if (destinationId) {
    const { error } = await supabase
      .from('destinations')
      .update(basePayload)
      .eq('id', destinationId);
    if (error) throw new Error(error.message);
  } else {
    const { data, error } = await supabase
      .from('destinations')
      .insert(basePayload)
      .select('id')
      .single();
    if (error) throw new Error(error.message);
    destinationId = data.id;
  }

  const { data: existing } = await supabase
    .from('destination_translations')
    .select('id, published_at')
    .eq('destination_id', destinationId)
    .eq('locale', 'en')
    .maybeSingle();

  // Preserve the original publish timestamp on re-publish; clear it for drafts.
  const publishedAt = input.status === 'published' ? (existing?.published_at ?? now) : null;

  const translationPayload = {
    destination_id: destinationId,
    locale: 'en',
    slug: values.slug,
    name: values.name,
    summary: values.summary || null,
    // Rich text editor output is HTML; stored under `html` going forward.
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
      .from('destination_translations')
      .update(translationPayload)
      .eq('id', existing.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from('destination_translations').insert(translationPayload);
    if (error) throw new Error(error.message);
  }

  revalidatePath('/portal/destinations');
  if (input.status === 'published') {
    notifyPublishedContent({ pathPrefix: 'destinations', slug: values.slug });
  }
  return { id: destinationId };
}

/** Loads a destination + its English translation as flat wizard values. */
export async function getDestination(id: string): Promise<DestinationRecord | null> {
  const supabase = await createClient();

  const { data: base } = await supabase.from('destinations').select('*').eq('id', id).maybeSingle();
  if (!base) return null;

  const { data: translation } = await supabase
    .from('destination_translations')
    .select('*')
    .eq('destination_id', id)
    .eq('locale', 'en')
    .maybeSingle();

  const bestTime = (base.best_time as { summary?: string } | null) ?? null;
  const wildlife = Array.isArray(base.wildlife) ? (base.wildlife as string[]) : [];
  const gallery = Array.isArray(base.gallery) ? (base.gallery as string[]) : [];
  // Newer records store HTML under `html`; older drafts used `text`.
  const description = (translation?.description as { html?: string; text?: string } | null) ?? null;
  const keywords = Array.isArray(translation?.keywords) ? (translation.keywords as string[]) : [];
  const faqs = normalizeDirectAnswers(translation?.faqs);

  return {
    id: base.id,
    status: base.status,
    country: base.country ?? '',
    region: base.region ?? '',
    bestTimeSummary: bestTime?.summary ?? '',
    wildlife,
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
 * Distinct country and region values already in use, so the wizard comboboxes
 * can offer them for quick re-selection. Any newly created value persists on
 * its destination and therefore re-appears here on the next load.
 */
export async function getDestinationFacets(): Promise<{
  countries: string[];
  regions: string[];
}> {
  const supabase = await createClient();
  const { data } = await supabase.from('destinations').select('country, region');

  const countries = new Set<string>();
  const regions = new Set<string>();
  for (const row of data ?? []) {
    if (row.country) countries.add(row.country);
    if (row.region) regions.add(row.region);
  }

  return {
    countries: [...countries].toSorted((a, b) => a.localeCompare(b)),
    regions: [...regions].toSorted((a, b) => a.localeCompare(b))
  };
}

export async function deleteDestination(id: string): Promise<void> {
  await assertCanWrite();
  const supabase = await createClient();

  // Remove translations first in case the FK is not declared ON DELETE CASCADE.
  await supabase.from('destination_translations').delete().eq('destination_id', id);
  const { error } = await supabase.from('destinations').delete().eq('id', id);
  if (error) throw new Error(error.message);

  revalidatePath('/portal/destinations');
}
