import { BENROSO_FAVICON_PATH } from '@/config/benroso';

export function resolveSiteFaviconUrl(faviconUrl: string | null | undefined): string {
  return faviconUrl?.trim() || BENROSO_FAVICON_PATH;
}

export function resolveFaviconMimeType(url: string): string {
  const normalized = url.split('?')[0]?.toLowerCase() ?? '';
  if (normalized.endsWith('.svg')) return 'image/svg+xml';
  if (normalized.endsWith('.webp')) return 'image/webp';
  if (normalized.endsWith('.jpg') || normalized.endsWith('.jpeg')) return 'image/jpeg';
  if (normalized.endsWith('.ico')) return 'image/x-icon';
  return 'image/png';
}

export function buildFaviconMetadataIcons(faviconUrl: string | null | undefined) {
  const favicon = resolveSiteFaviconUrl(faviconUrl);
  const type = resolveFaviconMimeType(favicon);

  return {
    icon: [{ url: favicon, type, sizes: 'any' }],
    apple: [{ url: favicon, sizes: '180x180', type }],
    shortcut: favicon
  };
}
