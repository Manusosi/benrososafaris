import PageContainer from '@/components/layout/page-container';
import { SubscribersManager } from '@/features/portal/cms/subscribers/components/subscribers-manager';
import {
  getSubscriberStats,
  listCampaigns,
  listSubscribers
} from '@/features/portal/cms/subscribers/service';
import { requirePortalSession } from '@/lib/auth/portal';

export default async function PortalSubscribersPage() {
  await requirePortalSession();
  const [subscribers, stats, campaigns] = await Promise.all([
    listSubscribers(),
    getSubscriberStats(),
    listCampaigns()
  ]);

  return (
    <PageContainer
      pageTitle='Subscribers'
      pageDescription='Manage your newsletter list and send campaigns — new destinations, articles, and offers.'
    >
      <SubscribersManager subscribers={subscribers} stats={stats} campaigns={campaigns} />
    </PageContainer>
  );
}
