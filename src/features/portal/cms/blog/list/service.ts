'use server';

import { revalidatePath } from 'next/cache';

import type { SupabaseClient } from '@supabase/supabase-js';

import { requirePortalSession } from '@/lib/auth/portal';
import { createClient } from '@/lib/supabase/server';
import { analyzeSeo } from '../../seo/analyze';
import {
  ARTICLES_PAGE_SIZE,
  type ArticleCategoryOption,
  type ArticleListItem,
  type ArticleListParams,
  type ArticleListResult,
  type ArticleQuickEditInput,
  type ArticleStatusCounts
} from './types';

/** Editors and super admins only. */
const WRITE_ROLES = new Set(['owner', 'admin', 'editor']);

async function assertCanWrite() {
  const session = await requirePortalSession();
  if (!WRITE_ROLES.has(session.role)) {
    throw new Error('You do not have permission to manage articles.');
  }
}

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Server-safe HTML → plain text (the editor's `htmlToText` lives in a client module). */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Extracts the stored rich-text body as plain text for SEO scoring. */
function contentToText(content: unknown): string {
  const value = (content as { html?: string; text?: string } | null) ?? null;
  if (!value) return '';
  return stripHtml(value.html ?? value.text ?? '');
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value) ? (value as string[]) : [];
}

/** `YYYY-MM` → ISO range [start, nextMonthStart). */
function monthRange(month: string): { start: string; end: string } | null {
  const match = /^(\d{4})-(\d{2})$/.exec(month);
  if (!match) return null;
  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const start = new Date(Date.UTC(year, monthIndex, 1));
  const end = new Date(Date.UTC(year, monthIndex + 1, 1));
  return { start: start.toISOString(), end: end.toISOString() };
}

function monthLabel(value: string): string {
  const range = monthRange(value);
  if (!range) return value;
  return new Date(range.start).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  });
}

/**
 * Paginated, filtered articles list for the WordPress-style admin table.
 *
 * Reads from `blog_translations` (which holds the title/slug/publish date and
 * the SEO fields) with an inner join to the base `blog_posts` row so we can
 * filter by status, category, and trash state in one query. The primary
 * category name is embedded for the table column. Each row's SEO score is
 * computed in-process with the shared `analyzeSeo` engine.
 */
export async function listArticles(params: ArticleListParams): Promise<ArticleListResult> {
  // The list filters on embedded-resource paths (e.g. `blog_posts.status`),
  // which the typed client's column-key signatures reject. Use the untyped
  // surface for this query only.
  const supabase = (await createClient()) as unknown as SupabaseClient;
  const page = Math.max(1, params.page);
  const from = (page - 1) * ARTICLES_PAGE_SIZE;
  const to = from + ARTICLES_PAGE_SIZE - 1;

  let query = supabase
    .from('blog_translations')
    .select(
      'post_id, title, slug, excerpt, seo_title, seo_description, focus_keyword, keywords, content, og_image_id, published_at, blog_posts!inner(id, status, deleted_at, updated_at, featured, primary_category_id, primary_category:blog_categories!blog_posts_primary_category_id_fkey(id, name))',
      { count: 'exact' }
    )
    .eq('locale', 'en');

  // Status / trash view.
  if (params.status === 'trash') {
    query = query.not('blog_posts.deleted_at', 'is', null);
  } else {
    query = query.is('blog_posts.deleted_at', null);
    if (params.status === 'published') query = query.eq('blog_posts.status', 'published');
    if (params.status === 'draft') query = query.eq('blog_posts.status', 'draft');
  }

  if (params.search.trim()) {
    const term = `%${params.search.trim()}%`;
    query = query.or(`title.ilike.${term},slug.ilike.${term}`);
  }
  if (params.category) query = query.eq('blog_posts.primary_category_id', params.category);

  const range = monthRange(params.month);
  if (range) query = query.gte('published_at', range.start).lt('published_at', range.end);

  query = query
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('title', { ascending: true })
    .range(from, to);

  const { data, count } = await query;

  type Row = {
    post_id: string;
    title: string | null;
    slug: string | null;
    excerpt: string | null;
    seo_title: string | null;
    seo_description: string | null;
    focus_keyword: string | null;
    keywords: unknown;
    content: unknown;
    og_image_id: string | null;
    published_at: string | null;
    blog_posts: {
      id: string;
      status: string;
      deleted_at: string | null;
      updated_at: string;
      featured: boolean;
      primary_category_id: string | null;
      primary_category: { id: string; name: string } | null;
    } | null;
  };

  const items: ArticleListItem[] = ((data as Row[] | null) ?? [])
    .filter((row) => row.blog_posts)
    .map((row) => {
      const post = row.blog_posts!;
      const title = row.title ?? 'Untitled';
      const keywords = toStringArray(row.keywords);
      const seo = analyzeSeo({
        title: row.seo_title || title,
        metaDescription: row.seo_description ?? '',
        slug: row.slug ?? '',
        focusKeyword: row.focus_keyword ?? '',
        keywords,
        body: `${row.excerpt ?? ''} ${contentToText(row.content)}`,
        imageCount: row.og_image_id ? 1 : 0,
        imagesWithAlt: row.og_image_id ? 1 : 0
      });

      return {
        id: row.post_id,
        title,
        slug: row.slug ?? '',
        status: post.status,
        category: post.primary_category?.name ?? null,
        categoryId: post.primary_category_id,
        focusKeyword: row.focus_keyword,
        seoScore: seo.score,
        publishedAt: row.published_at,
        updatedAt: post.updated_at,
        trashed: post.deleted_at !== null
      };
    });

  const [counts, categories, months] = await Promise.all([
    getStatusCounts(),
    getCategoryOptions(),
    getMonthOptions()
  ]);

  return {
    items,
    total: count ?? 0,
    page,
    pageSize: ARTICLES_PAGE_SIZE,
    counts,
    categories,
    months
  };
}

async function getStatusCounts(): Promise<ArticleStatusCounts> {
  const supabase = await createClient();
  const head = () => supabase.from('blog_posts').select('id', { count: 'exact', head: true });

  const [all, published, draft, trash] = await Promise.all([
    head().is('deleted_at', null),
    head().is('deleted_at', null).eq('status', 'published'),
    head().is('deleted_at', null).eq('status', 'draft'),
    head().not('deleted_at', 'is', null)
  ]);

  return {
    all: all.count ?? 0,
    published: published.count ?? 0,
    draft: draft.count ?? 0,
    trash: trash.count ?? 0
  };
}

async function getCategoryOptions(): Promise<ArticleCategoryOption[]> {
  const supabase = await createClient();
  const { data } = await supabase.from('blog_categories').select('id, name').order('name');
  return (data ?? []).map((row) => ({ id: row.id, name: row.name }));
}

async function getMonthOptions(): Promise<Array<{ value: string; label: string }>> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('blog_translations')
    .select('published_at')
    .eq('locale', 'en')
    .not('published_at', 'is', null);

  const set = new Set<string>();
  for (const row of data ?? []) {
    if (!row.published_at) continue;
    set.add(row.published_at.slice(0, 7)); // YYYY-MM
  }
  return [...set]
    .toSorted((a, b) => b.localeCompare(a))
    .map((value) => ({ value, label: monthLabel(value) }));
}

/** Moves articles to the trash (soft delete). */
export async function trashArticles(ids: string[]): Promise<void> {
  if (!ids.length) return;
  await assertCanWrite();
  const supabase = await createClient();
  const { error } = await supabase
    .from('blog_posts')
    .update({ deleted_at: new Date().toISOString(), status: 'trash' })
    .in('id', ids);
  if (error) throw new Error(error.message);
  revalidatePath('/portal/blog');
}

/** Restores trashed articles, re-deriving status from the publish date. */
export async function restoreArticles(ids: string[]): Promise<void> {
  if (!ids.length) return;
  await assertCanWrite();
  const supabase = await createClient();

  const { data: translations } = await supabase
    .from('blog_translations')
    .select('post_id, published_at')
    .eq('locale', 'en')
    .in('post_id', ids);

  const publishedIds = new Set(
    (translations ?? []).filter((t) => t.published_at).map((t) => t.post_id)
  );

  const toPublished = ids.filter((id) => publishedIds.has(id));
  const toDraft = ids.filter((id) => !publishedIds.has(id));

  if (toPublished.length) {
    const { error } = await supabase
      .from('blog_posts')
      .update({ deleted_at: null, status: 'published' })
      .in('id', toPublished);
    if (error) throw new Error(error.message);
  }
  if (toDraft.length) {
    const { error } = await supabase
      .from('blog_posts')
      .update({ deleted_at: null, status: 'draft' })
      .in('id', toDraft);
    if (error) throw new Error(error.message);
  }

  revalidatePath('/portal/blog');
}

/** Permanently deletes articles (translations + join rows cascade). */
export async function deleteArticlesPermanently(ids: string[]): Promise<void> {
  if (!ids.length) return;
  await assertCanWrite();
  const supabase = await createClient();

  // Translations and join rows are ON DELETE CASCADE, but remove translations
  // explicitly to mirror the destinations/experiences pattern.
  await supabase.from('blog_translations').delete().in('post_id', ids);
  const { error } = await supabase.from('blog_posts').delete().in('id', ids);
  if (error) throw new Error(error.message);

  revalidatePath('/portal/blog');
}

/** Empties the trash — permanently deletes every trashed article. */
export async function emptyArticlesTrash(): Promise<void> {
  await assertCanWrite();
  const supabase = await createClient();

  const { data } = await supabase.from('blog_posts').select('id').not('deleted_at', 'is', null);
  const ids = (data ?? []).map((row) => row.id);
  await deleteArticlesPermanently(ids);
}

/** Inline Quick Edit save: title, slug, status, primary category, focus keyword. */
export async function quickEditArticle(input: ArticleQuickEditInput): Promise<void> {
  await assertCanWrite();

  const title = input.title.trim();
  const slug = input.slug.trim().toLowerCase();
  if (title.length < 2) throw new Error('Title must be at least 2 characters.');
  if (!SLUG_PATTERN.test(slug)) {
    throw new Error('Slug may only contain lowercase letters, numbers, and hyphens.');
  }

  const supabase = await createClient();
  const now = new Date().toISOString();
  const publishedAt = input.status === 'published' ? input.publishedAt.trim() || now : null;

  const { error: baseError } = await supabase
    .from('blog_posts')
    .update({
      status: input.status,
      primary_category_id: input.categoryId.trim() || null,
      published_at: publishedAt,
      updated_at: now
    })
    .eq('id', input.id);
  if (baseError) throw new Error(baseError.message);

  const { error: translationError } = await supabase
    .from('blog_translations')
    .update({
      title,
      slug,
      focus_keyword: input.focusKeyword.trim() || null,
      published_at: publishedAt,
      updated_at: now
    })
    .eq('post_id', input.id)
    .eq('locale', 'en');
  if (translationError) throw new Error(translationError.message);

  revalidatePath('/portal/blog');
}
