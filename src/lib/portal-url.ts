import type { NextRequest } from 'next/server';

export function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'https://benrososafaris.co.ke').replace(/\/$/, '');
}

export function getPortalHost() {
  return process.env.NEXT_PUBLIC_PORTAL_HOST?.split(':')[0].toLowerCase() || '';
}

export function getPortalUrl() {
  if (process.env.NEXT_PUBLIC_PORTAL_URL) {
    return process.env.NEXT_PUBLIC_PORTAL_URL.replace(/\/$/, '');
  }

  const portalHost = getPortalHost();
  return portalHost ? `https://${portalHost}` : getSiteUrl();
}

export function portalAbsoluteUrl(path = '/') {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getPortalUrl()}${normalizedPath}`;
}

export function getRequestHost(request: NextRequest) {
  const forwardedHost = request.headers.get('x-forwarded-host');
  const host = forwardedHost?.split(',')[0]?.trim() || request.headers.get('host') || '';
  return host.split(':')[0].toLowerCase();
}

export function isPortalRequestHost(host: string) {
  const portalHost = getPortalHost();
  if (!portalHost) return false;
  return host === portalHost;
}
