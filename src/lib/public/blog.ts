import { createClient } from '@/lib/supabase/server';
import { localePath } from '@/lib/public/locale-path';
import { slugify } from '@/lib/utils';
import type { PublicBlogPost } from './types';

export type TocItem = { id: string; text: string; level: 2 | 3 };

export type ArticleNeighbor = { title: string; href: string } | null;

function unwrap<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

/**
 * Injects stable ids into the article's H2/H3 headings (so the table of
 * contents can link to them) and returns the heading list. Operates on our own
 * editor HTML, so a scoped regex is sufficient — no DOM parser needed.
 */
export function buildToc(html: string): { html: string; toc: TocItem[] } {
  const toc: TocItem[] = [];
  const used = new Set<string>();

  const out = html.replace(
    /<(h[23])([^>]*)>([\s\S]*?)<\/\1>/gi,
    (full, tag: string, attrs: string, inner: string) => {
      const text = inner
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .trim();
      if (!text) return full;

      let id = slugify(text) || 'section';
      let unique = id;
      let n = 2;
      while (used.has(unique)) {
        unique = `${id}-${n}`;
        n += 1;
      }
      used.add(unique);
      toc.push({ id: unique, text, level: tag.toLowerCase() === 'h2' ? 2 : 3 });

      if (/\sid=/.test(attrs)) return full;
      return `<${tag}${attrs} id="${unique}">${inner}</${tag}>`;
    }
  );

  return { html: out, toc };
}

/**
 * Previous (older) and next (newer) published articles, by publish date.
 * "Previous" reads as the older post, "Next" as the more recent one.
 */
export async function getArticleNeighbors(
  locale: string,
  postId: string,
  publishedAt: string | null
): Promise<{ previous: ArticleNeighbor; next: ArticleNeighbor }> {
  if (!publishedAt) return { previous: null, next: null };
  const supabase = await createClient();

  async function neighbor(direction: 'previous' | 'next'): Promise<ArticleNeighbor> {
    const base = supabase
      .from('blog_posts')
      .select('id, published_at')
      .eq('status', 'published')
      .is('deleted_at', null)
      .neq('id', postId);
    const filtered =
      direction === 'previous'
        ? base.lt('published_at', publishedAt)
        : base.gt('published_at', publishedAt);
    const { data: row } = await filtered
      .order('published_at', { ascending: direction === 'next' })
      .limit(1)
      .maybeSingle();
    if (!row) return null;

    const { data: translation } = await supabase
      .from('blog_translations')
      .select('title, slug')
      .eq('post_id', row.id)
      .eq('locale', locale)
      .not('published_at', 'is', null)
      .maybeSingle();
    if (!translation) return null;

    return {
      title: translation.title as string,
      href: localePath(locale, `/blog/${translation.slug}`)
    };
  }

  const [previous, next] = await Promise.all([neighbor('previous'), neighbor('next')]);
  return { previous, next };
}

/** Published articles in the same primary category, excluding the current post. */
export async function getRelatedArticles(
  locale: string,
  postId: string,
  categoryId: string | null,
  limit = 3
): Promise<PublicBlogPost[]> {
  if (!categoryId) return [];
  const supabase = await createClient();

  const { data } = await supabase
    .from('blog_translations')
    .select(
      `
      slug,
      title,
      excerpt,
      published_at,
      post:blog_posts!inner(
        id,
        status,
        deleted_at,
        primary_category_id,
        primary_category:blog_categories!blog_posts_primary_category_id_fkey(name)
      ),
      og_image:media_assets!blog_translations_og_image_id_fkey(url, alt)
    `
    )
    .eq('locale', locale)
    .eq('post.status', 'published')
    .is('post.deleted_at', null)
    .eq('post.primary_category_id', categoryId)
    .not('published_at', 'is', null)
    .order('published_at', { ascending: false })
    .limit(limit + 1);

  return (data ?? [])
    .flatMap((row) => {
      const post = unwrap(row.post);
      if (!post || post.id === postId) return [];
      return [
        {
          category: unwrap(post.primary_category)?.name ?? null,
          excerpt: row.excerpt,
          href: localePath(locale, `/blog/${row.slug}`),
          id: post.id,
          imageAlt: unwrap(row.og_image)?.alt ?? row.title,
          imageUrl: unwrap(row.og_image)?.url ?? null,
          publishedAt: row.published_at,
          slug: row.slug,
          title: row.title
        }
      ];
    })
    .slice(0, limit);
}
