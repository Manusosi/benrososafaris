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

function ArticleCard({ article }: { article: HomeArticle }) {
  return (
    <article
      className='group flex h-full flex-col overflow-hidden rounded-[var(--benroso-radius)] border border-[var(--benroso-line)] bg-white transition-shadow duration-300 hover:shadow-lg'
      data-reveal-item
    >
      <Link className='relative block aspect-[16/10] overflow-hidden' href={article.href}>
        <Image
          alt={article.imageAlt}
          className='object-cover transition-transform duration-500 group-hover:scale-105'
          fill
          sizes='(max-width:768px) 100vw, 33vw'
          src={article.imageUrl}
        />
      </Link>
      <div className='flex flex-1 flex-col p-6'>
        <div className='flex items-center gap-2.5 text-xs uppercase tracking-wide'>
          <span className='font-bold text-[var(--benroso-lime)]'>{article.category}</span>
          <span className='h-1 w-1 rounded-full bg-[var(--benroso-line)]' />
          <span className='text-[var(--benroso-muted)]'>{article.date}</span>
        </div>
        <h3 className='benroso-heading mt-3 font-display text-xl leading-snug'>
          <Link
            className='transition-colors hover:text-[var(--benroso-primary)]'
            href={article.href}
          >
            {article.title}
          </Link>
        </h3>
        {article.excerpt ? (
          <p className='benroso-body mt-3 line-clamp-3 flex-1 text-sm leading-7'>
            {article.excerpt}
          </p>
        ) : null}
        <Link
          className='mt-5 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-[var(--benroso-primary)]'
          href={article.href}
        >
          Read Article
          <Icons.arrowRight className='h-4 w-4 transition-transform duration-300 group-hover:translate-x-1' />
        </Link>
      </div>
    </article>
  );
}

export function HomeArticles({ locale, posts = [] }: { locale: string; posts?: PublicBlogPost[] }) {
  const articles = toArticles(posts, locale).slice(0, 3);
  if (!articles.length) return null;

  return (
    <section className='benroso-section relative overflow-hidden bg-[var(--benroso-ivory)]'>
      <ContourBackground opacity={0.06} />
      <div className='benroso-container relative'>
        <SectionHeader
          description='Safari stories, destination guides, and practical travel tips from our team in the field.'
          eyebrow='Safari Journal'
          title='Latest Articles & Insights'
        />

        <ScrollReveal className='mt-12 grid gap-6 md:grid-cols-3 md:gap-8' stagger>
          {articles.map((article) => (
            <ArticleCard article={article} key={article.id} />
          ))}
        </ScrollReveal>

        <div className='mt-12 flex justify-center'>
          <BenrosoButton href={localePath(locale, '/blog')} variant='accent-outline'>
            View All Articles
            <Icons.arrowRight className='h-4 w-4' />
          </BenrosoButton>
        </div>
      </div>
    </section>
  );
}
