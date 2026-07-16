import Providers from '@/components/layout/providers';
import { Toaster } from '@/components/ui/sonner';
import { fontVariables } from '@/components/themes/font.config';
import { DEFAULT_THEME } from '@/components/themes/theme.config';
import { MetaThemeColorSync } from '@/components/themes/meta-theme-color-sync';
import { ThemeCookieScript } from '@/components/themes/theme-cookie-script';
import ThemeProvider from '@/components/themes/theme-provider';
import { cn } from '@/lib/utils';
import { getPublicSiteSettings } from '@/lib/public/site-data';
import { buildFaviconMetadataIcons } from '@/lib/site-favicon';
import { normalizeSiteVerificationToken } from '@/lib/site-verification';
import type { Metadata, Viewport } from 'next';
import NextTopLoader from 'nextjs-toploader';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import '../styles/globals.css';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSiteSettings();
  const { analytics } = settings;
  const googleVerification = normalizeSiteVerificationToken(analytics.googleSiteVerification);
  const bingVerification = normalizeSiteVerificationToken(analytics.bingSiteVerification);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://benrososafaris.com';

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: 'Benroso Safaris | Kenya & Tanzania Safari Holidays',
      template: '%s | Benroso Safaris'
    },
    description:
      'Premium Kenya and Tanzania safari holidays with Benroso Safaris — tailor-made itineraries, expert guides, and trusted local support.',
    icons: buildFaviconMetadataIcons(settings.faviconUrl, {
      cacheKey: settings.faviconVersion
    }),
    openGraph: settings.ogImage ? { images: [settings.ogImage] } : undefined,
    verification:
      googleVerification || bingVerification
        ? {
            google: googleVerification ?? undefined,
            other: bingVerification ? { 'msvalidate.01': bingVerification } : undefined
          }
        : undefined
  };
}

export async function generateViewport(): Promise<Viewport> {
  const settings = await getPublicSiteSettings();
  return {
    themeColor: settings.themeColor ?? '#3C5142'
  };
}

const THEME_PROVIDER_PROPS = {
  attribute: 'class' as const,
  defaultTheme: 'system',
  enableSystem: true,
  disableTransitionOnChange: true,
  enableColorScheme: true,
  storage: 'local' as const
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' suppressHydrationWarning data-theme={DEFAULT_THEME}>
      <body
        className={cn(
          'bg-background overflow-x-clip overscroll-none font-sans antialiased',
          fontVariables
        )}
      >
        <ThemeCookieScript />
        <NextTopLoader color='var(--primary)' showSpinner={false} />
        <NuqsAdapter>
          <ThemeProvider {...THEME_PROVIDER_PROPS}>
            <MetaThemeColorSync />
            <Providers activeThemeValue={DEFAULT_THEME}>
              <Toaster />
              {children}
            </Providers>
          </ThemeProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
