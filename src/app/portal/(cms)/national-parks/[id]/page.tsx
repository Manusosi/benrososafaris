import { notFound } from 'next/navigation';

import PageContainer from '@/components/layout/page-container';
import { NationalParkWizard } from '@/features/portal/cms/national-parks/national-park-wizard';
import {
  getDestinationParentOptions,
  getNationalPark,
  getNationalParkFacets
} from '@/features/portal/cms/national-parks/service';
import { requirePortalSession } from '@/lib/auth/portal';

export default async function EditNationalParkPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePortalSession();
  const { id } = await params;
  const [park, facets, destinationOptions] = await Promise.all([
    getNationalPark(id),
    getNationalParkFacets(),
    getDestinationParentOptions()
  ]);

  if (!park) {
    notFound();
  }

  return (
    <PageContainer
      pageTitle={`Edit: ${park.name || 'National park'}`}
      pageDescription='Update this national park, then save as a draft or publish.'
    >
      <NationalParkWizard
        id={park.id}
        initialValues={park}
        countryOptions={facets.countries}
        regionOptions={facets.regions}
        destinationOptions={destinationOptions}
      />
    </PageContainer>
  );
}
