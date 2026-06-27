'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { Icons } from '@/components/icons';
import { EmptyState } from '@/components/public/page-shell';
import type { PublicBlogPost } from '@/lib/public/types';
import { cn } from '@/lib/utils';

type BlogListProps = {
  contactHref: string;
  posts: PublicBlogPost[];
};

const ALL_CATEGORIES = 'all';

function formatDate(iso: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function BlogList({ contactHref, posts }: BlogListProps) {
  const [activeCategory, setActiveCategory] = React.useState<string>(ALL_CATEGORIES);
  const [search, setSearch] = React.useState('');

  const categories = React.useMemo(() => {
    const set = new Set<string>();
    for (const post of posts) {
      if (post.category) set.add(post.category);
    }
    return [...set].toSorted((a, b) => a.localeCompare(b));
  }, [posts]);

  const filtered = React.useMemo(() => {
    const term = search.trim().toLowerCase();
    return posts.filter((post) => {
      if (activeCategory !== ALL_CATEGORIES && post.category !== activeCategory) return false;
      if (!term) return true;
      const haystack = `${post.title} ${post.excerpt ?? ''}`.toLowerCase();
      return haystack.includes(term);
    });
  }, [posts, activeCategory, search]);

  return (
    <section className='benroso-section bg-[var(--benroso-ivory)]'>
      <div className='benroso-container'>
        <div className='mb-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between'>
          <div className='flex flex-wrap gap-2'>
            <CategoryChip
              active={activeCategory === ALL_CATEGORIES}
              label='All'
              onClick={() => setActiveCategory(ALL_CATEGORIES)}
            />
            {categories.map((category) => (
              <CategoryChip
                active={activeCategory === category}
                key={category}
                label={category}
                onClick={() => setActiveCategory(category)}
              />
            ))}
          </div>

          <div className='relative w-full lg:max-w-xs'>
            <Icons.search className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--benroso-muted)]' />
            <input
              className='w-full rounded-[var(--benroso-radius)] border border-[var(--benroso-line)] bg-white py-2.5 pl-9 pr-3 text-sm text-[var(--benroso-ink)] outline-none focus:border-[var(--benroso-primary)]'
              onChange={(event) => setSearch(event.target.value)}
              placeholder='Search articles'
              type='search'
              value={search}
            />
          </div>
        </div>

        {filtered.length ? (
          <div className='grid gap-6 md:grid-cols-2 xl:grid-cols-3'>
            {filtered.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <EmptyState
            actionHref={contactHref}
            actionLabel='Plan Your Safari'
            message={
              posts.length
                ? 'No articles match your search. Try a different keyword or category.'
                : 'Blog articles will appear here once published through the CMS.'
            }
            title={posts.length ? 'No matching articles' : 'No blog posts yet'}
          />
        )}
      </div>
    </section>
  );
}

function CategoryChip({
  active,
  label,
  onClick
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={cn(
        'rounded-[var(--benroso-radius)] border px-4 py-2 text-xs font-bold uppercase tracking-wide transition-colors',
        active
          ? 'border-[var(--benroso-primary)] bg-[var(--benroso-primary)] text-white'
          : 'border-[var(--benroso-line)] bg-white text-[var(--benroso-ink)] hover:border-[var(--benroso-primary)]'
      )}
      onClick={onClick}
      type='button'
    >
      {label}
    </button>
  );
}

function BlogCard({ post }: { post: PublicBlogPost }) {
  const date = formatDate(post.publishedAt);

  return (
    <article className='group flex h-full flex-col overflow-hidden rounded-[var(--benroso-radius)] border border-[var(--benroso-line)] bg-white'>
      <Link
        className='relative block aspect-[16/10] overflow-hidden bg-[var(--benroso-primary)]'
        href={post.href}
      >
        {post.imageUrl ? (
          <Image
            alt={post.imageAlt || post.title}
            className='object-cover transition-transform duration-500 group-hover:scale-105'
            fill
            sizes='(max-width:768px) 100vw, 33vw'
            src={post.imageUrl}
          />
        ) : (
          <div className='absolute inset-0 bg-[var(--benroso-primary-light)]' />
        )}
        {post.category ? (
          <span className='absolute left-3 top-3 rounded-[var(--benroso-radius)] border border-[var(--benroso-line)] bg-white/95 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[var(--benroso-ink)]'>
            {post.category}
          </span>
        ) : null}
      </Link>
      <div className='flex flex-1 flex-col p-5'>
        {date ? (
          <p className='text-xs font-semibold uppercase tracking-wide text-[var(--benroso-muted)]'>
            {date}
          </p>
        ) : null}
        <h2 className='benroso-heading mt-2 font-display text-2xl leading-tight'>
          <Link className='transition-colors hover:text-[var(--benroso-primary)]' href={post.href}>
            {post.title}
          </Link>
        </h2>
        {post.excerpt ? (
          <p className='benroso-body mt-3 line-clamp-3 flex-1 text-[15px] leading-7'>
            {post.excerpt}
          </p>
        ) : null}
        <div className='mt-5 border-t border-[var(--benroso-line)] pt-4'>
          <Link
            className='inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-[var(--benroso-primary)] transition-colors hover:gap-2'
            href={post.href}
          >
            Read More
            <Icons.arrowRight className='h-3.5 w-3.5' />
          </Link>
        </div>
      </div>
    </article>
  );
}
