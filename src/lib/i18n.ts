import type { NextRequest } from 'next/server';

export const DEFAULT_LOCALE = process.env.NEXT_PUBLIC_DEFAULT_LOCALE || 'en';

export const SUPPORTED_LOCALES = (
  process.env.NEXT_PUBLIC_SUPPORTED_LOCALES || 'en,sw,fr,de,es,it,zh'
)
  .split(',')
  .map((locale) => locale.trim())
  .filter(Boolean);

export function isSupportedLocale(locale: string | undefined): locale is string {
  return !!locale && SUPPORTED_LOCALES.includes(locale);
}

/** Resolves locale from an explicit user choice only (cookie), else English. */
export function detectLocale(request: NextRequest) {
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  if (isSupportedLocale(cookieLocale)) return cookieLocale;

  return DEFAULT_LOCALE;
}

export function localeFromPathname(pathname: string) {
  const segment = pathname.split('/').filter(Boolean)[0];
  return isSupportedLocale(segment) ? segment : undefined;
}

export function pathnameHasLocale(pathname: string) {
  const firstSegment = pathname.split('/').filter(Boolean)[0];
  return isSupportedLocale(firstSegment);
}
