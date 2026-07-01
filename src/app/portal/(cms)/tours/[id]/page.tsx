import { notFound } from 'next/navigation';

import PageContainer from '@/components/layout/page-container';
import { TourWizard } from '@/features/portal/cms/tours/tour-wizard';
import { getTour, getTourRelationOptions } from '@/features/portal/cms/tours/service';
import { requirePortalSession } from '@/lib/auth/portal';

export default async function EditTourPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePortalSession();
  const { id } = await params;
  const [tour, options] = await Promise.all([getTour(id), getTourRelationOptions()]);

  if (!tour) {
    notFound();
  }

  return (
    <PageContainer
      pageTitle={`Edit: ${tour.title || 'Safari tour'}`}
      pageDescription='Update this tour, then save as a draft or publish.'
    >
      <TourWizard id={tour.id} initialValues={tour} options={options} />
    </PageContainer>
  );
}
