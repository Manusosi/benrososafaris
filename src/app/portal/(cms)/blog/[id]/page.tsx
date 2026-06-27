import { notFound } from 'next/navigation';

import PageContainer from '@/components/layout/page-container';
import { ArticleEditor } from '@/features/portal/cms/blog/editor/article-editor';
import { getArticle, getArticleTaxonomies } from '@/features/portal/cms/blog/editor/service';
import { requirePortalSession } from '@/lib/auth/portal';

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  await requirePortalSession();
  const { id } = await params;
  const [article, taxonomies] = await Promise.all([getArticle(id), getArticleTaxonomies()]);

  if (!article) {
    notFound();
  }

  return (
    <PageContainer
      pageTitle={`Edit: ${article.title || 'Article'}`}
      pageDescription='Update this article, then save as a draft or publish.'
    >
      <ArticleEditor
        id={article.id}
        initialValues={article}
        initialStatus={article.status}
        categories={taxonomies.categories}
        tags={taxonomies.tags}
      />
    </PageContainer>
  );
}
