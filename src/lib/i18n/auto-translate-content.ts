import type { SupabaseClient } from '@supabase/supabase-js';

import {
  getAutoTranslateLocales,
  isAutoTranslateEnabled,
  shouldAutoPublishTranslations
} from '@/lib/i18n/auto-translate-config';
import { translateHtml, translateText } from '@/lib/i18n/google-translate';
import {
  parseRichTextHtml,
  translateDirectAnswers,
  translateKeywords
} from '@/lib/i18n/translate-json-fields';
import { createServiceRoleClient } from '@/lib/supabase/service-role';

type GenericClient = SupabaseClient;

function publishedAtForTarget(sourcePublishedAt: string | null): string | null {
  if (!sourcePublishedAt) return null;
  return shouldAutoPublishTranslations() ? sourcePublishedAt : null;
}

async function upsertRow(
  supabase: GenericClient,
  table: string,
  match: Record<string, string>,
  payload: Record<string, unknown>
): Promise<void> {
  let query = supabase.from(table).select('id');
  for (const [key, value] of Object.entries(match)) {
    query = query.eq(key, value);
  }

  const { data: existing } = await query.maybeSingle();
  if (existing?.id) {
    const { error } = await supabase.from(table).update(payload).eq('id', existing.id);
    if (error) throw new Error(error.message);
    return;
  }

  const { error } = await supabase.from(table).insert({ ...match, ...payload });
  if (error) throw new Error(error.message);
}

async function translateBlogRow(
  supabase: GenericClient,
  row: Record<string, unknown>,
  locale: string,
  now: string
): Promise<void> {
  const postId = String(row.post_id);
  const slug = String(row.slug);
  const title = String(row.title);
  const contentHtml = parseRichTextHtml(row.content);

  const [
    translatedTitle,
    excerpt,
    body,
    seoTitle,
    seoDescription,
    focusKeyword,
    keywords,
    caption
  ] = await Promise.all([
    translateText(title, locale),
    row.excerpt ? translateText(String(row.excerpt), locale) : Promise.resolve(null),
    contentHtml ? translateHtml(contentHtml, locale) : Promise.resolve(''),
    row.seo_title ? translateText(String(row.seo_title), locale) : Promise.resolve(null),
    row.seo_description
      ? translateText(String(row.seo_description), locale)
      : Promise.resolve(null),
    row.focus_keyword ? translateText(String(row.focus_keyword), locale) : Promise.resolve(null),
    translateKeywords(row.keywords, locale),
    row.featured_image_caption
      ? translateText(String(row.featured_image_caption), locale)
      : Promise.resolve(null)
  ]);

  await upsertRow(
    supabase,
    'blog_translations',
    { post_id: postId, locale },
    {
      slug,
      title: translatedTitle,
      excerpt,
      content: body ? { html: body } : null,
      seo_title: seoTitle || translatedTitle,
      seo_description: seoDescription,
      focus_keyword: focusKeyword,
      keywords,
      featured_image_caption: caption,
      og_image_id: row.og_image_id ?? null,
      published_at: publishedAtForTarget((row.published_at as string | null) ?? null),
      updated_at: now
    }
  );
}

async function translateTourRow(
  supabase: GenericClient,
  row: Record<string, unknown>,
  locale: string,
  now: string
): Promise<void> {
  const tourId = String(row.tour_id);
  const slug = String(row.slug);
  const title = String(row.title);
  const overviewHtml = parseRichTextHtml(row.overview);

  const [translatedTitle, excerpt, overview, seoTitle, seoDescription, faqs] = await Promise.all([
    translateText(title, locale),
    row.excerpt ? translateText(String(row.excerpt), locale) : Promise.resolve(null),
    overviewHtml ? translateHtml(overviewHtml, locale) : Promise.resolve(''),
    row.seo_title ? translateText(String(row.seo_title), locale) : Promise.resolve(null),
    row.seo_description
      ? translateText(String(row.seo_description), locale)
      : Promise.resolve(null),
    translateDirectAnswers(row.faqs, locale)
  ]);

  await upsertRow(
    supabase,
    'tour_translations',
    { tour_id: tourId, locale },
    {
      slug,
      title: translatedTitle,
      excerpt,
      overview: overview ? { html: overview } : null,
      seo_title: seoTitle || translatedTitle,
      seo_description: seoDescription,
      faqs,
      og_image_id: row.og_image_id ?? null,
      published_at: publishedAtForTarget((row.published_at as string | null) ?? null),
      updated_at: now
    }
  );
}

async function translateDestinationRow(
  supabase: GenericClient,
  row: Record<string, unknown>,
  locale: string,
  now: string
): Promise<void> {
  const destinationId = String(row.destination_id);
  const slug = String(row.slug);
  const name = String(row.name);
  const descriptionHtml = parseRichTextHtml(row.description);

  const [
    translatedName,
    summary,
    description,
    seoTitle,
    seoDescription,
    focusKeyword,
    keywords,
    faqs
  ] = await Promise.all([
    translateText(name, locale),
    row.summary ? translateText(String(row.summary), locale) : Promise.resolve(null),
    descriptionHtml ? translateHtml(descriptionHtml, locale) : Promise.resolve(''),
    row.seo_title ? translateText(String(row.seo_title), locale) : Promise.resolve(null),
    row.seo_description
      ? translateText(String(row.seo_description), locale)
      : Promise.resolve(null),
    row.focus_keyword ? translateText(String(row.focus_keyword), locale) : Promise.resolve(null),
    translateKeywords(row.keywords, locale),
    translateDirectAnswers(row.faqs, locale)
  ]);

  await upsertRow(
    supabase,
    'destination_translations',
    { destination_id: destinationId, locale },
    {
      slug,
      name: translatedName,
      summary,
      description: description ? { html: description } : null,
      seo_title: seoTitle || translatedName,
      seo_description: seoDescription,
      focus_keyword: focusKeyword,
      keywords,
      faqs,
      published_at: publishedAtForTarget((row.published_at as string | null) ?? null),
      updated_at: now
    }
  );
}

async function translateExperienceRow(
  supabase: GenericClient,
  row: Record<string, unknown>,
  locale: string,
  now: string
): Promise<void> {
  const experienceId = String(row.experience_id);
  const slug = String(row.slug);
  const title = String(row.title);
  const contentHtml = parseRichTextHtml(row.content);

  const [
    translatedTitle,
    summary,
    content,
    seoTitle,
    seoDescription,
    focusKeyword,
    keywords,
    faqs
  ] = await Promise.all([
    translateText(title, locale),
    row.summary ? translateText(String(row.summary), locale) : Promise.resolve(null),
    contentHtml ? translateHtml(contentHtml, locale) : Promise.resolve(''),
    row.seo_title ? translateText(String(row.seo_title), locale) : Promise.resolve(null),
    row.seo_description
      ? translateText(String(row.seo_description), locale)
      : Promise.resolve(null),
    row.focus_keyword ? translateText(String(row.focus_keyword), locale) : Promise.resolve(null),
    translateKeywords(row.keywords, locale),
    translateDirectAnswers(row.faqs, locale)
  ]);

  await upsertRow(
    supabase,
    'experience_translations',
    { experience_id: experienceId, locale },
    {
      slug,
      title: translatedTitle,
      summary,
      content: content ? { html: content } : null,
      seo_title: seoTitle || translatedTitle,
      seo_description: seoDescription,
      focus_keyword: focusKeyword,
      keywords,
      faqs,
      og_image_id: row.og_image_id ?? null,
      published_at: publishedAtForTarget((row.published_at as string | null) ?? null),
      updated_at: now
    }
  );
}

async function translatePackageRow(
  supabase: GenericClient,
  row: Record<string, unknown>,
  locale: string,
  now: string
): Promise<void> {
  const packageId = String(row.package_id);
  const slug = String(row.slug);
  const title = String(row.title);
  const contentHtml = parseRichTextHtml(row.content);

  const [translatedTitle, excerpt, content, seoTitle, seoDescription, faqs] = await Promise.all([
    translateText(title, locale),
    row.excerpt ? translateText(String(row.excerpt), locale) : Promise.resolve(null),
    contentHtml ? translateHtml(contentHtml, locale) : Promise.resolve(''),
    row.seo_title ? translateText(String(row.seo_title), locale) : Promise.resolve(null),
    row.seo_description
      ? translateText(String(row.seo_description), locale)
      : Promise.resolve(null),
    translateDirectAnswers(row.faqs, locale)
  ]);

  await upsertRow(
    supabase,
    'package_translations',
    { package_id: packageId, locale },
    {
      slug,
      title: translatedTitle,
      excerpt,
      content: content ? { html: content } : null,
      seo_title: seoTitle || translatedTitle,
      seo_description: seoDescription,
      faqs,
      og_image_id: row.og_image_id ?? null,
      published_at: publishedAtForTarget((row.published_at as string | null) ?? null)
    }
  );
}

async function translateAccommodationRow(
  supabase: GenericClient,
  row: Record<string, unknown>,
  locale: string,
  now: string
): Promise<void> {
  const accommodationId = String(row.accommodation_id);
  const slug = String(row.slug);
  const name = String(row.name);
  const descriptionHtml = parseRichTextHtml(row.description);

  const [
    translatedName,
    summary,
    description,
    seoTitle,
    seoDescription,
    focusKeyword,
    keywords,
    faqs
  ] = await Promise.all([
    translateText(name, locale),
    row.summary ? translateText(String(row.summary), locale) : Promise.resolve(null),
    descriptionHtml ? translateHtml(descriptionHtml, locale) : Promise.resolve(''),
    row.seo_title ? translateText(String(row.seo_title), locale) : Promise.resolve(null),
    row.seo_description
      ? translateText(String(row.seo_description), locale)
      : Promise.resolve(null),
    row.focus_keyword ? translateText(String(row.focus_keyword), locale) : Promise.resolve(null),
    translateKeywords(row.keywords, locale),
    translateDirectAnswers(row.faqs, locale)
  ]);

  await upsertRow(
    supabase,
    'accommodation_translations',
    { accommodation_id: accommodationId, locale },
    {
      slug,
      name: translatedName,
      summary,
      description: description ? { html: description } : null,
      seo_title: seoTitle || translatedName,
      seo_description: seoDescription,
      focus_keyword: focusKeyword,
      keywords,
      faqs,
      og_image_id: row.og_image_id ?? null,
      published_at: publishedAtForTarget((row.published_at as string | null) ?? null),
      updated_at: now
    }
  );
}

async function translateNationalParkRow(
  supabase: GenericClient,
  row: Record<string, unknown>,
  locale: string,
  now: string
): Promise<void> {
  const parkId = String(row.park_id);
  const slug = String(row.slug);
  const name = String(row.name);
  const descriptionHtml = parseRichTextHtml(row.description);

  const [translatedName, summary, description, seoTitle, seoDescription, faqs] = await Promise.all([
    translateText(name, locale),
    row.summary ? translateText(String(row.summary), locale) : Promise.resolve(null),
    descriptionHtml ? translateHtml(descriptionHtml, locale) : Promise.resolve(''),
    row.seo_title ? translateText(String(row.seo_title), locale) : Promise.resolve(null),
    row.seo_description
      ? translateText(String(row.seo_description), locale)
      : Promise.resolve(null),
    translateDirectAnswers(row.faqs, locale)
  ]);

  await upsertRow(
    supabase,
    'national_park_translations',
    { park_id: parkId, locale },
    {
      slug,
      name: translatedName,
      summary,
      description: description ? { html: description } : null,
      seo_title: seoTitle || translatedName,
      seo_description: seoDescription,
      faqs,
      og_image_id: row.og_image_id ?? null,
      published_at: publishedAtForTarget((row.published_at as string | null) ?? null),
      updated_at: now
    }
  );
}

async function translateEnglishRows(
  supabase: GenericClient,
  table: string,
  rows: Record<string, unknown>[],
  locale: string,
  handler: (
    client: GenericClient,
    row: Record<string, unknown>,
    targetLocale: string,
    now: string
  ) => Promise<void>
): Promise<number> {
  const now = new Date().toISOString();
  let count = 0;

  for (const row of rows) {
    await handler(supabase, row, locale, now);
    count += 1;
  }

  return count;
}

export interface BackfillTranslationResult {
  blog: number;
  tours: number;
  destinations: number;
  experiences: number;
  packages: number;
  accommodations: number;
  nationalParks: number;
}

export async function backfillPublishedTranslations(): Promise<BackfillTranslationResult> {
  if (!isAutoTranslateEnabled()) {
    throw new Error(
      'Auto-translation is disabled. Set AUTO_TRANSLATE_ENABLED=true and GOOGLE_TRANSLATE_API_KEY.'
    );
  }

  const supabase = createServiceRoleClient() as unknown as GenericClient;
  const locales = getAutoTranslateLocales();
  const result: BackfillTranslationResult = {
    blog: 0,
    tours: 0,
    destinations: 0,
    experiences: 0,
    packages: 0,
    accommodations: 0,
    nationalParks: 0
  };

  const [
    { data: blogRows },
    { data: tourRows },
    { data: destinationRows },
    { data: experienceRows },
    { data: packageRows },
    { data: accommodationRows },
    { data: parkRows }
  ] = await Promise.all([
    supabase
      .from('blog_translations')
      .select('*')
      .eq('locale', 'en')
      .not('published_at', 'is', null),
    supabase
      .from('tour_translations')
      .select('*')
      .eq('locale', 'en')
      .not('published_at', 'is', null),
    supabase
      .from('destination_translations')
      .select('*')
      .eq('locale', 'en')
      .not('published_at', 'is', null),
    supabase
      .from('experience_translations')
      .select('*')
      .eq('locale', 'en')
      .not('published_at', 'is', null),
    supabase
      .from('package_translations')
      .select('*')
      .eq('locale', 'en')
      .not('published_at', 'is', null),
    supabase
      .from('accommodation_translations')
      .select('*')
      .eq('locale', 'en')
      .not('published_at', 'is', null),
    supabase
      .from('national_park_translations')
      .select('*')
      .eq('locale', 'en')
      .not('published_at', 'is', null)
  ]);

  for (const locale of locales) {
    result.blog += await translateEnglishRows(
      supabase,
      'blog_translations',
      (blogRows ?? []) as Record<string, unknown>[],
      locale,
      translateBlogRow
    );
    result.tours += await translateEnglishRows(
      supabase,
      'tour_translations',
      (tourRows ?? []) as Record<string, unknown>[],
      locale,
      translateTourRow
    );
    result.destinations += await translateEnglishRows(
      supabase,
      'destination_translations',
      (destinationRows ?? []) as Record<string, unknown>[],
      locale,
      translateDestinationRow
    );
    result.experiences += await translateEnglishRows(
      supabase,
      'experience_translations',
      (experienceRows ?? []) as Record<string, unknown>[],
      locale,
      translateExperienceRow
    );
    result.packages += await translateEnglishRows(
      supabase,
      'package_translations',
      (packageRows ?? []) as Record<string, unknown>[],
      locale,
      translatePackageRow
    );
    result.accommodations += await translateEnglishRows(
      supabase,
      'accommodation_translations',
      (accommodationRows ?? []) as Record<string, unknown>[],
      locale,
      translateAccommodationRow
    );
    result.nationalParks += await translateEnglishRows(
      supabase,
      'national_park_translations',
      (parkRows ?? []) as Record<string, unknown>[],
      locale,
      translateNationalParkRow
    );
  }

  return result;
}

export async function autoTranslateBlogPostById(postId: string): Promise<void> {
  if (!isAutoTranslateEnabled()) return;

  const supabase = createServiceRoleClient();
  const { data: row } = await supabase
    .from('blog_translations')
    .select('*')
    .eq('post_id', postId)
    .eq('locale', 'en')
    .maybeSingle();

  if (!row?.published_at) return;

  const client = supabase as unknown as GenericClient;
  const locales = getAutoTranslateLocales();

  for (const locale of locales) {
    await translateBlogRow(
      client,
      row as Record<string, unknown>,
      locale,
      new Date().toISOString()
    );
  }
}

async function translateByEnglishParentRow(
  table: string,
  parentKey: string,
  parentId: string,
  handler: (
    client: GenericClient,
    row: Record<string, unknown>,
    locale: string,
    now: string
  ) => Promise<void>
): Promise<void> {
  if (!isAutoTranslateEnabled()) return;

  const supabase = createServiceRoleClient() as unknown as GenericClient;
  const { data: row } = await supabase
    .from(table)
    .select('*')
    .eq(parentKey, parentId)
    .eq('locale', 'en')
    .maybeSingle();

  if (!row?.published_at) return;

  const client = supabase as unknown as GenericClient;
  const locales = getAutoTranslateLocales();
  const now = new Date().toISOString();

  for (const locale of locales) {
    await handler(client, row as Record<string, unknown>, locale, now);
  }
}

export function autoTranslateTourById(tourId: string): Promise<void> {
  return translateByEnglishParentRow('tour_translations', 'tour_id', tourId, translateTourRow);
}

export function autoTranslateDestinationById(destinationId: string): Promise<void> {
  return translateByEnglishParentRow(
    'destination_translations',
    'destination_id',
    destinationId,
    translateDestinationRow
  );
}

export function autoTranslateExperienceById(experienceId: string): Promise<void> {
  return translateByEnglishParentRow(
    'experience_translations',
    'experience_id',
    experienceId,
    translateExperienceRow
  );
}

export function autoTranslatePackageById(packageId: string): Promise<void> {
  return translateByEnglishParentRow(
    'package_translations',
    'package_id',
    packageId,
    translatePackageRow
  );
}

export function autoTranslateAccommodationById(accommodationId: string): Promise<void> {
  return translateByEnglishParentRow(
    'accommodation_translations',
    'accommodation_id',
    accommodationId,
    translateAccommodationRow
  );
}

export function autoTranslateNationalParkById(parkId: string): Promise<void> {
  return translateByEnglishParentRow(
    'national_park_translations',
    'park_id',
    parkId,
    translateNationalParkRow
  );
}
