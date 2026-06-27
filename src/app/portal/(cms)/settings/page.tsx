import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { requireSuperAdmin } from '@/lib/auth/portal';
import { createClient } from '@/lib/supabase/server';
import { BENROSO_CONTACT_DEFAULTS, BENROSO_SOCIAL_DEFAULTS } from '@/config/benroso';
import { normalizeHeroSlides } from '@/lib/public/hero-slides';
import { HeroSettingsForm } from '@/features/portal/cms/settings/hero-settings-form';

export default async function PortalSettingsPage() {
  await requireSuperAdmin();
  const supabase = await createClient();
  const { data: settings } = await supabase
    .from('site_settings')
    .select('*')
    .eq('singleton_key', 'default')
    .maybeSingle();

  const heroSlides = normalizeHeroSlides(
    (settings as { hero_slides?: unknown } | null)?.hero_slides
  );

  const contact = settings ?? {
    company_name: BENROSO_CONTACT_DEFAULTS.companyName,
    email: BENROSO_CONTACT_DEFAULTS.email,
    phone_primary: BENROSO_CONTACT_DEFAULTS.phonePrimary,
    phone_secondary: BENROSO_CONTACT_DEFAULTS.phoneSecondary,
    address_short: BENROSO_CONTACT_DEFAULTS.addressShort
  };

  return (
    <PageContainer pageTitle='Site Settings'>
      <Card className='mb-4'>
        <CardHeader>
          <CardTitle className='text-base'>Homepage hero</CardTitle>
        </CardHeader>
        <CardContent>
          <HeroSettingsForm initialSlides={heroSlides} />
        </CardContent>
      </Card>
      <div className='grid gap-4 lg:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Company contact</CardTitle>
          </CardHeader>
          <CardContent className='space-y-3 text-sm'>
            <p>
              <span className='text-muted-foreground'>Company:</span> {contact.company_name}
            </p>
            <p>
              <span className='text-muted-foreground'>Email:</span> {contact.email}
            </p>
            <p>
              <span className='text-muted-foreground'>Phone:</span> {contact.phone_primary}
            </p>
            <p>
              <span className='text-muted-foreground'>Address:</span> {contact.address_short}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Social profiles</CardTitle>
          </CardHeader>
          <CardContent className='space-y-2 text-sm'>
            {Object.entries(BENROSO_SOCIAL_DEFAULTS).map(([network, url]) => (
              <p key={network}>
                <span className='text-muted-foreground capitalize'>{network}:</span>{' '}
                <a
                  className='text-primary hover:underline'
                  href={url}
                  rel='noreferrer'
                  target='_blank'
                >
                  {url}
                </a>
              </p>
            ))}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
