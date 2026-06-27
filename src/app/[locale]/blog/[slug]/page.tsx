import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';

import { ContactHero } from '@/components/public/contact/contact-hero';
import { FaqSection } from '@/components/public/faq-section';
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
    primary_category: { name: string } | null;
  };
};

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
        primary_category:blog_categories!blog_posts_primary_category_id_fkey(name)
      )
    `
    )
    .eq('locale', locale)
    .eq('slug', slug)
    .eq('post.status', 'published')
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
  const bodyHtml = contentToHtml(post.content);
  const faqs = normalizeDirectAnswers(
    normalizeDirectAnswers(post.direct_answers).length ? post.direct_answers : post.faqs
  );
  const image = unwrap(post.og_image);
  const category = unwrap(post.post.primary_category)?.name ?? null;
  const publishedLabel = formatDate(post.post.published_at);

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
        title={post.title}
      />
      <main className='benroso-section bg-[var(--benroso-ivory)]'>
        <article className='benroso-container max-w-4xl'>
          {publishedLabel ? (
            <p className='text-xs font-semibold uppercase tracking-wide text-[var(--benroso-muted)]'>
              Published {publishedLabel}
            </p>
          ) : null}

          {image?.url ? (
            <figure className='mt-6 overflow-hidden rounded-[var(--benroso-radius)] border border-[var(--benroso-line)] bg-white'>
              <div className='relative aspect-[16/9]'>
                <Image
                  alt={image.alt || post.title}
                  className='object-cover'
                  fill
                  sizes='(max-width:1024px) 100vw, 900px'
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
              className='benroso-legal-prose mt-8'
              dangerouslySetInnerHTML={{ __html: bodyHtml }}
            />
          ) : post.excerpt ? (
            <p className='mt-8 text-lg leading-8 text-[var(--benroso-muted)]'>{post.excerpt}</p>
          ) : null}
        </article>
      </main>

      <FaqSection faqs={faqs} headingId='blog-faq-heading' />
    </>
  );
}
