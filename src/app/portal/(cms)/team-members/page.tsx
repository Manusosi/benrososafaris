import PageContainer from '@/components/layout/page-container';
import { listTeamMembers } from '@/features/portal/cms/team-members/api/service';
import { TeamMembersManager } from '@/features/portal/cms/team-members/components/team-members-manager';
import { requirePortalSession } from '@/lib/auth/portal';

export default async function PortalTeamMembersPage() {
  await requirePortalSession();
  const members = await listTeamMembers();

  return (
    <PageContainer
      pageDescription='Manage staff, safari guides, and driver-guides shown on the public About page (Our Story).'
      pageTitle='Team Members'
    >
      <TeamMembersManager initialMembers={members} />
    </PageContainer>
  );
}
