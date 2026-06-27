import PageContainer from '@/components/layout/page-container';
import { ArticleEditor } from '@/features/portal/cms/blog/editor/article-editor';
import { getArticleTaxonomies } from '@/features/portal/cms/blog/editor/service';
import { requirePortalSession } from '@/lib/auth/portal';

export default async function NewArticlePage() {
  await requirePortalSession();
  const taxonomies = await getArticleTaxonomies();

  return (
    <PageContainer
      pageTitle='Add new article'
      pageDescription='Write the article, set its SEO, then save as a draft or publish.'
    >
      <ArticleEditor categories={taxonomies.categories} tags={taxonomies.tags} />
    </PageContainer>
  );
}
