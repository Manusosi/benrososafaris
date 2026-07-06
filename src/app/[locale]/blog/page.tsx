import type { Metadata } from 'next';

import { BlogList } from '@/components/public/blog/blog-list';
import { ContactHero } from '@/components/public/contact/contact-hero';
import { localePath } from '@/lib/public/locale-path';
import { getPageHero, getPublicBlogPosts } from '@/lib/public/site-data';
import { buildListingPageMetadata } from '@/lib/seo/listing-metadata';

type BlogPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildListingPageMetadata({
    canonicalPath: `/${locale}/blog`,
    defaultDescription:
      'Safari travel insights, destination guides, and planning tips from the Benroso Safaris team.',
    defaultTitle: 'Safari Travel Insights',
    heroKey: 'blog',
    locale
  });
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { locale } = await params;
  const [posts, pageHero] = await Promise.all([
    getPublicBlogPosts(locale, 48),
    getPageHero('blog')
  ]);

  return (
    <>
      <ContactHero
        breadcrumbs={[{ href: localePath(locale), label: 'Home' }, { label: 'Blog' }]}
        description='Safari travel insights, destination guides, and planning tips from the Benroso Safaris team.'
        eyebrow='Blog'
        hero={pageHero}
        title='Safari Travel Insights'
      />
      <BlogList contactHref={localePath(locale, '/contact')} posts={posts} />
    </>
  );
}
