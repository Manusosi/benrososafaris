import PageContainer from '@/components/layout/page-container';
import { PortalModulePage } from '@/features/portal/components/portal-module-page';
import { getPortalContentList } from '@/features/portal/api/service';

export default async function PortalNationalParksPage() {
  const data = await getPortalContentList('national_parks');

  return (
    <PageContainer
      pageTitle='National Parks'
      pageDescription='Author park pages with wildlife, best-time-to-visit and FAQs. Each park automatically lists the safaris that visit it.'
    >
      <PortalModulePage
        data={data}
        publicPath='/en/national-parks'
        newHref='/portal/national-parks/new'
        editBasePath='/portal/national-parks'
        emptyTitle='No national parks yet'
        emptyMessage='Add your first park (e.g. Masai Mara, Amboseli) with “Add new”. Once published, it appears on the site and collects the tours routed to it.'
      />
    </PageContainer>
  );
}
