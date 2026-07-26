import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Icons } from '@/components/icons';
import { ArticleShare } from '@/components/public/blog/article-share';
import { ArticleToc } from '@/components/public/blog/article-toc';
import { RelatedArticles } from '@/components/public/blog/related-articles';
import { ContactHero } from '@/components/public/contact/contact-hero';
import { FaqSection } from '@/components/public/faq-section';
import { buildToc, getArticleNeighbors, getRelatedArticles } from '@/lib/public/blog';
import { localePath } from '@/lib/public/locale-path';
import { absoluteUrl, buildAlternates, buildBlogJsonLd } from '@/lib/seo';
import { normalizeDirectAnswers } from '@/lib/seo/direct-answers';
import { createClient } from '@/lib/supabase/server';

type BlogPageProps = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

type BlogTranslation = {
  excerpt: string | null;
  locale: string;
  og_image?: { alt: string | null; url: string | null } | null;
  post: { id: string; published_at: string | null; status: string; updated_at: string | null };
  seo_description: string | null;
  seo_title: string | null;
  slug: string;
  title: string;
};

type BlogArticle = BlogTranslation & {
  content: unknown;
  direct_answers: unknown;
  faqs: unknown;
  featured_image_caption: string | null;
  post: BlogTranslation['post'] & {
    primary_category_id: string | null;
    primary_category: { name: string } | null;
  };
};

function readingMinutes(html: string): number {
  const words = html
    .replace(/<[^>]+>/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function unwrap<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function contentToHtml(content: unknown): string {
  const value = (content as { html?: string; text?: string } | null) ?? null;
  if (!value) return '';
  if (value.html) return value.html;
  if (value.text) return `<p>${value.text}</p>`;
  return '';
}

function formatDate(iso: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
}

export async function generateMetadata(props: BlogPageProps): Promise<Metadata> {
  const { locale, slug } = await props.params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from('blog_translations')
    .select(
      `
      slug,
      locale,
      title,
      excerpt,
      seo_title,
      seo_description,
      og_image:media_assets!blog_translations_og_image_id_fkey(url, alt),
      post:blog_posts!inner(id, status, published_at, updated_at)
    `
    )
    .eq('locale', locale)
    .eq('slug', slug)
    .eq('post.status', 'published')
    .not('published_at', 'is', null)
    .single<BlogTranslation>();

  if (!post) notFound();

  const canonical = absoluteUrl(`/${locale}/blog/${post.slug}`);
  const title = post.seo_title || `${post.title} | Benroso Safaris`;
  const description = post.seo_description || post.excerpt || '';

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: await buildAlternates({
        table: 'blog_translations',
        parentId: post.post.id,
        pathBuilder: (item) => `/${item.locale}/blog/${item.slug}`
      })
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'article',
      images: post.og_image?.url
        ? [{ url: post.og_image.url, alt: post.og_image.alt || title }]
        : []
    }
  };
}

export default async function BlogPostPage(props: BlogPageProps) {
  const { locale, slug } = await props.params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from('blog_translations')
    .select(
      `
      *,
      og_image:media_assets!blog_translations_og_image_id_fkey(url, alt),
      post:blog_posts!inner(
        id,
        status,
        published_at,
        updated_at,
        primary_category_id,
        primary_category:blog_categories!blog_posts_primary_category_id_fkey(name)
      )
    `
    )
    .eq('locale', locale)
    .eq('slug', slug)
    .eq('post.status', 'published')
    .not('published_at', 'is', null)
    .single<BlogArticle>();

  if (!post) notFound();

  const jsonLd = buildBlogJsonLd(
    {
      excerpt: post.excerpt,
      locale: post.locale,
      post: { published_at: post.post.published_at, updated_at: post.post.updated_at },
      slug: post.slug,
      title: post.title
    },
    `/${locale}/blog/${post.slug}`
  );
  const rawHtml = contentToHtml(post.content);
  const { html: bodyHtml, toc } = buildToc(rawHtml);
  const faqs = normalizeDirectAnswers(
    normalizeDirectAnswers(post.direct_answers).length ? post.direct_answers : post.faqs
  );
  const image = unwrap(post.og_image);
  const category = unwrap(post.post.primary_category)?.name ?? null;
  const publishedLabel = formatDate(post.post.published_at);
  const minutes = rawHtml ? readingMinutes(rawHtml) : 0;

  const [neighbors, related] = await Promise.all([
    getArticleNeighbors(locale, post.post.id, post.post.published_at),
    getRelatedArticles(locale, post.post.id, post.post.primary_category_id)
  ]);

  return (
    <>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ContactHero
        breadcrumbs={[
          { href: localePath(locale), label: 'Home' },
          { href: localePath(locale, '/blog'), label: 'Blog' },
          { label: post.title }
        ]}
        description={post.excerpt ?? undefined}
        eyebrow={category ?? 'Blog'}
        imageUrl={image?.url ?? undefined}
        title={post.title}
      />
      <main className='bg-white'>
        <div className='benroso-container max-w-6xl py-10 md:py-14'>
          {/* Top meta row: published date / read time + social share */}
          <div className='flex flex-wrap items-center justify-between gap-4 border-b border-[var(--benroso-line)] pb-5'>
            <div className='flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[var(--benroso-muted)]'>
              {publishedLabel ? (
                <span className='inline-flex items-center gap-1.5'>
                  <Icons.calendar className='size-4 text-[var(--benroso-primary)]' />
                  {publishedLabel}
                </span>
              ) : null}
              {minutes ? (
                <>
                  <span aria-hidden>·</span>
                  <span>{minutes} min read</span>
                </>
              ) : null}
              {category ? (
                <>
                  <span aria-hidden>·</span>
                  <span className='font-medium text-[var(--benroso-primary)]'>{category}</span>
                </>
              ) : null}
            </div>
            <ArticleShare title={post.title} />
          </div>

          <div className='mt-8 grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)]'>
            {/* Table of contents — left sidebar */}
            {toc.length ? (
              <aside className='hidden lg:block'>
                <div className='sticky top-[calc(var(--benroso-header-h)+1.5rem)]'>
                  <ArticleToc items={toc} />
                </div>
              </aside>
            ) : (
              <div className='hidden lg:block' />
            )}

            {/* Article body */}
            <article className='min-w-0'>
              {image?.url ? (
                <figure className='mb-8 overflow-hidden rounded-[var(--benroso-radius)] border border-[var(--benroso-line)] bg-white'>
                  <div className='relative aspect-[16/9]'>
                    <Image
                      alt={image.alt || post.title}
                      className='object-cover'
                      fill
                      priority
                      sizes='(max-width:1024px) 100vw, 760px'
                      src={image.url}
                    />
                  </div>
                  {post.featured_image_caption ? (
                    <figcaption className='px-4 py-3 text-sm text-[var(--benroso-muted)]'>
                      {post.featured_image_caption}
                    </figcaption>
                  ) : null}
                </figure>
              ) : null}

              {bodyHtml ? (
                <div
                  className='benroso-legal-prose'
                  dangerouslySetInnerHTML={{ __html: bodyHtml }}
                />
              ) : post.excerpt ? (
                <p className='text-lg leading-8 text-[var(--benroso-muted)]'>{post.excerpt}</p>
              ) : null}

              {/* Share again at the end */}
              <div className='mt-10 border-t border-[var(--benroso-line)] pt-6'>
                <ArticleShare title={post.title} />
              </div>

              {/* Previous / Next navigation */}
              {neighbors.previous || neighbors.next ? (
                <nav aria-label='More articles' className='mt-8 grid gap-4 sm:grid-cols-2'>
                  {neighbors.previous ? (
                    <Link
                      className='group flex flex-col gap-1 rounded-[var(--benroso-radius)] border border-[var(--benroso-line)] bg-white p-5 transition-colors hover:border-[var(--benroso-primary)]'
                      href={neighbors.previous.href}
                    >
                      <span className='inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-[var(--benroso-muted)]'>
                        <Icons.chevronLeft className='size-3.5' />
                        Previous
                      </span>
                      <span className='font-display text-lg leading-snug text-[var(--benroso-ink)] group-hover:text-[var(--benroso-primary)]'>
                        {neighbors.previous.title}
                      </span>
                    </Link>
                  ) : (
                    <span className='hidden sm:block' />
                  )}
                  {neighbors.next ? (
                    <Link
                      className='group flex flex-col items-end gap-1 rounded-[var(--benroso-radius)] border border-[var(--benroso-line)] bg-white p-5 text-right transition-colors hover:border-[var(--benroso-primary)]'
                      href={neighbors.next.href}
                    >
                      <span className='inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-[var(--benroso-muted)]'>
                        Next
                        <Icons.chevronRight className='size-3.5' />
                      </span>
                      <span className='font-display text-lg leading-snug text-[var(--benroso-ink)] group-hover:text-[var(--benroso-primary)]'>
                        {neighbors.next.title}
                      </span>
                    </Link>
                  ) : null}
                </nav>
              ) : null}
            </article>
          </div>

          <RelatedArticles category={category} posts={related} />
        </div>
      </main>

      {faqs.length ? <FaqSection faqs={faqs} headingId='blog-faq-heading' /> : null}
    </>
  );
}
