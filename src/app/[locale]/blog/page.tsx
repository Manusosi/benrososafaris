import { BlogList } from '@/components/public/blog/blog-list';
import { ContactHero } from '@/components/public/contact/contact-hero';
import { localePath } from '@/lib/public/locale-path';
import { getPublicBlogPosts } from '@/lib/public/site-data';

type BlogPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function BlogPage({ params }: BlogPageProps) {
  const { locale } = await params;
  const posts = await getPublicBlogPosts(locale, 48);

  return (
    <>
      <ContactHero
        breadcrumbs={[{ href: localePath(locale), label: 'Home' }, { label: 'Blog' }]}
        description='Safari travel insights, destination guides, and planning tips from the Benroso Safaris team.'
        eyebrow='Blog'
        title='Safari Travel Insights'
      />
      <BlogList contactHref={localePath(locale, '/contact')} posts={posts} />
    </>
  );
}
