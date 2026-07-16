import { NextResponse } from 'next/server';

import { getPublicSiteSettings } from '@/lib/public/site-data';
import { resolveAbsoluteSiteFaviconUrl, resolveFaviconMimeType } from '@/lib/site-favicon';

export const revalidate = 300;

/**
 * Canonical /favicon.ico handler (via next.config rewrite).
 * Proxies the CMS settings favicon so browsers that only request /favicon.ico
 * still get the portal branding asset — not a Next/Vercel default.
 */
export async function GET() {
  const settings = await getPublicSiteSettings();
  const absoluteUrl = resolveAbsoluteSiteFaviconUrl(settings.faviconUrl);

  const upstream = await fetch(absoluteUrl, {
    next: { revalidate: 300, tags: ['site-settings'] }
  });

  if (!upstream.ok) {
    return new NextResponse('Favicon not found', { status: 404 });
  }

  const bytes = await upstream.arrayBuffer();
  const contentType = upstream.headers.get('content-type') || resolveFaviconMimeType(absoluteUrl);

  return new NextResponse(bytes, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=300, s-maxage=86400, stale-while-revalidate=604800'
    }
  });
}
