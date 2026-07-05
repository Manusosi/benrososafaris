import { FleetGalleryManager } from '@/features/portal/cms/fleet/fleet-gallery-manager';
import { getFleetGalleryMediaIds } from '@/features/portal/cms/fleet/service';
import PageContainer from '@/components/layout/page-container';

export default async function PortalFleetPage() {
  const mediaIds = await getFleetGalleryMediaIds();

  return (
    <PageContainer
      pageDescription='Upload and order safari vehicle photos for the public Our Fleet page.'
      pageTitle='Our Fleet'
    >
      <FleetGalleryManager initialMediaIds={mediaIds} />
    </PageContainer>
  );
}
