'use server';

import { revalidatePath } from 'next/cache';
import type { SupabaseClient } from '@supabase/supabase-js';

import { requirePortalSession } from '@/lib/auth/portal';
import { createClient } from '@/lib/supabase/server';
import { packageFormSchema, type PackageFormValues } from './schema';

export type SaveStatus = 'draft' | 'published';

export interface RelationOption {
  value: string;
  label: string;
}

export interface PackageRecord extends PackageFormValues {
  id: string;
  status: string;
}

const WRITE_ROLES = new Set(['owner', 'admin', 'editor']);

async function assertCanWrite() {
  const session = await requirePortalSession();
  if (!WRITE_ROLES.has(session.role)) {
    throw new Error('You do not have permission to manage packages.');
  }
}

async function genericClient(): Promise<SupabaseClient> {
  return (await createClient()) as unknown as SupabaseClient;
}

export async function getPackageTourOptions(): Promise<RelationOption[]> {
  const supabase = await genericClient();
  const { data } = await supabase
    .from('tour_translations')
    .select('tour_id, title')
    .eq('locale', 'en')
    .order('title', { ascending: true });

  return (data ?? []).map((row) => ({
    value: row.tour_id as string,
    label: (row.title as string) ?? 'Untitled tour'
  }));
}

export async function savePackage(input: {
  id?: string;
  status: SaveStatus;
  values: PackageFormValues;
}): Promise<{ id: string }> {
  await assertCanWrite();

  const values = packageFormSchema.parse(input.values);
  const supabase = await genericClient();
  const now = new Date().toISOString();

  const basePayload = {
    status: input.status,
    package_group: values.packageGroup || null,
    comfort_tier: values.comfortTier,
    tour_id: values.tourId || null,
    updated_at: now
  };

  let packageId = input.id;
  if (packageId) {
    const { error } = await supabase.from('packages').update(basePayload).eq('id', packageId);
    if (error) throw new Error(error.message);
  } else {
    const { data, error } = await supabase
      .from('packages')
      .insert(basePayload)
      .select('id')
      .single();
    if (error) throw new Error(error.message);
    packageId = data.id as string;
  }

  const { data: existing } = await supabase
    .from('package_translations')
    .select('id, published_at')
    .eq('package_id', packageId)
    .eq('locale', 'en')
    .maybeSingle();

  const publishedAt = input.status === 'published' ? (existing?.published_at ?? now) : null;
  const translationPayload = {
    package_id: packageId,
    locale: 'en',
    slug: values.slug,
    title: values.title,
    excerpt: values.excerpt || null,
    content: values.content ? { html: values.content } : null,
    og_image_id: values.ogImageId || null,
    seo_title: values.seoTitle || values.title,
    seo_description: values.seoDescription || null,
    published_at: publishedAt
  };

  if (existing) {
    const { error } = await supabase
      .from('package_translations')
      .update(translationPayload)
      .eq('id', existing.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from('package_translations').insert(translationPayload);
    if (error) throw new Error(error.message);
  }

  revalidatePath('/portal/packages');
  revalidatePath('/en/safari-packages');
  return { id: packageId };
}

export async function getPackage(id: string): Promise<PackageRecord | null> {
  const supabase = await genericClient();
  const { data: base } = await supabase.from('packages').select('*').eq('id', id).maybeSingle();
  if (!base) return null;

  const { data: translation } = await supabase
    .from('package_translations')
    .select('*')
    .eq('package_id', id)
    .eq('locale', 'en')
    .maybeSingle();

  const content = (translation?.content as { html?: string; text?: string } | null) ?? null;

  return {
    id: base.id as string,
    status: base.status as string,
    title: translation?.title ?? '',
    slug: translation?.slug ?? '',
    excerpt: translation?.excerpt ?? '',
    content: content?.html ?? content?.text ?? '',
    tourId: base.tour_id ?? '',
    packageGroup: base.package_group ?? '',
    comfortTier:
      base.comfort_tier === 'budget' || base.comfort_tier === 'luxury'
        ? base.comfort_tier
        : 'mid_range',
    ogImageId: translation?.og_image_id ?? '',
    seoTitle: translation?.seo_title ?? '',
    seoDescription: translation?.seo_description ?? ''
  };
}

export async function deletePackage(id: string): Promise<void> {
  await assertCanWrite();
  const supabase = await genericClient();
  await supabase.from('package_translations').delete().eq('package_id', id);
  const { error } = await supabase.from('packages').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/portal/packages');
}
