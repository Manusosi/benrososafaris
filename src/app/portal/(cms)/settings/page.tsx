import Link from 'next/link';

import PageContainer from '@/components/layout/page-container';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { requireSuperAdmin } from '@/lib/auth/portal';
import { createClient } from '@/lib/supabase/server';
import type { Tables } from '@/types/database.types';
import { SiteSettingsForm } from '@/features/portal/cms/settings/site-settings-form';
import { settingsFromRow } from '@/features/portal/cms/settings/schema';

export default async function PortalSettingsPage() {
  await requireSuperAdmin();
  const supabase = await createClient();
  const { data: settings } = await supabase
    .from('site_settings')
    .select('*')
    .eq('singleton_key', 'default')
    .maybeSingle();

  const initial = settingsFromRow((settings as Tables<'site_settings'> | null) ?? null);

  return (
    <PageContainer
      pageTitle='Site Settings'
      pageDescription='Branding, contact details, social links, notifications, and SEO for the public website.'
      pageHeaderAction={
        <Button asChild variant='outline'>
          <Link href='/portal/settings/heroes'>
            <Icons.media className='h-4 w-4' />
            Hero Sections
          </Link>
        </Button>
      }
    >
      <SiteSettingsForm initial={initial} />
    </PageContainer>
  );
}
