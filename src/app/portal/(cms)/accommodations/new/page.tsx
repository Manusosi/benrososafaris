import PageContainer from '@/components/layout/page-container';
import { requirePortalSession } from '@/lib/auth/portal';
import { AccommodationWizard } from '@/features/portal/cms/accommodations/accommodation-wizard';
import {
  getAccommodationDestinationOptions,
  getAccommodationFacets
} from '@/features/portal/cms/accommodations/service';

export default async function NewAccommodationPage() {
  await requirePortalSession();
  const [facets, destinationOptions] = await Promise.all([
    getAccommodationFacets(),
    getAccommodationDestinationOptions()
  ]);

  return (
    <PageContainer
      pageTitle='New accommodation'
      pageDescription='Create a lodge, camp, or stay page in a few guided steps.'
    >
      <AccommodationWizard
        countryOptions={facets.countries}
        destinationOptions={destinationOptions}
        propertyTypeOptions={facets.propertyTypes}
        regionOptions={facets.regions}
      />
    </PageContainer>
  );
}
