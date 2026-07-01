import Link from 'next/link';

import PageContainer from '@/components/layout/page-container';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { requireSuperAdmin } from '@/lib/auth/portal';
import { createClient } from '@/lib/supabase/server';
import { PAGE_HERO_REGISTRY, emptyPageHero, normalizePageHero } from '@/lib/public/page-heroes';
import { PageHeroList, type PageHeroListItem } from '@/features/portal/cms/settings/page-hero-list';

export default async function PortalHeroSettingsPage() {
  await requireSuperAdmin();
  const supabase = await createClient();
  const { data } = await supabase
    .from('site_settings')
    .select('page_heroes')
    .eq('singleton_key', 'default')
    .maybeSingle();

  const map = ((data?.page_heroes as Record<string, unknown> | null) ?? {}) as Record<
    string,
    unknown
  >;

  const items: PageHeroListItem[] = PAGE_HERO_REGISTRY.map((entry) => {
    const configured = normalizePageHero(map[entry.key]);
    return {
      key: entry.key,
      label: entry.label,
      description: entry.description,
      path: entry.path,
      defaultImageUrl: entry.defaultImageUrl,
      hero: configured ?? emptyPageHero(),
      configured: Boolean(configured)
    };
  });

  return (
    <PageContainer
      pageTitle='Hero Sections'
      pageDescription='Configure the hero banner for each page — image slider, YouTube background, or a single image, plus overlay text and a call-to-action.'
      pageHeaderAction={
        <Button asChild variant='outline'>
          <Link href='/portal/settings'>
            <Icons.chevronLeft className='h-4 w-4' />
            Back to settings
          </Link>
        </Button>
      }
    >
      <PageHeroList items={items} />
    </PageContainer>
  );
}
