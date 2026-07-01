import PageContainer from '@/components/layout/page-container';
import { NationalParkWizard } from '@/features/portal/cms/national-parks/national-park-wizard';
import {
  getDestinationParentOptions,
  getNationalParkFacets
} from '@/features/portal/cms/national-parks/service';
import { requirePortalSession } from '@/lib/auth/portal';

export default async function NewNationalParkPage() {
  await requirePortalSession();
  const [facets, destinationOptions] = await Promise.all([
    getNationalParkFacets(),
    getDestinationParentOptions()
  ]);

  return (
    <PageContainer
      pageTitle='New national park'
      pageDescription='Create a national park page in a few guided steps.'
    >
      <NationalParkWizard
        countryOptions={facets.countries}
        regionOptions={facets.regions}
        destinationOptions={destinationOptions}
      />
    </PageContainer>
  );
}
