import { notFound } from 'next/navigation';

import { PublicShell } from '@/components/public/public-shell';
import { SiteAnalytics } from '@/components/public/site-analytics';
import { isSupportedLocale, SUPPORTED_LOCALES } from '@/lib/i18n';
import { buildTravelAgencyJsonLd } from '@/lib/seo';
import { getPublicSiteSettings } from '@/lib/public/site-data';

import '../../styles/public.css';

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{
    locale: string;
  }>;
};

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) notFound();

  const settings = await getPublicSiteSettings();

  return (
    <>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildTravelAgencyJsonLd()) }}
      />
      <SiteAnalytics analytics={settings.analytics} />
      <PublicShell locale={locale}>{children}</PublicShell>
    </>
  );
}
