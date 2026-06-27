import Image from 'next/image';
import Link from 'next/link';

import { Icons } from '@/components/icons';
import { ContourBackground } from '@/components/public/contour-background';
import { BenrosoButton } from '@/components/public/ui/benroso-button';
import { ScrollReveal } from '@/components/public/ui/scroll-reveal';
import { SectionHeader } from '@/components/public/ui/section-header';
import { HOME_ARTICLES_FALLBACK, type HomeArticle } from '@/lib/public/home-content';
import { localePath } from '@/lib/public/locale-path';
import type { PublicBlogPost } from '@/lib/public/types';

function formatDate(value: string | null) {
  if (!value) return 'Guide';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Guide';
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date);
}

function toArticles(posts: PublicBlogPost[], locale: string): HomeArticle[] {
  if (!posts.length) {
    return HOME_ARTICLES_FALLBACK.map((article) => ({
      ...article,
      href: localePath(locale, article.href)
    }));
  }

  return posts.map((post, index) => ({
    id: post.id,
    category: 'Safari Journal',
    title: post.title,
    excerpt: post.excerpt ?? '',
    author: 'Benroso Safaris',
    date: formatDate(post.publishedAt),
    imageUrl:
      post.imageUrl ?? HOME_ARTICLES_FALLBACK[index % HOME_ARTICLES_FALLBACK.length].imageUrl,
    imageAlt: post.imageAlt ?? post.title,
    href: post.href
  }));
}

export function HomeArticles({ locale, posts = [] }: { locale: string; posts?: PublicBlogPost[] }) {
  const articles = toArticles(posts, locale);
  if (!articles.length) return null;

  const [featured, ...rest] = articles;
  const sideArticles = rest.slice(0, 3);

  return (
    <section className='benroso-section relative overflow-hidden bg-white'>
      <ContourBackground opacity={0.07} />
      <div className='benroso-container relative'>
        <div className='flex flex-col gap-4 md:flex-row md:items-end md:justify-between'>
          <SectionHeader
            align='left'
            description='Safari stories, destination guides, and practical travel tips from our team in the field.'
            title='Latest Articles & Insights'
          />
          <div className='shrink-0'>
            <BenrosoButton href={localePath(locale, '/blog')} variant='accent-outline'>
              View All Articles
              <Icons.arrowRight className='h-4 w-4' />
            </BenrosoButton>
          </div>
        </div>

        <div className='mt-12 grid gap-6 lg:grid-cols-[1.4fr_1fr]'>
          {/* Featured */}
          <ScrollReveal
            className='group flex flex-col overflow-hidden rounded-[var(--benroso-radius)] border border-[var(--benroso-line)] bg-white'
            from='left'
          >
            <Link className='relative block aspect-[16/10] overflow-hidden' href={featured.href}>
              <Image
                alt={featured.imageAlt}
                className='object-cover transition-transform duration-500 group-hover:scale-105'
                fill
                sizes='(max-width:1024px) 100vw, 55vw'
                src={featured.imageUrl}
              />
              <span className='absolute left-4 top-4 rounded-[var(--benroso-radius)] bg-[var(--benroso-gold)] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[var(--benroso-primary-dark)]'>
                {featured.category}
              </span>
            </Link>
            <div className='flex flex-1 flex-col p-6'>
              <p className='text-xs uppercase tracking-wide text-[var(--benroso-muted)]'>
                {featured.author}
              </p>
              <h3 className='benroso-heading mt-2 font-display text-2xl leading-tight md:text-3xl'>
                <Link
                  className='transition-colors hover:text-[var(--benroso-primary)]'
                  href={featured.href}
                >
                  {featured.title}
                </Link>
              </h3>
              {featured.excerpt ? (
                <p className='benroso-body mt-3 line-clamp-3 flex-1 text-sm leading-7'>
                  {featured.excerpt}
                </p>
              ) : null}
              <p className='mt-5 text-xs text-[var(--benroso-muted)]'>{featured.date}</p>
            </div>
          </ScrollReveal>

          {/* Side list */}
          <ScrollReveal className='flex flex-col gap-4' from='right' stagger>
            {sideArticles.map((article) => (
              <Link
                className='group flex gap-4 rounded-[var(--benroso-radius)] border border-[var(--benroso-line)] bg-white p-3 transition-colors hover:border-[var(--benroso-primary)]'
                data-reveal-item
                href={article.href}
                key={article.id}
              >
                <span className='relative block aspect-square w-24 shrink-0 overflow-hidden rounded-[var(--benroso-radius)]'>
                  <Image
                    alt={article.imageAlt}
                    className='object-cover transition-transform duration-500 group-hover:scale-105'
                    fill
                    sizes='96px'
                    src={article.imageUrl}
                  />
                </span>
                <span className='flex min-w-0 flex-col justify-center'>
                  <span className='text-[11px] font-bold uppercase tracking-wide text-[var(--benroso-gold)]'>
                    {article.category}
                  </span>
                  <span className='benroso-heading mt-1 line-clamp-2 font-display text-base leading-tight'>
                    {article.title}
                  </span>
                  <span className='mt-1.5 text-xs text-[var(--benroso-muted)]'>{article.date}</span>
                </span>
              </Link>
            ))}
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
