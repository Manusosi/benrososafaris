import { notFound } from 'next/navigation';

import PageContainer from '@/components/layout/page-container';
import { PackageWizard } from '@/features/portal/cms/packages/package-wizard';
import { getPackage, getPackageTourOptions } from '@/features/portal/cms/packages/service';
import { requirePortalSession } from '@/lib/auth/portal';

export default async function EditPackagePage({ params }: { params: Promise<{ id: string }> }) {
  await requirePortalSession();
  const { id } = await params;
  const [item, tourOptions] = await Promise.all([getPackage(id), getPackageTourOptions()]);

  if (!item) notFound();

  return (
    <PageContainer
      pageTitle={`Edit: ${item.title || 'Safari package'}`}
      pageDescription='Update this package variant, then save as a draft or publish.'
    >
      <PackageWizard id={item.id} initialValues={item} tourOptions={tourOptions} />
    </PageContainer>
  );
}
