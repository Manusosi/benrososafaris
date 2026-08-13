import { FloatingWhatsApp } from '@/components/public/floating-whatsapp';
import { SiteFooter } from '@/components/public/site-footer';
import { SiteHeader } from '@/components/public/site-header';
import {
  listExperienceMenuItems,
  listPublishedExperiences
} from '@/features/experiences/public/service';
import {
  buildDestinationsMegaMenu,
  buildFooterNavigation,
  buildPublicNavigation
} from '@/lib/public/navigation';
import { getPublicDestinations, getPublicSiteSettings } from '@/lib/public/site-data';

type PublicShellProps = {
  children: React.ReactNode;
  locale: string;
};

export async function PublicShell({ children, locale }: PublicShellProps) {
  const [siteSettings, destinations, experiences, experienceMenuItems] = await Promise.all([
    getPublicSiteSettings(),
    getPublicDestinations(locale),
    listPublishedExperiences({ locale }),
    listExperienceMenuItems(locale)
  ]);

  const navItems = buildPublicNavigation(locale, destinations, experiences, experienceMenuItems);
  const footerColumns = buildFooterNavigation(locale, destinations, experiences);
  const destinationsMenu = buildDestinationsMegaMenu(locale, destinations);

  return (
    <div className='public-site min-h-screen overflow-x-clip'>
      <SiteHeader
        locale={locale}
        navItems={navItems}
        siteSettings={siteSettings}
        destinationsMenu={destinationsMenu}
      />
      <main>{children}</main>
      <SiteFooter footerColumns={footerColumns} locale={locale} siteSettings={siteSettings} />
      <FloatingWhatsApp />
    </div>
  );
}
