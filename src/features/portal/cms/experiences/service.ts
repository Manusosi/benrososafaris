'use server';

import { revalidatePath, revalidateTag } from 'next/cache';

import { requirePortalSession } from '@/lib/auth/portal';
import { SUPPORTED_LOCALES } from '@/lib/i18n';
import { createClient } from '@/lib/supabase/server';
import { autoTranslateExperienceById } from '@/lib/i18n/auto-translate-content';
import { scheduleAutoTranslate } from '@/lib/i18n/schedule-auto-translate';
import { notifyPublishedContent } from '@/lib/seo/publish-notify';
import { experienceFormSchema, type ExperienceFormValues } from './schema';

export type SaveStatus = 'draft' | 'published';

export interface ExperienceRecord extends ExperienceFormValues {
  id: string;
  status: string;
}

/** Editors and super admins only. */
const WRITE_ROLES = new Set(['owner', 'admin', 'editor']);

async function assertCanWrite() {
  const session = await requirePortalSession();
  if (!WRITE_ROLES.has(session.role)) {
    throw new Error('You do not have permission to manage experiences.');
  }
  return session;
}

function revalidateExperiencePublicPaths() {
  revalidateTag('public-experiences', 'max');
  for (const locale of SUPPORTED_LOCALES) {
    revalidatePath(`/${locale}`);
    revalidatePath(`/${locale}/experiences`);
    revalidatePath(`/${locale}/tours`);
  }
}

/**
 * Creates or updates an experience and its English translation in one call.
 * Publishing stamps `published_at`; saving a draft clears it (unpublishes).
 */
export async function saveExperience(input: {
  id?: string;
  values: ExperienceFormValues;
  status: SaveStatus;
}): Promise<{ id: string }> {
  await assertCanWrite();

  const values = experienceFormSchema.parse(input.values);
  const supabase = await createClient();
  const now = new Date().toISOString();

  const basePayload = {
    category: values.category || null,
    countries: values.countries,
    menu_group: values.menuGroup,
    layout_variant: values.layoutVariant,
    highlights: values.highlights,
    package_pricing: values.packagePricing,
    gallery: values.gallery,
    status: input.status,
    updated_at: now
  };

  let experienceId = input.id;

  if (experienceId) {
    const { error } = await supabase.from('experiences').update(basePayload).eq('id', experienceId);
    if (error) throw new Error(error.message);
  } else {
    const { data, error } = await supabase
      .from('experiences')
      .insert(basePayload)
      .select('id')
      .single();
    if (error) throw new Error(error.message);
    experienceId = data.id;
  }

  const { data: existing } = await supabase
    .from('experience_translations')
    .select('id, published_at')
    .eq('experience_id', experienceId)
    .eq('locale', 'en')
    .maybeSingle();

  // Preserve the original publish timestamp on re-publish; clear it for drafts.
  const publishedAt = input.status === 'published' ? (existing?.published_at ?? now) : null;

  const translationPayload = {
    experience_id: experienceId,
    locale: 'en',
    slug: values.slug,
    title: values.title,
    summary: values.summary || null,
    // Rich text editor output is HTML; stored under `html` going forward.
    content: values.description ? { html: values.description } : null,
    faqs: values.faqs,
    seo_title: values.seoTitle || values.title,
    seo_description: values.seoDescription || null,
    focus_keyword: values.focusKeyword || null,
    keywords: values.keywords,
    published_at: publishedAt,
    updated_at: now
  };

  if (existing) {
    const { error } = await supabase
      .from('experience_translations')
      .update(translationPayload)
      .eq('id', existing.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from('experience_translations').insert(translationPayload);
    if (error) throw new Error(error.message);
  }

  revalidatePath('/portal/experiences');
  revalidateExperiencePublicPaths();
  if (input.status === 'published') {
    notifyPublishedContent({ pathPrefix: 'experiences', slug: values.slug });
    scheduleAutoTranslate(() => autoTranslateExperienceById(experienceId));
  }
  return { id: experienceId };
}

/** Loads an experience + its English translation as flat wizard values. */
export async function getExperience(id: string): Promise<ExperienceRecord | null> {
  const supabase = await createClient();

  const { data: base } = await supabase.from('experiences').select('*').eq('id', id).maybeSingle();
  if (!base) return null;

  const { data: translation } = await supabase
    .from('experience_translations')
    .select('*')
    .eq('experience_id', id)
    .eq('locale', 'en')
    .maybeSingle();

  const highlights = Array.isArray(base.highlights) ? (base.highlights as string[]) : [];
  const countries = Array.isArray(base.countries)
    ? (base.countries as ExperienceFormValues['countries'])
    : [];
  const packagePricing = Array.isArray(base.package_pricing)
    ? (base.package_pricing as ExperienceFormValues['packagePricing'])
    : [];
  const gallery = Array.isArray(base.gallery) ? (base.gallery as string[]) : [];
  // Newer records store HTML under `html`; older drafts used `text`.
  const content = (translation?.content as { html?: string; text?: string } | null) ?? null;
  const keywords = Array.isArray(translation?.keywords) ? (translation.keywords as string[]) : [];

  return {
    id: base.id,
    status: base.status,
    category: base.category ?? '',
    countries,
    menuGroup:
      base.menu_group === 'wildlife_safari' || base.menu_group === 'top_experiences'
        ? base.menu_group
        : 'top_experiences',
    layoutVariant:
      base.layout_variant === 'mountain' || base.layout_variant === 'safari'
        ? base.layout_variant
        : 'safari',
    highlights,
    packagePricing,
    gallery,
    title: translation?.title ?? '',
    slug: translation?.slug ?? '',
    summary: translation?.summary ?? '',
    description: content?.html ?? content?.text ?? '',
    faqs: Array.isArray(translation?.faqs)
      ? (translation.faqs as ExperienceFormValues['faqs'])
      : [],
    seoTitle: translation?.seo_title ?? '',
    seoDescription: translation?.seo_description ?? '',
    focusKeyword: translation?.focus_keyword ?? '',
    keywords
  };
}

/**
 * Distinct category values already in use, so the wizard combobox can offer
 * them for quick re-selection. Any newly created value persists on its
 * experience and therefore re-appears here on the next load.
 */
export async function getExperienceFacets(): Promise<{ categories: string[] }> {
  const supabase = await createClient();
  const { data } = await supabase.from('experiences').select('category');

  const categories = new Set<string>();
  for (const row of data ?? []) {
    if (row.category) categories.add(row.category);
  }

  return {
    categories: [...categories].toSorted((a, b) => a.localeCompare(b))
  };
}

export async function deleteExperience(id: string): Promise<void> {
  await assertCanWrite();
  const supabase = await createClient();

  // Remove translations first in case the FK is not declared ON DELETE CASCADE.
  await supabase.from('experience_translations').delete().eq('experience_id', id);
  const { error } = await supabase.from('experiences').delete().eq('id', id);
  if (error) throw new Error(error.message);

  revalidatePath('/portal/experiences');
  revalidateExperiencePublicPaths();
}
