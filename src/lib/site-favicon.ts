import { BENROSO_FAVICON_PATH } from '@/config/benroso';

export function resolveSiteFaviconUrl(faviconUrl: string | null | undefined): string {
  return faviconUrl?.trim() || BENROSO_FAVICON_PATH;
}

export function resolveAbsoluteSiteFaviconUrl(
  faviconUrl: string | null | undefined,
  siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://benrososafaris.com'
): string {
  const resolved = resolveSiteFaviconUrl(faviconUrl);
  if (resolved.startsWith('http://') || resolved.startsWith('https://')) {
    return resolved;
  }
  return new URL(resolved, siteUrl).toString();
}

export function resolveFaviconMimeType(url: string): string {
  const normalized = url.split('?')[0]?.toLowerCase() ?? '';
  if (normalized.endsWith('.svg')) return 'image/svg+xml';
  if (normalized.endsWith('.webp')) return 'image/webp';
  if (normalized.endsWith('.jpg') || normalized.endsWith('.jpeg')) return 'image/jpeg';
  if (normalized.endsWith('.ico')) return 'image/x-icon';
  return 'image/png';
}

/**
 * Metadata icons must point at the CMS/settings favicon URL directly.
 * Do not emit Next file-convention `/favicon.ico?…` links — those can win in
 * browsers and show a stale/default icon instead of the portal branding asset.
 */
export function buildFaviconMetadataIcons(
  faviconUrl: string | null | undefined,
  options?: { cacheKey?: string | null }
) {
  const absolute = resolveAbsoluteSiteFaviconUrl(faviconUrl);
  const type = resolveFaviconMimeType(absolute);
  const cacheKey = options?.cacheKey?.trim();
  const href =
    cacheKey && cacheKey.length > 0
      ? `${absolute}${absolute.includes('?') ? '&' : '?'}v=${encodeURIComponent(cacheKey)}`
      : absolute;

  return {
    icon: [
      { url: href, type, sizes: 'any' },
      { url: '/api/site-favicon', type, sizes: 'any' }
    ],
    apple: [{ url: href, sizes: '180x180', type }],
    shortcut: href
  };
}
