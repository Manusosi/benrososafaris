import PageContainer from '@/components/layout/page-container';
import { getPortalTeam } from '@/features/portal/api/service';
import { TeamTable } from '@/features/portal/cms/settings/team-table';
import { requireSuperAdmin } from '@/lib/auth/portal';

export default async function PortalTeamPage() {
  const session = await requireSuperAdmin();
  const team = await getPortalTeam();

  return (
    <PageContainer
      pageTitle='Team & Roles'
      pageDescription='Manage who can access the portal and what they can do. Sign-in activity is shown for each member.'
    >
      <TeamTable currentUserId={session.userId} members={team} />
    </PageContainer>
  );
}
