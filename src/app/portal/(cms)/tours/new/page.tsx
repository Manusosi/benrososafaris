import PageContainer from '@/components/layout/page-container';
import { TourWizard } from '@/features/portal/cms/tours/tour-wizard';
import { getTourRelationOptions } from '@/features/portal/cms/tours/service';
import { requirePortalSession } from '@/lib/auth/portal';

export default async function NewTourPage() {
  await requirePortalSession();
  const options = await getTourRelationOptions();

  return (
    <PageContainer
      pageTitle='New safari tour'
      pageDescription='Build a safari itinerary and link its national parks, lodges, and fleet.'
    >
      <TourWizard options={options} />
    </PageContainer>
  );
}
