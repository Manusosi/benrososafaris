'use server';

import { revalidatePath } from 'next/cache';

import { requirePortalSession } from '@/lib/auth/portal';
import { createClient } from '@/lib/supabase/server';
import { slugify } from '@/lib/utils';
import { articleFormSchema, type ArticleFormValues } from './schema';

export type SaveStatus = 'draft' | 'published';

export interface ArticleRecord extends ArticleFormValues {
  id: string;
  status: string;
}

export interface TaxonomyOption {
  id: string;
  name: string;
  slug: string;
}

export interface ArticleTaxonomies {
  categories: TaxonomyOption[];
  tags: TaxonomyOption[];
}

/** Editors and super admins only. */
const WRITE_ROLES = new Set(['owner', 'admin', 'editor']);

async function assertCanWrite() {
  const session = await requirePortalSession();
  if (!WRITE_ROLES.has(session.role)) {
    throw new Error('You do not have permission to manage articles.');
  }
  return session;
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value) ? (value as string[]) : [];
}

/**
 * Creates or updates an article: the base `blog_posts` row, its English
 * `blog_translations` row, and the category/tag join tables, in one call.
 * Publishing stamps `published_at`; saving a draft clears it (unpublishes).
 */
export async function saveArticle(input: {
  id?: string;
  values: ArticleFormValues;
  status: SaveStatus;
}): Promise<{ id: string }> {
  const session = await assertCanWrite();

  const values = articleFormSchema.parse(input.values);
  const supabase = await createClient();
  const now = new Date().toISOString();

  // The primary category must be one of the selected categories.
  const primaryCategoryId =
    values.primaryCategoryId && values.categoryIds.includes(values.primaryCategoryId)
      ? values.primaryCategoryId
      : (values.categoryIds[0] ?? null);

  let postId = input.id;

  if (postId) {
    const { error } = await supabase
      .from('blog_posts')
      .update({
        status: input.status,
        featured: values.featured,
        primary_category_id: primaryCategoryId,
        updated_at: now
      })
      .eq('id', postId);
    if (error) throw new Error(error.message);
  } else {
    const { data, error } = await supabase
      .from('blog_posts')
      .insert({
        status: input.status,
        featured: values.featured,
        primary_category_id: primaryCategoryId,
        author_id: session.userId,
        updated_at: now
      })
      .select('id')
      .single();
    if (error) throw new Error(error.message);
    postId = data.id;
  }

  const { data: existing } = await supabase
    .from('blog_translations')
    .select('id, published_at')
    .eq('post_id', postId)
    .eq('locale', 'en')
    .maybeSingle();

  // Preserve the original publish timestamp on re-publish; clear it for drafts.
  const publishedAt = input.status === 'published' ? (existing?.published_at ?? now) : null;

  const translationPayload = {
    post_id: postId,
    locale: 'en',
    slug: values.slug,
    title: values.title,
    excerpt: values.excerpt || null,
    content: values.content ? { html: values.content } : null,
    og_image_id: values.featuredImage || null,
    featured_image_caption: values.featuredImageCaption || null,
    seo_title: values.seoTitle || values.title,
    seo_description: values.seoDescription || null,
    focus_keyword: values.focusKeyword || null,
    keywords: values.keywords,
    published_at: publishedAt,
    updated_at: now
  };

  if (existing) {
    const { error } = await supabase
      .from('blog_translations')
      .update(translationPayload)
      .eq('id', existing.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from('blog_translations').insert(translationPayload);
    if (error) throw new Error(error.message);
  }

  // Sync category + tag join tables (replace the full set each save).
  await syncJoin(supabase, 'blog_post_categories', 'category_id', postId, values.categoryIds);
  await syncJoin(supabase, 'blog_post_tags', 'tag_id', postId, values.tagIds);

  // Keep the main publish timestamp on the base row in sync for ordering.
  await supabase.from('blog_posts').update({ published_at: publishedAt }).eq('id', postId);

  revalidatePath('/portal/blog');
  return { id: postId };
}

async function syncJoin(
  supabase: Awaited<ReturnType<typeof createClient>>,
  table: 'blog_post_categories' | 'blog_post_tags',
  column: 'category_id' | 'tag_id',
  postId: string,
  ids: string[]
): Promise<void> {
  await supabase.from(table).delete().eq('post_id', postId);
  const unique = [...new Set(ids.filter(Boolean))];
  if (!unique.length) return;
  // The dynamic join column key produces an index-signature shape the typed
  // insert rejects; the rows are well-formed, so insert via the untyped surface.
  const rows = unique.map((id) => ({ post_id: postId, [column]: id }));
  const { error } = await supabase.from(table).insert(rows as never);
  if (error) throw new Error(error.message);
}

/** Loads an article + its English translation + taxonomy ids as flat editor values. */
export async function getArticle(id: string): Promise<ArticleRecord | null> {
  const supabase = await createClient();

  const { data: base } = await supabase.from('blog_posts').select('*').eq('id', id).maybeSingle();
  if (!base) return null;

  const { data: translation } = await supabase
    .from('blog_translations')
    .select('*')
    .eq('post_id', id)
    .eq('locale', 'en')
    .maybeSingle();

  const [{ data: categoryRows }, { data: tagRows }] = await Promise.all([
    supabase.from('blog_post_categories').select('category_id').eq('post_id', id),
    supabase.from('blog_post_tags').select('tag_id').eq('post_id', id)
  ]);

  const content = (translation?.content as { html?: string; text?: string } | null) ?? null;
  const keywords = toStringArray(translation?.keywords);

  return {
    id: base.id,
    status: base.status,
    featured: base.featured,
    featuredImage: translation?.og_image_id ?? '',
    featuredImageCaption: translation?.featured_image_caption ?? '',
    categoryIds: (categoryRows ?? []).map((row) => row.category_id),
    primaryCategoryId: base.primary_category_id ?? '',
    tagIds: (tagRows ?? []).map((row) => row.tag_id),
    title: translation?.title ?? '',
    slug: translation?.slug ?? '',
    excerpt: translation?.excerpt ?? '',
    content: content?.html ?? content?.text ?? '',
    seoTitle: translation?.seo_title ?? '',
    seoDescription: translation?.seo_description ?? '',
    focusKeyword: translation?.focus_keyword ?? '',
    keywords
  };
}

/** All categories and tags, for the editor sidebar selectors. */
export async function getArticleTaxonomies(): Promise<ArticleTaxonomies> {
  const supabase = await createClient();
  const [{ data: categories }, { data: tags }] = await Promise.all([
    supabase.from('blog_categories').select('id, name, slug').order('name'),
    supabase.from('blog_tags').select('id, name, slug').order('name')
  ]);

  return {
    categories: (categories ?? []).map((row) => ({ id: row.id, name: row.name, slug: row.slug })),
    tags: (tags ?? []).map((row) => ({ id: row.id, name: row.name, slug: row.slug }))
  };
}

/** Inline-creates a new category from the editor, returning the persisted row. */
export async function createBlogCategory(name: string): Promise<TaxonomyOption> {
  await assertCanWrite();
  const trimmed = name.trim();
  if (trimmed.length < 2) throw new Error('Category name must be at least 2 characters.');

  const supabase = await createClient();
  const slug = slugify(trimmed);

  const { data, error } = await supabase
    .from('blog_categories')
    .insert({ name: trimmed, slug })
    .select('id, name, slug')
    .single();
  if (error) throw new Error(error.message);

  revalidatePath('/portal/blog');
  return { id: data.id, name: data.name, slug: data.slug };
}

/** Inline-creates a new tag from the editor, returning the persisted row. */
export async function createBlogTag(name: string): Promise<TaxonomyOption> {
  await assertCanWrite();
  const trimmed = name.trim();
  if (trimmed.length < 2) throw new Error('Tag name must be at least 2 characters.');

  const supabase = await createClient();
  const slug = slugify(trimmed);

  const { data, error } = await supabase
    .from('blog_tags')
    .insert({ name: trimmed, slug })
    .select('id, name, slug')
    .single();
  if (error) throw new Error(error.message);

  revalidatePath('/portal/blog');
  return { id: data.id, name: data.name, slug: data.slug };
}
