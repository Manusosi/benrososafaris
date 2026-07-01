import PageContainer from '@/components/layout/page-container';
import { requirePortalSession } from '@/lib/auth/portal';
import { createClient } from '@/lib/supabase/server';
import { roleLabel } from '@/lib/auth/roles';
import { AccountForm } from '@/features/portal/cms/settings/account-form';

export default async function PortalAccountPage() {
  const session = await requirePortalSession();
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('id', session.userId)
    .maybeSingle();

  return (
    <PageContainer
      pageTitle='My Account'
      pageDescription='Manage your personal profile and password.'
    >
      <AccountForm
        initial={{
          fullName: profile?.full_name ?? session.fullName ?? '',
          email: session.email,
          avatarUrl: profile?.avatar_url ?? '',
          role: roleLabel(session.role)
        }}
      />
    </PageContainer>
  );
}
