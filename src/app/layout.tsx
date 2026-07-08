import Providers from '@/components/layout/providers';
import { Toaster } from '@/components/ui/sonner';
import { fontVariables } from '@/components/themes/font.config';
import { DEFAULT_THEME, THEMES } from '@/components/themes/theme.config';
import { MetaThemeColorSync } from '@/components/themes/meta-theme-color-sync';
import ThemeProvider from '@/components/themes/theme-provider';
import { cn } from '@/lib/utils';
import { getPublicSiteSettings } from '@/lib/public/site-data';
import { buildFaviconMetadataIcons } from '@/lib/site-favicon';
import { normalizeSiteVerificationToken } from '@/lib/site-verification';
import { getTheme } from '@teispace/next-themes/server';
import type { Metadata, Viewport } from 'next';
import { connection } from 'next/server';
import { cookies } from 'next/headers';
import NextTopLoader from 'nextjs-toploader';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import '../styles/globals.css';

export async function generateMetadata(): Promise<Metadata> {
  await connection();
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
    icons: buildFaviconMetadataIcons(settings.faviconUrl),
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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const activeThemeValue = cookieStore.get('active_theme')?.value;
  const isValidTheme = THEMES.some((t) => t.value === activeThemeValue);
  const themeToApply = isValidTheme ? activeThemeValue! : DEFAULT_THEME;

  const initialTheme = await getTheme({ themes: ['light', 'dark', 'system'] });

  return (
    <html lang='en' suppressHydrationWarning data-theme={themeToApply}>
      <body
        className={cn(
          'bg-background overflow-x-clip overscroll-none font-sans antialiased',
          fontVariables
        )}
      >
        <NextTopLoader color='var(--primary)' showSpinner={false} />
        <NuqsAdapter>
          <ThemeProvider {...THEME_PROVIDER_PROPS} initialTheme={initialTheme ?? undefined}>
            <MetaThemeColorSync />
            <Providers activeThemeValue={themeToApply}>
              <Toaster />
              {children}
            </Providers>
          </ThemeProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
