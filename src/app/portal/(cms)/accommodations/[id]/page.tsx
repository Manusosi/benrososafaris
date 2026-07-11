import { notFound } from 'next/navigation';

import PageContainer from '@/components/layout/page-container';
import { requirePortalSession } from '@/lib/auth/portal';
import { AccommodationWizard } from '@/features/portal/cms/accommodations/accommodation-wizard';
import {
  getAccommodation,
  getAccommodationDestinationOptions,
  getAccommodationFacets
} from '@/features/portal/cms/accommodations/service';

export default async function EditAccommodationPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePortalSession();
  const { id } = await params;
  const [accommodation, facets, destinationOptions] = await Promise.all([
    getAccommodation(id),
    getAccommodationFacets(),
    getAccommodationDestinationOptions()
  ]);

  if (!accommodation) {
    notFound();
  }

  return (
    <PageContainer
      pageTitle={`Edit: ${accommodation.name || 'Accommodation'}`}
      pageDescription='Update this property, then save as a draft or publish.'
    >
      <AccommodationWizard
        id={accommodation.id}
        initialValues={accommodation}
        countryOptions={facets.countries}
        destinationOptions={destinationOptions}
        propertyTypeOptions={facets.propertyTypes}
        regionOptions={facets.regions}
      />
    </PageContainer>
  );
}
